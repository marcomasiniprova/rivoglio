import {
  VERSIONE_REGOLE,
  type FattoVolo,
  type Verdetto,
} from "./eu261";

/**
 * IL VOLO CANCELLATO: da "incerto" a verdetto vero.
 *
 * Perché serve un modulo a parte. Per un ritardo il dato oggettivo basta:
 * l'orario di atterraggio lo dice il tracciamento. Per una cancellazione
 * no: l'articolo 5 del Regolamento CE 261/2004 lega la compensazione a
 * due fatti che NESSUN archivio di volo conosce, e che sa solo il
 * passeggero:
 *   1. quanti giorni prima la compagnia lo ha avvisato;
 *   2. che volo alternativo gli ha offerto, e a che ora è arrivato.
 * Finché quei due dati mancavano, ogni cancellato finiva incerto e non si
 * vendeva niente. Qui si chiedono all'utente e il verdetto si chiude.
 *
 * L'ALBERO, dall'art. 5(1)(c), lettere a-b-c:
 * - avvisato 14 giorni prima o più            → NON spetta. Chiuso.
 * - avvisato fra 7 e 13 giorni  → spetta, A MENO CHE la riprotezione lo
 *   abbia fatto arrivare meno di 4 ore dopo l'orario previsto;
 * - avvisato meno di 7 giorni   → spetta, A MENO CHE la riprotezione lo
 *   abbia fatto arrivare meno di 2 ore dopo l'orario previsto;
 * - nessun preavviso (cancellato in aeroporto) → spetta.
 *
 * DOVE SIAMO PIÙ SEVERI DELLA LEGGE, e va detto: la legge esclude la
 * compensazione solo se la riprotezione rispetta ANCHE un limite
 * sull'orario di PARTENZA (max 1 o 2 ore prima del previsto). Quel dato
 * non lo chiediamo: chiedere tre cose a memoria a un utente che ha volato
 * mesi fa produce risposte sbagliate, e una risposta sbagliata qui vale
 * un reclamo respinto. Quindi quando l'arrivo rientra nei limiti diciamo
 * "non spetta" anche in qualche caso in cui la legge lo concederebbe.
 * Sbagliamo dalla parte di chi NON paga: è l'unico lato accettabile.
 *
 * L'importo NON si sconta del 50% come nel ritardo lungo raggio: quella
 * riduzione (art. 7.2) si applica alla riprotezione, e i casi in cui
 * sopravvive alla nostra domanda sull'arrivo sono già esclusi sopra.
 */

/** Quando la compagnia ha avvisato. Le parole sono quelle della schermata. */
export type Preavviso =
  | "oltre14" //      due settimane prima o più
  | "fra7e13" //      fra una e due settimane
  | "meno7" //        meno di una settimana
  | "nessuno" //      nessun avviso: cancellato lo stesso giorno o in aeroporto
  | "nonRicordo";

/** Com'è finita con il volo alternativo, misurata sull'ARRIVO. */
export type Alternativa =
  | "nessuna" //      nessun volo alternativo offerto
  | "entro2" //       arrivato meno di 2 ore dopo il previsto
  | "fra2e4" //       fra 2 e 4 ore dopo
  | "oltre4" //       più di 4 ore dopo
  | "nonRicordo";

export type RisposteCancellato = {
  preavviso: Preavviso;
  alternativa: Alternativa;
};

export const PREAVVISI: readonly Preavviso[] = [
  "oltre14",
  "fra7e13",
  "meno7",
  "nessuno",
  "nonRicordo",
];
export const ALTERNATIVE: readonly Alternativa[] = [
  "nessuna",
  "entro2",
  "fra2e4",
  "oltre4",
  "nonRicordo",
];

export function rispostaValida(r: unknown): r is RisposteCancellato {
  const x = r as RisposteCancellato | null;
  return (
    !!x &&
    PREAVVISI.includes(x.preavviso) &&
    ALTERNATIVE.includes(x.alternativa)
  );
}

const incerto = (motivo: string): Verdetto => ({
  esito: "incerto",
  motivo,
  versioneRegole: VERSIONE_REGOLE,
});

const nonIdoneo = (motivo: string): Verdetto => ({
  esito: "non_idoneo",
  ritardoMinuti: null,
  motivo,
  versioneRegole: VERSIONE_REGOLE,
});

/** Le stesse fasce del ritardo: è la distanza a decidere, non il caso. */
function fascia(km: number): 250 | 400 | 600 {
  if (km <= 1500) return 250;
  if (km <= 3500) return 400;
  return 600;
}

/**
 * Il verdetto su un volo cancellato, viste le risposte dell'utente.
 * Puro: stesse risposte, stesso verdetto, per sempre.
 */
