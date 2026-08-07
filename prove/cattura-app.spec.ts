import { test, expect } from "@playwright/test";
import fs from "node:fs";

/**
 * Strumento per GUARDARE l'app, non una prova.
 * Fuori dal giro normale: si lancia con CATTURA=1 e con le chiavi Supabase
 * nell'ambiente. Crea un account finto, imposta la partenza, crea una
 * ricerca e fotografa ogni passaggio.
 *
 *   CATTURA=1 NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
 *     npx playwright test prove/cattura-app.spec.ts --project=desktop
 */

const CARTELLA = "prove/schermate";

test.describe.configure({ mode: "serial" });

/** La sezione «com'è dentro» sulla landing. */
test("com'e' dentro", async ({ page }, info) => {
  fs.mkdirSync(CARTELLA, { recursive: true });
  await page.goto("/#dentro");
  // le sezioni entrano con lo scroll: se scatti subito fotografi il vuoto
  await page.waitForTimeout(1600);
  await page
    .locator("#dentro")
    .screenshot({ path: `${CARTELLA}/${info.project.name}-dentro.png` });
});

/** Solo la porta: funziona anche senza chiavi Supabase. */
test("la porta", async ({ page }, info) => {
  fs.mkdirSync(CARTELLA, { recursive: true });
  const p = (nome: string) => `${CARTELLA}/${info.project.name}-${nome}.png`;

  await page.goto("/entra");
  await page.waitForTimeout(800);
  await page.screenshot({ path: p("porta-accedi") });

  await page.getByRole("tab", { name: /Sono nuovo/i }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: p("porta-registrati") });
});

test("giro completo: registrazione, partenza, ricerca", async ({ page }, info) => {
  test.setTimeout(120_000);
  fs.mkdirSync(CARTELLA, { recursive: true });
  const p = (nome: string) => `${CARTELLA}/${info.project.name}-${nome}.png`;

  /* Supabase rifiuta ogni dominio senza record MX: example.com,
     rivoglio.it e qualsiasi dominio inventato vengono respinti con
     "Email address is invalid". Serve un dominio con posta vera. */
  const email = `rivoglio.prova.${Date.now()}@gmail.com`;

  // 1. la porta
  await page.goto("/entra?modo=registrati");
  await page.waitForTimeout(700);
  await page.screenshot({ path: p("1-entra") });

  // 2. registrazione
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("provaProva2026!");
  await page.getByRole("button", { name: /Crea account/i }).click();

  await page.waitForURL(/\/app/, { timeout: 30_000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: p("2-app-vuota") });

  // 3. da dove parti
  await page.selectOption("#comune", "Bologna");
  await page.getByRole("button", { name: "Salva" }).click();
  await expect(page.getByText(/Parti da Bologna/i).first()).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: p("3-partenza") });

  // 4. la ricerca
  await page.getByRole("button", { name: /Mare/i }).click();
  await page.getByRole("button", { name: /Attiva la ricerca/i }).click();
  await expect(page.getByText(/In ascolto/i).first()).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: p("4-ricerca-attiva"), fullPage: true });

  // quello che si vede deve essere vero: tre posti con i conti
  const testo = await page.locator("body").innerText();
  console.log("\n=== COSA VEDE L'UTENTE ===\n" + testo + "\n=========================\n");
});
