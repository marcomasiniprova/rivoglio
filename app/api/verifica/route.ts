import { NextResponse } from "next/server";
import { scadenzaStimata } from "@/lib/regole/eu261";
import { verificaVolo } from "@/lib/voli/verifica";
import { inItaliano } from "@/lib/voli/aeroporti";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";

/**
 * POST /api/verifica  {volo, data}
 *
 * Il check pubblico: senza login, senza email, senza download (SPEC §3,
 * il funnel). Risponde il verdetto e i dati oggettivi che lo motivano:
 * ogni numero mostrato all'utente nasce qui ed è apribile.
 *
 * Protezioni (il check chiama i dati di volo a pagamento, va difeso):
 *  - tetto per IP (20 al minuto) col contatore condiviso di lib/api/limite;
 *  - CORS chiuso alla NOSTRA origine, non più aperto a chiunque. Il check
 *    same-origin della landing non se ne accorge (il browser non applica
 *    il CORS allo stesso sito); l'app nativa nemmeno (non è un browser).
 */

/* 20 al minuto: un utente può controllare qualche volo di fila (la
   famiglia, l'andata e il ritorno); un ciclo automatico no. */
const MASSIMO_AL_MINUTO = 20;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  if (oltreIlLimite("verifica", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      {
        ok: false,
        errore: "Troppe richieste di fila. Aspetta un minuto e riprova.",
      },
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
  const { volo, data } = (corpo ?? {}) as { volo?: unknown; data?: unknown };
  if (typeof volo !== "string" || typeof data !== "string") {
    return NextResponse.json(
      {
        ok: false,
        errore: "Servono il numero del volo e la data di partenza.",
      },
      { status: 400, headers: CORS },
    );
  }

  // Da qui in giù verificaVolo non lancia mai: un guasto diventa esito incerto.
  const esito = await verificaVolo(volo, data);
  if (!esito.ok) {
    return NextResponse.json(
      { ok: false, errore: esito.errore },
      { status: 400, headers: CORS },
    );
  }

  const { verdetto, fatto } = esito;
  return NextResponse.json(
    {
      ok: true,
      id: esito.verificaId,
      esito: verdetto.esito,
      ...(verdetto.esito === "idoneo" ? { importo: verdetto.importo } : {}),
      ...("ritardoMinuti" in verdetto && verdetto.ritardoMinuti !== null
        ? { ritardoMinuti: verdetto.ritardoMinuti }
        : {}),
      motivo: verdetto.motivo,
      // I dati oggettivi dietro il verdetto: la trasparenza è il prodotto.
      dato: {
        /* La tratta in chiaro: l'utente riconosce le città, non i codici.
           E le riconosce in italiano: l'archivio scrive "Milan", noi
           mostriamo "Milano" (inItaliano). */
        da: inItaliano(fatto.partenzaCitta) ?? fatto.partenzaIata ?? null,
        a: inItaliano(fatto.arrivoCitta) ?? fatto.arrivoIata ?? null,
        previsto: fatto.arrivoPrevistoUtc,
        effettivo: fatto.arrivoEffettivoUtc,
        vettoreOperativo: fatto.vettoreOperativo,
        km: fatto.kmOrtodromica,
      },
      demo: esito.demo,
      // La prescrizione è una STIMA dichiarata (SPEC §4), e solo dove ha senso.
      ...(verdetto.esito === "idoneo"
        ? {
            scadenzaStimata: scadenzaStimata(
              fatto.dataLocale,
              fatto.vettoreOperativo,
            ),
          }
        : {}),
    },
    { headers: CORS },
  );
}
