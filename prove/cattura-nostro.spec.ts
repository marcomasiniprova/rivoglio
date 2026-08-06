import { test } from "@playwright/test";

/**
 * Strumento, non prova: cattura il NOSTRO sito a fasce per guardarlo.
 *   npx playwright test prove/cattura-nostro.spec.ts --project=desktop
 */
test("cattura il nostro sito a fasce", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);

  const h = await page.evaluate(() => document.body.scrollHeight);
  const fascia = 1400;
  const n = Math.min(Math.ceil(h / fascia), 12);
  for (let i = 0; i < n; i++) {
    await page.screenshot({
      path: `prove/nostro/fascia-${String(i + 1).padStart(2, "0")}.png`,
      fullPage: true,
      clip: { x: 0, y: i * fascia, width: 1440, height: fascia },
    });
  }
  console.log(`altezza: ${h}px — ${n} fasce`);
});
