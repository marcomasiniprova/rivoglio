import { test, expect } from "@playwright/test";
import { creaBuonoCookie, leggiBuonoCookie } from "../lib/recensioni/buono";

/**
 * IL BUONO ANALISI GRATIS: la ricevuta firmata che apre il cancello del
 * check una volta. Come il pass del pagamento, il cookie è solo la
 * consegna: il permesso vero lo tiene il database. Ma la FIRMA deve
 * reggere, se no chiunque si fabbrica buoni gratis.
 *
 * (In sviluppo il segreto ha un valore di ripiego, quindi la firma si
 * calcola e queste prove girano; in produzione senza segreto non si firma
 * affatto, che è il comportamento voluto.)
 */

test.describe("La firma del buono", () => {
  test("un buono emesso da noi si rilegge e torna il suo id", () => {
    const cookie = creaBuonoCookie("abc-123");
    expect(cookie).not.toBeNull();
    expect(leggiBuonoCookie(cookie)).toBe("abc-123");
  });

  test("un buono con la firma manomessa viene rifiutato", () => {
    const cookie = creaBuonoCookie("abc-123")!;
    const rotto = cookie.slice(0, -3) + "000";
    expect(leggiBuonoCookie(rotto)).toBeNull();
  });

  test("un id cambiato con la vecchia firma non passa", () => {
    const cookie = creaBuonoCookie("abc-123")!;
    const firma = cookie.slice(cookie.lastIndexOf("."));
    expect(leggiBuonoCookie("altro-id" + firma)).toBeNull();
  });

  test("una stringa a caso non è un buono", () => {
    expect(leggiBuonoCookie("qualcosa")).toBeNull();
    expect(leggiBuonoCookie("")).toBeNull();
    expect(leggiBuonoCookie(null)).toBeNull();
  });
});
