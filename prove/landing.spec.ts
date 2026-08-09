import { test, expect } from "@playwright/test";
import { COPY } from "../lib/copy";
import { apriModoNumero } from "./aiuti";

/**
 * La landing di Rivolio: lo scanner dei rimborsi (SPEC §1, §3).
 * L'hero È il prodotto: il form volo+data, senza email e senza account.
 * I testi vengono da lib/copy.ts: le prove agganciano quelli, non stringhe
 * duplicate a mano che poi divergono.
 */

test.describe("Landing page", () => {
  test("il messaggio principale c'è e si legge", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Hai preso un volo/i }),
    ).toBeVisible();
    await expect(page.getByText(COPY.hero.sottotitolo).first()).toBeVisible();
    // la rassicurazione del funnel: niente email, niente account (SPEC §3)
    await expect(page.getByText(COPY.hero.form.rassicurazione).first()).toBeVisible();
  });

  test("l'hero ha il form volo+data, che è il prodotto", async ({ page }) => {
    await page.goto("/");
    // il modo predefinito è la tratta (standard dell'8/08): il numero sta
    // dietro il suo selettore, e la prova segue la strada dell'utente
    await apriModoNumero(page);
    const volo = page.getByLabel(COPY.hero.form.volo.etichetta).first();
    const data = page.getByLabel(COPY.hero.form.data.etichetta).first();
    await expect(volo).toBeVisible();
    await expect(data).toBeVisible();
    await expect(data).toHaveAttribute("type", "date");
    await expect(
      page.getByRole("button", { name: COPY.hero.form.bottone }).first(),
    ).toBeVisible();
  });

  test("il form vuoto non parte: dice cosa manca, senza giro di rete", async ({ page }) => {
    await page.goto("/");
    await apriModoNumero(page);
    await page.getByRole("button", { name: COPY.hero.form.bottone }).first().click();
    await expect(page.getByText(COPY.hero.form.errori.voloMancante).first()).toBeVisible();
    await expect(page).not.toHaveURL(/\/verifica\//);
  });

  test("i numeri dell'hero sono apribili: il 600€ e i 5 anni si spiegano", async ({
    page,
  }) => {
    await page.goto("/");

    // "fino a 600€": il bottone apre la nota con le fasce del CE 261/2004
    await page.getByRole("button", { name: COPY.hero.apriImporto }).click();
    await expect(page.getByText(COPY.hero.notaImporto)).toBeVisible();

    // "ultimi 5 anni": la finestra è dichiarata come stima, mai come certezza
    await page.getByRole("button", { name: COPY.hero.apriFinestra }).click();
    await expect(page.getByText(COPY.hero.notaFinestra)).toBeVisible();
  });

  test("il confronto prezzi torna: 600 - 210 = 390, 600 - 14,90 = 585,10", async ({
    page,
  }) => {
    await page.goto("/#prezzi");
    const prezzi = page.locator("#prezzi");
    const testo = await prezzi.innerText();

    // i due prezzi chiusi in SPEC §5
    expect(testo).toContain("14,90€");
    expect(testo).toContain("24,90€");

    // il conto del confronto coi portali a percentuale: la somma regge
    expect(testo).toContain("210€");
    expect(testo).toContain("390€");
    expect(testo).toContain("585,10€");

    // e la cifra si apre: il dettaglio dichiara da dove viene il 35-50%
    await prezzi.getByText(COPY.comune.apriIlConto).first().click();
    await expect(prezzi.getByText(COPY.prezzi.notaConfronto)).toBeVisible();
  });

  test("il modulo dell'Osservatorio c'è e rifiuta un'email sbagliata", async ({ page }) => {
    await page.goto("/#osservatorio");
    // il titolo è spezzato su due righe (corsivo): si aggancia il heading
    await expect(page.getByRole("heading", { name: /Osservatorio/i })).toBeVisible();
    const campo = page.locator("#osservatorio-email");
    await campo.fill("non-e-una-email");
    // il browser blocca da solo: il campo non è valido
    await expect(campo).toHaveJSProperty("validity.valid", false);
  });

  // Nota sandbox: questa prova tocca Supabase vero via /api/iscriviti.
  // Dove la rete verso *.supabase.co è chiusa (allowlist/CONNECT 403)
  // fallisce per l'ambiente, non per il codice.
  test("il modulo dell'Osservatorio accetta un'email valida e conferma", async ({ page }) => {
    await page.goto("/#osservatorio");
    await page.locator("#osservatorio-email").fill(`prova+${Date.now()}@rivolio.it`);
    await page.getByRole("button", { name: COPY.osservatorio.bottone }).click();
    /* Doppio opt-in (9/08): non si è iscritti finché non si clicca il
       link nell'email, e il pannello deve dirlo. La prima frase della
       conferma di COPY fa da titolo. */
    await expect(page.getByText(/^Controlla la posta\./).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("mai 'hai diritto a': il claim è un fatto, non una promessa", async ({ page }) => {
    // SPEC §3: il claim onesto. La frase vietata non deve comparire mai.
    await page.goto("/");
    const testo = await page.locator("body").innerText();
    expect(testo.toLowerCase()).not.toContain("hai diritto a");
    // e niente trattino lungo nei testi visibili (regola BRAND)
    expect(testo).not.toContain("—");
  });

  test("non si scorre in orizzontale (rottura classica sul telefono)", async ({ page }) => {
    await page.goto("/");
    const largo = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(largo, "la pagina esce dallo schermo in larghezza").toBe(false);
  });

  test("il logo regge a 24px (è lì che si vede quasi sempre)", async ({ page }) => {
    await page.goto("/");
    // il segno nuovo è un'immagine (la lente), non più un svg disegnato
    const logo = page.locator("header img").first();
    await expect(logo).toBeVisible();
    await logo.evaluate((el) => {
      (el as HTMLElement).style.width = "24px";
      (el as HTMLElement).style.height = "24px";
    });
    await logo.screenshot({ path: "prove/schermate/logo-24px.png" });
  });
});
