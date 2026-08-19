import { test, expect } from "@playwright/test";
import { passoDaMandare, type StatoRecupero } from "../lib/recupero/scelta";
import {
  costruisciRecuperoIdoneo,
  costruisciRecuperoIncerto,
} from "../lib/email/recupero";

/**
 * Il recupero via email tocca UTENTI VERI, quindi le regole che contano
 * vanno blindate: mai a chi ha già la pratica o si è disiscritto, mai due
 * volte lo stesso passo, mai una cifra su un incerto, e sempre il link per
 * disiscriversi.
 */

const ADESSO = new Date("2026-08-19T12:00:00Z");
const giorniFa = (n: number) =>
  new Date(ADESSO.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const base: StatoRecupero = {
  esito: "idoneo",
  email: "mario@example.com",
  creataIl: giorniFa(2),
  recuperoPasso: 0,
  recuperoStop: false,
  haPratica: false,
};

test.describe("Chi e quando riceve un recupero", () => {
  test("idoneo, email, senza pratica, dopo un giorno: primo passo", () => {
    expect(passoDaMandare(base, ADESSO)).toBe(1);
  });

  test("anche l'incerto entra nel recupero (con un altro messaggio)", () => {
    expect(passoDaMandare({ ...base, esito: "incerto" }, ADESSO)).toBe(1);
  });

  test("il secondo passo arriva dal quarto giorno", () => {
    expect(passoDaMandare({ ...base, recuperoPasso: 1, creataIl: giorniFa(5) }, ADESSO)).toBe(2);
    expect(
      passoDaMandare({ ...base, recuperoPasso: 1, creataIl: giorniFa(3) }, ADESSO),
    ).toBeNull();
  });

  test("appena fatto (stesso giorno) non si scrive ancora", () => {
    expect(passoDaMandare({ ...base, creataIl: giorniFa(0) }, ADESSO)).toBeNull();
  });

  test("chi ha già la pratica non è da recuperare", () => {
    expect(passoDaMandare({ ...base, haPratica: true }, ADESSO)).toBeNull();
  });

  test("chi si è disiscritto non riceve più niente", () => {
    expect(passoDaMandare({ ...base, recuperoStop: true }, ADESSO)).toBeNull();
  });

  test("un non idoneo non ha niente da recuperare", () => {
    expect(passoDaMandare({ ...base, esito: "non_idoneo" }, ADESSO)).toBeNull();
  });

  test("finiti i due passi, basta", () => {
    expect(passoDaMandare({ ...base, recuperoPasso: 2 }, ADESSO)).toBeNull();
  });

  test("un check troppo vecchio non si insegue", () => {
    expect(passoDaMandare({ ...base, creataIl: giorniFa(20) }, ADESSO)).toBeNull();
  });

  test("senza email non si manda niente", () => {
    expect(passoDaMandare({ ...base, email: null }, ADESSO)).toBeNull();
  });
});

const STOP = "https://rivolio.it/api/recupero/stop?g=xyz";

test.describe("Le email, e la regola numero uno", () => {
  test("all'idoneo la cifra si dice, e c'è il link per fermarsi", () => {
    const m = costruisciRecuperoIdoneo({
      passo: 1,
      idVerifica: "abc",
      volo: "FR4001",
      tratta: "Bergamo → Lanzarote",
      importo: 600,
      linkStop: STOP,
    });
    expect(m.html).toContain("600€");
    expect(m.html).toContain("ti manca un passaggio");
    expect(m.html).toContain(STOP);
    expect(m.testo).toContain(STOP);
  });

  test("il secondo passo idoneo porta la scadenza onesta (due anni)", () => {
    const m = costruisciRecuperoIdoneo({
      passo: 2,
      idVerifica: "abc",
      volo: "FR4001",
      tratta: null,
      importo: 400,
      linkStop: STOP,
    });
    expect(m.html).toContain("due anni");
    expect(m.html).toContain("400€");
  });

  test("all'incerto NON compare MAI una cifra", () => {
    for (const passo of [1, 2] as const) {
      const m = costruisciRecuperoIncerto({
        passo,
        idVerifica: "abc",
        volo: "FR4001",
        tratta: "Bergamo → Lanzarote",
        linkStop: STOP,
      });
      expect(m.html).not.toContain("€");
      expect(m.testo).not.toContain("€");
      expect(m.html).toContain(STOP);
    }
  });

  test("all'incerto (primo passo) si propone di rifare e la carta d'imbarco", () => {
    const m = costruisciRecuperoIncerto({
      passo: 1,
      idVerifica: "abc",
      volo: "FR4001",
      tratta: null,
      linkStop: STOP,
    });
    expect(m.html).toContain("carta d'imbarco");
    expect(m.html.toLowerCase()).toContain("rifai il controllo");
  });

  test("senza segreto per firmare, niente riga di disiscrizione (non un link rotto)", () => {
    const m = costruisciRecuperoIdoneo({
      passo: 1,
      idVerifica: "abc",
      volo: "FR4001",
      tratta: null,
      importo: 250,
      linkStop: null,
    });
    expect(m.html).not.toContain("Basta un clic");
  });
});
