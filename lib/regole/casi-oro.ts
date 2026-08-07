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
  // >3500 km: 3-4h → 300€ (riduzione 50%), ≥4h → 600€
  { nome: "lungo raggio, 239 minuti: importo dimezzato", fatto: conRitardo(239, { kmOrtodromica: 3501 }), atteso: { esito: "idoneo", importo: 300 } },
  { nome: "lungo raggio, 240 minuti esatti: pieno", fatto: conRitardo(240, { kmOrtodromica: 6000 }), atteso: { esito: "idoneo", importo: 600 } },
  { nome: "lungo raggio, ritardo di una notte", fatto: conRitardo(500, { kmOrtodromica: 8000 }), atteso: { esito: "idoneo", importo: 600 } },

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
      fonte: "aerodatabox",
    },
    atteso: { esito: "non_idoneo" },
  },
];

export type { Verdetto };
