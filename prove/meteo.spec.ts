import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { descriviWmo, fraseMeteo, type MeteoOrario } from "../lib/meteo/openmeteo";

/**
 * Il meteo serve a UNA cosa: smontare la scusa del maltempo nella lettera di
 * risposta a un no. Non tocca mai un verdetto del check. Queste prove tengono
 * ferme le regole che contano: i codici tradotti in italiano piano, la riga
 * che NON si scrive senza un dato (mai inventare, mai uno zero al posto di un
 * buco), e l'aggancio all'istanza dedicata (auth, variabili giuste, password
 * mai nel codice).
 */

const base: MeteoOrario = {
  descrizione: "sereno",
  temperaturaC: 22,
  rafficheKmh: 8.4,
  precipitazioneMm: 0,
  neveMm: 0,
  nubiBassePct: 10,
  oraUtc: "16:00",
  fonte: "Open-Meteo, archivio ERA5",
};

test.describe("Meteo per la lettera", () => {
  test("i codici WMO diventano italiano piano", () => {
    expect(descriviWmo(0)).toBe("sereno");
    expect(descriviWmo(3)).toBe("coperto");
    expect(descriviWmo(45)).toBe("nebbia");
    expect(descriviWmo(61)).toBe("pioggia");
    expect(descriviWmo(71)).toBe("neve");
    expect(descriviWmo(95)).toBe("temporale");
  });

  test("un codice mancante non diventa una frase falsa", () => {
    expect(descriviWmo(null)).toBe("condizioni non disponibili");
    expect(descriviWmo(NaN)).toBe("condizioni non disponibili");
  });

  test("senza dato meteo, NIENTE riga: la lettera non inventa", () => {
    expect(fraseMeteo(null)).toBeNull();
  });

  test("con un dato vero: tempo, raffiche, precipitazione e la FONTE", () => {
    const frase = fraseMeteo(base);
    expect(frase).toContain("sereno");
    expect(frase).toContain("raffiche 8 km/h"); // arrotondato
    expect(frase).toContain("nessuna precipitazione"); // 0 mm detto in chiaro
    expect(frase).toContain("16:00");
    expect(frase).toContain("Open-Meteo"); // la fonte va sempre citata
  });

  test("se piove, la frase porta i millimetri veri, non un aggettivo", () => {
    const frase = fraseMeteo({ ...base, descrizione: "pioggia", precipitazioneMm: 4.2 });
    expect(frase).toContain("precipitazioni 4.2 mm");
  });

  test("neve e nubi basse compaiono solo quando contano davvero", () => {
    // neve a zero e nubi basse deboli: non se ne parla, sarebbe rumore
    const pulito = fraseMeteo(base)!;
    expect(pulito).not.toContain("neve");
    expect(pulito).not.toContain("nubi basse");
    // neve vera e nebbia estesa: entrano, sono la prova
    const brutto = fraseMeteo({ ...base, neveMm: 3.1, nubiBassePct: 95 })!;
    expect(brutto).toContain("neve 3.1 mm");
    expect(brutto).toContain("nubi basse molto estese 95%");
  });

  test("un dato assente (null) non diventa mai zero", () => {
    // solo la temperatura: la riga esce con quella, senza inventare
    // vento o pioggia a zero dove il dato non c'è.
    const frase = fraseMeteo({
      descrizione: null,
      temperaturaC: 4,
      rafficheKmh: null,
      precipitazioneMm: null,
      neveMm: null,
      nubiBassePct: null,
      oraUtc: "09:00",
      fonte: "Open-Meteo, archivio ERA5",
    })!;
    expect(frase).toContain("4°C");
    expect(frase).not.toContain("raffiche");
    expect(frase).not.toContain("precipitazione");
  });

  test("la frase può dire DI QUALE aeroporto parla", () => {
    const frase = fraseMeteo(base, "in partenza da Milano Malpensa (MXP)")!;
    expect(frase).toContain("in partenza da Milano Malpensa (MXP)");
  });
});

/* Il modulo parla con l'istanza DEDICATA sul VPS: queste prove leggono il
   sorgente e bloccano le tre cose che, se saltano, rompono l'integrazione in
   silenzio, e che nessuna prova di rete vedrebbe qui in sandbox: auth
   mancante, variabili sbagliate, password scritta nel codice. */
test.describe("L'aggancio all'istanza dedicata", () => {
  const codice = readFileSync("lib/meteo/openmeteo.ts", "utf8");

  test("c'è l'autenticazione Basic e la password viene SOLO dall'ambiente", () => {
    expect(codice).toContain("process.env.METEO_API_PASSWORD");
    expect(codice).toContain("Basic ");
    // la password non si costruisce da una stringa scritta nel codice
    expect(codice).not.toMatch(/METEO_PASSWORD\s*=\s*["'][A-Za-z0-9]/);
  });

  test("l'archivio chiede le variabili che l'istanza ha davvero", () => {
    expect(codice).toContain("wind_gusts_10m");
    expect(codice).toContain("snowfall_water_equivalent");
    expect(codice).toContain("cloud_cover_low");
    // NON la vecchia, che su questa istanza tornerebbe null
    expect(codice).not.toContain("windspeed_10m");
  });

  test("i voli recenti passano dalle previsioni, i vecchi dall'archivio", () => {
    expect(codice).toContain("/v1/forecast");
    expect(codice).toContain("/v1/archive");
    expect(codice).toContain("weather_code");
  });
});
