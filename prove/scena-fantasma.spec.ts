import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

/**
 * LA PAGINA FANTASMA CHE NON DEVE PIÙ TORNARE (Valerio, 15/08 su ZZ777).
 *
 * La scena dell'analisi è un velo che si mostra AL MASSIMO UNA VOLTA per
 * pagina. Il difetto: arrivando dal check la scena è già andata all'hero,
 * quindi si salta, MA senza segnare la pagina come "vista". Poi si
 * dichiara un volo cancellato, la pagina si RICARICA per rileggere il
 * verdetto vero, e al secondo giro la scena ripartiva per un attimo prima
 * del verdetto: la "pagina fantasma".
 *
 * La regola che chiude il buco: ogni ramo che SALTA la scena deve prima
 * segnare la pagina come vista, così un ricaricamento non la fa ripartire.
 * Questa prova legge il sorgente e pretende che il `return` del salto sia
 * preceduto dal segno "vista".
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("La scena dell'analisi non riparte al ricaricamento", () => {
  test("il ramo che salta la scena segna comunque la pagina come vista", () => {
    const testo = leggi("components/verifica/Risultato.tsx");
    /* Il blocco che decide di NON mostrare la scena. Deve contenere il
       segno "vista" PRIMA del return, se no il ricaricamento la fa
       ripartire (era il bug di ZZ777). */
    const i = testo.indexOf("if (dalCheck || fermo || giaVista || dati.avvisoCheckout)");
    expect(i, "manca il ramo che salta la scena").toBeGreaterThan(0);
    const blocco = testo.slice(i, i + 1200);
    expect(
      blocco,
      "il ramo che salta la scena deve segnare la pagina come vista, se no si riapre la pagina fantasma",
    ).toContain("sessionStorage.setItem(gia,");
  });
});
