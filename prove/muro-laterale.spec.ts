import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * IL MURO DEVE REGGERE ANCHE SULLE PORTE LATERALI.
 *
 * L'ispezione del 12/08 ha trovato due modi di aggirarlo, tutti e due
 * confermati da tre scettici su tre:
 *
 * 1. IL COOKIE SI COPIA. `passDi` guarda solo che la ricevuta sia firmata
 *    e non scaduta, e il credito residuo lo porta il cookie stesso, cioè
 *    un valore che sta nel browser dell'utente. Bastava copiarlo prima di
 *    usare l'analisi e rimetterlo dopo per avere trenta giorni di letture
 *    della carta d'imbarco (che paghiamo a chiamata) e di orari di
 *    atterraggio veri, cioè la cosa che il muro esiste per far pagare.
 *
 * 2. L'IDENTIFICATIVO ERA UNA CHIAVE UNIVERSALE. Il cancello delle rotte
 *    laterali controllava solo che quella riga esistesse: non di chi
 *    fosse, non di che volo parlasse. Uno solo (anche di un altro, visto
 *    che le pagine del verdetto si condividono) dava verdetti a pagamento
 *    su QUALUNQUE volo, all'infinito.
 *
 * Queste prove guardano il codice, non il comportamento: i due difetti si
 * riaprono togliendo una riga, e una riga tolta non si vede.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("Il muro, anche di lato", () => {
  test("le porte laterali chiedono al REGISTRO, non al cookie", () => {
    for (const file of ["app/api/leggi-carta/route.ts", "app/api/voli-tratta/route.ts"]) {
      const testo = leggi(file);
      expect(testo, `${file} deve usare passUsabile, che consulta il registro`).toContain(
        "passUsabile",
      );
      /* `passDi` da solo guarda il cookie e basta: su queste due porte
         non deve più comparire. */
      expect(testo, `${file} non deve fidarsi del solo cookie`).not.toMatch(/\bpassDi\s*\(/);
    }
  });

  test("passUsabile esiste e passa dal registro", () => {
    const testo = leggi("lib/check/cancello.ts");
    expect(testo).toContain("export async function passUsabile");
    /* La riga che conta: senza `creditoFinito` qui dentro, `passUsabile`
       sarebbe `passDi` con un nome più lungo. */
    const dentro = testo.slice(testo.indexOf("export async function passUsabile"));
    expect(dentro.slice(0, 400), "passUsabile deve interrogare creditoFinito").toContain(
      "creditoFinito",
    );
  });

  test("il cancello del seguito controlla il VOLO, non solo che la riga esista", () => {
    const testo = leggi("lib/check/cancello.ts");
    const dentro = testo.slice(testo.indexOf("export async function cancelloDelSeguito"));
    expect(dentro.slice(0, 2000), "deve confrontare volo e data, non la sola esistenza").toContain(
      "verificaCoerente",
    );
  });

  test("tutte e tre le rotte laterali passano il volo al cancello", () => {
    for (const file of [
      "app/api/verifica/dichiara/route.ts",
      "app/api/verifica/cancellato/route.ts",
      "app/api/verifica/operativo/route.ts",
    ]) {
      const testo = leggi(file);
      const i = testo.indexOf("cancelloDelSeguito(");
      expect(i, `${file} deve chiamare il cancello`).toBeGreaterThan(-1);
      const chiamata = testo.slice(i, i + 400);
      expect(chiamata, `${file} deve passare il volo, se no il cancello resta chiuso`).toContain(
        "voloIata",
      );
      expect(chiamata).toContain("dataLocale");
    }
  });
});
