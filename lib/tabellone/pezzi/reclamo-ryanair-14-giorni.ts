import type { Articolo } from "../tipi";

import { PREZZO_LANCIO, seSiPaga } from "@/lib/check/ingresso";
import { euro } from "@/lib/prezzi";
/**
 * ARTICOLO DI COMPAGNIA. L'angolo è tutto qui: le condizioni di trasporto
 * di Ryanair chiedono al passeggero di reclamare DA SOLO e di concedere
 * 14 giorni prima di incaricare un terzo. È la compagnia stessa a
 * descrivere il modello che noi vendiamo a prezzo fisso.
 *
 * Regola di scrittura (vale per tutti i pezzi): ogni numero che compare
 * nel testo deve poter tornare a una voce di `fonti`. Se un numero non ha
 * la sua fonte, il numero si toglie.
 */
export const ARTICOLO: Articolo = {
  slug: "reclamo-ryanair-14-giorni",
  titolo: "Reclamo Ryanair: i 14 giorni che quasi nessuno conosce",
  titoloSeo: "Reclamo Ryanair: i 14 giorni che quasi nessuno sa",
  descrizione:
    "Le condizioni di trasporto di Ryanair chiedono al passeggero di reclamare da solo e di lasciare 14 giorni prima di incaricare un terzo. Cosa cambia per te.",
  estratto:
    "Ryanair scrive nelle proprie condizioni che il reclamo lo mandi tu e che vanno concessi 14 giorni prima di affidarlo a un terzo. È la regola che decide come conviene muoversi.",
  data: "2026-08-09",
  tipo: "compagnia",
  tag: ["compagnie", "ritardo", "rimborsi"],
  copertina: "modulo-respinto",
  foto: "/assets/tabellone/reclamo-ryanair.webp",
  minuti: 7,
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
        "**Il reclamo a Ryanair si manda dal suo portale EU261, con il tuo nome, e le condizioni di trasporto della compagnia chiedono di lasciarle 14 giorni prima di affidare la pratica a un terzo.** Non è una voce di corridoio e non è una nostra interpretazione: sta scritta all'articolo 15.2.2 delle condizioni generali di trasporto, quelle che hai accettato comprando il biglietto. Chi ti propone di firmare subito una delega e lasciar fare, sta partendo da una regola che la compagnia ha scritto al contrario.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi cosa dice esattamente quella clausola, cosa succede se non viene rispettata, quando la somma spetta davvero e quando non spetta niente, e come si manda il reclamo passo per passo.",
    },

    { tipo: "h2", testo: "Cosa dice l'articolo 15.2.2, in italiano" },
    {
      tipo: "p",
      testo:
        "La clausola chiede due cose al passeggero, in quest'ordine: presentare il reclamo **direttamente** alla compagnia, e concederle **14 giorni** per rispondere prima di incaricare qualcun altro di agire al posto suo.",
    },
    {
      tipo: "p",
      testo:
        "La stessa compagnia dichiara, sulla propria pagina dedicata ai diritti EU261, di puntare a lavorare i reclami entro 10 giorni. I due numeri stanno insieme: la finestra dei 14 giorni è più larga del tempo che Ryanair si dà per rispondere.",
    },
    {
      tipo: "nota",
      titolo: "E se qualcuno reclama al posto tuo senza aspettare?",
      testo:
        "Ryanair scrive che, quando l'articolo 15.2.2 non è stato rispettato, tratta il reclamo presentato da un terzo solo se contiene i tuoi recapiti e i tuoi dati di pagamento, e in quel caso paga **direttamente te**. Tradotto: la somma arriva sul tuo conto, non su quello dell'intermediario. Che poi ti chiederà comunque la sua quota.",
    },
    {
      tipo: "p",
      testo:
        "Questa è la ragione pratica per cui, con Ryanair, il fai da te non è la scelta coraggiosa: è la strada che la compagnia ha descritto da sé. Il lavoro vero non è avere qualcuno che firma al posto tuo, è sapere se il caso regge e scrivere la lettera giusta.",
    },

    { tipo: "h2", testo: "Prima domanda: il caso regge?" },
    {
      tipo: "p",
      testo:
        "La somma fissa che la compagnia deve (la compensazione pecuniaria) scatta da **tre ore di ritardo all'arrivo**, non alla partenza. Sotto quella soglia non spetta niente, e non c'è clausola Ryanair che cambi la cosa: la soglia è del Regolamento CE 261/2004, uguale per tutte le compagnie.",
    },
    {
      tipo: "p",
      testo:
        "L'importo dipende dalla distanza della tratta e da dove sono i due aeroporti.",
    },
    {
      tipo: "tabella",
      intestazioni: ["La tua tratta", "Quanto ti spetta"],
      righe: [
        ["Fino a 1.500 km", "**250 €**"],
        [
          "Oltre 1.500 km, con partenza e arrivo **dentro** l'Unione Europea",
          "**400 €**, per quanto sia lunga",
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
        "Sulla rete Ryanair la gran parte dei voli sta nelle prime due righe. Le tratte fino a 1.500 km valgono 250 euro, e le europee più lunghe restano a 400 anche quando il volo dura quattro ore. [Qui c'è la guida completa alle tre fasce](/tabellone/volo-in-ritardo-250-400-600-euro), con l'eccezione europea spiegata per intero.",
    },
    {
      tipo: "p",
      testo:
        "Conta anche da dove decolla l'aereo. Se parti da un aeroporto dell'Unione o dello Spazio economico europeo sei coperto sempre, con qualsiasi compagnia. Se parti da un paese fuori, sei coperto solo se chi ha operato il volo ha licenza europea: Ryanair ce l'ha, quindi anche un volo di ritorno da fuori resta dentro il Regolamento.",
    },

    {
      tipo: "check",
      titolo: "Il tuo volo Ryanair regge? Guarda il dato vero",
      testo:
        seSiPaga(
          `Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia. ${euro(PREZZO_LANCIO)}, senza account. Se il verdetto esce incerto, l'analisi non si consuma.`,
          "Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia. Gratis, senza account e senza carta. Se il caso non regge te lo diciamo e non paghi niente.",
        ),
    },

    { tipo: "h2", testo: "Quando Ryanair non ti deve la somma" },
    {
      tipo: "p",
      testo:
        "Lo scriviamo per esteso, perché è la parte che i servizi a percentuale saltano volentieri: a loro conviene che tu apra la pratica comunque.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Il ritardo all'arrivo è sotto le 3 ore.** Anche due ore e cinquantanove minuti sono un no. È una soglia secca.",
        "**La compagnia dimostra una circostanza eccezionale.** Deve dimostrarla lei, e deve dimostrare il legame con il tuo volo. Dire che quel giorno c'era maltempo non basta.",
        "**Il volo non è coperto**: parte da un paese fuori dall'Unione ed è stato operato da un vettore senza licenza europea. Con Ryanair è un caso raro, ma esiste quando il biglietto è di un'altra compagnia.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Anche quando la somma fissa non spetta, resta l'assistenza: sulle tratte fino a 1.500 km pasti, bevande e la possibilità di comunicare sono dovuti già da **due ore** di attesa. E se il volo è stato cancellato, il rimborso del biglietto va pagato entro **sette giorni**. Sono due cose diverse dalla compensazione e si chiedono a parte.",
    },

    { tipo: "h2", testo: "Quanto ti resta, secondo Ryanair stessa" },
    {
      tipo: "p",
      testo:
        "Su questo punto non serve la nostra opinione, bastano le parole della compagnia. Ryanair ha una pagina ufficiale dedicata alle società di gestione dei reclami, e non è tenera.",
    },
    {
      tipo: "citazione",
      testo:
        "Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a presentare la richiesta da soli.",
      fonte: "Ryanair, pagina ufficiale sulle Claims Management Companies (fonte 4)",
    },
    {
      tipo: "p",
      testo:
        "I portali a percentuale trattengono una quota del rimborso, e la trattengono solo se vinci: sembra indolore proprio per questo. Su un volo Ryanair da 250 euro di compensazione, però, quella quota pesa più che altrove, perché la somma di partenza è la più bassa delle tre.",
    },
    { tipo: "confronto", compensazione: 250 },
    {
      tipo: "p",
      testo:
        seSiPaga(
          `Noi facciamo il contrario: **un prezzo fisso, scritto prima di sapere l'esito**, che non cambia con la cifra che recuperi, e l'analisi per capire se il caso regge costa ${euro(PREZZO_LANCIO)} che si scalano dalla pratica. La lettera la mandi tu, dalla tua email, con il tuo nome: esattamente come Ryanair chiede all'articolo 15.2.2. La compagnia paga te, e la somma arriva intera. [Il listino sta qui](/#prezzi).`,
          "Noi facciamo il contrario: **un prezzo fisso, scritto prima di sapere l'esito**, che non cambia con la cifra che recuperi, e il check per capire se il caso regge è sempre gratuito. La lettera la mandi tu, dalla tua email, con il tuo nome: esattamente come Ryanair chiede all'articolo 15.2.2. La compagnia paga te, e la somma arriva intera. [Il listino sta qui](/#prezzi).",
        ),
    },

    { tipo: "h2", testo: "Come si manda il reclamo, in ordine" },
    {
      tipo: "passi",
      voci: [
        "**Controlla il dato oggettivo**, cioè l'orario di arrivo effettivo registrato del tuo volo. È l'unico numero che conta, e quasi mai coincide con quello che ricordi.",
        "**Metti da parte le prove**: codice di prenotazione, carta d'imbarco, email di Ryanair sul disservizio, foto del tabellone, scontrini delle spese fatte di tasca tua.",
        "**Apri il portale EU261 di Ryanair** all'indirizzo [eu261claims.ryanair.com](https://eu261claims.ryanair.com/) e presenta il reclamo a tuo nome, con il codice di prenotazione.",
        "**Scrivi cosa chiedi, in modo esplicito**: l'articolo del Regolamento, l'importo della fascia, il numero del volo e la data. Un reclamo generico si presta a una risposta generica.",
        "**Lascia passare i 14 giorni** previsti dalle condizioni prima di coinvolgere chiunque altro. È la finestra che la compagnia si è data, e Ryanair dichiara di puntare a rispondere in 10 giorni.",
        "**Se la risposta non arriva o è un no senza motivo**, si sale di livello: l'ENAC indica sei settimane come tempo entro cui la compagnia deve rispondere, e solo dopo si passa all'organismo nazionale.",
      ],
    },

    { tipo: "h2", testo: "Se dicono no, o non rispondono" },
    {
      tipo: "p",
      testo:
        "Un no non chiude la partita, e va letto: se la compagnia parla di circostanza eccezionale deve dire quale, e deve legarla al tuo volo. Se la risposta non arriva affatto, il passo successivo è l'organismo nazionale competente, che è quello del **paese da cui sei partito**, non automaticamente l'ENAC. Un Barcellona-Bergamo si porta all'ente spagnolo, anche se la compagnia è irlandese e tu sei italiano.",
    },
    {
      tipo: "p",
      testo:
        "Abbiamo scritto una guida a parte su cosa fare esattamente dopo un rifiuto: [la compagnia dice no, cosa puoi fare davvero](/tabellone/compagnia-dice-no-cosa-puoi-fare). E se il volo non è di ieri, conviene guardare prima [quanto tempo hai per chiedere](/tabellone/quanto-tempo-hai-per-chiedere-il-rimborso).",
    },

    { tipo: "h2", testo: "Una notizia che gira e non c'entra con i rimborsi" },
    {
      tipo: "p",
      testo:
        "Nel dicembre 2025 l'AGCM ha sanzionato Ryanair DAC, in solido con la sua controllante, per 255.761.692 euro per abuso di posizione dominante. Il provvedimento riguarda la concorrenza nella vendita dei biglietti, cioè il rapporto con le agenzie di viaggio online: **non riguarda i rimborsi ai passeggeri** e non cambia di una virgola il tuo reclamo EU261. Lo scriviamo perché quel numero circola associato ai rimborsi, e non è quello che è.",
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Devo per forza aspettare 14 giorni prima di muovermi?",
          risposta:
            "I 14 giorni sono il tempo che le condizioni di Ryanair chiedono di concedere prima di incaricare un terzo di agire per te. Se il reclamo lo mandi tu, come chiede la compagnia, non stai aspettando nulla: lo hai già presentato al primo giorno.",
        },
        {
          domanda: "Ho già firmato con un portale a percentuale: posso tornare indietro?",
          risposta:
            "Dipende da cosa hai firmato e dai suoi termini, quindi la risposta sta nel contratto che hai accettato. Quello che si sa è che, se l'articolo 15.2.2 non è stato rispettato, Ryanair tratta il reclamo del terzo solo con i tuoi recapiti e i tuoi dati di pagamento, e paga direttamente te.",
        },
        {
          domanda: "Il volo ha ritardato di due ore e mezza: chiedo lo stesso?",
          risposta:
            "La somma fissa no, serve almeno tre ore all'arrivo. L'assistenza sì: su una tratta fino a 1.500 km pasti e bevande sono dovuti già da due ore di attesa, e le spese fatte di tasca tua si chiedono comunque, con gli scontrini.",
        },
        {
          domanda: "Ryanair mi ha risposto offrendo un voucher: devo accettarlo?",
          risposta:
            "La compensazione dell'articolo 7 è una somma di denaro. Un voucher si accetta solo se lo vuoi tu, per iscritto: non è la stessa cosa e non è un obbligo. Se preferisci i soldi, rispondi chiedendo il pagamento nella forma prevista dal Regolamento.",
        },
        {
          domanda: "Ryanair non risponde da settimane: a chi mi rivolgo?",
          risposta:
            "L'ENAC indica sei settimane come tempo entro cui la compagnia deve rispondere al reclamo. Passate quelle, ci si rivolge all'organismo nazionale del paese di partenza del volo. Nella nostra lettera l'ente giusto è già indicato con il suo sito.",
        },
        {
          domanda: "Serve un avvocato per un reclamo Ryanair?",
          risposta:
            "Per il primo passaggio no: il reclamo si presenta dal portale EU261 della compagnia, ed è il passaggio che le condizioni chiedono di fare al passeggero. L'avvocato è una scelta che ha senso più avanti, se la strada dell'organismo nazionale non porta a niente.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "Ryanair, Condizioni generali di trasporto, art. 15.2.2: reclamo diretto del passeggero e 14 giorni prima di incaricare un terzo",
      url: "https://www.ryanair.com/it/it/info-utili/Centro-assistenza/termini-e-condizioni/termsandconditionsar_366567793",
    },
    {
      titolo:
        "Ryanair, General Conditions of Carriage: come vengono trattati i reclami presentati da terzi e pagamento diretto al passeggero",
      url: "https://www.ryanair.com/ie/en/useful-info/help-centre/terms-and-conditions/termsandconditionsar_197583062",
    },
    {
      titolo:
        "Ryanair, EU 261 Passenger Rights: l'obiettivo dichiarato di lavorare i reclami entro 10 giorni",
      url: "https://help.ryanair.com/hc/en-us/articles/360017825538-EU-261-Passenger-Rights",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di gestione reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
    {
      titolo: "Ryanair, portale ufficiale per i reclami EU261",
      url: "https://eu261claims.ryanair.com/",
    },
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione, soglia delle 3 ore, assistenza e rimborso del biglietto entro 7 giorni",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: cosa fare se la compagnia non risponde entro sei settimane",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: a quale organismo nazionale rivolgersi",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
    {
      titolo:
        "AGCM, dicembre 2025: sanzione a Ryanair DAC per abuso di posizione dominante nella vendita dei biglietti",
      url: "https://www.agcm.it/media/comunicati-stampa/2025/12/A568-",
    },
  ],
};
