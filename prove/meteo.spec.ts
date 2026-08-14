import { test, expect } from "@playwright/test";
import { descriviWmo, fraseMeteo, type MeteoOrario } from "../lib/meteo/openmeteo";

/**
 * Il meteo serve a UNA cosa: smontare la scusa del maltempo nella lettera di
 * risposta a un no. Non tocca mai un verdetto del check. Queste prove tengono
 * ferme le due regole che contano: la traduzione dei codici in italiano piano
 * e, soprattutto, che senza un dato la riga NON si scrive (mai inventare).
 */

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

  test("con un dato vero, la frase dice tempo, vento e la FONTE", () => {
    const m: MeteoOrario = {
      descrizione: "sereno",
      temperaturaC: 22,
      ventoKmh: 8.4,
      precipitazioneMm: 0,
      oraUtc: "16:00",
      fonte: "Open-Meteo, archivio ERA5",
    };
    const frase = fraseMeteo(m);
    expect(frase).toContain("sereno");
    expect(frase).toContain("vento 8 km/h"); // arrotondato
    expect(frase).toContain("nessuna precipitazione"); // 0 mm, detto in chiaro
    expect(frase).toContain("16:00");
    expect(frase).toContain("Open-Meteo"); // la fonte va sempre citata
  });

  test("se piove, la frase porta i millimetri veri, non un aggettivo", () => {
    const m: MeteoOrario = {
      descrizione: "pioggia",
      temperaturaC: 11,
      ventoKmh: null,
      precipitazioneMm: 4.2,
      oraUtc: "09:00",
      fonte: "Open-Meteo, archivio ERA5",
    };
    const frase = fraseMeteo(m);
    expect(frase).toContain("precipitazioni 4.2 mm");
  });
});
