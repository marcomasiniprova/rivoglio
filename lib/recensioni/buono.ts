/**
 * IL CODICE DELL'ANALISI GRATIS: usa e getta, guadagnato con una recensione.
 *
 * ⚠️ NON è più un cookie, e il motivo è un buco vero (Valerio, 15/08:
 * «faccio analisi gratis quanto voglio»). Il cookie era fragile (a volte
 * non arrivava, e il muro compariva su un buono valido) E riusabile (un
 * verdetto "incerto" non lo spendeva, quindi restava vivo all'infinito).
 *
 * Adesso è un CODICE che la persona vede e incolla al muro. A decidere se
 * vale è SEMPRE il registro nel database (`buoni_analisi`, colonna
 * `usato_il`): il codice si brucia al primo uso e riusarlo è impossibile.
 * Niente cookie, niente localStorage, niente da copiare.
 */
import { randomBytes } from "node:crypto";

/* Alfabeto senza caratteri ambigui (niente 0/O/1/I/L): un codice si legge e
   si detta a voce senza sbagliare. */
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Un codice tipo "RIV-7K2P9": prefisso più cinque caratteri (~28 milioni). */
export function generaCodice(): string {
  const b = randomBytes(5);
  let s = "";
  for (let i = 0; i < 5; i++) s += ALFABETO[b[i] % ALFABETO.length];
  return `RIV-${s}`;
}

/** Ripulisce quello che l'utente incolla: maiuscolo, via gli spazi. */
export function normalizzaCodice(grezzo: string): string {
  return grezzo.trim().toUpperCase().replace(/\s+/g, "");
}

/** Vero se ha la forma di un nostro codice: non tocca il database. */
export function formaCodiceValida(codice: string): boolean {
  return /^RIV-[A-Z0-9]{5}$/.test(codice);
}
