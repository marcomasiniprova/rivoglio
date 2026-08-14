/**
 * Il fornitore DIMOSTRATIVO. Attivo solo quando manca AERODATABOX_API_KEY
 * (la scelta la fa l'orchestratore in lib/voli/verifica.ts).
 *
 * Regola 3 del progetto: niente dati finti che sembrano veri. Quindi:
 * - i numeri di volo iniziano tutti per "ZZ", un codice che nessuna
 *   compagnia usa: impossibile scambiarli per voli reali;
 * - ogni fatto esce con fonte "demo", che il resto della catena propaga
 *   fino all'interfaccia (la risposta dell'API pubblica porta demo: true).
 *
 * Gli 8 voli coprono tutti i rami del motore: le quattro fasce di importo
 * (250/400/300/600), il confine dei 179 minuti, l'arrivo in anticipo, il
 * cancellato e lo sconosciuto. Gli orari si costruiscono sulla data chiesta,
 * così la demo funziona con qualunque giorno.
 */

import type { FattoConPayload, FattoVolo, FornitoreVoli } from "../tipi";

type SagomaDemo = {
  voloIata: string;
  /** Cosa dimostra questo volo, mostrabile anche in un'eventuale lista demo. */
  copre: string;
  stato: FattoVolo["stato"];
  /** Ora di arrivo previsto (UTC, sul giorno richiesto). */
  previstoOre?: string;
  /** Ritardo effettivo in minuti rispetto al previsto. Negativo = anticipo. */
  ritardoMinuti?: number;
  km?: number;
  /**
   * Gli scali, quando quel caso ha bisogno di una tratta sua.
   * Servono ai due casi di lungo raggio: dal 9/08 l'art. 7 lett. b) tiene
   * a 400€ tutte le tratte intracomunitarie, e con Bergamo → Palermo i
   * voli che dovevano mostrare 300€ e 600€ mostravano 400€, cioè
   * dimostravano il contrario di quello che dicono.
   */
  partenza?: string;
  arrivo?: string;
};

/**
 * Vero se questo numero è un volo dimostrativo.
 *
 * Il segno è il prefisso ZZ, che nessuna compagnia vera usa. Esiste come
 * funzione, e non come confronto scritto qua e là, perché il bollo
 * "esempio" deve comparire su OGNI cosa che esce da qui, email comprese:
 * un numero inventato che gira senza bollo è la regola 3 del progetto
 * rotta a metà.
 */
export function voloDimostrativo(voloIata: string | null | undefined): boolean {
  return typeof voloIata === "string" && voloIata.trim().toUpperCase().startsWith("ZZ");
}

export const VOLI_DEMO: SagomaDemo[] = [
  { voloIata: "ZZ250", copre: "idoneo, fascia 250 (corto raggio, 3h20 di ritardo)", stato: "atterrato", previstoOre: "20:00", ritardoMinuti: 200, km: 980 },
  { voloIata: "ZZ400", copre: "idoneo, fascia 400 (medio raggio, 3h30 di ritardo)", stato: "atterrato", previstoOre: "20:00", ritardoMinuti: 210, km: 2300 },
  { voloIata: "ZZ300", copre: "idoneo, fascia 300 (lungo raggio fuori UE, 3h40: sotto le 4h scatta la riduzione)", stato: "atterrato", previstoOre: "18:00", ritardoMinuti: 220, km: 4200, partenza: "FCO", arrivo: "JFK" },
  { voloIata: "ZZ600", copre: "idoneo, fascia 600 (lungo raggio fuori UE, 5h05 di ritardo)", stato: "atterrato", previstoOre: "18:00", ritardoMinuti: 305, km: 6500, partenza: "FCO", arrivo: "JFK" },
  { voloIata: "ZZ180", copre: "non idoneo per un minuto: 2h59 di ritardo", stato: "atterrato", previstoOre: "20:00", ritardoMinuti: 179, km: 800 },
  { voloIata: "ZZ10", copre: "non idoneo, arrivato in anticipo", stato: "atterrato", previstoOre: "20:00", ritardoMinuti: -5, km: 1200 },
  { voloIata: "ZZ777", copre: "cancellato: esito incerto, non si vende", stato: "cancellato", km: 1100 },
  { voloIata: "ZZ404", copre: "dati non trovati: esito incerto", stato: "sconosciuto" },
  /* La COPPIA della coincidenza a due tratte, per poterla provare (e filmare)
     senza voli veri: ZZ501 è il primo volo, con un ritardo piccolo (40 min:
     da solo non idoneo) che fa perdere la coincidenza ZZ502. ZZ501 atterra a
     Parigi alle 13:40, quando ZZ502 (Parigi → New York) è già partito, alle
     13:20. Il motore, leggendo i due voli, prova che il ritardo del primo ti
     ha fatto perdere il secondo, e calcola la fascia sul viaggio intero. */
  { voloIata: "ZZ501", copre: "coincidenza persa: primo volo, 40 min di ritardo (non idoneo da solo)", stato: "atterrato", previstoOre: "13:00", ritardoMinuti: 40, km: 640, partenza: "BGY", arrivo: "CDG" },
  { voloIata: "ZZ502", copre: "coincidenza persa: la coincidenza persa, Parigi → New York", stato: "atterrato", previstoOre: "15:20", ritardoMinuti: 0, km: 5800, partenza: "CDG", arrivo: "JFK" },
];

