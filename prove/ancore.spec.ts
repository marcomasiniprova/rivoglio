import { expect, test } from "@playwright/test";

/**
 * L'INDIRIZZO RESTA PULITO (richiesta di Valerio, 11/08).
 *
 * Cliccare "Prezzi" scriveva `rivolio.netlify.app/#prezzi` nella barra
 * degli indirizzi. Adesso la pagina scorre e l'indirizzo non cambia.
 *
 * ⚠️ Queste prove servono soprattutto a proteggere le DUE cose che
 * potevano rompersi mentre lo si sistemava, e che valgono più della
 * rifinitura: i link con il cancelletto che girano già (in un video, in
 * una email) devono continuare a portare dove portavano, e i link da
 * un'altra pagina devono continuare a navigare davvero.
 */

const fermo = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

test.describe("Gli ancoraggi non sporcano l'indirizzo", () => {
  test("cliccare un ancoraggio scorre senza scrivere il cancelletto", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    /* Si parte dal fondo e si usa il link del piede: le voci del menu in
       alto esistono solo da desktop, e una prova che gira su un solo
       schermo copre metà del pubblico. */
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await fermo(1200);
    const partenza = await page.evaluate(() => window.scrollY);
    expect(partenza).toBeGreaterThan(1000);

    const voce = page.locator('a[href="/#controllo"]').first();
    await voce.click();
    await fermo(2500);

    // è risalito fino al check, che sta in cima
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(partenza - 500);
    // e l'indirizzo non ha preso il cancelletto
    expect(new URL(page.url()).hash).toBe("");
  });

  test("il marchio riporta in cima scorrendo, senza ricaricare", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 3000));
    await fermo(900);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    /* ⚠️ Il marchio è un `Link` di Next, che ha un suo gestore del clic:
       se il nostro non gira in fase di CATTURA, Next ricarica la pagina
       e questa prova resta ferma a metà. È il difetto vero trovato
       misurando, non leggendo. */
    await page.locator('a[aria-label="Rivolio, lo scanner dei rimborsi"]').first().click();
    await fermo(2500);

    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(new URL(page.url()).hash).toBe("");
  });

  test("un link col cancelletto che arriva da fuori continua a funzionare", async ({ page }) => {
    // è il caso di chi clicca un link vecchio in un video o in una email
    await page.goto("/#prezzi");
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  });

  test("da un'altra pagina il link porta davvero sulla landing", async ({ page }) => {
    /* Il pezzo che si poteva rompere: fermando il clic per scorrere, si
       rischia di fermare anche i link che devono NAVIGARE sul serio. */
    await page.goto("/tabellone");
    await page.waitForTimeout(1200);
    await page.locator('a[href="/#controllo"]').first().click();
    await page.waitForURL(/localhost:\d+\/(#controllo)?$/, { timeout: 15_000 });
    await fermo(1500);
    await expect(page.locator("#controllo")).toBeVisible();
  });
});
