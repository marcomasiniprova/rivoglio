/**
 * TUTTI i testi delle superfici web di Rivoglio vivono qui, in un posto solo.
 * I componenti leggono da COPY: nessuna stringa utente scritta nei componenti.
 *
 * Regole (SPEC.md §3, §5; BRAND.md "Come si parla"):
 * - Il claim di un caso idoneo è SEMPRE: fatto oggettivo + fascia + cose da
 *   verificare. MAI "hai diritto a". MAI vaghezza.
 * - La prescrizione è SEMPRE dichiarata come stima.
 * - Ogni numero mostrato è apribile (campo `nota`) o citato (campo `fonte`).
 * - Trattino lungo vietato ovunque.
 *
 * Segnaposto nei template: {volo} {data} {ritardo} {oraPrevista}
 * {oraEffettiva} {importo} {distanza}. Li riempie il componente coi dati
 * VERI della verifica: questo file non contiene esempi che sembrano veri.
 *
 * Fonti dei numeri di mercato:
 * - 229,7 milioni di passeggeri 2025: ENAC, "Dati di traffico 2025"
 *   (enac.gov.it, gennaio 2026). Verificata il 07/08/2026.
 * - <10% ottiene la compensazione: ReFly. 52% richieste respinte in modo
 *   illegittimo: AirHelp. 3,2 miliardi non pagati: Euronews. (SPEC §2)
 */

