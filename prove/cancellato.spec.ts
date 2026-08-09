import { expect, test } from "@playwright/test";

/**
 * IL VOLO CANCELLATO che diventa un verdetto vero.
 *
 * Quello che queste prove difendono è l'articolo 5 del CE 261/2004:
 * avvisato due settimane prima = non spetta, sempre; nessun avviso e
 * nessuna alternativa = spetta; e chi non ricorda resta incerto e NON
 * paga. Se qualcuno un giorno "semplifica" l'albero, qui diventa rosso.
 *
 * Si passa dalla rotta, non dalla funzione: è la rotta che il browser
 * chiama davvero, ed è lì che deve valere la regola.
 */
const VOLO = { volo: "ZZ777", data: "05/08/2026" }; // demo: risulta cancellato

async function chiedi(
  request: import("@playwright/test").APIRequestContext,
  preavviso: string,
  alternativa: string,
) {
  const r = await request.post("/api/verifica/cancellato", {
    data: { ...VOLO, preavviso, alternativa },
  });
  expect(r.ok()).toBeTruthy();
  return r.json();
}

test.describe("Volo cancellato: le due domande", () => {
  test("avvisato oltre due settimane prima: non spetta, e lo dice", async ({ request }) => {
    const d = await chiedi(request, "oltre14", "nessuna");
    expect(d.esito).toBe("non_idoneo");
    expect(d.motivo).toContain("due settimane");
  });

  test("nessun avviso e nessuna alternativa: spetta, con la sua fascia", async ({ request }) => {
    const d = await chiedi(request, "nessuno", "nessuna");
    expect(d.esito).toBe("idoneo");
    // 1100 km sul volo demo: prima fascia
    expect(d.importo).toBe(250);
  });

  test("avvisato fra 7 e 13 giorni ma riprotetto entro 4 ore: non spetta", async ({ request }) => {
    const d = await chiedi(request, "fra7e13", "fra2e4");
    expect(d.esito).toBe("non_idoneo");
  });

  test("avvisato meno di 7 giorni e riprotetto fra 2 e 4 ore: spetta", async ({ request }) => {
    /* Sotto i 7 giorni il limite è 2 ore, non 4: la stessa alternativa
       che salva la compagnia nel caso sopra qui non la salva. */
    const d = await chiedi(request, "meno7", "fra2e4");
    expect(d.esito).toBe("idoneo");
  });

  test("chi non ricorda resta incerto e non paga", async ({ request }) => {
    const a = await chiedi(request, "nonRicordo", "nessuna");
    expect(a.esito).toBe("incerto");
    const b = await chiedi(request, "meno7", "nonRicordo");
    expect(b.esito).toBe("incerto");
  });

  test("risposte inventate vengono rifiutate", async ({ request }) => {
    const r = await request.post("/api/verifica/cancellato", {
      data: { ...VOLO, preavviso: "quandoMiPare", alternativa: "boh" },
    });
    expect(r.status()).toBe(400);
  });

  test("le domande compaiono sulla pagina del verdetto", async ({ page }) => {
    await page.goto("/verifica/demo-ZZ777-2026-08-05");
    await expect(page.getByText("Due domande e ti dico se ti spetta.")).toBeVisible({
      timeout: 15_000,
    });
  });
});
