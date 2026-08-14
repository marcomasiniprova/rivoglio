import { test, expect } from "@playwright/test";
import { valutaCoincidenzaDueTratte, type RisposteCoincidenza } from "../lib/regole/dichiarati";
import type { FattoVolo } from "../lib/regole/eu261";

/**
 * COINCIDENZA PERSA, LETTA SUI DUE VOLI (sito, dal 14/08).
 *
 * La versione oggettiva: invece di fidarsi della sola dichiarazione, il
 * motore legge il primo volo (in ritardo) e la coincidenza, e prova in modo
 * SEVERO che il ritardo del primo ha fatto perdere il secondo, cioè che il
 * primo è atterrato DOPO che la coincidenza era già partita.
 *
 * Le cose che questi test blindano, in ordine di quanto pesano:
 *  1. la fascia si calcola sulla destinazione FINALE, non sullo scalo di
 *     coincidenza: un Milano → Francoforte → New York vale 600, non 400;
 *  2. su una destinazione finale INCERTA la fascia resta a 400, mai 600:
 *     un falso positivo sull'importo è quello che la regola numero uno
 *     vieta, e va evitato anche verso l'alto;
 *  3. se sulla carta la coincidenza era ancora prendibile, esce incerto;
 *  4. il cancello territoriale vale anche qui: fuori ambito non si vende.
 */

const volo = (x: Partial<FattoVolo>): FattoVolo =>
  ({
    voloIata: "ZZ1",
    dataLocale: "2026-08-11",
    vettoreOperativo: "LH",
    vettoreMarketing: null,
    partenzaIata: null,
    arrivoIata: null,
    partenzaPrevistoUtc: null,
    arrivoPrevistoUtc: null,
    arrivoEffettivoUtc: null,
    stato: "atterrato",
    kmOrtodromica: null,
    fontiDiscordanti: false,
    fonte: "prova",
    ...x,
  }) as FattoVolo;

/* LEG 1 — Milano Malpensa → Francoforte, in ritardo: doveva atterrare alle
   11:00, è atterrato alle 14:20 (3 h 20 di ritardo). */
const leg1 = () =>
  volo({
    voloIata: "LH1001",
    partenzaIata: "MXP",
    partenzaPaese: "IT",
    arrivoIata: "FRA",
    arrivoPaese: "DE",
    partenzaPrevistoUtc: "2026-08-11T09:00:00Z",
    arrivoPrevistoUtc: "2026-08-11T11:00:00Z",
    arrivoEffettivoUtc: "2026-08-11T14:20:00Z",
    kmOrtodromica: 520,
  });

/* LEG 2 — Francoforte → New York, doveva partire alle 12:00: quando il leg 1
   è atterrato (14:20) era già in volo da due ore. Coincidenza persa. */
const leg2NewYork = () =>
  volo({
    voloIata: "LH400",
    partenzaIata: "FRA",
    partenzaPaese: "DE",
    arrivoIata: "JFK",
    arrivoPaese: "US",
    partenzaPrevistoUtc: "2026-08-11T12:00:00Z",
    arrivoPrevistoUtc: "2026-08-11T20:00:00Z",
    kmOrtodromica: 6200,
  });

/* LEG 2 tutta europea — Francoforte → Lisbona, stessa dinamica. */
const leg2Lisbona = () =>
  volo({
    voloIata: "LH1170",
    partenzaIata: "FRA",
    partenzaPaese: "DE",
    arrivoIata: "LIS",
    arrivoPaese: "PT",
    partenzaPrevistoUtc: "2026-08-11T12:00:00Z",
    arrivoPrevistoUtc: "2026-08-11T14:30:00Z",
    kmOrtodromica: 1860,
  });

const KM_MXP_JFK = 6851;
const KM_MXP_LIS = 1857;

const OLTRE4: RisposteCoincidenza = { unica: "si", ritardoFinale: "oltre4" };
const FRA3E4: RisposteCoincidenza = { unica: "si", ritardoFinale: "fra3e4" };

