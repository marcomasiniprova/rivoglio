import { test, expect } from "@playwright/test";
import { cercaVettore, elencoVettori, valutaOperativo, vettoreValido } from "../lib/regole/operativo";
import { vettoreConLicenzaUE } from "../lib/regole/territorio";
import { valuta, type FattoVolo } from "../lib/regole/eu261";

/**
 * IL CODESHARE NON È PIÙ UN VICOLO CIECO.
 *
 * Quando il fornitore non sa chi ha operato il volo, il motore si ferma:
 * il reclamo deve andare a chi ha fatto volare l'aereo, e mandarlo alla
 * compagnia sbagliata vale un no secco. Da qui in avanti la domanda si
 * fa all'utente, che quella risposta ce l'ha sulla carta d'imbarco.
 *
 * Quello che queste prove tengono fermo: la scelta è CHIUSA (solo
 * compagnie che conosciamo), il verdetto resta del motore, e una
 * compagnia inventata non chiude niente.
 */

const IN_CODESHARE: FattoVolo = {
  voloIata: "AF1234",
  dataLocale: "2026-07-14",
  vettoreOperativo: "AF",
  vettoreMarketing: "AF",
  partenzaIata: "CDG",
  arrivoIata: "FCO",
  arrivoPrevistoUtc: "2026-07-14T12:00:00Z",
  arrivoEffettivoUtc: "2026-07-14T15:30:00Z",
  stato: "atterrato",
  kmOrtodromica: 1105,
  orarioVerificato: true,
  vettoreDaDeterminare: true,
  fonte: "aerodatabox",
};

test.describe("Codeshare — la domanda che chiude il caso", () => {
  test("senza risposta il caso resta incerto: è il punto di partenza", () => {
    /* Se questa prova cade, non è il codeshare a essersi rotto: è che il
       motore ha smesso di fermarsi, e allora la domanda non serve più. */
    const v = valuta(IN_CODESHARE);
    expect(v.esito).toBe("incerto");
    expect(v.motivo.toLowerCase()).toContain("codeshare");
  });

  test("con la compagnia dichiarata il verdetto si chiude", () => {
    const v = valutaOperativo(IN_CODESHARE, "AZ");
    expect(v?.esito).toBe("idoneo");
    /* Parigi → Roma fa 1105 km: sotto i 1500, quindi la fascia è 250€. */
    if (v?.esito === "idoneo") expect(v.importo).toBe(250);
  });

  test("una compagnia che non conosciamo non chiude niente", () => {
    expect(valutaOperativo(IN_CODESHARE, "QQ")).toBeNull();
    expect(valutaOperativo(IN_CODESHARE, "")).toBeNull();
    expect(valutaOperativo(IN_CODESHARE, 42)).toBeNull();
    expect(valutaOperativo(IN_CODESHARE, "<script>")).toBeNull();
  });

  test("la risposta dell'utente non può ribaltare un dato oggettivo", () => {
    /* Sotto le tre ore resta no, chiunque abbia operato: il vettore
       cambia il destinatario della lettera, non il ritardo. */
    const corto = { ...IN_CODESHARE, arrivoEffettivoUtc: "2026-07-14T14:00:00Z" };
    expect(valutaOperativo(corto, "AZ")?.esito).toBe("non_idoneo");
  });

  test("dichiarare un vettore extra UE su una partenza europea non toglie la copertura", () => {
    /* Parigi → Roma con Delta sarebbe coperto lo stesso: dall'Europa si
       parte, e la lettera a) non guarda la compagnia (art. 3 par. 1). */
    expect(valutaOperativo(IN_CODESHARE, "DL")?.esito).toBe("idoneo");
  });

  test("la scelta è chiusa e riconosce solo codici veri", () => {
    expect(vettoreValido("dl")?.nome).toBe("Delta Air Lines");
    expect(vettoreValido("FR")?.nome).toBe("Ryanair");
    expect(vettoreValido("ZZZ")).toBeNull();
    expect(vettoreValido(null)).toBeNull();
  });
});

test.describe("Codeshare — il campo di ricerca", () => {
  test("si cerca per nome, come lo scrive una persona", () => {
    expect(cercaVettore("delta").some((v) => v.iata === "DL")).toBe(true);
    expect(cercaVettore("ryan").some((v) => v.iata === "FR")).toBe(true);
    expect(cercaVettore("turkish").some((v) => v.iata === "TK")).toBe(true);
  });

  test("gli accenti non fermano la ricerca", () => {
    expect(cercaVettore("aerolineas").some((v) => v.iata === "AR")).toBe(true);
  });

  test("chi sa il codice lo scrive e basta", () => {
    expect(cercaVettore("ek")[0]?.iata).toBe("EK");
  });

  test("una lettera sola non cerca niente", () => {
    expect(cercaVettore("d")).toEqual([]);
  });

  test("le compagnie con la scheda completa vincono sui doppioni", () => {
    const tutte = elencoVettori();
    const codici = tutte.map((v) => v.iata);
    expect(new Set(codici).size).toBe(codici.length);
    expect(tutte.length).toBeGreaterThan(50);
  });
});

test.describe("Licenza del vettore — i grandi extra UE si riconoscono", () => {
  test("Delta, United e Qatar non hanno licenza europea", () => {
    expect(vettoreConLicenzaUE("DL")).toBe(false);
    expect(vettoreConLicenzaUE("UA")).toBe(false);
    expect(vettoreConLicenzaUE("QR")).toBe(false);
  });

  test("British Airways è fuori dall'Unione dalla Brexit", () => {
    expect(vettoreConLicenzaUE("BA")).toBe(false);
  });

  test("le europee restano europee", () => {
    expect(vettoreConLicenzaUE("FR")).toBe(true);
    expect(vettoreConLicenzaUE("AZ")).toBe(true);
  });

  test("la Svizzera resta un punto interrogativo, non un no", () => {
    /* Applica il Regolamento per accordo bilaterale, non come Stato
       membro: senza fonte verificata non ci sbilanciamo. */
    expect(vettoreConLicenzaUE("LX")).toBeNull();
  });

  test("una compagnia che non conosciamo non si indovina", () => {
    expect(vettoreConLicenzaUE("QZ")).toBeNull();
  });
});
