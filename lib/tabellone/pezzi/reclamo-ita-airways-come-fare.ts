import type { Articolo } from "../tipi";

/**
 * ARTICOLO DI COMPAGNIA. ITA Airways è la compagnia italiana più cercata
 * per i reclami. A differenza delle low cost, pubblica un portale reclami
 * ufficiale, ed essendo italiana il termine per chiedere è di 2 anni.
 * Canale verificato in lib/lettera/compagnie.ts.
 *
 * Regola di scrittura: ogni numero deve tornare a una voce di `fonti`.
 */
export const ARTICOLO: Articolo = {
  slug: "reclamo-ita-airways-come-fare",
  titolo: "Reclamo ITA Airways: come chiedere rimborso e compensazione",
  titoloSeo: "Reclamo ITA Airways: rimborso e compensazione",
  descrizione:
    "Volo ITA Airways in ritardo di 3 ore, cancellato o con negato imbarco? Ti spetta da 250 a 600€. ITA è italiana, quindi hai 2 anni per chiederlo. Come fare.",
  estratto:
    "ITA Airways pubblica un portale reclami ufficiale, ed essendo italiana il termine per chiedere è di 2 anni. Ecco cosa ti spetta e come mandare il reclamo.",
  data: "2026-08-17",
  tipo: "compagnia",
  tag: ["compagnie", "rimborsi", "ritardo"],
  copertina: "busta-ufficiale",
  minuti: 6,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "compagnia-dice-no-cosa-puoi-fare",
    "quanto-tempo-hai-per-chiedere-il-rimborso",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Per un volo ITA Airways arrivato con almeno 3 ore di ritardo, cancellato senza preavviso di 14 giorni o con negato imbarco, ti spetta una compensazione da 250 a 600€ a seconda della distanza (Regolamento CE 261/2004), e la paga ITA direttamente a te.** ITA Airways, a differenza delle compagnie low cost, mette a disposizione un portale reclami ufficiale, ed essendo una compagnia italiana hai 2 anni di tempo per fare richiesta. È una buona notizia: il canale è chiaro e i tempi sono lunghi.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi in quali casi la somma ti spetta, quanto tempo hai davvero, e come mandare il reclamo a ITA passo per passo.",
    },

    { tipo: "h2", testo: "In quali casi ti spetta con ITA" },
    {
      tipo: "elenco",
      voci: [
        "**Ritardo di 3 ore o più** all'arrivo a destinazione (conta l'atterraggio, non la partenza).",
        "**Volo cancellato** senza un preavviso di almeno 14 giorni, se non ti hanno offerto un'alternativa adeguata.",
        "**Negato imbarco** contro la tua volontà, per esempio per overbooking: qui la somma spetta subito.",
        "**Declassamento**: se ti spostano in una classe più bassa di quella pagata, ti spetta un rimborso di una parte del prezzo.",
      ],
    },

    { tipo: "h2", testo: "Hai 2 anni per chiedere, ma non aspettare" },
    {
      tipo: "p",
      testo:
        "Essendo ITA una compagnia italiana, il termine per chiedere la compensazione è di 2 anni dal giorno del volo. È un tempo lungo rispetto ad altri paesi, ma non è un buon motivo per rimandare: più passa il tempo, più diventa difficile recuperare gli orari certificati e le prove. Come si calcolano le fasce lo abbiamo spiegato qui: [quanto ti spetta per un volo in ritardo](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },

    { tipo: "h2", testo: "Come mandare il reclamo a ITA, passo per passo" },
    {
      tipo: "passi",
      voci: [
        "Recupera il codice di prenotazione, la carta d'imbarco e l'orario di arrivo effettivo: è la prova del ritardo.",
        "Vai sul portale reclami ufficiale di ITA (complaint.ita-airways.com) e presenta il reclamo a tuo nome, indicando volo, data e il Regolamento CE 261/2004.",
        "Chiedi la compensazione della fascia giusta secondo la distanza, e allega la prova del volo.",
        "Se non rispondono entro circa 6 settimane o rifiutano senza un motivo valido, puoi andare gratis su ConciliaWeb (Autorità dei Trasporti) o segnalare all'ENAC. Per una richiesta formale c'è anche la PEC della compagnia.",
      ],
    },
    {
      tipo: "check",
    },

    { tipo: "h2", testo: "Quando ITA non è tenuta a pagare" },
    {
      tipo: "p",
      testo:
        "La compensazione fissa può non essere dovuta se il disservizio nasce da una circostanza davvero eccezionale, cioè fuori dal controllo della compagnia (per esempio un meteo estremo o uno sciopero esterno). Ma attenzione: deve dimostrarlo ITA, non tu, e un generico \"problema tecnico\" o \"motivi operativi\" di solito non basta. Nel dubbio conviene verificare il caso prima di scrivere.",
    },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Il mio volo ITA era in ritardo di 2 ore e 40: mi spetta qualcosa?",
          risposta:
            "Per la compensazione fissa serve arrivare con almeno 3 ore di ritardo. Sotto quella soglia la somma non spetta, ma restano l'assistenza (pasti, e hotel se pertinente) e, in caso di spese anticipate, il loro rimborso con le ricevute.",
        },
        {
          domanda: "Ho comprato il biglietto ITA da un'agenzia online: cambia qualcosa?",
          risposta:
            "No, la compensazione la deve ITA in quanto compagnia che opera il volo. L'agenzia c'entra semmai col rimborso del biglietto, non con la compensazione del Regolamento 261.",
        },
        {
          domanda: "Devo cedere il credito o dare un mandato a qualcuno?",
          risposta:
            "No. Il reclamo lo puoi mandare tu dal portale ufficiale, con la tua email, e la somma arriva direttamente a te, senza percentuali trattenute.",
        },
        {
          domanda: "E se ITA risponde di no?",
          risposta:
            "Un no non chiude la partita. Se la motivazione è debole puoi replicare per iscritto, e poi rivolgerti gratis a ConciliaWeb o all'ENAC. Spesso il no cade proprio quando insisti nel modo giusto.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo: "ITA Airways, portale reclami ufficiale (Italia Trasporto Aereo S.p.A.)",
      url: "https://www.complaint.ita-airways.com/s/complaint",
    },
    {
      titolo: "Regolamento (CE) n. 261/2004, articoli 5, 7 e 10 (compensazione, importi, declassamento)",
      url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0261",
    },
    {
      titolo: "ENAC, diritti del passeggero: ritardo, cancellazione, negato imbarco",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
    },
  ],
};
