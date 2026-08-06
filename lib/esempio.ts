/**
 * L'esempio mostrato sulla landing page vive QUI, in un posto solo.
 * Il telefono nell'hero e la sezione "il conto aperto" leggono entrambi da qui,
 * così i numeri non possono divergere fra loro.
 *
 * Regola CLAUDE.md #2: niente numeri inventati. Ogni cifra qui sotto è
 * verificabile o dichiarata come stima.
 *
 * - Milano → Genova: ~145 km via A7, ~1h50.
 * - Benzina €1,994/l = media nazionale self service, osservatorio MIMIT
 *   del 06/08/2026. IN PRODUZIONE VA LETTA DALL'OSSERVATORIO, non da qui.
 * - Consumo 15 km/l = utilitaria a benzina, valore prudenziale.
 * - Alloggio €78 = esempio illustrativo, non un'offerta reale.
 */
export const ESEMPIO = {
  partenza: "Milano",
  destinazione: "Genova",
  tipo: "mare",
  notti: 2,
  date: "ven 9 — dom 11 ago",
  persone: 2,
  kmAndata: 145,
  durata: "1h50",
  consumoKmL: 15,
  prezzoBenzina: 1.994,
  pedaggiAR: 16,
  alloggioPersona: 78,
  soglia: 120,
} as const;

const kmTotali = ESEMPIO.kmAndata * 2;
const litri = kmTotali / ESEMPIO.consumoKmL;
const benzina = litri * ESEMPIO.prezzoBenzina;
const autoTotale = benzina + ESEMPIO.pedaggiAR;
const autoPersona = autoTotale / ESEMPIO.persone;
const totalePersona = ESEMPIO.alloggioPersona + autoPersona;

/** Valori derivati: calcolati, mai scritti a mano. */
export const CONTO = {
  kmTotali,
  litri,
  benzina,
  autoTotale,
  autoPersona,
  totalePersona,
  avanzo: ESEMPIO.soglia - totalePersona,
};

/** €27 · €1,99 — formato italiano, virgola decimale. */
export function euro(n: number, decimali = 0) {
  return (
    n.toLocaleString("it-IT", {
      minimumFractionDigits: decimali,
      maximumFractionDigits: decimali,
    }) + "€"
  );
}
