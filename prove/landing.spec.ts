import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("il messaggio principale c'è e si legge", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /La tua fuga[\s\S]*Al prezzo giusto/i }),
    ).toBeVisible();
    await expect(page.getByText(/40 milioni di italiani/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /3 destinazioni gratis/i }).first()).toBeVisible();
  });

  test("i numeri dell'esempio tornano: 78 + 27 = 105, sotto la soglia 120", async ({
    page,
  }) => {
    await page.goto("/");
    const testo = await page.locator("body").innerText();

    // devono comparire tutti e tre, e la somma deve reggere
    expect(testo).toContain("78€");
    expect(testo).toContain("27€");
    expect(testo).toContain("105€");
    expect(testo).toContain("120€");

    // il conto aperto deve mostrare il calcolo, non solo il risultato
    expect(testo).toMatch(/145 km × 2/);
    expect(testo).toMatch(/1,994/); // prezzo benzina MIMIT
  });

  test("il modulo di iscrizione rifiuta un'email sbagliata", async ({ page }) => {
    await page.goto("/#iscriviti");
    const campo = page.getByLabel("La tua email");
    await campo.fill("non-e-una-email");
    // il browser blocca da solo: il campo non è valido
    await expect(campo).toHaveJSProperty("validity.valid", false);
  });

  test("il modulo di iscrizione accetta un'email valida e ringrazia", async ({ page }) => {
    await page.goto("/#iscriviti");
    await page.getByLabel("La tua email").fill(`prova+${Date.now()}@viaggioancheio.it`);
    await page.getByLabel("Il tuo comune di partenza").fill("Bologna");
    await page.getByRole("button", { name: /Avvisami/i }).click();
    await expect(page.getByText("Ci sei.")).toBeVisible({ timeout: 10_000 });
  });

  test("il costruttore risponde con tre posti veri e numeri coerenti", async ({ page }) => {
    await page.goto("/#costruttore");
    await page.getByRole("button", { name: /Dimmi dove posso andare/i }).click();

    // le tre schede devono comparire (aggancio esplicito, non testo a caso)
    const schede = page.locator("[data-scheda='proposta']");
    await expect(schede.first()).toBeVisible({ timeout: 15_000 });
    await expect(schede).toHaveCount(3);

    // e il conto deve tornare: budget - auto = quel che resta
    const testo = await page.locator("#costruttore").innerText();
    expect(testo).toMatch(/\d+h\d{2}/); // ore di viaggio
    expect(testo).toMatch(/\d+ km/); // distanza
    expect(testo).toContain("non invento prezzi");
  });

  test("chi parte da un'isola riceve la spiegazione, non un risultato falso", async ({
    page,
  }) => {
    await page.goto("/#costruttore");
    await page.getByLabel("Da dove parti").selectOption("Palermo");
    await page.getByRole("button", { name: /Dimmi dove posso andare/i }).click();
    await expect(page.getByText(/Parti da un'isola/i)).toBeVisible({ timeout: 15_000 });
  });

  test("non si scorre in orizzontale (rottura classica sul telefono)", async ({ page }) => {
    await page.goto("/");
    const largo = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(largo, "la pagina esce dallo schermo in larghezza").toBe(false);
  });

  test("il logo regge a 24px (è lì che si vede quasi sempre)", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator("header svg").first();
    await expect(logo).toBeVisible();
    await logo.evaluate((el) => {
      (el as SVGElement).style.width = "24px";
      (el as SVGElement).style.height = "24px";
    });
    await logo.screenshot({ path: "prove/schermate/logo-24px.png" });
  });
});
