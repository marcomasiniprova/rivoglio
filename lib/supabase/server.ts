import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CHIAVE_PUBBLICA, MANCA_CONFIGURAZIONE, SUPABASE_CONFIGURATO, URL_SUPABASE } from "./chiavi";

/**
 * Client per il codice che gira sul server: Server Component, Server Action,
 * Route Handler.
 *
 * I Server Component non possono scrivere i cookie: per questo il `set` è
 * dentro un try/catch vuoto. Non è pigrizia, è il modo previsto da Supabase.
 * A tenere viva la sessione ci pensa il middleware.
 */
export async function supabaseServer() {
  if (!SUPABASE_CONFIGURATO) throw new Error(MANCA_CONFIGURAZIONE);
  const scatola = await cookies();

  return createServerClient(URL_SUPABASE, CHIAVE_PUBBLICA, {
    cookies: {
      getAll() {
        return scatola.getAll();
      },
      setAll(daScrivere) {
        try {
          for (const { name, value, options } of daScrivere) {
            scatola.set(name, value, options);
          }
        } catch {
          // Server Component: il middleware ha già aggiornato la sessione.
        }
      },
    },
  });
}

/**
 * Chi è collegato adesso, verificato dal server di Supabase.
 *
 * Si usa `getUser()` e non `getSession()`: la sessione arriva dai cookie e i
 * cookie li può falsificare chiunque. `getUser()` chiede a Supabase se il
 * token è davvero valido. Su questa differenza si perdono gli account.
 */
export async function utenteCollegato() {
  if (!SUPABASE_CONFIGURATO) return null;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
