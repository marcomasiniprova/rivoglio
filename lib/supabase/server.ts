import { cache } from "react";
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
/**
 * 🔴 `cache()` NON È UN'OTTIMIZZAZIONE FURBA, È LA CORREZIONE DI UN
 * DIFETTO. Valerio, 12/08: «la parte admin è la cosa più lenta che
 * abbia mai usato, clicco una sezione e se va bene ci mette 3 secondi».
 *
 * Il motivo: `getUser()` non legge il cookie, **chiede a Supabase** se
 * quel token è davvero valido, e chiederlo è un viaggio di rete. Su una
 * pagina del pannello lo si chiedeva quattro volte per volta: una nel
 * layout (che controlla il ruolo), una nella pagina (che lo ricontrolla,
 * ed è giusto che lo faccia), e ognuna delle due si portava dietro anche
 * la lettura del ruolo dalla tabella. Quattro attese in fila prima di
 * leggere un solo numero.
 *
 * `cache()` di React tiene il risultato per la durata di UNA richiesta:
 * la seconda chiamata identica non parte nemmeno, riceve la risposta
 * della prima. Nessun controllo salta, nessuna guardia si abbassa: le
 * verifiche restano tutte, solo che la risposta si dà una volta sola.
 * ⚠️ E non è una cache fra richieste: alla richiesta dopo si ricomincia
 * da capo, quindi un utente scollegato nel frattempo resta scollegato.
 */
export const utenteCollegato = cache(async () => {
  if (!SUPABASE_CONFIGURATO) return null;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
});
