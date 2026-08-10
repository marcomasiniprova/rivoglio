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
    /* La testata cambia col MODO, come nella tavola di riferimento
       (6a, 7a, 7b): ogni strada ha la sua domanda, non un titolo
       generico che vale per tutte. */
    testate: {
      tratta: {
        occhiello: "Il check gratuito",
        titolo: "Che viaggio era?",
        sottotitolo: "Le città bastano. Il numero del volo, se non ce l'hai, lo trovo io.",
      },
      numero: {
        occhiello: "Il check gratuito",
        titolo: "Hai il numero del volo?",
        sottotitolo: "È la via più corta. Due campi e ho finito.",
      },
      carta: {
        occhiello: "Il check gratuito",
        titolo: "Inquadra la carta d'imbarco",
        sottotitolo: "Fotografala o prendila dalla galleria: leggo io volo e data.",
      },
    },
    volo: {
      etichetta: "Numero di volo",
      segnaposto: "FR 8321",
    },
    data: {
      etichetta: "Giorno della partenza",
      segnaposto: "GG/MM/AAAA",
    },
    /* Il riquadro che separa il numero del volo dal codice di
       prenotazione (7b): è l'errore più comune di chi ha il numero. */
    prenotazione: {
      titolo: "Non confonderlo con il codice di prenotazione",
      serve: {
        tag: "Serve questo",
        codice: "FR 8321",
        testo: "Due lettere e tre o quattro cifre. È sulla carta d'imbarco, in alto.",
      },
      non: {
        tag: "Non questo",
        codice: "Q8T2LM",
        testo: "Sei caratteri misti: è la prenotazione, e vale per tutti i tuoi voli.",
      },
    },
    bottoneTratta: "Controlla questo volo",
    bottoneNumero: "Cerca il volo",
    rassicurazione: "Il check resta gratuito.",
    punti: [
      "Il check è gratis, sempre",
      "Nessuna percentuale sulla compensazione",
      "Se la compagnia non paga, non paghi neanche tu",
    ],
    errori: {
      voloMancante: "Scrivi il numero del volo.",
      dataMancante: "Scegli la data del volo.",
      dataStrana: "Scrivi la data come GG/MM/AAAA.",
      voloDaScegliere: "Tocca il volo che hai preso, poi controlla.",
    },
    entra: "Ho già un account",
    /* I tre modi di dire qual è il volo, nell'ordine della tavola:
       la tratta per tutti, la carta per chi ce l'ha in mano, il numero
       per chi lo sa. */
    modo: {
      tratta: "Per tratta",
      carta: "Carta d'imbarco",
      numero: "Numero volo",
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
    /* La conferma dei campi letti (7a): la persona DEVE vedere cosa è
       stato letto prima che parta il check. Un verdetto su un volo letto
       male è peggio di nessun verdetto.
       ⚠️ La tavola mostra anche la riga della tratta: qui non c'è perché
       l'OCR estrae volo e data, e una riga in più sarebbe inventata. */
    conferma: {
      bollo: "Carta riconosciuta",
      domanda: "Ho letto questi campi. Sono giusti?",
      volo: "Numero di volo",
      data: "Data",
      privacy:
        "La foto non viene salvata: la leggo, prendo questi campi e la scarto. Non esce dal telefono.",
      si: "Sì, sono giusti",
      correggo: "Correggo a mano",
    },
  },

  /* ---- L'ANALISI IN CORSO: il teatro onesto, identico al sito ----
     Stesse parole di lib/copy.ts (comeFunziona.verifica): i 6 passi VERI
     dell'analisi del server. Nessuno è decorativo, la sequenza non si
     taglia mai (scelta di Valerio, 8/08). */
  analisi: {
    titolo: "Analisi in corso",
    passi: [
      "Cerco il volo negli archivi di volo",
      "Leggo l'orario di atterraggio certificato",
      "Calcolo la distanza reale della tratta",
      "Controllo scioperi e circostanze note del giorno",
      "Confronto orario previsto e orario effettivo",
      "Applico il Regolamento CE 261/2004",
    ],
    dettagli: [
      "Interrogo il tracciamento del volo",
      "Verifico che l'orario sia confermato, non stimato",
      "Distanza ortodromica fra i due aeroporti",
      "Incrocio la tabella scioperi del trasporto aereo",
      "Ritardo all'arrivo, al minuto",
      "Articoli 5, 6 e 7 del Regolamento",
    ],
    nota: "Ogni passo è reale: interroghiamo davvero i dati del volo. Se non li troviamo, te lo diciamo.",
    carta: {
      intestazione: "Carta d'imbarco",
      intestazioneEn: "Boarding pass",
      volo: "Volo",
      data: "Data",
      tratta: "Tratta",
      previsto: "Arrivo previsto",
      effettivo: "Arrivo effettivo",
      verifica: "Verifica",
      timbro: "Reg. CE 261/2004",
    },
  },

  /* ---- LA RICERCA PER TRATTA: si dice da dove a dove, non il numero ---- */
  tratta: {
    da: { etichetta: "Da dove sei partito", segnaposto: "Città o aeroporto" },
    a: { etichetta: "Dove sei arrivato", segnaposto: "Città o aeroporto" },
    data: {
      etichetta: "Giorno della partenza",
      segnaposto: "GG/MM/AAAA",
      aiuto: "Se sei atterrato dopo mezzanotte, conta il giorno del decollo.",
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
      titolo: "Quale di questi hai preso?",
      /* {n} è il numero di voli trovati quel giorno. */
      conteggio: "{n} voli quel giorno",
      conteggioUno: "1 volo quel giorno",
      /* Le frasi delle righe, come nella tavola (6a): raccontano il volo
         invece di elencare orari. {prev} ed {eff} sono orari "HH:MM".
         La frase con l'atterraggio esce SOLO se il fornitore ha dato
         l'orario aggiornato: senza, resta il previsto e basta. */
      doveva: "Doveva arrivare alle {prev}. Atterrato alle {eff}.",
      inOrario: "Arrivato alle {eff}, in orario.",
      soloPrevisto: "Arrivo previsto alle {prev}.",
      cancellato: "Cancellato.",
      // {durata} è "3 h e 52 min", nel formato unico del prodotto.
      ritardoBadge: "{durata} di ritardo",
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

  /* ---- LA WELCOME: la prima apertura dell'app ---- */
  benvenuto: {
    tagline: "Riprenditi i soldi che ti devono.",
    sottotitolo:
      "Controlli un volo in trenta secondi, coi dati certificati. Se ti spetta una fascia, la lettera è pronta.",
    salta: "Salta",
    carta: {
      titolo: "Iniziamo dal tuo volo",
      testo: "Con l'email tieni le pratiche, gli avvisi e la classifica. Oppure prima guarda com'è.",
      segnaposto: "La tua email",
      inizia: "Inizia",
      esplora: "Esplora prima l'app",
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
  /* I CASI CHE GLI ARCHIVI NON VEDONO. Stesse parole del sito
     (lib/copy.ts): volo cancellato, negato imbarco, coincidenza persa.
     Sull'app erano un vicolo cieco: usciva "incerto" e finiva li'. */
  domande: {
    cancellato: {
      occhiello: "Manca poco",
      titolo: "Due domande e ti dico se ti spetta.",
      testo:
        "Per un volo cancellato la legge guarda due cose che gli archivi non sanno: quando ti hanno avvisato e come ti hanno rimandato a destinazione. Rispondi e il verdetto si chiude.",
      preavviso: {
        domanda: "Quando ti hanno detto che il volo era cancellato?",
        aiuto: "Vale il primo avviso: email, SMS o messaggio della compagnia.",
        voci: [
          { valore: "oltre14", testo: "Più di due settimane prima" },
          { valore: "fra7e13", testo: "Fra una e due settimane prima" },
          { valore: "meno7", testo: "Meno di una settimana prima" },
          { valore: "nessuno", testo: "Nessun avviso: l'ho saputo in aeroporto" },
          { valore: "nonRicordo", testo: "Non me lo ricordo" },
        ],
      },
      alternativa: {
        domanda: "Con il volo che hai preso davvero, quanto dopo sei arrivato?",
        aiuto: "Rispetto all'ora di arrivo che c'era sul biglietto cancellato.",
        voci: [
          { valore: "nessuna", testo: "Non mi hanno dato nessun volo alternativo" },
          { valore: "entro2", testo: "Meno di 2 ore dopo" },
          { valore: "fra2e4", testo: "Fra 2 e 4 ore dopo" },
          { valore: "oltre4", testo: "Più di 4 ore dopo" },
          { valore: "nonRicordo", testo: "Non me lo ricordo" },
        ],
      },
    },
    dichiara: {
      invito: "Ti hanno lasciato a terra o hai perso una coincidenza?",
      invitoSotto:
        "Sono due casi che negli archivi non si vedono: il volo può risultare in orario mentre tu sei rimasto al gate. Se è successo a te, dimmelo e chiudo il verdetto.",
      negato: {
        scheda: "Mi hanno lasciato a terra",
        presenza: {
          domanda: "Eri al gate in orario, con la prenotazione valida?",
          voci: [
            { valore: "si", testo: "Sì, ero lì in orario" },
            { valore: "no", testo: "No, sono arrivato tardi" },
            { valore: "nonRicordo", testo: "Non me lo ricordo" },
          ],
        },
        volonta: {
          domanda: "Hai ceduto il posto in cambio di qualcosa?",
          voci: [
            { valore: "volontario", testo: "Sì, mi hanno offerto un accordo" },
            { valore: "involontario", testo: "No, mi hanno lasciato a terra e basta" },
            { valore: "nonRicordo", testo: "Non me lo ricordo" },
          ],
        },
      },
      coincidenza: {
        scheda: "Ho perso una coincidenza",
        unica: {
          domanda: "Le tratte erano su un'unica prenotazione?",
          aiuto: "Un solo codice di prenotazione per tutto il viaggio, anche con compagnie diverse.",
          voci: [
            { valore: "unica", testo: "Sì, un'unica prenotazione" },
            { valore: "separati", testo: "No, biglietti comprati separatamente" },
            { valore: "nonRicordo", testo: "Non me lo ricordo" },
          ],
        },
        ritardo: {
          domanda: "Alla destinazione finale, quanto dopo sei arrivato?",
          voci: [
            { valore: "entro3", testo: "Meno di 3 ore dopo" },
            { valore: "oltre3", testo: "3 ore o più dopo" },
            { valore: "nonRicordo", testo: "Non me lo ricordo" },
          ],
        },
        destinazione: {
          domanda: "Qual era la destinazione finale del viaggio?",
          segnaposto: "Città o aeroporto",
        },
      },
      bottone: "Vedi il verdetto",
      nota: "Le risposte restano sulla tua verifica. Il check resta gratuito.",
      notaDemo: "Esempio dimostrativo: il verdetto qui non vale per una pratica vera.",
    },
    chiuso: "Ecco com'è andata.",
    attesa: "Un attimo.",
  },

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

    /* ------------------------------------------------------------------
       IL VERDETTO RIFATTO (giro #49), sul riferimento della board.
       Quello che cambia rispetto a prima: l'importo diventa il
       protagonista, e accanto compare la DIMOSTRAZIONE. Non basta dire
       "250€": si mostra da dove esce, cioè le tre fasce con la tua
       accesa e la soglia delle tre ore con quanto la superi.
       ------------------------------------------------------------------ */
    scena: {
      /** I tre stati del motore, come li legge una persona. */
      bolloIdoneo: "Verificato sul tracciamento",
      bolloIncerto: "Caso incerto",
      bolloNonIdoneo: "Verifica completata",

      /** Il titolo: la frase cambia col fatto, non con lo stato. */
      atterrato: "Atterrato con",
      diRitardo: "di ritardo.",
      senzaOrari: "Ecco cosa risulta dagli archivi.",

      laTuaFascia: "La tua fascia",
      perPasseggero: "per passeggero",

      /* Le tre fasce dell'art. 7, con la ragione di ognuna. Sono
         didascalie, non promesse: dicono perché sei in quella. */
      fasce: [
        { importo: 250, quando: "fino a 1.500 km" },
        { importo: 400, quando: "fino a 3.500 km" },
        { importo: 600, quando: "oltre i 3.500" },
      ],

      soglia: "soglia 3 h",
      oltreSoglia: "{minuti} oltre",
      sottoSoglia: "mancano {minuti}",

      /* I chip: SOLO dati che il motore ha davvero. Il meteo non c'è di
         proposito, l'archivio storico a uso commerciale costa e resta
         spento (vedi STATO): un chip "meteo sereno" sarebbe un dato
         inventato, e la regola numero due lo vieta. */
      chipTratta: "Tratta",
      chipScioperi: "Scioperi",
      chipFonte: "Fonte",
      chipFonteValore: "tracciamento",
      chipFonteDemo: "esempio",
      chipScioperiNessuno: "nessuno",

      preparaPratica: "Prepara la pratica",
      /* ⚠️ Il prezzo NON si scrive qui. È acceso il test dei due prezzi e
         la variante la decide il sito con un cookie: se l'app scrivesse
         14,90 metà delle persone troverebbe 24,90 alla cassa. */
      prezzoNota: "Prezzo fisso, scritto prima di pagare. Nessuna percentuale sul tuo rimborso.",
      nonPromessa:
        "Non è una promessa di pagamento: la compagnia può ancora invocare una circostanza eccezionale, e deve provarla.",
      incertoRassicura:
        "Non hai pagato niente e non pagherai. Quando il fatto non è certo, il caso non si vende.",
    },
  },

  comune: {
    marchio: "Rivolio",
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
      classifica: "Classifica",
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
  /* ---- il profilo dell'app (rifatto l'8/08 sul riferimento di Valerio:
     avatar al centro, invito agli amici, voci in elenco) ---- */
  profiloApp: {
    titolo: { prima: "Il tuo", corsivo: "profilo." },
    modifica: "Modifica il profilo",
    esci: "Esci dall'account",
    email: "valerio@artecai.it",
    ospite: {
      titolo: "Non sei entrato",
      testo:
        "Il check dei voli funziona lo stesso. L'account serve per le pratiche, gli avvisi e la classifica.",
      azione: "Entra",
    },
    invita: {
      titolo: "Fai controllare un volo a chi ami",
      testo: "Il check è gratis: passa Rivolio a chi ha preso un volo in ritardo.",
      // Il messaggio che parte con la condivisione. Niente promesse.
      /* {sito} lo riempie chi mostra il testo, leggendo SITO da api.ts.
         Prima l'indirizzo era scritto a mano qui dentro: il giorno che
         cambia il dominio, un invito che porta a un sito morto è peggio
         di nessun invito. */
      messaggio:
        "Ho controllato il mio volo con Rivolio: se è atterrato in ritardo ti dice subito se rientra in una fascia di compensazione fino a 600€. Gratis: {sito}",
    },
    voci: {
      dati: "Dati personali",
      datiSotto: "Nome pubblico e classifica",
      notifiche: "Notifiche",
      notificheSotto: "Gli avvisi sui tuoi voli",
      privacy: "Privacy e sicurezza",
      privacySotto: "Come trattiamo i tuoi dati",
      condizioni: "Condizioni d'uso",
      condizioniSotto: "Il contratto, in chiaro",
      supporto: "Scrivici",
      supportoSotto: "Rispondiamo per email",
      sito: "Rivolio sul web",
      sitoSotto: "{sitoBreve}",
    },
    piede:
      "Rivolio non è un intermediario: prepara i documenti, il reclamo lo invii tu e la compensazione arriva a te.",
  },

  /* ---- modifica del profilo: nome pubblico e classifica ---- */
  modificaProfilo: {
    titolo: { prima: "Dati", corsivo: "personali." },
    sottotitolo: "L'email è quella con cui entri. Il nome pubblico serve solo alla classifica.",
    email: "La tua email",
    nickname: {
      etichetta: "Nome pubblico",
      segnaposto: "es. maverick_bg",
      aiuto: "Da 3 a 20 caratteri: lettere, numeri e trattino basso. Lo vedono gli altri in classifica.",
    },
    classifica: {
      etichetta: "Partecipa alla classifica",
      testo:
        "Quando una tua pratica viene pagata dalla compagnia, il tuo nome pubblico e l'importo entrano in classifica. Senza il tuo sì non compari mai.",
    },
    salva: "Salva",
    salvato: "Salvato.",
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
    /* Il check vive nell'app: lo stato vuoto porta alla tab Controlla,
       non al sito (8/08: l'app non deve scappare nel browser). */
    vuoto: {
      titolo: "Non hai ancora nessuna pratica.",
      testo:
        "Si parte dal check, qui nell'app: gratis, in trenta secondi. Se il volo rientra in una fascia, apri la pratica e la segui qui, passo per passo.",
      azione: "Controlla un volo",
    },
    apri: "Apri la pratica",
    /** Chi non è entrato: il check resta libero, le pratiche no. */
    ospite: {
      titolo: "Qui trovi le tue pratiche.",
      testo:
        "Il check dei voli è libero e non serve l'account. L'account serve solo per ritrovare le pratiche che hai aperto e vedere a che punto sono.",
      azione: "Entra",
    },
    errore: "Non riesco a leggere le tue pratiche. Riprova fra qualche minuto.",
  },

  /* ---- LA CLASSIFICA: chi si è ripreso più soldi ----
     Regole: solo pratiche PAGATE dalla compagnia (numeri veri), solo chi
     ha scelto un nome pubblico e ha detto sì. Spenta al lancio. */
  classifica: {
    titolo: { prima: "Chi si è ripreso", corsivo: "di più." },
    sottotitolo:
      "Somma delle compensazioni pagate dalle compagnie a chi ha scelto di comparire. Fasce del Regolamento CE 261/2004.",
    demo: "Esempio dimostrativo: i primi vincitori veri stanno arrivando.",
    perPersona: "vinti",
    tu: "Tu",
    vuota: {
      titolo: "Il primo posto è libero.",
      testo:
        "Nessuna vincita in classifica, ancora. Controlla un volo: se la compagnia paga, il posto è tuo.",
      azione: "Controlla un volo",
    },
    entra: {
      titolo: "Vuoi esserci anche tu?",
      testo: "Scegli un nome pubblico nel profilo e accendi \"partecipa alla classifica\".",
      azione: "Scegli il nome",
    },
  },

  /* ---- LA SCHEDA DELLA PRATICA: il tracker, dentro l'app ----
     Qui la pratica si SEGUE: timeline, lettera, "l'ho inviata". L'unica
     cosa che apre il sito è il pagamento. Mai promettere l'esito. */
  praticaScheda: {
    indietro: "Le tue pratiche",
    voloMancante: "Pratica senza volo agganciato",
    perPasseggero: "a passeggero",
    // {n} è il numero di passeggeri della pratica famiglia.
    passeggeri: "{n} passeggeri",
    fonteImporto: "Importo del Regolamento CE 261/2004, per passeggero",
    /* La timeline: i passi nell'ordine in cui succedono. */
    passi: {
      pagata: "Pagamento ricevuto",
      pronta: "La lettera è pronta",
      inviata: "Reclamo inviato da te",
      sollecito: "Sollecito alla compagnia",
      enac: "Reclamo all'ENAC",
      esito: "Risposta della compagnia",
    },
    esitiFinali: {
      esito_pagata: "La compagnia ha pagato",
      esito_rifiutata: "La compagnia ha rifiutato",
      rimborsata: "Rimborsata con la garanzia",
    },
    lettera: {
      titolo: "La tua lettera",
      sottotitolo:
        "La invii tu, dalla tua email. Le compagnie, Ryanair per prima, trattano meglio chi scrive in proprio.",
      oggetto: "Oggetto",
      apriEmail: "Aprila nella tua email",
      copia: "Copia la lettera",
      copiata: "Copiata. Incollala nella tua email.",
      condividi: "Condividi",
      // {nome} è la compagnia.
      canaleTitolo: "Dove si manda a {nome}",
      apriCanale: "Apri il canale reclami",
      indirizzo: "Indirizzo postale",
      allegati: "Da allegare",
      manca:
        "La lettera qui non c'è ancora. Se hai appena pagato, arriva a minuti: tira giù per aggiornare.",
    },
    invio: {
      bottone: "L'ho inviata alla compagnia",
      nota: "Premilo DOPO averla inviata: da quel giorno partono i tempi del sollecito e dell'ENAC.",
      grazie: "Registrato. Da oggi contiamo i giorni per te.",
    },
    garanzia:
      "Garanzia attiva: se la compagnia rifiuta senza un motivo valido o non risponde nei termini, ti rimborsiamo per intero. Dimmi com'è andata e ci penso io.",
    cronologia: "La cronologia",
    caricamento: "Sto leggendo la pratica",
    entraPrima: "Per vedere la pratica devi entrare con l'email con cui l'hai aperta.",
    errore: "Non riesco a leggere la pratica. Riprova fra qualche minuto.",
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
