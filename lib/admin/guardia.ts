import { redirect } from "next/navigation";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";

/**
 * IL GUARDIANO DEL RETROBOTTEGA.
 *
 * ⚠️ PERCHÉ STA IN UN FILE SUO E NON DENTRO OGNI PAGINA. Il controllo
 * "sei collegato?" lo fa già `proxy.ts` per tutto ciò che sta sotto
 * `/admin`, ma **collegato non vuol dire admin**: collegato è qualsiasi
 * cliente che ha comprato una pratica. Il controllo del ruolo viveva
 * scritto a mano dentro `app/admin/page.tsx`, quindi le due pagine nuove
 * dell'11/08 (cruscotto e impostazioni) nascevano senza, e un cliente
 * qualsiasi avrebbe visto gli incassi e da dove arriva il traffico.
 * Trovato guardando le pagine, non da una prova.
 *
 * Da qui in avanti: **ogni pagina sotto `/admin` comincia con
 * `await soloAdmin()`**. Una riga, e non si può dimenticare a metà.
 *
 * Chi non è collegato torna al login; chi è collegato ma non è admin
 * finisce nell'app e **non deve nemmeno sapere che questa pagina
 * esiste**: per questo è un rimando, non un "non hai i permessi".
 */
export async function soloAdmin() {
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  const supabase = await supabaseServer();
  const { data: profilo } = await supabase
    .from("profili")
    .select("ruolo")
    .eq("id", utente.id)
    .single();

  if (profilo?.ruolo !== "admin") redirect("/app");
  return utente;
}
