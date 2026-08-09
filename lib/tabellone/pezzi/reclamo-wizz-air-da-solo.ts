import type { Articolo } from "../tipi";

/**
 * ARTICOLO PER COMPAGNIA. L'angolo è il portale che Wizz Air riserva alle
 * società di reclami: esiste, è dichiarato, e non serve al passeggero.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni
 * numero che compare nel testo deve poter tornare a una voce di `fonti`.
 * Se un numero non ha la sua fonte, il numero si toglie.
 */
export const ARTICOLO: Articolo = {
  slug: "reclamo-wizz-air-da-solo",
  titolo: "Wizz Air: come chiedere la compensazione da solo",
  titoloSeo: "Wizz Air: come chiedere la compensazione da solo",
  descrizione:
    "Il reclamo a Wizz Air si manda dal proprio account e la compagnia dichiara 30 giorni. Il canale riservato alle società di reclami esiste, ma non serve a te.",
  estratto:
    "Wizz Air è l'unica grande compagnia che accoglie gli intermediari con un portale dedicato. Il modulo del passeggero, però, è lo stesso: e il denaro resta intero.",
  data: "2026-08-09",
  tipo: "compagnia",
  tag: ["compagnie", "cancellazione", "rimborsi"],
  copertina: "imbarco-negato",
  foto: "/assets/tabellone/reclamo-wizz.webp",
  minuti: 7,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "compagnia-dice-no-cosa-puoi-fare",
    "volo-cancellato-primi-60-minuti",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Il reclamo a Wizz Air si manda dal modulo reclami del proprio account, con il proprio nome, e la compagnia dichiara di trattare le richieste entro 30 giorni, con lo stato consultabile nell'account stesso.** Non serve un intermediario, non serve un avvocato e non serve firmare una delega: il modulo che compili tu è lo stesso che compilerebbe chiunque altro al posto tuo, e la differenza è che l'eventuale somma arriva a te intera.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi perché il canale riservato alle società di reclami non riguarda te, quando Wizz Air deve pagare e quando non deve niente, cosa si chiede su un volo cancellato e come si scrive il reclamo in ordine. In fondo c'è cosa fare se rispondono no o se non rispondono.",
    },

    { tipo: "h2", testo: "Il canale per le società di reclami esiste, e non è per te" },
    {
      tipo: "p",
      testo:
        "Wizz Air è un'eccezione fra le grandi compagnie europee. Invece di scoraggiare gli intermediari, ne ha fatto un canale a parte: un portale separato per claim company, avvocati e studi legali, con la possibilità di inviare le pratiche in blocco tramite API.",
    },
    {
      tipo: "p",
      testo:
        "Vale la pena capire a cosa serve, perché è facile leggerlo al contrario. Quel portale non è una corsia preferenziale che dà più soldi o risposte più rapide: è un canale tecnico per chi manda centinaia di pratiche insieme e ha bisogno di automatizzarle. Se le pratiche che hai sono una sola, il vantaggio è zero.",
    },
    {
      tipo: "p",
      testo:
        "La domanda vera è un'altra: quanto costa passare da lì. Un servizio a percentuale trattiene una quota del rimborso, e la trattiene solo se vinci. Sembra indolore proprio per questo. Ryanair, che sul tema ha una posizione opposta a quella di Wizz Air, scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro.",
    },
    {
      tipo: "nota",
      titolo: "Due compagnie diverse, la stessa raccomandazione",
      testo:
        "Non è un'idea nostra. ITA Airways, nella pagina sui diritti dei passeggeri, raccomanda di rivolgersi direttamente alla compagnia perché il servizio è gratuito, e avverte che le commissioni delle società di gestione reclami **non sono rimborsabili**. Tradotto: quella quota non te la restituisce nessuno, nemmeno se la pratica va a buon fine.",
    },

    { tipo: "h2", testo: "Quando Wizz Air deve pagare, e quando non deve niente" },
    {
      tipo: "p",
      testo:
        "Le regole non le decide la compagnia: sono quelle del Regolamento CE 261/2004, uguali per Wizz Air e per chiunque altro. Il primo numero che conta è la soglia: servono almeno **tre ore di ritardo all'arrivo**, misurate su quando le porte si aprono a destinazione, non sull'orario di partenza. Sotto le tre ore la compensazione (la somma fissa che la legge chiama compensazione pecuniaria) non spetta.",
    },
    {
      tipo: "p",
      testo:
        "Superata la soglia, l'importo dipende dalla distanza della tratta e da dove sono i due aeroporti.",
    },
    {
      tipo: "tabella",
      intestazioni: ["La tua tratta", "Quanto ti spetta"],
      righe: [
        ["Fino a 1.500 km", "**250 €**"],
        [
          "Oltre 1.500 km, ma partenza e arrivo **dentro** l'Unione Europea",
          "**400 €**, per quanto lunga sia la tratta",
        ],
        ["Fra 1.500 e 3.500 km, con uno scalo fuori dall'Unione", "**400 €**"],
        [
          "Oltre 3.500 km, con uno scalo fuori dall'Unione",
          "**600 €**, che scendono a **300 €** se il ritardo resta sotto le 4 ore",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "La seconda riga riguarda parecchie rotte di Wizz Air. Le tratte lunghe che restano dentro lo spazio europeo valgono 400 euro, non 600, per quanto chilometri facciano. Se un calcolatore ti promette 600 euro su una tratta del genere, sta gonfiando il numero. [Le tre fasce sono spiegate per intero qui](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },
    {
      tipo: "p",
      testo:
        "C'è poi una condizione che viene prima di tutto e che quasi nessuno controlla: il volo deve essere coperto dal Regolamento. Conta da dove decolla l'aereo. Se parti da un aeroporto europeo sei coperto sempre, con qualsiasi compagnia. Se parti da un paese fuori dall'Unione sei coperto solo se chi ha operato il volo ha una licenza europea, e Wizz Air ce l'ha. Un volo che parte fuori dall'Unione e arriva fuori dall'Unione, operato da una compagnia non europea, non è coperto per niente.",
    },

    {
      tipo: "check",
      titolo: "Il tuo volo Wizz Air supera la soglia? Guardiamo il dato vero",
      testo:
        "Non serve un account e non serve la carta. Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia. Se il caso non regge, te lo diciamo lo stesso e non paghi niente.",
    },

    { tipo: "h2", testo: "Volo cancellato: sono due richieste, non una" },
    {
      tipo: "p",
      testo:
        "Sul volo cancellato quasi tutti confondono due cose diverse, e Wizz Air non è tenuta a spiegartelo.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Il biglietto.** Se il volo è cancellato e scegli di non partire, il rimborso del biglietto **è dovuto**, ed è una cosa a sé: si chiede sempre, in qualunque caso.",
        "**La compensazione.** È la somma fissa della tabella qui sopra. Dipende dal preavviso con cui ti hanno avvisato e da quanto è distante dall'orario originale il volo alternativo che ti hanno proposto.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se accetti un buono invece del rimborso in denaro, la seconda richiesta resta comunque in piedi: la compensazione non è il prezzo del biglietto e non ne prende il posto. Attenzione, però, a cosa firmi al momento dell'accettazione: quello che c'è scritto nel modulo conta. Se sei ancora in aeroporto e la cancellazione è appena stata annunciata, [i primi sessanta minuti sono quelli che decidono la pratica](/tabellone/volo-cancellato-primi-60-minuti).",
    },
    {
      tipo: "p",
      testo:
        "Mentre aspetti, c'è anche l'assistenza, e non dipende dalle tre ore: sulle tratte fino a 1.500 km pasti, bevande e la possibilità di comunicare sono dovuti **già da 2 ore** di attesa. Se paghi di tasca tua perché al banco non c'è nessuno, tieni gli scontrini.",
    },
    {
      tipo: "nota",
      titolo: "Metti tutto per iscritto",
      testo:
        "Nel novembre 2025 l'AGCM ha sanzionato Wizz Air Hungary con 500.000 euro per la comunicazione dell'abbonamento All You Can Fly e per clausole vessatorie. Non riguarda i reclami del 261, ma dice una cosa utile: con questa compagnia le promesse verbali al banco non valgono niente. Vale solo quello che è scritto e datato, dentro il tuo account.",
    },

    { tipo: "h2", testo: "Quanto ti resta, a seconda di come lo chiedi" },
    {
      tipo: "p",
      testo:
        "La compensazione è la stessa in tutti i casi. Cambia quanto ne arriva a te.",
    },
    { tipo: "confronto", compensazione: 250 },
    {
      tipo: "p",
      testo:
        "Noi stiamo dalla parte opposta del portale a percentuale: **un prezzo fisso, scritto prima**, che non cresce con la cifra che recuperi, e una tariffa unica per tutta la famiglia. Il check per sapere se il caso regge è sempre gratuito. La lettera la mandi tu dalla tua email, con il tuo nome: Wizz Air paga te, direttamente, e la somma arriva intera. Se la compagnia rifiuta senza un motivo valido o non risponde nei termini di legge, la pratica te la rimborsiamo. [Il listino sta qui](/#prezzi).",
    },

    { tipo: "h2", testo: "Come si manda il reclamo, in ordine" },
    {
      tipo: "passi",
      voci: [
        "**Controlla il dato oggettivo del volo**, cioè l'orario di arrivo effettivo registrato. È l'unico numero che conta, e non è quello che ricordi tu.",
        "**Metti da parte le prove**: codice di prenotazione, carta d'imbarco, email della compagnia, foto del tabellone, scontrini delle spese.",
        "**Entra nel tuo account Wizz Air** e apri il modulo reclami. È il canale ufficiale della compagnia: usa quello, non i social e non il telefono.",
        "**Scrivi cosa chiedi, in cifre.** Numero del volo, data, tratta, quante ore di ritardo all'arrivo, l'importo che ti spetta secondo l'articolo 7 e, se il volo era cancellato, il rimborso del biglietto come richiesta separata.",
        "**Segna la data di invio** e controlla lo stato nell'account. Wizz Air dichiara di trattare le richieste entro 30 giorni.",
      ],
    },

    { tipo: "h2", testo: "Se rispondono no, o se non rispondono" },
    {
      tipo: "p",
      testo:
        "Il termine di legge è più largo di quello dichiarato dalla compagnia: l'ENAC indica **sei settimane** come tempo entro cui il vettore deve rispondere al reclamo. Solo dopo si passa allo scalino successivo, e prima è inutile bussare altrove.",
    },
    {
      tipo: "p",
      testo:
        "Lo scalino successivo è l'organismo nazionale, e qui si sbaglia spesso: non è automaticamente l'ENAC. Ci si rivolge all'organismo del **paese da cui sei partito**. Se il volo partiva da Budapest, da Bucarest o da Katowice, l'ufficio competente è quello di quel paese, non quello italiano. [Come funziona il passaggio, passo per passo](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
    },
    {
      tipo: "citazione",
      testo:
        "ITA Airways scrive che rivolgersi direttamente alla compagnia è gratuito, e che le commissioni delle società di gestione reclami non sono rimborsabili.",
      fonte: "ITA Airways, pagina sui diritti del passeggero (fonte 7 in fondo)",
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Conviene passare da una società di reclami per Wizz Air?",
          risposta:
            "Il portale per le società di reclami esiste, ma è un canale tecnico per chi manda pratiche in blocco: non paga di più e non risponde prima. Il modulo che compili tu nel tuo account è lo stesso, e quello che passa da un intermediario a percentuale ti arriva decurtato della sua quota.",
        },
        {
          domanda: "Wizz Air ha detto che era maltempo: chiudo qui?",
          risposta:
            "No, non è automatico. La circostanza eccezionale deve essere dimostrata dalla compagnia, e va dimostrato anche il legame con il tuo volo specifico. Una risposta generica sulle condizioni meteo di quel giorno non è una prova.",
        },
        {
          domanda: "Il volo è stato cancellato e mi hanno rimborsato il biglietto: è finita?",
          risposta:
            "Sono due richieste diverse. Il rimborso del biglietto è una cosa a sé. La compensazione dell'articolo 7 dipende dal preavviso e dal volo alternativo, e si chiede a parte.",
        },
        {
          domanda: "Sono passati 30 giorni e non ho risposta: cosa faccio?",
          risposta:
            "Aspetta il termine di legge, che l'ENAC indica in sei settimane, poi porta il caso all'organismo nazionale del paese da cui sei partito. I 30 giorni sono un impegno della compagnia, le sei settimane sono il riferimento su cui si misura il silenzio.",
        },
        {
          domanda: "Ho perso il codice di prenotazione: posso chiedere lo stesso?",
          risposta:
            "Sì, se hai un'altra prova di essere stato su quel volo: l'email di conferma, la carta d'imbarco, la ricevuta di pagamento. La prova del contratto è la prenotazione, non un documento in particolare.",
        },
        {
          domanda: "Il ritardo era di 2 ore e mezza: mi spetta qualcosa?",
          risposta:
            "La compensazione no, la soglia è di tre ore all'arrivo ed è secca. L'assistenza sì: su una tratta fino a 1.500 km pasti e bevande sono dovuti già da due ore di attesa, e le spese che hai anticipato si chiedono comunque.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "Wizz Air, tempi di trattazione dei reclami: 30 giorni e stato consultabile nell'account",
      url: "https://www.wizzair.com/en-gb/help-centre/my-wizz-account/claims-and-compensation/claim-processing-time-and-status",
    },
    {
      titolo:
        "Wizz Air, portale dedicato a società di reclami, avvocati e studi legali",
      url: "https://claim.wizzair.com/ClaimCompanies",
    },
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione e assistenza",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: cosa fare se la compagnia non risponde entro sei settimane",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: ci si rivolge all'organismo del paese di partenza",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
    {
      titolo:
        "AGCM, novembre 2025: sanzione di 500.000 euro a Wizz Air Hungary (All You Can Fly e clausole vessatorie)",
      url: "https://www.agcm.it/media/comunicati-stampa/2025/11/PS12922",
    },
    {
      titolo:
        "ITA Airways, diritti del passeggero: il reclamo diretto è gratuito e le commissioni degli intermediari non sono rimborsabili",
      url: "https://www.ita-airways.com/it/it/legal/passenger-rights",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
  ],
};
