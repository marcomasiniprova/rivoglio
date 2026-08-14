import { test, expect } from "@playwright/test";
import { COPY } from "../lib/copy";
import { apriModoNumero } from "./aiuti";

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
  test("la web app senza login mostra il check libero, non un redirect", async ({
    page,
  }) => {
    // decisione dell'8/08: /app è aperta a tutti, quante analisi si vogliono
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app/);
    await expect(
      page.getByRole("heading", { name: COPY.appOspite.titolo }),
    ).toBeVisible();
    // dall'8/08 il modo predefinito è la tratta: il numero ha il suo selettore
    await apriModoNumero(page);
    await expect(page.getByLabel(COPY.hero.form.volo.etichetta)).toBeVisible();
    await expect(
      page.getByRole("button", { name: COPY.hero.form.bottone }),
    ).toBeVisible();
  });

  test("l'admin resta chiuso senza login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/entra/);
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
    /* ⚠️ L'indirizzo NON prende più il cancelletto (scelta di Valerio,
       11/08: vedi components/AncoreLisce.tsx). Quello che conta non è
       mai stato il testo nella barra degli indirizzi, ma dove finisce
       la persona: quindi si guarda il check, non l'URL. */
    await expect(page).toHaveURL(/\/$/);
    // il check c'è: il selettore dei modi è la sua faccia (tratta predefinita)
    await expect(
      page.getByRole("button", { name: COPY.check.modo.numero, exact: true }).first(),
    ).toBeVisible();
    await expect(page.locator("#controllo")).toBeInViewport();
  });

  test("Entra porta al login, la web app resta nel footer (9/08)", async ({ page }) => {
    /* Il 9/08 Valerio ha chiuso il labirinto: "Entra" in nav va DRITTO
       alla pagina di accesso (href=/entra), niente doppio Entra. La web app
       resta raggiungibile dal footer ("La web app") e dal check.
       Dal 14/08 sotto i 1280 "Entra" vive nel menu a panino (MenuMobile):
       la sostanza è identica (stesso href), cambia solo che su schermo
       stretto prima si apre il menu. La prova segue il dispositivo. */
    await page.goto("/");
    const larghezza = page.viewportSize()?.width ?? 0;
    if (larghezza >= 1280) {
      // Desktop: "Entra" è nella barra, visibile, e punta al login.
      await expect(page.locator('header a[href="/entra"]').first()).toBeVisible();
    } else {
      // Telefono e tablet: "Entra" è nel menu a panino, stesso href.
      await page.getByRole("button", { name: "Apri il menu" }).click();
      await expect(page.locator('#menu-mobile a[href="/entra"]')).toBeVisible();
    }
    await expect(page.locator('footer a[href="/app"]').first()).toHaveCount(1);
  });
});
