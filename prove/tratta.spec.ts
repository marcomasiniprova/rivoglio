import { test, expect } from "@playwright/test";
import { cercaAeroporti, aeroportoPerIata } from "../lib/voli/aeroporti";
import { voliDaRisposta, type VoceAdb } from "../lib/voli/tratta";

/**
 * LA RICERCA PER TRATTA, il pezzo che toglie di mezzo il numero di volo.
 *
 * Regola del progetto: si costruisce per l'utente medio. Qui le prove
 * sono scritte come lo scriverebbero dieci persone diverse: "Roma",
 * "Orio", "Milano", "Barcellona". Se una di queste non trova il suo
 * aeroporto, la ricerca per tratta non serve a niente.
 */

test.describe("Ricerca aeroporti — come scrive la gente", () => {
  test("Roma trova Fiumicino per primo", () => {
    const r = cercaAeroporti("Roma");
    expect(r[0].iata).toBe("FCO");
    expect(r.map((a) => a.iata)).toContain("CIA");
  });

  test("Milano trova sia Malpensa sia Linate", () => {
    const codici = cercaAeroporti("Milano").map((a) => a.iata);
    expect(codici).toContain("MXP");
    expect(codici).toContain("LIN");
  });

  test("Orio al Serio è Bergamo, anche se nel dataset si chiama Caravaggio", () => {
    expect(cercaAeroporti("orio")[0].iata).toBe("BGY");
    expect(cercaAeroporti("Orio al Serio")[0].iata).toBe("BGY");
  });

  test("i nomi italiani delle città estere funzionano", () => {
    expect(cercaAeroporti("Barcellona")[0].iata).toBe("BCN");
    expect(cercaAeroporti("Londra")[0].iata).toBe("LHR");
    expect(cercaAeroporti("Parigi")[0].iata).toBe("CDG");
  });

  test("il codice IATA scritto a mano vince su tutto", () => {
    expect(cercaAeroporti("bgy")[0].iata).toBe("BGY");
    expect(cercaAeroporti("ACE")[0].iata).toBe("ACE");
  });

  test("niente rumore: cercando Roma non escono gli 'Aerodrome'", () => {
    for (const a of cercaAeroporti("Roma")) {
      expect(a.nome.toLowerCase()).not.toContain("aerodrome");
    }
  });

  test("una lettera sola non cerca niente", () => {
    expect(cercaAeroporti("r")).toEqual([]);
  });

  test("un codice inventato non esiste", () => {
    expect(aeroportoPerIata("ZZZ")).toBeNull();
  });
});

/* Una risposta del fornitore nella forma dichiarata dalla spec OpenAPI
   (withLeg=true: ogni voce porta departure E arrival). Serve a provare la
   lettura senza dipendere dall'API. */
const RISPOSTA: VoceAdb[] = [
  {
    number: "FR 4001",
    status: "Arrived",
    airline: { name: "Ryanair", iata: "FR" },
    departure: {
      airport: { iata: "BGY", municipalityName: "Bergamo" },
      scheduledTime: { utc: "2026-08-06 04:20Z", local: "2026-08-06 06:20+02:00" },
    },
    arrival: {
      airport: { iata: "ACE", municipalityName: "Arrecife" },
      scheduledTime: { utc: "2026-08-06 09:35Z", local: "2026-08-06 10:35+01:00" },
    },
  },
  {
    // Stesso scalo di partenza ma un'altra destinazione: non deve uscire.
    number: "FR 1234",
    status: "Arrived",
    airline: { name: "Ryanair", iata: "FR" },
    departure: {
      airport: { iata: "BGY" },
      scheduledTime: { utc: "2026-08-06 05:00Z", local: "2026-08-06 07:00+02:00" },
    },
    arrival: {
      airport: { iata: "CTA" },
      scheduledTime: { utc: "2026-08-06 06:30Z", local: "2026-08-06 08:30+02:00" },
    },
  },
  {
    // Cargo: fuori, non ci vola nessun passeggero.
    number: "QY 500",
    isCargo: true,
    departure: { airport: { iata: "BGY" }, scheduledTime: { local: "2026-08-06 03:00+02:00" } },
    arrival: { airport: { iata: "ACE" }, scheduledTime: { local: "2026-08-06 06:00+01:00" } },
  },
  {
    // Doppione dello stesso numero (le due finestre orarie si sovrappongono).
    number: "FR4001",
    departure: { airport: { iata: "BGY" }, scheduledTime: { local: "2026-08-06 06:20+02:00" } },
    arrival: { airport: { iata: "ACE" }, scheduledTime: { local: "2026-08-06 10:35+01:00" } },
  },
  {
    number: "W6 2201",
    status: "Canceled",
    airline: { name: "Wizz Air" },
    departure: { airport: { iata: "BGY" }, scheduledTime: { local: "2026-08-06 17:45+02:00" } },
    arrival: { airport: { iata: "ACE" }, scheduledTime: { local: "2026-08-06 21:55+01:00" } },
  },
];

test.describe("Lettura della risposta del fornitore", () => {
  const voli = voliDaRisposta(RISPOSTA, "ACE");

  test("tiene solo i voli che arrivano dove ha chiesto l'utente", () => {
    expect(voli.map((v) => v.volo)).toEqual(["FR4001", "W62201"]);
  });

  test("il numero perde lo spazio: 'FR 4001' diventa FR4001", () => {
    expect(voli[0].volo).toBe("FR4001");
  });

  test("gli orari sono quelli LOCALI, che sono gli unici che uno ricorda", () => {
    expect(voli[0].partenzaOra).toBe("06:20");
    expect(voli[0].arrivoOra).toBe("10:35");
  });

  test("l'ordine è quello di partenza", () => {
    expect(voli[0].partenzaOra < voli[1].partenzaOra).toBe(true);
  });

  test("un volo cancellato resta in elenco, ma dichiarato", () => {
    expect(voli[1].cancellato).toBe(true);
    expect(voli[0].cancellato).toBe(false);
  });

  test("la compagnia si vede in chiaro", () => {
    expect(voli[0].compagnia).toBe("Ryanair");
  });
});
