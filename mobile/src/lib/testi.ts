/**
 * Ogni stringa che l'app mostra vive qui (contratto in PROGETTO.md).
 * Solo dati, nessuna funzione. Dove serve un valore, la stringa porta un
 * segnaposto fra graffe, es. "Fino a {soglia} a testa": la schermata lo
 * sostituisce col numero già formattato da `formati.ts` (euro, oreLeggibili,
 * dataBreve). I titoli sono oggetti { prima, corsivo, dopo? } per <Titolo />;
 * la punteggiatura che segue la parola in corsivo sta dentro `corsivo`,
 * perché il componente aggiunge uno spazio prima di `dopo`.
 */

export const TESTI = {
  /* ---- IL CHECK: la prima schermata dell'app, senza account ---- */
  check: {
    occhiello: "Lo scanner dei rimborsi",
    titolo: { prima: "Hai preso un volo", corsivo: "nell'ultimo anno?" },
    sottotitolo: "Forse ti devono fino a 600€. Controllalo gratis in 30 secondi.",
    volo: {
      etichetta: "Numero del volo",
      segnaposto: "FR 8321",
      aiuto: "Lo trovi sulla carta d'imbarco o nell'email di conferma.",
    },
    data: {
      etichetta: "Data del volo",
      segnaposto: "GG/MM/AAAA",
      aiuto: "Il giorno della partenza.",
    },
    bottone: "Controlla gratis",
    rassicurazione: "Niente email, niente account. Il risultato lo vedi subito.",
    punti: [
      "Il check è gratis, sempre",
      "Nessuna percentuale sulla compensazione",
      "Se la compagnia non paga, non paghi neanche tu",
    ],
    errori: {
      voloMancante: "Scrivi il numero del volo.",
      dataMancante: "Scegli la data del volo.",
      dataStrana: "Scrivi la data come GG/MM/AAAA.",
    },
    entra: "Ho già un account",
    /* I due modi di dire qual è il volo. Il primo è quello per tutti: il
       numero di volo lo sa a memoria una persona su dieci. */
    modo: {
      tratta: "Non so il numero",
      numero: "So il numero",
    },
  },

  /* ---- LA CARTA D'IMBARCO FOTOGRAFATA: la strada più corta ---- */
  carta: {
    titolo: "Hai la carta d'imbarco?",
    testo: "Fotografala e compilo io volo e data. Poi controlli quello che ho letto.",
    scatta: "Fotografa",
    galleria: "Dalla galleria",
    attesa: "Sto leggendo la carta d'imbarco",
    privacy: "La foto non viene salvata: la leggo e la butto.",
    // {volo} è il numero letto, {data} il giorno già scritto per esteso.
    letto: "Letto dalla carta d'imbarco: volo {volo} del {data}. Controlla che sia giusto.",
    lettoSoloVolo: "Dalla carta d'imbarco ho letto il volo {volo}. La data scrivila tu.",
    lettoSoloData: "Dalla carta d'imbarco ho letto il giorno {data}. Il volo scrivilo tu.",
  },

  /* ---- LA RICERCA PER TRATTA: si dice da dove a dove, non il numero ---- */
  tratta: {
    da: { etichetta: "Da dove sei partito", segnaposto: "Città o aeroporto" },
    a: { etichetta: "Dove sei arrivato", segnaposto: "Città o aeroporto" },
    data: {
      etichetta: "Che giorno",
      segnaposto: "GG/MM/AAAA",
      aiuto: "Il giorno della partenza.",
    },
    bottone: "Cerca il volo",
    errori: {
      partenza: "Scegli da dove sei partito.",
      arrivo: "Scegli dove sei arrivato.",
      stessoScalo: "Partenza e arrivo sono lo stesso aeroporto.",
      data: "Scegli il giorno del volo.",
      dataStrana: "Scrivi la data come GG/MM/AAAA.",
    },
    elenco: {
      titolo: "Qual era il tuo?",
      sottotitolo: "Gli orari sono quelli di partenza previsti. Tocca il tuo volo.",
      arrivo: "arrivo",
      cancellato: "cancellato",
      demo: "Elenco dimostrativo: manca la chiave del fornitore dati.",
    },
    nessuno: {
      titolo: "Nessun volo trovato su questa tratta.",
      testo:
        "Può essere l'aeroporto sbagliato (molte città ne hanno più di uno) o il giorno sbagliato. Prova a cambiarlo, oppure passa al numero del volo.",
    },
  },

  /* ---- I TUOI VOLI: salvati sul telefono, si ricontrollano ---- */
  mieiVoli: {
    titolo: "I tuoi voli",
    sottotitolo:
      "Restano qui. Un volo appena partito non ha ancora un esito: ricontrollalo il giorno dopo.",
    perPasseggero: "a passeggero",
    ritardo: "Ritardo",
    controlla: "Controlla",
    ricontrolla: "Ricontrolla",
    togli: "Togli questo volo",
    esiti: {
      incerto: "Caso incerto: non si vende",
      nonIdoneo: "Nessuna compensazione",
      daControllare: "Non ancora controllato.",
    },
  },

  /* ---- GLI AVVISI: il server ricontrolla, il telefono suona ----
     Regola dettata da Valerio: mai il numero di volo, mai una promessa.
     Si parla di tratta e di ore, e si dice cosa succede davvero. */
  avvisi: {
    ospite: {
      titolo: "Ti avviso io quando c'è un esito",
      testo:
        "I voli che salvi li ricontrollo il giorno dopo e ti scrivo solo se rientrano in una fascia. Per farlo devo sapere che sono i tuoi: serve l'email. Il check resta libero.",
      azione: "Entra e attiva gli avvisi",
    },
    da_attivare: {
      titolo: "Ti avviso io quando c'è un esito",
      testo:
        "Ricontrollo i tuoi voli il giorno dopo la partenza e ti scrivo solo se rientrano in una fascia. Niente altro: nessuna pubblicità, nessun promemoria inutile.",
      azione: "Attiva le notifiche",
    },
    negato: {
      titolo: "Notifiche spente dal telefono",
      testo:
        "Le hai bloccate nelle impostazioni del telefono. Puoi riaccenderle da lì quando vuoi. Intanto i tuoi voli restano salvati: li ricontrolli da qui.",
    },
    attivi: {
      titolo: "Avvisi attivi",
      testo:
        "Ricontrollo i tuoi voli la mattina dopo la partenza. Ti scrivo solo se rientrano in una fascia, e ti dico la tratta e il ritardo.",
    },
  },

  /* ---- IL VERDETTO: tre esiti, mai una promessa ---- */
  verdetto: {
    idoneo: {
      occhiello: "Verifica completata",
      titolo: { prima: "Il tuo volo è atterrato", corsivo: "in ritardo." },
      fasciaEtichetta: "Fascia di compensazione",
      perPasseggero: "per passeggero",
      nota: "Verifichiamo se ci sono cause escludenti. La pratica si apre dal sito.",
    },
    incerto: {
      occhiello: "Verifica completata",
      titolo: { prima: "Il dato non è", corsivo: "abbastanza solido." },
      nota: "Vendiamo solo su fatti verificati. Quando il fatto non è certo, non ti facciamo pagare.",
    },
    nonIdoneo: {
      occhiello: "Verifica completata",
      titolo: { prima: "Per questo volo non risulta", corsivo: "una compensazione." },
      nota: "Meglio così. Il check resta gratis: se un altro volo ti è andato peggio, controllalo.",
    },
    previsto: "Arrivo previsto",
    effettivo: "Arrivo effettivo",
    ritardo: "Ritardo all'arrivo",
    demo: "Esempio dimostrativo",
    altroVolo: "Controlla un altro volo",
    apriPratica: "Apri la pratica dal sito",
  },

  comune: {
    marchio: "Rivoglio",
    tagline: "Riprenditi i soldi che ti devono.",
    avanti: "Avanti",
    indietro: "Torna indietro",
    annulla: "Annulla",
    riprova: "Riprova",
    chiudi: "Chiudi",
    caricamento: "Un attimo",
    // Etichetta di accessibilità dell'avanzamento: {passo} e {totale} sono numeri.
    passoDi: "Passo {passo} di {totale}",
    tab: {
      controlla: "Controlla",
      pratiche: "Pratiche",
      profilo: "Profilo",
    },
  },

  onboarding: {
    index: {
      titolo: { prima: "La tua", corsivo: "fuga,", dopo: "al prezzo giusto." },
      sottotitolo:
        "Imposti da dove parti, la soglia a testa e le ore di auto. Quando esiste una micro-vacanza vera sotto la soglia, ti avviso io. Col conto già fatto.",
      bottoni: { inizia: "Inizia", accedi: "Ho già un account" },
    },
    valore: {
      titolo: { prima: "Il conto è", corsivo: "aperto." },
      sottotitolo:
        "Alloggio più auto, diviso per chi parte. Ogni numero si apre: vedi come l'ho calcolato.",
      // Nome mostrato sulla card di esempio: dice subito che non è un'offerta.
      struttura: "Struttura di esempio",
      nota: "Questo è un esempio dimostrativo. Le destinazioni vere arrivano con un prezzo verificato e il link della struttura.",
      bottoni: { avanti: "Avanti" },
    },
    criteri: {
      titolo: { prima: "Dimmi cosa", corsivo: "cerchi." },
      sottotitolo:
        "Tre limiti, li cambi quando vuoi. L'account per ora non serve.",
      partenza: {
        etichetta: "Da dove parti",
        segnaposto: "Scegli il comune",
        nota: "Serve per calcolare chilometri, benzina e pedaggi. Non la diamo a nessuno.",
        nessuna: "Questa città non c'è ancora fra le partenze coperte. Scegline una vicina.",
      },
      soglia: {
        etichetta: "Quanto vuoi spendere a testa",
        nota: "Tutto compreso: alloggio più auto. Non solo la camera.",
      },
      ore: {
        etichetta: "Quante ore di auto al massimo",
        nota: "Sola andata. Ragioniamo in ore, non in chilometri.",
      },
      bottoni: { avanti: "Avanti" },
    },
    aggancio: {
      titolo: { prima: "Al resto penso", corsivo: "io." },
      sottotitolo:
        "Con questi limiti ti avviso quando esiste una destinazione vera. Le prime 3 sono gratis.",
      // {comune} è il nome del comune, {soglia} da euro(), {ore} da oreLeggibili().
      riepilogo: {
        partenza: "Parti da {comune}",
        soglia: "Fino a {soglia} a testa",
        ore: "Massimo {ore} di auto",
        // Valori di partenza della prima ricerca: {persone} e {notti} sono numeri.
        resto: "Partite in {persone}, fino a {notti} notti. Lo cambi quando vuoi.",
      },
      bottoni: { avanti: "Va bene, andiamo", correggi: "Voglio cambiare qualcosa" },
    },
    registrati: {
      titolo: { prima: "Dove ti mando le", corsivo: "destinazioni?" },
      sottotitolo:
        "Ti scrivo solo quando c'è una destinazione sotto la tua soglia. Per tutto il resto, silenzio.",
      // Quando l'account nasce ma il salvataggio dei criteri fallisce:
      // niente panico, si riprova senza ricreare niente.
      criteriNonSalvati: "L'account è pronto, ma non sono riuscito a salvare i tuoi criteri.",
      bottoni: { crea: "Crea l'account", accedi: "Ho già un account" },
    },
    avvisi: {
      titolo: { prima: "Senza avviso non lo", corsivo: "sai." },
      sottotitolo:
        "1 credito vale 1 destinazione, e una destinazione buona dura poco. Se non ti avviso quando esiste, la scopri quando è finita.",
      nota: "Se preferisci di no, va bene lo stesso: ricevi tutto per email.",
      bottoni: { attiva: "Attiva gli avvisi", nonOra: "Non ora" },
    },
  },

  // `campi` e `validazione` li usa anche il passo registrati dell'onboarding:
  // stessi moduli, stesse parole.
  /* ---- il profilo dell'app (riscritto per Rivoglio, 8/08) ---- */
  profiloApp: {
    titolo: { prima: "Il tuo", corsivo: "profilo." },
    entratoCome: "Sei entrato come",
    esci: "Esci dall'account",
    email: "valerio@artecai.it",
    ospite: {
      titolo: "Non sei entrato",
      testo:
        "Il check dei voli funziona lo stesso. L'account serve solo a ritrovare le pratiche che hai aperto.",
      azione: "Entra",
    },
    voci: {
      sito: "Apri Rivoglio sul sito",
      supporto: "Scrivici",
      privacy: "Privacy",
      condizioni: "Condizioni d'uso",
    },
    piede:
      "Rivoglio non è un intermediario: prepara i documenti, il reclamo lo invii tu e la compensazione arriva a te.",
  },

  /* ---- accesso e registrazione dell'app (schermata unica, 8/08) ---- */
  accessoApp: {
    entra: {
      titolo: { prima: "Entra nel tuo", corsivo: "account." },
      testo: "Serve solo per seguire le pratiche. Il check dei voli resta libero.",
      bottone: "Entra",
    },
    registra: {
      titolo: { prima: "Crea il tuo", corsivo: "account." },
      testo: "Email e password, nient'altro. Serve per ritrovare le tue pratiche.",
      bottone: "Crea l'account",
    },
    email: "Email",
    password: "Password",
    errori: { campiVuoti: "Scrivi email e password." },
    nonHaiAccount: "Non ho un account",
    haiAccount: "Ho già un account",
  },

  accesso: {
    titolo: { prima: "Entra nel tuo", corsivo: "account." },
    sottotitolo: "Email e password con cui ti sei registrato.",
    campi: {
      email: "Email",
      emailSegnaposto: "nome@esempio.it",
      password: "Password",
      passwordNota: "Almeno 8 caratteri.",
    },
    validazione: {
      email: "Controlla l'indirizzo email.",
      passwordVuota: "Scrivi la password.",
      passwordCorta: "La password deve avere almeno 8 caratteri.",
    },
    bottoni: { entra: "Entra", registrati: "Non ho un account" },
  },

  // La tab principale dopo il pivot: le pratiche di rimborso. Stesse parole
  // del sito (lib/copy.ts, sezione pratica): un solo vocabolario.
  pratiche: {
    titolo: { prima: "Le tue", corsivo: "pratiche." },
    sottotitolo: "Ogni reclamo che hai aperto, con il punto in cui si trova.",
    // {volo} è il codice del volo, {data} da dataBreve().
    volo: "Volo {volo} del {data}",
    // Quando il volo agganciato non è leggibile: si dice, non si inventa.
    voloMancante: "Pratica senza volo agganciato",
    // {data} da dataBreve(): quando è stata aperta la pratica.
    aperta: "Aperta {data}",
    // {importo} da euro(). La fonte sta in `fasciaFonte`: ogni numero è citato.
    fascia: "Fascia da {importo}",
    fasciaFonte: "Importo del Regolamento CE 261/2004, per passeggero",
    fasciaDaConfermare: "Fascia da confermare",
    /** Etichette degli stati della macchina (lib/pratiche del sito). */
    stati: {
      creata: "Creata",
      pagata: "Pagata",
      pronta: "Pronta da inviare",
      inviata: "Inviata",
      sollecito: "Sollecito",
      enac: "ENAC",
      esito_pagata: "Pagata dalla compagnia",
      esito_rifiutata: "Rifiutata",
      rimborsata: "Rimborsata",
    },
    // Il check vive sul sito, senza login (SPEC §3): l'app segue, non apre.
    vuoto: {
      titolo: "Non hai ancora nessuna pratica.",
      testo:
        "Si parte sempre dal check, sul sito: numero di volo e data, gratis. Se il volo rientra in una fascia, da lì apri la pratica e la segui qui.",
      azione: "Controlla un volo sul sito",
    },
    /** Chi non è entrato: il check resta libero, le pratiche no. */
    ospite: {
      titolo: "Qui trovi le tue pratiche.",
      testo:
        "Il check dei voli è libero e non serve l'account. L'account serve solo per ritrovare le pratiche che hai aperto e vedere a che punto sono.",
      azione: "Entra",
    },
    errore: "Non riesco a leggere le tue pratiche. Riprova fra qualche minuto.",
  },

  destinazioni: {
    titolo: { prima: "Le tue", corsivo: "destinazioni." },
    // Pillola sulle destinazioni non ancora aperte.
    nuova: "Nuova",
    // {data} da dataBreve().
    ricevuta: "Ricevuta {data}",
    // {comune} è la partenza del profilo.
    saluto: "Parti da {comune}.",
    // Quando il profilo non ha coordinate: l'auto non si può calcolare.
    senzaPartenza:
      "Qui vedi solo l'alloggio. Dimmi da dove parti nel profilo e aggiungo l'auto al conto.",
    alloggioATesta: "Alloggio a testa",
    autoATesta: "Auto a testa (stima)",
    totaleATesta: "Totale a testa",
    // {prezzo} da euro(): il prezzo dell'alloggio prima della divisione.
    alloggioIntero: "Alloggio intero: {prezzo}",
    // {arrivo} e {ritorno} da dataBreve().
    date: "Dal {arrivo} al {ritorno}",
    vuoto: {
      titolo: "Per ora, silenzio.",
      testo:
        "Quando esiste una destinazione sotto la tua soglia te la segnalo io. Fino ad allora niente rumore: nessuna offerta tanto per riempire.",
    },
    oggi: {
      titolo: "Dove arrivi oggi",
      nota: "Stima del viaggio, non un'offerta. Quando una struttura vera ci sta dentro, ti avviso.",
      // Pillola su ogni proposta: è un calcolo, non un'offerta prenotabile.
      stima: "Stima",
      // {km} intero, {ore} da oreLeggibili(), {costo} e {resto} da euro().
      km: "{km} km",
      auto: "{ore} di auto",
      autoATesta: "{costo} di auto a testa",
      resta: "Ti restano {resto} a notte per dormire",
    },
    vediOfferta: "Vedi l'offerta",
    stimaAuto:
      "Il costo dell'auto è una stima. Aprila e vedi ogni voce: chilometri, benzina, pedaggi.",
    avvisoPrezzo:
      "Prezzo verificato quando te l'ho segnalata. Sulla pagina della struttura può cambiare: controlla prima di prenotare.",
  },

  ricerche: {
    titolo: { prima: "Le tue", corsivo: "ricerche." },
    stato: { inAscolto: "In ascolto", inPausa: "In pausa" },
    // {soglia} da euro(), {ore} da oreLeggibili(), {min}/{max}/{n} numeri interi.
    scheda: {
      finoA: "Fino a {soglia} a testa",
      maxAuto: "max {ore} di auto",
      unaNotte: "1 notte",
      nottiUguali: "{n} notti",
      notti: "{min}-{max} notti",
      unaPersona: "1 persona",
      persone: "{n} persone",
      tuttiITipi: "Tutto",
    },
    azioni: {
      pausa: "Metti in pausa",
      riprendi: "Riaccendi",
      cancella: "Cancella",
      // Titolo dell'avviso di conferma: il messaggio è `confermaCancella`.
      confermaTitolo: "Cancello questa ricerca?",
      confermaCancella: "Premi di nuovo per cancellarla davvero.",
    },
    vuoto: {
      titolo: "Ancora nessuna ricerca.",
      testo:
        "Dimmi soglia, ore di auto e notti. Da lì ascolto io, e ti avviso solo quando c'è una destinazione che ci sta dentro.",
      azione: "Crea la prima ricerca",
    },
    nuovaBottone: "Nuova ricerca",
    nuova: {
      titolo: { prima: "Una nuova", corsivo: "ricerca." },
      sottotitolo: "La metti in pausa o la cancelli quando vuoi.",
      campi: {
        soglia: "Soglia a testa",
        sogliaNota: "Tutto compreso: alloggio più auto.",
        ore: "Ore di auto al massimo",
        oreNota: "Sola andata.",
        notti: "Notti",
        persone: "Persone",
        personeNota: "L'auto si divide: più siete, meno costa a testa.",
        tipi: "Che voglia hai",
        tipiNota:
          "Puoi sceglierne più di una, o nessuna. Più filtri metti, meno destinazioni ricevi.",
      },
      bottoni: { crea: "Attiva la ricerca", annulla: "Annulla" },
      // Etichette di accessibilità del più e del meno: {campo} è l'etichetta del campo.
      aumenta: "Aumenta {campo}",
      diminuisci: "Diminuisci {campo}",
    },
    // Stessi limiti validati in dati.ts: budget 30-600, ore 0,5-8, notti 1-3, persone 1-8.
    limiti: {
      soglia: "La soglia va da 30€ a 600€ a testa.",
      ore: "Le ore di auto vanno da mezz'ora a 8.",
      notti: "Le notti vanno da 1 a 3.",
      persone: "Si parte da soli o al massimo in 8.",
    },
  },

  profilo: {
    titolo: { prima: "Il tuo", corsivo: "profilo." },
    crediti: {
      etichetta: "Crediti",
      spiegazione:
        "I crediti vengono dalla prima versione dell'app. Per le pratiche non servono: il check del volo è gratis, sempre.",
      finiti:
        "Crediti a zero. Non cambia niente: nessun addebito automatico, mai.",
    },
    // Niente bottoni finti: si dice dove si paga davvero, cioè sul sito.
    acquisto: {
      titolo: "Pagamenti",
      stato: "Sul sito",
      testo:
        "La pratica si apre e si paga sul sito, dopo il check gratis. Dall'app non compri niente: qui la segui, passo per passo.",
    },
    tetto: {
      etichetta: "Tetto settimanale",
      // {n} è il numero massimo di avvisi a settimana.
      valore: "{n} a settimana",
      spiegazione:
        "È una promessa di spesa massima. Sopra questo numero di avvisi a settimana non parte niente, e tu non spendi niente.",
      // Etichette di accessibilità del più e del meno.
      alza: "Alza il tetto",
      abbassa: "Abbassa il tetto",
    },
    partenza: { etichetta: "Parti da", cambia: "Cambia" },
    account: { email: "Email", esci: "Esci" },
  },

  notifiche: {
    titolo: "Notifiche",
    attive: "Attive. Ti avviso qui quando parte una destinazione.",
    daChiedere: "Da attivare. Senza avviso non sai quando una destinazione esiste.",
    negate:
      "Spente dal telefono. Puoi riaccenderle nelle Impostazioni. Intanto ricevi tutto per email.",
    attiva: "Attiva le notifiche",
    emailRiserva: "Se restano spente, le destinazioni arrivano per email.",
  },

  // Mai colpevolizzare chi legge: il problema è nostro o della rete, non suo.
  errori: {
    rete: "Niente connessione in questo momento. Riprova appena torna la rete: non si è perso niente.",
    sessione: "La sessione è scaduta. Entra di nuovo e ritrovi tutto com'era.",
    generico: "Qualcosa non ha funzionato. Riprova fra un attimo.",
  },
} as const;
