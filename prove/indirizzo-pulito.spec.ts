import { test, expect } from "@playwright/test";

/**
 * 🔴 IL GETTONE DI ACCESSO NON RESTA NELLA BARRA DEGLI INDIRIZZI.
 *
 * Trovato col collaudo del 13/08: dopo il pagamento si atterrava su
 * `/pratica/<id>?token_hash=...&type=magiclink&poi=...`. È l'indirizzo
 * che una persona copia e manda a qualcuno, e che resta nella
 * cronologia del browser.
 */

test("i parametri dell'accesso spariscono dall'indirizzo", async ({ page }) => {
  await page.goto("/?token_hash=finto123&type=magiclink&poi=%2Fapp");
  await page.waitForTimeout(1200);
  const url = page.url();
  expect(url).not.toContain("token_hash");
  expect(url).not.toContain("magiclink");
  expect(url).not.toContain("poi=");
});

test("quello che non c'entra con l'accesso resta dov'è", async ({ page }) => {
  /* ⚠️ Non si fa piazza pulita di tutto: `utm_source` serve a capire da
     dove arriva la gente, e cancellarlo qui vorrebbe dire misurare male
     la distribuzione senza che nessuno se ne accorga. */
  await page.goto("/?utm_source=tiktok&token_hash=finto123");
  await page.waitForTimeout(1200);
  const url = page.url();
  expect(url).toContain("utm_source=tiktok");
  expect(url).not.toContain("token_hash");
});
