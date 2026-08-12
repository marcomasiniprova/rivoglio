import { test, expect } from "@playwright/test";
import { NODI, ZONE, FILI } from "../lib/admin/mappa";
import { CASI_ORO } from "../lib/regole/casi-oro";
import { VERSIONE_REGOLE } from "../lib/regole/eu261";

/**
 * LA MAPPA DEL BUSINESS NON PUÒ DIRE NUMERI CHE NON SONO VERI.
 *
 * Il difetto che ha fatto nascere questo file: sulla card del motore
 * c'era scritto «provate su 58 casi», e i casi erano 53. Nessuno stava
 * mentendo: il numero era stato copiato da un giro precedente e da lì in
 * poi si era fossilizzato, mentre il golden set cambiava sotto.
 *
 * È il difetto più insidioso di una pagina scritta a mano, perché non si
 * rompe niente: la card continua a essere bella e a dire una cosa falsa.
 * Qui si lega la riga alla fonte vera, così a rompersi è la suite.
 */
test.describe("La mappa del business", () => {
  const motore = NODI.find((n) => n.id === "motore");

  test("la card del motore dichiara i casi d'oro VERI", () => {
    expect(motore, "il nodo del motore deve esistere").toBeTruthy();
    const quanti = CASI_ORO.length;
    expect(
      motore!.dentro,
      `la mappa deve dire ${quanti} casi, quanti ne ha davvero il golden set`,
    ).toContain(`${quanti} casi`);
  });

  test("la card del motore dichiara la versione VERA delle regole", () => {
    expect(motore!.dentro, `la mappa deve dire la versione ${VERSIONE_REGOLE}`).toContain(
      VERSIONE_REGOLE,
    );
  });

  test("ogni filo collega due nodi che esistono davvero", () => {
    const ids = new Set(NODI.map((n) => n.id));
    for (const f of FILI) {
      expect(ids.has(f.da), `il filo parte da "${f.da}", che non è un nodo`).toBe(true);
      expect(ids.has(f.a), `il filo arriva a "${f.a}", che non è un nodo`).toBe(true);
    }
  });

  test("ogni nodo sta in una zona che esiste", () => {
    const zone = new Set(ZONE.map((z) => z.chiave));
    for (const n of NODI) {
      expect(zone.has(n.zona), `il nodo "${n.id}" sta nella zona "${n.zona}", che non esiste`).toBe(
        true,
      );
    }
  });

  test("nessun nodo ha lo stesso id di un altro", () => {
    const visti = new Set<string>();
    for (const n of NODI) {
      expect(visti.has(n.id), `l'id "${n.id}" è usato due volte`).toBe(false);
      visti.add(n.id);
    }
  });
});
