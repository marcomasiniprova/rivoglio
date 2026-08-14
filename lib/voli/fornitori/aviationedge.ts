/**
 * AviationEdge, seconda fonte per l'INCROCIO (SPEC §4). Scelta di Valerio
 * (14/08): la accende al prezzo scontato del primo mese per misurare quanti
 * "incerti" diventano idonei, poi decide se tenerla.
 *
 * ⚠️ È una RISERVA, come AviationStack: si usa SOLO per confermare l'orario
 * del primario (l'incrocio in lib/voli/incrocio.ts). Un suo dato storto può
 * al massimo NON confermare un volo (resta incerto): non crea mai una
 * vendita. La regola numero uno (mai un falso positivo) non passa mai da qui.
 *
 * L'API storica cerca per AEROPORTO + DATA, non per numero di volo:
 *   GET https://aviation-edge.com/v2/public/flightsHistory
 *       ?key=...&code=<scalo IATA>&type=arrival
 *       &date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
 *       &airline_iata=FR&flight_num=8321
 * Per questo serve lo scalo d'arrivo, che arriva dal primario nel `contesto`.
 * Risponde con un array di voli; ogni volo ha `flight.iataNumber`,
 * `arrival.scheduledTime` / `actualTime`, `status`. Storico dal 2020-05-14,
 * finestra massima 30 giorni: qui si chiede un solo giorno.
 *
 * ⚠️ GLI ORARI ARRIVANO SENZA FUSO (es. "2021-11-02t19:00:00.000"). Non è un
 * problema, ed è il motivo per cui l'incrocio confronta il RITARDO e non
 * l'orario: previsto ed effettivo sono nello stesso fuso, la sottrazione lo
 * annulla. Qui si normalizza solo la "t" minuscola in "T" perché Date.parse
 * la digerisca; il fuso non si tocca. Questi valori non vengono MAI salvati
 * in cache (li consuma solo l'incrocio, al volo).
 */

import type { ContestoRicerca, FattoConPayload, FattoVolo, FornitoreVoli } from "../tipi";

type VoloAe = {
  status?: string;
  arrival?: {
    iataCode?: string | null;
    scheduledTime?: string | null;
    estimatedTime?: string | null;
    actualTime?: string | null;
    actualRunway?: string | null;
  } | null;
  departure?: { iataCode?: string | null } | null;
  airline?: { name?: string | null; iataCode?: string | null } | null;
  flight?: { number?: string | null; iataNumber?: string | null; icaoNumber?: string | null } | null;
};

/** "2021-11-02t19:00:00.000" → stringa che Date.parse legge, o null. Il fuso
 *  NON si tocca (l'incrocio ragiona sul ritardo). */
function oraLeggibile(s: string | null | undefined): string | null {
  const pulito = s?.trim();
  if (!pulito) return null;
  const conT = pulito.replace(/t/i, "T"); // solo la "t" ISO, minuscola
  return Number.isFinite(Date.parse(conT)) ? conT : null;
}

function statoDa(status: string | undefined | null): FattoVolo["stato"] {
  switch ((status ?? "").toLowerCase()) {
    case "landed":
      return "atterrato";
    case "cancelled":
      return "cancellato";
    case "diverted":
    case "redirected":
      return "dirottato";
    default:
      return "sconosciuto"; // active, scheduled, unknown, incident, assente
  }
}

/** Il numero di volo senza spazi, in maiuscolo: "fr 8321" → "FR8321". */
function normNumero(v: string | null | undefined): string {
  return (v ?? "").replace(/\s+/g, "").toUpperCase();
}

/**
 * La lettura PURA della risposta di AviationEdge: nessuna rete, così si prova
 * con un payload d'esempio. Sceglie dall'array il volo col numero cercato
 * (preferendo quello atterrato con un orario effettivo) e ne ricava il fatto.
 */
export function interpretaAviationEdge(
  corpo: unknown,
  voloIata: string,
  dataLocale: string,
): FattoConPayload | null {
  if (!Array.isArray(corpo)) return null; // errore o niente: {success:false,...}
  const voglio = normNumero(voloIata);
  const candidati = (corpo as VoloAe[]).filter(
    (v) => normNumero(v.flight?.iataNumber) === voglio,
  );
  if (candidati.length === 0) return null;

  // Meglio uno atterrato con orario effettivo; se no, il primo che c'è.
  const volo =
    candidati.find((v) => statoDa(v.status) === "atterrato" && oraLeggibile(v.arrival?.actualTime)) ??
    candidati[0];

  let stato = statoDa(volo.status);
  const effettivo = oraLeggibile(volo.arrival?.actualTime) ?? oraLeggibile(volo.arrival?.actualRunway);
  if (stato === "atterrato" && !effettivo) stato = "sconosciuto";

  const marketing = (volo.airline?.iataCode ?? voloIata.slice(0, 2)).toUpperCase();

  return {
    voloIata,
    dataLocale,
    vettoreOperativo: marketing,
    vettoreMarketing: null,
    partenzaIata: volo.departure?.iataCode ?? null,
    arrivoIata: volo.arrival?.iataCode ?? null,
    arrivoPrevistoUtc: oraLeggibile(volo.arrival?.scheduledTime),
    arrivoEffettivoUtc: stato === "atterrato" ? effettivo : null,
    stato,
    kmOrtodromica: null, // non serve: questa fonte dà solo gli orari per l'incrocio
    fonte: "aviationedge",
    payloadGrezzo: corpo,
  };
}

export const aviationedge: FornitoreVoli = {
  nome: "aviationedge",

  async cerca(
    voloIata: string,
    dataLocale: string,
    contesto?: ContestoRicerca,
  ): Promise<FattoConPayload | null> {
    const chiave = process.env.AVIATIONEDGE_API_KEY;
    if (!chiave) return null;

    // Senza lo scalo d'arrivo non si può interrogare l'API storica.
    const scalo = contesto?.arrivoIata?.trim();
    if (!scalo) return null;

    const numero = normNumero(voloIata);
    const url =
      "https://aviation-edge.com/v2/public/flightsHistory" +
      `?key=${encodeURIComponent(chiave)}` +
      `&code=${encodeURIComponent(scalo)}` +
      `&type=arrival` +
      `&date_from=${dataLocale}&date_to=${dataLocale}` +
      `&airline_iata=${encodeURIComponent(numero.slice(0, 2))}` +
      `&flight_num=${encodeURIComponent(numero.slice(2))}`;

    let corpo: unknown;
    try {
      const risposta = await fetch(url, {
        signal: AbortSignal.timeout(8_000), // le funzioni Netlify muoiono a 10s
        cache: "no-store",
      });
      if (!risposta.ok) {
        console.warn(`[aviationedge] risposta ${risposta.status} per ${voloIata} ${dataLocale}`);
        return null;
      }
      corpo = await risposta.json();
    } catch (e) {
      console.warn(`[aviationedge] chiamata fallita per ${voloIata} ${dataLocale}:`, e);
      return null;
    }

    return interpretaAviationEdge(corpo, voloIata, dataLocale);
  },
};
