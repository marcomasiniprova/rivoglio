import { test, expect } from "@playwright/test";
import { estraiCampi, confrontaConVerifica } from "../lib/ocr/carta-imbarco";

/**
 * LA LETTURA DELLA CARTA D'IMBARCO.
 *
 * Le carte d'imbarco vere non scrivono "06/08/2026": scrivono "06AUG".
 * E sono piene di altri codici (gate, posto, sequenza) che assomigliano a
 * un numero di volo. Queste prove sono su testi copiati dalla forma reale
 * di una carta d'imbarco, non su esempi comodi.
 *
 * Regola di casa che vale anche qui: l'OCR trasforma l'immagine in testo,
 * l'estrazione dei campi è a regex e non decide niente. Il verdetto resta
 * del motore.
 */

const ANNO = new Date().getUTCFullYear();

test.describe("Carta d'imbarco Ryanair", () => {
  const testo = `
    RYANAIR BOARDING PASS
    ROSSI/MARIO MR
    BERGAMO (BGY) → LANZAROTE (ACE)
    FLIGHT FR4001   06AUG
    GATE B12   SEAT 14C   SEQ 042
    BOARDING 05:50   DEPARTS 06:20
  `;

  test("prende il volo giusto, non il gate", () => {
    expect(estraiCampi(testo).volo).toBe("FR4001");
  });

  test("legge la data scritta come 06AUG", () => {
    expect(estraiCampi(testo).data).toBe(`${ANNO}-08-06`);
  });

  test("raccoglie gli orari stampati", () => {
    expect(estraiCampi(testo).orari).toContain("06:20");
  });
});

test.describe("Le forme in cui la data è scritta davvero", () => {
  const conData = (t: string) => estraiCampi(`FR4001 ${t}`).data;

  test("06AUG26, con l'anno a due cifre", () => {
    expect(conData("06AUG26")).toBe("2026-08-06");
  });

  test("6 AGO 2026, all'italiana", () => {
    expect(conData("6 AGO 2026")).toBe("2026-08-06");
  });

  test("06/08/2026, il formato di sempre", () => {
    expect(conData("06/08/2026")).toBe("2026-08-06");
  });

  test("2026-08-06, come lo scrive un computer", () => {
    expect(conData("2026-08-06")).toBe("2026-08-06");
  });

  test("senza anno non si va MAI nel futuro: un volo non ancora fatto non si verifica", () => {
    const domani = new Date(Date.now() + 40 * 86_400_000);
    const mesi = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const scritta = `${String(domani.getUTCDate()).padStart(2, "0")}${mesi[domani.getUTCMonth()]}`;
    const letta = conData(scritta);
    expect(letta).not.toBeNull();
    expect(Date.parse(letta!)).toBeLessThan(Date.now());
  });
});

test.describe("I codici che NON sono un volo", () => {
  test("il gate non diventa il volo", () => {
    expect(estraiCampi("GATE B12 SEAT 14C").volo).toBeNull();
  });

  test("il posto non diventa il volo", () => {
    expect(estraiCampi("SEAT 22F POSTO 22F").volo).toBeNull();
  });

  test("fra più codici vince quello di una compagnia che conosciamo", () => {
    expect(estraiCampi("ZZ100 posto A1 volo W6 2201").volo).toBe("W62201");
  });

  test("uno sconosciuto passa lo stesso: meglio un dato da correggere che nessun dato", () => {
    expect(estraiCampi("XY123 del 06/08/2026").volo).toBe("XY123");
  });
});

test.describe("Il confronto non decide, segnala", () => {
  test("documento e dati verificati che combaciano", () => {
    const e = estraiCampi("FR4001 06/08/2026");
    expect(confrontaConVerifica(e, "FR4001", "2026-08-06").esito).toBe("concorde");
  });

  test("un volo diverso manda in conferma umana, non cambia il verdetto", () => {
    const e = estraiCampi("FR4002 06/08/2026");
    const c = confrontaConVerifica(e, "FR4001", "2026-08-06");
    expect(c.esito).toBe("discorde");
    expect(c.dettagli).toContain("verifica umana");
  });

  test("una foto illeggibile non sporca niente", () => {
    expect(confrontaConVerifica(estraiCampi("aaaa bbbb"), "FR4001", "2026-08-06").esito).toBe(
      "illeggibile",
    );
  });
});
