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
 * `rivoglio.it` è verificato su Resend, si cambia MITTENTE qui sotto
 * e parte tutto.
 */

const CHIAVE = process.env.RESEND_API_KEY ?? "";

/** Vero solo se possiamo davvero spedire. */
export const POSTA_ATTIVA = Boolean(CHIAVE);

/**
 * Il mittente. `resend.dev` è il dominio di prova di Resend.
 * Quando il dominio è verificato diventa "Rivoglio <ciao@rivoglio.it>".
 */
export const MITTENTE =
  process.env.RESEND_MITTENTE ?? "Rivoglio <onboarding@resend.dev>";

/** Dove torna la gente che clicca. */
export function casa() {
  return (
    process.env.NEXT_PUBLIC_SITO ??
    process.env.URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

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
