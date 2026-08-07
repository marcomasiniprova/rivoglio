/**
 * Strato 1 (SPEC §4): dall'input umano al volo canonico.
 *
 * "fr 8321", "FR8321", "FR-8321", "ryanair 8321" → "FR8321".
 * Nessuna AI, nessuna fantasia: o si riconosce con una regola, o si
 * risponde con un errore chiaro che spiega come scriverlo.
 */

import type { Esito } from "./tipi";

/**
 * Nomi con cui la gente chiama davvero le compagnie più comuni in Italia,
 * mappati sul codice IATA. Le chiavi sono minuscole e senza spazi:
 * l'input viene ridotto alla stessa forma prima del confronto, così
 * "Wizz Air", "wizzair" e "WIZZ" finiscono tutti su W6.
 */
const COMPAGNIE: Record<string, string> = {
  ryanair: "FR",
  ita: "AZ",
  itaairways: "AZ",
  easyjet: "U2",
  wizz: "W6",
  wizzair: "W6",
  vueling: "VY",
  volotea: "V7",
  aeroitalia: "XZ",
  lufthansa: "LH",
  airfrance: "AF",
  klm: "KL",
};

/** "FR" o "U2" o "W6": due caratteri, almeno una lettera. */
const CODICE_IATA = /^([A-Z]{2}|[A-Z][0-9]|[0-9][A-Z])$/;

const ERRORE_VOLO =
  "Non riconosco questo volo. Scrivilo come sulla carta d'imbarco, per esempio FR 8321, oppure con il nome della compagnia: Ryanair 8321.";

/**
 * Da quello che scrive l'utente al numero di volo canonico (es. "FR8321").
 * Accetta codice IATA o nome compagnia, spazi e trattini di mezzo,
 * maiuscole a piacere, zeri iniziali nel numero.
 */
export function normalizzaVolo(grezzo: string): Esito<string> {
  const pulito = (grezzo ?? "").trim().replace(/\s+/g, " ");
  if (!pulito) {
    return { ok: false, errore: "Scrivi il numero del volo, per esempio FR 8321." };
  }

  // Stacca l'eventuale parte numerica finale: "ryanair 8321a" → ["ryanair", "8321", "a"]
  const pezzi = pulito.match(/^(.*?)[\s-]*([0-9]{1,4})\s*([a-zA-Z])?$/);
  if (!pezzi) return { ok: false, errore: ERRORE_VOLO };

  const testa = pezzi[1].trim();
  const numero = Number(pezzi[2]); // "0123" → 123, come lo scrivono le compagnie
  const suffisso = (pezzi[3] ?? "").toUpperCase();
  if (numero < 1) return { ok: false, errore: ERRORE_VOLO };

  // 1) Già un codice IATA: "FR", "fr", "U2", "W6".
  const codiceDiretto = testa.toUpperCase();
  if (CODICE_IATA.test(codiceDiretto)) {
    return { ok: true, valore: codiceDiretto + numero + suffisso };
  }

  // 2) Nome della compagnia: "ryanair", "Wizz Air", "ita airways".
  const codiceDaNome = COMPAGNIE[testa.toLowerCase().replace(/[\s.-]/g, "")];
  if (codiceDaNome) {
    return { ok: true, valore: codiceDaNome + numero + suffisso };
  }

  return { ok: false, errore: ERRORE_VOLO };
}

/** Anni indietro oltre i quali non ha senso cercare: anche la finestra più larga per reclamare (stima 5-6 anni, SPEC §2) è chiusa. */
const ANNI_MASSIMI_INDIETRO = 6;

/**
 * Dalla data scritta dall'utente alla forma canonica "aaaa-mm-gg".
 * Accetta gg/mm/aaaa (come si scrive in Italia) e aaaa-mm-gg (come la
 * emette un campo `<input type="date">`). Rifiuta date inesistenti,
 * voli non ancora partiti e date più vecchie della finestra di reclamo.
 */
export function normalizzaData(grezza: string): Esito<string> {
  const pulita = (grezza ?? "").trim();
  let anno: number, mese: number, giorno: number;

  const italiana = pulita.match(/^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/);
  const iso = pulita.match(/^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})$/);
  if (italiana) {
    giorno = Number(italiana[1]);
    mese = Number(italiana[2]);
    anno = Number(italiana[3]);
  } else if (iso) {
    anno = Number(iso[1]);
    mese = Number(iso[2]);
    giorno = Number(iso[3]);
  } else {
    return { ok: false, errore: "Scrivi la data del volo come 14/08/2026." };
  }

  // Il giro per Date.UTC e ritorno smaschera le date inventate: 31/02 diventerebbe 2 o 3 marzo.
  const d = new Date(Date.UTC(anno, mese - 1, giorno));
  if (
    d.getUTCFullYear() !== anno ||
    d.getUTCMonth() !== mese - 1 ||
    d.getUTCDate() !== giorno
  ) {
    return { ok: false, errore: "Questa data non esiste. Controlla giorno e mese." };
  }

  const valore = `${anno}-${String(mese).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;

  /* Il confine col futuro è largo un giorno: la data è quella locale della
     partenza e il server ragiona in UTC, quindi "domani" può essere un volo
     già in aria da qualche parte del mondo. Oltre, non c'è niente da verificare. */
  const domani = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (valore > domani) {
    return {
      ok: false,
      errore: "Questo volo non è ancora partito. Torna dopo l'atterraggio: il controllo resta gratuito.",
    };
  }

  const limite = new Date();
  limite.setUTCFullYear(limite.getUTCFullYear() - ANNI_MASSIMI_INDIETRO);
  if (valore < limite.toISOString().slice(0, 10)) {
    return {
      ok: false,
      errore: `Più di ${ANNI_MASSIMI_INDIETRO} anni fa: i termini per chiedere la compensazione sono ormai scaduti in tutta Europa.`,
    };
  }

  return { ok: true, valore };
}