export function valutaCancellato(f: FattoVolo, r: RisposteCancellato): Verdetto {
  if (f.stato !== "cancellato") {
    return incerto(
      "Questo volo non risulta cancellato negli archivi: le domande sulla cancellazione non si applicano.",
    );
  }

  /* Chi non ricorda non tira a indovinare al posto suo: resta incerto e
     non paga. È la regola dei tre stati, applicata a una memoria. */
  if (r.preavviso === "nonRicordo") {
    return incerto(
      "Senza sapere quanti giorni prima ti hanno avvisato non si può dire se la compensazione spetta: è la prima cosa che chiede il Regolamento. Cerca l'email o l'SMS della compagnia, di solito la data è lì, e torna a rispondere. Il controllo resta gratuito.",
    );
  }

  /* Avvisato con due settimane di anticipo: il Regolamento esclude la
     compensazione, punto. Non è un forse, è l'art. 5(1)(c)(i). */
  if (r.preavviso === "oltre14") {
    return nonIdoneo(
      "La compagnia ti ha avvisato almeno due settimane prima della partenza: in quel caso il Regolamento CE 261/2004 non prevede la compensazione (art. 5, comma 1, lettera c, punto i). Restano dovuti il rimborso del biglietto o un volo alternativo, se non li hai già avuti.",
    );
  }

  /* Da qui in giù la compensazione spetta, SALVO che la riprotezione ti
     abbia riportato a destinazione entro i limiti della legge. */
  const limiteOre = r.preavviso === "fra7e13" ? 4 : 2;
  const dentroIlLimite =
    r.alternativa === "entro2" || (limiteOre === 4 && r.alternativa === "fra2e4");

  if (r.alternativa === "nonRicordo") {
    return incerto(
      "Manca l'ultimo pezzo: con il volo alternativo, quanto dopo sei arrivato rispetto all'orario previsto? Da quello dipende se la compensazione spetta. Guarda la carta d'imbarco del volo che hai preso davvero e torna a rispondere: il controllo resta gratuito.",
    );
  }

  if (dentroIlLimite) {
    const quando =
      r.preavviso === "fra7e13"
        ? "fra una e due settimane prima"
        : r.preavviso === "meno7"
          ? "meno di una settimana prima"
          : "senza preavviso";
    return nonIdoneo(
      `Ti hanno avvisato ${quando} e con il volo alternativo sei arrivato entro il limite che il Regolamento considera accettabile (${limiteOre} ore dall'orario previsto): in questo caso la compensazione non spetta. Restano dovute l'assistenza e le spese vive, se le hai sostenute.`,
    );
  }

  /* Spetta. Ma valgono gli stessi paletti del ritardo: senza distanza non
     c'è fascia, e uno sciopero noto quel giorno lo guarda una persona. */
  if (f.scioperoNoto === true) {
    return incerto(
      "In base alle tue risposte la compensazione spetterebbe, ma nel giorno di questo volo risulta uno sciopero del trasporto aereo: l'esito dipende da chi scioperava e lo verifichiamo a mano. Non ti facciamo pagare niente finché non è chiaro.",
    );
  }

  if (f.vettoreDaDeterminare) {
    return incerto(
      "In base alle tue risposte la compensazione spetterebbe, ma questo numero di volo è venduto in codeshare: il reclamo deve andare alla compagnia che ha operato davvero, e la determiniamo a mano. Non ti facciamo pagare niente finché non è chiaro.",
    );
  }

  if (f.kmOrtodromica === null || !Number.isFinite(f.kmOrtodromica) || f.kmOrtodromica <= 0) {
    return incerto(
      "In base alle tue risposte la compensazione spetterebbe, ma non conosciamo la distanza della tratta, che decide l'importo. Riprova più tardi: il controllo resta gratuito.",
    );
  }

  const importo = fascia(f.kmOrtodromica);
  const quando =
    r.preavviso === "nessuno"
      ? "Il volo è stato cancellato senza preavviso"
      : r.preavviso === "meno7"
        ? "Ti hanno avvisato meno di una settimana prima"
        : "Ti hanno avvisato fra una e due settimane prima";
  const alternativa =
    r.alternativa === "nessuna"
      ? "e non ti hanno dato un volo alternativo"
      : `e con l'alternativa sei arrivato oltre il limite di ${limiteOre} ore`;

  return {
    esito: "idoneo",
    importo,
    /* Una cancellazione non ha un "ritardo all'arrivo" misurato: il campo
       resta a 0 e il motivo racconta il perché, senza numeri inventati. */
    ritardoMinuti: 0,
    motivo: `${quando} ${alternativa}: su una tratta di ${Math.round(f.kmOrtodromica)} km la fascia del Regolamento è ${importo}€. Restano da verificare le circostanze straordinarie, che può invocare solo la compagnia.`,
    versioneRegole: VERSIONE_REGOLE,
  };
}
