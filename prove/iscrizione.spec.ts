import { expect, test } from "@playwright/test";
import { COPY } from "../lib/copy";

/**
 * Il doppio opt-in dell'Osservatorio.
 *
 * Quello che queste prove difendono è una promessa, non un dettaglio:
 * nessuno può iscrivere l'indirizzo di un altro, e chi vuole uscire esce
 * con un clic. Se qualcuno un giorno "semplifica" togliendo la conferma,
 * queste prove diventano rosse.
 */
test.describe("Iscrizione all'Osservatorio", () => {
  test("un gettone inventato non conferma nessuno", async ({ page }) => {
    await page.goto("/api/iscriviti/conferma?g=questo-non-l-ho-firmato-io");
    await expect(page).toHaveURL(/\/iscrizione\?esito=guasto/);
    await expect(
      page.getByText(COPY.iscrizione.esiti.guasto.titolo).first(),
    ).toBeVisible();
  });

  test("un gettone inventato non disdice nessuno", async ({ page }) => {
    await page.goto("/api/iscriviti/disdetta?g=nemmeno-questo");
    await expect(page).toHaveURL(/\/iscrizione\?esito=guasto/);
  });

  test("la pagina di esito parla anche senza parametri", async ({ page }) => {
    /* Chi ci arriva a mano non deve trovare una pagina vuota. */
    await page.goto("/iscrizione");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("l'esito buono si vede e porta da qualche parte", async ({ page }) => {
    await page.goto("/iscrizione?esito=fatto");
    await expect(page.getByText(COPY.iscrizione.esiti.fatto.titolo)).toBeVisible();
    await expect(
      page.getByRole("link", { name: COPY.iscrizione.esiti.fatto.azione.testo }),
    ).toBeVisible();
  });
})
