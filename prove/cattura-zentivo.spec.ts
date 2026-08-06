import { test } from "@playwright/test";

/**
 * Non è una prova: è uno strumento di studio.
 * Cattura il template Zentivo a fasce, per poterlo replicare guardandolo
 * invece che immaginandolo. Si lancia a mano:
 *   npx playwright test prove/cattura-zentivo.spec.ts --project=desktop
 */
test("cattura Zentivo a fasce", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://zentivo.framer.website/", { waitUntil: "networkidle" });

  // forza il caricamento pigro scorrendo tutta la pagina
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const altezza = await page.evaluate(() => document.body.scrollHeight);
  const fascia = 1400;
  const n = Math.min(Math.ceil(altezza / fascia), 12);

  for (let i = 0; i < n; i++) {
    // fullPage serve: senza, il ritaglio oltre la prima schermata fallisce
    await page.screenshot({
      path: `prove/zentivo/fascia-${String(i + 1).padStart(2, "0")}.png`,
      fullPage: true,
      clip: { x: 0, y: i * fascia, width: 1440, height: fascia },
    });
  }
  console.log(`altezza pagina: ${altezza}px — catturate ${n} fasce`);
});
