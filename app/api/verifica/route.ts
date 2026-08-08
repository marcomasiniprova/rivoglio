import { NextResponse } from "next/server";
import { scadenzaStimata } from "@/lib/regole/eu261";
import { verificaVolo } from "@/lib/voli/verifica";

/**
 * POST /api/verifica  {volo, data}
 *
 * Il check pubblico: senza login, senza email, senza download (SPEC §3,
 * il funnel). Risponde il verdetto e i dati oggettivi che lo motivano:
 * ogni numero mostrato all'utente nasce qui ed è apribile.
 */

/* ── Protezione elementare: massimo 20 richieste al minuto per IP ───────
   Una mappa in memoria, e va detto ONESTAMENTE quanto vale: su Netlify
   ogni istanza della funzione ha la SUA memoria, che sparisce a ogni cold
   start e non è condivisa fra istanze parallele. Quindi il limite reale è
   "20 al minuto per istanza": ferma il curl in loop di un curioso, non un
   attacco distribuito. Il giorno in cui ci sarà traffico da proteggere
   servirà un contatore condiviso (Redis o simili). Per il lancio basta:
   il check costa ~0,0005$ l'uno (SPEC §5). */
const FINESTRA_MS = 60_000;
const MASSIMO_NELLA_FINESTRA = 20;
const richiestePerIp = new Map<string, number[]>();

function oltreIlLimite(ip: string): boolean {
  const adesso = Date.now();
  // La mappa non deve crescere per sempre: ogni tanto si butta via tutto.
  if (richiestePerIp.size > 10_000) richiestePerIp.clear();
  const recenti = (richiestePerIp.get(ip) ?? []).filter(
    (t) => adesso - t < FINESTRA_MS,
  );
  recenti.push(adesso);
  richiestePerIp.set(ip, recenti);
  return recenti.length > MASSIMO_NELLA_FINESTRA;
}

function ipDi(req: Request): string {
  // Netlify passa l'IP vero in x-nf-client-connection-ip; x-forwarded-for è la riserva.
  const grezzo =
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for") ??
    "sconosciuto";
  return grezzo.split(",")[0].trim();
}

/* Il check è pubblico e non autenticato: lo usa anche l'app mobile, che
   chiama da un'origine diversa (in sviluppo il server Expo, in produzione
   l'app installata). Senza questi header il browser blocca la risposta e
   l'app dice "sei offline" pur avendo la rete. Nessun cookie in gioco:
   qui non passa nulla di personale, e il tetto per IP resta quello. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  if (oltreIlLimite(ipDi(req))) {
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
        // La tratta in chiaro: l'utente riconosce le città, non i codici.
        da: fatto.partenzaCitta ?? fatto.partenzaIata ?? null,
        a: fatto.arrivoCitta ?? fatto.arrivoIata ?? null,
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
