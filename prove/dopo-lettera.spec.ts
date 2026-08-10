import { test, expect } from "@playwright/test";
import {
  GIORNI_PRIMA_DELL_ENTE,
  GIORNI_PRIMA_DEL_SOLLECITO,
  RIFIUTI,
  prontoPerSollecito,
  schedaRifiuto,
} from "../lib/pratiche/rifiuto";
import { generaSegnalazioneEnte, generaSollecito } from "../lib/lettera/genera";
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

test.describe("La segnalazione all'ente nazionale", () => {
  test("la lettera cita il volo, i due invii e cosa si chiede", () => {
    const l = generaSegnalazioneEnte(PRATICA, FATTO, IDONEO, "2026-06-10", "2026-07-25", null)!;
    expect(l.oggetto).toContain("art. 16");
    expect(l.corpo).toContain("FR8321");
    expect(l.corpo).toContain("10 giugno 2026");
    expect(l.corpo).toContain("25 luglio 2026");
    expect(l.corpo).toContain("accerti la violazione");
  });

  test("se la compagnia ha risposto no, la segnalazione lo dice", () => {
    const l = generaSegnalazioneEnte(PRATICA, FATTO, IDONEO, "2026-06-10", "2026-07-25", "meteo")!;
    expect(l.corpo).toContain("ha respinto la richiesta");
    expect(l.corpo).not.toContain("non ha dato alcun riscontro");
  });

  test("se la compagnia ha taciuto, la segnalazione dice il silenzio", () => {
    const l = generaSegnalazioneEnte(PRATICA, FATTO, IDONEO, "2026-06-10", "2026-07-25", "silenzio")!;
    expect(l.corpo).toContain("non ha dato alcun riscontro");
  });

  test("senza le date restano campi da compilare, non date inventate", () => {
    const l = generaSegnalazioneEnte(PRATICA, FATTO, IDONEO, null, null, null)!;
    expect(l.corpo).toContain("[data del primo reclamo]");
    expect(l.corpo).toContain("[data del sollecito]");
  });

  test("non promette che l'ente paga: quella promessa non la possiamo mantenere", () => {
    const l = generaSegnalazioneEnte(PRATICA, FATTO, IDONEO, "2026-06-10", "2026-07-25", null)!;
    /* L'ente accerta e sanziona, ma non liquida la compensazione al posto
       della compagnia. Se la lettera lo lasciasse credere, la garanzia si
       riempirebbe di rimborsi e ce li saremmo cercati. */
    expect(l.corpo.toLowerCase()).not.toContain("mi paghi");
    expect(l.corpo.toLowerCase()).not.toContain("liquidi la compensazione");
  });

  test("su un verdetto non idoneo non si scrive nessuna segnalazione", () => {
    const no: Verdetto = {
      esito: "non_idoneo",
      ritardoMinuti: 40,
      motivo: "sotto soglia",
      versioneRegole: "2026.08.7",
    };
    expect(generaSegnalazioneEnte(PRATICA, FATTO, no, "2026-06-10", null, null)).toBeNull();
  });

  test("niente trattino lungo, come ovunque", () => {
    const l = generaSegnalazioneEnte(PRATICA, FATTO, IDONEO, "2026-06-10", "2026-07-25", "meteo")!;
    expect(l.corpo).not.toContain("—");
    expect(l.oggetto).not.toContain("—");
  });
});

test.describe("La guida al giudice di pace", () => {
  test("si apre e dice subito che non serve un avvocato", async ({ page }) => {
    await page.goto("/giudice-di-pace");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("non paga");
    await expect(page.getByText("non ti serve per forza un avvocato")).toBeVisible();
  });

  test("dichiara cosa NON facciamo: niente atti, niente consulenza", async ({ page }) => {
    await page.goto("/giudice-di-pace");
    await expect(page.getByText("Non siamo avvocati", { exact: false })).toBeVisible();
  });

  test("non scrive cifre precise che invecchiano", async ({ page }) => {
    /* Una cifra sbagliata in una pagina che parla di soldi è peggio di
       nessuna cifra: il contributo unificato cambia nel tempo. */
    await page.goto("/giudice-di-pace");
    const testo = (await page.locator("main").innerText()).toLowerCase();
    expect(testo).toContain("poche decine di euro");
    expect(testo).not.toMatch(/contributo unificato (è|e) di \d+/);
  });

  test("niente trattino lungo e niente 'hai diritto a'", async ({ page }) => {
    await page.goto("/giudice-di-pace");
    const testo = await page.locator("main").innerText();
    expect(testo).not.toContain("—");
    expect(testo.toLowerCase()).not.toContain("hai diritto a");
  });
});
