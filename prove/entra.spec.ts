import { test, expect } from "@playwright/test";
import { COPY } from "../lib/copy";

/**
 * Prove sull'accesso.
 *
 * Nota: qui NON si prova il login vero, perché senza chiavi non c'è nessun
 * Supabase da interrogare. Si prova tutto il resto, che è la parte che si
 * rompe più spesso: la porta chiusa, il modulo giusto, il telefono.
 *
 * L'area riservata oggi è il tracker delle pratiche (SPEC §7): dalla
 * landing non ci si arriva, il check è pubblico e senza account (SPEC §3).
 */

test.describe("Accesso", () => {
  test("l'area riservata non si apre senza login", async ({ page }) => {
    await page.goto("/app");
    // deve finire sulla pagina di accesso, non mostrare le pratiche
    await expect(page).toHaveURL(/\/entra/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("la pagina di accesso mostra il modulo giusto", async ({ page }) => {
    await page.goto("/entra");
    await expect(page.getByRole("heading", { name: "Bentornato" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entra", exact: true })).toBeVisible();
  });

  test("si passa alla registrazione e il testo cambia", async ({ page }) => {
    await page.goto("/entra");
    await page.getByRole("tab", { name: /Sono nuovo/i }).click();
    await expect(page.getByRole("heading", { name: /Crea il tuo account/i })).toBeVisible();
  });

  test("il link magico toglie la password", async ({ page }) => {
    await page.goto("/entra");
    await page.getByRole("button", { name: /Entra senza password/i }).click();
    await expect(page.getByRole("heading", { name: /Entra senza password/i })).toBeVisible();
    await expect(page.getByLabel("Password")).toHaveCount(0);
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("un'email storta non passa", async ({ page }) => {
    await page.goto("/entra");
    const campo = page.getByLabel("Email");
    await campo.fill("non-e-una-email");
    await expect(campo).toHaveJSProperty("validity.valid", false);
  });

  test("?modo=registrati apre già sulla registrazione", async ({ page }) => {
    await page.goto("/entra?modo=registrati");
    await expect(page.getByRole("heading", { name: /Crea il tuo account/i })).toBeVisible();
  });

  test("niente scorrimento orizzontale sulla pagina di accesso", async ({ page }) => {
    await page.goto("/entra");
    const sfora = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(sfora).toBe(false);
  });

  test("la CTA della barra porta al form del check, non a un login", async ({ page }) => {
    // SPEC §3: il check vive sul web, senza login. L'unica azione della
    // barra è il form volo+data.
    await page.goto("/");
    await page
      .locator("header")
      .getByRole("link", { name: COPY.nav.cta })
      .click();
    await expect(page).toHaveURL(/#controllo/);
    await expect(page.getByLabel(COPY.hero.form.volo.etichetta).first()).toBeVisible();
  });

  test("la landing non ha nessun collegamento all'area riservata", async ({ page }) => {
    // Il funnel non chiede mai un account prima del reveal (SPEC §3):
    // dalla landing non si deve poter arrivare né a /entra né a /app.
    // Le pagine esistono, ma servono a chi ha già una pratica.
    await page.goto("/");
    await expect(page.locator('a[href^="/entra"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/app"]')).toHaveCount(0);
  });
});
