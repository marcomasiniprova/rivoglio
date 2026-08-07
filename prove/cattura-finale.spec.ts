import { test } from "@playwright/test";
import fs from "node:fs";

const C = "prove/schermate";

test("giro finale", async ({ page }, info) => {
  test.setTimeout(150_000);
  fs.mkdirSync(C, { recursive: true });
  const p = (n: string) => `${C}/${info.project.name}-${n}.png`;

  await page.goto("/");
  await page.waitForTimeout(2400);
  await page.screenshot({ path: p("f-hero") });

  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  await page.locator("footer").screenshot({ path: p("f-footer") });

  await page.goto("/entra");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: p("f-entra") });
});
