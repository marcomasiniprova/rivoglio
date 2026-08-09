/**
 * Le date scritte come le legge una persona.
 *
 * Sta in un file suo, e non dentro il blog, perché lo usano anche le
 * pagine evento: importarlo da `lib/tabellone/indice` si tirerebbe
 * dietro tutti e dieci gli articoli per formattare un giorno.
 */

const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

const GIORNI = [
  "domenica",
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
];

/** "2026-08-09" → "9 agosto 2026". Mai la data all'americana. */
export function dataInItaliano(iso: string): string {
  const [anno, mese, giorno] = iso.split("-").map(Number);
  if (!anno || !mese || !giorno) return iso;
  return `${giorno} ${MESI[mese - 1]} ${anno}`;
}

/** "2026-08-09" → "9 ago 2026", per le card. */
export function dataCorta(iso: string): string {
  const [anno, mese, giorno] = iso.split("-").map(Number);
  if (!anno || !mese || !giorno) return iso;
  return `${giorno} ${MESI[mese - 1].slice(0, 3)} ${anno}`;
}

/** "2026-08-09" → "domenica 9 agosto". Il giorno della settimana conta:
 *  uno sciopero di lunedì e uno di sabato non sono la stessa cosa. */
export function giornoEData(iso: string): string {
  const [anno, mese, giorno] = iso.split("-").map(Number);
  if (!anno || !mese || !giorno) return iso;
  /* Mezzogiorno UTC: così nessun fuso sposta il giorno di uno. */
  const d = new Date(Date.UTC(anno, mese - 1, giorno, 12));
  return `${GIORNI[d.getUTCDay()]} ${giorno} ${MESI[mese - 1]}`;
}

/** Quanti giorni mancano (negativo = è passato). */
export function giorniDa(iso: string, oggiIso: string): number {
  const a = Date.parse(`${iso}T12:00:00Z`);
  const b = Date.parse(`${oggiIso}T12:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((a - b) / 86_400_000);
}
