import type { FattoVolo, Verdetto } from "./eu261";

/**
 * IL GOLDEN SET. Ogni caso è etichettato A MANO: l'esito atteso è stato
 * derivato leggendo il Regolamento, non facendo girare il motore.
 * Se il motore e questo file discordano, si indaga: non si "aggiusta"
 * mai l'etichetta per far passare la prova.
 *
 * Distribuzione (da SPEC §4): 9 idonei, 12 non idonei, 11 incerti, con i
 * confini cattivi dentro: 179/180 minuti, 1500/1501 km, 3500/3501 km,
 * 239/240 minuti sul lungo raggio, dati mancanti, fonti discordanti,
 * orario senza tracciamento Live, codeshare da risolvere, sciopero noto.
 * In coda il
 * PRIMO CASO REALE: FR4001 del 6/08/2026 (il volo di Valerio).
 */

type Caso = {
  nome: string;
  fatto: FattoVolo;
  atteso:
    | { esito: "idoneo"; importo: 250 | 300 | 400 | 600 }
    | { esito: "incerto" }
    | { esito: "non_idoneo" };
};

/** Un fatto di base sano, da variare caso per caso. */
function fatto(sovrascrivi: Partial<FattoVolo>): FattoVolo {
  return {
    voloIata: "FR8321",
    dataLocale: "2026-07-15",
    vettoreOperativo: "FR",
    /* La tratta serve al cancello territoriale (art. 3): senza aeroporti
       il motore non sa se il regolamento si applica e risponde incerto.
       Bergamo → Palermo, tutto dentro l'Unione: così i casi qui sotto
       misurano quello che vogliono misurare, cioè soglia e fasce. Nei
       casi in cui il chilometraggio viene sovrascritto la tratta resta
       questa: la fascia la decide `kmOrtodromica`, non lo scalo. */
    partenzaIata: "BGY",
    arrivoIata: "PMO",
    arrivoPrevistoUtc: "2026-07-15T20:00:00Z",
    arrivoEffettivoUtc: "2026-07-15T20:00:00Z",
    stato: "atterrato",
    kmOrtodromica: 900,
    // Il caso base è tracciato (quality Live): i casi sul dato non
    // verificato lo sovrascrivono apposta.
    orarioVerificato: true,
    fonte: "casi-oro",
    ...sovrascrivi,
  };
}

/** Arrivo effettivo = previsto (20:00Z) + minuti. */
function conRitardo(minuti: number, resto: Partial<FattoVolo> = {}): FattoVolo {
  const eff = new Date(Date.parse("2026-07-15T20:00:00Z") + minuti * 60_000);
  return fatto({ arrivoEffettivoUtc: eff.toISOString(), ...resto });
}

