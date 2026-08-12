import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { verificaCoerente, cancelloDelSeguito } from "@/lib/check/cancello";
import { rispostaValida, valutaCancellato } from "@/lib/regole/cancellato";
import { verificaVolo } from "@/lib/voli/verifica";
import { inItaliano } from "@/lib/voli/aeroporti";
import { scadenzaStimata } from "@/lib/regole/eu261";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * POST /api/verifica/cancellato
 * { volo, data, verificaId?, preavviso, alternativa }
 *
 * Il secondo tempo del check quando il volo risulta CANCELLATO.
 *
 * Il primo tempo si ferma su "incerto" perché l'archivio di volo non sa
 * due cose che decidono tutto: quanti giorni prima ti hanno avvisato e
 * com'è andata con il volo alternativo (art. 5 del CE 261/2004). Qui
 * arrivano quelle due risposte e il verdetto si chiude.
 *
 * Il motore resta deterministico e resta uno solo: le risposte sono due
 * campi a scelta chiusa, mai testo libero, e la decisione la prende
 * `valutaCancellato`. L'AI non tocca niente, come per il ritardo.
 *
 * Le risposte si SCRIVONO nella riga di `verifiche`: se un giorno la
 * compagnia contesta, la prova di cosa ha dichiarato l'utente e di quando
 * l'ha dichiarato deve esistere.
 */
/* Il tetto è largo di proposito: qui non si spende niente (il fatto
   arriva dalla cache) e chi risponde alle domande spesso ci ripensa e
   cambia una casella. Stringerlo punirebbe solo l'utente indeciso. */
const MASSIMO_AL_MINUTO = 40;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  if (oltreIlLimite("cancellato", ipDi(req), MASSIMO_AL_MINUTO)) {
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

  const { volo, data, verificaId, preavviso, alternativa } = (corpo ?? {}) as Record<
    string,
    unknown
  >;
  if (typeof volo !== "string" || typeof data !== "string") {
    return NextResponse.json(
      { ok: false, errore: "Manca il volo o la data." },
      { status: 400, headers: CORS },
    );
  }
  const risposte = { preavviso, alternativa };
  if (!rispostaValida(risposte)) {
    return NextResponse.json(
      { ok: false, errore: "Rispondi a tutte e due le domande." },
      { status: 400, headers: CORS },
    );
  }

  /* IL CANCELLO. Questa rotta dà un verdetto vero, quindi col muro acceso
     non può restare aperta: chi ne conosceva l'indirizzo saltava il
     pagamento. Passa chi ha la ricevuta o chi porta l'identificativo di
     una verifica che esiste, cioè chi ha già pagato quel volo. */
  const chiuso = await cancelloDelSeguito(req, verificaId);
  if (chiuso) return chiuso;

  /* Si ripassa dal verificatore invece di fidarsi di quello che arriva dal
     browser: il fatto (stato, distanza, sciopero) deve venire dai nostri
     dati, non da un corpo di richiesta che chiunque può scrivere. */
  const esito = await verificaVolo(volo, data);
  if (!esito.ok) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 404, headers: CORS });
  }

  const verdetto = valutaCancellato(esito.fatto, risposte);

  /* La memoria: risposte ed esito nuovo sulla riga della verifica. Se il
     database non c'è, il verdetto vale lo stesso e si dice com'è andata. */
  let salvato = false;
  /* 🔴 L'id che arriva dal CORPO si accetta solo se quella riga parla
     dello stesso volo e della stessa data che abbiamo appena verificato.
     Senza questo controllo bastava conoscere l'id di un'altra persona
     (sta nell'indirizzo /verifica/<id>, che si condivide) per scriverle
     addosso il verdetto di un volo che non era il suo. Trovato
     dall'ispezione del 12/08 su tre rotte identiche. */
  const dalCorpo =
    typeof verificaId === "string" && verificaId
      ? (await verificaCoerente(verificaId, esito.fatto.voloIata, esito.fatto.dataLocale))
        ? verificaId
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
          cancellato_preavviso: risposte.preavviso,
          cancellato_alternativa: risposte.alternativa,
          cancellato_risposto_il: new Date().toISOString(),
        })
        .eq("id", id);
      salvato = !error;
      if (error) console.error("[cancellato] salvataggio risposte fallito:", error.message);
    } catch (e) {
      console.error("[cancellato] salvataggio risposte fallito:", e);
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
        da: inItaliano(esito.fatto.partenzaCitta) ?? esito.fatto.partenzaIata ?? null,
        a: inItaliano(esito.fatto.arrivoCitta) ?? esito.fatto.arrivoIata ?? null,
        km: esito.fatto.kmOrtodromica,
        vettoreOperativo: esito.fatto.vettoreOperativo,
      },
      scadenza:
        verdetto.esito === "idoneo"
          ? scadenzaStimata(esito.fatto.dataLocale, esito.fatto.vettoreOperativo)
          : null,
      demo: esito.demo,
    },
    { headers: CORS },
  );
}
