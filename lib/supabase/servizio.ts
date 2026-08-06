import { createClient } from "@supabase/supabase-js";
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

export function supabaseServizio() {
  if (!SERVIZIO_ATTIVO) {
    throw new Error(
      "SUPABASE_SECRET_KEY assente: il motore non può girare. Mettila in .env.local (mai nel repo).",
    );
  }
  return createClient(URL_SUPABASE, CHIAVE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
