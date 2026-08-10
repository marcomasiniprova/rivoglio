import { test, expect } from "@playwright/test";
import { cercaAeroporti, aeroportoPerIata } from "../lib/voli/aeroporti";
import { COPY } from "../lib/copy";
import { apriModoNumero } from "./aiuti";

/**
 * IL GIRO DA UTENTE CRITICO (10/08).
 *
 * Non sono prove di codice: sono i tre difetti trovati provando il sito
 * come dieci persone normali, ognuno con la sua prova perché non torni.
 */

test.describe("La ricerca degli aeroporti parla italiano", () => {
  test("chi scrive Roma vede Roma, non Rome", () => {
    /* Prima l'elenco diceva: Rome (Fiumicino), Rome (Ciampino), e poi
       "Roma", che è una cittadina in AUSTRALIA. L'unica voce scritta come
       l'aveva scritta lui era quella sbagliata: è il modo migliore per
       far scegliere l'aeroporto sbagliato a chi ha fretta. */
    const trovati = cercaAeroporti("roma");
    expect(trovati[0].iata).toBe("FCO");
    expect(trovati[0].citta).toBe("Roma");
    expect(trovati.some((a) => a.citta === "Rome")).toBe(false);
  });

  test("anche le altre città tradotte", () => {
    expect(cercaAeroporti("milano")[0].citta).toBe("Milano");
    expect(cercaAeroporti("napoli")[0].citta).toBe("Napoli");
    expect(cercaAeroporti("venezia")[0].citta).toBe("Venezia");
  });

  test("il paese si legge in italiano: su un sito italiano 'Italy' sembra tradotto male", () => {
    expect(aeroportoPerIata("FCO")?.paese).toBe("Italia");
    expect(aeroportoPerIata("JFK")?.paese).toBe("Stati Uniti");
    expect(aeroportoPerIata("LHR")?.paese).toBe("Regno Unito");
  });

  test("una città che non è in tabella resta com'è, mai inventata", () => {
    const madrid = cercaAeroporti("madrid")[0];
    expect(madrid.citta).toBe("Madrid");
  });
});

test.describe("Cosa copre: nessuna colonna mente su quello che il motore fa", () => {
  const gruppo = (etichetta: string) =>
    COPY.copertura.gruppi.find((g) => g.etichetta === etichetta)!;

  test("negato imbarco e coincidenza persa NON sono più fra i 'non ancora'", () => {
    /* Sono costruiti dal giro #35 (lib/regole/dichiarati.ts). Dire che
       non ci sono è una vendita persa scritta sulla landing. */
    const nonAncora = JSON.stringify(gruppo("Non ancora"));
    expect(nonAncora.toLowerCase()).not.toContain("negato imbarco");
    expect(nonAncora.toLowerCase()).not.toContain("coincidenza");
  });

  test("stanno nella colonna dove il verdetto si chiude con una domanda", () => {
    const quasi = JSON.stringify(gruppo("Verdetto dopo due domande")).toLowerCase();
    expect(quasi).toContain("lasciato a terra");
    expect(quasi).toContain("coincidenza persa");
  });

  test("nessuna colonna promette un pezzo 'che costruiamo'", () => {
    const tutto = JSON.stringify(COPY.copertura).toLowerCase();
    expect(tutto).not.toContain("prossimo pezzo che costruiamo");
    expect(tutto).not.toContain("arrivano a breve");
  });

  test("bagagli e treni restano fuori, e lo dicono", () => {
    const nonAncora = JSON.stringify(gruppo("Non ancora")).toLowerCase();
    expect(nonAncora).toContain("bagaglio");
    expect(nonAncora).toContain("treni");
  });
});

test.describe("Chi sbaglia a scrivere il numero non viene mandato ad aspettare", () => {
  test("il messaggio dice tutte e due le possibilità", async ({ request }) => {
    /* Prima diceva solo "il volo è recente, ricontrolla domani". Ma un
       refuso è comune quanto un volo fresco, e domani quel numero non
       esisterà lo stesso: la persona torna, riprova, e se ne va.

       La prova batte sull'API e non sull'interfaccia di proposito: quello
       che è cambiato è la frase che esce dal motore, e provarla alla
       fonte è più preciso che cercarla in una pagina. Il collegamento fra
       modulo e messaggio è già coperto da prove/verifica.spec.ts. */
    const r = await request.post("/api/verifica", {
      data: { volo: "XX9999", data: ieri() },
    });
    expect(r.status()).toBe(200);
    const d = await r.json();
    expect(d.ok).toBe(true);
    expect(d.esito).toBe("incerto");
    expect(d.motivo).toContain("il numero non è quello giusto");
    expect(d.motivo).toContain("ricontrolla domani");
  });

  test("il verdetto resta incerto: nessuna vendita su un volo che non esiste", async ({
    request,
  }) => {
    const r = await request.post("/api/verifica", {
      data: { volo: "XX9999", data: ieri() },
    });
    const d = await r.json();
    expect(d.importo).toBeUndefined();
  });
});

function ieri(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

/* ── GLI SCHERMI MINUSCOLI ────────────────────────────────────────────
   320 punti sono l'iPhone SE di prima generazione e, soprattutto, la
   modalità zoom di iOS, che moltissime persone tengono accesa. Lì la
   barra in alto spingeva la pagina fuori schermo di 26px: il sito
   scorreva di lato, che è sempre un difetto e su un sito che vende
   fiducia sembra roba fatta male. */
test.describe("A 320 punti niente scorre di lato", () => {
  test.use({ viewport: { width: 320, height: 600 } });

  for (const rotta of ["/", "/tabellone", "/sciopero-aerei", "/aeroporto/fco"]) {
    test(`${rotta} sta dentro lo schermo`, async ({ page }) => {
      await page.goto(rotta);
      const fuori = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(fuori).toBeLessThanOrEqual(2);
    });
  }
});
