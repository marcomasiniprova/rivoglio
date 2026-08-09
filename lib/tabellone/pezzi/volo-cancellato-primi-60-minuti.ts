import type { Articolo } from "../tipi";

/**
 * EMERGENZA. Si legge in piedi, davanti a un banco, con il 20% di
 * batteria. Quindi: risposta nella prima riga, liste corte, niente
 * premesse, e il punto sul voucher prima di ogni spiegazione lunga.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni
 * numero che compare nel testo deve poter tornare a una voce di `fonti`.
 * Se un numero non ha la sua fonte, il numero si toglie.
 */
export const ARTICOLO: Articolo = {
  slug: "volo-cancellato-primi-60-minuti",
  titolo: "Volo cancellato adesso: i primi 60 minuti",
  titoloSeo: "Volo cancellato adesso: i primi 60 minuti",
  descrizione:
    "Cosa fare nell'ora in cui sei ancora in aeroporto: le prove da salvare, la scelta fra rimborso e volo alternativo, e perché il voucher va rifiutato.",
  estratto:
    "Le prove si raccolgono adesso, non domani da casa. E prima di firmare qualsiasi cosa al banco, leggi il punto sul voucher.",
  data: "2026-08-09",
  tipo: "emergenza",
  tag: ["cancellazione", "emergenza", "rimborsi"],
  copertina: "gate-telefono",
  minuti: 7,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "sciopero-aerei-cosa-fare-in-aeroporto",
    "compagnia-dice-no-cosa-puoi-fare",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Fotografa adesso il tabellone con il tuo volo e la scritta di cancellazione, prima che la riga sparisca.** È la prova che fra due mesi non potrai più recuperare, e ti costa dieci secondi. Poi vai al banco della compagnia e chiedi due cose: perché il volo è stato cancellato e quali alternative ti offrono. Non firmare niente e non accettare voucher finché non hai letto il punto sui soldi qui sotto.",
    },
    {
      tipo: "p",
      testo:
        "Questa pagina è scritta per essere letta in piedi, in aeroporto, mentre la fila non si muove. Prima le cose da fare nei prossimi sessanta minuti, poi cosa ti spetta e cosa no.",
    },

    { tipo: "h2", testo: "I primi 60 minuti, in ordine" },
    {
      tipo: "passi",
      voci: [
        "**Foto del tabellone** con numero di volo, orario e stato. Se il tabellone non lo mostra più, va bene una foto della schermata dell'app della compagnia o dell'SMS che ti hanno mandato.",
        "**Salva il messaggio che ti avvisa**, con l'ora esatta. Email o SMS: non cancellarlo, non archiviarlo. Sui voli cancellati è il documento che vale di più, e più avanti spieghiamo perché.",
        "**Vai al banco e chiedi l'alternativa**, senza accettarla subito. Chiedi anche il motivo della cancellazione e, se puoi, fattelo scrivere.",
        "**Chiedi l'assistenza**: acqua, qualcosa da mangiare, e l'albergo se l'attesa passa la notte. Non è un favore ed è dovuta anche quando i soldi della compensazione non spettano.",
        "**Se paghi di tasca tua, conserva gli scontrini.** Taxi, panino, hotel, biglietto del treno preso per arrivare comunque: sono spese che si chiedono a parte.",
        "**Non firmare rinunce e non accettare voucher** finché non hai deciso fra rimborso e volo alternativo.",
      ],
    },

    { tipo: "h2", testo: "Le prove da salvare prima di uscire dall'aeroporto" },
    {
      tipo: "p",
      testo:
        "Da casa, domani, metà di queste cose non esiste più. Il tabellone è cambiato, il banco è chiuso, il personale non si ricorda di te. Cinque minuti adesso valgono un'ora di ricerche fra due mesi.",
    },
    {
      tipo: "elenco",
      voci: [
        "**La carta d'imbarco**, anche se il volo non è partito. Se è digitale, fai uno screenshot: le app scadono e cancellano i voli passati.",
        "**L'email di prenotazione** con il codice: è la prova che avevi il contratto di trasporto.",
        "**Il messaggio di cancellazione con la data e l'ora di invio.** Serve a stabilire con quanto preavviso ti hanno avvisato.",
        "**Una foto del banco o della coda**, se ti hanno lasciato senza assistenza per ore.",
        "**Il nome del volo alternativo che ti hanno dato**, con l'orario di arrivo previsto a destinazione. Non l'orario di partenza: quello di arrivo.",
        "**Gli scontrini** di tutto quello che hai speso per colpa della cancellazione.",
      ],
    },
    {
      tipo: "nota",
      titolo: "Il voucher non è una delle strade previste",
      testo:
        "Se al banco ti offrono un buono per un volo futuro come unica soluzione, stanno saltando le opzioni che la legge ti mette davanti. L'Autorità garante della concorrenza e del mercato ha sanzionato easyJet per 2.800.000 euro, nel procedimento PS11830, proprio perché il voucher veniva proposto come unica alternativa senza indicare il rimborso. Un voucher lo accetti solo se sei tu a volerlo, e sapendo che rinunci ai soldi.",
    },

    { tipo: "h2", testo: "Rimborso o volo alternativo: la scelta è tua" },
    {
      tipo: "p",
      testo:
        "Quando un volo viene cancellato, la compagnia deve metterti davanti tre strade e lasciarti scegliere. Non le sceglie lei al posto tuo.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Se scegli", "Cosa deve fare la compagnia", "Quando conviene"],
      righe: [
        [
          "**Il rimborso del biglietto**",
          "Ti restituisce il prezzo pagato entro 7 giorni dalla richiesta. Se il viaggio non ha più senso, il rimborso copre anche le tratte già fatte e la compagnia ti riporta al punto di partenza col primo volo utile.",
          "Rinunci al viaggio, o ti muovi da solo",
        ],
        [
          "**Il volo alternativo appena possibile**",
          "Ti rimette su un altro volo verso la stessa destinazione, il prima possibile e senza costi in più.",
          "Devi arrivare comunque, e in fretta",
        ],
        [
          "**Il volo alternativo a una data che scegli tu**",
          "Stessa destinazione, quando ti serve, se ci sono posti liberi.",
          "Puoi rimandare la partenza",
        ],
        [
          "Un voucher",
          "Non è una delle tre strade. Vale solo se lo accetti tu, in cambio della rinuncia al rimborso in denaro.",
          "Quasi mai",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "Se hai comprato il biglietto su un sito di viaggi e ti hanno fatto pagare una commissione di servizio, quella commissione entra nel rimborso. Lo ha stabilito la Corte di giustizia dell'Unione Europea il 15 gennaio 2026, nella causa C-45/24. È una voce che quasi nessuno chiede, e che quasi nessuno ti offre da solo.",
    },

    {
      tipo: "check",
      titolo: "Il tuo volo cancellato vale una compensazione? Guardalo adesso",
      testo:
        "Il check è gratuito e non serve un account. Sui voli cancellati ti facciamo due domande, perché le risposte non stanno in nessun archivio. Se il caso non regge te lo diciamo e non paghi niente.",
    },

    { tipo: "h2", testo: "I soldi in più: da cosa dipendono davvero" },
    {
      tipo: "p",
      testo:
        "Oltre al rimborso o al volo alternativo, su un volo cancellato può spettarti una somma fissa (la legge la chiama compensazione pecuniaria), il cui importo cambia con la distanza della tratta. Sono le stesse fasce dei ritardi, e [le abbiamo spiegate qui una per una, cifra per cifra](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },
    {
      tipo: "p",
      testo:
        "Ma sui cancellati quei soldi dipendono da **due fatti che nessun archivio di volo conosce**: quando la compagnia ti ha avvisato, e a che ora sei arrivato a destinazione con il volo alternativo. Ecco perché il messaggio di cancellazione con l'ora di invio è la prova più importante che hai, e perché il nostro check, sui cancellati, ti fa due domande invece di indovinare.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Quando ti hanno avvisato.** Più il preavviso è lungo, meno la compagnia deve. Serve la data del messaggio, non il ricordo.",
        "**A che ora sei arrivato davvero.** Se l'alternativa ti fa arrivare vicino all'orario previsto, la somma fissa può non spettare. Conta l'arrivo a destinazione, non la partenza.",
        "**Da dove partiva l'aereo.** Se parti da un aeroporto europeo sei coperto con qualsiasi compagnia; se parti da un paese fuori dall'Unione, sei coperto solo se il volo è stato operato da una compagnia europea.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se non ricordi con precisione, va bene: si dice, e il caso resta incerto. Un caso incerto da noi non si paga.",
    },

    { tipo: "h2", testo: "Quello che ti spetta comunque, anche se la somma fissa non spetta" },
    {
      tipo: "p",
      testo:
        "È la confusione più comune, e le compagnie non fanno niente per chiarirla. L'assistenza mentre aspetti è una cosa. La somma fissa è un'altra. La prima non dipende dalla seconda.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Pasti e bevande** in proporzione all'attesa: sulle tratte corte scattano prima, e la soglia si allunga man mano che la distanza cresce.",
        "**L'albergo e il trasferimento** da e per l'aeroporto, se devi passare la notte.",
        "**La possibilità di comunicare**, cioè telefonate o messaggi.",
        "**Con almeno 5 ore di attesa** puoi rinunciare al volo e farti rimborsare il biglietto per la parte non fatta, e anche per quella già fatta se il viaggio non ha più senso. In quel caso la compagnia ti riporta al punto di partenza col primo volo utile.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se il banco è deserto e ti arrangi da solo, paga e conserva gli scontrini: le spese ragionevoli si chiedono dopo, e si chiedono anche quando la compensazione non spetta.",
    },

    { tipo: "h2", testo: "Quanto ti resta, a seconda di chi scrive il reclamo" },
    {
      tipo: "p",
      testo:
        "Fra qualche giorno, quando sarai a casa, vedrai comparire i portali che si offrono di farlo al posto tuo. Non ti chiedono niente adesso perché trattengono una quota del rimborso, e la trattengono solo se vinci. Sembra indolore proprio per questo.",
    },
    {
      tipo: "citazione",
      testo:
        "Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a fare la richiesta da soli.",
      fonte:
        "Ryanair, pagina ufficiale sulle Claims Management Companies (fonte 6 in fondo)",
    },
    { tipo: "confronto", compensazione: 400 },
    {
      tipo: "p",
      testo:
        "Noi facciamo il contrario: prezzo fisso a pratica, scritto prima e uguale qualunque sia la cifra che recuperi, con una tariffa unica per tutta la famiglia. La lettera la mandi tu, dalla tua email, e la compagnia paga te. La somma arriva intera.",
    },

    { tipo: "h2", testo: "Quando sei a casa: i tre passi dopo" },
    {
      tipo: "passi",
      voci: [
        "**Metti tutto in una cartella**: foto del tabellone, messaggio di cancellazione, carta d'imbarco, scontrini, orario di arrivo del volo alternativo.",
        "**Scrivi alla compagnia dal suo canale reclami**, con il tuo nome. Diverse compagnie lavorano solo il reclamo mandato dal passeggero, e alcune lo mettono per iscritto nelle proprie condizioni.",
        "**Aspetta la risposta.** L'ENAC indica sei settimane come termine entro cui la compagnia deve rispondere. Se ti dicono no senza un motivo valido, o non rispondono, si passa all'organismo nazionale del paese da cui saresti dovuto partire, che non è automaticamente l'ENAC. [Come si fa, passo per passo](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
      ],
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Mi hanno offerto un voucher: lo prendo?",
          risposta:
            "Solo se lo vuoi tu. Il voucher non è una delle tre soluzioni previste dal Regolamento, e se lo accetti rinunci al rimborso in denaro. L'Autorità garante ha sanzionato easyJet per 2.800.000 euro proprio perché lo proponeva come unica alternativa senza indicare il rimborso.",
        },
        {
          domanda: "Ho accettato il volo alternativo: posso chiedere lo stesso la compensazione?",
          risposta:
            "Sono due cose diverse. Accettare il volo alternativo non è una rinuncia. Se la somma fissa spetta dipende da quando ti hanno avvisato e da che ora sei arrivato davvero a destinazione con quel volo.",
        },
        {
          domanda: "La compagnia dice che è colpa del maltempo: finisce lì?",
          risposta:
            "No, non è automatico. Deve dimostrare la circostanza eccezionale e il suo legame con il tuo volo specifico. E in ogni caso l'assistenza, cioè pasti, bevande ed eventuale albergo, resta dovuta anche quando la somma fissa non spetta.",
        },
        {
          domanda: "Quanto ci mette la compagnia a rimborsarmi il biglietto?",
          risposta:
            "Il rimborso del prezzo del biglietto è dovuto entro 7 giorni dalla richiesta. Se hai comprato su un sito di viaggi, nel rimborso rientrano anche le commissioni di servizio che quel sito ti ha addebitato: lo ha stabilito la Corte di giustizia dell'Unione Europea nella causa C-45/24.",
        },
        {
          domanda: "Ho perso il volo dopo perché il primo era cancellato: conta?",
          risposta:
            "Dipende da come hai comprato i biglietti. Se sono una prenotazione unica, quello che conta è l'orario di arrivo alla destinazione finale. Se sono biglietti separati, comprati in momenti diversi, i due voli restano contratti distinti.",
        },
        {
          domanda: "Sono in aeroporto adesso: devo per forza decidere subito?",
          risposta:
            "Sulla scelta fra rimborso e volo alternativo sì, conviene decidere in aeroporto, perché i posti sui voli utili finiscono. Sul reclamo no: quello si scrive con calma da casa, quando hai tutte le prove in una cartella.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: assistenza, rimborso del biglietto entro 7 giorni e soglia delle 5 ore",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: cosa fare se la compagnia non risponde entro sei settimane",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: a chi rivolgersi quando la compagnia non rispetta il Regolamento",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
    {
      titolo:
        "AGCM, procedimento PS11830: sanzione di 2.800.000 euro a easyJet sul voucher offerto come unica alternativa",
      url: "https://www.agcm.it/dettaglio?db=C12560D000291394&fs=&title=PS11830-EASYJET%2FCANCELLAZIONE+VOLI+POST-COVID&uid=0FB265C0FA4F0EC7C12586D1004CDE2D&view=",
    },
    {
      titolo:
        "Corte di giustizia UE, 15 gennaio 2026, causa C-45/24: il rimborso comprende le commissioni dell'agenzia di viaggio online",
      url: "https://www.studiolegalejonas.com/rimborso-volo-cancellato-commissioni-agenzia/",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
  ],
};
