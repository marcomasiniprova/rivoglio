import { expect, test } from "@playwright/test";
import { valutaRitardoRinuncia, SOGLIA_RINUNCIA_MINUTI } from "../lib/regole/dichiarati";
import type { FattoVolo } from "../lib/regole/eu261";

/**
 * RITARDO DI 5 ORE E PIÙ CON RINUNCIA (art. 6 → art. 8): il volo parte con
 * almeno 5 ore di ritardo, tu rinunci, e ti spetta il RIMBORSO del biglietto
 * (non la compensazione). Il prezzo lo dà l'utente; le 5 ore le àncora il
 * motore al ritardo certificato all'arrivo.
 *
 * Qui si blindano i tre paletti che valgono soldi:
 *  1. l'importo è il prezzo del biglietto, non una fascia;
 *  2. chi è partito, o è già stato rimborsato, non prende niente da qui;
 *  3. sotto le 5 ore il caso resta incerto (non si vende un forse).
 */

// ZZ600 (demo): FCO → JFK, atterrato con 305 min di ritardo (5h05), certificato.
const VOLO = { volo: "ZZ600", data: "05/08/2026" };

async function dichiara(
  request: import("@playwright/test").APIRequestContext,
  corpo: Record<string, unknown>,
  volo = VOLO,
) {
  const r = await request.post("/api/verifica/dichiara", { data: { ...volo, ...corpo } });
  return { stato: r.status(), corpo: r.ok() ? await r.json() : null };
}

test.describe("Ritardo 5h+ con rinuncia (art. 6 → art. 8)", () => {
  test("la soglia è 5 ore (300 minuti)", () => {
    expect(SOGLIA_RINUNCIA_MINUTI).toBe(300);
  });

  test("l'importo è il PREZZO del biglietto, non una fascia", async ({ request }) => {
    const { corpo } = await dichiara(request, {
      caso: "ritardo_rinuncia",
      rinuncia: "si",
      giaRimborsato: false,
      prezzo: 137,
    });
    expect(corpo.esito).toBe("idoneo");
    // 137 esatti: è il biglietto restituito, non 250/400/600.
    expect(corpo.importo).toBe(137);
    expect([250, 300, 400, 600]).not.toContain(corpo.importo);
  });

  test("il prezzo con la virgola all'italiana si legge lo stesso", async ({ request }) => {
    const { corpo } = await dichiara(request, {
      caso: "ritardo_rinuncia",
      rinuncia: "si",
      giaRimborsato: false,
      prezzo: "99,90",
    });
    expect(corpo.esito).toBe("idoneo");
    expect(corpo.importo).toBe(100);
  });

  test("la lettera del caso NON promette la compensazione, ma il rimborso", async ({ request }) => {
    const { corpo } = await dichiara(request, {
      caso: "ritardo_rinuncia",
      rinuncia: "si",
      giaRimborsato: false,
      prezzo: 137,
    });
    expect(corpo.motivo).toContain("rimborso");
    // il punto forte: le circostanze eccezionali qui non salvano la compagnia.
    expect(corpo.motivo.toLowerCase()).toContain("circostanze eccezionali");
  });

  test("sono partito lo stesso: non spetta (quello è la compensazione)", async ({ request }) => {
    const { corpo } = await dichiara(request, {
      caso: "ritardo_rinuncia",
      rinuncia: "no",
      giaRimborsato: false,
      prezzo: 137,
    });
    expect(corpo.esito).toBe("non_idoneo");
  });

  test("mi hanno già rimborsato: non spetta di nuovo", async ({ request }) => {
    const { corpo } = await dichiara(request, {
      caso: "ritardo_rinuncia",
      rinuncia: "si",
      giaRimborsato: true,
      prezzo: 137,
    });
    expect(corpo.esito).toBe("non_idoneo");
  });

  test("sotto le 5 ore non si conferma: incerto, non si vende", async ({ request }) => {
    // ZZ250: 200 min di ritardo (3h20). Idoneo alla compensazione, ma per il
    // rimborso da rinuncia non arriva alle 5 ore: incerto.
    const { corpo } = await dichiara(
      request,
      { caso: "ritardo_rinuncia", rinuncia: "si", giaRimborsato: false, prezzo: 137 },
      { volo: "ZZ250", data: "05/08/2026" },
    );
    expect(corpo.esito).toBe("incerto");
  });

  test("senza un prezzo valido: rifiutato, non si inventa un importo", async ({ request }) => {
    const { stato } = await dichiara(request, {
      caso: "ritardo_rinuncia",
      rinuncia: "si",
      giaRimborsato: false,
      prezzo: 0,
    });
    expect(stato).toBe(400);
  });

  test("il motore, chiamato a mano, tiene i paletti sull'oggetto FattoVolo", () => {
    const base: FattoVolo = {
      voloIata: "AZ600",
      dataLocale: "2026-08-05",
      vettoreOperativo: "AZ",
      partenzaIata: "FCO",
      partenzaPaese: "IT",
      arrivoIata: "JFK",
      arrivoPaese: "US",
      arrivoPrevistoUtc: "2026-08-05T18:00:00.000Z",
      arrivoEffettivoUtc: "2026-08-05T23:05:00.000Z", // 305 min
      stato: "atterrato",
      kmOrtodromica: 6500,
      orarioVerificato: true,
      fonte: "test",
    };
    // rinuncia + non rimborsato → rimborso del prezzo.
    expect(valutaRitardoRinuncia(base, { rinuncia: "si", giaRimborsato: false, prezzo: 250 })).toMatchObject({
      esito: "idoneo",
      importo: 250,
    });
    // stesso volo, ma l'orario non è certificato: non si può provare le 5 ore.
    expect(
      valutaRitardoRinuncia(
        { ...base, orarioVerificato: false },
        { rinuncia: "si", giaRimborsato: false, prezzo: 250 },
      ).esito,
    ).toBe("incerto");
  });
});
