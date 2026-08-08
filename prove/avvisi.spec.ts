import { test, expect } from "@playwright/test";
import { ritardoInParole, testoAvviso, tokenValido } from "../lib/notifiche/push";

/**
 * IL TESTO DELLE NOTIFICHE.
 *
 * Regola dettata da Valerio l'8/08, parole sue: "quella roba la capisce un
 * pilota". Quindi qui si prova esattamente questo: che nella notifica ci
 * sia la TRATTA e non il codice del volo, che il ritardo sia scritto in
 * ore e minuti, e che non ci sia mai una promessa.
 */

test.describe("Il testo dell'avviso", () => {
  const volo = {
    da: "Bergamo",
    a: "Lanzarote",
    voloIata: "FR4001",
    esito: "idoneo",
    importo: 250,
    ritardoMinuti: 195,
  };

  test("il titolo è la tratta, non il numero di volo", () => {
    const t = testoAvviso(volo)!;
    expect(t.titolo).toBe("Bergamo → Lanzarote");
    expect(t.titolo).not.toContain("FR4001");
  });

  test("il ritardo è in ore e minuti, non in minuti secchi", () => {
    const t = testoAvviso(volo)!;
    expect(t.corpo).toContain("3 ore e 15 minuti");
    expect(t.corpo).not.toContain("195");
  });

  test("dice la fascia, mai 'hai diritto a'", () => {
    const t = testoAvviso(volo)!;
    expect(t.corpo).toContain("250€");
    expect(t.corpo.toLowerCase()).not.toContain("hai diritto");
    expect(t.corpo.toLowerCase()).not.toContain("ti spettano");
  });

  test("il numero di volo non compare da nessuna parte", () => {
    const t = testoAvviso(volo)!;
    expect(`${t.titolo} ${t.corpo}`).not.toContain("FR4001");
  });

  test("senza tratta si ripiega sul codice, che è meglio di niente", () => {
    const t = testoAvviso({ ...volo, da: null, a: null })!;
    expect(t.titolo).toBe("FR4001");
  });

  test("un caso non idoneo NON fa vibrare il telefono", () => {
    expect(testoAvviso({ ...volo, esito: "non_idoneo", importo: null })).toBeNull();
  });

  test("un caso incerto NON fa vibrare il telefono", () => {
    expect(testoAvviso({ ...volo, esito: "incerto", importo: null })).toBeNull();
  });

  test("idoneo senza importo non manda niente: mai un numero vuoto", () => {
    expect(testoAvviso({ ...volo, importo: null })).toBeNull();
  });
});

test.describe("Ritardo in parole", () => {
  test("sotto l'ora si dicono solo i minuti", () => {
    expect(ritardoInParole(45)).toBe("45 minuti");
  });

  test("un'ora tonda si dice al singolare", () => {
    expect(ritardoInParole(60)).toBe("un'ora");
  });

  test("due ore tonde non hanno il 'e 0 minuti'", () => {
    expect(ritardoInParole(120)).toBe("2 ore");
  });

  test("tre ore e un quarto", () => {
    expect(ritardoInParole(195)).toBe("3 ore e 15 minuti");
  });
});

test.describe("Token del telefono", () => {
  test("accetta le due forme che usa Expo", () => {
    expect(tokenValido("ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]")).toBe(true);
    expect(tokenValido("ExpoPushToken[yyyyyyyyyyyyyyyyyyyyyy]")).toBe(true);
  });

  test("rifiuta tutto il resto: mai mandare una push a un token inventato", () => {
    expect(tokenValido(null)).toBe(false);
    expect(tokenValido("")).toBe(false);
    expect(tokenValido("abc123")).toBe(false);
    expect(tokenValido("ExponentPushToken")).toBe(false);
  });
});
