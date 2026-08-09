import type { Articolo } from "../tipi";

/**
 * PILASTRO 2. È la guida di chi ha già scritto alla compagnia e si è
 * preso un no, o un silenzio. Da qui si scende ai pezzi sulle singole
 * compagnie e si risale al pilastro sulle fasce.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni
 * numero che compare nel testo deve poter tornare a una voce di `fonti`.
 * Se un numero non ha la sua fonte, il numero si toglie.
 */
export const ARTICOLO: Articolo = {
  slug: "compagnia-dice-no-cosa-puoi-fare",
  titolo: "La compagnia dice no: cosa puoi fare davvero",
  titoloSeo: "La compagnia dice no: cosa puoi fare davvero",
  descrizione:
    "Rifiuto o silenzio della compagnia: la scala completa dopo il reclamo. Tempi, reclamo gratuito all'ENAC, sanzioni e quanto costa davvero il giudice di pace.",
  estratto:
    "L'organismo nazionale sanziona la compagnia ma non ti manda i soldi. Ecco la scala vera, con il conto in euro del passo successivo.",
  data: "2026-08-09",
  tipo: "pilastro",
  tag: ["diritti", "rimborsi", "guida"],
  copertina: "busta-ufficiale",
  minuti: 8,
  inEvidenza: true,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "quanto-tempo-hai-per-chiedere-il-rimborso",
    "reclamo-ryanair-14-giorni",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Se la compagnia rifiuta o non risponde, restano due strade e si possono percorrere anche insieme: il reclamo all'organismo nazionale del paese da cui sei partito, che è gratuito e si fa da soli, e la causa davanti al giudice di pace, che per una richiesta fino a 1.100 euro costa 43 euro di contributo unificato.** La cosa che quasi nessuno scrive è la differenza fra le due: solo la seconda ti fa arrivare dei soldi.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi quando il no della compagnia è legittimo, quanto tempo devi aspettare prima di muoverti, come si presenta il reclamo all'ENAC e cosa produce davvero, e il conto in euro della causa. In fondo, cosa fare in ordine.",
    },

    { tipo: "h2", testo: "Prima di tutto: il no può essere giusto" },
    {
      tipo: "p",
      testo:
        "Vale la pena rileggere la risposta prima di arrabbiarsi, perché una parte dei rifiuti è corretta e insistere costa tempo per niente.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Il ritardo all'arrivo è rimasto sotto le tre ore.** È una soglia secca: sotto, la somma fissa non spetta. Restano l'assistenza e le spese che hai anticipato.",
        "**Il volo non rientra nel Regolamento.** Conta da dove decolla l'aereo: partenza da un aeroporto europeo, sei coperto con qualsiasi compagnia; partenza da un paese fuori dall'Unione, sei coperto solo se chi ha operato il volo ha licenza europea. Da paese terzo a paese terzo, mai.",
        "**La compagnia ha dimostrato una circostanza eccezionale** e il suo legame con il tuo volo specifico. Attenzione al verbo: deve dimostrarla, non dichiararla.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se non sei sicuro della fascia o della soglia, la guida completa è [qui: quando spettano 250, 400 o 600 euro](/tabellone/volo-in-ritardo-250-400-600-euro). Se invece il no arriva con una frase generica sul maltempo o su un guasto, siamo nel secondo caso.",
    },
    {
      tipo: "nota",
      titolo: "Chi deve provare cosa",
      testo:
        "Tu devi provare due cose sole: che avevi il biglietto e che il disservizio c'è stato. È il vettore a dover provare la circostanza eccezionale e il nesso con il tuo volo. La Cassazione lo ha ribadito con l'ordinanza n. 17644 del 2025. Una risposta che dice solo \"condizioni operative straordinarie\", senza documenti, non ha ancora provato niente.",
    },

    { tipo: "h2", testo: "L'ENAC apre un procedimento, non ti manda i soldi" },
    {
      tipo: "p",
      testo:
        "È il punto in cui si perde più tempo, e va detto per primo perché cambia tutta la strategia. In Italia l'organismo nazionale che vigila sul Regolamento è l'ENAC, e il Consiglio di Stato lo ha confermato in quel ruolo nell'aprile 2026. Ma il suo compito è la vigilanza, non il tuo portafoglio.",
    },
    {
      tipo: "citazione",
      testo:
        "L'attività dell'ENAC non è finalizzata a soddisfare le richieste risarcitorie del passeggero, né a fornire assistenza legale: dal reclamo nasce un procedimento sanzionatorio nei confronti della compagnia.",
      fonte: "ENAC, Carta dei diritti del passeggero (fonte 2 in fondo)",
    },
    {
      tipo: "p",
      testo:
        "Tradotto: se la compagnia ha sbagliato, l'ENAC può multarla. La multa la incassa lo Stato. La somma che spetta a te continua a doverla la compagnia, e se non la paga spontaneamente resta il giudice. Questo non rende il reclamo inutile, anzi: è gratuito, resta agli atti e una compagnia che riceve un procedimento aperto sul tuo caso ha un motivo in più per chiudere la partita. Ma non è la cassa.",
    },

    { tipo: "h2", testo: "Le sei settimane, e cosa fare mentre passano" },
    {
      tipo: "p",
      testo:
        "La compagnia deve rispondere al reclamo entro sei settimane. Prima di quel termine l'organismo nazionale non entra in gioco, quindi il reclamo scritto al vettore non è un passaggio saltabile: è il presupposto di tutto il resto.",
    },
    {
      tipo: "p",
      testo:
        "Alcune compagnie si danno per iscritto termini più stretti dei loro. Ryanair scrive nelle proprie condizioni un termine di risposta breve, ed è un dettaglio che si può citare nel sollecito: [ne abbiamo scritto qui](/tabellone/reclamo-ryanair-14-giorni). In ogni caso il silenzio non ti toglie niente, ti fa solo aspettare.",
    },
    {
      tipo: "p",
      testo: "Mentre aspetti, prepara il fascicolo. Servirà identico in tutti i passaggi successivi.",
    },
    {
      tipo: "elenco",
      voci: [
        "La **prenotazione** con il codice, che è la prova del contratto, e la carta d'imbarco se ce l'hai ancora.",
        "Il **testo del reclamo** che hai mandato, con data e canale usato.",
        "La **risposta della compagnia**, anche se è una riga sola: il no scritto vale più di un no al telefono.",
        "Gli **scontrini** delle spese che hai anticipato, che si chiedono a parte e si chiedono comunque.",
      ],
    },

    {
      tipo: "check",
      titolo: "Prima di litigare, verifica il dato oggettivo",
      testo:
        "Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia. Se il caso non regge, te lo diciamo lo stesso e non paghi niente. Se regge, hai un numero da mettere nella risposta al no.",
    },

    { tipo: "h2", testo: "Il reclamo all'ENAC: gratis, online, entro due anni" },
    {
      tipo: "p",
      testo:
        "Passate le sei settimane senza risposta, oppure con una risposta che non rispetta il Regolamento, si può presentare il reclamo all'organismo nazionale. Va detto subito che ci si rivolge all'organismo del **paese di partenza**, non automaticamente all'ENAC: se sei decollato da Barcellona o da Monaco, l'ufficio competente è quello spagnolo o quello tedesco.",
    },
    {
      tipo: "passi",
      voci: [
        "**Registrati** all'applicativo ENAC \"Tutela dei diritti del passeggero\". È l'unica via: email, PEC e carta non valgono.",
        "**Compila il modulo online** con i dati del volo e allega prenotazione, reclamo inviato ed eventuale risposta.",
        "**Fallo entro due anni** dalla data del volo. È il termine per il reclamo all'ENAC.",
        "**Un reclamo solo per tutto il gruppo**: se il disservizio riguarda più persone dello stesso nucleo familiare o gruppo, non serve moltiplicare le pratiche.",
      ],
    },
    {
      tipo: "nota",
      titolo: "Non serve nessuno che ti rappresenti",
      testo:
        "L'ENAC scrive che il reclamo è gratuito, diretto e personale: non occorre farsi rappresentare da associazioni, avvocati o claim agency. Se qualcuno ti propone di gestirlo in cambio di una percentuale, ti sta vendendo un passaggio che puoi fare da solo in pochi minuti.",
    },

    { tipo: "h2", testo: "A cosa serve davvero l'ENAC: le sanzioni" },
    {
      tipo: "p",
      testo:
        "Il procedimento sanzionatorio non ti paga, ma non è aria fritta: gli importi previsti dal D.Lgs. 69/2006 sono di un altro ordine di grandezza rispetto alla somma che stai chiedendo.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Cosa ha fatto la compagnia", "Quanto rischia"],
      righe: [
        [
          "Negato imbarco o cancellazione senza pagare la compensazione dovuta",
          "**da 10.000 a 50.000 €**",
        ],
        [
          "Violazione degli obblighi di informazione al passeggero",
          "**da 2.500 a 10.000 €**",
        ],
        [
          "Tetto massimo per singola violazione riferita a ogni volo",
          "**50.000 €**",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "È il motivo per cui vale la pena presentarlo anche quando hai già deciso di andare dal giudice: costa zero, e sposta il conto economico dalla parte della compagnia.",
    },

    { tipo: "h2", testo: "Il giudice di pace: il conto in euro" },
    {
      tipo: "p",
      testo:
        "Questa è la strada che produce un titolo per farti pagare. Ed è più leggera di quanto sembri, perché una compensazione da 250, 400 o 600 euro sta comodamente nella fascia più bassa delle spese di giustizia.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Voce", "Quanto"],
      righe: [
        ["Contributo unificato per cause fino a 1.100 €", "**43 €**"],
        ["Marca da bollo per cause sotto 1.033 €", "**non dovuta**"],
        [
          "Dove si fa causa",
          "a tua scelta: **luogo di partenza** o **luogo di arrivo** del volo",
        ],
        [
          "Tentativo di conciliazione obbligatorio prima del giudice",
          "**non più richiesto** per la sola compensazione forfettaria",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "L'ultima riga è recente e conta parecchio. Il TAR Piemonte, con la sentenza n. 1093 del 4 novembre 2024, ha annullato l'obbligo di tentare la conciliazione prima di rivolgersi al giudice per la compensazione forfettaria, perché quel diritto è indisponibile. La conciliazione resta invece necessaria per le domande che vanno oltre l'importo predeterminato, cioè quelle dell'articolo 12: il danno ulteriore, le spese, i disagi documentati.",
    },
    {
      tipo: "p",
      testo:
        "Sul danno ulteriore conviene essere realisti. Il giudice di pace di Venezia, il 23 giugno 2026, ha accolto la compensazione per una cancellazione e per un forte ritardo, ma ha respinto la domanda in più per mancata assistenza e informazione. La somma fissa è la parte solida; tutto il resto va provato pezzo per pezzo. Sui tempi non ti diamo un numero perché non ne esiste uno onesto: cambiano molto da tribunale a tribunale.",
    },

    { tipo: "h3", testo: "Se sei partito da un altro paese europeo" },
    {
      tipo: "p",
      testo:
        "Esiste una corsia pensata apposta per questi importi: il procedimento europeo per le controversie di modesta entità, istituito dal Regolamento CE 861/2007. Copre le cause fino a 5.000 euro, si avvia compilando il modulo A, non c'è obbligo di avvocato e di norma si decide senza udienza, sui documenti. Per una compensazione contro una compagnia con sede in un altro Stato membro è spesso la via più corta.",
    },

    { tipo: "h2", testo: "Farlo da solo, o darlo a qualcuno" },
    {
      tipo: "p",
      testo:
        "A questo punto la domanda vera è una sola: quanto ti resta in mano. La somma che la compagnia deve è la stessa in tutti i casi; cambia chi se ne prende un pezzo. I servizi a percentuale trattengono una quota del rimborso, e la trattengono solo se vinci: sembra indolore proprio per quello.",
    },
    {
      tipo: "citazione",
      testo:
        "Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a fare la richiesta da soli.",
      fonte:
        "Ryanair, pagina ufficiale sulle Claims Management Companies (fonte 16 in fondo)",
    },
    { tipo: "confronto", compensazione: 400 },
    {
      tipo: "p",
      testo:
        "Noi stiamo dall'altra parte: **un prezzo fisso, scritto prima**, che non cambia con la cifra che recuperi, e una tariffa unica per tutta la famiglia. Il check è gratuito e la lettera la mandi tu, dalla tua email: la compagnia paga te, direttamente, e la somma arriva intera. Se rifiuta senza un motivo valido o non risponde nei termini di legge, il prezzo della pratica te lo rendiamo. [Il listino sta qui](/#prezzi).",
    },
    {
      tipo: "p",
      testo:
        "Un'ultima cosa sui tempi: mentre segui i passaggi, il termine per chiedere non si ferma. [Quanto tempo hai davvero](/tabellone/quanto-tempo-hai-per-chiedere-il-rimborso) è una questione a parte, e conviene guardarla prima di lasciar passare mesi.",
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "La compagnia non risponde: dopo quanto posso muovermi?",
          risposta:
            "Dopo sei settimane dal reclamo. È il termine entro cui la compagnia deve rispondere secondo l'ENAC. Passato quello, il silenzio vale come mancata risposta e si può presentare il reclamo all'organismo nazionale.",
        },
        {
          domanda: "Se faccio reclamo all'ENAC, mi arrivano i soldi?",
          risposta:
            "No. L'ENAC apre un procedimento sanzionatorio contro la compagnia e l'eventuale multa va allo Stato. La somma che spetta a te continua a doverla la compagnia: per farla pagare serve il giudice. Il reclamo resta comunque utile, è gratuito e mette pressione.",
        },
        {
          domanda: "Sono partito da Madrid: scrivo all'ENAC lo stesso?",
          risposta:
            "No, ci si rivolge all'organismo nazionale del paese di partenza, quindi in quel caso a quello spagnolo. L'ENAC è competente per le partenze dall'Italia.",
        },
        {
          domanda: "Devo per forza tentare una conciliazione prima della causa?",
          risposta:
            "Per la sola compensazione forfettaria no: il TAR Piemonte, con la sentenza n. 1093 del 4 novembre 2024, ha annullato quell'obbligo. Resta necessaria per le domande che vanno oltre l'importo predeterminato, quelle dell'articolo 12.",
        },
        {
          domanda: "Serve un avvocato per andare dal giudice di pace?",
          risposta:
            "Per queste cifre non è obbligatorio, e non lo è nemmeno nel procedimento europeo per le controversie di modesta entità, che copre le cause fino a 5.000 euro. Il contributo unificato per una causa fino a 1.100 euro è di 43 euro e sotto 1.033 euro non si paga la marca.",
        },
        {
          domanda: "Eravamo in quattro sullo stesso volo: quattro reclami?",
          risposta:
            "All'ENAC no: se il disservizio riguarda più persone dello stesso nucleo familiare o gruppo, basta un solo reclamo. La somma però resta dovuta a ciascun passeggero.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione, soglie e assistenza",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti: se la compagnia non ha risposto o ha risposto in modo non conforme (sei settimane, procedimento sanzionatorio, nessuna assistenza legale)",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti: ci si rivolge all'organismo nazionale del paese di partenza",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
    {
      titolo:
        "ENAC, Modalità di reclamo: gratuito, diretto e personale, entro due anni dal volo, un solo reclamo per nucleo o gruppo",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/modalita-di-reclamo-per-negato-imbarco-cancellazione-ritardo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti: il reclamo si presenta solo dal modulo online, previa registrazione all'applicativo",
      url: "https://carta-diritti.enac.gov.it/it/faq/in-che-modo-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo: "D.Lgs. 69/2006: le sanzioni applicabili alle compagnie aeree",
      url: "https://www.enac.gov.it/sites/default/files/allegati/2019-Gen/dlgs_69_2006.pdf",
    },
    {
      titolo:
        "ENAC, precisazioni sulle sanzioni applicabili alle compagnie aeree per violazioni del Reg. CE 261/2004",
      url: "https://comunicati.enac.gov.it/it/announcement/show/precisazioni-sulle-sanzioni-applicabili-dallenac-alle-compagnie-aeree-in-caso-di-violazioni-del-regolamento-ce-n-2612004",
    },
    {
      titolo:
        "TAR Piemonte, sentenza n. 1093 del 4 novembre 2024: annullato l'obbligo di conciliazione per la compensazione forfettaria",
      url: "https://www.misterlex.it/tar/piemonte/torino/2024/1093/",
    },
    {
      titolo:
        "Studio Mordiglia: la conciliazione resta necessaria per le domande oltre l'importo predeterminato (art. 12)",
      url: "https://www.mordiglia.it/it/news/illegittimo-lobbligo-di-conciliazione-per-i-reclami-dei-passeggeri-aerei/",
    },
    {
      titolo:
        "Contributo unificato davanti al giudice di pace: 43 euro fino a 1.100 euro, nessuna marca sotto 1.033 euro",
      url: "https://www.studiocataldi.it/articoli/36166-contributo-unificato-giudice-di-pace.asp",
    },
    {
      titolo:
        "Altalex: il foro competente è a scelta del passeggero, luogo di partenza o di arrivo del volo",
      url: "https://www.altalex.com/documents/news/2019/12/06/volo-cancellato-competente-giudice-luogo-partenza-o-arrivo",
    },
    {
      titolo:
        "ECC-Net Italia, procedimento europeo per le controversie di modesta entità (Reg. CE 861/2007): fino a 5.000 euro, modulo A, senza obbligo di avvocato",
      url: "https://ecc-netitalia.it/it/procedimento-europeo-per-le-controversie-di-modesta-entita/",
    },
    {
      titolo:
        "ENAC, aprile 2026: il Consiglio di Stato conferma il ruolo di ENAC come organismo nazionale per il Reg. 261",
      url: "https://comunicati.enac.gov.it/it/announcement/show/enac-ii-consiglio-di-stato-rigetta-la-procedura-di-gestione-reclami-art-e-conferma-il-ruolo-di-enac-nella-tutela-dei-passeggeri-del-trasporto-aereo",
    },
    {
      titolo:
        "Cassazione, ordinanza n. 17644/2025: l'onere della prova della circostanza eccezionale è del vettore",
      url: "https://www.studiolegalebianucci.it/it/blog/4451-ritardo-aereo-e-risarcimento-la-cassazione-chiarisce-l-onere-della-prova-ordinanza-n-17644-2025",
    },
    {
      titolo:
        "Giudice di pace di Venezia, 23 giugno 2026: compensazione accolta, domanda ulteriore di danni respinta",
      url: "https://www.altalex.com/documents/2026/08/07/volo-ritardo-cancellato-pronuncia-giudice-pace-venezia",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
  ],
};
