/**
 * La data del check: dal modo in cui la scrive una persona ("06/08/2026")
 * al modo in cui la vuole il server ("2026-08-06").
 *
 * Vive qui e non dentro la schermata perché è l'unico punto in cui un
 * testo diventa un dato: va provato da solo (vedi __tests__/data.test.ts).
 */

/** "06/08/2026" → "2026-08-06". Null se la data non ha senso. */
export function dataIso(scritta: string): string | null {
  const p = scritta.trim().match(/^([0-3]?\d)[/.-]([01]?\d)[/.-](\d{4})$/);
  if (!p) return null;
  const giorno = Number(p[1]);
  const mese = Number(p[2]);
  const anno = Number(p[3]);
  if (giorno < 1 || giorno > 31 || mese < 1 || mese > 12) return null;
  return `${anno}-${String(mese).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;
}

/** Mette le barre mentre si scrive: 06082026 diventa 06/08/2026. */
export function conBarre(grezzo: string): string {
  const cifre = grezzo.replace(/\D/g, "").slice(0, 8);
  if (cifre.length <= 2) return cifre;
  if (cifre.length <= 4) return `${cifre.slice(0, 2)}/${cifre.slice(2)}`;
  return `${cifre.slice(0, 2)}/${cifre.slice(2, 4)}/${cifre.slice(4)}`;
}
