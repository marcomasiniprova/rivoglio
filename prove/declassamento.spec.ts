import { expect, test } from "@playwright/test";
import { percentualeArt10 } from "../lib/regole/dichiarati";

/**
 * DECLASSAMENTO (art. 10 par. 2 CE 261/2004): ti mettono in una classe
 * più bassa di quella che hai pagato. Non è una fascia fissa: è una
 * percentuale del PREZZO del biglietto, e la percentuale segue la stessa
 * geometria dell'art. 7 (30/50/75 al posto di 250/400/600).
 *
 * Il prezzo lo dà l'utente (il fornitore non sa quanto hai pagato), il
 * resto lo decide il motore deterministico. Qui si blinda il conto.
 */
const VOLO = { volo: "ZZ180", data: "05/08/2026" }; // demo: coperto, 800 km

async function dichiara(
  request: import("@playwright/test").APIRequestContext,
  corpo: Record<string, unknown>,
) {
  const r = await request.post("/api/verifica/dichiara", { data: { ...VOLO, ...corpo } });
  expect(r.ok()).toBeTruthy();
  return r.json();
}

test.describe("Declassamento (art. 10)", () => {
  test("la percentuale segue la geometria dell'art. 7", () => {
    // fino a 1500 km: 30%
    expect(percentualeArt10(800, true)).toBe(30);
    expect(percentualeArt10(1500, false)).toBe(30);
    // da 1500 a 3500 km: 50%
    expect(percentualeArt10(1501, true)).toBe(50);
    expect(percentualeArt10(3500, false)).toBe(50);
    // oltre 3500: 50% se intra-UE (art. 10.2 lett. b), 75% sul resto
    expect(percentualeArt10(6000, true)).toBe(50);
    expect(percentualeArt10(6000, false)).toBe(75);
  });

  test("involontario: il rimborso è la percentuale del prezzo", async ({ request }) => {
    // 800 km → 30%; su 200€ fa 60€.
    const d = await dichiara(request, { caso: "declassamento", volonta: "involontario", prezzo: 200 });
    expect(d.esito).toBe("idoneo");
    expect(d.importo).toBe(60);
  });

  test("il prezzo con la virgola all'italiana si legge lo stesso", async ({ request }) => {
    // "149,90" → 30% ≈ 45 (arrotondato).
    const d = await dichiara(request, {
      caso: "declassamento",
      volonta: "involontario",
      prezzo: "149,90",
    });
    expect(d.esito).toBe("idoneo");
    expect(d.importo).toBe(45);
  });

  test("l'ho scelto io in cambio di qualcosa: non spetta", async ({ request }) => {
    const d = await dichiara(request, { caso: "declassamento", volonta: "volontario", prezzo: 200 });
    expect(d.esito).toBe("non_idoneo");
  });

  test("senza un prezzo valido: rifiutato, non si inventa un importo", async ({ request }) => {
    const r = await request.post("/api/verifica/dichiara", {
      data: { ...VOLO, caso: "declassamento", volonta: "involontario", prezzo: 0 },
    });
    expect(r.status()).toBe(400);
  });
});
