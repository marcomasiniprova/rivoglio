import { test, expect } from "@playwright/test";
import { interpretaAviationEdge } from "../lib/voli/fornitori/aviationedge";
import { incrociaFonti } from "../lib/voli/incrocio";
import type { FattoVolo } from "../lib/regole/eu261";

/**
 * AviationEdge, seconda fonte per l'incrocio. Qui si prova la LETTURA della
 * risposta (funzione pura, nessuna rete) e, in fondo, che gli orari che ne
 * escono confermano davvero un volo all'incrocio. La rete vera la prova
 * Valerio dal suo PC col banco, accendendo la chiave.
 */

const risposta = [
  {
    status: "landed",
    departure: { iataCode: "BGY" },
    arrival: {
      iataCode: "CDG",
      // Orari come li manda AviationEdge: "t" minuscola, nessun fuso.
      scheduledTime: "2026-08-11t11:00:00.000",
      actualTime: "2026-08-11t15:12:00.000",
    },
    airline: { name: "Ryanair", iataCode: "FR" },
    flight: { number: "8321", iataNumber: "fr8321", icaoNumber: "ryr8321" },
  },
  {
    // rumore: un altro arrivo allo stesso scalo, va scartato
    status: "landed",
    arrival: { iataCode: "CDG", scheduledTime: "2026-08-11t09:00:00.000", actualTime: "2026-08-11t09:05:00.000" },
    flight: { iataNumber: "az123" },
  },
];

test.describe("AviationEdge — lettura della risposta", () => {
  test("trova il volo cercato anche col numero in minuscolo", () => {
    const f = interpretaAviationEdge(risposta, "FR8321", "2026-08-11");
    expect(f).toBeTruthy();
    expect(f!.stato).toBe("atterrato");
    expect(f!.arrivoIata).toBe("CDG");
    expect(f!.vettoreOperativo).toBe("FR");
  });

  test("la 't' minuscola diventa un orario che Date.parse legge", () => {
    const f = interpretaAviationEdge(risposta, "FR8321", "2026-08-11");
    expect(Number.isFinite(Date.parse(f!.arrivoPrevistoUtc!))).toBe(true);
    expect(Number.isFinite(Date.parse(f!.arrivoEffettivoUtc!))).toBe(true);
  });

  test("un volo che nell'array non c'è: null (niente incrocio, niente danni)", () => {
    expect(interpretaAviationEdge(risposta, "AB999", "2026-08-11")).toBeNull();
  });

  test("una risposta d'errore (non un array) non rompe niente: null", () => {
    expect(interpretaAviationEdge({ success: false, error: "No Record Found" }, "FR8321", "2026-08-11")).toBeNull();
  });

  test("atterrato ma senza orario effettivo: sconosciuto, nessun orario finto", () => {
    const senzaOra = [
      {
        status: "landed",
        arrival: { iataCode: "CDG", scheduledTime: "2026-08-11t11:00:00.000", actualTime: null },
        flight: { iataNumber: "fr8321" },
      },
    ];
    const f = interpretaAviationEdge(senzaOra, "FR8321", "2026-08-11");
    expect(f!.stato).toBe("sconosciuto");
    expect(f!.arrivoEffettivoUtc).toBeNull();
  });

  /* IL CERCHIO SI CHIUDE: gli orari letti da AviationEdge (in ora locale,
     senza fuso) confermano un primario in UTC, perché l'incrocio guarda il
     ritardo. Primario: 250 min. AviationEdge: 252 min. → confermato. */
  test("gli orari letti confermano davvero un volo all'incrocio", () => {
    const secondo = interpretaAviationEdge(risposta, "FR8321", "2026-08-11")!;
    const primario: FattoVolo = {
      voloIata: "FR8321",
      dataLocale: "2026-08-11",
      vettoreOperativo: "FR",
      partenzaIata: "BGY",
      arrivoIata: "CDG",
      arrivoPrevistoUtc: "2026-08-11T11:00:00Z",
      arrivoEffettivoUtc: "2026-08-11T15:10:00Z", // +250, NON tracciato Live
      stato: "atterrato",
      kmOrtodromica: 640,
      fonte: "aerodatabox",
    };
    const e = incrociaFonti(primario, secondo.arrivoPrevistoUtc, secondo.arrivoEffettivoUtc);
    expect(e).toEqual({ discordanti: false, confermato: true });
  });
});
