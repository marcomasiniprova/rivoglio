import { test, expect } from "@playwright/test";
import fs from "node:fs";

/**
 * Il motore dal vivo, tutto il giro: raccolta -> verifica nel pannello ->
 * abbinamento -> invio. Strumento, non prova: gira con CATTURA=1 e le
 * chiavi nell'ambiente.
 */
const C = "prove/schermate";

test("motore dal vivo", async ({ page, request }, info) => {
  test.setTimeout(240_000);
  fs.mkdirSync(C, { recursive: true });
  const p = (n: string) => `${C}/${info.project.name}-${n}.png`;

  // 1. raccolta
  const r1 = await request.post("/api/motore/raccogli");
  console.log("\n=== RACCOLTA ===\n" + JSON.stringify(await r1.json(), null, 1));

  // 2. dentro come admin
  await page.goto("/entra");
  await page.getByLabel("Email").fill("prova.interna@viaggioancheio.it");
  await page.getByLabel("Password").fill("ProvaInterna2026!");
  await page.getByRole("button", { name: "Entra", exact: true }).click();
  await page.waitForURL(/\/app/, { timeout: 30_000 });

  await page.goto("/admin");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: p("admin-coda"), fullPage: true });

  // 3. verifica ONESTA della prima offerta: si apre il link e si controlla
  //    che la pagina viva e parli di prezzi. Solo allora si attiva.
  const primoLink = await page
    .locator("[data-offerta-link]")
    .first()
    .getAttribute("href")
    .catch(() => null);

  if (primoLink) {
    const finestra = await page.context().newPage();
    let haPrezzo = false;
    try {
      await finestra.goto(primoLink, { timeout: 25_000, waitUntil: "domcontentloaded" });
      const testo = await finestra.locator("body").innerText();
      haPrezzo = /€|euro|EUR/i.test(testo);
      console.log(`\n=== VERIFICA ${primoLink} ===\nprezzo in pagina: ${haPrezzo}\n`);
    } catch (e) {
      console.log(`\n=== VERIFICA FALLITA ${primoLink}: ${String(e).slice(0, 120)}\n`);
    }
    await finestra.close();

    if (haPrezzo) {
      await page.getByRole("button", { name: "Attiva", exact: true }).first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: p("admin-attivata") });
    }
  }

  // 4. abbinamento e invio
  const r2 = await request.post("/api/motore/abbina");
  const esito = await r2.json();
  console.log("\n=== ABBINAMENTO ===\n" + JSON.stringify(esito, null, 1));
  expect(esito.ok).toBe(true);
});
