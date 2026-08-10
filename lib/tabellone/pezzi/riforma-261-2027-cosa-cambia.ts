import type { Articolo } from "../tipi";

/**
 * SITUAZIONE. La riforma del Regolamento 261, approvata il 7 e il 13
 * luglio 2026 e applicabile dall'estate 2027.
 *
 * Perché questo pezzo esiste, in una riga: è la parola chiave che
 * tutti cercheranno da qui al 2027, e in italiano oggi non c'è quasi
 * niente di scritto bene. Chi ne parla o è fermo alla proposta del
 * 2013, o ha letto un comunicato e ne ha ricavato un titolo allarmista
 * ("addio ai rimborsi") che è falso: la soglia delle tre ore è rimasta.
 *
 * ⚠️ REGOLA DI QUESTO FILE, più stretta del solito. I dettagli
 * operativi (i 9 mesi, i 4 giorni, i 30 giorni) vengono da comunicati
 * ufficiali e da analisi di studi legali, NON ancora dall'articolato
 * pubblicato in Gazzetta ufficiale. L'articolo lo dice al lettore, in
 * chiaro, invece di far finta di avere il testo in mano. Quando la
 * Gazzetta esce, questa pagina si rilegge riga per riga: è in
 * ARRETRATI, e `RIFORMA-2027.md` porta le fonti una per una.
 */
