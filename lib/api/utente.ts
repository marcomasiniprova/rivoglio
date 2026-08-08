/**
 * Chi sta chiamando, quando la chiamata può arrivare da due mondi.
 *
 * Il sito entra coi cookie (la sessione della pagina); l'app mobile non
 * ha cookie, ha il token della sua sessione Supabase e lo mette
 * nell'intestazione Authorization. Qui si accettano entrambi, e in tutti
 * e due i casi la parola finale ce l'ha il server di Supabase: un token
 * non si crede, si verifica.
 */
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { CHIAVE_PUBBLICA, SUPABASE_CONFIGURATO, URL_SUPABASE } from "@/lib/supabase/chiavi";
import { utenteCollegato } from "@/lib/supabase/server";

/**
 * L'utente della richiesta: dal Bearer token (l'app) o dai cookie (il
 * sito). Null se nessuno dei due regge.
 */
export async function utenteDaRichiesta(req: Request): Promise<User | null> {
  const intestazione = req.headers.get("authorization") ?? "";
  const token = intestazione.startsWith("Bearer ") ? intestazione.slice(7).trim() : "";

  if (token && SUPABASE_CONFIGURATO) {
    const sb = createClient(URL_SUPABASE, CHIAVE_PUBBLICA, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb.auth.getUser(token);
    if (!error && data.user) return data.user;
    // Un Bearer sbagliato non fa ripiegare sui cookie: chi manda un token
    // vuole essere giudicato su quello.
    return null;
  }

  return utenteCollegato();
}
