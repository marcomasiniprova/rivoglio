import { NextResponse } from "next/server";
import { CORS } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { compagniaPerVettore } from "@/lib/lettera/compagnie";
import {
  ALLEGATI,
  generaReclamo,
  generaSegnalazioneEnte,
  generaSollecito,
} from "@/lib/lettera/genera";
import { conciliazionePerPartenza, prontoPerConciliazione } from "@/lib/lettera/conciliazione";
import { METEO_ATTIVO, fraseMeteo, meteoStorico } from "@/lib/meteo/openmeteo";
import type { Passeggero, TipoPratica } from "@/lib/pratiche/pratiche";
import {
  GIORNI_PRIMA_DELL_ENTE,
  GIORNI_PRIMA_DEL_SOLLECITO,
  prontoPerSollecito,
  schedaRifiuto,
  type MotivoRifiuto,
} from "@/lib/pratiche/rifiuto";
import type { FattoVolo, Verdetto } from "@/lib/regole/eu261";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { aeroporto } from "@/lib/voli/distanza";

/**
 * GET /api/pratiche/{id}/scheda
 *
 * TUTTA la pratica in una chiamata, per l'app: stato, tratta, cronologia
 * e (quando spetta) la lettera pronta. È il pezzo che rende l'app un
 * posto dove la pratica SI SEGUE, invece di un bottone che apre il sito.
 *
 * Chi entra: SOLO il proprietario. L'app manda il token della sua
 * sessione (Authorization: Bearer), il sito i cookie: li accetta
 * entrambi lib/api/utente.ts, e la parola finale è di Supabase.
 *
 * Perché un'API e non letture dirette dall'app: la tabella `voli` non ha
 * Row Level Security (ci accede solo il server) e la lettera nasce dal
 * generatore deterministico del server. Il telefono non deve sapere
 * niente di tutto questo: chiede la scheda, la mostra.
 */
export const dynamic = "force-dynamic";

type RigaPratica = {
  id: string;
  utente_id: string | null;
  volo_id: string | null;
  verifica_id: string | null;
  stato: string;
  tipo: TipoPratica;
  passeggeri: Passeggero[] | null;
  importo_fascia: number | null;
  garanzia_fino_al: string | null;
  inviata_il: string | null;
  creata_il: string;
  /** Il motivo del no della compagnia, se il cliente l'ha dichiarato. */
  rifiuto_motivo: string | null;
};

type RigaVolo = {
  volo_iata: string;
  data_locale: string;
  vettore_operativo: string | null;
  vettore_marketing: string | null;
  partenza_iata: string | null;
  partenza_citta: string | null;
  arrivo_citta: string | null;
  arrivo_previsto_utc: string | null;
  arrivo_effettivo_utc: string | null;
  stato: FattoVolo["stato"];
  km_ortodromica: number | null;
  fonte: string;
  fonti_discordanti: boolean;
  payload_grezzo: unknown;
};

type RigaVerifica = {
  esito: "idoneo" | "incerto" | "non_idoneo";
  importo: number | null;
  ritardo_minuti: number | null;
  versione_regole: string;
};

