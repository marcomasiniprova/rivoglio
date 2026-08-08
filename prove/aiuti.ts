import { expect, type Page } from "@playwright/test";
import { COPY } from "../lib/copy";

/**
 * Apre il modo "So il numero" della scheda check (dall'8/08 il predefinito
 * è la tratta). Il click va RIPETUTO finché il campo compare: subito dopo
 * il goto la pagina è già visibile ma React può non aver ancora agganciato
 * i listener (idratazione), e un click singolo si perde nel vuoto.
 */
export async function apriModoNumero(pagina: Page): Promise<void> {
  /* exact: senza, il name fa match per sottostringa e "Non so il numero"
     (che contiene "So il numero" e viene prima) si prende il click. */
  const selettore = pagina
    .getByRole("button", { name: COPY.check.modo.numero, exact: true })
    .first();
  await expect(async () => {
    await selettore.click();
    await expect(pagina.getByLabel(COPY.hero.form.volo.etichetta).first()).toBeVisible({
      timeout: 700,
    });
  }).toPass({ timeout: 15_000 });
}
