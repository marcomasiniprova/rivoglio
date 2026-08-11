/**
 * AeroDataBox, il fornitore PRIMARIO (SPEC §4 e §9: 5-32$/mese).
 *
 * Endpoint usato (docs: doc.aerodatabox.com, spec OpenAPI "Flight API"
 * v1.14, operazione GetFlight_FlightOnSpecificDate):
 *
 *   GET https://aerodatabox.p.rapidapi.com/flights/number/{volo}/{dataLocale}
 *       ?dateLocalRole=Departure&withAircraftImage=false&withLocation=false
 *   header X-RapidAPI-Key:  la chiave (env AERODATABOX_API_KEY)
 *   header X-RapidAPI-Host: aerodatabox.p.rapidapi.com
 *
 * Risponde un ARRAY di voli (lo stesso numero può coprire più tratte nello
 * stesso giorno). Campi che ci servono, dalla spec:
 * - arrival.scheduledTime / revisedTime / runwayTime: oggetti {utc, local}
 * - status: Unknown | Expected | EnRoute | ... | Arrived | Canceled | Diverted | CanceledUncertain
 * - codeshareStatus: Unknown | IsOperator | IsCodeshared
 * - airline: {name, iata, icao} · greatCircleDistance: {km, ...} · isCargo
 */

import { kmFraAeroporti } from "@/lib/voli/distanza";
import type { FattoConPayload, FattoVolo, FornitoreVoli } from "../tipi";

import { chiamaConRitentativo } from "./chiamata";
const HOST = "aerodatabox.p.rapidapi.com";

type OrarioAdb = { utc?: string | null; local?: string | null } | null;

type MovimentoAdb = {
  /* municipalityName è la CITTÀ ("Bergamo"), name è il nome dello scalo
     ("Bergamo Orio al Serio"): all'utente serve la città. */
  airport?: {
    iata?: string | null;
    icao?: string | null;
    name?: string | null;
    municipalityName?: string | null;
    /* Il paese in codice ISO a due lettere. È il dato con cui il cancello
       territoriale decide se il Regolamento si applica, ed è meglio della
       nostra tabella degli scali: quella è ferma al 2017, questo arriva
       insieme al volo. */
    countryCode?: string | null;
  } | null;
  scheduledTime?: OrarioAdb;
  revisedTime?: OrarioAdb;
  predictedTime?: OrarioAdb;
  runwayTime?: OrarioAdb;
  /** ["Basic"] = solo orari di tabella; con "Live" il volo era tracciato. */
  quality?: string[] | null;
} | null;

type VoloAdb = {
  greatCircleDistance?: { km?: number } | null;
  departure?: MovimentoAdb;
  arrival?: MovimentoAdb;
  number?: string;
  status?: string;
  codeshareStatus?: string;
  isCargo?: boolean;
  airline?: { name?: string; iata?: string | null; icao?: string | null } | null;
};

/**
 * Gli orari UTC di AeroDataBox arrivano come "2026-08-14 22:55Z" (spazio,
 * non "T"): non tutti i motori JS li leggono. Qui si riportano alla forma
 * ISO e si butta via tutto ciò che non è una data leggibile.
 */
function utcIso(orario: OrarioAdb | undefined): string | null {
  const s = orario?.utc?.trim();
  if (!s) return null;
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  return Number.isFinite(Date.parse(iso)) ? iso : null;
}

function statoDa(statusAdb: string | undefined): FattoVolo["stato"] {
  switch (statusAdb) {
    case "Arrived":
      return "atterrato";
    case "Canceled":
      return "cancellato";
    case "Diverted":
      return "dirottato";
    default:
      /* Tutto il resto (Expected, EnRoute, Delayed, Unknown e anche
         CanceledUncertain) è un volo NON concluso o non confermato:
         per noi è "sconosciuto" e il motore risponderà incerto.
         Mai indovinare uno stato che l'API non certifica. */
      return "sconosciuto";
  }
}

