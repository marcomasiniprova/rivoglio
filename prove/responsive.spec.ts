import { test, expect } from "@playwright/test";

/**
 * IDENTICO SU OGNI DISPOSITIVO (richiesta di Valerio, 14/08: «da desktop e
 * da mobile non deve cambiare un cazzo, niente spappolamenti di testo, niente
 * bottoni che sbordano»).
 *
 * Questo giro passa le superfici pubbliche a tre larghezze vere (telefono
 * 375, tablet 768, desktop 1440) e pretende due cose su tutte:
 *  1. la pagina NON scorre in orizzontale (il segno numero uno dello
 *     spappolamento e del bottone che sborda);
 *  2. niente errori veri in console (i rumori della sandbox che non
 *     raggiunge Supabase si filtrano: non sono difetti del prodotto).
 *
 * Non serve a fare le pulci al pixel: serve a garantire che nessuna vista si
 * rompa passando da un dispositivo all'altro, che è la condizione per girare
 * il video del prossimo giro su tutte e due.
 */

const PAGINE = [
  "/",
  "/app",
  "/mobilita-ridotta",
  "/tabellone",
  "/giudice-di-pace",
  "/guida-bagagli",
  "/sciopero-aerei",
  "/verifica/demo-ZZ250-2026-08-06",
];

const LARGHEZZE = [375, 768, 1440];

/** Rumori noti della sandbox (egress verso Supabase chiuso): non sono bug.
    ⚠️ Gli errori di idratazione NON si filtrano: quelli sono difetti veri. */
function rumore(testo: string): boolean {
  const t = testo.toLowerCase();
  return (
    t.includes("supabase") ||
    t.includes("allowlist") ||
    t.includes("host not in") ||
    t.includes("favicon") ||
    t.includes("failed to load resource")
  );
}

for (const url of PAGINE) {
  for (const larghezza of LARGHEZZE) {
    test(`${url} a ${larghezza}px: niente scroll orizzontale né errori veri`, async ({ page }) => {
      const errori: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !rumore(m.text())) errori.push(m.text());
      });
      page.on("pageerror", (e) => {
        if (!rumore(String(e))) errori.push(String(e));
      });

      await page.setViewportSize({ width: larghezza, height: 900 });
      await page.goto(url, { waitUntil: "domcontentloaded" });
      // un attimo per l'idratazione e le entrate in scena
      await page.waitForTimeout(700);

      const sfora = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(sfora, `scroll orizzontale su ${url} a ${larghezza}px`).toBe(false);

      expect(errori, `errori console su ${url} a ${larghezza}px: ${errori.join(" | ")}`).toEqual([]);
    });
  }
}
