import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { apriModoNumero } from "./aiuti";

/**
 * IL GIRO FILMATO DEL COLLAUDO (WEBM).
 *
 * Un video solo, continuo, sul volo demo ZZ250. Mostra le cose fresche del
 * giro #75 che si vedono senza login: la card prezzi col check a 1,99, il
 * muro del check, e il BUONO dell'analisi gratis (recensione -> codice ->
 * incolli al muro -> parte l'analisi; riusi lo stesso codice -> muro).
 *
 * Si lancia:  CATTURA=1 BASE_URL=http://localhost:3000 npx playwright test prove/cattura-collaudo.spec.ts --project=desktop
 * Il video finisce in  video/  quando si chiude il contesto.
 */

const SITO = process.env.BASE_URL ?? "http://localhost:3000";
const OGGI = new Date().toISOString().slice(0, 10);

/** La striscia in fondo: nostra, non del sito. Non copre i bottoni. */
async function didascalia(page: Page, testo: string, esito: boolean | null = null) {
  await page.evaluate(
    ({ t, e }) => {
      let d = document.getElementById("cap-collaudo");
      if (!d) {
        d = document.createElement("div");
        d.id = "cap-collaudo";
        d.style.cssText =
          "position:fixed;left:0;right:0;bottom:0;z-index:99999;background:rgba(5,46,31,.94);" +
          "color:#fff;font:600 15px/1.35 system-ui,sans-serif;padding:12px 16px;text-align:center;" +
          "pointer-events:none;letter-spacing:.01em";
        document.body.appendChild(d);
      }
      const segno =
        e === true
          ? ' <span style="color:#6ee7b7">&#10003;</span>'
          : e === false
            ? ' <span style="color:#fca5a5">&#10007;</span>'
            : "";
      d.innerHTML = t + segno;
    },
    { t: testo, e: esito },
  );
}

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

test("giro filmato: prezzi, muro a 1,99 e il buono dell'analisi gratis", async ({ browser, request }) => {
  test.setTimeout(180_000);

  // ── SETUP: un codice buono vero, guadagnato con una recensione (via API) ──
  const rec = await request.post(`${SITO}/api/recensioni`, {
    data: {
      stelle: 5,
      motivo: "collaudo filmato del buono (test, da cancellare)",
      eventoTipo: "verdetto",
      eventoRif: `VIDEO-BUONO-${Date.now()}`,
    },
  });
  const codice: string = (await rec.json()).codice;
  expect(codice, "la recensione deve emettere un codice RIV-XXXXX").toMatch(/^RIV-[A-Z0-9]{5}$/);

  // ── IL VIDEO ──
  mkdirSync("video", { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: "video", size: { width: 390, height: 844 } },
    locale: "it-IT",
    timezoneId: "Europe/Rome",
  });
  const page = await ctx.newPage();

  try {
    // 1) LA CARD PREZZI: il check costa 1,99, e ha UN SOLO bottone.
    await page.goto(`${SITO}/#prezzi`, { waitUntil: "domcontentloaded" });
    await pausa(1500);
    await didascalia(page, "I prezzi: il check dell'analisi costa 1,99, non piu gratis");
    await page.locator("#prezzi").scrollIntoViewIfNeeded();
    await pausa(2500);
    // un solo bottone nella card del check (dentro #prezzi, verso #controllo)
    const bottoniCheck = await page.locator('#prezzi a[href="#controllo"]').count();
    await didascalia(page, `La card del check ha ${bottoniCheck === 1 ? "un solo" : bottoniCheck + ""} bottone`, bottoniCheck >= 1);
    await pausa(2500);
    await page.screenshot({ path: "video/01-prezzi.png" });

    // 2) IL CHECK: volo demo ZZ250 -> compare il MURO a 1,99.
    await page.goto(`${SITO}/#controllo`, { waitUntil: "domcontentloaded" });
    await pausa(1200);
    await didascalia(page, "Faccio il check del volo ZZ250 (volo dimostrativo)");
    await apriModoNumero(page);
    await page.fill("#sc-volo", "ZZ250");
    await page.fill("#sc-data", OGGI);
    await pausa(1500);
    await page.locator('form:has(#sc-volo) button[type="submit"]').click();
    await didascalia(page, "Aspetto: senza pagare deve comparire il muro");
    // si aspetta il muro, non l'orologio
    const muro = page.getByText("L'analisi del tuo volo", { exact: false });
    await expect(muro).toBeVisible({ timeout: 30_000 });
    const testoMuro = await page.locator("body").innerText();
    const muroA199 = /1,99/.test(testoMuro);
    await didascalia(page, "Il muro chiede 1,99 per sbloccare l'analisi", muroA199);
    await pausa(2500);
    await page.screenshot({ path: "video/02-muro.png" });

    // 3) IL BUONO: incollo il codice della recensione -> parte l'analisi gratis.
    await didascalia(page, "Ma ho un codice della recensione: lo incollo");
    await page.getByRole("button", { name: "Hai un codice della recensione?" }).click();
    await page.fill("#codice-buono", codice);
    await pausa(1500);
    await page.getByRole("button", { name: "Usa il codice" }).click();
    await didascalia(page, "Aspetto: l'analisi parte, il codice sblocca il verdetto");
    // l'analisi (teatro ~16s) poi va al verdetto su /verifica
    await page.waitForURL("**/verifica", { timeout: 40_000 });
    await expect(page.getByText(/idoneo|ti spetta|compensazione/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await didascalia(page, "Verdetto sbloccato col codice: analisi gratis fatta", true);
    await pausa(3000);
    await page.screenshot({ path: "video/03-verdetto.png" });

    // 4) IL RIUSO: lo stesso codice, ora bruciato, deve dare di nuovo il muro.
    await page.goto(`${SITO}/#controllo`, { waitUntil: "domcontentloaded" });
    await pausa(1200);
    await didascalia(page, "Riprovo lo STESSO codice: e' gia' stato speso");
    await apriModoNumero(page);
    await page.fill("#sc-volo", "ZZ250");
    await page.fill("#sc-data", OGGI);
    await page.locator('form:has(#sc-volo) button[type="submit"]').click();
    const muro2 = page.getByText("L'analisi del tuo volo", { exact: false });
    await expect(muro2).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Hai un codice della recensione?" }).click();
    await page.fill("#codice-buono", codice);
    await pausa(1000);
    await page.getByRole("button", { name: "Usa il codice" }).click();
    await didascalia(page, "Aspetto: un codice gia' speso non deve sbloccare niente");
    // resta il muro (il codice bruciato non apre nulla)
    await pausa(6000);
    const ancoraMuro = await page.getByText("L'analisi del tuo volo", { exact: false }).isVisible();
    await didascalia(page, "Codice gia' speso: resta il muro. Il buono e' usa e getta", ancoraMuro);
    await pausa(3000);
    await page.screenshot({ path: "video/04-riuso-muro.png" });

    await didascalia(page, "Fine giro: prezzi 1,99, muro, buono che si brucia una volta sola", true);
    await pausa(2500);
  } finally {
    // il webm si scrive alla chiusura del contesto: sempre, anche se qualcosa e' saltato
    await ctx.close();
  }
});
