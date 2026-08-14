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
  corpo: Record<string, string | number>,
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
    /* Dal 14/08 l'invito copre tre casi (rimasto a terra, coincidenza,
       declassamento), quindi il testo è più largo. */
    await expect(
      page.getByText("a te è andata diversamente", { exact: false }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("declassamento involontario: rimborso = quota del prezzo", async ({ request }) => {
    const d = await dichiara(request, { caso: "declassamento", volonta: "involontario", prezzo: 200 });
    expect(d.esito).toBe("idoneo");
    expect(d.importo).toBe(60); // ZZ180: 800 km → 30% di 200
  });

  /* La coincidenza a due tratte (sito, dal 14/08): il motore legge davvero
     il secondo volo. Se non lo trova, non inventa: resta incerto e non fa
     pagare. */
  test("coincidenza a due tratte: se non trovo il secondo volo, resta incerto", async ({ request }) => {
    const d = await dichiara(request, {
      caso: "coincidenza",
      unica: "si",
      ritardoFinale: "oltre4",
      secondoVolo: "AB1234", // non esiste, né demo né archivio
    });
    expect(d.esito).toBe("incerto");
    expect(d.motivo).toContain("numero");
  });

  /* Chi non dà né il volo di coincidenza né la destinazione finale (il
     percorso vecchio dell'app) non può avere un verdetto: si chiede il
     dato invece di indovinare. */
  test("coincidenza senza secondo volo né destinazione: chiede il dato", async ({ request }) => {
    const r = await request.post("/api/verifica/dichiara", {
      data: { ...VOLO, caso: "coincidenza", unica: "si", ritardoFinale: "oltre4" },
    });
    expect(r.status()).toBe(400);
  });

  /* La coppia demo della coincidenza a due tratte (ZZ501 perde ZZ502): serve
     a provarla e a filmarla senza voli veri. Il motore legge i due voli,
     prova la causa e calcola la fascia sul viaggio intero (Bergamo → New
     York, paese terzo certo → 600). */
  test("coincidenza a due tratte demo: ZZ501 perde ZZ502, idoneo 600 sul viaggio", async ({
    request,
  }) => {
    const r = await request.post("/api/verifica/dichiara", {
      data: {
        volo: "ZZ501",
        data: "05/08/2026",
        caso: "coincidenza",
        unica: "si",
        ritardoFinale: "oltre4",
        secondoVolo: "ZZ502",
      },
    });
    expect(r.ok()).toBeTruthy();
    const d = await r.json();
    expect(d.esito).toBe("idoneo");
    expect(d.importo).toBe(600);
  });
});
