import { test, expect } from "@playwright/test";
import { valuta, scadenzaStimata, VERSIONE_REGOLE } from "../lib/regole/eu261";
import { CASI_ORO } from "../lib/regole/casi-oro";

/**
 * L'EVAL DEL MOTORE (SPEC §4). La metrica che governa tutto:
 * FALSI POSITIVI = 0. Un caso etichettato non idoneo o incerto che esce
 * "idoneo" è una persona che paga 14,90€ per niente. Se questa prova
 * fallisce, non si pubblica. Punto.
 */

test.describe("Motore EU261 — golden set", () => {
  for (const caso of CASI_ORO) {
    test(caso.nome, () => {
      const v = valuta(caso.fatto);
      expect(v.esito).toBe(caso.atteso.esito);
      if (caso.atteso.esito === "idoneo" && v.esito === "idoneo") {
        expect(v.importo).toBe(caso.atteso.importo);
      }
      expect(v.versioneRegole).toBe(VERSIONE_REGOLE);
    });
  }

  test("FALSI POSITIVI = 0 (soglia bloccante) e precisione IDONEO = 100%", () => {
    let falsiPositivi = 0;
    let idoneiGiusti = 0;
    let idoneiEmessi = 0;

    for (const caso of CASI_ORO) {
      const v = valuta(caso.fatto);
      if (v.esito === "idoneo") {
        idoneiEmessi++;
        if (caso.atteso.esito === "idoneo") idoneiGiusti++;
        else falsiPositivi++;
      }
    }

    expect(falsiPositivi).toBe(0);
    expect(idoneiEmessi).toBeGreaterThan(0);
    expect(idoneiGiusti / idoneiEmessi).toBe(1);
  });

  test("il motivo di un idoneo contiene il dato verificabile", () => {
    const v = valuta(CASI_ORO[0].fatto);
    if (v.esito !== "idoneo") throw new Error("il primo caso d'oro deve essere idoneo");
    expect(v.motivo).toContain("ritardo");
    expect(v.motivo).toContain("€");
  });

  test("la scadenza è una stima dichiarata, con l'avvertenza", () => {
    const ita = scadenzaStimata("2026-07-15", "AZ");
    expect(ita.anni).toBe(2);
    expect(ita.dataStimata).toBe("2028-07-15");
    const estero = scadenzaStimata("2024-08-01", "FR");
    expect(estero.anni).toBe(5);
    expect(estero.dataStimata).toBe("2029-08-01");
    expect(ita.avvertenza.length).toBeGreaterThan(10);
  });
});
