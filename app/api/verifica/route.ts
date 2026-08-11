import { NextResponse } from "next/server";
import { scadenzaStimata } from "@/lib/regole/eu261";
import { verificaVolo } from "@/lib/voli/verifica";
import { inItaliano } from "@/lib/voli/aeroporti";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { CHECK_A_PAGAMENTO, CORTESIA_SU_INCERTO } from "@/lib/check/ingresso";
import { passDi, rispostaMuro } from "@/lib/check/cancello";
import { COOKIE_PASS, consumaPass } from "@/lib/check/pass";

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

/** Come si scrive il cookie della ricevuta: solo server, solo nostro sito. */
const BISCOTTO = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

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

  /* ── IL CANCELLO (spento finché CHECK_PREZZO_ATTIVO non vale "1") ───
     Chi ha pagato porta con sé una ricevuta firmata nel cookie: niente
     account, niente password, niente attesa. Chi non ce l'ha riceve un
     402 con dentro il motivo, e la pagina mostra il muro col prezzo.
     Il controllo sta QUI, sul server, e non in una schermata: un muro
     che vive solo nel browser lo scavalca chiunque apra gli strumenti
     per sviluppatori, e ogni check scavalcato è una chiamata pagata da
     noi. */
  const pass = passDi(req);
  if (CHECK_A_PAGAMENTO && !pass) return rispostaMuro(req);

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

  /* Il check si consuma SOLO se abbiamo dato una risposta. Su un incerto
     il credito resta: chi paga per sapere e si sente rispondere "non lo
     so" non ha comprato niente, e trattenergli i soldi è la strada più
     breve per una contestazione sulla carta (vedi CORTESIA_SU_INCERTO). */
  const daConsumare =
    pass && !(CORTESIA_SU_INCERTO && verdetto.esito === "incerto") ? consumaPass(pass) : undefined;

  const risposta = NextResponse.json(
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

  if (pass && daConsumare !== undefined) {
    if (daConsumare === null) {
      risposta.cookies.delete(COOKIE_PASS);
    } else {
      risposta.cookies.set(COOKIE_PASS, daConsumare, BISCOTTO);
    }
  }
  return risposta;
}
