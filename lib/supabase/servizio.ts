import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { URL_SUPABASE } from "./chiavi";

/**
 * Il client di servizio. SCAVALCA la Row Level Security.
 *
 * ⚠️ Serve solo al motore che gira sul server: leggere le ricerche di TUTTI
 * gli utenti per abbinarle alle offerte, e scalare i crediti (che l'utente
 * non può toccare da solo, ed è giusto così).
 *
 * REGOLE, non consigli:
 * - la chiave vive SOLO in una variabile d'ambiente, mai in un file del repo
 * - non si importa mai da un componente client: finirebbe nel browser e
 *   chiunque potrebbe leggere e modificare i dati di tutti
 * - se manca, si alza un'eccezione: meglio fermarsi che girare a metà
 */
const CHIAVE = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const SERVIZIO_ATTIVO = Boolean(CHIAVE && URL_SUPABASE);

/**
 * 🔴 TIMEOUT SULLE QUERY AL DATABASE (audit del 14/08).
 *
 * Le chiamate ESTERNE (AeroDataBox, Mistral, Telegram) hanno tutte un
 * timeout; le query al DATABASE no. Sotto un picco, se PostgREST di Supabase
 * si satura e una query resta appesa, niente la ferma: la funzione Netlify
 * aspetta fino ai suoi 10 secondi e viene uccisa dalla piattaforma, cioè un
 * 500 in faccia all'utente, proprio quello che non deve succedere.
 *
 * Con questo timeout una query appesa diventa un errore GESTITO: i try/catch
 * che già avvolgono le letture la trasformano in "incerto" o in un campo
 * nullo, e la rete di sicurezza (app/error.tsx) copre il resto. 4 secondi è
 * largo per una query sana (una query indicizzata sta sotto il decimo di
 * secondo) e ben sotto i 10 della funzione.
 */
const TIMEOUT_DB_MS = 4000;

function fetchConTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Se il chiamante ha già un suo segnale, si rispetta; altrimenti il nostro.
  return fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_DB_MS) });
}

/* Un solo client per macchina Netlify, non uno per chiamata (audit 14/08):
   createClient alloca anche pezzi auth/realtime che non usiamo, e sotto tante
   chiamate al secondo era spreco puro. Il client di servizio è senza stato:
   condividerlo è quello che supabase-js consiglia. */
let cliente: SupabaseClient | null = null;

export function supabaseServizio(): SupabaseClient {
  if (!SERVIZIO_ATTIVO) {
    throw new Error(
      "SUPABASE_SECRET_KEY assente: il motore non può girare. Mettila in .env.local (mai nel repo).",
    );
  }
  if (!cliente) {
    cliente = createClient(URL_SUPABASE, CHIAVE, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchConTimeout },
    });
  }
  return cliente;
}
