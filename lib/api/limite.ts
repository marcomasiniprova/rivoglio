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
