import { expect, test } from "@playwright/test";

/**
 * NEGATO IMBARCO e COINCIDENZA PERSA: i casi dichiarati.
 *
 * Le regole difese qui: chi cede il posto per benefici non prende la
 * compensazione (art. 4.1); chi viene lasciato a terra contro la sua
 * volontà, in orario e con prenotazione, la prende SUBITO, per la
 * distanza del volo negato; biglietti separati = niente coincidenza;
 * chi non sa resta incerto e non paga.
 */
const VOLO = { volo: "ZZ180", data: "05/08/2026" }; // demo: atterrato, 800 km

async function dichiara(
  request: import("@playwright/test").APIRequestContext,
  corpo: Record<string, string>,
) {
  const r = await request.post("/api/verifica/dichiara", { data: { ...VOLO, ...corpo } });
  expect(r.ok()).toBeTruthy();
  return r.json();
}

test.describe("Casi dichiarati", () => {
  test("negato involontario, in orario: spetta subito, fascia del volo", async ({ request }) => {
    const d = await dichiara(request, { caso: "negato", presenza: "inOrario", volonta: "involontario" });
    expect(d.esito).toBe("idoneo");
    expect(d.importo).toBe(250);
  });

  test("posto ceduto volontariamente: non spetta", async ({ request }) => {
    const d = await dichiara(request, { caso: "negato", presenza: "inOrario", volonta: "volontario" });
    expect(d.esito).toBe("non_idoneo");
  });

  test("arrivato tardi al gate: non spetta", async ({ request }) => {
    const d = await dichiara(request, { caso: "negato", presenza: "tardi", volonta: "involontario" });
    expect(d.esito).toBe("non_idoneo");
  });

  test("coincidenza su biglietti separati: non spetta, e si spiega", async ({ request }) => {
    const d = await dichiara(request, {
      caso: "coincidenza",
      unica: "no",
      ritardoFinale: "oltre4",
      destinazioneFinale: "FCO",
    });
    expect(d.esito).toBe("non_idoneo");
    expect(d.motivo).toContain("separati");
  });

  test("chi non sa se era un'unica prenotazione resta incerto", async ({ request }) => {
    const d = await dichiara(request, {
      caso: "coincidenza",
      unica: "nonSo",
      ritardoFinale: "oltre4",
      destinazioneFinale: "FCO",
    });
    expect(d.esito).toBe("incerto");
  });

  test("caso inventato: rifiutato", async ({ request }) => {
    const r = await request.post("/api/verifica/dichiara", {
      data: { ...VOLO, caso: "alieni", presenza: "inOrario", volonta: "involontario" },
    });
    expect(r.status()).toBe(400);
  });

  test("l'invito compare sotto un verdetto non idoneo", async ({ page }) => {
    await page.goto("/verifica/demo-ZZ180-2026-08-05");
    await expect(
      page.getByText("Ti hanno lasciato a terra o hai perso una coincidenza?"),
    ).toBeVisible({ timeout: 15_000 });
  });
});
