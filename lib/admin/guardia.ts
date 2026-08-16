import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";

/**
 * L'EMAIL DEL PADRONE DI CASA (Valerio, 16/08, scelta col popup: «falla
 * SOLO per la mia email, non fare casini»).
 *
 * Entrando con questa email si è sempre admin e si atterra sempre nel
 * pannello, senza passare dalla web app. È volutamente l'EMAIL e non il
 * ruolo nel database: così vale anche il giorno che il ruolo, per un
 * qualsiasi motivo, non fosse impostato, e non c'è modo di restare chiusi
 * fuori dal proprio pannello. Un indirizzo, non un segreto: può stare qui.
 */
export const EMAIL_ADMIN = "valerio@artecai.it";

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
/**
 * ⚠️ `cache()`: il layout e la pagina lo chiamano tutti e due, ed è
 * voluto (ogni pagina si difende da sola). Ma senza questo, "tutti e
 * due" significava anche due domande a Supabase e due letture del ruolo
 * per ogni singolo clic: quattro attese in fila prima di disegnare
 * qualsiasi cosa, ed è il motivo per cui il pannello sembrava rotto
 * (Valerio, 12/08). Adesso i controlli restano due, la risposta è una.
 */
export const soloAdmin = cache(async () => {
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  /* L'email del padrone di casa entra sempre, ruolo o non ruolo (scelta di
     Valerio, 16/08). È anche quello che impedisce il rimbalzo infinito:
     `/app` manda questa email a `/admin`, e qui `/admin` la fa entrare. */
  if (utente.email?.toLowerCase() === EMAIL_ADMIN) return utente;

  const supabase = await supabaseServer();
  const { data: profilo } = await supabase
    .from("profili")
    .select("ruolo")
    .eq("id", utente.id)
    .single();

  if (profilo?.ruolo !== "admin") redirect("/app");
  return utente;
});
