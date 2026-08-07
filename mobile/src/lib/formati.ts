/**
 * Formati dei numeri mostrati all'utente. Virgola decimale, formato italiano.
 * `toLocaleString("it-IT")` su Hermes (il motore JS di React Native) è
 * disponibile, ma per non dipendere dai dati ICU del dispositivo i formati
 * critici si fanno a mano.
 */

/** 27 -> "27€" · 3.99 con 2 decimali -> "3,99€" */
export function euro(n: number, decimali = 0): string {
  const arrotondato = decimali === 0 ? Math.round(n) : n;
  const [intera, dec] = arrotondato.toFixed(decimali).split(".");
  const conPunti = intera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (dec ? `${conPunti},${dec}` : conPunti) + "€";
}

/** 2.35 -> "2h21". Le ore di viaggio non si mostrano mai in decimali. */
export { oreLeggibili } from "../motore/viaggio";

/** "2026-08-14" -> "ven 14 ago" */
export function dataBreve(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  const giorni = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const mesi = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  return `${giorni[d.getDay()]} ${d.getDate()} ${mesi[d.getMonth()]}`;
}
