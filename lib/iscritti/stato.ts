import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * Lo stato di un iscritto all'Osservatorio: confermato o disdetto.
 *
 * Perché il client di SERVIZIO e non quello pubblico: dalla landing si
 * può solo INSERIRE (è l'unica policy su `iscritti`). Confermare e
 * disdire sono scritture su una riga che esiste già, e devono poterle
 * fare solo le nostre rotte, non il browser di chiunque.
 *
 * Nessuna delle due lancia: se il database è giù, l'utente ha comunque
 * cliccato e non gli si può sbattere in faccia una pagina di errore per
 * un problema nostro. Si registra in console e si dice la verità a
 * schermo.
 */

export type EsitoStato = { ok: boolean; motivo?: string };

async function segna(email: string, campo: "confermato_il" | "disdetto_il"): Promise<EsitoStato> {
  if (!SERVIZIO_ATTIVO) {
    console.warn(`[iscritti] servizio Supabase assente: ${campo} non scritto per ${email}`);
    return { ok: false, motivo: "database non configurato" };
  }
  try {
    const { error } = await supabaseServizio()
      .from("iscritti")
      .update({ [campo]: new Date().toISOString() })
      .eq("email", email);
    if (error) {
      console.error(`[iscritti] ${campo} fallito:`, error.message);
      return { ok: false, motivo: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error(`[iscritti] ${campo} fallito:`, e);
    return { ok: false, motivo: "scrittura fallita" };
  }
}

/** Ha cliccato il link: da adesso è iscritto per davvero. */
export const confermaIscritto = (email: string) => segna(email, "confermato_il");

/** Non ne vuole più sapere: la riga resta, ma marcata. */
export const disdiciIscritto = (email: string) => segna(email, "disdetto_il");
