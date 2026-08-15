import { test, expect } from "@playwright/test";
import { classeDaRighe, type RigaSciopero } from "../lib/scioperi/scioperi";

/**
 * IL MOTORE PIÙ FURBO SUGLI SCIOPERI (Valerio, 15/08).
 *
 * Uno sciopero del personale della compagnia stessa NON è circostanza
 * straordinaria (Corte UE, C-28/20): la compensazione spetta. Uno
 * sciopero dei controllori (ATC) o degli addetti a terra (handling) viene
 * da fuori: resta incerto.
 *
 * Il rischio da blindare è il FALSO POSITIVO: uno sciopero esterno
 * scambiato per uno della compagnia direbbe "idoneo" dove non spetta. Per
 * questo "compagnia" deve uscire SOLO quando la colpa è chiaramente e
 * soltanto della compagnia che ha operato il volo.
 */

const R = (tipo: RigaSciopero["tipo"], compagnie: string[] | null): RigaSciopero => ({
  tipo,
  compagnie,
});

test.describe("Classificazione dello sciopero", () => {
  test("personale della compagnia che ha operato: idoneo (compagnia)", () => {
    expect(classeDaRighe([R("personale_compagnia", ["FR"])], "FR")).toBe("compagnia");
  });

  test("controllori di volo: esterno, resta incerto", () => {
    expect(classeDaRighe([R("atc_esterno", ["FR"])], "FR")).toBe("esterno");
  });

  test("addetti a terra (handling): esterno", () => {
    expect(classeDaRighe([R("handling", ["FR"])], "FR")).toBe("esterno");
  });

  test("sciopero generale (nessuna compagnia): esterno, mai compagnia", () => {
    expect(classeDaRighe([R("generale", [])], "FR")).toBe("esterno");
  });

  test("PRUDENZA: compagnia stessa MA anche ATC lo stesso giorno → esterno", () => {
    /* La causa del ritardo non è certa: un falso positivo è vietato, quindi
       vince l'esterno e il caso resta incerto. */
    expect(classeDaRighe([R("personale_compagnia", ["FR"]), R("atc_esterno", [])], "FR")).toBe(
      "esterno",
    );
  });

  test("sciopero di un'ALTRA compagnia: non tocca questo volo (null)", () => {
    expect(classeDaRighe([R("personale_compagnia", ["U2"])], "FR")).toBeNull();
  });

  test("personale_compagnia ma senza compagnie elencate: non si aggancia, prudenza", () => {
    /* Un "personale_compagnia" senza l'elenco delle compagnie non si può
       legare a QUESTO vettore: non diventa mai "compagnia". */
    expect(classeDaRighe([R("personale_compagnia", [])], "FR")).toBe("esterno");
  });

  test("nessuno sciopero: null", () => {
    expect(classeDaRighe([], "FR")).toBeNull();
  });

  test("il confronto sul codice compagnia non guarda le maiuscole", () => {
    expect(classeDaRighe([R("personale_compagnia", ["fr"])], "FR")).toBe("compagnia");
  });
});