test.describe("Coincidenza persa, verificata sulle due tratte", () => {
  test("intercontinentale, arrivo oltre le 4 ore: 600 sul viaggio intero", () => {
    const v = valutaCoincidenzaDueTratte(leg1(), leg2NewYork(), OLTRE4, KM_MXP_JFK);
    expect(v.esito).toBe("idoneo");
    if (v.esito === "idoneo") expect(v.importo).toBe(600);
  });

  test("intercontinentale, arrivo fra 3 e 4 ore: la riduzione porta a 300", () => {
    const v = valutaCoincidenzaDueTratte(leg1(), leg2NewYork(), FRA3E4, KM_MXP_JFK);
    expect(v.esito).toBe("idoneo");
    if (v.esito === "idoneo") expect(v.importo).toBe(300);
  });

  test("viaggio tutto europeo, oltre 1500 km: 400, mai 600", () => {
    const v = valutaCoincidenzaDueTratte(leg1(), leg2Lisbona(), OLTRE4, KM_MXP_LIS);
    expect(v.esito).toBe("idoneo");
    if (v.esito === "idoneo") expect(v.importo).toBe(400);
  });

  test("destinazione finale INCERTA: la fascia resta a 400, non sale a 600", () => {
    /* La sicurezza che conta: se della destinazione finale non sappiamo il
       paese, NON si apre la fascia da 600. Un dato ignoto non deve mai far
       chiedere più del dovuto. */
    const ignota = volo({
      partenzaIata: "FRA",
      partenzaPaese: "DE",
      arrivoIata: "ZZZ",
      arrivoPaese: null,
      partenzaPrevistoUtc: "2026-08-11T12:00:00Z",
      arrivoPrevistoUtc: "2026-08-11T20:00:00Z",
    });
    const v = valutaCoincidenzaDueTratte(leg1(), ignota, OLTRE4, KM_MXP_JFK);
    expect(v.esito).toBe("idoneo");
    if (v.esito === "idoneo") expect(v.importo).toBe(400);
  });

  test("il primo era atterrato PRIMA che la coincidenza partisse: incerto", () => {
    /* Coincidenza che partiva alle 15:00, primo atterrato alle 14:20: sulla
       carta era prendibile. Non si vende come sicuro. */
    const prendibile = volo({
      partenzaIata: "FRA",
      partenzaPaese: "DE",
      arrivoIata: "JFK",
      arrivoPaese: "US",
      partenzaPrevistoUtc: "2026-08-11T15:00:00Z",
      arrivoPrevistoUtc: "2026-08-11T23:00:00Z",
    });
    const v = valutaCoincidenzaDueTratte(leg1(), prendibile, OLTRE4, KM_MXP_JFK);
    expect(v.esito).toBe("incerto");
  });

  test("secondo volo non trovato (sconosciuto): incerto, e dice di controllare il numero", () => {
    /* verificaVolo non torna mai "non trovato": torna un fatto sconosciuto
       con gli scali vuoti. Il motore deve riconoscerlo e dire di controllare
       il numero, non "i due voli non si collegano". */
    const nonLetto = volo({
      voloIata: "AB1234",
      partenzaIata: null,
      arrivoIata: null,
      partenzaPrevistoUtc: null,
      arrivoPrevistoUtc: null,
      arrivoEffettivoUtc: null,
      stato: "sconosciuto",
      kmOrtodromica: null,
    });
    const v = valutaCoincidenzaDueTratte(leg1(), nonLetto, OLTRE4, KM_MXP_JFK);
    expect(v.esito).toBe("incerto");
    expect(v.motivo).toContain("numero");
  });

  test("i due voli non si collegano (scali diversi): incerto", () => {
    const altroScalo = volo({
      partenzaIata: "MUC",
      partenzaPaese: "DE",
      arrivoIata: "JFK",
      arrivoPaese: "US",
      partenzaPrevistoUtc: "2026-08-11T12:00:00Z",
      arrivoPrevistoUtc: "2026-08-11T20:00:00Z",
    });
    const v = valutaCoincidenzaDueTratte(leg1(), altroScalo, OLTRE4, KM_MXP_JFK);
    expect(v.esito).toBe("incerto");
  });

  test("biglietti separati: non spetta", () => {
    const v = valutaCoincidenzaDueTratte(
      leg1(),
      leg2NewYork(),
      { unica: "no", ritardoFinale: "oltre4" },
      KM_MXP_JFK,
    );
    expect(v.esito).toBe("non_idoneo");
    expect(v.motivo).toContain("separati");
  });

  test("arrivo finale sotto le 3 ore: non spetta", () => {
    const v = valutaCoincidenzaDueTratte(
      leg1(),
      leg2NewYork(),
      { unica: "si", ritardoFinale: "meno3" },
      KM_MXP_JFK,
    );
    expect(v.esito).toBe("non_idoneo");
  });

  test("primo volo fuori ambito (New York → Toronto): non si vende", () => {
    /* Il cancello territoriale vale anche qui: un primo volo terzo → terzo
       con vettore non europeo non diventa idoneo dichiarando la
       coincidenza. */
    const primoFuori = volo({
      voloIata: "AC900",
      vettoreOperativo: "AC",
      partenzaIata: "JFK",
      partenzaPaese: "US",
      arrivoIata: "YYZ",
      arrivoPaese: "CA",
      partenzaPrevistoUtc: "2026-08-11T09:00:00Z",
      arrivoPrevistoUtc: "2026-08-11T11:00:00Z",
      arrivoEffettivoUtc: "2026-08-11T14:20:00Z",
      kmOrtodromica: 590,
    });
    const secondoDaToronto = volo({
      partenzaIata: "YYZ",
      partenzaPaese: "CA",
      arrivoIata: "LAX",
      arrivoPaese: "US",
      partenzaPrevistoUtc: "2026-08-11T12:00:00Z",
      arrivoPrevistoUtc: "2026-08-11T18:00:00Z",
    });
    const v = valutaCoincidenzaDueTratte(primoFuori, secondoDaToronto, OLTRE4, 3500);
    expect(v.esito, "un caso fuori ambito non può uscire idoneo").not.toBe("idoneo");
  });
});
