/**
 * I VOLI DI UNA TRATTA IN UN GIORNO.
 *
 * A cosa serve: togliere di mezzo il numero di volo. L'utente dice da dove
 * è partito, dove è arrivato e che giorno era; noi gli mettiamo davanti
 * l'elenco dei voli di quel giorno fra i due scali e lui riconosce il suo
 * (l'orario di partenza se lo ricorda sempre). Da lì in poi il check è
 * quello di sempre: numero di volo + data → motore EU261.
 *
 * Fonte: AeroDataBox, endpoint degli aeroporti (spec OpenAPI "Flight API",
 * operazione GetAirportFlights):
 *
 *   GET https://aerodatabox.p.rapidapi.com/flights/airports/iata/{iata}/{da}/{a}
 *       ?direction=Departure&withLeg=true&withCancelled=true
 *       &withCodeshared=false&withCargo=false&withPrivate=false&withLocation=false
 *
 * Due dettagli della spec che decidono il codice:
 * - la finestra massima è di 12 ore, quindi un giorno intero sono DUE
 *   chiamate (00:00-12:00 e 12:00-24:00), fatte in parallelo perché le
 *   funzioni Netlify muoiono a 10 secondi;
 * - con `withLeg=true` ogni voce porta sia `departure` sia `arrival`, e
 *   quindi si può filtrare per aeroporto di arrivo senza indovinare.
 *
 * Qui NON si decide niente: questo modulo non dà verdetti, non calcola
 * ritardi, non tocca il database. Elenca voli. Il verdetto resta compito
 * del motore, dopo che l'utente ha scelto il suo.
 */

import { aeroportoPerIata } from "@/lib/voli/aeroporti";

const HOST = "aerodatabox.p.rapidapi.com";

export type VoloDiTratta = {
  /** Numero canonico, senza spazi: "FR4001". */
  volo: string;
  /** Nome della compagnia come lo dà il fornitore, per riconoscerla. */
  compagnia: string | null;
  /** Orario locale di partenza, "06:20". Vuoto se il fornitore non lo dà. */
  partenzaOra: string;
  /** Orario locale di arrivo previsto, "09:45". */
  arrivoOra: string;
  /**
   * Orario locale di arrivo AGGIORNATO dal fornitore ("13:47"), vuoto se
   * non lo dà. Serve all'elenco per dire "doveva arrivare alle 09:55,
   * atterrato alle 13:47": è il momento in cui l'utente riconosce il SUO
   * volo. Non è un verdetto: il ritardo che conta lo misura il motore
   * dopo, sull'orario certificato.
   */
  arrivoEffettivoOra: string;
  /** true solo se il fornitore dice esplicitamente che era cancellato. */
  cancellato: boolean;
};

export type EsitoTratta = {
  voli: VoloDiTratta[];
  /** true quando la chiave manca e l'elenco è dimostrativo. */
  demo: boolean;
};

type OrarioAdb = { utc?: string | null; local?: string | null } | null;

type PuntoAdb = {
  airport?: { iata?: string | null; name?: string | null; municipalityName?: string | null } | null;
  scheduledTime?: OrarioAdb;
  revisedTime?: OrarioAdb;
} | null;

export type VoceAdb = {
  number?: string | null;
  status?: string | null;
  isCargo?: boolean;
  airline?: { name?: string | null; iata?: string | null } | null;
  departure?: PuntoAdb;
  arrival?: PuntoAdb;
  /** Senza withLeg il fornitore dà solo l'altro capo del volo, qui dentro. */
  movement?: PuntoAdb;
};

/**
 * "2026-08-06 06:20+02:00" → "06:20".
 * Si usa l'orario LOCALE perché è quello che l'utente ricorda: nessuno si
 * ricorda a che ora UTC è partito. Il taglio è testuale di proposito: non
 * si passa da Date, così il fuso non viene riconvertito per sbaglio.
 */
