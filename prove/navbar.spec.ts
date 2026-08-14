import { test, expect } from "@playwright/test";

/**
 * LA NAVBAR È RAGGIUNGIBILE SU OGNI DISPOSITIVO.
 *
 * 🔴 Le voci (Come funziona, Garanzia, Prezzi, Domande, Il Tabellone)
 * comparivano solo sopra i 1280 punti e sotto sparivano senza nessun menu:
 * su ogni portatile stretto, tablet e telefono metà della mappa del sito
 * era irraggiungibile, e allo zoom al 90% ricomparivano (perché la pagina
 * diventa più larga di 1280). Segnalato da Valerio, 14/08. Adesso sotto i
 * 1280 c'è il menu, sopra le voci sono in linea: in nessun caso spariscono.
 */
test.describe("La navbar su ogni larghezza", () => {
  test("desktop largo: voci in linea, niente hamburger", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(
      page.locator("header nav a", { hasText: "Come funziona" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Apri il menu/ })).toBeHidden();
  });

  test("sotto i 1280: le voci non spariscono, si aprono dal menu", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto("/");
    const apri = page.getByRole("button", { name: /Apri il menu/ });
    await expect(apri).toBeVisible();
    await apri.click();
    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(menu.getByText("Prezzi")).toBeVisible();
    await expect(menu.getByText("Il Tabellone")).toBeVisible();
    await expect(menu.getByText("Entra")).toBeVisible();
  });

  test("telefono: stesso menu, e cliccando una voce si chiude", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    const apri = page.getByRole("button", { name: /Apri il menu/ });
    await expect(apri).toBeVisible();
    await apri.click();
    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(menu.getByText("Domande")).toBeVisible();
    await menu.getByText("Domande").click();
    // dopo il clic il menu si chiude
    await expect(menu).toBeHidden();
  });
});
