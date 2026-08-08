/**
 * L'Osservatorio coi dati VERI: l'indice ritardi degli aeroporti italiani
 * da AeroDataBox (#25, scelta di Valerio dell'8/08 col popup: top 8
 * aeroporti, aggiornamento una volta al giorno).
 *
 * Come funziona:
 * - la verità vive nella tabella `osservatorio_ritardi` (una riga per
 *   aeroporto, sovrascritta a ogni rilevazione);
 * - chi legge passa da qui: se la rilevazione più fresca ha meno di 24
 *   ore si serve la cache, altrimenti si rinnova da AeroDataBox (8
 *   chiamate in 2 lotti da 4, per stare dentro i 10 secondi di Netlify);
 * - l'endpoint /airports/iata/{iata}/delays fotografa le ultime ~2 ore:
 *   indice da 0 a 5 sugli arrivi, ritardo mediano, cancellati. È una
 *   fotografia, non una statistica storica, e l'interfaccia lo dice.
 * - FAIL-OPEN ovunque: senza chiave, senza database o con la rete giù
 *   si restituisce quel che c'è (anche niente): la landing non muore mai
 *   per una striscia di numeri.
 */

import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

export const AEROPORTI_OSSERVATI = [
  { iata: "FCO", nome: "Roma Fiumicino" },
  { iata: "MXP", nome: "Milano Malpensa" },
  { iata: "LIN", nome: "Milano Linate" },
  { iata: "BGY", nome: "Bergamo" },
  { iata: "VCE", nome: "Venezia" },
  { iata: "NAP", nome: "Napoli" },
  { iata: "CTA", nome: "Catania" },
  { iata: "BLQ", nome: "Bologna" },
] as const;

const FRESCHEZZA_ORE = 24;

export type RitardoAeroporto = {
  iata: string;
  nome: string;
  /** Indice AeroDataBox da 0 a 5 sugli arrivi; null = non rilevabile. */
  indice: number | null;
  /** Ritardo mediano degli arrivi, in minuti; null = non rilevabile. */
  medianaMinuti: number | null;
  arrivi: number | null;
  cancellati: number | null;
  rilevatoIl: string;
};

type RigaDb = {
  iata: string;
  nome: string;
  indice: number | null;
  mediana_minuti: number | null;
  arrivi: number | null;
  cancellati: number | null;
  rilevato_il: string;
};

/** "00:16:00" → 16. Null per tutto ciò che non è un orario leggibile. */
function minutiDaDurata(durata: unknown): number | null {
  if (typeof durata !== "string") return null;
  const m = /^(\d+):([0-5]\d):([0-5]\d)$/.exec(durata);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

type RispostaDelays = {
  arrivalsDelayInformation?: {
    numTotal?: number;
    numCancelled?: number;
    medianDelay?: string;
    delayIndex?: number;
  };
};

/** Una rilevazione da AeroDataBox. Null su qualsiasi intoppo. */
async function rileva(iata: string, chiave: string): Promise<Omit<RigaDb, "nome"> | null> {
  try {
    const r = await fetch(`https://aerodatabox.p.rapidapi.com/airports/iata/${iata}/delays`, {
      headers: {
        "X-RapidAPI-Key": chiave,
        "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(3500),
    });
    if (!r.ok) return null;
    const dati = (await r.json()) as RispostaDelays;
    const arrivi = dati.arrivalsDelayInformation;
    return {
      iata,
      indice: typeof arrivi?.delayIndex === "number" ? arrivi.delayIndex : null,
      mediana_minuti: minutiDaDurata(arrivi?.medianDelay),
      arrivi: typeof arrivi?.numTotal === "number" ? arrivi.numTotal : null,
      cancellati: typeof arrivi?.numCancelled === "number" ? arrivi.numCancelled : null,
      rilevato_il: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function daRiga(riga: RigaDb): RitardoAeroporto {
  return {
    iata: riga.iata,
    nome: riga.nome,
    indice: riga.indice,
    medianaMinuti: riga.mediana_minuti,
    arrivi: riga.arrivi,
    cancellati: riga.cancellati,
    rilevatoIl: riga.rilevato_il,
  };
}

/**
 * Le rilevazioni, dalla cache o rinnovate se la più fresca ha più di 24
 * ore. Ordina come AEROPORTI_OSSERVATI e scarta ciò che non conosce.
 */
export async function ritardiAeroporti(): Promise<RitardoAeroporto[]> {
  if (!SERVIZIO_ATTIVO) return [];
  const sb = supabaseServizio();

  let righe: RigaDb[] = [];
  try {
    const { data } = await sb
      .from("osservatorio_ritardi")
      .select("iata, nome, indice, mediana_minuti, arrivi, cancellati, rilevato_il");
    righe = (data ?? []) as RigaDb[];
  } catch {
    return [];
  }

  const chiave = process.env.AERODATABOX_API_KEY;
  const piuFresca = righe.reduce(
    (max, r) => Math.max(max, Date.parse(r.rilevato_il) || 0),
    0,
  );
  const stantia = Date.now() - piuFresca > FRESCHEZZA_ORE * 60 * 60 * 1000;

  if (chiave && (righe.length === 0 || stantia)) {
    // 2 lotti da 4: dentro il limite dei 10 secondi anche col timeout pieno.
    const nuove: RigaDb[] = [];
    for (const lotto of [AEROPORTI_OSSERVATI.slice(0, 4), AEROPORTI_OSSERVATI.slice(4)]) {
      const esiti = await Promise.all(lotto.map((a) => rileva(a.iata, chiave)));
      esiti.forEach((esito, i) => {
        if (esito) nuove.push({ ...esito, nome: lotto[i].nome });
      });
    }
    if (nuove.length > 0) {
      try {
        await sb.from("osservatorio_ritardi").upsert(nuove, { onConflict: "iata" });
      } catch (e) {
        console.warn("[osservatorio] cache ritardi non scrivibile:", e);
      }
      const perIata = new Map(righe.map((r) => [r.iata, r]));
      for (const n of nuove) perIata.set(n.iata, n);
      righe = [...perIata.values()];
    }
  }

  const perIata = new Map(righe.map((r) => [r.iata, r]));
  return AEROPORTI_OSSERVATI.map((a) => perIata.get(a.iata))
    .filter((r): r is RigaDb => Boolean(r))
    .map(daRiga);
}