export const aerodatabox: FornitoreVoli = {
  nome: "aerodatabox",

  async cerca(voloIata: string, dataLocale: string): Promise<FattoConPayload | null> {
    const chiave = process.env.AERODATABOX_API_KEY;
    if (!chiave) return null;

    // dataLocale in FattoVolo è la data di PARTENZA in ora locale: dateLocalRole=Departure.
    const url =
      `https://${HOST}/flights/number/${encodeURIComponent(voloIata)}/${dataLocale}` +
      `?dateLocalRole=Departure&withAircraftImage=false&withLocation=false`;

    /* Il tetto del fornitore è al SECONDO, non al mese: in un picco
       risponde "troppe richieste" e prima si mollava al primo colpo,
       trasformando una vendita in un incerto. Adesso aspetta e riprova
       (vedi chiamata.ts). 204 e 404 non si riprovano: quel volo su
       quella data non ce l'hanno, e riprovare costerebbe uguale. */
    let corpo: VoloAdb[];
    const esito = await chiamaConRitentativo(
      url,
      { "X-RapidAPI-Key": chiave, "X-RapidAPI-Host": HOST },
      `aerodatabox ${voloIata} ${dataLocale}`,
    );
    if (!esito.ok) return null;
    try {
      corpo = (await esito.risposta.json()) as VoloAdb[];
    } catch (e) {
      console.warn(`[aerodatabox] risposta illeggibile per ${voloIata} ${dataLocale}:`, e);
      return null;
    }
    if (!Array.isArray(corpo) || corpo.length === 0) return null;

    /* Più risultati per lo stesso numero: fuori i cargo, e se c'è la voce
       in cui la compagnia del numero è anche l'operatore si prende quella. */
    const candidati = corpo.filter((v) => !v.isCargo);
    const volo = candidati.find((v) => v.codeshareStatus === "IsOperator") ?? candidati[0];
    if (!volo) return null;

    let stato = statoDa(volo.status);
    const effettivo = utcIso(volo.arrival?.runwayTime) ?? utcIso(volo.arrival?.revisedTime);

    /* runwayTime = ruote a terra, revisedTime = orario aggiornato/effettivo.
       Si preferisce runwayTime perché è SEMPRE precedente all'apertura porte
       (il momento che conta per la Corte UE): il ritardo calcolato così è
       sottostimato, mai gonfiato. Zero falsi positivi prima di tutto.
       Se l'API dice "Arrived" ma non porta un orario effettivo, il fatto
       non è verificabile: stato sconosciuto, non si vende. */
    if (stato === "atterrato" && !effettivo) stato = "sconosciuto";

    /* "Senza Live niente vendita" (regola del 07/08, dal test reale):
       arrival.quality con "Live" = il volo era tracciato e l'orario è un
       fatto; senza, revisedTime può essere una stima e il motore dirà
       incerto. Il fatto esce comunque: il payload resta come prova. */
    const qualita = volo.arrival?.quality;
    const tracciato = Array.isArray(qualita) && qualita.includes("Live");

    const compagnia = volo.airline?.iata ?? volo.airline?.name ?? voloIata.slice(0, 2);

    return {
      voloIata,
      dataLocale,
      /* Con IsCodeshared questo endpoint NON dice chi ha operato davvero:
         si tiene la compagnia del numero come miglior dato disponibile, la
         si segna anche come vettore marketing e si alza vettoreDaDeterminare:
         il motore fermerà la vendita finché l'operativo non è certo
         (payload_grezzo conserva comunque tutta la risposta). */
      vettoreOperativo: compagnia,
      vettoreMarketing: volo.codeshareStatus === "IsCodeshared" ? compagnia : null,
      /* v1: si vende SOLO su IsOperator (regola di Valerio dell'8/08).
         IsCodeshared, Unknown o campo assente: vettore da determinare,
         il motore ferma la vendita. */
      vettoreDaDeterminare: volo.codeshareStatus !== "IsOperator",
      partenzaIata: volo.departure?.airport?.iata ?? null,
      partenzaCitta:
        volo.departure?.airport?.municipalityName ?? volo.departure?.airport?.name ?? null,
      partenzaPaese: volo.departure?.airport?.countryCode ?? null,
      partenzaIcao: volo.departure?.airport?.icao ?? null,
      arrivoIata: volo.arrival?.airport?.iata ?? null,
      arrivoCitta:
        volo.arrival?.airport?.municipalityName ?? volo.arrival?.airport?.name ?? null,
      arrivoPaese: volo.arrival?.airport?.countryCode ?? null,
      arrivoIcao: volo.arrival?.airport?.icao ?? null,
      arrivoPrevistoUtc: utcIso(volo.arrival?.scheduledTime),
      arrivoEffettivoUtc: stato === "atterrato" ? effettivo : null,
      stato,
      orarioVerificato: stato === "atterrato" ? tracciato : undefined,
      kmOrtodromica:
        typeof volo.greatCircleDistance?.km === "number"
          ? volo.greatCircleDistance.km
          : kmFraAeroporti(
              volo.departure?.airport?.iata ?? "",
              volo.arrival?.airport?.iata ?? "",
            ),
      fonte: "aerodatabox",
      payloadGrezzo: corpo,
    };
  },
};