export const CASI_ORO: Caso[] = [
  // ---------- IDONEI (9) — etichettati a mano sulle fasce del 261 ----------
  // ≤1500 km e ritardo ≥180' → 250€
  { nome: "corto raggio, 181 minuti", fatto: conRitardo(181, { kmOrtodromica: 700 }), atteso: { esito: "idoneo", importo: 250 } },
  { nome: "soglia esatta: 180 minuti, 1500 km esatti", fatto: conRitardo(180, { kmOrtodromica: 1500 }), atteso: { esito: "idoneo", importo: 250 } },
  { nome: "corto raggio, ritardo enorme (6h)", fatto: conRitardo(360, { kmOrtodromica: 300 }), atteso: { esito: "idoneo", importo: 250 } },
  // 1500 < km ≤ 3500 → 400€
  { nome: "appena oltre i 1500 km (1501)", fatto: conRitardo(200, { kmOrtodromica: 1501 }), atteso: { esito: "idoneo", importo: 400 } },
  { nome: "medio raggio, 3500 km esatti", fatto: conRitardo(210, { kmOrtodromica: 3500 }), atteso: { esito: "idoneo", importo: 400 } },
  { nome: "medio raggio, 4 ore", fatto: conRitardo(240, { kmOrtodromica: 2000 }), atteso: { esito: "idoneo", importo: 400 } },
  /* >3500 km FUORI dall'Unione: 3-4h → 300€ (riduzione 50%), ≥4h → 600€.
     La tratta va sovrascritta con uno scalo extra UE: la lettera b)
     dell'art. 7 tiene a 400€ TUTTE le tratte intracomunitarie sopra i
     1500 km, quanto lunghe siano. Con Bergamo → Palermo questi tre casi
     misurerebbero l'esatto contrario di quello che dicono. */
  { nome: "lungo raggio extra UE, 239 minuti: importo dimezzato", fatto: conRitardo(239, { partenzaIata: "FCO", arrivoIata: "JFK", kmOrtodromica: 3501 }), atteso: { esito: "idoneo", importo: 300 } },
  { nome: "lungo raggio extra UE, 240 minuti esatti: pieno", fatto: conRitardo(240, { partenzaIata: "FCO", arrivoIata: "JFK", kmOrtodromica: 6000 }), atteso: { esito: "idoneo", importo: 600 } },
  { nome: "lungo raggio extra UE, ritardo di una notte", fatto: conRitardo(500, { partenzaIata: "FCO", arrivoIata: "BKK", kmOrtodromica: 8000 }), atteso: { esito: "idoneo", importo: 600 } },

  /* LA LETTERA b) DELL'ART. 7 (trovata mancante il 9/08). Una tratta che
     parte e arriva dentro lo spazio europeo resta a 400€ anche se è
     lunghissima: Parigi → Riunione fa 9.300 km ed è Francia-Francia.
     Prima il motore diceva 600, cioè prometteva il 50% in più di quanto
     la norma riconosce: falso positivo sull'importo. */
  { nome: "ART. 7 b): intracomunitario oltre 3500 km (Parigi → Riunione), restano 400€", fatto: conRitardo(300, { voloIata: "AF640", vettoreOperativo: "AF", partenzaIata: "CDG", arrivoIata: "RUN", kmOrtodromica: 9346 }), atteso: { esito: "idoneo", importo: 400 } },
  { nome: "ART. 7 b): intracomunitario lungo, 3h05: 400€ pieni, nessuna riduzione", fatto: conRitardo(185, { voloIata: "AY1", vettoreOperativo: "AY", partenzaIata: "HEL", arrivoIata: "LPA", kmOrtodromica: 4900 }), atteso: { esito: "idoneo", importo: 400 } },

  // ---------- NON IDONEI (9) — sotto soglia: risposta chiara e gratis ----------
  { nome: "179 minuti: un minuto sotto la soglia", fatto: conRitardo(179, { kmOrtodromica: 700 }), atteso: { esito: "non_idoneo" } },
  { nome: "in perfetto orario", fatto: conRitardo(0), atteso: { esito: "non_idoneo" } },
  { nome: "in anticipo", fatto: conRitardo(-12), atteso: { esito: "non_idoneo" } },
  { nome: "45 minuti", fatto: conRitardo(45), atteso: { esito: "non_idoneo" } },
  { nome: "2 ore su lungo raggio (assistenza sì, compensazione no)", fatto: conRitardo(120, { kmOrtodromica: 4000 }), atteso: { esito: "non_idoneo" } },
  { nome: "90 minuti", fatto: conRitardo(90), atteso: { esito: "non_idoneo" } },
  { nome: "178 minuti", fatto: conRitardo(178), atteso: { esito: "non_idoneo" } },
  { nome: "mezz'ora su lungo raggio", fatto: conRitardo(30, { kmOrtodromica: 7000 }), atteso: { esito: "non_idoneo" } },
  { nome: "165 minuti", fatto: conRitardo(165, { kmOrtodromica: 1400 }), atteso: { esito: "non_idoneo" } },

  // ---------- INCERTI (7) — nel dubbio NON si vende, mai ----------
  { nome: "stato sconosciuto", fatto: fatto({ stato: "sconosciuto" }), atteso: { esito: "incerto" } },
  { nome: "cancellato (serve il preavviso, che l'API non sa)", fatto: fatto({ stato: "cancellato", arrivoEffettivoUtc: null }), atteso: { esito: "incerto" } },
  { nome: "dirottato", fatto: fatto({ stato: "dirottato" }), atteso: { esito: "incerto" } },
  {
    nome: "TRAPPOLA: ritardo enorme MA fonti discordanti",
    fatto: conRitardo(400, { fontiDiscordanti: true }),
    atteso: { esito: "incerto" },
  },
  { nome: "atterrato ma senza orario effettivo", fatto: fatto({ arrivoEffettivoUtc: null }), atteso: { esito: "incerto" } },
  {
    nome: "TRAPPOLA: ritardo sopra soglia MA distanza ignota",
    fatto: conRitardo(200, { kmOrtodromica: null }),
    atteso: { esito: "incerto" },
  },
  { nome: "orari illeggibili", fatto: fatto({ arrivoPrevistoUtc: "boh", arrivoEffettivoUtc: "mah" }), atteso: { esito: "incerto" } },

  // ------- I campi veri di AeroDataBox (attività #26, 07-08/08) -------
  {
    nome: "TRAPPOLA: ritardo enorme MA orario senza tracciamento Live",
    fatto: conRitardo(400, { orarioVerificato: false }),
    atteso: { esito: "incerto" },
  },
  {
    nome: "TRAPPOLA: 179 minuti senza Live: nemmeno il no si dà su una stima",
    fatto: conRitardo(179, { orarioVerificato: false }),
    atteso: { esito: "incerto" },
  },
  {
    nome: "TRAPPOLA: sopra soglia MA codeshare da risolvere",
    fatto: conRitardo(300, { vettoreDaDeterminare: true, vettoreMarketing: "AZ" }),
    atteso: { esito: "incerto" },
  },
  {
    nome: "codeshare sotto soglia: il no resta un no",
    fatto: conRitardo(100, { vettoreDaDeterminare: true }),
    atteso: { esito: "non_idoneo" },
  },
  {
    nome: "TRAPPOLA: sopra soglia MA sciopero noto quel giorno",
    fatto: conRitardo(300, { scioperoNoto: true }),
    atteso: { esito: "incerto" },
  },
  {
    nome: "sciopero e sotto soglia: il no resta un no",
    fatto: conRitardo(60, { scioperoNoto: true }),
    atteso: { esito: "non_idoneo" },
  },
  {
    nome: "REALE: FR4001 del 6/08/2026 (BGY-ACE), 155 minuti: per 25 minuti niente fascia",
    fatto: {
      voloIata: "FR4001",
      dataLocale: "2026-08-06",
      vettoreOperativo: "FR",
      arrivoPrevistoUtc: "2026-08-06T16:00:00Z",
      // revisedTime della risposta vera; arrival.quality = ["Basic","Live"]
      arrivoEffettivoUtc: "2026-08-06T18:35:00Z",
      stato: "atterrato",
      kmOrtodromica: 2758.85,
      orarioVerificato: true,
      vettoreDaDeterminare: false, // codeshareStatus: "IsOperator"
      partenzaIata: "BGY",
      arrivoIata: "ACE",
      fonte: "aerodatabox",
    },
    atteso: { esito: "non_idoneo" },
  },

  /* ---------- IL CANCELLO TERRITORIALE (art. 3, par. 1) ----------
     Casi aggiunti il 9/08/2026: il motore calcolava ritardo e fascia senza
     chiedersi se il regolamento si applicasse. Un New York → Toronto usciva
     idoneo a 600 euro. Questi casi tengono chiusa quella porta. */

  {
    nome: "AMBITO: New York → Toronto, 4 ore di ritardo: il regolamento non si applica",
    fatto: conRitardo(240, {
      voloIata: "AC711",
      vettoreOperativo: "AC",
      partenzaIata: "JFK",
      arrivoIata: "YYZ",
      kmOrtodromica: 570,
    }),
    atteso: { esito: "non_idoneo" },
  },
  {
    nome: "AMBITO: si parte dall'Europa con vettore non europeo (Roma → New York, Delta): coperto",
    fatto: conRitardo(250, {
      voloIata: "DL105",
      vettoreOperativo: "DL",
      partenzaIata: "FCO",
      arrivoIata: "JFK",
      kmOrtodromica: 6866,
    }),
    atteso: { esito: "idoneo", importo: 600 },
  },
  {
    nome: "AMBITO: si arriva in Europa con vettore europeo (New York → Roma, ITA): coperto",
    fatto: conRitardo(250, {
      voloIata: "AZ611",
      vettoreOperativo: "AZ",
      partenzaIata: "JFK",
      arrivoIata: "FCO",
      kmOrtodromica: 6866,
    }),
    atteso: { esito: "idoneo", importo: 600 },
  },
  {
    /* Leggendo il Regolamento la risposta giusta sarebbe "non idoneo":
       Delta è statunitense, e in arrivo da un paese terzo il 261 chiede un
       vettore comunitario: non è coperto, e il "no" è pacifico.

       ⚠️ ETICHETTA CAMBIATA IL 9/08, ed è la seconda volta che succede.
       Prima diceva "incerto", perché Delta non era in nessuna nostra
       tabella e il codice non sapeva dire di che paese fosse la licenza.
       Ma quell'etichetta fotografava un limite nostro, non il
       Regolamento: che Delta sia americana non è un dubbio giuridico, è
       un fatto. Con `lib/regole/vettori.ts` il caso si chiude con un no
       pulito, che è la risposta giusta. Il verso del cambiamento è
       sicuro: si passa da "non lo so" a "no", mai a "sì". */
    nome: "AMBITO: Delta da New York a Roma: vettore non europeo, fuori ambito",
    fatto: conRitardo(250, {
      voloIata: "DL104",
      vettoreOperativo: "DL",
      partenzaIata: "JFK",
      arrivoIata: "FCO",
      kmOrtodromica: 6866,
    }),
    atteso: { esito: "non_idoneo" },
  },
  {
    /* La compagnia che NON conosciamo resta un incerto, e deve restarlo:
       inventare la nazionalità di un vettore mai sentito è esattamente il
       modo di produrre un falso positivo. "QZ" è Indonesia AirAsia, che
       in tabella non c'è. */
    nome: "AMBITO: vettore sconosciuto in arrivo da paese terzo: incerto (non lo sappiamo)",
    fatto: conRitardo(250, {
      voloIata: "QZ8501",
      vettoreOperativo: "QZ",
      partenzaIata: "SIN",
      arrivoIata: "FCO",
      kmOrtodromica: 10050,
    }),
    atteso: { esito: "incerto" },
  },
  {
    /* La Svizzera resta un punto interrogativo DICHIARATO anche dal lato
       della compagnia: Swiss in arrivo da un paese terzo non produce né
       un sì né un no. Serve una fonte verificata, ed è in ARRETRATI. */
    nome: "AMBITO: Swiss da New York a Zurigo: la Svizzera resta incerta",
    fatto: conRitardo(250, {
      voloIata: "LX15",
      vettoreOperativo: "LX",
      partenzaIata: "JFK",
      arrivoIata: "ZRH",
      kmOrtodromica: 6327,
    }),
    atteso: { esito: "incerto" },
  },
  {
    /* Qui invece il vettore extra UE lo conosciamo (Emirates è in tabella
       col paese AE): il no si può dare, ed è un no pulito. */
    nome: "AMBITO: Emirates da Dubai a Roma: vettore non europeo, fuori ambito",
    fatto: conRitardo(250, {
      voloIata: "EK97",
      vettoreOperativo: "EK",
      partenzaIata: "DXB",
      arrivoIata: "FCO",
      kmOrtodromica: 4344,
    }),
    atteso: { esito: "non_idoneo" },
  },
  {
    nome: "AMBITO: vettore sconosciuto in arrivo da un paese terzo: incerto, non si vende",
    fatto: conRitardo(250, {
      voloIata: "XX123",
      vettoreOperativo: "XX",
      partenzaIata: "JFK",
      arrivoIata: "FCO",
      kmOrtodromica: 6866,
    }),
    atteso: { esito: "incerto" },
  },
  {
    /* ⚠️ ETICHETTA CAMBIATA IL 9/08, dopo aver riletto l'art. 3.
       Diceva "incerto", e per mesi è stata la risposta del motore. Ma la
       norma non la vede così: qui si atterra a Roma con Ryanair, che ha
       licenza irlandese. Delle due l'una, e portano allo stesso posto:
       o il volo partiva dall'Europa (lettera a, coperto sempre) o partiva
       da un paese terzo con vettore comunitario (lettera b, coperto).
       Sapere da dove è decollato non cambia la risposta. L'etichetta
       vecchia fotografava un limite del nostro codice, non il Regolamento:
       si cambia l'etichetta solo quando è lei a essere sbagliata, e questo
       è uno di quei casi. */
    nome: "AMBITO: scalo di partenza ignoto, ma si atterra in Europa con vettore europeo",
    fatto: conRitardo(250, { partenzaIata: "QQQ", arrivoIata: "FCO" }),
    atteso: { esito: "idoneo", importo: 250 },
  },
  /* ─────────── I BUCHI DEL CANCELLO, TROVATI DA VALERIO IL 9/08 ───────────
     Il check gli usciva "non riconosciamo l'aeroporto di partenza" su voli
     normalissimi. Due cause diverse, tutte e due costavano vendite vere:
     il fornitore non manda sempre la sigla IATA, e il nostro archivio
     degli scali è una fotografia del 2017 (Berlino Brandeburgo, aperto nel
     2020, non c'era). Ora il paese arriva insieme al volo. */
  {
    nome: "SCALO NUOVO: Milano → Berlino Brandeburgo, scalo che l'archivio non aveva",
    fatto: conRitardo(240, {
      voloIata: "FR8541",
      partenzaIata: "MXP",
      arrivoIata: "BER",
      kmOrtodromica: 840,
    }),
    atteso: { esito: "idoneo", importo: 250 },
  },
  {
    nome: "SENZA SIGLA IATA: basta il paese che manda il fornitore",
    fatto: conRitardo(200, {
      voloIata: "AZ1234",
      vettoreOperativo: "AZ",
      partenzaIata: null,
      arrivoIata: null,
      partenzaPaese: "IT",
      arrivoPaese: "ES",
      kmOrtodromica: 1200,
    }),
    atteso: { esito: "idoneo", importo: 250 },
  },
  {
    nome: "SENZA SIGLA IATA E SENZA PAESE: resta la sigla ICAO",
    fatto: conRitardo(200, {
      voloIata: "FR1000",
      partenzaIata: null,
      arrivoIata: null,
      partenzaIcao: "LIRF",
      arrivoIcao: "EDDB",
      kmOrtodromica: 1180,
    }),
    atteso: { esito: "idoneo", importo: 250 },
  },
  {
    nome: "IL PAESE VINCE SULL'ARCHIVIO: partenza dagli Stati Uniti, vettore non europeo",
    fatto: conRitardo(300, {
      voloIata: "EK202",
      vettoreOperativo: "EK",
      partenzaIata: "JFK",
      partenzaPaese: "US",
      arrivoIata: "FCO",
      arrivoPaese: "IT",
      kmOrtodromica: 6866,
    }),
    atteso: { esito: "non_idoneo" },
  },
  {
    nome: "SCORCIATOIA: partenza ignota ma si atterra in Europa con vettore europeo",
    fatto: conRitardo(250, {
      voloIata: "AZ611",
      vettoreOperativo: "AZ",
      partenzaIata: null,
      arrivoIata: "FCO",
      kmOrtodromica: 6866,
    }),
    atteso: { esito: "idoneo", importo: 600 },
  },
  {
    nome: "SCORCIATOIA: non vale col vettore non europeo (Emirates da Dubai)",
    fatto: conRitardo(250, {
      voloIata: "EK205",
      vettoreOperativo: "EK",
      partenzaIata: null,
      arrivoIata: "FCO",
      kmOrtodromica: 4300,
    }),
    atteso: { esito: "incerto" },
  },
  {
    nome: "PRUDENZA: la Svizzera resta incerta, non un no secco",
    fatto: conRitardo(300, {
      voloIata: "LX1234",
      vettoreOperativo: "LX",
      partenzaIata: "ZRH",
      partenzaPaese: "CH",
      arrivoIata: "FCO",
      arrivoPaese: "IT",
      kmOrtodromica: 690,
    }),
    atteso: { esito: "incerto" },
  },
  {
    nome: "AMBITO: Canarie sono Unione Europea (Lanzarote → Bergamo): coperto",
    fatto: conRitardo(200, {
      voloIata: "FR4000",
      vettoreOperativo: "FR",
      partenzaIata: "ACE",
      arrivoIata: "BGY",
      kmOrtodromica: 2758,
    }),
    atteso: { esito: "idoneo", importo: 400 },
  },
];

export type { Verdetto };