export const ARTICOLO: Articolo = {
  slug: "riforma-261-2027-cosa-cambia",
  titolo: "La riforma dei diritti dei passeggeri è approvata: cosa cambia dal 2027",
  titoloSeo: "Riforma 261: cosa cambia per i rimborsi aerei dal 2027",
  descrizione:
    "Parlamento e Consiglio hanno approvato la revisione del Regolamento 261 a luglio 2026. Le tre ore restano, gli importi restano, il tempo per chiedere si accorcia.",
  estratto:
    "Prima revisione dal 2004, approvata a luglio 2026 e applicabile dall'estate 2027. La soglia delle tre ore è salva. Il tempo per chiedere diventa nove mesi.",
  data: "2026-08-10",
  tipo: "situazione",
  tag: ["diritti", "rimborsi", "guida"],
  copertina: "stelle-riforma",
  minuti: 8,
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
        "**Il Regolamento europeo sui diritti dei passeggeri aerei è stato riscritto, per la prima volta dal 2004.** Il Parlamento europeo lo ha approvato il 7 luglio 2026 con 646 voti contro 12, e il Consiglio ha dato il via libera finale il 13 luglio. Le nuove regole si applicheranno dall'estate del 2027.",
    },
    {
      tipo: "p",
      testo:
        "Nei mesi scorsi hai forse letto titoli tipo \"addio ai rimborsi\". Non è andata così, e la notizia più importante è proprio quella che non è successa: **la soglia delle tre ore è rimasta dov'era**. Qui sotto trovi cosa cambia davvero, cosa resta uguale, e la sola cosa che ti conviene fare da subito.",
    },

    { tipo: "h2", testo: "Le date, e perché stavolta è diverso" },
    {
      tipo: "p",
      testo:
        "Del rifacimento del Regolamento si parlava dal 2013, e per tredici anni non se n'è fatto niente: il testo restava fermo fra Parlamento e Consiglio. Le date di questa volta sono altre, e sono definitive.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Quando", "Cosa è successo"],
      righe: [
        ["**7 luglio 2026**", "Il Parlamento europeo approva la revisione, 646 voti contro 12"],
        ["**13 luglio 2026**", "Il Consiglio dell'Unione dà il via libera finale"],
        [
          "**Estate 2027**",
          "Le nuove regole diventano applicabili, circa dodici mesi dopo la pubblicazione ufficiale",
        ],
      ],
    },
    {
      tipo: "nota",
      titolo: "Fino ad allora vale tutto quello che vale oggi",
      testo:
        "Un volo di quest'anno, e anche uno del 2027 prima dell'entrata in vigore, si tratta con le regole attuali. Nessuna delle novità qui sotto si applica al tuo volo di ieri.",
    },

    { tipo: "h2", testo: "Quello che NON cambia, ed è la notizia migliore" },
    {
      tipo: "p",
      testo:
        "Durante il negoziato si è discusso di alzare la soglia del ritardo da tre a quattro ore, e in alcune versioni fino a sei. Sarebbe stato il colpo più duro per i passeggeri: **la maggior parte dei ritardi che oggi valgono una compensazione sta fra le tre e le quattro ore**, e spostare l'asticella li avrebbe cancellati in blocco.",
    },
    {
      tipo: "elenco",
      voci: [
        "**La soglia resta a tre ore** di ritardo all'arrivo. La proposta di portarla a quattro o sei è stata respinta.",
        "**Gli importi restano 250, 400 e 600 euro**, con le stesse fasce di distanza di oggi.",
        "**Il ritardo si continua a misurare all'arrivo**, non alla partenza.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se non sai in quale fascia cade il tuo volo, il criterio è la distanza della tratta e non il prezzo del biglietto: [le tre fasce spiegate con gli esempi](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },

    { tipo: "h2", testo: "Nove mesi per chiedere: il cambio che ti può costare i soldi" },
    {
      tipo: "p",
      testo:
        "Oggi il tempo per chiedere la compensazione non lo scrive l'Europa: lo scrive ogni Stato, e infatti in Italia è contestato fra sei mesi e un anno, mentre altrove è molto più lungo. La riforma mette **un termine unico europeo di nove mesi dalla data del disservizio**.",
    },
    {
      tipo: "p",
      testo:
        "Per chi vive in un paese dove oggi il termine è più lungo è un peggioramento netto. Per l'Italia è quasi un pareggio, e ha un vantaggio: finisce il pasticcio delle due tesi, e sai in anticipo qual è il tuo ultimo giorno utile. [Come funziona oggi, e perché conviene comunque muoversi subito](/tabellone/quanto-tempo-hai-per-chiedere-il-rimborso).",
    },
    {
      tipo: "nota",
      titolo: "La conseguenza pratica, detta senza giri",
      testo:
        "Dall'estate 2027 il volo dell'anno scorso non si potrà più recuperare. Se hai un volo storto negli ultimi mesi, il momento per farlo verificare è adesso: non perché lo diciamo noi, ma perché la finestra si chiude da sola.",
    },

    { tipo: "h2", testo: "La compagnia dovrà scriverti per prima" },
    {
      tipo: "p",
      testo:
        "È la novità che cambia di più la vita quotidiana del passeggero. Oggi, se non sai che ti spetta qualcosa, non chiedi niente e la compagnia non ha nessun obbligo di dirtelo. Dalla riforma dovrà farlo lei, e a spese sue.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Obbligo nuovo", "Entro quando"],
      righe: [
        [
          "La compagnia ti manda le istruzioni su come chiedere la compensazione",
          "**4 giorni** dalla fine del viaggio",
        ],
        [
          "La compagnia paga, oppure ti spiega per iscritto perché rifiuta",
          "**30 giorni** dalla tua richiesta",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "Il secondo obbligo è quello che pesa. Oggi le compagnie rispondono in otto-quattordici settimane, quando rispondono: un termine di trenta giorni scritto nella legge cambia il ritmo della partita, e cambia anche il momento in cui conviene sollecitare.",
    },

    {
      tipo: "check",
      titolo: "Hai un volo in ritardo? Controllalo adesso, con le regole di oggi",
      testo:
        "Ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e se il caso regge. Gratis, senza account e senza carta. Se il caso non regge, te lo diciamo e non paghi niente.",
    },

    { tipo: "h2", testo: "Quello che è stato tolto dal testo finale" },
    {
      tipo: "p",
      testo:
        "Nelle prime versioni c'era molto di più, e vale la pena saperlo perché in giro si trovano ancora articoli che lo raccontano come se fosse legge: si parlava di un **modulo precompilato** che la compagnia avrebbe dovuto mandarti già pronto, e in alcune ipotesi perfino di un **pagamento automatico** senza bisogno di chiedere.",
    },
    {
      tipo: "p",
      testo:
        "Nel testo approvato non c'è. La compagnia ti informa, ma **il reclamo lo scrivi ancora tu**, e la risposta può ancora essere un no. Quello che cambia è la velocità con cui quel no deve arrivare, non il fatto che arrivi.",
    },
    {
      tipo: "p",
      testo:
        "E qui va detta la cosa scomoda: un no alla prima risposta è la norma, non l'eccezione, e la maggior parte delle persone si ferma lì. [Cosa fare quando la compagnia dice no](/tabellone/compagnia-dice-no-cosa-puoi-fare) è il pezzo che dal 2027 conterà più di tutti gli altri.",
    },

    { tipo: "h2", testo: "Cosa cambia per te, in pratica" },
    {
      tipo: "passi",
      voci: [
        "**Se hai un volo storto degli ultimi mesi, muoviti ora.** Le regole di oggi sono più generose sul tempo, e dall'estate 2027 la finestra è nove mesi per tutti.",
        "**Non aspettare l'email della compagnia.** L'obbligo di informarti nasce nel 2027 e vale per i voli da lì in avanti: sui voli di adesso, se non chiedi tu, non chiede nessuno.",
        "**Segna la data in cui scrivi.** Vale oggi con le sei settimane indicate dall'ENAC, e varrà anche dopo, quando i giorni da contare saranno trenta.",
        "**Se ti dicono no, non è finita.** Il no si replica per iscritto, e l'onere di provare la circostanza eccezionale resta della compagnia, prima e dopo la riforma.",
        "**Se non basta, esiste una strada gratuita prima del giudice**: il tentativo di conciliazione. [Come funziona e quando serve](/giudice-di-pace).",
      ],
    },

    {
      tipo: "p",
      testo:
        "Un'ultima cosa sui soldi, perché la riforma non la tocca. Chi gestisce il reclamo al posto tuo a percentuale trattiene una quota di quello che recuperi, e la trattiene solo se vinci: sembra indolore proprio per questo. Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a fare la richiesta da soli.",
    },
    { tipo: "confronto", compensazione: 400 },
    {
      tipo: "p",
      testo:
        "Noi facciamo il contrario: **un prezzo fisso, scritto prima**, uguale qualunque sia la cifra che recuperi. Il check è sempre gratuito, la lettera la mandi tu dalla tua email e la compagnia paga te, direttamente, quindi la somma arriva intera. [Il listino sta qui](/#prezzi).",
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Da quando valgono le nuove regole?",
          risposta:
            "Dall'estate del 2027, circa dodici mesi dopo la pubblicazione ufficiale del testo. Fino ad allora valgono le regole attuali, comprese quelle sul tempo per chiedere.",
        },
        {
          domanda: "È vero che la soglia passa da tre a quattro ore?",
          risposta:
            "No. Era una delle proposte in discussione ed è stata respinta. La soglia resta a tre ore di ritardo all'arrivo, e gli importi restano 250, 400 e 600 euro.",
        },
        {
          domanda: "Le nuove regole valgono anche per il mio volo dell'anno scorso?",
          risposta:
            "No. Un volo di oggi si tratta con le regole di oggi. È anche il motivo per cui conviene non rimandare: dall'estate 2027 il termine unico di nove mesi renderà i voli vecchi irrecuperabili.",
        },
        {
          domanda: "Se la compagnia deve pagare in 30 giorni, mi servirà ancora fare qualcosa?",
          risposta:
            "Sì. La compagnia deve informarti e rispondere entro trenta giorni, ma la richiesta la presenti tu, e la risposta può essere un rifiuto. Il modulo precompilato e il pagamento automatico erano nelle prime versioni e nel testo finale non ci sono.",
        },
        {
          domanda: "Le compensazioni per i voli cancellati cambiano?",
          risposta:
            "Gli importi no. Restano anche i due elementi che decidono se la compensazione spetta per una cancellazione: quanto preavviso ti hanno dato e a che ora sei arrivato con il volo alternativo.",
        },
        {
          domanda: "Da dove vengono questi numeri?",
          risposta:
            "Dai comunicati ufficiali del Consiglio e della Commissione e dalle analisi degli studi legali, elencati in fondo. I dettagli operativi, cioè i nove mesi, i quattro giorni e i trenta giorni, non vengono ancora dal testo pubblicato in Gazzetta ufficiale: quando esce, questa pagina viene riletta riga per riga.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "Consiglio dell'Unione europea, comunicato del 13 luglio 2026: via libera finale ai nuovi diritti dei passeggeri aerei",
      url: "https://www.consilium.europa.eu/en/press/press-releases/2026/07/13/air-passenger-rights-council-gives-final-clearance/",
    },
    {
      titolo:
        "Parlamento europeo, comunicato di luglio 2026 sull'aggiornamento dei diritti dei passeggeri aerei",
      url: "https://www.europarl.europa.eu/news/en/press-room/20260703IPR46273/european-parliament-achieves-upgrade-to-air-passenger-rights",
    },
    {
      titolo:
        "Commissione europea, Commission welcomes landmark agreement on revised air passenger rights",
      url: "https://transport.ec.europa.eu/news-events/news/commission-welcomes-landmark-agreement-revised-air-passenger-rights-2026-06-15_en",
    },
    {
      titolo:
        "DLA Piper, Agreement reached on EC261 reform to strengthen passenger rights",
      url: "https://www.dlapiper.com/en/insights/publications/2026/06/agreement-reached-on-ec261-reform",
    },
    {
      titolo:
        "Euronews, Inside the EU's bittersweet deal to update air passenger rights",
      url: "https://www.euronews.com/travel/2026/07/10/inside-the-eus-bittersweet-deal-to-update-air-passenger-rights",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
  ],
};
