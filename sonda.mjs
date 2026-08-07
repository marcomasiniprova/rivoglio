import { chromium } from "@playwright/test";

const S =
  "/tmp/claude-0/-home-user-viaggioancheio/84da703a-484b-51df-82ff-b3b625d7c270/scratchpad";

const browser = await chromium.launch();

// desktop: nav + hero in alto, poi footer
const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await d.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await d.waitForTimeout(1200);
await d.screenshot({ path: `${S}/nuovo-nav.png`, clip: { x: 0, y: 0, width: 1440, height: 320 } });
await d.evaluate(async () => {
  const passo = Math.round(window.innerHeight * 0.6);
  for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 180));
  }
  window.scrollTo(0, document.documentElement.scrollHeight);
});
await d.waitForTimeout(2000);
await d.locator("footer").screenshot({ path: `${S}/nuovo-footer-desktop.png` });
await d.close();

// telefono: footer
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await m.evaluate(async () => {
  const passo = Math.round(window.innerHeight * 0.6);
  for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 160));
  }
  window.scrollTo(0, document.documentElement.scrollHeight);
});
await m.waitForTimeout(1800);
await m.locator("footer").screenshot({ path: `${S}/nuovo-footer-telefono.png` });
await m.close();

await browser.close();
console.log("fatto");