export const COPY = {
  /** 3-6 parole. Regge anche bagagli, treni e bollette, non solo i voli. */
  tagline: "Riprenditi i soldi che ti devono.",

  comune: {
    marchio: "Rivoglio",
    regolamento: "Regolamento CE 261/2004",
    caricamento: "Un attimo.",
    erroreGenerico: "Qualcosa non ha funzionato. Riprova tra poco.",
    riprova: "Riprova",
    chiudi: "Chiudi",
    apriIlConto: "Come nasce questa cifra",
    /** Etichetta obbligatoria su ogni dato dimostrativo (regola CLAUDE.md #3). */
    demo: "Esempio dimostrativo",
  },

  nav: {
    voci: [
      { testo: "Come funziona", ancora: "#come-funziona" },
      { testo: "Garanzia", ancora: "#garanzia" },
      { testo: "Prezzi", ancora: "#prezzi" },
      { testo: "Domande", ancora: "#domande" },
    ],
    cta: "Controlla il tuo volo",
  },

  hero: {
    occhiello: "Lo scanner dei rimborsi",
    titolo: "Hai preso un volo negli ultimi 5 anni?",
    sottotitolo: "Forse ti devono fino a 600€. Controllalo gratis in 30 secondi.",
    /** Apre il "fino a 600€". */
    notaImporto:
      "600€ è l'importo massimo del Regolamento CE 261/2004: ritardi di 4 ore o più sulle tratte oltre i 3.500 km. Le altre fasce: 250€ fino a 1.500 km, 400€ fino a 3.500 km.",
    /** Apre gli "ultimi 5 anni". */
    notaFinestra:
      "Per ITA e Aeroitalia puoi risalire fino a 2 anni. Per vettori esteri come Ryanair e Wizz Air la finestra è più lunga, stimata in 5 o 6 anni: dipende dalla compagnia, la calcoliamo caso per caso.",
    /** Etichette dei bottoni che aprono le due note qui sopra. */
    apriImporto: "Come nasce il 600€",
    apriFinestra: "Perché 5 anni",
    form: {
      volo: {
        etichetta: "Numero del volo",
        segnaposto: "FR 8321",
        aiuto: "Lo trovi sulla carta d'imbarco o nell'email di conferma.",
      },
      data: {
        etichetta: "Data del volo",
        aiuto: "Il giorno della partenza.",
      },
      bottone: "Controlla gratis",
      rassicurazione: "Niente email, niente account. Il risultato lo vedi subito.",
      /** Errori di validazione lato campo, prima ancora di chiamare l'API. */
      errori: {
        voloMancante: "Scrivi il numero del volo, per esempio FR 8321.",
        dataMancante: "Scrivi la data del volo: è il giorno della partenza.",
      },
    },
    puntiFiducia: [
      "Il check è gratis, sempre",
      "Nessuna percentuale sulla compensazione",
      "Se la compagnia non paga, non paghi neanche tu",
    ],
  },

  comeFunziona: {
    occhiello: "Come funziona",
    titolo: "Quattro passi. Il primo dice già tutto.",
    passi: [
      {
        nome: "Controlla",
        testo: "Scrivi numero di volo e data. Niente email, niente documenti da cercare.",
      },
      {
        nome: "Leggi il verdetto",
        testo:
          "Confrontiamo orario previsto ed effettivo su due fonti indipendenti e applichiamo il Regolamento CE 261/2004. Se il caso è incerto, te lo diciamo e non paghi.",
      },
      {
        nome: "Ricevi la pratica",
        testo:
          "Per 14,90€ prepariamo il reclamo formale: dati verificati del volo, riferimenti di legge, indirizzo corretto della compagnia che ha operato il volo.",
      },
      {
        nome: "Invii tu, incassi tu",
        testo:
          "Lo mandi dalla tua email in 2 minuti. La compensazione arriva a te, per intero. E al giorno 15 senza risposta trovi il sollecito già pronto.",
      },
    ],
    /** I 3 passi mostrati durante il check: avanzamento REALE, mai finto. */
    verifica: {
      titolo: "Cosa succede durante il check",
      passi: [
        "Cerco il volo negli archivi",
        "Confronto orario previsto e orario effettivo",
        "Applico il Regolamento CE 261/2004",
      ],
      nota: "Ogni passo è reale: interroghiamo davvero i dati del volo. Se non li troviamo, te lo diciamo.",
    },
  },

  datoOggettivo: {
    occhiello: "Il dato oggettivo",
    titolo: "Vendiamo un fatto, non una promessa.",
    testo:
      "Tutto parte da un dato: a che ora è atterrato davvero il tuo volo. Da solo non lo trovi più, soprattutto dopo anni. Noi sì, e lo verifichiamo due volte.",
    punti: [
      {
        titolo: "Due fonti, non una",
        testo:
          "Confrontiamo due archivi indipendenti di dati di volo. Se non concordano, il caso diventa incerto e non ti vendiamo niente.",
      },
      {
        titolo: "La prova resta",
        testo:
          "Archiviamo il dato originale, non una copia lavorata. Se la compagnia contesta tra sei mesi, la prova c'è.",
      },
      {
        titolo: "La compagnia giusta",
        testo:
          "Il reclamo va al vettore che ha operato il volo, non a chi ti ha venduto il biglietto. È l'errore numero uno dei reclami respinti.",
      },
    ],
    nota: "Le regole che applichiamo sono pubbliche: articoli 5, 6 e 7 del Regolamento CE 261/2004.",
    /**
     * La vetrina di COME appare un verdetto. È un caso costruito, SEMPRE
     * marcato con comune.demo (regola CLAUDE.md #3). I conti tornano con
     * lib/regole/eu261.ts: dalle 22:55 alle 02:47 passano 3h52 (232 minuti,
     * sopra la soglia dei 180) e fino a 1.500 km la fascia è 250€.
     */
    esempio: {
      etichetta: "Così appare un verdetto",
      volo: "Volo di esempio",
      tratta: "tratta fino a 1.500 km",
      occhiello: "Verifica completata",
      titolo: "Atterrato con 3h52 di ritardo.",
      previstoEtichetta: "Arrivo previsto",
      previsto: "22:55",
      effettivoEtichetta: "Arrivo effettivo",
      effettivo: "02:47",
      fascia: "250€",
      fasciaTesto: "Questa tratta rientra nella fascia da 250€.",
      verifica: "Verifichiamo se ci sono cause escludenti. Ecco cosa serve per chiederli.",
    },
  },

  garanzia: {
    occhiello: "La garanzia",
    titolo: "Se la compagnia non paga, non paghi neanche tu.",
    testo:
      "Se entro 90 giorni non ricevi nulla dalla compagnia, ti rimborsiamo per intero quello che hai pagato. E il rimborso parte da noi: non devi chiederlo.",
    punti: [
      "Rimborso integrale, non un buono",
      "Parte da noi al giorno 90, senza moduli da compilare",
      "Vale per ogni pratica, singola o famiglia",
    ],
    notaOnesta:
      "Possiamo permettercela perché vendiamo solo i casi in cui il dato è solido. Quelli incerti non li vendiamo.",
  },

  prezzi: {
    occhiello: "Prezzi",
    titolo: "Prezzo fisso. La compensazione è tutta tua.",
    sottotitolo:
      "I portali a percentuale trattengono il 35-50% della compensazione. Qui paghi una cifra fissa e tieni il 100%.",
    /** Apre il "35-50%" e lo mette in fila con i nostri prezzi. */
    notaConfronto:
      "Il 35-50% viene dai listini pubblici dei portali a percentuale (AirHelp e simili). Il conto su una fascia da 600€: a percentuale lasci da 210€ a 300€; qui la pratica costa 14,90€.",
    /** Il confronto messo in colonna. I numeri sono quelli di notaConfronto: 600 × 35% = 210; 600 - 210 = 390; 600 - 14,90 = 585,10. */
    confronto: {
      base: "Su una compensazione da 600€",
      voci: [
        { nome: "Portale al 35%", costo: "trattiene 210€", resta: "a te restano 390€" },
        { nome: "Rivoglio", costo: "costa 14,90€", resta: "a te restano 585,10€" },
      ],
    },
    piani: {
      check: {
        nome: "Il check",
        prezzo: "Gratis",
        periodo: "sempre",
        descrizione: "Scopri se il tuo volo rientra in una fascia di compensazione.",
        punti: [
          "Numero di volo e data, nient'altro",
          "Verifica su due fonti indipendenti",
          "Risposta chiara anche quando è un no",
        ],
        bottone: "Controlla gratis",
      },
      pratica: {
        nome: "Una pratica",
        prezzo: "14,90€",
        periodo: "una volta sola",
        descrizione: "Il reclamo pronto da inviare, seguito fino all'esito.",
        punti: [
          "Lettera formale con i dati verificati del volo",
          "Indirizzo e canale corretti della compagnia operativa",
          "Sollecito già pronto al giorno 15",
          "Se serve, contro-risposta e reclamo ENAC",
          "Tracker della pratica, sul web e nell'app",
          "Garanzia 90 giorni: se la compagnia non paga, non paghi neanche tu",
        ],
        bottone: "Prepara la pratica",
      },
      famiglia: {
        nome: "Famiglia",
        prezzo: "24,90€",
        periodo: "una volta sola",
        descrizione: "Stesso volo, fino a 5 passeggeri in una pratica sola.",
        punti: [
          "Tutto quello che c'è nella pratica singola",
          "Fino a 5 passeggeri dello stesso volo",
          "Una famiglia di 4 in fascia 250€ chiede 1.000€ in tutto",
        ],
        /** Apre il "1.000€". */
        nota: "Il conto: 4 passeggeri × 250€ a testa = 1.000€. La compensazione spetta a ogni passeggero, anche ai bambini con un posto pagato.",
        bottone: "Prepara la pratica famiglia",
      },
    },
    promemoria: "Nessun abbonamento, nessuna percentuale, nessun altro costo.",
  },

  retroattivo: {
    occhiello: "Retroattivo",
    titolo: "Vale anche per i voli di anni fa.",
    testo:
      "Un ritardo di due estati fa può valere quanto uno di ieri. Per ITA e Aeroitalia puoi risalire fino a 2 anni. Per vettori esteri come Ryanair e Wizz Air la finestra è più lunga, stimata in 5 o 6 anni.",
    /** Le finestre per compagnia. Il "2 anni" viene dall'art. 949 cod. nav. */
    finestre: [
      {
        compagnie: "ITA Airways, Aeroitalia",
        finestra: "2 anni",
        nota: "termine di legge italiano (art. 949 cod. nav.)",
      },
      {
        compagnie: "Ryanair, Wizz Air e altri vettori esteri",
        finestra: "5-6 anni",
        nota: "stima: dipende dal paese della compagnia",
      },
    ],
    avvertenza:
      "La scadenza è una finestra stimata, dipende dalla compagnia. La dichiariamo caso per caso, dentro la tua verifica.",
    suggerimento:
      "Non ricordi i dettagli? Cerca \"conferma volo\" nella tua casella email: numero e data saltano fuori in un minuto.",
    cta: "Controlla un volo passato",
  },

  numeri: {
    occhiello: "Il problema, in numeri",
    titolo: "Le compagnie contano sul fatto che lasci perdere.",
    voci: [
      {
        valore: "229,7 milioni",
        testo: "i passeggeri negli aeroporti italiani nel 2025",
        fonte: "ENAC, Dati di traffico 2025",
      },
      {
        valore: "meno del 10%",
        testo: "di chi subisce un disservizio ottiene la compensazione",
        fonte: "ReFly",
      },
      {
        valore: "52%",
        testo: "delle richieste respinte dalle compagnie in modo illegittimo",
        fonte: "AirHelp",
      },
      {
        valore: "3,2 miliardi €",
        testo: "di compensazioni non pagate in Europa",
        fonte: "Euronews",
      },
    ],
    chiusa: "Il primo passo per non essere in quei numeri è un check gratuito.",
  },

  faq: {
    occhiello: "Domande",
    titolo: "Risposte dirette, anche quando non ci convengono.",
    voci: [
      {
        domanda: "Posso fare tutto da solo, gratis?",
        risposta:
          "Sì, e te lo diciamo volentieri. Il reclamo alla compagnia è gratuito e non serve un avvocato: ogni vettore ha un modulo nella sezione assistenza del suo sito (cerca \"nome della compagnia + reclamo CE 261\"). Se la risposta non arriva o non ti convince, puoi presentare reclamo gratuito all'ENAC, su enac.gov.it. Noi vendiamo il tempo che risparmi, non quello che non sai.",
      },
      {
        domanda: "E allora cosa pago, esattamente?",
        risposta:
          "Tre cose. Il dato oggettivo: l'orario effettivo di atterraggio, verificato su due fonti indipendenti e archiviato come prova. Il secondo colpo: il sollecito già pronto al giorno 15, il punto esatto in cui la maggior parte delle persone lascia perdere. La garanzia: se entro 90 giorni non ricevi nulla, ti rimborsiamo per intero.",
      },
      {
        domanda: "Quanto ricevo, se va a buon fine?",
        risposta:
          "Dipende dalla tratta e dal ritardo. Il Regolamento CE 261/2004 fissa tre importi: 250€ fino a 1.500 km, 400€ fino a 3.500 km, 600€ oltre i 3.500 km (ridotto a 300€ se sul lungo raggio il ritardo resta tra 3 e 4 ore). Il check ti dice subito la fascia del tuo volo. La compensazione arriva tutta a te: non tratteniamo nulla.",
      },
      {
        domanda: "E se la compagnia dice che era maltempo o sciopero?",
        risposta:
          "Alcune circostanze eccezionali escludono davvero la compensazione, ed è giusto dirlo. Per questo il verdetto ti indica la fascia e le cause escludenti da verificare, mai una promessa. Se il tuo caso è incerto, non ti facciamo pagare. E se la compagnia rifiuta con una motivazione debole, al giorno 30 trovi contro-risposta e reclamo ENAC già pronti.",
      },
      {
        domanda: "Siete un'agenzia di reclami? Devo cedervi il credito?",
        risposta:
          "No. Rivoglio genera documenti: niente mandato, niente cessione del credito, niente percentuali. Il reclamo lo invii tu dalla tua email e la compensazione arriva direttamente a te. Con le compagnie ostili agli intermediari è anche un vantaggio: la richiesta arriva dal passeggero, non da una società.",
      },
      {
        domanda: "Fino a quando posso fare richiesta?",
        risposta:
          "Dipende dalla compagnia. Per ITA e Aeroitalia la finestra è di 2 anni; per vettori esteri come Ryanair e Wizz Air è più lunga, stimata in 5 o 6 anni. È una stima, e la dichiariamo caso per caso: nella tua verifica trovi la data indicativa di scadenza.",
      },
      {
        domanda: "Quali voli posso controllare?",
        risposta:
          "Oggi verifichiamo i ritardi di 3 ore o più all'arrivo, sui voli coperti dal Regolamento CE 261/2004: in partenza da un aeroporto UE, o in arrivo nell'UE con una compagnia europea. Cancellazioni e negato imbarco arrivano a breve. Poi bagagli e treni.",
      },
      {
        domanda: "Che fine fanno i miei dati?",
        risposta:
          "Il check non chiede chi sei: bastano numero di volo e data. L'email te la chiediamo solo dopo, se vuoi salvare la pratica, e la usiamo solo per quella. L'Osservatorio è una iscrizione a parte e si annulla con un clic.",
      },
    ],
  },

  osservatorio: {
    occhiello: "La newsletter",
    titolo: "L'Osservatorio dei Disservizi",
    testo:
      "Ogni settimana, i 10 voli più in ritardo sui cieli italiani, presi dai dati che verifichiamo per i check. Una email a settimana, si annulla con un clic.",
    campoEmail: {
      etichetta: "La tua email",
      segnaposto: "nome@esempio.it",
    },
    bottone: "Iscrivimi",
    conferma: "Fatto. La prossima uscita arriva nella tua casella.",
    nota: "Solo l'Osservatorio, niente promozioni.",
  },

  risultato: {
    /** IDONEO: fatto oggettivo + fascia + cose da verificare. MAI "hai diritto a". */
    idoneo: {
      occhiello: "Verifica completata",
      titoloTemplate: "Il tuo volo è atterrato con {ritardo} di ritardo.",
      fattoTemplate:
        "Volo {volo} del {data}: atterrato alle {oraEffettiva} invece delle {oraPrevista}.",
      /** Quando gli orari archiviati non ci sono più: il ritardo verificato resta. */
      fattoBreveTemplate: "Volo {volo} del {data}: ritardo verificato di {ritardo}.",
      fasciaTemplate: "Questa tratta rientra nella fascia da {importo}.",
      verifica: "Verifichiamo se ci sono cause escludenti. Ecco cosa serve per chiederli.",
      /** La fascia è per ogni passeggero: una famiglia moltiplica. */
      perPasseggero: "a passeggero",
      notaOrari: "Orari in ora italiana.",
      scadenzaTitolo: "Fino a quando puoi chiedere",
      /** La scadenza è SEMPRE una stima dichiarata (SPEC §4). */
      scadenzaTemplate: "Secondo la nostra stima, fino al {data}.",
      /** Apre l'importo della fascia. */
      comeNasceLaCifra: {
        titolo: "Come nasce questa cifra",
        testo:
          "Il Regolamento CE 261/2004 fissa gli importi per distanza: 250€ fino a 1.500 km, 400€ fino a 3.500 km, 600€ oltre (ridotto a 300€ se sul lungo raggio il ritardo resta tra 3 e 4 ore).",
        trattaTemplate: "La tua tratta: {distanza} km.",
      },
      cosaServe: [
        "La carta d'imbarco o l'email di conferma",
        "2 minuti per inviare il reclamo dalla tua email",
        "Il resto lo prepariamo noi",
      ],
      controlloUmano:
        "Prima del pagamento una persona ricontrolla i dati del volo. Se qualcosa non torna, non paghi.",
      /** Shadow mode (SPEC §4): al posto dei bottoni finché l'umano non conferma. */
      shadow:
        "Un controllo umano conferma il verdetto entro poche ore: lascia l'email e ti scriviamo noi.",
      cta: "Prepara la pratica a 14,90€",
      ctaFamiglia: "Eravate in più sullo stesso volo? Fino a 5 passeggeri a 24,90€",
      garanziaBreve: "Se la compagnia non paga, non paghi neanche tu.",
      /** Onestà quando i link Polar non sono configurati o il caso è demo. */
      checkoutNonAttivo:
        "Il pagamento non è ancora attivo. Lascia l'email qui sopra: ti scriviamo appena lo è.",
      checkoutDemo: "Questo è un esempio dimostrativo: il pagamento è spento.",
    },

    /** INCERTO: non si vende MAI. Si spiega e ci si ferma. */
    incerto: {
      occhiello: "Verifica completata",
      titolo: "Il dato non è abbastanza solido. Qui ci fermiamo.",
      motivi: {
        fontiDiscordanti:
          "Le nostre due fonti non concordano sugli orari di questo volo.",
        datoMancante:
          "Non abbiamo trovato l'orario effettivo di atterraggio di questo volo.",
      },
      testo:
        "Vendiamo solo su fatti verificati. Quando il fatto non è certo, non ti facciamo pagare.",
      alternativa:
        "Puoi comunque fare reclamo da solo, gratis: il modulo è nella sezione assistenza del sito della compagnia.",
      avviso: {
        testo: "Se il dato si sblocca, ti avvisiamo noi.",
        campoEmail: {
          etichetta: "La tua email",
          segnaposto: "nome@esempio.it",
        },
        bottone: "Avvisami",
        conferma: "Fatto. Se il dato arriva, lo sai per primo.",
      },
      cta: "Controlla un altro volo",
    },

    /** NON IDONEO: risposta chiara, gratis, saluto pulito. */
    nonIdoneo: {
      occhiello: "Verifica completata",
      titolo: "Per questo volo non risulta una compensazione.",
      fattoTemplate:
        "Volo {volo} del {data}: atterrato con {ritardo} di ritardo. La soglia del Regolamento CE 261/2004 è di 3 ore all'arrivo.",
      fattoPuntuale: "Volo {volo} del {data}: atterrato in orario.",
      saluto:
        "Meglio così. Il check resta gratis: se un altro volo ti è andato peggio, controllalo.",
      cta: "Controlla un altro volo",
      linkPromemoria: "Questo risultato resta a questo link: salvalo se ti serve.",
      suggerimentoOsservatorio:
        "Se vuoi tenere d'occhio i cieli, l'Osservatorio esce una volta a settimana.",
    },

    /** Il link porta a un controllo che non esiste (o non esiste più). */
    nonTrovata: {
      titolo: "Questo controllo non lo troviamo.",
      testo: "Il link può essere sbagliato o vecchio. Il check è gratis: rifallo in 30 secondi.",
      cta: "Controlla un volo",
    },

    /** Guasto temporaneo dal nostro lato: il link resta buono. */
    nonDisponibile: {
      titolo: "Il risultato ora non si apre.",
      testo:
        "C'è un problema tecnico dal nostro lato. Il link resta valido: riprova tra qualche minuto.",
    },
  },

  /** Arriva DOPO il reveal, mai prima (SPEC §3: regola d'oro del funnel). */
  catturaEmail: {
    titolo: "Ti salvo la pratica.",
    testo:
      "Lascia l'email: ti mando il riepilogo del volo e il link per riprendere da qui, anche da un altro dispositivo.",
    campo: {
      etichetta: "La tua email",
      segnaposto: "nome@esempio.it",
    },
    bottone: "Salva e continua",
    rassicurazione: "La usiamo solo per la tua pratica. Niente pubblicità.",
    conferma: "Fatto. Riepilogo in casella: ora prepariamo il reclamo.",
    /** Sugli esempi dimostrativi non c'è niente da salvare, e lo si dice. */
    demoNota: "Questo è un esempio dimostrativo: non c'è una pratica da salvare.",
  },

  condivisione: {
    titolo: "C'era qualcuno con te su quel volo?",
    didascalia: "Il check è gratis e la compensazione spetta a ogni passeggero.",
    /** La card che si condivide con un tocco. */
    card: {
      titoloTemplate: "Fascia da {importo}",
      sottotitoloTemplate: "Volo {volo}, atterrato con {ritardo} di ritardo",
      piede: "Controlla il tuo gratis su Rivoglio",
    },
    bottone: "Condividi la card",
    /** Dove navigator.share non c'è, si copia negli appunti e lo si dice. */
    copiato: "Testo copiato. Incollalo dove vuoi.",
    nonRiuscita: "Non riesco a copiare da qui. Condividi il link dalla barra del browser.",
    /** Testo pronto per la condivisione; il link lo aggiunge il codice. */
    testoTemplate:
      "Il mio volo {volo} è atterrato con {ritardo} di ritardo: fascia da {importo} secondo il Regolamento CE 261/2004. Controlla il tuo, è gratis:",
  },

  /** Il tracker della pratica: stessi stati della macchina in lib/pratiche. */
  pratica: {
    titolo: "La tua pratica",
    sottotitoloTemplate: "Volo {volo} del {data} · fascia da {importo}",
    stati: {
      creata: {
        nome: "Creata",
        descrizione: "La pratica esiste. Completa il pagamento e generiamo il reclamo.",
      },
      pagata: {
        nome: "Pagata",
        descrizione:
          "Pagamento ricevuto. Carica un documento del volo e la lettera è pronta.",
      },
      documenti: {
        nome: "Documenti",
        descrizione:
          "Carica la carta d'imbarco o l'email di conferma. Basta una foto leggibile.",
      },
      inviata: {
        nome: "Inviata",
        descrizione:
          "Reclamo inviato alla compagnia. Se al giorno 15 non è arrivata risposta, qui trovi il sollecito già pronto.",
      },
      sollecito: {
        nome: "Sollecito",
        descrizione:
          "Giorno 15, nessuna risposta: il sollecito è pronto. È il passaggio che la maggior parte delle persone salta. Tu no.",
      },
      enac: {
        nome: "ENAC",
        descrizione:
          "La compagnia rifiuta o tace: contro-risposta e reclamo ENAC pronti da inviare.",
      },
      esito: {
        nome: "Esito",
        descrizione:
          "Pratica chiusa. Dicci com'è andata: ogni esito rende più preciso il check di tutti.",
      },
    },
    azioni: {
      copiaTesto: "Copia il testo dell'email",
      stampa: "Stampa la lettera",
      caricaDocumento: "Carica il documento",
      confermaInvio: "L'ho inviata",
      segnalaEsito: "Com'è andata?",
    },
    istruzioniInvio: {
      titolo: "Come si invia, in 2 minuti",
      passi: [
        "Copia il testo del reclamo qui sotto",
        "Incollalo in una email dalla tua casella e aggiungi gli allegati indicati",
        "Invia all'indirizzo della compagnia che trovi nella lettera",
        "Torna qui e premi \"L'ho inviata\": da lì partono i promemoria",
      ],
      perche:
        "Il reclamo parte dalla tua email, a tuo nome. Le compagnie rispondono al passeggero, non a un intermediario.",
    },
    esiti: {
      pagato: "La compagnia ha pagato",
      rifiutato: "La compagnia ha rifiutato",
      niente: "Nessuna risposta",
    },
    garanziaPromemoria:
      "Garanzia attiva: se entro il giorno 90 non ricevi nulla, il rimborso parte da noi.",
  },

  /** L'invito breve che chiude la pagina, subito prima del footer. */
  invito: {
    titolo: "Quel ritardo può valere ancora qualcosa.",
    corsivo: "Scoprilo adesso.",
    testo: "Trenta secondi, niente email, nessun conto da creare. Il check è gratis, sempre.",
    cta: "Controlla il tuo volo",
  },

  footer: {
    frase: "Rivoglio è lo scanner dei rimborsi. Oggi i voli. Presto bagagli e treni.",
    colonne: {
      prodotto: {
        titolo: "Prodotto",
        voci: [
          { testo: "Il check gratuito", ancora: "#controllo" },
          { testo: "Come funziona", ancora: "#come-funziona" },
          { testo: "Prezzi", ancora: "#prezzi" },
          { testo: "Osservatorio", ancora: "#osservatorio" },
        ],
      },
      trasparenza: {
        titolo: "Trasparenza",
        voci: [
          { testo: "Il dato oggettivo", ancora: "#dato-oggettivo" },
          { testo: "La garanzia", ancora: "#garanzia" },
          { testo: "I numeri e le fonti", ancora: "#numeri" },
          { testo: "Voli di anni fa", ancora: "#retroattivo" },
        ],
      },
      domande: {
        titolo: "Domande",
        voci: [
          { testo: "Posso fare da solo, gratis?", ancora: "#domande" },
          { testo: "Cosa pago, esattamente?", ancora: "#domande" },
          { testo: "Tutte le risposte", ancora: "#domande" },
        ],
      },
      legale: {
        titolo: "Note legali",
        voci: [
          { testo: "Condizioni d'uso", ancora: "/condizioni" },
          { testo: "Privacy", ancora: "/privacy" },
        ],
      },
    },
    app: {
      titolo: "L'app per seguire la pratica",
      presto: "Presto su",
    },
    disclaimer:
      "Rivoglio genera documenti a partire da dati di volo verificati. Non è un intermediario, non offre consulenza legale, non incassa per conto tuo e non chiede la cessione del credito. Il reclamo lo invii tu, dalla tua email. Gli importi indicati sono le fasce del Regolamento CE 261/2004: l'esito della richiesta dipende dalla compagnia.",
    copyright: "© 2026 Rivoglio",
  },
} as const;

export type Copy = typeof COPY;
