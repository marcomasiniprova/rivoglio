/**
 * L'orchestratore del check (SPEC §4, strati 1-2-3 in fila):
 *
 *   input → normalizza → cache `voli` → fornitore → (confronto seconda
 *   fonte) → upsert cache → valuta() → riga in `verifiche` → esito.
 *
 * Promesse mantenute qui dentro:
 * - CACHE per volo+data: un volo con 180 passeggeri = 1 chiamata API.
 * - payload_grezzo archiviato a ogni risposta del fornitore: è la prova
 *   se una compagnia contesta fra 6 mesi. Un fatto DEFINITIVO in cache
 *   non viene mai più riscritto (il check riparte dalla cache e basta);
 *   solo uno stato "sconosciuto" può essere aggiornato da un dato migliore.
 * - doppia fonte SOLO se entrambe le chiavi esistono: scarto > 15 minuti
 *   sull'arrivo effettivo → fonti_discordanti → il motore dirà incerto.
 * - shadow mode (SHADOW_MODE=1): il verdetto nasce 'in_attesa' e un umano
 *   lo conferma da /admin prima che si possa vendere.
 * - MAI un'eccezione verso l'alto: ogni guasto di rete o database diventa
 *   un esito incerto o un campo nullo, non un 500 in faccia all'utente.
 */

import { valuta, type FattoVolo, type Verdetto } from "@/lib/regole/eu261";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { aerodatabox } from "./fornitori/aerodatabox";
import { aviationstack } from "./fornitori/aviationstack";
import { demo } from "./fornitori/demo";
import { scioperoInData } from "@/lib/scioperi/scioperi";
import { normalizzaData, normalizzaVolo } from "./normalizza";
import type { FattoConPayload, FornitoreVoli } from "./tipi";

export type EsitoVerifica =
  | {
      ok: true;
      /** Null solo se il database non era raggiungibile: il verdetto resta valido. */
      verificaId: string | null;
      verdetto: Verdetto;
      fatto: FattoVolo;
      /** Vero quando il dato viene dal fornitore dimostrativo: l'interfaccia DEVE dirlo. */
      demo: boolean;
    }
  | { ok: false; errore: string };

/** Una riga della tabella `voli` (le colonne di supabase/2026-08-07-rivoglio.sql). */
type RigaVolo = {
  id: string;
  volo_iata: string;
  data_locale: string;
  vettore_operativo: string | null;
  vettore_marketing: string | null;
  partenza_iata: string | null;
  partenza_citta: string | null;
  arrivo_iata: string | null;
  arrivo_citta: string | null;
  arrivo_previsto_utc: string | null;
  arrivo_effettivo_utc: string | null;
  stato: FattoVolo["stato"];
  km_ortodromica: number | null;
  fonte: string;
  fonti_discordanti: boolean;
  /** NULL = riga scritta prima della regola "senza Live niente vendita". */
  orario_verificato: boolean | null;
  vettore_da_determinare: boolean | null;
};

function fattoDaRiga(riga: RigaVolo): FattoVolo {
  return {
    voloIata: riga.volo_iata,
    dataLocale: riga.data_locale,
    vettoreOperativo: riga.vettore_operativo ?? riga.volo_iata.slice(0, 2),
    vettoreMarketing: riga.vettore_marketing,
    partenzaIata: riga.partenza_iata,
    partenzaCitta: riga.partenza_citta,
    arrivoIata: riga.arrivo_iata,
    arrivoCitta: riga.arrivo_citta,
    arrivoPrevistoUtc: riga.arrivo_previsto_utc,
    arrivoEffettivoUtc: riga.arrivo_effettivo_utc,
    stato: riga.stato,
    kmOrtodromica: riga.km_ortodromica,
    fontiDiscordanti: riga.fonti_discordanti,
    orarioVerificato: riga.orario_verificato ?? undefined,
    vettoreDaDeterminare: riga.vettore_da_determinare ?? undefined,
    fonte: riga.fonte,
  };
}

/**
 * AeroDataBox se c'è la chiave, altrimenti la demo marcata.
 * I voli ZZ* vanno SEMPRE alla demo, anche con la chiave vera: ZZ non è
 * un codice IATA assegnato, sono i nostri casi dimostrativi (la landing
 * e le prove ci contano), e mandarli all'API vera brucerebbe unità per
 * un errore garantito.
 */
