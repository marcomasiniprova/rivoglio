/**
 * Le due chiavi PUBBLICHE di Supabase.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PERCHÉ SONO SCRITTE QUI DENTRO E NON È UN ERRORE
 * ─────────────────────────────────────────────────────────────────────────
 * La chiave `publishable` (prima si chiamava `anon`) è pubblica per
 * costruzione: Supabase la mette nel bundle JavaScript che scarica ogni
 * visitatore del sito. Chiunque apra gli strumenti da sviluppatore la vede.
 * Non è un segreto e non lo è mai stata: a proteggere i dati è la Row Level
 * Security, che su questo progetto è attiva su ogni tabella e già collaudata
 * (il buco sui crediti è stato trovato e chiuso attaccandola).
 *
 * Stanno qui come VALORE DI RISERVA, così il progetto parte anche senza
 * `.env.local`. Se `.env.local` esiste, vince lui. In produzione si mettono
 * nelle variabili d'ambiente di Netlify e questo file non viene mai letto.
 *
 * ⛔ LA CHIAVE `sb_secret_...` NON DEVE MAI FINIRE QUI DENTRO.
 *    Quella scavalca la Row Level Security e legge tutto di tutti.
 *    Vive solo nelle variabili d'ambiente del server, mai in un file.
 * ─────────────────────────────────────────────────────────────────────────
 */
const RISERVA = {
  url: "https://znwpzkzavzsktyfxwuye.supabase.co",
  chiave: "sb_publishable_10LLmy1iXQDU7pBtpLtoBQ_BY5ynOGO",
} as const;

export const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL || RISERVA.url;

export const CHIAVE_PUBBLICA =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  RISERVA.chiave;

/** Vero se abbiamo di che collegarci. Con la riserva è sempre vero. */
export const SUPABASE_CONFIGURATO = Boolean(URL_SUPABASE && CHIAVE_PUBBLICA);

export const MANCA_CONFIGURAZIONE =
  "Supabase non è configurato: manca NEXT_PUBLIC_SUPABASE_URL o la chiave pubblica.";
