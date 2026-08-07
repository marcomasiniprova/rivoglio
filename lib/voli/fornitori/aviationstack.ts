/**
 * AviationStack, il fornitore di RISERVA (SPEC §4: seconda fonte per il
 * confronto; §9: piano gratuito).
 *
 *   GET https://api.aviationstack.com/v1/flights
 *       ?access_key=...&flight_iata=FR8321&flight_date=2026-08-14
 *
 * Risponde {data: [...]} con flight_status
 * (scheduled|active|landed|cancelled|incident|diverted), arrival.scheduled /
 * estimated / actual (ISO 8601), airline {name, iata} e flight.codeshared
 * (il volo OPERATIVO, quando quello cercato è solo commerciale).
 *
 * Avvertenza onesta: sul piano gratuito gli orari arrivano a volte in ora
 * locale etichettata "+00:00". Non è un problema per la sicurezza del
 * verdetto: questa fonte si usa SOLO per il confronto, e se i suoi orari
 * non tornano con AeroDataBox scatta fonti_discordanti → INCERTO → non si
 * vende. Un dato storto qui può solo bloccare una vendita, mai crearne una.
 * Niente distanza della tratta: kmOrtodromica resta null.
 */

import type { FattoConPayload, FattoVolo, FornitoreVoli } from "../tipi";

type VoloAvs = {
  flight_date?: string;
  flight_status?: string;
  arrival?: {
    scheduled?: string | null;
    estimated?: string | null;
    actual?: string | null;
  } | null;
  airline?: { name?: string | null; iata?: string | null } | null;
  flight?: {
    iata?: string | null;
    codeshared?: {
      airline_name?: string | null;
      airline_iata?: string | null;
      flight_iata?: string | null;
    } | null;
  } | null;
};

function iso(s: string | null | undefined): string | null {
  const pulito = s?.trim();
  if (!pulito) return null;
  return Number.isFinite(Date.parse(pulito)) ? pulito : null;
}

function statoDa(statusAvs: string | undefined): FattoVolo["stato"] {
  switch (statusAvs) {
    case "landed":
      return "atterrato";
    case "cancelled":
      return "cancellato";
    case "diverted":
      return "dirottato";
    default:
      // scheduled, active, incident, assente: volo non concluso o non certificato.
      return "sconosciuto";
  }
}

export const aviationstack: FornitoreVoli = {
  nome: "aviationstack",

  async cerca(voloIata: string, dataLocale: string): Promise<FattoConPayload | null> {
    const chiave = process.env.AVIATIONSTACK_API_KEY;
    if (!chiave) return null;

    const url =
      "https://api.aviationstack.com/v1/flights" +
      `?access_key=${encodeURIComponent(chiave)}` +
      `&flight_iata=${encodeURIComponent(voloIata)}` +
      `&flight_date=${dataLocale}`;

    let corpo: { data?: VoloAvs[] };
    try {
      const risposta = await fetch(url, {
        signal: AbortSignal.timeout(8_000), // le funzioni Netlify muoiono a 10s
        cache: "no-store",
      });
      if (!risposta.ok) {
        console.warn(`[aviationstack] risposta ${risposta.status} per ${voloIata} ${dataLocale}`);
        return null;
      }
      corpo = (await risposta.json()) as { data?: VoloAvs[] };
    } catch (e) {
      // Rete giù o timeout: nessuna eccezione verso l'alto, diventerà "incerto".
      console.warn(`[aviationstack] chiamata fallita per ${voloIata} ${dataLocale}:`, e);
      return null;
    }

    const voli = Array.isArray(corpo.data) ? corpo.data : [];
    if (voli.length === 0) return null;

    // Se un risultato porta la data richiesta si prende quello, altrimenti il primo.
    const volo = voli.find((v) => v.flight_date === dataLocale) ?? voli[0];

    let stato = statoDa(volo.flight_status);
    const effettivo = iso(volo.arrival?.actual);
    // "landed" senza orario effettivo non è un fatto verificabile: sconosciuto.
    if (stato === "atterrato" && !effettivo) stato = "sconosciuto";

    /* Qui il codeshare è esplicito: `flight.codeshared` è il volo che ha
       VOLATO davvero. Se c'è, l'operativo è lui e la compagnia del numero
       cercato è solo il vettore marketing. */
    const marketing = volo.airline?.iata ?? volo.airline?.name ?? voloIata.slice(0, 2);
    const operativo = volo.flight?.codeshared
      ? (volo.flight.codeshared.airline_iata ?? volo.flight.codeshared.airline_name ?? marketing)
      : marketing;

    return {
      voloIata,
      dataLocale,
      vettoreOperativo: operativo.toUpperCase(),
      vettoreMarketing: volo.flight?.codeshared ? marketing.toUpperCase() : null,
      arrivoPrevistoUtc: iso(volo.arrival?.scheduled),
      arrivoEffettivoUtc: stato === "atterrato" ? effettivo : null,
      stato,
      kmOrtodromica: null, // AviationStack non dà la distanza ortodromica
      fonte: "aviationstack",
      payloadGrezzo: corpo,
    };
  },
};
