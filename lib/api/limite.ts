/**
 * Tetto elementare di richieste per IP, condiviso dalle rotte pubbliche.
 *
 * Onestà su quanto vale: la memoria è quella dell'istanza della funzione
 * Netlify, sparisce a ogni cold start e non è condivisa fra istanze
 * parallele. Ferma il curl in loop di un curioso, non un attacco
 * distribuito. Il giorno in cui ci sarà traffico da proteggere servirà un
 * contatore condiviso (Redis o simili).
 */

const FINESTRA_MS = 60_000;
const contatori = new Map<string, number[]>();

/** L'IP del chiamante: su Netlify sta in x-nf-client-connection-ip. */
export function ipDi(req: Request): string {
  const grezzo =
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for") ??
    "sconosciuto";
  return grezzo.split(",")[0].trim();
}

/**
 * true se questo IP ha già superato il tetto nel minuto corrente.
 * `chiave` separa i contatori delle rotte diverse: la ricerca degli
 * aeroporti si digita a raffica, il resto no.
 */
export function oltreIlLimite(chiave: string, ip: string, massimo: number): boolean {
  const adesso = Date.now();
  // La mappa non deve crescere per sempre: ogni tanto si butta via tutto.
  if (contatori.size > 10_000) contatori.clear();
  const id = `${chiave}:${ip}`;
  const recenti = (contatori.get(id) ?? []).filter((t) => adesso - t < FINESTRA_MS);
  recenti.push(adesso);
  contatori.set(id, recenti);
  return recenti.length > massimo;
}

/* L'indirizzo del sito in produzione. Su Netlify NEXT_PUBLIC_SITO è
   impostato; URL lo mette Netlify da solo; in locale si cade su localhost. */
const SITO =
  process.env.NEXT_PUBLIC_SITO ?? process.env.URL ?? "http://localhost:3000";

/**
 * Header CORS. PRIMA era aperto a chiunque (`*`): qualunque sito poteva
 * chiamare il nostro check dal browser di un visitatore e bruciarci i
 * crediti dei dati di volo. Ora l'unica origine ammessa dal browser è la
 * NOSTRA.
 *
 * Perché non rompe niente:
 *  - Il check della landing è same-origin: il browser non applica affatto
 *    il CORS alle richieste verso lo stesso sito, qualunque valore abbia
 *    questo header. Resta identico.
 *  - L'app mobile NATIVA non è un browser: il CORS non la riguarda, chiama
 *    lo stesso. (Il token di sessione viaggia in Authorization, mai in un
 *    cookie, quindi niente credenziali cross-site da proteggere.)
 *  - Un sito qualsiasi che prova a chiamarci dal browser di un ignaro si
 *    becca un'origine diversa dalla sua e la lettura viene bloccata.
 *
 * L'unico caso che perde è l'anteprima web dell'app aperta da un'altra
 * origine in sviluppo (Expo su localhost:8081 → server su :3000). In
 * produzione l'anteprima è same-origin e funziona; in sviluppo si prova
 * dall'anteprima pubblicata o dall'app nativa.
 */
export const CORS = {
  "Access-Control-Allow-Origin": SITO,
  Vary: "Origin",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  /* Authorization: l'app manda il token della sua sessione lì dentro, e
     senza il permesso esplicito il browser blocca il preflight. */
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;

/* ══════════════════════════════════════════════════════════════════════
   IL FRENO VERO, CONDIVISO (scelta di Valerio col popup, 13/08).

   🔴 IL PROBLEMA DEL CONTATORE QUI SOPRA, detto senza girarci intorno:
   vive nella memoria di UNA copia della funzione. Netlify ne accende
   molte in parallelo quando arriva gente, e ognuna riparte da zero.
   Quindi il tetto di «20 al minuto» non è 20: è 20 per ogni copia
   accesa, e con abbastanza copie diventa nessun tetto. Va bene contro il
   curioso che ricarica; non vale niente il giorno che qualcuno decide di
   farci bruciare i soldi dei dati di volo, che si pagano a chiamata.

   La cura è un contatore che vive FUORI dalle funzioni, uno solo per
   tutti. Upstash Redis va bene: si parla via richieste web normali,
   quindi non serve installare niente, e il piano gratuito regge
   10.000 comandi al giorno, cioè molto più di mille visite.

   ⚠️ SI SBAGLIA DALLA PARTE DI CHI PAGA. Se il contatore non risponde
   (rete lenta, servizio giù, variabili non configurate) NON si blocca
   nessuno: si ripiega sul contatore in memoria. Un freno rotto che
   chiude il sito a tutti fa più danni di un freno assente: il primo
   ferma le vendite, il secondo costa qualche euro di chiamate.

   ⚠️ NASCE SPENTO. Senza `UPSTASH_REDIS_REST_URL` e
   `UPSTASH_REDIS_REST_TOKEN` su Netlify non cambia niente per nessuno:
   resta esattamente il comportamento di oggi.
   ══════════════════════════════════════════════════════════════════════ */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** Vero se il freno condiviso è configurato. Lo mostra /admin/impostazioni. */
export const FRENO_CONDIVISO = Boolean(REDIS_URL && REDIS_TOKEN);

/**
 * Quante richieste ha fatto questa chiave nell'ultimo minuto, contate da
 * un contatore che vale per tutte le copie della funzione.
 *
 * Torna `null` quando non si è riusciti a chiedere: chi chiama ripiega
 * sul contatore in memoria invece di bloccare.
 */
async function conteggioCondiviso(id: string): Promise<number | null> {
  if (!FRENO_CONDIVISO) return null;
  try {
    /* Due comandi in un colpo: aumenta di uno, e se è il primo del minuto
       fai scadere la riga dopo 60 secondi. Senza la scadenza il contatore
       non si azzererebbe mai e dopo un'ora nessuno passerebbe più. */
    const risposta = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", id],
        ["EXPIRE", id, "60", "NX"],
      ]),
      /* Un secondo e mezzo: oltre, l'attesa la paga l'utente che sta
         aspettando il proprio verdetto, e non ne vale la pena. */
      signal: AbortSignal.timeout(1500),
    });
    if (!risposta.ok) return null;
    const dati = (await risposta.json()) as { result?: unknown }[];
    const n = dati?.[0]?.result;
    return typeof n === "number" ? n : null;
  } catch {
    return null;
  }
}

/**
 * Il freno da usare sulle rotte CHE CI COSTANO SOLDI.
 *
 * Stessa domanda di `oltreIlLimite` (questo IP ha sforato?), ma la
 * risposta arriva dal contatore condiviso quando c'è. Quando non c'è,
 * ripiega su quello in memoria: il comportamento non peggiora mai.
 */
export async function oltreIlLimiteCondiviso(
  chiave: string,
  ip: string,
  massimo: number,
): Promise<boolean> {
  const id = `freno:${chiave}:${ip}:${Math.floor(Date.now() / FINESTRA_MS)}`;
  const n = await conteggioCondiviso(id);
  if (n === null) return oltreIlLimite(chiave, ip, massimo);
  return n > massimo;
}
