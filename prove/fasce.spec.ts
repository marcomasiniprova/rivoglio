import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fasciaArt7, type FattoVolo } from "../lib/regole/eu261";
import { valutaCancellato } from "../lib/regole/cancellato";
import { valutaCoincidenza, valutaNegato } from "../lib/regole/dichiarati";

/**
 * LE FASCE DELL'ART. 7 VALGONO SU OGNI PORTA, NON SOLO SU QUELLA
 * PRINCIPALE.
 *
 * L'ispezione del 12/08 ha trovato la stessa regola scritta in TRE punti,
 * e due erano sbagliate. Lo stesso volo Parigi → Riunione (9.370 km,
 * Francia con Francia) usciva 400€ se in ritardo e 600€ se cancellato o
 * con negato imbarco: al passeggero si prometteva la metà in più di
 * quanto la norma gli riconosce, ed è il falso positivo sull'IMPORTO che
 * la regola numero uno del progetto vieta come vieta quelli sull'esito.
 *
 * Stessa storia per il cancello territoriale: `valuta()` lo chiedeva,
 * negato imbarco e coincidenza persa no. Un New York → Toronto, fuori
 * ambito, bastava riaprirlo con «mi hanno lasciato a terra» per vedersi
 * rispondere «idoneo, 250€».
 */

const base = (x: Partial<FattoVolo>): FattoVolo =>
  ({
    voloIata: "ZZ1",
    dataLocale: "2026-08-11",
    vettoreOperativo: "AF",
    vettoreMarketing: null,
    partenzaIata: null,
    arrivoIata: null,
    arrivoPrevistoUtc: null,
    arrivoEffettivoUtc: null,
    stato: "atterrato",
    kmOrtodromica: null,
    fontiDiscordanti: false,
    fonte: "prova",
    ...x,
  }) as FattoVolo;

const PARIGI_RIUNIONE = {
  partenzaIata: "CDG",
  partenzaPaese: "FR",
  arrivoIata: "RUN",
  arrivoPaese: "RE",
  kmOrtodromica: 9369.64,
};

test.describe("Le fasce dell'art. 7, su ogni porta", () => {
  test("una tratta lunghissima ma tutta europea resta a 400", () => {
    // art. 7 lett. b): "tutte le tratte intracomunitarie superiori a 1500 km"
    expect(fasciaArt7(9369, true)).toBe(400);
    expect(fasciaArt7(9369, false)).toBe(600);
    expect(fasciaArt7(800, false)).toBe(250);
    // la riduzione dell'art. 7 par. 2 vale SOLO sulla fascia da 600
    expect(fasciaArt7(9369, false, true)).toBe(300);
    expect(fasciaArt7(9369, true, true)).toBe(400);
  });

  test("volo CANCELLATO Parigi-Riunione: 400, non 600", () => {
    const v = valutaCancellato(base({ ...PARIGI_RIUNIONE, stato: "cancellato" }), {
      preavviso: "nessuno",
      alternativa: "nessuna",
    } as never);
    expect(v.esito).toBe("idoneo");
    if (v.esito === "idoneo") expect(v.importo).toBe(400);
  });

  test("NEGATO IMBARCO Parigi-Riunione: 400, non 600", () => {
    const v = valutaNegato(base(PARIGI_RIUNIONE), {
      presenza: "inOrario",
      volonta: "involontario",
    });
    expect(v.esito).toBe("idoneo");
    if (v.esito === "idoneo") expect(v.importo).toBe(400);
  });

  test("COINCIDENZA PERSA dentro l'Unione, arrivo fra 3 e 4 ore: 400, non 300", () => {
    const v = valutaCoincidenza(
      base({ partenzaIata: "MXP", partenzaPaese: "IT", arrivoIata: "CDG", arrivoPaese: "FR", kmOrtodromica: 640 }),
      { stessaPrenotazione: "si", ritardoFinale: "fra3e4", destinazioneFinale: "RUN" } as never,
      8774,
    );
    expect(v.esito).toBe("idoneo");
    if (v.esito === "idoneo") expect(v.importo).toBe(400);
  });

  test("fuori dall'Europa non si vende nemmeno dichiarando un negato imbarco", () => {
    /* New York → Toronto: due paesi terzi, vettore canadese. Il check lo
       dichiara fuori ambito; riaprirlo dalla porta laterale non deve
       cambiare la risposta. */
    const v = valutaNegato(
      base({
        voloIata: "AC900",
        vettoreOperativo: "AC",
        partenzaIata: "JFK",
        partenzaPaese: "US",
        arrivoIata: "YYZ",
        arrivoPaese: "CA",
        kmOrtodromica: 588,
      }),
      { presenza: "inOrario", volonta: "involontario" },
    );
    expect(v.esito, "un caso fuori ambito non può uscire idoneo").not.toBe("idoneo");
  });

  test("nessun file si riscrive le fasce per conto suo", () => {
    /* La radice dei tre difetti era una sola: la regola copiata. Se
       ricompare una scaletta di importi scritta a mano, la suite si
       ferma prima che produca un altro numero sbagliato. */
    const radice = join(__dirname, "..", "lib", "regole");
    for (const file of ["cancellato.ts", "dichiarati.ts"]) {
      const testo = readFileSync(join(radice, file), "utf8");
      expect(testo, `${file} deve usare fasciaArt7, non una copia`).toContain("fasciaArt7");
      expect(
        testo,
        `${file} si sta riscrivendo le fasce: usa fasciaArt7 di eu261.ts`,
      ).not.toMatch(/km\s*<=\s*3500\s*\)?\s*return\s*400/);
    }
  });
});
