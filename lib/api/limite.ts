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

/**
 * Header CORS: queste rotte le chiama anche l'app mobile, da un'origine
 * diversa. Senza, il browser blocca la risposta e l'app dice "sei
 * offline" pur avendo la rete. Nessun cookie in gioco.
 */
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;
