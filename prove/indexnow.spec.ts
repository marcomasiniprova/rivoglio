import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CHIAVE_INDEXNOW, inviaAIndexNow } from "../lib/seo/indexnow";

/**
 * INDEXNOW: le promesse che lo fanno funzionare davvero.
 *
 * IndexNow è muto quando sbaglia: se la chiave nel file non combacia con
 * quella nel codice, o se mandiamo URL di un altro host, Bing rifiuta tutto
 * il lotto senza che nessuno se ne accorga. Queste prove tengono ferme le
 * due cose che, sbagliate, renderebbero inutile tutto il GEO.
 */

test.describe("IndexNow: il ping a Bing (per farsi vedere da ChatGPT)", () => {
  test("il file della chiave in public/ combacia con la costante", () => {
    /* La prova di proprietà: IndexNow accetta i nostri URL solo se il file
       `/<chiave>.txt` contiene ESATTAMENTE la chiave che mandiamo. Se uno
       cambia la costante e non il file (o viceversa), Bing rifiuta ogni
       invio in silenzio. Questa prova non lo fa succedere. */
    const file = join(process.cwd(), "public", `${CHIAVE_INDEXNOW}.txt`);
    const contenuto = readFileSync(file, "utf8").trim();
    expect(contenuto).toBe(CHIAVE_INDEXNOW);
    // e la chiave è nel formato ammesso: esadecimale, 8-128 caratteri
    expect(CHIAVE_INDEXNOW).toMatch(/^[a-f0-9]{8,128}$/);
  });

  test("manda solo gli URL del nostro host, e la keyLocation giusta", async () => {
    const chiamate: { url: string; body: unknown }[] = [];
    const veroFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL | Request, opts?: RequestInit) => {
      chiamate.push({ url: String(url), body: JSON.parse(String(opts?.body ?? "{}")) });
      return new Response("", { status: 200 });
    }) as typeof fetch;

    try {
      const esito = await inviaAIndexNow("https://rivolio.it", [
        "https://rivolio.it/",
        "https://rivolio.it/reclamo/ryanair",
        "https://rivolio.it/reclamo/ryanair", // doppione: va tolto
        "https://un-altro-sito.it/pagina", // altro host: va scartato
      ]);

      expect(esito.ok).toBe(true);
      expect(esito.quante).toBe(2); // solo i due di rivolio.it, senza doppione
      const body = chiamate[0].body as { keyLocation: string; host: string; urlList: string[] };
      expect(body.host).toBe("rivolio.it");
      expect(body.keyLocation).toBe(`https://rivolio.it/${CHIAVE_INDEXNOW}.txt`);
      expect(body.urlList).not.toContain("https://un-altro-sito.it/pagina");
      expect(body.urlList.length).toBe(2);
    } finally {
      globalThis.fetch = veroFetch;
    }
  });

  test("se la rete cade, non lancia: torna ok:false e basta", async () => {
    const veroFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error("rete giù");
    }) as typeof fetch;
    try {
      const esito = await inviaAIndexNow("https://rivolio.it", ["https://rivolio.it/"]);
      expect(esito.ok).toBe(false);
      expect(esito.motivo).toContain("rete giù");
    } finally {
      globalThis.fetch = veroFetch;
    }
  });
});
