import { test, expect } from "@playwright/test";
import { istruzioniOrganismo } from "../lib/lettera/genera";
import { ELENCO_UFFICIALE_NEB, nebPerPaese } from "../lib/lettera/neb";
import { paeseDiScalo } from "../lib/regole/territorio";

/**
 * L'ORGANISMO NAZIONALE SEGUE L'AEROPORTO DI PARTENZA (art. 16 par. 1).
 *
 * Prima la lettera mandava tutti all'ENAC: chi partiva da Barcellona
 * scriveva all'ufficio sbagliato e perdeva settimane. Queste prove tengono
 * chiusa quella porta, e soprattutto bloccano la cosa che non deve MAI
 * succedere: nominare un ente che non abbiamo verificato.
 */

test.describe("Organismo nazionale per paese di partenza", () => {
  test("da un aeroporto italiano si va all'ENAC", () => {
    const t = istruzioniOrganismo("FCO");
    expect(t.titolo).toContain("ENAC");
    expect(t.urlPortale).toContain("enac.gov.it");
  });

  test("da Barcellona NON si va all'ENAC ma all'ente spagnolo", () => {
    const t = istruzioniOrganismo("BCN");
    expect(t.titolo).toContain("AESA");
    expect(t.premessa).toContain("Spain");
    expect(t.titolo).not.toContain("ENAC");
    expect(t.urlPortale).toContain("seguridadaerea.gob.es");
  });

  test("da Francoforte si va al Luftfahrt-Bundesamt", () => {
    const t = istruzioniOrganismo("FRA");
    expect(t.titolo).toContain("LBA");
    expect(t.urlPortale).toContain("lba.de");
  });

  test("da un paese che non abbiamo in tabella si rimanda all'elenco ufficiale, senza inventare un ufficio", () => {
    /* La Croazia non è in tabella: nessuna fonte verificata. La lettera
       deve dirlo, non pescare un nome a caso. */
    expect(paeseDiScalo("ZAG")).toBe("Croatia");
    expect(nebPerPaese("Croatia")).toBeNull();

    const t = istruzioniOrganismo("ZAG");
    expect(t.urlPortale).toBe(ELENCO_UFFICIALE_NEB);
    expect(t.premessa).toContain("Croatia");
    expect(t.titolo).not.toContain("ENAC");
  });

  test("senza aeroporto di partenza si resta sulla guida italiana, che è la riserva sensata", () => {
    const t = istruzioniOrganismo(null);
    expect(t.titolo).toContain("ENAC");
  });

  test("ogni ente in tabella ha un nome vero e, se ha un indirizzo, è https", () => {
    for (const paese of ["Italy", "Spain", "Germany", "France", "Greece", "Portugal"]) {
      const neb = nebPerPaese(paese);
      expect(neb, `manca il NEB per ${paese}`).not.toBeNull();
      expect(neb!.nome.length).toBeGreaterThan(3);
      if (neb!.url) expect(neb!.url).toMatch(/^https:\/\//);
    }
  });
});
