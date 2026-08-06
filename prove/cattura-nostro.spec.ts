import { test } from "@playwright/test";

/**
 * Strumento, non prova: cattura il nostro sito a fasce per poterlo guardare.
 *   CATTURA=1 npx playwright test prove/cattura-nostro.spec.ts --project=desktop
 *
 * IMPORTANTE: si scatta UNA FASCIA ALLA VOLTA fermandosi lì e aspettando.
 * Con le animazioni allo scroll, uno screenshot `fullPage` preso dopo una
 * scorsa veloce fotografa le sezioni ancora trasparenti: la pagina sembra
 * vuota anche se è giusta. Ci sono già cascato una volta.
 */
const ALTEZZA = 1400;

test("cattura il nostro sito a fasce", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1440, height: ALTEZZA });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  const totale = await page.evaluate(() => document.documentElement.scrollHeight);
  const n = Math.min(Math.ceil(totale / ALTEZZA), 12);

  for (let i = 0; i < n; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), i * ALTEZZA);
    // tempo perché le animazioni d'ingresso finiscano (0.7s) più margine
    await page.waitForTimeout(1100);
    await page.screenshot({
      path: `prove/nostro/fascia-${String(i + 1).padStart(2, "0")}.png`,
    });
  }
  console.log(`altezza: ${totale}px — ${n} fasce da ${ALTEZZA}px`);
});