/** L'aeroporto di arrivo, letto dal payload archiviato (AeroDataBox). */
function iataArrivoDaPayload(payload: unknown): string | null {
  const iata = (
    payload as { arrival?: { airport?: { iata?: string | null } | null } | null } | null
  )?.arrival?.airport?.iata;
  return typeof iata === "string" && iata.trim().length === 3 ? iata.trim().toUpperCase() : null;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request, contesto: { params: Promise<{ id: string }> }) {
  const { id } = await contesto.params;

  const utente = await utenteDaRichiesta(req);
  if (!utente) {
    return NextResponse.json(
      { ok: false, errore: "Devi essere collegato." },
      { status: 401, headers: CORS },
    );
  }
  if (!SERVIZIO_ATTIVO) {
    return NextResponse.json(
      { ok: false, errore: "Il server non è configurato." },
      { status: 503, headers: CORS },
    );
  }

  const db = supabaseServizio();
  const { data: pratica } = (await db
    .from("pratiche")
    .select(
      "id, utente_id, volo_id, verifica_id, stato, tipo, passeggeri, importo_fascia, garanzia_fino_al, inviata_il, creata_il, rifiuto_motivo",
    )
    .eq("id", id)
    .maybeSingle()) as { data: RigaPratica | null };

  // Non tua = inesistente: non si conferma nemmeno che l'id esista.
  if (!pratica || !pratica.utente_id || pratica.utente_id !== utente.id) {
    return NextResponse.json(
      { ok: false, errore: "Pratica non trovata." },
      { status: 404, headers: CORS },
    );
  }

  const { data: volo } = pratica.volo_id
    ? ((await db
        .from("voli")
        .select(
          "volo_iata, data_locale, vettore_operativo, vettore_marketing, partenza_iata, partenza_citta, arrivo_citta, arrivo_previsto_utc, arrivo_effettivo_utc, stato, km_ortodromica, fonte, fonti_discordanti, payload_grezzo",
        )
        .eq("id", pratica.volo_id)
        .maybeSingle()) as { data: RigaVolo | null })
    : { data: null };

  const { data: eventi } = await db
    .from("pratiche_eventi")
    .select("tipo, nota, creato_il")
    .eq("pratica_id", pratica.id)
    .order("creato_il", { ascending: true });

  /* ── La lettera, solo quando spetta ─────────────────────────────────
     Stessa catena della pagina /pratica/[id]/lettera: pratica pagata,
     volo archiviato, verdetto idoneo. Se manca un pezzo la scheda esce
     comunque, senza lettera: l'app mostra il perché. */
  let lettera: {
    oggetto: string;
    corpo: string;
    allegati: readonly string[];
    compagnia: {
      nome: string;
      canale: string;
      url: string;
      email: string | null;
      indirizzoPostale: string | null;
    } | null;
  } | null = null;

  /* ── I fogli DOPO il reclamo (giro #49): la pratica ha quattro colpi
     e l'app li mostra tutti, calcolati dallo stesso codice del sito.
     Il motore è uno: se cambia una replica, cambia per tutti e due. */
  type Foglio = { oggetto: string; corpo: string } | null;
  let sollecito: Foglio = null;
  let segnalazione: Foglio = null;
  let conciliazione: ReturnType<typeof conciliazionePerPartenza> | null = null;
  let giorniDallInvio: number | null = null;

  if (pratica.stato !== "creata" && volo && pratica.verifica_id) {
    const { data: verifica } = (await db
      .from("verifiche")
      .select("esito, importo, ritardo_minuti, versione_regole")
      .eq("id", pratica.verifica_id)
      .maybeSingle()) as { data: RigaVerifica | null };

    const importo =
      verifica && ([250, 300, 400, 600] as const).find((i) => i === verifica.importo);

    if (verifica && verifica.esito === "idoneo" && importo && verifica.ritardo_minuti !== null) {
      const fatto: FattoVolo = {
        voloIata: volo.volo_iata,
        dataLocale: volo.data_locale,
        vettoreOperativo: volo.vettore_operativo ?? "",
        vettoreMarketing: volo.vettore_marketing,
        arrivoPrevistoUtc: volo.arrivo_previsto_utc,
        arrivoEffettivoUtc: volo.arrivo_effettivo_utc,
        stato: volo.stato,
        kmOrtodromica: volo.km_ortodromica,
        fontiDiscordanti: volo.fonti_discordanti,
        fonte: volo.fonte,
      };
      const verdetto: Verdetto = {
        esito: "idoneo",
        importo,
        ritardoMinuti: verifica.ritardo_minuti,
        motivo: "",
        versioneRegole: verifica.versione_regole,
      };

      let meteo: string | null = null;
      if (METEO_ATTIVO && volo.arrivo_effettivo_utc) {
        const scalo = aeroporto(iataArrivoDaPayload(volo.payload_grezzo));
        if (scalo) {
          meteo = fraseMeteo(
            await meteoStorico(
              scalo.lat,
              scalo.lon,
              volo.arrivo_effettivo_utc.slice(0, 10),
              volo.arrivo_effettivo_utc,
            ),
          );
        }
      }

      const testo = generaReclamo(
        { passeggeri: pratica.passeggeri ?? [], tipo: pratica.tipo },
        fatto,
        verdetto,
        { meteo },
      );

      if (testo) {
        const compagnia =
          compagniaPerVettore(volo.vettore_operativo) ?? compagniaPerVettore(volo.volo_iata);
        lettera = {
          oggetto: testo.oggetto,
          corpo: testo.corpo,
          allegati: ALLEGATI,
          compagnia: compagnia
            ? {
                nome: compagnia.nome,
                canale: compagnia.canale,
                url: compagnia.url,
                email: compagnia.email,
                indirizzoPostale: compagnia.indirizzoPostale,
              }
            : null,
        };
      }

      /* I colpi successivi esistono solo DOPO l'invio del reclamo, e coi
         tempi della pagina del sito: il sollecito al giorno 42 (o subito
         se il no è dichiarato), l'ente due settimane dopo, la
         conciliazione a 30 giorni (o subito col no). */
      if (pratica.inviata_il) {
        giorniDallInvio = Math.floor(
          (Date.now() - new Date(pratica.inviata_il).getTime()) / 86_400_000,
        );
        const motivo = schedaRifiuto(pratica.rifiuto_motivo)
          ? (pratica.rifiuto_motivo as MotivoRifiuto)
          : null;
        const rifiutoDichiarato = Boolean(motivo && motivo !== "silenzio");
        const giornoInvio = pratica.inviata_il.slice(0, 10);
        const passeggeriPratica = {
          passeggeri: pratica.passeggeri ?? [],
          tipo: pratica.tipo,
        };

        if (prontoPerSollecito(giorniDallInvio, motivo)) {
          sollecito = generaSollecito(passeggeriPratica, fatto, verdetto, giornoInvio, motivo);
        }
        if (sollecito && giorniDallInvio >= GIORNI_PRIMA_DEL_SOLLECITO + GIORNI_PRIMA_DELL_ENTE) {
          segnalazione = generaSegnalazioneEnte(
            passeggeriPratica,
            fatto,
            verdetto,
            giornoInvio,
            null,
            motivo,
          );
        }
        if (prontoPerConciliazione(giorniDallInvio, rifiutoDichiarato)) {
          conciliazione = conciliazionePerPartenza(volo.partenza_iata);
        }
      }
    }
  }

  return NextResponse.json(
    {
      ok: true,
      pratica: {
        id: pratica.id,
        stato: pratica.stato,
        tipo: pratica.tipo,
        importo: pratica.importo_fascia,
        passeggeri: (pratica.passeggeri ?? []).length,
        garanziaFinoAl: pratica.garanzia_fino_al,
        inviataIl: pratica.inviata_il,
        creataIl: pratica.creata_il,
        volo: volo
          ? {
              iata: volo.volo_iata,
              data: volo.data_locale,
              da: volo.partenza_citta,
              a: volo.arrivo_citta,
            }
          : null,
      },
      eventi: (eventi ?? []) as { tipo: string; nota: string | null; creato_il: string }[],
      lettera,
      /* I colpi dopo il reclamo: null finché non è il loro momento. */
      sollecito,
      segnalazione,
      conciliazione,
      giorniDallInvio,
      rifiutoMotivo: pratica.rifiuto_motivo,
    },
    { headers: CORS },
  );
}
