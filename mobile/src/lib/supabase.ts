import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
 * Stanno qui come VALORE DI RISERVA, così l'app parte anche senza variabili
 * d'ambiente. Se le variabili `EXPO_PUBLIC_...` esistono, vincono loro.
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

const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL || RISERVA.url;

const CHIAVE_PUBBLICA =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  RISERVA.chiave;

/**
 * Il client unico dell'app. La sessione vive in AsyncStorage e si rinnova
 * da sola. `detectSessionInUrl: false` perché in React Native non c'è un
 * indirizzo di pagina da cui leggere i token.
 */
export const supabase: SupabaseClient = createClient(URL_SUPABASE, CHIAVE_PUBBLICA, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
