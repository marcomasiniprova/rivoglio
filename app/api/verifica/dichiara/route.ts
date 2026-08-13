import { NextResponse } from "next/server";
import { normalizzaData, normalizzaVolo } from "@/lib/voli/normalizza";
import { CORS, ipDi, oltreIlLimiteCondiviso } from "@/lib/api/limite";
import { verificaCoerente, cancelloDelSeguito } from "@/lib/check/cancello";
import {
  rispostaCoincidenzaValida,
  rispostaNegatoValida,
  valutaCoincidenza,
  valutaNegato,
} from "@/lib/regole/dichiarati";
import { verificaVolo } from "@/lib/voli/verifica";
import { aeroportoPerIata, inItaliano } from "@/lib/voli/aeroporti";
import { kmFraAeroporti } from "@/lib/voli/distanza";
import { scadenzaStimata } from "@/lib/regole/eu261";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * POST /api/verifica/dichiara
 *
 * I casi che gli archivi non possono vedere: NEGATO IMBARCO e
 * COINCIDENZA PERSA. Un volo partito in orario non dice niente su chi è
 * rimasto al gate; un primo volo con 40 minuti di ritardo non dice
 * niente sulla coincidenza saltata a Monaco. Qui il passeggero dichiara,
 * a scelte chiuse, e il motore deterministico decide.
 *
 * Corpo:
 *   { volo, data, verificaId?, caso: "negato",
 *     presenza, volonta }
 *   { volo, data, verificaId?, caso: "coincidenza",
 *     unica, ritardoFinale, destinazioneFinale }   // IATA
 *
 * Come per i cancellati: il fatto (distanza, sciopero, codeshare) viene
 * dai NOSTRI dati, mai dal browser; le dichiarazioni si scrivono sulla
 * riga della verifica come prova; chi non ricorda resta incerto e non
 * paga.
 */
