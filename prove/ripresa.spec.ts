import { test, expect } from "@playwright/test";

/**
 * 🔴 CHI PAGA E TORNA NON DEVE RITROVARE IL MODULO VUOTO.
 *
 * Il difetto, trovato col collaudo del 13/08 sul sito vero: dopo la
 * cassa si tornava sulla landing con i campi puliti e l'analisi ferma,
 * mentre la cassa aveva appena promesso "poi torni al check e l'analisi
 * parte da sola". Uno ha appena pagato: è il punto peggiore in cui
 * fargli pensare di aver buttato dei soldi.
 *
 * Qui si prova il ritorno, che è la parte che si rompe: la pagina si
 * apre col segno `?ripresa=1` e col volo messo da parte, e l'analisi
 * deve ripartire da sola SU QUEL VOLO. Le altre due prove sono i modi
 * in cui NON deve partire, e valgono quanto la prima: un'analisi che
 * riparte da sola quando non deve consuma un credito che uno ha pagato.
 */

const CHIAVE = "rivolio-check-sospeso";

/** Semina l'appunto prima che parta il codice della pagina. */
async function conAppunto(
  page: import("@playwright/test").Page,
  volo: string,
  data: string,
  quando = Date.now(),
) {
  await page.addInitScript(
    ([k, v]) => sessionStorage.setItem(k as string, v as string),
    [CHIAVE, JSON.stringify({ volo, data, quando })] as const,
  );
}

test("tornando dalla cassa l'analisi riparte da sola, sul volo di prima", async ({ page }) => {
  await conAppunto(page, "ZZ250", "2026-08-06");
  await page.goto("/?ripresa=1#controllo");

  /* Il teatro è partito: si vede il volo sotto analisi. */
  await expect(page.getByText("ZZ250").first()).toBeVisible({ timeout: 15_000 });

  /* E il segno è sparito dall'indirizzo: un ricaricamento non deve
     rilanciare niente. */
  await expect(page).toHaveURL(/^[^?]*(#controllo)?$/);
});

test("senza il segno nell'indirizzo non parte niente", async ({ page }) => {
  await conAppunto(page, "ZZ250", "2026-08-06");
  await page.goto("/");
  await page.waitForTimeout(2500);

  /* Il modulo è ancora lì, intatto: nessuna analisi in corso. */
  await expect(page.getByRole("button", { name: "So il numero", exact: true })).toBeVisible();
});

test("un appunto vecchio di un giorno non fa ripartire niente", async ({ page }) => {
  await conAppunto(page, "ZZ250", "2026-08-06", Date.now() - 25 * 60 * 60 * 1000);
  await page.goto("/?ripresa=1#controllo");
  await page.waitForTimeout(2500);

  await expect(page.getByRole("button", { name: "So il numero", exact: true })).toBeVisible();
});
