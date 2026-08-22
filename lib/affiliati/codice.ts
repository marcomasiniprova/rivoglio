/**
 * IL CODICE DELL'AFFILIATO, la parte pura.
 *
 * Sta da sola perché la legge anche il middleware (`proxy.ts`), che gira
 * sul runtime Edge: lì non si può toccare il database né importare il
 * client di servizio. Qui dentro solo forma e cookie, niente rete.
 *
 * Un codice fa due mestieri con lo stesso valore: è il pezzo del link
 * (`rivolio.it/?ref=MARCO`) e il codice sconto che il creator detta a voce.
 */

/** Il cookie che ricorda da quale creator è arrivata la persona. */
export const COOKIE_REF = "rivolio_ref";

/** Quanto dura l'attribuzione: 60 giorni dal click (scelta di Valerio). */
export const GIORNI_REF = 60;

/**
 * Un codice valido, normalizzato in MAIUSCOLO, oppure null.
 *
 * La forma è la stessa del vincolo sul database (`^[A-Z0-9]{3,20}$`): così
 * un codice che passa qui passa anche là, e uno che non passa non arriva
 * mai a interrogare il database.
 */
export function codiceAffiliatoValido(grezzo: string | null | undefined): string | null {
  if (!grezzo) return null;
  const c = grezzo.trim().toUpperCase();
  return /^[A-Z0-9]{3,20}$/.test(c) ? c : null;
}
