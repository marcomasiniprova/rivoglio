import { test, expect } from "@playwright/test";
import { COPY } from "../lib/copy";

/**
 * Prove sulla vetrina tecnica del sito: il titolo che finisce nei tab e
 * nelle ricerche, l'immagine social e il manifest che rende il sito
 * installabile sulla schermata Home.
 *
 * La vecchia sezione «com'è dentro» (l'app viaggi) non esiste più: al suo
 * posto la landing mostra l'esempio di verdetto, marcato demo (regola 3).
 */

test.describe("Vetrina", () => {
  test("il titolo della pagina è quello di Rivolio", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(new RegExp(`${COPY.comune.marchio}.*${COPY.tagline}`));
  });

  test("l'esempio di verdetto in pagina è marcato come dimostrativo", async ({ page }) => {
    // il caso costruito di DatoOggettivo: i conti tornano (22:55 → 02:47
    // sono 3h52) e l'etichetta demo è visibile, mai un dato finto che
    // sembra vero (regola CLAUDE.md #3)
    await page.goto("/#dato-oggettivo");
    const sezione = page.locator("#dato-oggettivo");
    await expect(sezione.getByText(COPY.datoOggettivo.esempio.titolo)).toBeVisible();
    // l'etichetta che non si tratta: il caso è costruito e lo si dice
    await expect(sezione.getByText(COPY.comune.demo)).toBeVisible();
    // e niente numero di volo o data: "Volo di esempio", non un volo vero
    await expect(sezione.getByText(COPY.datoOggettivo.esempio.volo)).toBeVisible();
  });

  test("l'immagine social esiste ed è un png della misura giusta", async ({ request }) => {
    /* L'immagine si DISEGNA a ogni richiesta (font, logo, testo), e in
       sviluppo la prima volta ci mette qualche secondo. Con la suite
       intera che gira in parallelo capita un "socket hang up": non è
       l'immagine a essere rotta, è il server locale sotto carico.
       ⚠️ E il "socket hang up" LANCIA, non torna uno stato: la riprova
       scritta prima guardava `r.status()`, quindi non partiva mai e la
       prova falliva al primo colpo lo stesso (visto l'11/08, due rosse
       nella suite piena). Qui si riprova anche su eccezione, con una
       pausa in mezzo per dare tempo al server di respirare. */
    const chiedi = async () => {
      try {
        const r = await request.get("/opengraph-image", { timeout: 30_000 });
        return { r, guasto: null as unknown };
      } catch (e) {
        return { r: null, guasto: e };
      }
    };

    let esito = await chiedi();
    for (let giro = 0; giro < 2 && esito.r?.status() !== 200; giro++) {
      await new Promise((ok) => setTimeout(ok, 1_500));
      esito = await chiedi();
    }

    const r = esito.r;
    if (!r) throw new Error(`il server non ha mai risposto: ${String(esito.guasto)}`);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/png");
    // 1200x630 non pesa mai pochi byte: se pesa poco, è un'immagine vuota
    expect((await r.body()).length).toBeGreaterThan(10_000);
  });

  test("il manifest rende il sito installabile", async ({ request }) => {
    const r = await request.get("/manifest.webmanifest");
    expect(r.status()).toBe(200);
    const m = await r.json();
    expect(m.name).toBe("Rivolio");
    // senza standalone si apre dentro il browser e non sembra un'app
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#0a9d5c");
    expect(m.icons.length).toBeGreaterThan(0);
  });
});
