import type { Articolo } from "../tipi";

/**
 * PILASTRO 1. È la guida su cui si appoggia mezzo blog: tutti i pezzi
 * su ritardo, fasce e compagnie rimandano qui, e da qui si scende a loro.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni
 * numero che compare nel testo deve poter tornare a una voce di `fonti`.
 * Se un numero non ha la sua fonte, il numero si toglie.
 */
export const ARTICOLO: Articolo = {
  slug: "volo-in-ritardo-250-400-600-euro",
  titolo: "Volo in ritardo: quando ti spettano 250, 400 o 600 euro",
  titoloSeo: "Volo in ritardo: quando spettano 250, 400 o 600 euro",
  descrizione:
    "La soglia esatta, le tre fasce di importo e i casi in cui non ti spetta niente. Con la regola sulle tratte europee lunghe che quasi nessuno scrive.",
  estratto:
    "Contano le ore di ritardo all'arrivo, non alla partenza. Sopra le tre ore si aprono tre fasce, e c'è un'eccezione che vale centinaia di euro.",
  data: "2026-08-09",
  tipo: "pilastro",
  tag: ["diritti", "ritardo", "guida"],
  copertina: "soglia-tre-ore",
  minuti: 9,
  inEvidenza: true,
  correlati: [
    "compagnia-dice-no-cosa-puoi-fare",
    "volo-cancellato-primi-60-minuti",
    "quanto-tempo-hai-per-chiedere-il-rimborso",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Se il tuo volo è atterrato con almeno tre ore di ritardo, la compagnia ti deve una somma fissa: 250, 400 o 600 euro a seconda della tratta.** Non è un risarcimento da dimostrare e non dipende da quanto è costato il biglietto: è una cifra decisa dal Regolamento CE 261/2004, uguale per chi ha pagato 29 euro e per chi ne ha pagati 900. Sotto le tre ore non spetta niente, e chi ti dice il contrario ti sta vendendo qualcosa.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi la soglia esatta, come si misura, le tre fasce, l'eccezione sulle tratte europee lunghe che quasi nessun sito italiano scrive, e i casi in cui la compagnia non ti deve niente. In fondo c'è cosa fare, in ordine.",
    },

    { tipo: "h2", testo: "Contano le ore all'arrivo, non alla partenza" },
    {
      tipo: "p",
      testo:
        "È l'errore più comune. La gente guarda l'orario di partenza sul tabellone, vede due ore di ritardo e si convince che non basta. Poi l'aereo recupera venti minuti in volo, oppure ne perde altri quaranta in attesa della piazzola, e il conto vero è un altro.",
    },
    {
      tipo: "p",
      testo:
        "Il ritardo che conta è quello **all'arrivo**, e si misura da quando le porte dell'aereo si aprono a destinazione. Le tre ore sono la differenza fra l'orario di arrivo previsto sul biglietto e quel momento lì.",
    },
    {
      tipo: "nota",
      titolo: "Se la compagnia ha spostato l'orario",
      testo:
        "La Corte di giustizia europea, il 30 ottobre 2025, ha stabilito che se il vettore sposta gli orari e ti manda una nuova conferma, il ritardo si calcola comunque sull'orario di arrivo **inizialmente previsto**. Tradotto: spostare l'orario su un'email non azzera il conto.",
    },

    { tipo: "h2", testo: "Le tre fasce, e l'eccezione che vale 200 euro" },
    {
      tipo: "p",
      testo:
        "L'importo dipende dalla distanza fra l'aeroporto di partenza e quello di arrivo, misurata in linea d'aria, e da dove sono i due aeroporti.",
    },
    {
      tipo: "tabella",
      intestazioni: ["La tua tratta", "Quanto ti spetta"],
      righe: [
        ["Fino a 1.500 km", "**250 €**"],
        ["Oltre 1.500 km, ma partenza e arrivo **dentro** l'Unione Europea", "**400 €**, anche se la tratta è lunghissima"],
        ["Fra 1.500 e 3.500 km, con uno scalo fuori dall'Unione", "**400 €**"],
        ["Oltre 3.500 km, con uno scalo fuori dall'Unione", "**600 €**, che scendono a **300 €** se il ritardo resta sotto le 4 ore"],
      ],
    },
    {
      tipo: "p",
      testo:
        "La seconda riga è quella che nessuno scrive, ed è la più insidiosa. L'articolo 7 tiene a 400 euro **tutte** le tratte che partono e arrivano dentro lo spazio europeo, per quanto lunghe siano. Parigi-Riunione fa novemila chilometri ed è un volo interno alla Francia: valgono 400 euro, non 600. Se un sito o un calcolatore ti promette 600 euro su una tratta del genere, sta gonfiando il numero, e te ne accorgerai quando la compagnia ti risponderà.",
    },
    {
      tipo: "p",
      testo:
        "Noi quell'eccezione l'abbiamo scritta nel motore che dà il verdetto. Ci abbiamo messo del tempo, e per un periodo il nostro stesso calcolo era generoso più della norma: l'abbiamo trovato scrivendo questa guida e corretto lo stesso giorno.",
    },

    {
      tipo: "check",
      titolo: "In quale fascia sei? Guarda i dati veri del tuo volo",
      testo:
        "Non serve un account e non serve la carta. Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia. Se il caso non regge, te lo diciamo lo stesso e non paghi niente.",
    },

    { tipo: "h2", testo: "Cosa ti spetta anche quando la compensazione non spetta" },
    {
      tipo: "p",
      testo:
        "Sono due cose diverse, e quasi tutti le confondono. La compensazione è la somma fissa di cui sopra. L'assistenza è quello che la compagnia deve darti mentre aspetti, e **non dipende dalle tre ore**.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Da 2 ore di ritardo** sulle tratte fino a 1.500 km ti spettano già pasti, bevande e la possibilità di comunicare. Le soglie salgono con la distanza.",
        "Se l'attesa passa la notte, ti spetta l'albergo e il trasferimento da e per l'aeroporto.",
        "**Con almeno 5 ore di ritardo** puoi decidere di non partire e farti rimborsare il biglietto per la parte di viaggio che non hai fatto. Se a quel punto il viaggio non ha più senso, il rimborso copre anche la parte già fatta e la compagnia ti riporta al punto di partenza col primo volo utile.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se hai pagato di tasca tua un panino, un taxi o un albergo perché al banco non c'era nessuno, tieni gli scontrini: quelle spese si chiedono a parte, e si chiedono anche se la compensazione non spetta.",
    },

    { tipo: "h2", testo: "Quando la compagnia non ti deve niente" },
    {
      tipo: "p",
      testo:
        "Lo scriviamo per intero, perché è la parte che i portali a percentuale tendono a saltare: a loro conviene che tu apra la pratica comunque.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Il ritardo all'arrivo è sotto le 3 ore.** Anche 2 ore e 59 minuti sono un no. È una soglia secca, non una fascia morbida.",
        "**Il volo non è coperto dal Regolamento.** Conta da dove decolla l'aereo: se parti da un aeroporto europeo sei coperto sempre, con qualsiasi compagnia del mondo; se parti da un paese fuori dall'Unione, sei coperto solo se chi ha operato il volo è una compagnia europea. Un New York-Toronto in ritardo di quattro ore non dà nessuna compensazione europea.",
        "**La compagnia dimostra una circostanza eccezionale.** Attenzione alle parole: deve dimostrarla, e deve dimostrare il legame con il tuo volo. Non basta dire che quel giorno c'era brutto tempo o un'agitazione.",
      ],
    },
    {
      tipo: "nota",
      titolo: "Chi deve provare cosa",
      testo:
        "Tu devi provare due cose sole: che avevi il biglietto e che il disservizio c'è stato. È la compagnia a dover provare la circostanza eccezionale e il suo legame con il volo. La Cassazione lo ha ribadito con l'ordinanza n. 17644 del 2025.",
    },

    { tipo: "h2", testo: "Quanto ti resta, a seconda di come lo chiedi" },
    {
      tipo: "p",
      testo:
        "La compensazione è la stessa in tutti i casi. Cambia quanto ne arriva a te. Un servizio a percentuale trattiene una quota del rimborso, e la trattiene solo se vinci: sembra indolore proprio per quello. Ma su una compensazione da 600 euro basta una quota di un terzo perché se ne vadano più di 200 euro, e il conto qui sotto lo fa vedere.",
    },
    {
      tipo: "citazione",
      testo:
        "Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a fare la richiesta da soli.",
      fonte:
        "Ryanair, pagina ufficiale sulle Claims Management Companies (fonte 4 in fondo)",
    },
    { tipo: "confronto", compensazione: 600 },
    {
      tipo: "p",
      testo:
        "Noi stiamo dalla parte opposta: prezzo fisso, deciso prima, e la lettera la mandi tu dalla tua email. La compagnia paga te, direttamente, e la somma arriva intera.",
    },

    { tipo: "h2", testo: "Cosa fare adesso, in ordine" },
    {
      tipo: "passi",
      voci: [
        "**Controlla il dato oggettivo del volo**, cioè l'orario di arrivo effettivo registrato. È l'unico numero che conta e non è quello che ricordi tu.",
        "**Metti da parte le prove**: carta d'imbarco, email di prenotazione, foto del tabellone, scontrini delle spese.",
        "**Scrivi alla compagnia**, dal suo canale reclami, tu, con il tuo nome. Molte compagnie lavorano solo il reclamo mandato dal passeggero, e alcune lo mettono per iscritto nelle condizioni di trasporto.",
        "**Aspetta la risposta.** L'ENAC indica sei settimane come tempo entro cui la compagnia deve rispondere.",
        "**Se ti dicono no senza un motivo valido, o non rispondono**, si passa all'organismo nazionale del paese da cui sei partito. [Come funziona, passo per passo](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
      ],
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Il volo ha ritardato di 2 ore: mi spetta qualcosa?",
          risposta:
            "La compensazione no, serve almeno tre ore all'arrivo. L'assistenza sì: su una tratta fino a 1.500 km pasti e bevande sono dovuti già da due ore di attesa. E se hai speso di tasca tua, quelle spese si chiedono comunque.",
        },
        {
          domanda: "Ho buttato la carta d'imbarco: posso ancora chiedere?",
          risposta:
            "Sì. La carta d'imbarco aiuta, ma la prova del contratto è la prenotazione: l'email di conferma con il codice basta a dimostrare che eri su quel volo.",
        },
        {
          domanda: "Il biglietto costava 30 euro: mi possono dare 400 euro?",
          risposta:
            "Sì. L'importo non dipende dal prezzo del biglietto, dipende dalla distanza della tratta. È scritto nell'articolo 7 del Regolamento e vale anche sui voli low cost.",
        },
        {
          domanda: "Se il ritardo è per maltempo, non mi spetta niente?",
          risposta:
            "Non è automatico. La compagnia deve dimostrare la circostanza eccezionale e il legame con il tuo volo specifico. Un guasto legato alla manutenzione ordinaria dell'aereo, per esempio, non è una circostanza eccezionale.",
        },
        {
          domanda: "Vale anche per i voli dell'anno scorso?",
          risposta:
            "Le finestre per reclamare durano più di un anno, ma in Italia il termine è contestato e il caso peggiore credibile è breve. [Ne abbiamo scritto qui](/tabellone/quanto-tempo-hai-per-chiedere-il-rimborso).",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione e assistenza",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: cosa fare se la compagnia non risponde",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "Corte di giustizia UE, 30 ottobre 2025, causa C-558/24: il ritardo si calcola sull'orario inizialmente previsto",
      url: "https://www.eius.it/giurisprudenza/2025/5853591",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
    {
      titolo:
        "Cassazione, ordinanza n. 17644/2025: l'onere della prova della circostanza eccezionale è del vettore",
      url: "https://www.studiolegalebianucci.it/it/blog/4451-ritardo-aereo-e-risarcimento-la-cassazione-chiarisce-l-onere-della-prova-ordinanza-n-17644-2025",
    },
    {
      titolo:
        "Corte di giustizia UE, causa C-385/23: il guasto da manutenzione ordinaria non è circostanza eccezionale",
      url: "https://eur-lex.europa.eu/legal-content/IT/TXT/HTML/?uri=CELEX:62023CJ0385",
    },
  ],
};
