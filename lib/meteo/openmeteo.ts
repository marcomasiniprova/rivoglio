/**
 * Meteo storico all'aeroporto di arrivo, da Open-Meteo (archivio ERA5).
 *
 * A cosa serve: la scusa più usata dalle compagnie è il maltempo. Una riga
 * nel reclamo con le condizioni REALI all'ora d'arrivo la neutralizza in
 * anticipo. Nessun concorrente italiano lo fa.
 *
 * INTERRUTTORE: l'API gratuita di Open-Meteo è per uso NON commerciale
 * (terms: "You may only use the free API services for non-commercial
 * purposes"). Il nostro è commerciale, e ATTENZIONE: l'endpoint storico
 * (archive) è incluso solo dal piano API Professional in su, circa
 * 99 USD/mese, non basta lo Standard da 29 (pricing ufficiale, verificato
 * 2026-08-08 dal sorgente del sito open-meteo). Il modulo resta SPENTO
 * finché Valerio non sottoscrive e non imposta OPENMETEO_COMMERCIALE=1.
 * Scelta sua dell'8/08, popup. Senza variabile, ogni chiamata restituisce
 * null e la lettera esce senza la riga meteo. Con l'abbonamento andrà
 * usato l'endpoint dedicato customer-archive-api.open-meteo.com con la
 * API key.
 */

export const METEO_ATTIVO = process.env.OPENMETEO_COMMERCIALE === "1";

export type MeteoOrario = {
  descrizione: string;
  temperaturaC: number | null;
  ventoKmh: number | null;
  precipitazioneMm: number | null;
  /** L'ora UTC della riga usata, "HH:00". */
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

/**
 * La riga oraria più vicina all'orario UTC richiesto, per quel giorno.
 * Ritorna null se il modulo è spento, la rete fallisce o il dato manca:
 * la lettera non deve MAI morire per il meteo.
 */
export async function meteoStorico(
  lat: number,
  lon: number,
  dataIso: string,
  orarioUtcIso: string,
): Promise<MeteoOrario | null> {
  if (!METEO_ATTIVO) return null;
  try {
    const url =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      `&start_date=${dataIso}&end_date=${dataIso}` +
      `&hourly=temperature_2m,precipitation,windspeed_10m,weathercode&timezone=UTC`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const dati = (await r.json()) as {
      hourly?: {
        time?: string[];
        temperature_2m?: (number | null)[];
        precipitation?: (number | null)[];
        windspeed_10m?: (number | null)[];
        weathercode?: (number | null)[];
      };
    };
    const ore = dati.hourly?.time ?? [];
    if (ore.length === 0) return null;
    const bersaglio = new Date(orarioUtcIso).getTime();
    if (!Number.isFinite(bersaglio)) return null;
    let indice = 0;
    let migliore = Infinity;
    ore.forEach((t, i) => {
      const scarto = Math.abs(Date.parse(`${t}:00Z`.replace("Z:00Z", ":00Z")) - bersaglio);
      if (scarto < migliore) {
        migliore = scarto;
        indice = i;
      }
    });
    const h = dati.hourly!;
    return {
      descrizione: descriviWmo(h.weathercode?.[indice] ?? null),
      temperaturaC: h.temperature_2m?.[indice] ?? null,
      ventoKmh: h.windspeed_10m?.[indice] ?? null,
      precipitazioneMm: h.precipitation?.[indice] ?? null,
      oraUtc: (ore[indice] ?? "").slice(11, 16) || "?",
      fonte: "Open-Meteo, archivio ERA5",
    };
  } catch {
    return null;
  }
}

/** La frase pronta per la lettera. Null dentro = niente riga, mai inventare. */
export function fraseMeteo(m: MeteoOrario | null): string | null {
  if (!m) return null;
  const pezzi = [m.descrizione];
  if (m.ventoKmh !== null) pezzi.push(`vento ${Math.round(m.ventoKmh)} km/h`);
  if (m.precipitazioneMm !== null) {
    pezzi.push(
      m.precipitazioneMm === 0
        ? "nessuna precipitazione"
        : `precipitazioni ${m.precipitazioneMm} mm`,
    );
  }
  return `Condizioni meteo all'aeroporto di arrivo alle ${m.oraUtc} UTC: ${pezzi.join(", ")}. Fonte: ${m.fonte}.`;
}
