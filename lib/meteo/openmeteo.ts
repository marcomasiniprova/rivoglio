/**
 * Meteo all'aeroporto, dall'istanza Open-Meteo dedicata di Rivolio (sul VPS
 * aziendale). A cosa serve: la scusa più usata dalle compagnie per non pagare
 * è il maltempo. Una riga nel reclamo con le condizioni REALI attorno
 * all'orario del volo la neutralizza in anticipo, coi numeri. NON tocca MAI
 * un verdetto del check: è solo prova nella lettera di risposta a un no.
 *
 * DUE cose sono obbligatorie su QUESTA istanza (diverse dall'API pubblica):
 *  - AUTENTICAZIONE Basic su OGNI richiesta. Utente fisso "rivolio", password
 *    SOLO in `METEO_API_PASSWORD` (mai nel repo). Senza o sbagliata → 401, e
 *    qui torna null: la lettera esce senza la riga, mai un errore.
 *  - LE VARIABILI SINCRONIZZATE sono poche e DIVERSE fra i due endpoint (vedi
 *    sotto). Chiederne altre restituisce null.
 *
 * DUE endpoint, scelti da soli in base all'età del volo:
 *  - /v1/archive  (storico ERA5, ~2 anni indietro ma con ~5 giorni di ritardo):
 *      temperature_2m, precipitation, snowfall_water_equivalent,
 *      wind_gusts_10m, cloud_cover_low. È la prova per i rimborsi.
 *  - /v1/forecast (futuro + passato recente, per i voli degli ultimi ~5 giorni,
 *      dove lo storico non è ancora arrivato):
 *      temperature_2m, precipitation, weather_code.
 *
 * INTERRUTTORE. Il modulo resta SPENTO finché non si imposta `OPENMETEO_URL`
 * (l'istanza del VPS) oppure `OPENMETEO_COMMERCIALE=1`. Spento = ogni chiamata
 * torna null e la lettera non ne risente.
 */
import { giorniFra } from "@/lib/tempo";
import { aeroporto } from "@/lib/voli/distanza";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/** La base dell'API: il VPS se impostato, altrimenti l'host pubblico (ripiego
 *  buono solo con l'abbonamento commerciale). */
const BASE_METEO = (process.env.OPENMETEO_URL ?? "https://archive-api.open-meteo.com").replace(
  /\/+$/,
  "",
);

/** L'utente Basic non è un segreto: la password sì, e vive solo in env. */
const METEO_UTENTE = "rivolio";
const METEO_PASSWORD = process.env.METEO_API_PASSWORD ?? "";

export const METEO_ATTIVO =
  Boolean(process.env.OPENMETEO_URL) || process.env.OPENMETEO_COMMERCIALE === "1";