const MASSIMO_AL_MINUTO = 40;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  if (await oltreIlLimiteCondiviso("dichiara", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe richieste di fila. Aspetta un minuto." },
      { status: 429, headers: CORS },
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, errore: "Richiesta non leggibile." },
      { status: 400, headers: CORS },
    );
  }
  const c = (corpo ?? {}) as Record<string, unknown>;
  if (typeof c.volo !== "string" || typeof c.data !== "string") {
    return NextResponse.json(
      { ok: false, errore: "Manca il volo o la data." },
      { status: 400, headers: CORS },
    );
  }
  if (c.caso !== "negato" && c.caso !== "coincidenza") {
    return NextResponse.json(
      { ok: false, errore: "Caso non riconosciuto." },
      { status: 400, headers: CORS },
    );
  }

  /* IL CANCELLO: vedi lib/check/cancello.ts. Questa rotta dà un verdetto
     vero, e col muro acceso il verdetto si paga. */
  const chiuso = await cancelloDelSeguito(req, c.verificaId, {
    /* Si normalizzano come li normalizza il verificatore: se no
       "fr 4001" e "FR4001" sembrerebbero due voli diversi e il cancello
       si chiuderebbe in faccia a chi ha pagato. */
    voloIata: (() => { const n = normalizzaVolo(c.volo); return n.ok ? n.valore : c.volo; })(),
    dataLocale: (() => { const n = normalizzaData(c.data); return n.ok ? n.valore : c.data; })(),
  });
  if (chiuso) return chiuso;

  const esito = await verificaVolo(c.volo, c.data);
  if (!esito.ok) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 404, headers: CORS });
  }
  const fatto = esito.fatto;

  let verdetto;
  let dichiarazione: Record<string, unknown>;
  let destinazione: { iata: string; citta: string } | null = null;

  if (c.caso === "negato") {
    const r = { presenza: c.presenza, volonta: c.volonta };
    if (!rispostaNegatoValida(r)) {
      return NextResponse.json(
        { ok: false, errore: "Rispondi a tutte e due le domande." },
        { status: 400, headers: CORS },
      );
    }
    verdetto = valutaNegato(fatto, r);
    dichiarazione = { caso: "negato", ...r };
  } else {
    const r = { unica: c.unica, ritardoFinale: c.ritardoFinale };
    if (!rispostaCoincidenzaValida(r)) {
      return NextResponse.json(
        { ok: false, errore: "Rispondi a tutte le domande." },
        { status: 400, headers: CORS },
      );
    }
    /* La distanza dell'INTERO viaggio: partenza del volo controllato →
       destinazione finale dichiarata. Il codice IATA arriva dal campo di
       ricerca (lo stesso del check per tratta) e si valida qui. */
    const iataFinale =
      typeof c.destinazioneFinale === "string" ? c.destinazioneFinale.trim().toUpperCase() : "";
    const scalo = iataFinale ? aeroportoPerIata(iataFinale) : null;
    if (!scalo) {
      return NextResponse.json(
        { ok: false, errore: "Dimmi l'aeroporto della destinazione finale." },
        { status: 400, headers: CORS },
      );
    }
    const kmViaggio = fatto.partenzaIata ? kmFraAeroporti(fatto.partenzaIata, scalo.iata) : null;
    verdetto = valutaCoincidenza(fatto, r, kmViaggio);
    dichiarazione = { caso: "coincidenza", ...r, destinazioneFinale: scalo.iata };
    destinazione = { iata: scalo.iata, citta: inItaliano(scalo.citta) ?? scalo.citta };
  }

  /* La prova: dichiarazione ed esito sulla riga della verifica. */
  let salvato = false;
  /* 🔴 L'id che arriva dal CORPO si accetta solo se quella riga parla
     dello stesso volo e della stessa data che abbiamo appena verificato.
     Senza questo controllo bastava conoscere l'id di un'altra persona
     (sta nell'indirizzo /verifica/<id>, che si condivide) per scriverle
     addosso il verdetto di un volo che non era il suo. Trovato
     dall'ispezione del 12/08 su tre rotte identiche. */
  const dalCorpo =
    typeof c.verificaId === "string" && c.verificaId
      ? (await verificaCoerente(c.verificaId, esito.fatto.voloIata, esito.fatto.dataLocale))
        ? c.verificaId
        : null
      : null;
  const id = dalCorpo ?? esito.verificaId;
  if (id && SERVIZIO_ATTIVO) {
    try {
      const { error } = await supabaseServizio()
        .from("verifiche")
        .update({
          esito: verdetto.esito,
          importo: verdetto.esito === "idoneo" ? verdetto.importo : null,
          motivo: verdetto.motivo,
          /* 🔴 IL RITARDO VA RISCRITTO, e prima non lo era. La riga
             conservava quello del check di partenza (155 minuti per
             FR4001), e la pagina del verdetto e la LETTERA lo
             rileggevano da lì: uscivano 400 euro accanto a «2 h e 35
             min di ritardo». Per questi casi il ritardo del volo non
             c'entra niente col diritto, quindi si azzera invece di
             lasciare in giro un numero che verrà letto come una prova.
             Trovato l'11/08 da Valerio. */
          ritardo_minuti: verdetto.esito === "idoneo" ? 0 : null,
          caso_dichiarato: dichiarazione.caso,
          dichiarazione,
          dichiarato_il: new Date().toISOString(),
        })
        .eq("id", id);
      salvato = !error;
      if (error) console.error("[dichiara] salvataggio fallito:", error.message);
    } catch (e) {
      console.error("[dichiara] salvataggio fallito:", e);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      salvato,
      esito: verdetto.esito,
      motivo: verdetto.motivo,
      ...(verdetto.esito === "idoneo" ? { importo: verdetto.importo } : {}),
      dato: {
        da: inItaliano(fatto.partenzaCitta) ?? fatto.partenzaIata ?? null,
        a: inItaliano(fatto.arrivoCitta) ?? fatto.arrivoIata ?? null,
        km: fatto.kmOrtodromica,
        vettoreOperativo: fatto.vettoreOperativo,
        destinazioneFinale: destinazione,
      },
      scadenza:
        verdetto.esito === "idoneo"
          ? scadenzaStimata(fatto.dataLocale, fatto.vettoreOperativo)
          : null,
      demo: esito.demo,
    },
    { headers: CORS },
  );
}
