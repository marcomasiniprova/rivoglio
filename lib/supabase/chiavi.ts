/**
 * Le due chiavi pubbliche di Supabase, lette una volta sola.
 *
 * Supabase sta migrando da `anon key` a `publishable key`: accettiamo entrambi
 * i nomi così il progetto non si rompe quando Valerio ruota le chiavi dal
 * pannello. Sono chiavi PUBBLICHE: finiscono nel browser per costruzione, ed è
 * la Row Level Security a proteggere i dati, non la segretezza della chiave.
 *
 * La `service_role` NON deve mai comparire qui dentro.
 */
export const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const CHIAVE_PUBBLICA =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/**
 * Vero solo se il progetto è configurato davvero.
 *
 * Serve perché il sito deve compilare e la landing deve funzionare anche
 * senza `.env.local`: senza questo controllo `createBrowserClient` esplode
 * durante la build e non pubblichi più niente.
 */
export const SUPABASE_CONFIGURATO = Boolean(URL_SUPABASE && CHIAVE_PUBBLICA);

/** Messaggio unico, così l'errore è lo stesso ovunque. */
export const MANCA_CONFIGURAZIONE =
  "Supabase non è configurato: manca NEXT_PUBLIC_SUPABASE_URL o la chiave pubblica in .env.local.";
