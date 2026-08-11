import { createSign } from "node:crypto";

/**
 * COSA CERCA LA GENTE SU GOOGLE PER TROVARCI.
 *
 * È l'unico dato esterno che il pannello va a prendere, ed è una scelta
 * (Valerio, 11/08, col popup): Search Console e basta, niente Google
 * Analytics.
 *
 * ⚠️ IL MOTIVO NON È TECNICO, È UNA PROMESSA. Google Analytics mette
 * cookie di tracciamento sul browser di chi visita: in Europa vuol dire
 * banner del consenso, e la nostra privacy dichiara nero su bianco che
 * non usiamo GA né strumenti di terze parti. Search Console invece non
 * tocca il browser di nessuno: i numeri li ha già Google perché è Google
 * a mostrare i risultati, e ce li restituisce **già aggregati**. Nessun
 * cookie, nessun banner, nessuna riga di privacy da riscrivere.
 *
 * ⚠️ ZERO LIBRERIE NUOVE. Il gettone di accesso si firma con `crypto`,
 * che Node ha già, e la chiamata è una fetch. La libreria ufficiale di
 * Google pesa qualche megabyte e servirebbe per una chiamata sola.
 *
 * Serve su Netlify:
 *   GOOGLE_SA_EMAIL   l'indirizzo dell'account di servizio
 *   GOOGLE_SA_KEY     la sua chiave privata (quella lunga del file JSON)
 *   GSC_SITO          la proprietà, es. sc-domain:rivolio.it
 */

const SCOPO = "https://www.googleapis.com/auth/webmasters.readonly";

export const SEARCH_CONSOLE_ATTIVA = Boolean(
  process.env.GOOGLE_SA_EMAIL && process.env.GOOGLE_SA_KEY && process.env.GSC_SITO,
);

export type RigaRicerca = {
  /** La parola cercata, oppure la pagina. */
  chiave: string;
  clic: number;
  /** Quante volte siamo comparsi nei risultati. */
  viste: number;
  /** Quanti di quelli che ci vedono ci cliccano, in percentuale. */
  clicSuViste: number;
  /** La posizione media nei risultati: 1 è il primo posto. */
  posizione: number;
};

export type Ricerche = {
  parole: RigaRicerca[];
  pagine: RigaRicerca[];
  clicTotali: number;
  visteTotali: number;
  /** Il periodo guardato, per scriverlo a schermo senza inventarlo. */
  da: string;
  a: string;
} | null;

/** base64url: quello che vuole Google, senza i caratteri scomodi. */
const b64 = (s: string | Buffer) =>
  Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/**
 * Il gettone di accesso, firmato da noi.
 *
 * È il giro standard "account di servizio": si costruisce un documento
 * che dice chi siamo e cosa vogliamo, lo si firma con la chiave privata,
 * e Google lo scambia con un permesso che dura un'ora.
 */
async function gettone(): Promise<string | null> {
  const email = process.env.GOOGLE_SA_EMAIL;
  const chiave = process.env.GOOGLE_SA_KEY;
  if (!email || !chiave) return null;

  /* ⚠️ La chiave nel file JSON ha gli a capo scritti come "\n". Netlify
     li conserva così, quindi vanno rimessi veri: senza, la firma non
     parte e l'errore che si legge non c'entra niente con la causa. */
  const pem = chiave.replace(/\\n/g, "\n");

  const adesso = Math.floor(Date.now() / 1000);
  const testa = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const corpo = b64(
    JSON.stringify({
      iss: email,
      scope: SCOPO,
      aud: "https://oauth2.googleapis.com/token",
      iat: adesso,
      exp: adesso + 3600,
    }),
  );

  try {
    const firma = createSign("RSA-SHA256").update(`${testa}.${corpo}`).sign(pem);
    const jwt = `${testa}.${corpo}.${b64(firma)}`;

    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    });
    if (!r.ok) {
      console.error("[search console] gettone rifiutato:", r.status);
      return null;
    }
    const d = (await r.json()) as { access_token?: string };
    return d.access_token ?? null;
  } catch (e) {
    console.error("[search console] gettone non ottenuto:", e);
    return null;
  }
}

type RispostaGoogle = {
  rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }>;
};

const giorniFa = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

/**
 * Le parole e le pagine degli ultimi 28 giorni.
 *
 * ⚠️ Non lancia mai e non inventa niente: se qualcosa non va torna
 * `null`, e la schermata dice che non si è letto invece di mostrare zeri.
 *
 * ⚠️ 28 giorni e non 7: Search Console consolida i dati con due o tre
 * giorni di ritardo, quindi su una finestra corta l'ultimo dato è sempre
 * a metà e sembra un crollo.
 */
export async function leggiRicerche(quante = 10): Promise<Ricerche> {
  if (!SEARCH_CONSOLE_ATTIVA) return null;
  const tok = await gettone();
  if (!tok) return null;

  const sito = process.env.GSC_SITO!;
  const da = giorniFa(30);
  const a = giorniFa(3);

  const chiedi = async (dimensione: "query" | "page"): Promise<RigaRicerca[] | null> => {
    try {
      const r = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(sito)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: da,
            endDate: a,
            dimensions: [dimensione],
            rowLimit: quante,
          }),
          signal: AbortSignal.timeout(8_000),
          cache: "no-store",
        },
      );
      if (!r.ok) {
        console.error(`[search console] ${dimensione}: risposta ${r.status}`);
        return null;
      }
      const d = (await r.json()) as RispostaGoogle;
      return (d.rows ?? []).map((x) => ({
        chiave: x.keys?.[0] ?? "?",
        clic: x.clicks ?? 0,
        viste: x.impressions ?? 0,
        clicSuViste: Math.round((x.ctr ?? 0) * 1000) / 10,
        posizione: Math.round((x.position ?? 0) * 10) / 10,
      }));
    } catch (e) {
      console.error(`[search console] ${dimensione} non letta:`, e);
      return null;
    }
  };

  const [parole, pagine] = await Promise.all([chiedi("query"), chiedi("page")]);
  if (parole === null && pagine === null) return null;

  /* I totali si sommano su QUELLO CHE ABBIAMO CHIESTO (le prime dieci
     parole), non su tutto: dirlo a schermo evita di far credere che sia
     il totale del sito. */
  const somma = (r: RigaRicerca[] | null, campo: "clic" | "viste") =>
    (r ?? []).reduce((s, x) => s + x[campo], 0);

  return {
    parole: parole ?? [],
    pagine: pagine ?? [],
    clicTotali: somma(parole, "clic"),
    visteTotali: somma(parole, "viste"),
    da,
    a,
  };
}
