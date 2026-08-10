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

/**
 * 232 -> "3 h e 52 min" · 45 -> "45 min" · 120 -> "3 h"
 *
 * Mai "3h52": è un formato da tabellone di stazione, e la regola del
 * giro #35 lo vieta in tutto il prodotto. Sul sito lo fa `formattaMinuti`
 * in lib/regole/eu261.ts: se cambia lì, cambia anche qui.
 */
export function durataLunga(minuti: number): string {
  if (!Number.isFinite(minuti) || minuti <= 0) return "";
  const h = Math.floor(minuti / 60);
  const m = Math.round(minuti % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h e ${m} min`;
}

/** "2026-08-14" -> "ven 14 ago" */
export function dataBreve(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  const giorni = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const mesi = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  return `${giorni[d.getDay()]} ${d.getDate()} ${mesi[d.getMonth()]}`;
}
