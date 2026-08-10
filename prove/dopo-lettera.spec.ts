import { test, expect } from "@playwright/test";
import {
  GIORNI_PRIMA_DELL_ENTE,
  GIORNI_PRIMA_DEL_SOLLECITO,
  RIFIUTI,
  prontoPerSollecito,
  schedaRifiuto,
} from "../lib/pratiche/rifiuto";
import { generaSollecito } from "../lib/lettera/genera";
import type { FattoVolo, Verdetto } from "../lib/regole/eu261";

/**
 * IL DOPO-LETTERA.
 *
 * Il 52% dei reclami validi viene respinto alla prima risposta. Fino a
 * ieri Rivolio si fermava alla lettera: il cliente si prendeva un no e
 * restava lì. Il secondo colpo è la parte che abbassa i rimborsi della
 * garanzia e giustifica il pagamento anticipato, quindi va tenuta ferma
 * da prove: la replica deve cambiare col motivo, e nessuna replica deve
 * poter promettere cose che non sappiamo.
 */

const FATTO: FattoVolo = {
  voloIata: "FR8321",
  dataLocale: "2026-06-02",
  vettoreOperativo: "FR",
  vettoreMarketing: null,
  partenzaIata: "BGY",
  arrivoIata: "PMO",
  arrivoPrevistoUtc: "2026-06-02T12:00:00Z",
  arrivoEffettivoUtc: "2026-06-02T15:40:00Z",
  stato: "atterrato",
  kmOrtodromica: 900,
  orarioVerificato: true,
  fonte: "aerodatabox",
};

const IDONEO: Verdetto = {
  esito: "idoneo",
  importo: 250,
  ritardoMinuti: 220,
  motivo: "Arrivo con 3 h e 40 min di ritardo su una tratta di 900 km: fascia da 250€.",
  versioneRegole: "2026.08.7",
};

const PRATICA = { passeggeri: [{ nome: "Mario", cognome: "Rossi" }], tipo: "singola" as const };

test.describe("Il motivo del rifiuto", () => {
  test("ogni motivo ha una replica, una spiegazione e i suoi riferimenti", () => {
    for (const r of RIFIUTI) {
      expect(r.replica.length, `${r.motivo}: replica vuota`).toBeGreaterThan(120);
      expect(r.spiegazione.length, `${r.motivo}: spiegazione vuota`).toBeGreaterThan(60);
      expect(r.riferimenti.length, `${r.motivo}: nessun riferimento`).toBeGreaterThan(0);
    }
  });

  test("nessuna replica usa il trattino lungo o promette un diritto", () => {
    for (const r of RIFIUTI) {
      expect(r.replica, `${r.motivo}`).not.toContain("—");
      expect(r.spiegazione, `${r.motivo}`).not.toContain("—");
      expect(r.spiegazione.toLowerCase(), `${r.motivo}`).not.toContain("hai diritto a");
    }
  });

  test("i casi in cui la compagnia può avere ragione lo dicono", () => {
    /* Meteo e sciopero esterno sono i due dove il no può reggere. Se la
       spiegazione li vendesse come vittorie sicure, staremmo mentendo a
       chi ha appena pagato. */
    const meteo = schedaRifiuto("meteo")!;
    const esterno = schedaRifiuto("sciopero_esterno")!;
    expect(meteo.peso).toBe("dipende");
    expect(esterno.peso).toBe("dipende");
    expect(meteo.spiegazione.toLowerCase()).toContain("non ti prometto");
  });

  test("un motivo inventato non produce niente", () => {
    expect(schedaRifiuto("qualunque_cosa")).toBeNull();
    expect(schedaRifiuto(null)).toBeNull();
    expect(schedaRifiuto(42)).toBeNull();
  });

  test("i motivi sono unici", () => {
    const codici = RIFIUTI.map((r) => r.motivo);
    expect(new Set(codici).size).toBe(codici.length);
  });
});

test.describe("Il sollecito cambia con la risposta ricevuta", () => {
  test("senza risposta parla di silenzio", () => {
    const l = generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-10", null)!;
    expect(l.oggetto).toContain("Sollecito");
    expect(l.corpo).toContain("non ho ricevuto alcun riscontro");
  });

  test("su un guasto tecnico ribatte sul guasto tecnico", () => {
    const l = generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-10", "guasto_tecnico")!;
    expect(l.oggetto).toContain("diniego");
    expect(l.corpo).toContain("problema tecnico");
    expect(l.corpo).toContain("normale esercizio");
    expect(l.corpo).not.toContain("non ho ricevuto alcun riscontro");
  });

  test("su uno sciopero del personale usa la distinzione che vale i soldi", () => {
    const l = generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-10", "sciopero_compagnia")!;
    expect(l.corpo).toContain("vostro personale");
    expect(l.corpo).toContain("non costituisce, in linea di principio, una circostanza eccezionale");
  });

  test("su una circostanza eccezionale generica ricorda di chi è l'onere della prova", () => {
    const l = generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-10", "eccezionale_generico")!;
    expect(l.corpo).toContain("onere");
    expect(l.corpo).toContain("articolo 5, paragrafo 3");
  });

  test("ogni motivo produce un sollecito diverso dagli altri", () => {
    const corpi = RIFIUTI.map((r) => generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-10", r.motivo)!.corpo);
    expect(new Set(corpi).size).toBe(RIFIUTI.length);
  });

  test("su un verdetto non idoneo non si scrive nessun sollecito", () => {
    const no: Verdetto = {
      esito: "non_idoneo",
      ritardoMinuti: 40,
      motivo: "sotto soglia",
      versioneRegole: "2026.08.7",
    };
    expect(generaSollecito(PRATICA, FATTO, no, "2026-06-10", "meteo")).toBeNull();
  });

  test("il sollecito non usa il trattino lungo e non dice 'hai diritto a'", () => {
    for (const r of RIFIUTI) {
      const l = generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-10", r.motivo)!;
      expect(l.corpo, r.motivo).not.toContain("—");
      expect(l.corpo.toLowerCase(), r.motivo).not.toContain("hai diritto a");
    }
  });

  test("senza la data del primo invio resta un campo da compilare, non una data inventata", () => {
    const l = generaSollecito(PRATICA, FATTO, IDONEO, null, null)!;
    expect(l.corpo).toContain("[data di invio del primo reclamo]");
  });
});

test.describe("Quando parte il sollecito", () => {
  test("sei settimane di silenzio, non due", () => {
    /* Le compagnie rispondono in 8-14 settimane: un sollecito al giorno
       15 arriva prima che qualcuno abbia aperto la pratica. */
    expect(GIORNI_PRIMA_DEL_SOLLECITO).toBe(42);
    expect(prontoPerSollecito(41, null)).toBe(false);
    expect(prontoPerSollecito(42, null)).toBe(true);
  });

  test("un rifiuto dichiarato scavalca l'attesa", () => {
    expect(prontoPerSollecito(1, "guasto_tecnico")).toBe(true);
    expect(prontoPerSollecito(0, "meteo")).toBe(true);
  });

  test("il silenzio dichiarato non scavalca niente: è la stessa attesa", () => {
    expect(prontoPerSollecito(3, "silenzio")).toBe(false);
  });

  test("l'ente arriva dopo il sollecito, non prima", () => {
    expect(GIORNI_PRIMA_DELL_ENTE).toBeGreaterThan(0);
    expect(GIORNI_PRIMA_DEL_SOLLECITO + GIORNI_PRIMA_DELL_ENTE).toBeGreaterThan(
      GIORNI_PRIMA_DEL_SOLLECITO,
    );
  });
});
