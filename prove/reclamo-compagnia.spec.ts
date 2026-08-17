import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COMPAGNIE_PAGINA,
  compagniaDaSlug,
  slugCompagnia,
} from "../lib/rimborsi/pagine-compagnia";

/**
 * LE PAGINE DI RECLAMO PER COMPAGNIA (GEO/AIO, 17/08).
 *
 * Contenuto costruito dai dati veri di compagnie.ts. Qui si blinda che:
 *  - gli slug siano unici e puliti (due compagnie sullo stesso slug = una
 *    pagina che ne mangia un'altra);
 *  - solo le compagnie col canale VERIFICATO abbiano una pagina;
 *  - l'angolo "manda tu il reclamo" (accettaIntermediari:false) NON venga
 *    promesso a una compagnia dove non è vero: sarebbe un dato inventato.
 */

test.describe("Pagine reclamo per compagnia", () => {
  test("ci sono, con slug unici e puliti", () => {
    expect(COMPAGNIE_PAGINA.length).toBeGreaterThan(20);
    const slugs = COMPAGNIE_PAGINA.map((c) => c.slug);
    expect(new Set(slugs).size, "slug duplicati").toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  test("lo slug gestisce accenti e spazi", () => {
    expect(slugCompagnia("Wizz Air")).toBe("wizz-air");
    expect(slugCompagnia("ITA Airways")).toBe("ita-airways");
    expect(slugCompagnia("Brussels Airlines")).toBe("brussels-airlines");
  });

  test("le grandi del mercato Italia hanno la pagina", () => {
    for (const slug of ["ryanair", "easyjet", "wizz-air", "ita-airways"]) {
      expect(compagniaDaSlug(slug), `manca ${slug}`).not.toBeNull();
    }
  });

  test("solo compagnie col canale verificato", () => {
    for (const c of COMPAGNIE_PAGINA) {
      expect(c.verificato, `${c.nome} non verificata`).toBe(true);
      expect(c.url.startsWith("http"), `${c.nome} senza URL`).toBe(true);
    }
  });

  test("la pagina promette l'angolo diretto SOLO dove è vero", () => {
    // La sezione "Perché conviene mandarlo da solo" nel codice esce solo con
    // accettaIntermediari === false: qui si controlla che quel gate esista,
    // così non si può inventare per una compagnia qualsiasi.
    const pagina = readFileSync(
      join(__dirname, "..", "app/reclamo/[compagnia]/page.tsx"),
      "utf8",
    );
    expect(pagina).toContain("c.accettaIntermediari === false");
    expect(pagina).toContain("soloDiretto");
    // Ryanair è false (lo promette), ITA è null (non lo promette).
    expect(compagniaDaSlug("ryanair")?.accettaIntermediari).toBe(false);
    expect(compagniaDaSlug("ita-airways")?.accettaIntermediari).not.toBe(false);
  });

  test("l'indirizzo /rimborsi resta la pagina legale, non le compagnie", () => {
    // Le pagine per compagnia stanno su /reclamo: /rimborsi è la politica di
    // rimborso del servizio e non deve diventare un [param].
    const legale = readFileSync(join(__dirname, "..", "app/rimborsi/page.tsx"), "utf8");
    expect(legale).toContain("PaginaRimborsi");
  });
});