/** "2026-08-14" + "20:00" + 200 minuti → ISO UTC dell'arrivo effettivo. */
function orarioUtc(dataLocale: string, ore: string, piuMinuti = 0): string {
  const base = Date.parse(`${dataLocale}T${ore}:00Z`);
  return new Date(base + piuMinuti * 60_000).toISOString();
}

export const demo: FornitoreVoli = {
  nome: "demo",

  async cerca(voloIata: string, dataLocale: string): Promise<FattoConPayload | null> {
    const sagoma = VOLI_DEMO.find((v) => v.voloIata === voloIata);
    if (!sagoma) return null; // un numero vero qui non trova MAI niente

    const previsto = sagoma.previstoOre ? orarioUtc(dataLocale, sagoma.previstoOre) : null;
    const effettivo =
      sagoma.stato === "atterrato" && sagoma.previstoOre
        ? orarioUtc(dataLocale, sagoma.previstoOre, sagoma.ritardoMinuti ?? 0)
        : null;

    return {
      voloIata,
      dataLocale,
      vettoreOperativo: "ZZ Compagnia Demo",
      vettoreMarketing: null,
      /* Una tratta dimostrativa dichiarata: le CITTÀ restano finte, così il
         teatro dello scan (il biglietto che si compila) non spaccia una
         città vera per il volo di qualcuno.
         Gli SCALI invece sono due codici italiani veri, e servono: dal 9/08
         il motore ha un cancello territoriale (art. 3) e senza aeroporti
         riconoscibili risponderebbe "incerto" anche al caso dimostrativo,
         mostrando sulla landing un prodotto che non decide mai. */
      partenzaIata: sagoma.partenza ?? "BGY",
      partenzaCitta: "Scalo demo A",
      arrivoIata: sagoma.arrivo ?? "PMO",
      arrivoCitta: "Scalo demo B",
      /* Partenza demo: due ore prima dell'arrivo previsto. Non è realistica
         per la fascia (che usa i km), serve solo a dare un orario di
         partenza alla coincidenza a due tratte. */
      partenzaPrevistoUtc:
        sagoma.stato === "sconosciuto" || !sagoma.previstoOre
          ? null
          : orarioUtc(dataLocale, sagoma.previstoOre, -120),
      arrivoPrevistoUtc: sagoma.stato === "sconosciuto" ? null : previsto,
      arrivoEffettivoUtc: effettivo,
      stato: sagoma.stato,
      kmOrtodromica: sagoma.km ?? null,
      // La demo simula un dato tracciato (è comunque marcata demo ovunque).
      orarioVerificato: sagoma.stato === "atterrato" ? true : undefined,
      fonte: "demo",
      payloadGrezzo: { demo: true, copre: sagoma.copre },
    };
  },
};