/** L'header Basic, solo se abbiamo la password (l'istanza del VPS la esige). */
function intestazioni(): Record<string, string> {
  if (!METEO_PASSWORD) return {};
  const token = Buffer.from(`${METEO_UTENTE}:${METEO_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

export type MeteoOrario = {
  /** Descrizione del cielo: solo dove la fonte dà un codice meteo (previsioni). */
  descrizione: string | null;
  temperaturaC: number | null;
  /** Raffiche di vento, km/h: spesso la prova più forte. Solo dallo storico. */
  rafficheKmh: number | null;
  precipitazioneMm: number | null;
  /** Neve (equivalente in acqua), mm. Solo dallo storico. */
  neveMm: number | null;
  /** Nubi basse, %: alta = possibile nebbia / scarsa visibilità. Solo storico. */
  nubiBassePct: number | null;
  /** L'ora UTC della riga usata, "HH:MM". */
  oraUtc: string;
  fonte: string;
};

/** Codici WMO → italiano piano. Solo i gruppi che contano per un reclamo. */
export function descriviWmo(codice: number | null): string {
  if (codice === null || Number.isNaN(codice)) return "condizioni non disponibili";
  if (codice === 0) return "sereno";
  if (codice <= 2) return "poco nuvoloso";
  if (codice === 3) return "coperto";
  if (codice === 45 || codice === 48) return "nebbia";
  if (codice >= 51 && codice <= 57) return "pioviggine";
  if (codice >= 61 && codice <= 67) return "pioggia";
  if (codice >= 71 && codice <= 77) return "neve";
  if (codice >= 80 && codice <= 82) return "rovesci di pioggia";
  if (codice === 85 || codice === 86) return "rovesci di neve";
  if (codice >= 95) return "temporale";
  return `condizioni codice WMO ${codice}`;
}

type Orarie = {
  hourly?: {
    time?: string[];
    temperature_2m?: (number | null)[];
    precipitation?: (number | null)[];
    snowfall_water_equivalent?: (number | null)[];
    wind_gusts_10m?: (number | null)[];
    cloud_cover_low?: (number | null)[];
    weather_code?: (number | null)[];
  };
};

/** Un numero da un array, o null: mai trattare un buco come zero. */
function num(arr: (number | null)[] | undefined, i: number): number | null {
  const v = arr?.[i];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** "HH" UTC da un ISO, per la chiave di cache. */
function oraDi(orarioUtcIso: string): string {
  const d = new Date(orarioUtcIso);
  return Number.isFinite(d.getTime()) ? String(d.getUTCHours()).padStart(2, "0") : "??";
}

/** GET con auth, timeout e ritentativi: 401 non si aggiusta ritentando, 429 sì. */
async function chiama(url: string): Promise<Orarie | null> {
  const attese = [0, 500, 1500];
  for (const attesa of attese) {
    if (attesa > 0) await new Promise((r) => setTimeout(r, attesa));
    try {
      const r = await fetch(url, { headers: intestazioni(), signal: AbortSignal.timeout(15000) });
      if (r.status === 401) return null; // auth fallita: inutile insistere
      if (r.status === 429) continue; // troppo veloci: aspetta e riprova
      if (!r.ok) return null; // 404/204/500: quel dato non c'è
      return (await r.json()) as Orarie;
    } catch {
      // timeout o rete: riprova, poi molla senza rompere la lettera
    }
  }
  return null;
}

/**
 * Scarica il meteo per un punto e un'ora. Sceglie l'endpoint da solo: per i
 * voli degli ultimi ~5 giorni le previsioni (lo storico ERA5 arriva con ~5
 * giorni di ritardo), per i più vecchi l'archivio. Null se spento, se rete o
 * auth falliscono, o se il dato manca: mai inventare.
 */
async function scarica(
  lat: number,
  lon: number,
  dataIso: string,
  orarioUtcIso: string,
): Promise<MeteoOrario | null> {
  if (!METEO_ATTIVO) return null;
  // giorniFra(dataIso) = giorni da quel giorno a oggi: <= 5 → previsioni.
  const recente = giorniFra(dataIso) <= 5;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: dataIso,
    end_date: dataIso,
    timezone: "UTC",
    hourly: recente
      ? "temperature_2m,precipitation,weather_code"
      : "temperature_2m,precipitation,snowfall_water_equivalent,wind_gusts_10m,cloud_cover_low",
  });
  const url = `${BASE_METEO}/v1/${recente ? "forecast" : "archive"}?${params.toString()}`;

  const dati = await chiama(url);
  const ore = dati?.hourly?.time ?? [];
  if (ore.length === 0) return null;
  const bersaglio = new Date(orarioUtcIso).getTime();
  if (!Number.isFinite(bersaglio)) return null;

  let indice = 0;
  let migliore = Infinity;
  ore.forEach((t, i) => {
    const q = Date.parse(`${t}Z`); // gli orari arrivano in UTC senza suffisso
    if (Number.isFinite(q) && Math.abs(q - bersaglio) < migliore) {
      migliore = Math.abs(q - bersaglio);
      indice = i;
    }
  });

  const h = dati!.hourly!;
  const codice = recente ? num(h.weather_code, indice) : null;
  return {
    descrizione: codice === null ? null : descriviWmo(codice),
    temperaturaC: num(h.temperature_2m, indice),
    rafficheKmh: num(h.wind_gusts_10m, indice),
    precipitazioneMm: num(h.precipitation, indice),
    neveMm: num(h.snowfall_water_equivalent, indice),
    nubiBassePct: num(h.cloud_cover_low, indice),
    oraUtc: (ore[indice] ?? "").slice(11, 16) || "?",
    fonte: recente ? "Open-Meteo (previsioni)" : "Open-Meteo, archivio ERA5",
  };
}

/* ---------------------------------------------------------------- la cache
   Lo storico non cambia: una volta letto un (aeroporto, data, ora), non si
   richiama. Vive sul database, la tiene solo il client di servizio. Se manca
   o fallisce, si scarica e basta: la cache non deve MAI rompere la lettera. */

async function daCache(iata: string, dataIso: string, ora: string): Promise<MeteoOrario | null> {
  if (!SERVIZIO_ATTIVO) return null;
  try {
    const { data } = await supabaseServizio()
      .from("meteo_cache")
      .select("dato")
      .eq("iata", iata)
      .eq("data", dataIso)
      .eq("ora_utc", ora)
      .maybeSingle();
    return (data?.dato as MeteoOrario | undefined) ?? null;
  } catch {
    return null;
  }
}

async function inCache(
  iata: string,
  dataIso: string,
  ora: string,
  m: MeteoOrario,
): Promise<void> {
  if (!SERVIZIO_ATTIVO) return;
  try {
    await supabaseServizio()
      .from("meteo_cache")
      .upsert({ iata, data: dataIso, ora_utc: ora, dato: m }, { onConflict: "iata,data,ora_utc" });
  } catch {
    // la cache non deve mai rompere la lettera
  }
}

/** La frase meteo per UN aeroporto, con cache. Null = niente riga. */
async function fraseScalo(
  iata: string,
  orarioUtcIso: string,
  dove: string,
): Promise<string | null> {
  const scalo = aeroporto(iata);
  if (!scalo) return null;
  const dataIso = orarioUtcIso.slice(0, 10);
  const ora = oraDi(orarioUtcIso);
  let m = await daCache(iata, dataIso, ora);
  if (!m) {
    m = await scarica(scalo.lat, scalo.lon, dataIso, orarioUtcIso);
    if (m) await inCache(iata, dataIso, ora, m);
  }
  return fraseMeteo(m, dove);
}

/* -------------------------------------------------------- payload del volo */

type PayloadScalo = {
  airport?: { iata?: string | null } | null;
  scheduledTime?: { utc?: string | null } | null;
  revisedTime?: { utc?: string | null } | null;
} | null;
type PayloadVolo = { departure?: PayloadScalo; arrival?: PayloadScalo } | null;

function iataDi(x: string | null | undefined): string | null {
  return typeof x === "string" && x.trim().length === 3 ? x.trim().toUpperCase() : null;
}

/** AeroDataBox scrive "2025-02-14 15:30Z": la porto in ISO vero, o null. */
function utcDi(t: string | null | undefined): string | null {
  if (!t) return null;
  const iso = t.replace(" ", "T");
  return Number.isFinite(Date.parse(iso)) ? iso : null;
}

function nomeScalo(iata: string): string {
  const a = aeroporto(iata);
  return a?.citta ? `${a.citta} (${iata})` : iata;
}

/**
 * Le righe meteo del volo: partenza e arrivo, ognuna con la sua frase, unite.
 * Guarda tutti e due gli aeroporti perché il maltempo che blocca un volo può
 * stare da una parte o dall'altra. Null se il modulo è spento o non c'è nulla
 * da dire: la lettera non muore mai per il meteo.
 */
export async function righeMeteoVolo(
  payloadGrezzo: unknown,
  arrivoEffettivoUtc: string | null,
): Promise<string | null> {
  if (!METEO_ATTIVO) return null;
  const p = (payloadGrezzo ?? {}) as PayloadVolo;

  const scali: Array<{ iata: string; utc: string; dove: string }> = [];

  const pIata = iataDi(p?.departure?.airport?.iata);
  const pUtc =
    utcDi(p?.departure?.revisedTime?.utc) ?? utcDi(p?.departure?.scheduledTime?.utc);
  if (pIata && pUtc) scali.push({ iata: pIata, utc: pUtc, dove: `in partenza da ${nomeScalo(pIata)}` });

  const aIata = iataDi(p?.arrival?.airport?.iata);
  const aUtc =
    arrivoEffettivoUtc ?? utcDi(p?.arrival?.revisedTime?.utc) ?? utcDi(p?.arrival?.scheduledTime?.utc);
  if (aIata && aUtc) scali.push({ iata: aIata, utc: aUtc, dove: `all'arrivo a ${nomeScalo(aIata)}` });

  const righe = (await Promise.all(scali.map((s) => fraseScalo(s.iata, s.utc, s.dove)))).filter(
    (x): x is string => Boolean(x),
  );
  return righe.length ? righe.join("\n") : null;
}

/** La frase pronta per la lettera. Null dentro = niente riga, mai inventare. */
export function fraseMeteo(m: MeteoOrario | null, dove?: string): string | null {
  if (!m) return null;
  const pezzi: string[] = [];
  if (m.descrizione) pezzi.push(m.descrizione);
  if (m.temperaturaC !== null) pezzi.push(`${Math.round(m.temperaturaC)}°C`);
  if (m.rafficheKmh !== null) pezzi.push(`raffiche ${Math.round(m.rafficheKmh)} km/h`);
  if (m.precipitazioneMm !== null) {
    pezzi.push(
      m.precipitazioneMm === 0 ? "nessuna precipitazione" : `precipitazioni ${m.precipitazioneMm} mm`,
    );
  }
  if (m.neveMm !== null && m.neveMm > 0) pezzi.push(`neve ${m.neveMm} mm`);
  if (m.nubiBassePct !== null && m.nubiBassePct >= 80) {
    pezzi.push(`nubi basse molto estese ${Math.round(m.nubiBassePct)}%`);
  }
  if (pezzi.length === 0) return null;
  const dovePezzo = dove ? ` ${dove}` : "";
  return `Condizioni meteo${dovePezzo} alle ${m.oraUtc} UTC: ${pezzi.join(", ")}. Fonte: ${m.fonte}.`;
}
