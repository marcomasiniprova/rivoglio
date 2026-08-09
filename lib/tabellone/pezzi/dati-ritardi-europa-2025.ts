import type { Articolo } from "../tipi";

/**
 * ARTICOLO DATI. Serve a due cose: rispondere alla query "statistiche
 * ritardi aerei Europa 2025" e dare a stampa e social un pezzo citabile.
 *
 * Regola di questo file: i numeri vengono da Eurocontrol (il controllo
 * del traffico) e dall'ENAC (il regolatore). I numeri prodotti da chi
 * vende reclami si possono citare, ma vanno attribuiti nel testo, con
 * il nome di chi li produce. Nessun numero senza la sua voce in `fonti`.
 */
export const ARTICOLO: Articolo = {
  slug: "dati-ritardi-europa-2025",
  titolo: "Un volo su quattro arriva in ritardo: i dati 2025",
  titoloSeo: "Un volo su quattro arriva in ritardo: i dati 2025",
  descrizione:
    "I numeri veri dei ritardi aerei in Europa nel 2025, presi da Eurocontrol e dall'ENAC. E perché la puntualità si misura a 15 minuti mentre i soldi scattano a 3 ore.",
  estratto:
    "Nel 2025 in Europa il 76,1% dei voli è arrivato entro un quarto d'ora dall'orario previsto. Il resto è il numero che leggi ovunque, quasi sempre letto male.",
  data: "2026-08-09",
  tipo: "dati",
  tag: ["dati", "ritardo", "aeroporti"],
  copertina: "tabellone-partenze",
  minuti: 8,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "scali-italiani-ritardi-2026",
    "quanto-tempo-hai-per-chiedere-il-rimborso",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Nel 2025 la puntualità in arrivo dei voli europei è stata del 76,1%: quasi un volo su quattro è atterrato oltre un quarto d'ora dopo l'orario previsto.** Il dato è di Eurocontrol, cioè dell'organizzazione che gestisce il traffico aereo europeo e conta i voli mentre volano. Non è una stima, non è un sondaggio, e non viene da chi vende assistenza sui reclami.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi i numeri del 2025 per intero, come sono cambiati rispetto al 2024, cosa succede d'estate, i dati italiani dell'ENAC, e la distinzione che rende inutile metà di quello che leggi in giro: **la puntualità si misura a 15 minuti, la compensazione scatta a 3 ore.**",
    },

    { tipo: "h2", testo: "Il 2025 in quattro numeri" },
    {
      tipo: "p",
      testo:
        "Eurocontrol pubblica ogni anno il conto della rete europea. Sono i voli che passano dal suo controllo, quindi il perimetro è tutto lo spazio aereo gestito, non un campione.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Cosa", "2025", "Come si legge"],
      righe: [
        [
          "Voli nella rete europea",
          "**11,12 milioni**",
          "Il 4% in più del 2024",
        ],
        [
          "Voli al giorno, in media",
          "**30.474**",
          "Il traffico è tornato a crescere",
        ],
        [
          "Puntualità in arrivo entro 15 minuti",
          "**76,1%**",
          "Circa un volo su quattro arriva oltre i 15 minuti",
        ],
        [
          "Ritardo medio alla partenza, per volo",
          "**14,6 minuti**",
          "Erano 17,5 minuti nel 2024",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "La lettura onesta è questa: **il 2025 è andato meglio del 2024 pur avendo più voli.** Il ritardo medio alla partenza è sceso di quasi tre minuti a volo mentre il traffico saliva del 4%. È un dato che nessuno rilancia, perché una notizia buona sul trasporto aereo non gira.",
    },
    {
      tipo: "p",
      testo:
        "Il numero da tenere è comunque il primo: una quota vicina a un quarto dei voli non arriva nella finestra di puntualità. Su undici milioni di voli, è tantissima gente in fila davanti a un tabellone.",
    },

    { tipo: "h2", testo: "15 minuti e 3 ore sono due metri diversi" },
    {
      tipo: "p",
      testo:
        "Qui casca quasi ogni articolo che riprende questi dati. La statistica della puntualità usa una soglia di **15 minuti**: è il metro con cui si giudica la rete, gli scali e le compagnie. Il Regolamento CE 261/2004 usa una soglia di **3 ore all'arrivo**: è il metro con cui si decide se la compagnia ti deve dei soldi.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Soglia", "A cosa serve", "Chi la usa"],
      righe: [
        [
          "**15 minuti** di ritardo all'arrivo",
          "Misurare la puntualità del sistema",
          "Eurocontrol, aeroporti, compagnie",
        ],
        [
          "**2 ore** di attesa (tratte fino a 1.500 km)",
          "Fa scattare pasti, bevande e comunicazioni",
          "Regolamento CE 261/2004, art. 9",
        ],
        [
          "**3 ore** di ritardo all'arrivo",
          "Fa scattare la somma fissa (compensazione pecuniaria)",
          "Regolamento CE 261/2004, art. 7",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "Tradotto: quel quarto di voli in ritardo **non** è un quarto di passeggeri a cui spettano 250, 400 o 600 euro. La grande maggioranza di quei ritardi sta fra i quindici minuti e le due ore, e in quei casi la somma fissa non spetta. Chi presenta il 24% come una platea di aventi titolo sta facendo un salto logico che gli conviene.",
    },
    {
      tipo: "nota",
      titolo: "La soglia che conta è una sola, e si misura all'arrivo",
      testo:
        "Sotto le tre ore all'arrivo la somma fissa non spetta, per quanto brutta sia stata l'attesa. Sopra le tre ore l'importo dipende dalla distanza della tratta. [Le tre fasce, spiegate per intero](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },

    {
      tipo: "check",
      titolo: "Il tuo volo dove cade: sotto o sopra le tre ore?",
      testo:
        "Le statistiche parlano della rete, non del tuo volo. Qui guardiamo l'orario di arrivo effettivo registrato per il volo che hai preso, e ti diciamo i minuti veri. Gratis, senza account. Se il caso non regge, te lo diciamo lo stesso.",
    },

    { tipo: "h2", testo: "D'estate il quadro cambia del tutto" },
    {
      tipo: "p",
      testo:
        "La media annua nasconde la stagione. Nel **luglio 2025** la puntualità in arrivo europea è scesa al **68%**, e il ritardo medio alla partenza è salito a **21,0 minuti** per volo. Cioè d'estate un volo su tre esce dalla finestra dei quindici minuti, e il ritardo medio alla partenza è ben più alto della media dell'anno.",
    },
    {
      tipo: "p",
      testo:
        "Il 2026 sta raccontando la stessa storia. Nella **settimana 29 del 2026** la puntualità in arrivo è stata del **69%**, e Eurocontrol attribuisce al **meteo il 55% dei ritardi in rotta**. È un dettaglio che vale la pena tenere a mente quando la compagnia risponde citando il maltempo: il maltempo esiste davvero, e allo stesso tempo la compagnia deve dimostrare la circostanza eccezionale e il suo legame con il tuo volo specifico. Non basta il bollettino di quel giorno.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Estate uguale volumi.** Più voli nello stesso spazio aereo significa meno margine per recuperare un ritardo.",
        "**Il meteo pesa più di quanto sembra**, e pesa sulla rotta, non solo sull'aeroporto che vedi dal finestrino.",
        "**Un ritardo si propaga.** Lo stesso aereo fa più tratte nella stessa giornata: il ritardo del mattino te lo ritrovi la sera, su un volo che non c'entra niente.",
      ],
    },

    { tipo: "h2", testo: "L'Italia: 229 milioni di passeggeri" },
    {
      tipo: "p",
      testo:
        "Sul fronte italiano il numero ufficiale lo dà l'ENAC: negli aeroporti italiani nel 2025 sono passati **229.740.554 passeggeri**, il **5% in più** del 2024. Anche qui la crescita è la cornice: più passeggeri, stesse piste, stessi controlli, stessi finger.",
    },
    {
      tipo: "p",
      testo:
        "L'ENAC pubblica il traffico, non la puntualità scalo per scalo con lo stesso dettaglio di Eurocontrol. Per capire come si muovono i singoli scali italiani noi guardiamo i ritardi in arrivo giorno per giorno e li mettiamo in fila: [i numeri degli scali italiani nel 2026](/tabellone/scali-italiani-ritardi-2026).",
    },

    { tipo: "h2", testo: "Gli altri numeri che leggi, e chi li produce" },
    {
      tipo: "p",
      testo:
        "Quando un giornale titola sui diritti dei passeggeri, la fonte spesso non è un regolatore: è una società che vive di reclami. Non vuol dire che il dato sia falso. Vuol dire che chi lo produce ha un interesse a mostrare disagi alti e passeggeri disinformati, e che questo va scritto invece che nascosto.",
    },
    {
      tipo: "p",
      testo:
        "Quelle rilevazioni misurano quasi sempre la stessa cosa: quanto poco sanno i passeggeri. Cioè esattamente la condizione che rende necessario il servizio di chi le pubblica. Per questo in questa pagina i numeri sono solo quelli di Eurocontrol e dell'ENAC, ognuno con la sua fonte in fondo.",
    },
    {
      tipo: "citazione",
      testo:
        "Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a presentare la richiesta da soli.",
      fonte: "Ryanair, pagina ufficiale sulle Claims Management Companies",
    },
    { tipo: "confronto", compensazione: 400 },
    {
      tipo: "p",
      testo:
        "Noi facciamo l'opposto: prezzo fisso, deciso prima di sapere quanto vale il tuo caso, e la lettera la mandi tu dalla tua email. La compagnia paga te, e la somma arriva intera.",
    },

    { tipo: "h2", testo: "Come leggere questi dati senza farsi male" },
    {
      tipo: "passi",
      voci: [
        "**Guarda la soglia prima del numero.** Un dato di puntualità a 15 minuti non dice niente su quanti passeggeri sono sopra le tre ore.",
        "**Guarda chi produce il dato.** Un ente di controllo del traffico e una società di reclami misurano cose diverse per motivi diversi.",
        "**Guarda il periodo.** Una media annua e una settimana di luglio danno due fotografie lontanissime.",
        "**Poi scendi al tuo volo.** L'unico numero che decide qualcosa è l'orario di arrivo effettivo registrato per il volo che hai preso.",
        "**Se sei sopra soglia, scrivi alla compagnia dal suo canale reclami.** L'ENAC indica sei settimane come tempo entro cui deve risponderti; solo dopo si passa all'organismo nazionale del paese da cui sei partito. [Cosa fare se dicono no](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
      ],
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Un volo su quattro in ritardo vuol dire che a un passeggero su quattro spettano dei soldi?",
          risposta:
            "No, e la differenza è enorme. La statistica di Eurocontrol conta i voli arrivati oltre 15 minuti. La somma fissa del Regolamento CE 261/2004 scatta a 3 ore di ritardo all'arrivo. Fra i quindici minuti e le tre ore non spetta niente, per quanto sia stata sgradevole l'attesa.",
        },
        {
          domanda: "Da dove vengono i numeri di questo articolo?",
          risposta:
            "Da Eurocontrol, che gestisce il traffico aereo europeo, e dall'ENAC, il regolatore italiano. Ogni cifra che leggi qui torna a una delle fonti elencate in fondo alla pagina, con il link. I numeri diffusi dalle società che vivono di reclami non li usiamo come misura.",
        },
        {
          domanda: "Il 2025 è stato un anno peggiore del 2024?",
          risposta:
            "No, su questi indicatori è andato meglio. Il ritardo medio alla partenza è sceso da 17,5 a 14,6 minuti per volo, e nel frattempo i voli sono cresciuti del 4%, arrivando a 11,12 milioni nella rete europea.",
        },
        {
          domanda: "Se il ritardo è colpa del meteo, la compagnia non paga mai?",
          risposta:
            "Non è automatico. Eurocontrol registra che nella settimana 29 del 2026 il meteo ha causato il 55% dei ritardi in rotta, quindi il fenomeno è reale. Ma è la compagnia a dover dimostrare la circostanza eccezionale e il legame con il tuo volo specifico, non tu a dover dimostrare il contrario.",
        },
        {
          domanda: "Perché d'estate i numeri peggiorano così tanto?",
          risposta:
            "Perché il traffico si concentra. Nel luglio 2025 la puntualità in arrivo è scesa al 68% e il ritardo medio alla partenza è salito a 21,0 minuti, contro i 14,6 minuti della media annua. Con più voli nello stesso spazio aereo, un ritardo del mattino si trascina fino a sera.",
        },
        {
          domanda: "Questi dati mi servono a qualcosa per il mio reclamo?",
          risposta:
            "Servono a inquadrare il contesto, non a vincere il caso. Quello che conta nel tuo reclamo è l'orario di arrivo effettivo registrato per il tuo volo e la distanza della tratta. Il check è gratuito e ti dice tutti e due.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "Eurocontrol, Data Snapshot 57: voli, media giornaliera e puntualità in arrivo nel 2025",
      url: "https://www.eurocontrol.int/sites/default/files/2026-01/eurocontrol-data-snapshot-57.pdf",
    },
    {
      titolo:
        "Eurocontrol, European Aviation Overview: consuntivo 2025, ritardo medio alla partenza",
      url: "https://www.eurocontrol.int/sites/default/files/2026-01/eurocontrol-european-aviation-overview-20260123-2025-review.pdf",
    },
    {
      titolo:
        "Eurocontrol, Monthly Briefing luglio 2025: puntualità in arrivo e ritardo medio",
      url: "https://www.eurocontrol.int/sites/default/files/2025-08/eurocontrol-monthly-briefing-july-2025.pdf",
    },
    {
      titolo:
        "Eurocontrol, European Aviation Overview settimana 29 del 2026: puntualità e cause dei ritardi in rotta",
      url: "https://www.eurocontrol.int/publication/eurocontrol-european-aviation-overview-2026-week-29",
    },
    {
      titolo:
        "ENAC, nel 2025 oltre 229 milioni di passeggeri negli aeroporti italiani",
      url: "https://www.enac.gov.it/news/enac-nel-2025-oltre-229-milioni-di-passeggeri-negli-aeroporti-italiani-con-un-5-rispetto-al-2024-in-crescita-anche-il-traffico-cargo/",
    },
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: soglia delle 3 ore, importi e assistenza",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: le sei settimane per la risposta della compagnia",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
  ],
};
