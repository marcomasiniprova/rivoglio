import { createBrowserClient } from "@supabase/ssr";
import { CHIAVE_PUBBLICA, MANCA_CONFIGURAZIONE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./chiavi";

/** Client per i componenti che girano nel browser. */
export function supabaseBrowser() {
  if (!SUPABASE_CONFIGURATO) throw new Error(MANCA_CONFIGURAZIONE);
  return createBrowserClient(URL_SUPABASE, CHIAVE_PUBBLICA);
}
