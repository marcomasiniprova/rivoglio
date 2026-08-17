import type { Articolo } from "../tipi";

/**
 * ARTICOLO DI SITUAZIONE. La coincidenza persa è uno dei casi più cercati e
 * meno capiti: la gente pensa che conti il ritardo del primo volo, mentre
 * conta il ritardo con cui arrivi alla destinazione FINALE. Lo ha detto la
 * Corte UE (Folkerts, C-11/11). Il nostro motore lo verifica sui due voli;
 * qui lo spieghiamo a chi lo cerca su Google.
 *
 * Regola di scrittura: ogni numero deve tornare a una voce di `fonti`.
 */
export const ARTICOLO: Articolo = {
  slug: "coincidenza-persa-cosa-ti-spetta",
  titolo: "Coincidenza persa per un volo in ritardo: cosa ti spetta davvero",
  titoloSeo: "Coincidenza persa: quanto ti spetta e come chiederlo",
  descrizione:
    "Hai perso la coincidenza per il ritardo del primo volo? Su un'unica prenotazione conta il ritardo all'arrivo finale: da 250 a 600€ se sono 3 ore o più.",
  estratto:
    "Non conta il ritardo del primo volo, ma con quanto ritardo arrivi alla destinazione finale: se è 3 ore o più e la prenotazione era unica, la compensazione c'è.",
  data: "2026-08-17",
  tipo: "situazione",
  tag: ["diritti", "ritardo", "rimborsi"],
  copertina: "coincidenza-persa",
  minuti: 6,
  inEvidenza: true,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "compagnia-dice-no-cosa-puoi-fare",
    "quanto-tempo-hai-per-chiedere-il-rimborso",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Se hai perso una coincidenza per colpa del ritardo del primo volo, non conta quanto era in ritardo quel primo volo: conta con quanto ritardo sei arrivato alla destinazione FINALE.** Se all'arrivo finale il ritardo è di 3 ore o più, e i due voli erano su un'**unica prenotazione**, ti spetta una compensazione da 250 a 600€, calcolata sull'intero viaggio. Non è un'interpretazione nostra: lo ha stabilito la Corte di giustizia dell'Unione europea nel caso Folkerts (C-11/11).",
    },
    {
      tipo: "p",
      testo:
        "È il punto che quasi tutti sbagliano, comprese a volte le compagnie: guardano il ritardo alla partenza (magari 40 minuti, sotto ogni soglia) e ti dicono che non ti spetta niente. Ma la legge guarda l'arrivo, e se quei 40 minuti ti hanno fatto perdere la coincidenza e arrivare 4 ore dopo, la compensazione è dovuta.",
    },

    { tipo: "h2", testo: "Biglietto unico o biglietti separati? Qui si decide tutto" },
    {
      tipo: "p",
      testo:
        "La differenza che conta più di ogni altra è una sola: le due tratte erano su una **prenotazione unica** oppure su **due biglietti comprati separatamente**?",
    },
    {
      tipo: "elenco",
      voci: [
        "**Prenotazione unica** (un solo codice, che tu abbia comprato dalla compagnia o da un'agenzia in un colpo solo): il viaggio è considerato uno, e se arrivi alla meta finale con 3 ore o più di ritardo la compensazione ti spetta.",
        "**Due biglietti separati** (due prenotazioni diverse, magari due compagnie che non c'entrano tra loro): la legge non collega le due tratte. Se il primo ritarda e perdi il secondo, nessuno ti copre, e il secondo volo lo ricompri tu.",
      ],
    },
    {
      tipo: "nota",
      titolo: "Il consiglio che ti fa risparmiare un sacco di guai",
      testo:
        "Quando prenoti voli con coincidenza, controlla se è una prenotazione unica. Se sono due biglietti separati, lascia molto più margine tra un volo e l'altro: in caso di ritardo del primo, la protezione non c'è e paghi tu.",
    },

    { tipo: "h2", testo: "Quanto ti spetta: si calcola sull'intero viaggio" },
    {
      tipo: "p",
      testo:
        "La cifra dipende dalla distanza dell'intero viaggio, misurata in linea d'aria dalla partenza del primo volo all'arrivo dell'ultimo. Sono gli importi fissi del Regolamento CE 261/2004:",
    },
    {
      tipo: "tabella",
      intestazioni: ["Distanza dell'intero viaggio", "Importo a persona"],
      righe: [
        ["Fino a 1.500 km", "250€"],
        ["Da 1.500 a 3.500 km", "400€"],
        ["Oltre 3.500 km", "600€"],
      ],
    },
    {
      tipo: "p",
      testo:
        "Attenzione: è la distanza dell'INTERO viaggio, non della singola tratta persa. Un Milano - Francoforte - New York si calcola su tutto il tragitto fino a New York, non solo sul pezzo Milano - Francoforte. Come si leggono le fasce lo abbiamo spiegato per bene qui: [quanto ti spetta per un volo in ritardo](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },
    {
      tipo: "check",
    },

    { tipo: "h2", testo: "Come chiedere la compensazione, passo per passo" },
    {
      tipo: "passi",
      voci: [
        "Recupera le carte d'imbarco di tutte le tratte e gli orari veri: quello che serve è il ritardo con cui sei arrivato alla destinazione finale.",
        "Manda un reclamo scritto alla compagnia che ha operato il volo in ritardo (di solito la prima tratta), citando il Regolamento CE 261/2004 e la sentenza Folkerts (C-11/11).",
        "Chiedi la cifra giusta secondo la distanza dell'intero viaggio, e allega le carte d'imbarco come prova.",
        "Se non rispondono entro circa 6 settimane o dicono di no senza un motivo valido, puoi andare gratis su ConciliaWeb (la piattaforma dell'Autorità dei Trasporti) o segnalare all'ente nazionale del paese di partenza.",
      ],
    },

    { tipo: "h2", testo: "Quando invece non ti spetta niente" },
    {
      tipo: "elenco",
      voci: [
        "Se all'arrivo finale il ritardo è **sotto le 3 ore**: la coincidenza persa in sé non basta, serve il ritardo all'arrivo.",
        "Se i biglietti erano **separati**: la legge non lega le due tratte.",
        "Se il ritardo è dovuto a una **circostanza davvero eccezionale** (meteo estremo, uno sciopero esterno alla compagnia): in quel caso l'importo fisso può non essere dovuto, ma deve dimostrarlo la compagnia, non tu.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Nel dubbio non ci si inventa niente: se il caso è incerto, meglio verificarlo prima di scrivere. Ma se avevi una prenotazione unica e sei arrivato 3 ore o più dopo il previsto, parti dal fatto che la compensazione ti spetta, e non mollare al primo no.",
    },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Il primo volo era in ritardo di soli 30 minuti, posso comunque chiedere qualcosa?",
          risposta:
            "Sì, se quei 30 minuti ti hanno fatto perdere la coincidenza e arrivare alla destinazione finale con 3 ore o più di ritardo. Conta l'arrivo finale, non il ritardo del primo volo.",
        },
        {
          domanda: "Ho comprato i due voli separatamente, sono davvero senza tutele?",
          risposta:
            "Per la compensazione fissa sì: con due biglietti separati la legge non collega le tratte, quindi il volo perso lo ricompri tu. Resta però il buon senso della compagnia in alcuni casi, e comunque ogni singola tratta ha i suoi diritti se ritarda per conto suo.",
        },
        {
          domanda: "A quale compagnia devo scrivere se le due tratte erano di compagnie diverse?",
          risposta:
            "Alla compagnia che ha operato il volo che ha causato il ritardo, di solito la prima tratta. È quella responsabile del ritardo con cui sei arrivato alla fine.",
        },
        {
          domanda: "Quanto tempo ho per chiedere la compensazione?",
          risposta:
            "In Italia il termine è di 2 anni dal volo per le compagnie italiane; per molte compagnie estere è più lungo. Meglio non aspettare: prima chiedi, più è facile recuperare orari e prove.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "Corte di giustizia UE, sentenza Folkerts C-11/11 (compensazione per la coincidenza persa in base al ritardo all'arrivo finale)",
      url: "https://curia.europa.eu/juris/liste.jsf?num=C-11/11",
    },
    {
      titolo: "Regolamento (CE) n. 261/2004, articoli 5, 6 e 7 (compensazione e importi)",
      url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0261",
    },
    {
      titolo: "ENAC, diritti del passeggero: ritardo prolungato, soglia delle 3 ore e importi",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
    },
  ],
};
