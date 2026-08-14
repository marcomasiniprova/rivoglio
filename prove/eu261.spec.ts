import { test, expect } from "@playwright/test";
import { valuta, scadenzaStimata, VERSIONE_REGOLE } from "../lib/regole/eu261";
import { CASI_ORO } from "../lib/regole/casi-oro";
import { demo, VOLI_DEMO } from "../lib/voli/fornitori/demo";

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

  /* I voli dimostrativi sono l'unica cosa che la gente vede sulla landing
     quando non c'è la chiave del fornitore, e la loro descrizione promette
     un esito preciso. Il 9/08 il fix sull'art. 7 lett. b) li ha zittiti
     senza che nessuno se ne accorgesse: ZZ300 e ZZ600 mostravano 400€
     invece di 300 e 600, perché la loro tratta era tutta dentro l'Unione.
     Questa prova lega la descrizione al verdetto vero. */
  test("ogni volo dimostrativo dimostra davvero quello che dichiara", async () => {
    const attesi: Record<string, { esito: string; importo?: number }> = {
      ZZ250: { esito: "idoneo", importo: 250 },
      ZZ400: { esito: "idoneo", importo: 400 },
      ZZ300: { esito: "idoneo", importo: 300 },
      ZZ600: { esito: "idoneo", importo: 600 },
      ZZ180: { esito: "non_idoneo" },
      ZZ10: { esito: "non_idoneo" },
      ZZ777: { esito: "incerto" },
      ZZ404: { esito: "incerto" },
      /* La coppia della coincidenza a due tratte (14/08): DA SOLI sono tutti
         e due non idonei (ZZ501 ha 40 minuti di ritardo, sotto soglia; ZZ502
         è in orario). La coincidenza persa vale solo leggendoli INSIEME, ed è
         provata in coincidenza-due-tratte.spec.ts, non qui. */
      ZZ501: { esito: "non_idoneo" },
      ZZ502: { esito: "non_idoneo" },
    };
    expect(Object.keys(attesi).sort()).toEqual(VOLI_DEMO.map((v) => v.voloIata).sort());

    for (const sagoma of VOLI_DEMO) {
      const fatto = await demo.cerca(sagoma.voloIata, "2026-07-15");
      expect(fatto, `il volo demo ${sagoma.voloIata} non esiste più`).toBeTruthy();
      const v = valuta(fatto!);
      const atteso = attesi[sagoma.voloIata];
      expect(v.esito, `${sagoma.voloIata}: ${sagoma.copre}`).toBe(atteso.esito);
      if (atteso.importo !== undefined && v.esito === "idoneo") {
        expect(v.importo, `${sagoma.voloIata}: ${sagoma.copre}`).toBe(atteso.importo);
      }
    }
  });

  test("🔴 la scadenza è SEMPRE il termine più corto (2 anni), mai 5", () => {
    /* Cinque anni era il termine spagnolo applicato a chiunque non fosse
       italiano: a un volo soggetto alla legge italiana (2 anni) prometteva
       tre anni di troppo, e chi si fidava perdeva il diritto. Adesso il
       termine è 2 anni per tutti. */
    const ita = scadenzaStimata("2026-07-15", "AZ");
    expect(ita.anni).toBe(2);
    expect(ita.dataStimata).toBe("2028-07-15");
    const estero = scadenzaStimata("2024-08-01", "FR");
    expect(estero.anni).toBe(2);
    expect(estero.dataStimata).toBe("2026-08-01");
    expect(ita.avvertenza.length).toBeGreaterThan(10);
  });
});
