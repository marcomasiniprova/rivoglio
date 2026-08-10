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
    /* La Croazia era l'esempio fino al 10/08; adesso è in tabella, presa
       dal PDF ufficiale. L'esempio diventa la Serbia, che nel Regolamento
       non c'è proprio: la lettera deve dirlo, non pescare un nome a caso. */
    expect(paeseDiScalo("BEG")).toBe("Serbia");
    expect(nebPerPaese("Serbia")).toBeNull();

    const t = istruzioniOrganismo("BEG");
    expect(t.urlPortale).toBe(ELENCO_UFFICIALE_NEB);
    expect(t.premessa).toContain("Serbia");
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

test.describe("Gli enti nazionali, dal PDF ufficiale del 13/07/2026", () => {
  test("i nove che mancavano adesso ci sono (tranne il Liechtenstein, che nel PDF non c'è)", () => {
    for (const paese of [
      "Croatia",
      "Slovenia",
      "Slovakia",
      "Romania",
      "Cyprus",
      "Estonia",
      "Latvia",
      "Lithuania",
    ]) {
      expect(nebPerPaese(paese), `manca ${paese}`).toBeTruthy();
    }
    /* Nel PDF ufficiale il Liechtenstein non compare, né fra gli Stati
       membri né fra i paesi SEE (ci sono solo Islanda e Norvegia). Non
       si inventa: la lettera rimanda all'elenco ufficiale. */
    expect(nebPerPaese("Liechtenstein")).toBeNull();
  });

  test("in quattro paesi l'ente NON è l'aviazione civile, ed è la cosa che ci eravamo persi", () => {
    /* Il PDF ufficiale ha fatto emergere tre errori veri nella tabella
       che avevamo: in Ungheria, Finlandia e Norvegia mandavamo il
       passeggero a un ufficio che i casi individuali non li tratta. */
    expect(nebPerPaese("Hungary")?.nome.toLowerCase()).toContain("kormányhivatala");
    expect(nebPerPaese("Finland")?.nome.toLowerCase()).toContain("kuluttajariitalautakunta");
    expect(nebPerPaese("Norway")?.nome.toLowerCase()).toContain("transportklagenemnda");
    expect(nebPerPaese("Romania")?.nome.toLowerCase()).toContain("consumatorilor");
  });

  test("nessuno di questi manda più all'autorità dell'aviazione sbagliata", () => {
    expect(nebPerPaese("Hungary")?.nome).not.toContain("Közlekedési Hatóság");
    expect(nebPerPaese("Finland")?.sigla).not.toBe("Traficom");
    expect(nebPerPaese("Norway")?.nome).not.toContain("Luftfartstilsynet");
  });

  test("la Svizzera ha il suo ente: adesso la copriamo davvero", () => {
    expect(nebPerPaese("Switzerland")?.sigla).toContain("UFAC");
  });

  test("i paesi presi dal PDF hanno nome e sito", () => {
    /* Per Paesi Bassi, Austria e Malta il PDF stampa solo "Website:
       Dutch, English" come testo del collegamento, non l'indirizzo:
       quelli restano col solo nome, che è comunque la cosa che serve per
       trovarli. Meglio nessun indirizzo che uno inventato. */
    const paesi = [
      "Italy", "Spain", "Germany", "France", "Croatia", "Slovenia", "Slovakia",
      "Romania", "Cyprus", "Estonia", "Latvia", "Lithuania", "Switzerland",
      "Denmark", "Sweden",
    ];
    for (const p of paesi) {
      const neb = nebPerPaese(p)!;
      expect(neb.nome.length, p).toBeGreaterThan(8);
      expect(neb.url, `${p} senza sito`).toBeTruthy();
    }
  });
});