function oraLocale(orario: OrarioAdb | undefined): string {
  const s = orario?.local?.trim();
  if (!s) return "";
  const m = s.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

/** "FR 4001" → "FR4001". */
function numeroPulito(n: string | null | undefined): string {
  return (n ?? "").replace(/\s+/g, "").toUpperCase();
}

/** Le due finestre da 12 ore che coprono il giorno chiesto. */
function finestre(dataLocale: string): Array<[string, string]> {
  return [
    [`${dataLocale}T00:00`, `${dataLocale}T11:59`],
    [`${dataLocale}T12:00`, `${dataLocale}T23:59`],
  ];
}

async function unaFinestra(
  chiave: string,
  iataPartenza: string,
  da: string,
  a: string,
): Promise<VoceAdb[]> {
  const url =
    `https://${HOST}/flights/airports/iata/${encodeURIComponent(iataPartenza)}/${da}/${a}` +
    `?direction=Departure&withLeg=true&withCancelled=true` +
    `&withCodeshared=false&withCargo=false&withPrivate=false&withLocation=false`;

  try {
    const risposta = await fetch(url, {
      headers: { "X-RapidAPI-Key": chiave, "X-RapidAPI-Host": HOST },
      signal: AbortSignal.timeout(7_000),
      cache: "no-store",
    });
    if (risposta.status === 204 || risposta.status === 404) return [];
    if (!risposta.ok) {
      console.warn(`[tratta] risposta ${risposta.status} per ${iataPartenza} ${da}`);
      return [];
    }
    const corpo = (await risposta.json()) as { departures?: VoceAdb[] };
    return Array.isArray(corpo?.departures) ? corpo.departures : [];
  } catch (e) {
    console.warn(`[tratta] chiamata fallita per ${iataPartenza} ${da}:`, e);
    return [];
  }
}

/** L'aeroporto di arrivo di una voce, con o senza withLeg. */
function iataArrivo(v: VoceAdb): string {
  const punto = v.arrival ?? v.movement;
  return (punto?.airport?.iata ?? "").toUpperCase();
}

/**
 * Dalla risposta grezza del fornitore all'elenco che vede l'utente.
 *
 * È separata dalla chiamata di rete apposta: così si può provare sul
 * serio, con un payload della forma dichiarata dalla spec, senza
 * dipendere dall'API (questa sandbox non ci arriva).
 */
export function voliDaRisposta(voci: VoceAdb[], iataArrivoChiesto: string): VoloDiTratta[] {
  const arrivo = (iataArrivoChiesto ?? "").trim().toUpperCase();
  const visti = new Set<string>();
  const voli: VoloDiTratta[] = [];

  for (const voce of voci) {
    if (voce.isCargo) continue;
    if (iataArrivo(voce) !== arrivo) continue;

    const volo = numeroPulito(voce.number);
    if (!volo || visti.has(volo)) continue;
    visti.add(volo);

    const arrivo_ = voce.arrival ?? voce.movement;
    voli.push({
      volo,
      compagnia: voce.airline?.name ?? null,
      partenzaOra: oraLocale(voce.departure?.scheduledTime),
      arrivoOra: oraLocale(arrivo_?.scheduledTime),
      arrivoEffettivoOra: oraLocale(arrivo_?.revisedTime),
      cancellato: voce.status === "Canceled",
    });
  }

  voli.sort((x, y) => x.partenzaOra.localeCompare(y.partenzaOra));
  return voli;
}

/**
 * Elenco dimostrativo, attivo SOLO senza chiave (regola 3: niente dati
 * finti che sembrano veri). I numeri iniziano per ZZ, che nessuna
 * compagnia usa, e la risposta esce marcata demo fino all'interfaccia.
 */
function elencoDemo(): EsitoTratta {
  return {
    demo: true,
    /* Gli orari effettivi qui sotto COMBACIANO col ritardo che il motore
       demo dichiara per ciascun volo (fornitori/demo.ts): ZZ250 +3h20,
       ZZ180 +2h59, ZZ400 +3h30. Se là cambia un ritardo, va cambiato
       anche qui, o l'elenco promette una cosa e il verdetto un'altra. */
    voli: [
      { volo: "ZZ250", compagnia: "ZZ Compagnia Demo", partenzaOra: "06:20", arrivoOra: "08:40", arrivoEffettivoOra: "12:00", cancellato: false },
      { volo: "ZZ180", compagnia: "ZZ Compagnia Demo", partenzaOra: "11:05", arrivoOra: "13:25", arrivoEffettivoOra: "16:24", cancellato: false },
      { volo: "ZZ777", compagnia: "ZZ Compagnia Demo", partenzaOra: "17:30", arrivoOra: "19:50", arrivoEffettivoOra: "", cancellato: true },
      { volo: "ZZ400", compagnia: "ZZ Compagnia Demo", partenzaOra: "21:15", arrivoOra: "23:35", arrivoEffettivoOra: "03:05", cancellato: false },
    ],
  };
}

/**
 * I voli fra due aeroporti in un giorno, in ordine di partenza.
 *
 * Non lancia mai: se il fornitore non risponde torna una lista vuota e
 * l'interfaccia dirà che non ha trovato nulla, non che c'è un errore.
 */
export async function voliDiTratta(
  iataPartenza: string,
  iataArrivoChiesto: string,
  dataLocale: string,
): Promise<EsitoTratta> {
  const partenza = (iataPartenza ?? "").trim().toUpperCase();
  const arrivo = (iataArrivoChiesto ?? "").trim().toUpperCase();

  const chiave = process.env.AERODATABOX_API_KEY;
  if (!chiave) return elencoDemo();

  const risposte = await Promise.all(
    finestre(dataLocale).map(([da, a]) => unaFinestra(chiave, partenza, da, a)),
  );

  return { voli: voliDaRisposta(risposte.flat(), arrivo), demo: false };
}

/** I due scali in chiaro, per scrivere "Bergamo → Lanzarote" senza codici. */
export function tratteInChiaro(iataPartenza: string, iataArrivo: string) {
  return {
    da: aeroportoPerIata(iataPartenza),
    a: aeroportoPerIata(iataArrivo),
  };
}