function fornitoreAttivo(voloIata: string): FornitoreVoli {
  if (voloIata.toUpperCase().startsWith("ZZ")) return demo;
  return process.env.AERODATABOX_API_KEY ? aerodatabox : demo;
}

export async function verificaVolo(voloGrezzo: string, dataGrezza: string): Promise<EsitoVerifica> {
  // ── Strato 1: normalizzazione ────────────────────────────────────────
  const volo = normalizzaVolo(voloGrezzo);
  if (!volo.ok) return { ok: false, errore: volo.errore };
  const data = normalizzaData(dataGrezza);
  if (!data.ok) return { ok: false, errore: data.errore };

  const sb = SERVIZIO_ATTIVO ? supabaseServizio() : null;

  // ── Strato 2a: la cache dei fatti ────────────────────────────────────
  let fatto: FattoConPayload | null = null;
  let voloId: string | null = null;
  if (sb) {
    try {
      const { data: riga } = await sb
        .from("voli")
        .select(
          "id, volo_iata, data_locale, vettore_operativo, vettore_marketing, partenza_iata, partenza_citta, arrivo_iata, arrivo_citta, arrivo_previsto_utc, arrivo_effettivo_utc, stato, km_ortodromica, fonte, fonti_discordanti, orario_verificato, vettore_da_determinare",
        )
        .eq("volo_iata", volo.valore)
        .eq("data_locale", data.valore)
        .maybeSingle<RigaVolo>();
      /* Uno "sconosciuto" in cache non fa fede: magari il volo è atterrato
         dopo l'ultima chiamata. E un "atterrato" senza il tracciamento
         verificato (o scritto prima che la colonna esistesse) si richiede:
         il Live può essersi consolidato nel frattempo. Si aggiorna. */
      if (
        riga &&
        riga.stato !== "sconosciuto" &&
        !(riga.stato === "atterrato" && riga.orario_verificato !== true)
      ) {
        fatto = fattoDaRiga(riga);
        voloId = riga.id;
      }
    } catch (e) {
      console.warn("[verifica] cache non leggibile, chiedo al fornitore:", e);
    }
  }

  // ── Strato 2b: il fornitore ──────────────────────────────────────────
  if (!fatto) {
    const primario = fornitoreAttivo(volo.valore);
    fatto = await primario.cerca(volo.valore, data.valore);

    if (!fatto) {
      // Nessun dato: fatto sconosciuto, il motore dirà incerto. Niente cache.
      fatto = {
        voloIata: volo.valore,
        dataLocale: data.valore,
        vettoreOperativo: volo.valore.slice(0, 2),
        vettoreMarketing: null,
        arrivoPrevistoUtc: null,
        arrivoEffettivoUtc: null,
        stato: "sconosciuto",
        kmOrtodromica: null,
        fonte: primario.nome,
      };
    } else {
      // Doppia fonte SOLO se esistono entrambe le chiavi (SPEC §4).
      if (process.env.AERODATABOX_API_KEY && process.env.AVIATIONSTACK_API_KEY) {
        const seconda = await aviationstack.cerca(volo.valore, data.valore);
        if (fatto.arrivoEffettivoUtc && seconda?.arrivoEffettivoUtc) {
          const scartoMinuti = Math.abs(
            (Date.parse(fatto.arrivoEffettivoUtc) - Date.parse(seconda.arrivoEffettivoUtc)) /
              60_000,
          );
          if (scartoMinuti > 15) fatto.fontiDiscordanti = true;
        }
      }

      if (sb) {
        try {
          const { data: rigaNuova, error } = await sb
            .from("voli")
            .upsert(
              {
                volo_iata: fatto.voloIata,
                data_locale: fatto.dataLocale,
                vettore_operativo: fatto.vettoreOperativo,
                vettore_marketing: fatto.vettoreMarketing ?? null,
                partenza_iata: fatto.partenzaIata ?? null,
                partenza_citta: fatto.partenzaCitta ?? null,
                arrivo_iata: fatto.arrivoIata ?? null,
                arrivo_citta: fatto.arrivoCitta ?? null,
                arrivo_previsto_utc: fatto.arrivoPrevistoUtc,
                arrivo_effettivo_utc: fatto.arrivoEffettivoUtc,
                stato: fatto.stato,
                km_ortodromica: fatto.kmOrtodromica,
                fonte: fatto.fonte,
                fonti_discordanti: fatto.fontiDiscordanti ?? false,
                orario_verificato: fatto.orarioVerificato ?? null,
                vettore_da_determinare: fatto.vettoreDaDeterminare ?? false,
                payload_grezzo: fatto.payloadGrezzo ?? null,
                recuperato_il: new Date().toISOString(),
              },
              { onConflict: "volo_iata,data_locale" },
            )
            .select("id")
            .single();
          if (error) console.warn("[verifica] cache non scrivibile:", error.message);
          voloId = rigaNuova?.id ?? null;
        } catch (e) {
          console.warn("[verifica] cache non scrivibile:", e);
        }
      }
    }
  }

  // ── Strato 2c: gli scioperi noti del giorno (tabella a mano) ─────────
  /* Fail-open dichiarato: se il DB tace, niente flag e si procede; il
     rischio residuo lo copre lo shadow mode (conferma umana). I voli
     demo (ZZ*) non interrogano il DB: restano deterministici. */
  if (!fatto.voloIata.startsWith("ZZ")) {
    /* Alla tabella serve il codice IATA, non il nome del vettore: lo
       prendiamo dal numero di volo (per i casi vendibili, IsOperator,
       coincide col vettore operativo). */
    const sciopero = await scioperoInData(fatto.dataLocale, fatto.voloIata.slice(0, 2));
    if (sciopero) fatto = { ...fatto, scioperoNoto: true };
  }

  // ── Strato 3: le regole. Solo codice, mai AI. ────────────────────────
  let verdetto = valuta(fatto);

  // ── La memoria dell'imbuto: una riga in `verifiche` per ogni check ───
  let verificaId: string | null = null;
  if (sb) {
    try {
      const { data: riga, error } = await sb
        .from("verifiche")
        .insert({
          volo_id: voloId,
          volo_iata: fatto.voloIata,
          data_locale: fatto.dataLocale,
          esito: verdetto.esito,
          importo: verdetto.esito === "idoneo" ? verdetto.importo : null,
          ritardo_minuti: "ritardoMinuti" in verdetto ? verdetto.ritardoMinuti : null,
          motivo: verdetto.motivo,
          versione_regole: verdetto.versioneRegole,
          // Shadow mode (SPEC §4): il verdetto aspetta la conferma umana in /admin.
          conferma: process.env.SHADOW_MODE === "1" ? "in_attesa" : "automatica",
        })
        .select("id")
        .single();
      if (error) console.warn("[verifica] riga verifica non salvata:", error.message);
      verificaId = riga?.id ?? null;
    } catch (e) {
      console.warn("[verifica] riga verifica non salvata:", e);
    }
  }

  // Il payload grezzo resta nel database, non esce dall'orchestratore.
  const { payloadGrezzo: _scarta, ...fattoPulito } = fatto;
  void _scarta;

  /* Il caso più comune di "incerto" è un volo APPENA fatto: l'orario
     certificato arriva ore dopo l'atterraggio, e il messaggio generico
     ("controlla numero e data") faceva credere a un errore dell'utente.
     Qui, e solo qui, il motivo diventa una spiegazione onesta: il
     verdetto resta identico, cambia la frase. Trovato nello stress test
     dell'8/08: 10 voli freschi, tutti incerti, utente convinto che il
     sito fosse rotto. */
  const dueGiorniFa = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10);
  if (
    verdetto.esito === "incerto" &&
    fatto.stato === "sconosciuto" &&
    fatto.dataLocale >= dueGiorniFa
  ) {
    verdetto = {
      ...verdetto,
      motivo:
        "Questo volo è recente e l'orario di arrivo certificato non è ancora negli archivi: di solito arriva entro un giorno. Ricontrolla domani: il check resta gratuito, e se ci lasci l'email ti avvisiamo noi.",
    };
  }

  return { ok: true, verificaId, verdetto, fatto: fattoPulito, demo: fatto.fonte === "demo" };
}
