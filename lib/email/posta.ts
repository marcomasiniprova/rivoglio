import { Resend } from "resend";

/**
 * L'unico punto da cui esce un'email in tutto il progetto.
 *
 * PERCHÉ RESEND E NON LA POSTA DI SUPABASE
 * Supabase, sul piano gratuito, manda 2 email l'ora. Non è una scomodità:
 * è un tetto che al lancio blocca il terzo iscritto della giornata. Verificato
 * dal vivo il 06/08/2026: la registrazione di prova è stata respinta con
 * "email rate limit exceeded" prima ancora di creare l'utente.
 * Resend parte da 3.000 email al mese gratis e 100 al giorno.
 *
 * ⚠️ FINCHÉ NON C'È IL DOMINIO: Resend consente di spedire solo verso
 * l'indirizzo del proprietario dell'account, usando `onboarding@resend.dev`
 * come mittente. Serve per provare, non per lanciare. Appena
 * `rivolio.it` è verificato su Resend, si cambia MITTENTE qui sotto
 * e parte tutto.
 */

const CHIAVE = process.env.RESEND_API_KEY ?? "";

/** Vero solo se possiamo davvero spedire. */
export const POSTA_ATTIVA = Boolean(CHIAVE);

/**
 * Il mittente.
 *
 * 🔴 IL NOME È «Valerio dal team di Rivolio», NON «Valerio di Rivolio»
 * (scelta di Valerio, 13/08). Il perché è preciso: «Valerio di Rivolio»
 * fa sembrare che dietro ci sia una persona sola, e chi si arrabbia gli
 * scrive addosso trentamila email personali. «dal team di Rivolio» tiene
 * il tocco umano (c'è un nome, non un marchio anonimo) ma dice che c'è
 * una squadra, e nessuna casella personale finisce sotto gli occhi.
 *
 * L'INDIRIZZO è `team@rivolio.it` (casella condivisa, inoltrata a
 * Valerio). Prima era `valerio@...`, che è esattamente quello che non
 * vogliamo far vedere.
 *
 * ⚠️ Resend spedisce solo da un dominio che ha verificato. Il 12/08 il
 * verificato era `send.rivolio.it`; il giorno che `rivolio.it` è
 * verificato l'indirizzo diventa `team@rivolio.it`. Un mittente su un
 * dominio non verificato si becca un rifiuto a ogni invio, e siccome
 * `spedisci` non lancia mai, nessuno riceve niente e nessuno se ne
 * accorge. Quindi il valore vero lo mette Valerio su Netlify:
 *   RESEND_MITTENTE = "Valerio dal team di Rivolio <team@send.rivolio.it>"
 * e, quando rivolio.it è verificato, "<team@rivolio.it>".
 */
export const MITTENTE =
  process.env.RESEND_MITTENTE ?? "Valerio dal team di Rivolio <onboarding@resend.dev>";

/**
 * DOVE ARRIVA LA RISPOSTA, che è una cosa diversa da chi manda.
 *
 * ⚠️ Il sottodominio da cui spediamo non riceve posta (su Resend
 * "Receiving" è spento, ed è la condizione normale). Quindi chi preme
 * "Rispondi" su un'email di Rivolio scriverebbe a una casella che non
 * esiste, e la sua risposta tornerebbe indietro. Non è un dettaglio: la
 * pagina della lettera dice testualmente «scrivici rispondendo a una
 * qualsiasi email della pratica», quindi quella casella è il nostro
 * unico canale di assistenza.
 *
 * `RESEND_RISPOSTA_A` è l'indirizzo VERO che Valerio legge. Se manca non
 * si inventa niente: l'email parte senza e la risposta va al mittente,
 * che è il comportamento di prima. Meglio un limite noto di un indirizzo
 * di fantasia.
 */
export const RISPOSTA_A = process.env.RESEND_RISPOSTA_A?.trim() || null;

/* Dove torna la gente che clicca. Vive in lib/sito.ts: lo stesso
   indirizzo serve alle email E ai rimandi delle rotte, e tenerne due
   copie vuol dire che un giorno diranno due cose diverse. */
export { casa } from "@/lib/sito";

export type Esito = { ok: true; id?: string } | { ok: false; motivo: string };

/**
 * Spedisce. Non lancia MAI eccezioni: un'email che non parte non deve far
 * fallire una registrazione. Chi chiama decide se gli interessa l'esito.
 */
export async function spedisci({
  a,
  oggetto,
  html,
  testo,
}: {
  a: string;
  oggetto: string;
  html: string;
  testo: string;
}): Promise<Esito> {
  if (!POSTA_ATTIVA) {
    console.warn(`[posta] RESEND_API_KEY assente: email "${oggetto}" NON spedita a ${a}`);
    return { ok: false, motivo: "Resend non è configurato." };
  }

  try {
    const resend = new Resend(CHIAVE);
    const { data, error } = await resend.emails.send({
      from: MITTENTE,
      to: a,
      ...(RISPOSTA_A ? { replyTo: RISPOSTA_A } : {}),
      subject: oggetto,
      html,
      // La versione solo testo non è un di più: senza, i filtri antispam
      // penalizzano il messaggio e finisci in posta indesiderata.
      text: testo,
    });

    if (error) {
      console.error("[posta] Resend ha rifiutato:", error.message);
      return { ok: false, motivo: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    console.error("[posta] invio fallito:", e);
    return { ok: false, motivo: "Invio fallito." };
  }
}
