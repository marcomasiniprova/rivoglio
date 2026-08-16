import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * LA PRATICA NON SI RESETTA, NON PERDE LA MEMORIA, NON MENTE (Valerio, 16/08).
 *
 * «Tutta la pratica a volte ha dei buchi, si resetta, ci sono falle se premi
 * certi bottoni, ha vuoti di memoria.» Erano tre difetti concreti, e queste
 * prove guardano il codice perché ognuno si riapre togliendo una riga:
 * - i reload duri (`window.location.reload`) che sbiancano lo schermo e
 *   saltano in cima: si vivono come «si resetta e ritorni indietro»;
 * - il «pronto» del reclamo che viveva solo nel browser e si perdeva
 *   tornando dalla lettera;
 * - il riassunto del no che spacciava l'etichetta della categoria per le
 *   parole della compagnia.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");
const senzaCommenti = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

test.describe("Lo stato della pratica non salta", () => {
  test("il flusso del rifiuto non ricarica la pagina di forza", () => {
    /* `window.location.reload()` è il reload duro: lampo bianco e salto in
       cima. Nel flusso del rifiuto si rinfresca il server con router, non
       si ricarica la pagina. */
    for (const f of [
      "components/pratica/DichiaraRifiuto.tsx",
      "components/pratica/LeggiRisposta.tsx",
    ]) {
      const c = senzaCommenti(leggi(f));
      expect(c, `${f} ricarica la pagina di forza`).not.toContain("window.location.reload");
    }
    const rifiuto = senzaCommenti(leggi("components/pratica/DichiaraRifiuto.tsx"));
    expect(rifiuto).toContain("router.refresh");
  });

  test("il «pronto» del reclamo si ricorda al ritorno dalla lettera", () => {
    const c = senzaCommenti(leggi("components/pratica/PreparaReclamo.tsx"));
    /* La memoria del «pronto» sta in sessionStorage, per pratica: senza,
       tornando dalla lettera si ricadeva sui passi facoltativi. */
    expect(c).toContain("sessionStorage");
    expect(c).toContain("praticaId");
  });

  test("il riassunto del no non spaccia la categoria per le loro parole", () => {
    /* «Il no che hai registrato: "..."» metteva fra virgolette l'etichetta
       della categoria, non le parole della compagnia: sembrava una
       citazione, e su una risposta diversa sembrava inventata. */
    const c = senzaCommenti(leggi("components/pratica/DichiaraRifiuto.tsx"));
    expect(c).not.toContain("Il no che hai registrato");
  });
});
