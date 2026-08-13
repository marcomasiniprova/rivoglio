import { test, expect } from "@playwright/test";

/**
 * LA BARRA IN CIMA NON SI SOVRAPPONE. MAI.
 *
 * 🔴 Valerio l'ha segnalata TRE VOLTE in due giorni, l'ultima con
 * maiuscole: «smettila di stortare la navbar». Ogni volta era stata
 * "provata" guardandola a una larghezza sola, e ogni volta si rompeva a
 * un'altra.
 *
 * Il difetto vero non era il centraggio: era che una griglia, di suo, ha
 * `min-width: auto` su ogni colonna, cioè "non stringerti sotto il tuo
 * contenuto". Quando la colonna di mezzo cresce oltre lo spazio
 * disponibile non spinge le altre, le invade. E le voci comparivano già
 * a 1024, dove il posto non c'è.
 *
 * Questa prova non guarda: MISURA. Se un domani le tre parti si toccano
 * anche di mezzo pixel a una qualsiasi di queste otto larghezze, la
 * suite si ferma prima che lo veda lui.
 */
const LARGHEZZE = [320, 375, 768, 1024, 1100, 1280, 1440, 1920];

for (const larghezza of LARGHEZZE) {
  test(`la barra regge a ${larghezza} punti`, async ({ page }) => {
    await page.setViewportSize({ width: larghezza, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(300);

    const misure = await page.evaluate(() => {
      const header = document.querySelector("header");
      if (!header) return null;
      const box = (el: Element | null | undefined) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return r.width > 0 ? { x: r.x, fine: r.x + r.width } : null;
      };
      return {
        logo: box(header.firstElementChild),
        voci: box(header.querySelector("nav")),
        bottoni: box(header.lastElementChild),
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    expect(misure, "la barra deve esistere").not.toBeNull();
    const m = misure!;
    expect(m.bottoni, "i bottoni ci sono sempre").not.toBeNull();

    /* La pagina non deve scorrere di lato: a 320 punti (iPhone SE di
       prima generazione, e lo zoom di iOS) è già successo. */
    expect(m.scrollWidth, "scorrimento orizzontale").toBeLessThanOrEqual(larghezza);

    if (m.voci) {
      /* Le tre parti in fila, e nessuna che entra nella successiva. Il
         mezzo pixel di tolleranza è per gli arrotondamenti del browser. */
      expect(m.logo!.fine, "il marchio invade le voci").toBeLessThanOrEqual(m.voci.x + 0.5);
      expect(m.voci.fine, "le voci invadono i bottoni").toBeLessThanOrEqual(m.bottoni!.x + 0.5);
    } else {
      expect(m.logo!.fine, "il marchio invade i bottoni").toBeLessThanOrEqual(m.bottoni!.x + 0.5);
    }
  });
}
