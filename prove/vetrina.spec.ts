import { test, expect } from "@playwright/test";

/**
 * Prove sui pezzi aggiunti per «far vedere il prodotto»: la sezione con la
 * schermata vera dell'app, l'immagine social e il manifest che rende il sito
 * installabile sulla schermata Home.
 */

test.describe("Vetrina", () => {
  test("la sezione «com'è dentro» mostra tre posti calcolati davvero", async ({ page }) => {
    await page.goto("/#dentro");
    await expect(page.getByRole("heading", { name: /Ti faccio vedere lo schermo/i })).toBeVisible();

    const sezione = page.locator("#dentro");
    await expect(sezione.getByText(/Con questi limiti, oggi ci arrivi/i)).toBeVisible();

    // tre proposte, ognuna con ore, costo auto e quanto resta
    const righe = sezione.locator("li", { hasText: /restano/ });
    await expect(righe).toHaveCount(3);

    // i numeri devono essere numeri, non trattini
    const testo = await sezione.innerText();
    expect(testo).toMatch(/auto \d+€/);
    expect(testo).toMatch(/restano \d+€ per dormire/);

    // e non deve promettere prezzi di alloggio che non abbiamo
    expect(testo).toMatch(/non un'offerta/i);
  });

  test("l'immagine social esiste ed è un png della misura giusta", async ({ request }) => {
    const r = await request.get("/opengraph-image");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/png");
    // 1200x630 non pesa mai pochi byte: se pesa poco, è un'immagine vuota
    expect((await r.body()).length).toBeGreaterThan(10_000);
  });

  test("il manifest rende il sito installabile", async ({ request }) => {
    const r = await request.get("/manifest.webmanifest");
    expect(r.status()).toBe(200);
    const m = await r.json();
    expect(m.name).toBe("Viaggio Anche Io");
    // senza standalone si apre dentro il browser e non sembra un'app
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#0a9d5c");
    expect(m.icons.length).toBeGreaterThan(0);
  });

  test("dalla sezione si arriva alla registrazione", async ({ page }) => {
    await page.goto("/#dentro");
    await page.locator("#dentro").getByRole("link", { name: /Provala tu/i }).click();
    await expect(page).toHaveURL(/\/entra/);
  });
});
