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

import { TESTO_RINUNCIA } from "@/lib/pratiche/recesso";

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
    entra: "Entra",
  },

  /** La web app per chi arriva senza account (decisione dell'8/08:
      accessibile a tutti, quante analisi si vogliono). */
  appOspite: {
    titolo: "Controlla un volo",
    testo:
      "Gratis, senza account, tutte le volte che vuoi. Se il volo è idoneo, dal risultato apri la pratica.",
    entra: "Hai già una pratica? Entra",
    nota: "Con un account le tue pratiche restano qui, pronte da seguire.",
  },

  /* ---- LO STANDARD DEL CHECK: identico su landing, web app e app ----
     Tre modi di dire qual è il volo: tratta (predefinito), numero, foto
     della carta d'imbarco. Le stesse parole dell'app (mobile testi.ts). */
  check: {
    modo: {
      tratta: "Non so il numero",
      numero: "So il numero",
    },
    tratta: {
      da: { etichetta: "Da dove sei partito", segnaposto: "Città o aeroporto" },
      a: { etichetta: "Dove sei arrivato", segnaposto: "Città o aeroporto" },
      data: { etichetta: "Che giorno", aiuto: "Il giorno della partenza." },
      bottone: "Cerca il volo",
      errori: {
        partenza: "Scegli da dove sei partito.",
        arrivo: "Scegli dove sei arrivato.",
        stessoScalo: "Partenza e arrivo sono lo stesso aeroporto.",
        data: "Scegli il giorno del volo.",
      },
      elenco: {
        titolo: "Qual era il tuo?",
        sottotitolo: "Gli orari sono quelli di partenza previsti. Scegli il tuo volo.",
        arrivo: "arrivo",
        cancellato: "cancellato",
        demo: "Elenco dimostrativo: manca la chiave del fornitore dati.",
        nessuno:
          "Nessun volo trovato su questa tratta in quel giorno. Può essere l'aeroporto sbagliato (molte città ne hanno più di uno) o il giorno sbagliato. Prova a cambiare, oppure passa al numero del volo.",
      },
      nessunoScalo: "Nessun aeroporto con questo nome. Prova con la città, per esempio Roma.",
      cambia: "Cambia",
    },
    carta: {
      titolo: "Hai la carta d'imbarco?",
      testo: "Caricala e compilo io volo e data. Poi controlli quello che ho letto.",
      bottone: "Carica la foto",
      attesa: "Sto leggendo la carta d'imbarco",
      privacy: "La foto non viene salvata: la leggo e la butto.",
      // {volo} e {data} vengono riempiti con quello che è stato letto.
      letto: "Letto dalla carta d'imbarco: volo {volo} del {data}. Controlla che sia giusto.",
      lettoSoloVolo: "Dalla carta d'imbarco ho letto il volo {volo}. La data mettila tu.",
      lettoSoloData: "Dalla carta d'imbarco ho letto il giorno {data}. Il volo scrivilo tu.",
    },
  },

  /* ---- LA WEB APP: le stesse sezioni dell'app sul telefono ----
     Un solo prodotto, due schermi (scelta di Valerio, 8/08). */
  appWeb: {
    tab: {
      controlla: "Controlla",
      pratiche: "Le tue pratiche",
      profilo: "Profilo",
    },
    ospite: {
      pratiche: {
        titolo: "Qui trovi le tue pratiche.",
        testo:
          "Il check è libero e non serve l'account. L'account serve solo per ritrovare le pratiche che hai aperto e vedere a che punto sono.",
        azione: "Entra",
      },
      profilo: {
        titolo: "Non sei entrato.",
        testo:
          "Il check funziona lo stesso. Con l'account trovi le pratiche, gli avvisi e la classifica.",
        azione: "Entra",
      },
    },
    profilo: {
      email: "La tua email",
      dati: {
        titolo: "Dati personali",
        sottotitolo: "Il nome pubblico serve solo alla classifica.",
        nickname: "Nome pubblico",
        nicknameSegnaposto: "es. maverick_bg",
        nicknameAiuto:
          "Da 3 a 20 caratteri: lettere, numeri e trattino basso. Lo vedono gli altri in classifica.",
        classifica: "Partecipa alla classifica",
        classificaTesto:
          "Quando una tua pratica viene pagata dalla compagnia, il tuo nome pubblico e l'importo entrano in classifica. Senza il tuo sì non compari mai.",
        salva: "Salva",
        salvato: "Salvato.",
      },
      voci: {
        privacy: "Privacy",
        condizioni: "Condizioni d'uso",
        supporto: "Scrivici",
      },
      piede:
        "Rivoglio non è un intermediario: prepara i documenti, il reclamo lo invii tu e la compensazione arriva a te.",
    },
  },

  hero: {
    occhiello: "Lo scanner dei rimborsi",
    titolo: "Hai preso un volo nell'ultimo anno?",
    sottotitolo: "Forse ti devono fino a 600€. Controllalo gratis in 30 secondi.",
    /** Apre il "fino a 600€". */
    notaImporto:
      "600€ è l'importo massimo del Regolamento CE 261/2004: ritardi di 4 ore o più sulle tratte oltre i 3.500 km. Le altre fasce: 250€ fino a 1.500 km, 400€ fino a 3.500 km.",
    /** Apre l'"ultimo anno". */
    notaFinestra:
      "Oggi verifichiamo voli fino a 12 mesi indietro: è la profondità degli archivi di volo che interroghiamo. Il diritto in sé dura di più (2 anni per ITA e Aeroitalia, stimati 5 o 6 per i vettori esteri) e stiamo lavorando per allargare la finestra.",
    /** Etichette dei bottoni che aprono le due note qui sopra. */
    apriImporto: "Come nasce il 600€",
    apriFinestra: "Perché 12 mesi",
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
          "Confrontiamo orario previsto ed effettivo sui dati ufficiali del volo e applichiamo il Regolamento CE 261/2004. Se il caso è incerto, te lo diciamo e non paghi.",
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
      titolo: "Analisi in corso",
      /**
       * I 6 passi VERI dell'analisi (SPEC §4, gli strati di
       * lib/voli/verifica.ts). Nessuno è decorativo: ognuno racconta un
       * lavoro che il server fa davvero, e i primi non si accendono prima
       * che quel lavoro sia partito.
       */
      passi: [
        "Cerco il volo negli archivi di volo",
        "Leggo l'orario di atterraggio certificato",
        "Calcolo la distanza reale della tratta",
        "Controllo scioperi e circostanze note del giorno",
        "Confronto orario previsto e orario effettivo",
        "Applico il Regolamento CE 261/2004",
      ],
      /** Quello che scorre sotto i passi: dettagli veri, non numeri finti. */
      dettagli: [
        "Interrogo il tracciamento del volo",
        "Verifico che l'orario sia confermato, non stimato",
        "Distanza ortodromica fra i due aeroporti",
        "Incrocio la tabella scioperi del trasporto aereo",
        "Ritardo all'arrivo, al minuto",
        "Articoli 5, 6 e 7 del Regolamento",
      ],
      nota: "Ogni passo è reale: interroghiamo davvero i dati del volo. Se non li troviamo, te lo diciamo.",
    },
  },

  datoOggettivo: {
    occhiello: "Il dato oggettivo",
    titolo: "Vendiamo un fatto, non una promessa.",
    testo:
      "Tutto parte da un dato: a che ora è atterrato davvero il tuo volo. Incrociamo i dati ufficiali del volo con i tuoi documenti. Se non concordano, il caso è incerto e non paghi.",
    punti: [
      {
        titolo: "Solo dati tracciati",
        testo:
          "L'orario viene dal tracciamento del volo, non da una stima. Se il dato non è verificato, il caso diventa incerto e non ti vendiamo niente.",
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
        prezzo: "0€",
        periodo: "per sempre",
        descrizione: "Scopri se il tuo volo rientra in una fascia di compensazione.",
        punti: [
          "Numero di volo e data, nient'altro",
          "Verifica sui dati ufficiali del volo",
          "Risposta chiara anche quando è un no",
        ],
        bottone: "Controlla gratis",
      },
      pratica: {
        nome: "Una pratica",
        /** Il nastro sulla card evidenziata, come nel riferimento approvato. */
        nastro: "La più scelta",
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
        /** Apre il "1.000€". L'etichetta è sua: quella comune resta al confronto (la prova clicca la prima del blocco). */
        apriNota: "Come nasce il 1.000€",
        nota: "Il conto: 4 passeggeri × 250€ a testa = 1.000€. La compensazione spetta a ogni passeggero, anche ai bambini con un posto pagato.",
        bottone: "Prepara la pratica famiglia",
      },
    },
    promemoria: "Nessun abbonamento, nessuna percentuale, nessun altro costo.",
  },

  retroattivo: {
    occhiello: "Retroattivo",
    titolo: "Vale anche per i voli dell'anno scorso.",
    testo:
      "Un ritardo dell'estate scorsa vale quanto uno di ieri: oggi il check verifica voli fino a 12 mesi indietro. Il diritto di reclamo per legge dura anche di più, e le finestre qui sotto restano valide: la scadenza te la dichiariamo caso per caso.",
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
      "La scadenza è una finestra stimata, dipende dalla compagnia: la dichiariamo caso per caso dentro la tua verifica. Il check online oggi copre i voli degli ultimi 12 mesi.",
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
          "Tre cose. Il dato oggettivo: l'orario effettivo di atterraggio, letto dal tracciamento del volo e archiviato come prova. Il secondo colpo: il sollecito già pronto al giorno 15, il punto esatto in cui la maggior parte delle persone lascia perdere. La garanzia: se entro 90 giorni non ricevi nulla, ti rimborsiamo per intero.",
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
          "Il diritto dura a lungo: 2 anni per ITA e Aeroitalia, stimati 5 o 6 per vettori esteri come Ryanair e Wizz Air (caso per caso, nella tua verifica trovi la data indicativa). Il check online oggi verifica voli fino a 12 mesi indietro.",
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
    conferma:
      "Controlla la posta. Ti ho mandato un'email con un link da cliccare: è quel clic che ti iscrive, così nessuno può iscrivere l'indirizzo di un altro. Se non la vedi, guarda nella posta indesiderata.",
    nota: "Solo l'Osservatorio, niente promozioni.",
    /** La striscia coi dati VERI (#25): indice ritardi per aeroporto. */
    ritardi: {
      titolo: "Gli aeroporti italiani, adesso",
      indiceEtichetta: "indice ritardi",
      medianaTemplate: "mediana {minuti} min",
      cancellatiTemplate: "{n} cancellati",
      /** Il numero da solo non dice se 2,2 è tanto: queste tre parole sì. */
      giudizi: {
        calmo: "Si vola liscio",
        qualcheRitardo: "Qualche ritardo",
        giornataStorta: "Giornata storta",
      },
      /** Ogni numero mostrato è apribile o spiegato: questa è la spiegazione. */
      nota: "Indice da 0 (tutto in orario) a 5 sugli arrivi delle ultime due ore, dal tracciamento AeroDataBox. Si aggiorna al massimo una volta al giorno.",
      rilevatoTemplate: "Ultima rilevazione: {quando}",
    },
  },

  /** Gli esiti dei link nelle email: conferma iscrizione e disdetta. */
  iscrizione: {
    torna: "Torna alla home",
    esiti: {
      fatto: {
        titolo: "Iscrizione confermata.",
        corpo:
          "Ci sei. La prima uscita dell'Osservatorio arriva nella tua casella, e nel benvenuto che ti ho appena mandato trovi già come stanno andando gli aeroporti italiani oggi.",
        azione: { testo: "Controlla un tuo volo", dove: "/app" },
      },
      disdetto: {
        titolo: "Fatto, non ti scrivo più.",
        corpo:
          "Il tuo indirizzo è fuori dall'Osservatorio da adesso. Nessuna domanda e nessun modulo: se un giorno cambi idea, il campo sulla home è sempre lì.",
        azione: { testo: "Controlla un volo, gratis", dove: "/app" },
      },
      scaduto: {
        titolo: "Questo link è scaduto.",
        corpo:
          "I link di conferma valgono trenta giorni. Riscrivi il tuo indirizzo sulla home e te ne mando subito uno nuovo.",
        azione: { testo: "Iscriviti di nuovo", dove: "/#osservatorio" },
      },
      guasto: {
        titolo: "Questo link non torna.",
        corpo:
          "Può essere che si sia spezzato passando dalla posta: certi programmi tagliano i link lunghi. Riscrivi il tuo indirizzo sulla home e te ne arriva un altro.",
        azione: { testo: "Iscriviti di nuovo", dove: "/#osservatorio" },
      },
      riprova: {
        titolo: "Colpa nostra, non tua.",
        corpo:
          "Il clic è arrivato ma non sono riuscito a registrarlo. Il link resta valido: riprova fra qualche minuto e andrà a posto.",
        azione: { testo: "Torna all'Osservatorio", dove: "/#osservatorio" },
      },
    },
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
      /**
       * #21: la rinuncia al recesso (art. 59 Cod. Consumo) prima di Polar.
       * L'etichetta È il testo registrato nel database: unica fonte,
       * lib/pratiche/recesso.ts. Se cambia lì, cambia anche qui.
       */
      recesso: {
        etichetta: TESTO_RINUNCIA,
        nota: "La garanzia non cambia: se entro 90 giorni la compagnia non ti paga, ti rimborsiamo per intero.",
        blocco:
          "Per proseguire metti la spunta qui sopra: senza il tuo consenso non possiamo preparare la pratica subito.",
        errore: "Non siamo riusciti a registrare il consenso. Riprova tra qualche secondo.",
        avvisoRimbalzo:
          "Manca la spunta del consenso alla consegna immediata: mettila e riprova.",
        attesa: "Registro il consenso.",
      },
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

  /**
   * L'area riservata e il tracker della pratica.
   * Gli stati sono ESATTAMENTE quelli della macchina in lib/pratiche
   * (schema supabase/2026-08-07-rivoglio.sql): se ne aggiungi uno lì,
   * aggiungilo anche qui o il tracker mostra il codice grezzo.
   */
  pratica: {
    /* ---- i documenti dell'utente: la seconda fonte (/pratica/[id]) ---- */
    documenti: {
      titolo: "Aggiungi i tuoi documenti",
      testo:
        "Carica la carta d'imbarco o l'email della compagnia: incrociamo i tuoi documenti coi dati ufficiali del volo. Se concordano, il reclamo è più solido. Se non concordano, controlliamo a mano e ti scriviamo.",
      bottone: "Carica un documento",
      troppoGrande: "Il file supera i 5MB: riprova con una foto più leggera.",
      concorde:
        "I tuoi documenti concordano coi dati ufficiali del volo. Il reclamo è più solido: due fonti, lo stesso fatto.",
      discorde:
        "I tuoi documenti non concordano coi dati che abbiamo verificato. Controlliamo a mano e ti scriviamo: fino ad allora la pratica non cambia.",
      illeggibile:
        "Non siamo riusciti a leggere il documento. Riprova con una foto più nitida e ben illuminata.",
      privacy:
        "Il file non viene salvato: lo leggiamo, registriamo l'esito del confronto e lo scartiamo.",
    },

    /* ---- la testata dell'area riservata (/app/layout) ---- */
    testata: {
      esci: "Esci",
      piede: "Rivoglio · lo scanner dei rimborsi",
    },

    /* ---- l'elenco delle pratiche (/app) ---- */
    elenco: {
      titolo: "Le tue pratiche",
      sottotitolo: "Ogni reclamo che hai aperto, con il punto in cui si trova.",
      voloTemplate: "Volo {volo} del {data}",
      /** Quando il volo agganciato non è leggibile: si dice, non si inventa. */
      voloMancante: "Pratica del {data}",
      fasciaTemplate: "Fascia da {importo}",
      /** Cita la fonte dell'importo: ogni numero mostrato è apribile o citato. */
      fasciaFonte: "Importo del Regolamento CE 261/2004, per passeggero",
      famiglia: "Famiglia, fino a 5 passeggeri",
      prossimoPassoEtichetta: "Prossimo passo",
      apri: "Apri la pratica",
      vuoto: {
        titolo: "Non hai ancora nessuna pratica.",
        testo:
          "Si parte sempre dal check: numero di volo e data, gratis. Se il volo rientra in una fascia, da lì apri la pratica.",
        cta: "Controlla un volo",
      },
      errore: "Non riesco a leggere le tue pratiche. Riprova tra qualche minuto.",
    },

    /* ---- il tracker (/pratica/[id]) ---- */
    titolo: "La tua pratica",
    sottotitoloTemplate: "Volo {volo} del {data}",
    torna: "Le tue pratiche",
    statoEtichetta: "Dove siamo",
    prossimoPassoEtichetta: "Il prossimo passo",
    stati: {
      creata: {
        nome: "Creata",
        descrizione: "La pratica è aperta ma il pagamento non risulta ancora arrivato.",
        prossimoPasso:
          "Completa il pagamento dal link che ti abbiamo mandato via email. Appena arriva, qui trovi la lettera pronta.",
      },
      pagata: {
        nome: "Pagata",
        descrizione: "Pagamento ricevuto. La lettera di reclamo è pronta da copiare.",
        prossimoPasso:
          "Apri la lettera, inviala dalla tua email e poi torna qui a premere \"Ho inviato il reclamo\".",
      },
      pronta: {
        nome: "Pronta da inviare",
        descrizione: "La lettera di reclamo è pronta, con i dati verificati del volo.",
        prossimoPasso:
          "Apri la lettera, inviala dalla tua email e poi torna qui a premere \"Ho inviato il reclamo\".",
      },
      inviata: {
        nome: "Inviata",
        descrizione: "Hai inviato il reclamo alla compagnia. Ora la palla è a loro.",
        prossimoPasso:
          "Niente da fare per ora. Se al giorno 15 non è arrivata risposta, ti mandiamo il sollecito già pronto.",
      },
      sollecito: {
        nome: "Sollecito",
        descrizione:
          "Giorno 15, nessuna risposta: il sollecito è pronto. È il passaggio che la maggior parte delle persone salta. Tu no.",
        prossimoPasso:
          "Invia il sollecito che ti abbiamo mandato via email, sempre dalla tua casella.",
      },
      enac: {
        nome: "ENAC",
        descrizione: "La compagnia rifiuta o tace: contro-risposta e reclamo ENAC sono pronti.",
        prossimoPasso:
          "Presenta il reclamo ENAC seguendo i passi nell'email che ti abbiamo mandato. È gratuito.",
      },
      esito_pagata: {
        nome: "Pagata dalla compagnia",
        descrizione: "La compagnia ha pagato. La compensazione è arrivata a te, per intero.",
        prossimoPasso:
          "Niente da fare: la pratica è chiusa. Se un altro volo ti è andato storto, il check resta gratis.",
      },
      esito_rifiutata: {
        nome: "Rifiutata",
        descrizione: "La compagnia ha rifiutato la richiesta.",
        prossimoPasso:
          "Vale la garanzia: se entro la data indicata qui sotto non ricevi nulla, ti rimborsiamo la pratica per intero.",
      },
      rimborsata: {
        nome: "Rimborsata",
        descrizione: "Ti abbiamo rimborsato la pratica per intero, come da garanzia.",
        prossimoPasso: "Niente da fare: la pratica è chiusa.",
      },
    },

    /* ---- la linea del tempo, dagli eventi in pratiche_eventi ---- */
    lineaTempo: {
      titolo: "La cronologia",
      vuota: "Ancora nessun evento registrato.",
      /** Etichette per `tipo`: le transizioni di stato e le email del cron. */
      eventi: {
        creata: "Pratica aperta",
        pagata: "Pagamento ricevuto",
        pronta: "Lettera pronta",
        inviata: "Reclamo inviato alla compagnia",
        sollecito: "Sollecito pronto",
        enac: "Reclamo ENAC pronto",
        esito_pagata: "La compagnia ha pagato",
        esito_rifiutata: "La compagnia ha rifiutato",
        rimborsata: "Pratica rimborsata",
        rinuncia_recesso: "Rinuncia al recesso registrata",
        rinuncia_recesso_mancante: "Rinuncia al recesso da verificare",
        email_t0: "Email di conferma inviata",
        email_t2: "Promemoria d'invio inviato",
        email_t15: "Email col sollecito inviata",
        email_t30: "Email col reclamo ENAC inviata",
        email_t60: "Email di controllo esito inviata",
      },
      notaOrari: "Date e orari in ora italiana.",
    },

    azioni: {
      apriLettera: "Apri la lettera",
      confermaInvio: "Ho inviato il reclamo",
      confermaInvioInCorso: "Un attimo.",
      confermaInvioFatta: "Registrato. Ricarico la pagina.",
      confermaInvioErrore: "Non sono riuscito a salvare. Riprova tra poco.",
      confermaInvioNota:
        "Premilo solo dopo aver spedito davvero l'email: da quel giorno partono i tempi del sollecito.",
    },

    istruzioniInvio: {
      titolo: "Come si invia, in 2 minuti",
      passi: [
        "Apri la lettera e copia il testo del reclamo",
        "Incollalo in una email dalla tua casella e aggiungi gli allegati indicati",
        "Invia all'indirizzo della compagnia che trovi nella lettera",
        "Torna qui e premi \"Ho inviato il reclamo\": da lì partono i promemoria",
      ],
      perche:
        "Il reclamo parte dalla tua email, a tuo nome. Le compagnie rispondono al passeggero, non a un intermediario.",
    },

    fascia: {
      template: "Fascia da {importo}",
      perPasseggero: "a passeggero",
      /** Apre l'importo della fascia: stesso conto di risultato.idoneo. */
      comeNasce: {
        titolo: "Come nasce questa cifra",
        testo:
          "Il Regolamento CE 261/2004 fissa gli importi per distanza: 250€ fino a 1.500 km, 400€ fino a 3.500 km, 600€ oltre (ridotto a 300€ se sul lungo raggio il ritardo resta tra 3 e 4 ore).",
      },
    },

    garanzia: {
      titolo: "La garanzia",
      /** {data} = garanzia_fino_al della pratica. */
      template:
        "Se entro il {data} la compagnia non ti ha pagato, ti rimborsiamo la pratica per intero. Il rimborso parte da noi, senza moduli da compilare.",
      senzaData:
        "Se entro 90 giorni la compagnia non ti ha pagato, ti rimborsiamo la pratica per intero. Il rimborso parte da noi, senza moduli da compilare.",
    },

    scadenza: {
      titolo: "Fino a quando puoi chiedere",
      /** La scadenza è SEMPRE una stima dichiarata (SPEC §4). */
      template: "Secondo la nostra stima, fino al {data}.",
      avvertenza:
        "È una stima prudente: i termini dipendono dal paese della compagnia e dal giudice competente. Non è un parere legale.",
    },

    /* ---- guasti onesti ---- */
    errori: {
      configurazione:
        "Manca un pezzo di configurazione dal nostro lato e la pratica non si può leggere. Riprova tra poco; se il problema resta, rispondi a una email della pratica e la sistemiamo noi.",
    },
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
    cartolina: {
      titolo: "Il check è gratis.",
      corsivo: "Il ritardo è già tuo.",
      testo:
        "Numero del volo e data: in 30 secondi sai se rientri nelle fasce del CE 261/2004. Senza account, senza carta.",
      bottone: "Controlla il tuo volo",
      altTelefono: "L'app di Rivoglio in mano: il check del volo sul telefono",
    },
    colonne: {
      prodotto: {
        titolo: "Prodotto",
        voci: [
          { testo: "Il check gratuito", ancora: "#controllo" },
          { testo: "La web app", ancora: "/app" },
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
          { testo: "Voli dell'anno scorso", ancora: "#retroattivo" },
        ],
      },
      domande: {
        titolo: "Domande",
        voci: [
          { testo: "Posso fare da solo, gratis?", ancora: "#domande" },
          { testo: "Cosa pago, esattamente?", ancora: "#domande" },
          { testo: "Bagaglio perso o in ritardo?", ancora: "/guida-bagagli" },
          { testo: "Tutte le risposte", ancora: "#domande" },
        ],
      },
      legale: {
        titolo: "Note legali",
        voci: [
          { testo: "Condizioni d'uso", ancora: "/condizioni" },
          { testo: "Privacy", ancora: "/privacy" },
          { testo: "Cookie", ancora: "/cookie" },
        ],
      },
    },
    app: {
      titolo: "L'app per seguire la pratica",
      presto: "Presto su",
    },
    social: {
      titolo: "Seguici",
    },
    disclaimer:
      "Rivoglio genera documenti a partire da dati di volo verificati. Non è un intermediario, non offre consulenza legale, non incassa per conto tuo e non chiede la cessione del credito. Il reclamo lo invii tu, dalla tua email. Gli importi indicati sono le fasce del Regolamento CE 261/2004: l'esito della richiesta dipende dalla compagnia.",
    /** L'indirizzo vivo oggi: si cambia in uno @rivoglio quando c'è il dominio. */
    supporto: { etichetta: "Supporto", email: "valerio@artecai.it" },
    copyright: "© 2026 Rivoglio",
  },
} as const;

export type Copy = typeof COPY;
