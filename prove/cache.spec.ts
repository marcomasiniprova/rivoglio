import { test, expect } from "@playwright/test";
import { rigaUsabile } from "../lib/voli/verifica";

/**
 * LA CACHE NON DEVE POTER CONGELARE UN "INCERTO".
 *
 * Il caso vero: FR4001 del 6 agosto. La riga era stata salvata l'8/08,
 * quando il cancello territoriale non esisteva ancora e gli scali non si
 * scrivevano. Da quel momento OGNI check su quel volo, di chiunque,
 * rispondeva "non riconosciamo l'aeroporto di partenza": il fornitore
 * non veniva più interpellato, quindi il dato buono non arrivava mai.
 *
 * Queste prove tengono ferma la regola: una riga che non sa dire da dove
 * si parte, dove si arriva o quanto è lunga la tratta si butta e il volo
 * si richiede.
 */

type Riga = Parameters<typeof rigaUsabile>[0];

const RIGA_PIENA: Riga = {
  id: "1",
  volo_iata: "FR4001",
  data_locale: "2026-08-06",
  vettore_operativo: "FR",
  vettore_marketing: null,
  partenza_iata: "BGY",
  partenza_citta: "Bergamo",
  arrivo_iata: "ACE",
  arrivo_citta: "Lanzarote",
  arrivo_previsto_utc: "2026-08-06T12:00:00Z",
  arrivo_effettivo_utc: "2026-08-06T14:35:00Z",
  stato: "atterrato",
  km_ortodromica: 2841,
  fonte: "aerodatabox",
  fonti_discordanti: false,
  orario_verificato: true,
  vettore_da_determinare: false,
};

test.describe("Cache dei voli — quando una riga vale", () => {
  test("una riga completa si usa", () => {
    expect(rigaUsabile(RIGA_PIENA)).toBe(true);
  });

  test("senza aeroporto di partenza si butta (il caso di FR4001)", () => {
    expect(rigaUsabile({ ...RIGA_PIENA, partenza_iata: null })).toBe(false);
  });

  test("senza aeroporto di arrivo si butta", () => {
    expect(rigaUsabile({ ...RIGA_PIENA, arrivo_iata: null })).toBe(false);
  });

  test("una stringa vuota vale come niente", () => {
    expect(rigaUsabile({ ...RIGA_PIENA, partenza_iata: "   " })).toBe(false);
  });

  test("il paese dal fornitore basta anche senza sigla IATA", () => {
    expect(rigaUsabile({ ...RIGA_PIENA, partenza_iata: null, partenza_paese: "IT" })).toBe(true);
  });

  test("l'ICAO basta anche senza sigla IATA", () => {
    expect(rigaUsabile({ ...RIGA_PIENA, arrivo_iata: null, arrivo_icao: "GCRR" })).toBe(true);
  });

  test("un volo atterrato senza distanza si richiede: la distanza decide l'importo", () => {
    expect(rigaUsabile({ ...RIGA_PIENA, km_ortodromica: null })).toBe(false);
    expect(rigaUsabile({ ...RIGA_PIENA, km_ortodromica: 0 })).toBe(false);
  });

  test("su un cancellato la distanza non serve: quel verdetto non passa dalle fasce", () => {
    expect(rigaUsabile({ ...RIGA_PIENA, stato: "cancellato", km_ortodromica: null })).toBe(true);
  });
});
