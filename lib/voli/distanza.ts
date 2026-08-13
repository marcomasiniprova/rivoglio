/**
 * Distanza ortodromica di riserva, calcolata in locale.
 *
 * AeroDataBox la fornisce già (`greatCircleDistance.km`): questo modulo
 * serve SOLO quando quel campo manca, perché un verdetto non deve morire
 * per un campo assente. Dataset: OpenFlights (dominio pubblico, ~6.000
 * aeroporti con codice IATA) congelato in `lib/dati/aeroporti.json`:
 * zero chiamate API, per sempre. Le coordinate degli aeroporti non
 * cambiano.
 */
import aeroporti from "@/lib/dati/aeroporti.json";

export type Aeroporto = {
  icao: string | null;
  nome: string;
  citta: string;
  /** Il nome del paese in inglese: serve a farlo leggere, non a decidere. */
  paese: string;
  /**
   * Il codice ISO a due lettere. È QUESTO che guarda il cancello
   * territoriale: il nome cambia grafia fra un archivio e l'altro
   * ("Czech Republic" oggi, "Czechia" nello standard di adesso) e una
   * differenza di grafia non deve poter cambiare un verdetto.
   * `null` solo dove il paese non esiste più (le vecchie Antille Olandesi).
   */
  iso: string | null;
  lat: number;
  lon: number;
  tz: string | null;
  /**
   * Quanto è grande lo scalo, dal tipo dichiarato da OurAirports:
   * 2 = grande, 1 = medio, 0 = pista privata o campo di volo.
   * Serve alla ricerca, che mostra solo quelli con voli di linea.
   */
  peso?: number;
  /**
   * true se il fuso non veniva dalla fonte ma l'abbiamo dedotto noi
   * (dal paese o dallo scalo più vicino). Vedi scripts/aeroporti/fusi.mjs.
   */
  tzDedotto?: boolean;
};

const ELENCO = aeroporti as Record<string, Aeroporto>;

export function aeroporto(iata: string | null | undefined): Aeroporto | null {
  if (!iata) return null;
  return ELENCO[iata.trim().toUpperCase()] ?? null;
}

const RAGGIO_TERRA_KM = 6371;
const inRadianti = (gradi: number) => (gradi * Math.PI) / 180;

/** Haversine, in chilometri. */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = inRadianti(b.lat - a.lat);
  const dLon = inRadianti(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(inRadianti(a.lat)) * Math.cos(inRadianti(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAGGIO_TERRA_KM * Math.asin(Math.sqrt(h));
}

/**
 * Distanza fra due aeroporti IATA, o null se uno dei due non è nel
 * dataset: il chiamante decide (di solito: incerto, mai inventare).
 */
export function kmFraAeroporti(iataPartenza: string, iataArrivo: string): number | null {
  const a = aeroporto(iataPartenza);
  const b = aeroporto(iataArrivo);
  if (!a || !b) return null;
  return Math.round(haversineKm(a, b) * 100) / 100;
}
