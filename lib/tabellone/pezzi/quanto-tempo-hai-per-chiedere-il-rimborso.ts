import type { Articolo } from "../tipi";

/**
 * SITUAZIONE. Il pezzo sulla prescrizione: in Italia il termine è
 * CONTESTATO e nessuno lo scrive. Qui si scrive, con le due tesi
 * affiancate e il caso peggiore credibile in cima.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni
 * numero che compare nel testo deve poter tornare a una voce di `fonti`.
 * Se un numero non ha la sua fonte, il numero si toglie.
 */
export const ARTICOLO: Articolo = {
  slug: "quanto-tempo-hai-per-chiedere-il-rimborso",
  titolo: "Quanto tempo hai per chiedere il rimborso del volo",
  titoloSeo: "Quanto tempo hai per chiedere il rimborso del volo",
  descrizione:
    "In Italia il termine per chiedere la compensazione è contestato: c'è chi dice sei mesi, chi un anno. Le due tesi, cosa non c'entra e perché conviene muoversi subito.",
  estratto:
    "Il Regolamento europeo non fissa nessuna scadenza: la decide ogni Stato. In Italia i giudici non sono d'accordo fra loro, e il caso peggiore credibile è breve.",
  data: "2026-08-09",
  tipo: "situazione",
  tag: ["rimborsi", "diritti", "guida"],
  copertina: "stelle-riforma",
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
        "**Non esiste una risposta unica, e chi te ne dà una sta semplificando: il Regolamento CE 261/2004 non fissa nessun termine per chiedere la compensazione, e lascia decidere a ogni Stato.** In Italia il termine è contestato: una parte degli interpreti applica sei mesi dall'arrivo, un'altra parte un anno. Il numero da tenere in testa è quindi il più severo, perché è quello che può farti perdere tutto: **sei mesi**.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi le due tesi affiancate, i termini che sembrano la stessa cosa e non lo sono, cosa dice la Cassazione su un limite che quasi tutti citano a sproposito, e cosa cambia con la riforma europea in arrivo.",
    },

    { tipo: "h2", testo: "Il Regolamento europeo non dice niente. Di proposito" },
    {
      tipo: "p",
      testo:
        "Il testo che ti fa spettare 250, 400 o 600 euro decide chi paga, quando e quanto, ma sul \"entro quando lo devi chiedere\" tace. Quel pezzo lo scrive ogni Stato membro con le proprie norme. Risultato: lo stesso volo, con lo stesso ritardo, ha finestre di tempo diverse a seconda del paese in cui la richiesta finisce davanti a un giudice.",
    },
    {
      tipo: "p",
      testo:
        "Non è un dettaglio da avvocati. È il motivo per cui online trovi articoli che dicono due anni, altri che dicono cinque, altri ancora che dicono tre: stanno guardando paesi diversi, oppure stanno guardando la norma sbagliata.",
    },

    { tipo: "h2", testo: "Le due tesi italiane, affiancate" },
    {
      tipo: "p",
      testo:
        "In Italia il contrasto è fra due norme, e cambia parecchio quale delle due si applica al tuo caso.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Tesi", "Quanto tempo hai", "Da quando si conta"],
      righe: [
        [
          "**Codice della navigazione**, art. 418 (tesi dello Studio Zunarelli)",
          "**Sei mesi**; **un anno** se il volo inizia o finisce fuori dall'Europa e dai paesi del Mediterraneo",
          "Dall'arrivo a destinazione",
        ],
        [
          "**Codice civile**, art. 2951 (applicato da una parte della giurisprudenza)",
          "**Un anno**; **diciotto mesi** se il trasporto inizia o finisce fuori dall'Europa",
          "Dall'arrivo a destinazione",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "Nessuna delle due è stata dichiarata quella giusta una volta per tutte. Vuol dire che se scrivi alla compagnia otto mesi dopo il volo puoi trovarti davanti a un rifiuto motivato con la prima tesi, e a quel punto la discussione non è più sul tuo ritardo: è su quale articolo si applica. Una discussione che costa tempo e che, per una compensazione da poche centinaia di euro, non conviene a nessuno.",
    },
    {
      tipo: "nota",
      titolo: "La regola pratica, in una riga",
      testo:
        "Trattali come sei mesi. Se sei dentro i sei mesi nessuna delle due tesi ti può escludere. Se sei fuori, la richiesta si può fare lo stesso, ma sai già che la compagnia ha un argomento da opporti.",
    },

    { tipo: "h2", testo: "I due anni di Montreal non c'entrano" },
    {
      tipo: "p",
      testo:
        "È l'errore più diffuso, e viene ripetuto anche da chi il tema lo conosce. La Convenzione di Montreal ha un termine di due anni entro cui si perde il diritto, e molti lo applicano d'ufficio a qualunque cosa riguardi un aereo.",
    },
    {
      tipo: "p",
      testo:
        "La Cassazione civile, sezione terza, con l'ordinanza del 20 febbraio 2024 n. 4427, ha detto il contrario: la compensazione dell'articolo 7 ha natura indennitaria, è una somma fissa dovuta per il disagio, e **non è soggetta al termine biennale di decadenza della Convenzione di Montreal**. Sono due binari separati: Montreal riguarda il danno che devi dimostrare, il Regolamento riguarda la somma che spetta senza dimostrare niente.",
    },
    {
      tipo: "citazione",
      testo:
        "La compensazione pecuniaria del Regolamento CE 261/2004 ha natura indennitaria e non ricade nel termine di decadenza biennale previsto dalla Convenzione di Montreal.",
      fonte: "Cassazione civile sez. III, ordinanza 20 febbraio 2024 n. 4427 (fonte 3 in fondo)",
    },
    {
      tipo: "p",
      testo:
        "Tradotto per te: non puoi dormire due anni contando su Montreal. Il tuo orologio è quello italiano, ed è più corto.",
    },

    {
      tipo: "check",
      titolo: "Il tuo volo è ancora in tempo? Controllalo adesso, è gratis",
      testo:
        "Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e se il caso regge. Non serve un account e non serve la carta. Se il caso non regge, te lo diciamo e non paghi niente.",
    },

    { tipo: "h2", testo: "I termini che sembrano lo stesso e non lo sono" },
    {
      tipo: "p",
      testo:
        "Nella stessa pratica corrono in parallelo scadenze diverse, con effetti diversi. Confonderle è il modo più semplice per perdere tempo prezioso.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Di cosa si tratta", "Quanto", "Cosa succede se lo superi"],
      righe: [
        [
          "Chiedere la compensazione alla compagnia",
          "**Sei mesi** o **un anno**, secondo la tesi",
          "La compagnia può opporti che è tardi",
        ],
        [
          "Risposta della compagnia al tuo reclamo",
          "**Sei settimane**, indicate dall'ENAC",
          "Puoi passare all'organismo nazionale",
        ],
        [
          "Reclamo all'ENAC dopo il silenzio o il rifiuto",
          "**Due anni** dalla data del volo",
          "L'ENAC non prende in carico il caso",
        ],
        [
          "Rimborso del biglietto per volo cancellato",
          "Dovuto **entro 7 giorni** dalla compagnia",
          "È un obbligo suo, non una tua scadenza",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "Attenzione alla terza riga: i due anni per il reclamo all'ENAC sono spesso scambiati per il tempo che hai per chiedere i soldi. Non lo sono. Sono il tempo per rivolgerti all'organismo nazionale, che peraltro non è sempre l'ENAC: la competenza è del paese da cui sei partito, quindi se il volo è decollato da Barcellona l'ufficio da cui passare è quello spagnolo. [Come funziona quando la compagnia dice no](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
    },

    { tipo: "h2", testo: "La riforma europea in arrivo" },
    {
      tipo: "p",
      testo:
        "Nel luglio 2026 il Parlamento europeo ha adottato la propria posizione respingendo l'innalzamento della soglia a 4 ore; il testo non è ancora applicabile e fino ad allora valgono le regole attuali. Fra le novità discusse c'è anche un termine unico europeo per presentare la domanda, che oggi manca: sarebbe la fine del pasticcio italiano delle due tesi.",
    },
    {
      tipo: "p",
      testo:
        "La durata esatta di quel termine, però, non è confermata, e finché non lo è non la scriviamo. Quello che si può dire fin d'ora è la direzione: un termine unico e scritto significa una finestra che si chiude in modo prevedibile, non una che si allunga.",
    },

    { tipo: "h2", testo: "Perché il nostro check si ferma a 12 mesi" },
    {
      tipo: "p",
      testo:
        "Il termine legale può essere più lungo dei sei mesi della tesi severa. Il nostro check, però, verifica i voli fino a **12 mesi indietro**, e oltre quella soglia non dà un verdetto.",
    },
    {
      tipo: "p",
      testo:
        "Il motivo non è legale, è tecnico ed è onesto: più si va indietro, meno i dati oggettivi del volo sono recuperabili con certezza. E il nostro verdetto si regge su un solo numero, l'orario di arrivo effettivo registrato. Senza quel dato certo non diciamo che il caso regge: diciamo che è incerto, e un caso incerto non lo vendiamo. Preferiamo perdere una pratica che vendertene una che non sta in piedi.",
    },

    { tipo: "h2", testo: "Cosa fare adesso, in ordine" },
    {
      tipo: "passi",
      voci: [
        "**Guarda la data del volo.** Se sono passati meno di sei mesi sei tranquillo su entrambe le tesi. Se sono passati di più, muoviti oggi: ogni settimana rende l'argomento della compagnia più comodo.",
        "**Controlla il dato oggettivo**, cioè l'orario di arrivo effettivo. Le tre ore si contano all'arrivo, non alla partenza, e la fascia dipende dalla tratta. [Le tre fasce spiegate](/tabellone/volo-in-ritardo-250-400-600-euro).",
        "**Metti da parte le prove**: prenotazione, carta d'imbarco, email della compagnia, scontrini delle spese.",
        "**Scrivi alla compagnia dal suo canale reclami**, tu, con il tuo nome. Molte compagnie lavorano solo il reclamo mandato dal passeggero. [Il caso Ryanair, con i suoi tempi](/tabellone/reclamo-ryanair-14-giorni).",
        "**Segna la data in cui hai scritto.** Da lì partono le sei settimane indicate dall'ENAC, e quella data ti serve anche a dimostrare che ti sei mosso in tempo.",
      ],
    },
    {
      tipo: "p",
      testo:
        "L'ultimo punto vale più di quanto sembra. La richiesta scritta alla compagnia è il momento in cui il tuo orologio smette di essere un problema tuo e diventa un fatto documentato, con una data sopra.",
    },

    { tipo: "h2", testo: "Il tempo costa, e non solo in scadenze" },
    {
      tipo: "p",
      testo:
        "C'è un secondo modo in cui il tempo ti costa, e non ha niente a che vedere con la prescrizione: più la pratica si allunga, più chi la gestisce per te si fa pagare. Un servizio a percentuale trattiene una quota del rimborso, e la trattiene solo se vinci: sembra indolore proprio per quello. Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a fare la richiesta da soli.",
    },
    { tipo: "confronto", compensazione: 250 },
    {
      tipo: "p",
      testo:
        "Noi facciamo il contrario: **un prezzo fisso, scritto prima**, uguale qualunque sia la cifra che recuperi, con una tariffa unica per tutta la famiglia. Il check è sempre gratuito e la lettera la mandi tu dalla tua email: la compagnia paga te, direttamente, e la somma arriva intera. Se rifiuta senza un motivo valido o non risponde nei termini di legge, il prezzo della pratica torna indietro. [Il listino sta qui](/#prezzi).",
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Il volo era dell'anno scorso: posso ancora chiedere?",
          risposta:
            "Puoi scrivere, ma sappi che secondo la tesi più severa il termine è sei mesi dall'arrivo, e secondo l'altra un anno. Più tempo è passato, più è probabile che la compagnia ti risponda che è tardi. Il nostro check, inoltre, verifica i voli fino a 12 mesi indietro: oltre non abbiamo il dato certo e non diamo un verdetto.",
        },
        {
          domanda: "Ho letto che ci sono due anni di tempo. È falso?",
          risposta:
            "Quei due anni sono due cose diverse, nessuna delle quali è il tempo per chiedere i soldi alla compagnia. Sono il termine per presentare reclamo all'ENAC, e il termine di decadenza della Convenzione di Montreal, che secondo la Cassazione (ordinanza n. 4427 del 2024) alla compensazione europea non si applica.",
        },
        {
          domanda: "Da quando si conta il tempo?",
          risposta:
            "Dall'arrivo a destinazione, non dalla data in cui hai comprato il biglietto e non da quando la compagnia ti ha risposto. Se il volo è stato cancellato e sei partito il giorno dopo, il riferimento è la data del volo originale.",
        },
        {
          domanda: "Se scrivo alla compagnia, il tempo si ferma?",
          risposta:
            "La richiesta scritta è il fatto che dimostra che ti sei mosso, e da lì partono le sei settimane entro cui l'ENAC indica che la compagnia deve rispondere. Manda la richiesta da un canale che lascia traccia e conserva la data.",
        },
        {
          domanda: "La riforma europea allungherà i tempi?",
          risposta:
            "Non è detto. Fra le novità discusse c'è un termine unico europeo per presentare la domanda, ma la durata esatta non è confermata e il testo non è ancora applicabile. Fino ad allora valgono le regole attuali, cioè quelle di ogni singolo Stato.",
        },
        {
          domanda: "Se sono fuori termine, mi spetta almeno qualcos'altro?",
          risposta:
            "Le regole sull'assistenza e sul rimborso del biglietto seguono i loro percorsi: il rimborso di un volo cancellato è dovuto entro sette giorni, e le spese vive sostenute di tasca tua si chiedono comunque, con gli scontrini. Ma sulla compensazione fissa, se il termine è passato, la compagnia ha un argomento solido per dire no.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione, assistenza e rimborso",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "Studio Zunarelli, Compensazione per ritardi e cancellazioni di volo: attenzione al termine di prescrizione",
      url: "https://studiozunarelli.com/compensazione-per-ritardi-e-cancellazioni-di-volo-attenzione-al-termine-di-prescrizione/",
    },
    {
      titolo:
        "Cassazione civile sez. III, ordinanza 20 febbraio 2024 n. 4427: la compensazione non è soggetta alla decadenza biennale di Montreal",
      url: "http://www.dirittoepoliticadeitrasporti.it/2024/05/26/corte-di-cassazione-civile-sez-3-ordinanza-20-febbraio-2024-n-4427/",
    },
    {
      titolo:
        "Codice civile, art. 2951: prescrizione dei diritti derivanti dal contratto di trasporto",
      url: "https://www.brocardi.it/codice-civile/libro-sesto/titolo-v/capo-i/sezione-iv/art2951.html",
    },
    {
      titolo:
        "ENAC, Modalità di reclamo per negato imbarco, cancellazione e ritardo: due anni dalla data del volo",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/modalita-di-reclamo-per-negato-imbarco-cancellazione-ritardo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: sei settimane per la risposta della compagnia",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti: a quale organismo nazionale rivolgersi",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
    {
      titolo:
        "Parlamento europeo, luglio 2026: la posizione sui diritti dei passeggeri aerei",
      url: "https://www.europarl.europa.eu/news/en/press-room/20260703IPR46273/european-parliament-achieves-upgrade-to-air-passenger-rights",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
  ],
};
