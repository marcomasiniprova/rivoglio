import type { Articolo } from "../tipi";

/**
 * ARTICOLO PER COMPAGNIA. L'angolo è il doppio modulo: su easyJet la
 * compensazione e le spese si chiedono in due punti diversi, e chi ne
 * compila uno solo lascia l'altro sul tavolo.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni
 * numero che compare nel testo deve poter tornare a una voce di `fonti`.
 * Se un numero non ha la sua fonte, il numero si toglie.
 */
export const ARTICOLO: Articolo = {
  slug: "reclamo-easyjet-28-giorni",
  titolo: "easyJet: i 28 giorni scritti nelle condizioni",
  titoloSeo: "easyJet: i 28 giorni scritti nelle condizioni",
  descrizione:
    "Le condizioni di trasporto easyJet chiedono 28 giorni di reclamo diretto prima di incaricare un terzo. E i moduli sono due: chi ne compila uno solo perde l'altro.",
  estratto:
    "La sezione 19.6 chiede di scrivere prima da solo e di aspettare 28 giorni. E la compensazione e le spese si chiedono su due moduli diversi.",
  data: "2026-08-09",
  tipo: "compagnia",
  tag: ["compagnie", "rimborsi", "cancellazione"],
  copertina: "fetta-commissione",
  /* NIENTE FOTO, per adesso, ed è una scelta. La foto generata per questo
     pezzo inquadra due pile di fogli con dei titoli leggibili che parlano
     d'altro (un report sull'energia) e sotto un testo finto: a dimensione
     di copertina si legge, e fa sembrare la pagina montata a caso. Meglio
     l'illustrazione, finché non arriva una foto senza testo dentro. Il
     prompt corretto sta in COPERTINE.md, numero 4. */
  minuti: 7,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "compagnia-dice-no-cosa-puoi-fare",
    "reclamo-ryanair-14-giorni",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Le condizioni di trasporto di easyJet, alla sezione 19.6, chiedono di presentare il reclamo per conto tuo e di lasciare passare 28 giorni prima di incaricare qualcun altro di farlo al posto tuo.** easyJet scrive che, se quella regola non viene rispettata, non tratterà il reclamo presentato da un terzo; le eccezioni dichiarate sono due, il tutore legale e un altro passeggero della stessa prenotazione. Tradotto: la via più rapida per farti pagare è scrivere tu, subito, dalla tua email.",
    },
    {
      tipo: "p",
      testo:
        "C'è un secondo dettaglio che pesa quanto il primo, e quasi nessuno lo scrive: **easyJet ha due moduli distinti**, uno per la compensazione europea e uno per il rimborso delle spese che hai anticipato. Sono due richieste separate. Chi compila solo il primo lascia sul tavolo albergo, pasti e taxi; chi compila solo il secondo si dimentica la somma più grossa.",
    },

    { tipo: "h2", testo: "Cosa dice davvero la sezione 19.6" },
    {
      tipo: "p",
      testo:
        "Le condizioni di trasporto sono il contratto che accetti quando compri il biglietto. La sezione 19.6 riguarda i reclami presentati da terzi, cioè da società, studi e portali che si offrono di scrivere al posto tuo.",
    },
    {
      tipo: "elenco",
      voci: [
        "Il reclamo va presentato **prima da te**, direttamente a easyJet.",
        "Da quel momento decorrono **28 giorni**: solo dopo puoi incaricare un terzo.",
        "Se la regola non è stata rispettata, easyJet dichiara che **non tratterà** il reclamo del terzo.",
        "Restano fuori dal vincolo il **tutore legale** e un **passeggero della stessa prenotazione**, che può scrivere anche per gli altri.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Non è un capriccio isolato: anche altre compagnie mettono per iscritto un passaggio del genere, [Ryanair per prima](/tabellone/reclamo-ryanair-14-giorni). Il senso commerciale è chiaro, e a te conviene lo stesso: il reclamo che parte dalla tua email entra nella coda normale, senza il giro dell'intermediario e senza una quota trattenuta all'arrivo.",
    },
    {
      tipo: "nota",
      titolo: "Attenzione a chi ti promette di 'occuparsi di tutto'",
      testo:
        "Se firmi un mandato a un portale il giorno stesso del disservizio, quel portale è un terzo dal punto di vista di easyJet. Il reclamo può fermarsi lì, e tu perdi settimane senza saperlo. L'ultima riga della sezione 19.6 vale più di qualsiasi promessa di assistenza.",
    },

    { tipo: "h2", testo: "I due moduli, e cosa copre ciascuno" },
    {
      tipo: "p",
      testo:
        "Sul sito easyJet il modulo della compensazione europea e quello delle spese sostenute sono due pagine diverse. Compilarne uno non fa partire l'altro. È l'errore più costoso di tutta la procedura, perché le due somme non si sovrappongono: si sommano.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Cosa stai chiedendo", "Dove si chiede", "Cosa serve"],
      righe: [
        [
          "La **compensazione** (la somma fissa dell'art. 7, in gergo compensazione pecuniaria)",
          "Modulo EU261",
          "Numero e data del volo, i dati dei passeggeri, il codice di prenotazione",
        ],
        [
          "Le **spese anticipate**: pasti, albergo, trasferimenti da e per l'aeroporto",
          "Modulo per il rimborso delle spese",
          "Gli scontrini e le ricevute, uno per uno",
        ],
        [
          "Il **rimborso del biglietto** se il volo è stato cancellato",
          "Richiesta di rimborso",
          "La prenotazione. È dovuto entro 7 giorni",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "La regola pratica: se il volo è arrivato con almeno tre ore di ritardo **e** durante l'attesa hai speso di tasca tua, i moduli da compilare sono due. Se il ritardo è rimasto sotto le tre ore ma hai comunque pagato un panino o un albergo, ne compili uno solo, quello delle spese: la compensazione lì non spetta, l'assistenza sì.",
    },
    {
      tipo: "p",
      testo:
        "Su una tratta fino a 1.500 km pasti e bevande sono dovuti già **da 2 ore** di attesa, molto prima della soglia della compensazione. Sono due cose diverse e vanno chieste separatamente.",
    },

    {
      tipo: "check",
      titolo: "Prima dei moduli: il tuo volo regge davvero?",
      testo:
        "Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia di importo. Gratis, senza account e senza carta. Se il caso non regge te lo diciamo, e non paghi niente.",
    },

    { tipo: "h2", testo: "Il voucher non è il rimborso, ed è già costato caro" },
    {
      tipo: "p",
      testo:
        "Quando un volo viene cancellato, la scelta è tua: il rimborso del biglietto oppure il volo alternativo. Il voucher è una terza cosa, e si accetta solo se lo vuoi tu.",
    },
    {
      tipo: "p",
      testo:
        "Non è una sottigliezza teorica. L'Autorità garante della concorrenza e del mercato, con il procedimento **PS11830**, ha sanzionato easyJet per **2.800.000 euro** per aver offerto il voucher come unica alternativa senza indicare che il rimborso era possibile. Se ti arriva un'email che propone solo il voucher, quella email non chiude la partita.",
    },
    {
      tipo: "nota",
      titolo: "Il voucher non cancella la compensazione",
      testo:
        "Il rimborso del biglietto e la compensazione europea sono due somme diverse, con due ragioni diverse. Aver accettato un volo alternativo, o anche un voucher, non toglie la compensazione se il volo era cancellato o è arrivato oltre la soglia. Sono i portali a percentuale a non essere interessati a spiegartelo, perché la loro parcella si calcola su una sola delle due voci.",
    },

    { tipo: "h2", testo: "Se hai comprato su un sito di viaggi, chiedi anche le commissioni" },
    {
      tipo: "p",
      testo:
        "Molti biglietti easyJet non si comprano su easyJet: si comprano su un'agenzia online, che aggiunge la sua commissione al prezzo del volo. Per anni quella commissione veniva trattenuta anche quando il volo saltava.",
    },
    {
      tipo: "p",
      testo:
        "La Corte di giustizia dell'Unione europea, con la sentenza del **15 gennaio 2026** nella causa **C-45/24**, ha stabilito che il rimborso del biglietto per un volo cancellato comprende anche le commissioni dell'agenzia di viaggio online, perché fanno parte del prezzo che hai pagato. Quindi la cifra da chiedere è quella che ti è uscita dalla carta, non quella stampata sul biglietto.",
    },

    { tipo: "h2", testo: "Quando easyJet non ti deve la compensazione" },
    {
      tipo: "p",
      testo:
        "Lo scriviamo per intero, perché è la parte che i servizi a percentuale saltano volentieri: a loro conviene che tu apra la pratica comunque.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Il ritardo all'arrivo è sotto le 3 ore.** È una soglia secca. Anche due ore e cinquanta minuti sono un no, e l'assistenza resta comunque dovuta.",
        "**Il volo non è coperto dal Regolamento.** Conta da dove decolla l'aereo: partenza da un aeroporto europeo, coperto sempre; partenza da un paese fuori dall'Unione, coperto solo se chi ha operato ha licenza europea. Sulla rete easyJet è un caso raro, ma esiste.",
        "**easyJet dimostra una circostanza eccezionale.** Deve dimostrarla, e deve dimostrare il legame con il tuo volo. Non basta dire che quel giorno il tempo era brutto.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se il volo rientra, l'importo dipende dalla distanza: 250 euro fino a 1.500 km, 400 euro per tutte le tratte dentro l'Unione oltre i 1.500 km e per le altre fra 1.500 e 3.500 km, 600 euro oltre i 3.500 km fuori dall'Unione, ridotti a 300 se il ritardo resta sotto le 4 ore. Le fasce e le eccezioni sono spiegate per intero nella [guida sugli importi](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },

    { tipo: "h2", testo: "Quanto ti resta, a seconda di come lo chiedi" },
    {
      tipo: "p",
      testo:
        "La somma che easyJet deve è la stessa in ogni caso. Cambia quanto ne arriva a te. I servizi a percentuale trattengono una quota del rimborso, e la trattengono solo se vinci: è esattamente per questo che sembrano indolori.",
    },
    {
      tipo: "citazione",
      testo:
        "Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a presentare la richiesta da soli.",
      fonte:
        "Ryanair, pagina ufficiale sulle Claims Management Companies (fonte 5 in fondo)",
    },
    { tipo: "confronto", compensazione: 400 },
    {
      tipo: "p",
      testo:
        "Noi facciamo il contrario: **un prezzo fisso, scritto prima**, uguale che tu recuperi 250 euro o 600, con una tariffa unica per tutta la famiglia. La lettera la mandi tu dalla tua email, quindi il reclamo rispetta la sezione 19.6 fin dal primo giorno e la somma arriva intera sul tuo conto. Se easyJet rifiuta senza un motivo valido o non risponde nei termini di legge, ti restituiamo quello che hai pagato. [Il listino sta qui](/#prezzi).",
    },

    { tipo: "h2", testo: "Cosa fare adesso, in ordine" },
    {
      tipo: "passi",
      voci: [
        "**Controlla il dato oggettivo del volo**, cioè l'orario di arrivo effettivo registrato. È l'unico numero che conta, e non è quello che ricordi tu.",
        "**Metti da parte le prove**: la conferma di prenotazione col codice, la carta d'imbarco, la foto del tabellone e tutti gli scontrini delle spese.",
        "**Compila il modulo della compensazione EU261**, con il tuo nome e dalla tua email. Vale anche per gli altri passeggeri della stessa prenotazione.",
        "**Compila anche il modulo delle spese**, se hai anticipato pasti, albergo o trasferimenti. È una richiesta separata e va fatta a parte.",
        "**Aspetta la risposta.** L'ENAC indica sei settimane come tempo entro cui la compagnia deve rispondere al reclamo.",
        "**Se ti dicono no senza un motivo valido, o non rispondono**, si passa all'organismo nazionale del paese da cui sei partito, non automaticamente all'ENAC. [Come funziona, passo per passo](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
      ],
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Devo davvero aspettare 28 giorni prima di chiedere?",
          risposta:
            "No, il contrario. I 28 giorni riguardano solo il momento in cui puoi incaricare un terzo di scrivere al posto tuo: il tuo reclamo diretto puoi mandarlo subito, ed è quello che fa partire l'orologio. Se scrivi da solo, quel vincolo non ti tocca mai.",
        },
        {
          domanda: "Ho compilato il modulo EU261: le spese dell'albergo sono comprese?",
          risposta:
            "No. easyJet tiene due moduli separati, uno per la compensazione e uno per il rimborso delle spese sostenute. Se hai pagato albergo, pasti o trasferimenti, devi presentare anche la seconda richiesta, con le ricevute allegate.",
        },
        {
          domanda: "Eravamo in quattro sulla stessa prenotazione: devo scrivere quattro volte?",
          risposta:
            "No. Le condizioni di easyJet indicano espressamente che un passeggero della stessa prenotazione può presentare il reclamo anche per gli altri. È una delle due eccezioni scritte nella sezione 19.6, insieme al tutore legale.",
        },
        {
          domanda: "Mi hanno offerto un voucher: se lo accetto perdo il resto?",
          risposta:
            "Il voucher è una possibilità, non l'unica. Per un volo cancellato il rimborso del biglietto è dovuto entro sette giorni e la scelta spetta a te. L'AGCM ha sanzionato easyJet per 2.800.000 euro proprio per aver presentato il voucher come unica alternativa, senza indicare il rimborso.",
        },
        {
          domanda: "Ho comprato su un sito di viaggi: mi rimborsano anche la loro commissione?",
          risposta:
            "Sì, se il volo è stato cancellato. La Corte di giustizia UE il 15 gennaio 2026, nella causa C-45/24, ha stabilito che il rimborso del biglietto comprende le commissioni dell'agenzia online, perché fanno parte del prezzo pagato.",
        },
        {
          domanda: "Il ritardo è stato di due ore e mezza: chiedo lo stesso?",
          risposta:
            "La compensazione no, serve almeno tre ore all'arrivo. Ma su una tratta fino a 1.500 km pasti e bevande sono dovuti già da due ore di attesa, e le spese che hai anticipato si chiedono comunque con il modulo dedicato.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "easyJet, Condizioni di trasporto, sezione 19.6: reclamo diretto e 28 giorni prima di incaricare terzi",
      url: "https://www.easyjet.com/en/help-centre/policy-terms-and-conditions/terms-and-conditions",
    },
    {
      titolo:
        "easyJet, modulo per la compensazione EU261 e modulo per il rimborso delle spese sostenute",
      url: "https://www.easyjet.com/it/claim/EU261",
    },
    {
      titolo:
        "AGCM, procedimento PS11830: sanzione di 2.800.000 euro a easyJet sul voucher offerto come unica alternativa",
      url: "https://www.agcm.it/dettaglio?db=C12560D000291394&fs=&title=PS11830-EASYJET%2FCANCELLAZIONE+VOLI+POST-COVID&uid=0FB265C0FA4F0EC7C12586D1004CDE2D&view=",
    },
    {
      titolo:
        "Corte di giustizia UE, 15 gennaio 2026, causa C-45/24: il rimborso del biglietto include le commissioni dell'agenzia online",
      url: "https://www.studiolegalejonas.com/rimborso-volo-cancellato-commissioni-agenzia/",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione, assistenza e rimborso",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: cosa fare se la compagnia non risponde entro sei settimane",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: l'organismo nazionale competente è quello del paese di partenza",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
  ],
};
