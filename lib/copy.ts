/**
 * TUTTI i testi delle superfici web di Rivolio vivono qui, in un posto solo.
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
import { CHECK_A_PAGAMENTO, PREZZO_LANCIO } from "@/lib/check/ingresso";
import { euro } from "@/lib/prezzi";

/**
 * IL CHECK COSTA O NO: i testi seguono l'interruttore, non il contrario.
 *
 * Ogni frase che parla del prezzo del check esiste in due versioni, e a
 * scegliere è la stessa costante che decide se il muro c'è davvero
 * (`CHECK_PREZZO_ATTIVO`). Così non può esistere il momento in cui il
 * sito promette gratis quello che fa pagare, o il contrario: sono la
 * stessa riga di codice.
 *
 * L'angolo, scelto da Valerio l'11/08: **meno di un caffè**. Il prezzo
 * non si nasconde, si mette accanto alla cifra che vale il volo, dove
 * diventa piccolo da solo.
 */
const PREZZO = euro(PREZZO_LANCIO);
const seSiPaga = <T,>(pagando: T, gratis: T): T => (CHECK_A_PAGAMENTO ? pagando : gratis);

export const COPY = {
  /** 3-6 parole. Regge anche bagagli, treni e bollette, non solo i voli. */
  tagline: "Riprenditi i soldi che ti devono.",

  comune: {
    marchio: "Rivolio",
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
      /* Il blog: dalla nav si arriva al Tabellone, e dal Tabellone si
         torna al check. È il canale di acquisizione, non un extra. */
      { testo: "Il Tabellone", ancora: "/tabellone" },
    ],
    cta: "Controlla il tuo volo",
    /** Sotto i 360 punti di larghezza: il testo pieno non ci sta. */
    ctaCorta: "Controlla",
    entra: "Entra",
  },

  /** La web app per chi arriva senza account (decisione dell'8/08:
      accessibile a tutti, quante analisi si vogliono). */
  appOspite: {
    titolo: "Controlla un volo",
    testo: seSiPaga(
      `Senza account, in trenta secondi. L'analisi costa ${PREZZO} e si scala dalla pratica, se poi la apri.`,
      "Gratis, senza account, tutte le volte che vuoi. Se il volo è idoneo, dal risultato apri la pratica.",
    ),
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
          /* 🔴 PROMETTEVA AVVISI E CLASSIFICA, che nella web app non
             esistono: gli avvisi sono le notifiche dell'app sul telefono,
             e la classifica è spenta finché non ci sono vincite vere. Chi
             entrava da browser cercava due cose che non ci sono.
             Trovato dall'ispezione del 12/08. */
          "Il check funziona lo stesso. Con l'account ritrovi le tue pratiche e riprendi da dove eri, anche da un altro dispositivo.",
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
        "Rivolio non è un intermediario: prepara i documenti, il reclamo lo invii tu e la compensazione arriva a te.",
    },
  },

  hero: {
    occhiello: "Lo scanner dei rimborsi",
    titolo: "Hai preso un volo nell'ultimo anno?",
    sottotitolo: seSiPaga(
      `Forse ti devono fino a 600€. Scoprilo in 30 secondi: l'analisi costa ${PREZZO}, meno di un caffè.`,
      "Forse ti devono fino a 600€. Controllalo gratis in 30 secondi.",
    ),
    /** Apre il "fino a 600€". */
    notaImporto:
      "600€ è l'importo massimo del Regolamento CE 261/2004: ritardi di 4 ore o più sulle tratte oltre i 3.500 km. Le altre fasce: 250€ fino a 1.500 km, 400€ fino a 3.500 km.",
    /** Apre l'"ultimo anno". */
    notaFinestra:
      "Oggi verifichiamo voli fino a 12 mesi indietro: è la profondità degli archivi di volo che interroghiamo. Il diritto in sé dura di più (2 anni per ITA e Aeroitalia, stimati 5 o 6 per le compagnie estere) e stiamo lavorando per allargare la finestra.",
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
      bottone: seSiPaga(`Analizza il volo · ${PREZZO}`, "Controlla gratis"),
      rassicurazione: "Niente email, niente account. Il risultato lo vedi subito.",
      /** Errori di validazione lato campo, prima ancora di chiamare l'API. */
      errori: {
        voloMancante: "Scrivi il numero del volo, per esempio FR 8321.",
        /* Prima diceva «Scrivi la data del volo: è il giorno della
           partenza», e quel «è» non lega niente con niente: sembra un
           pezzo di frase rimasto a metà (segnalato da Valerio, 11/08).
           Adesso dice la cosa e basta, e il chiarimento è una frase
           sua. */
        dataMancante: "Manca la data. Scrivi il giorno in cui il volo è partito.",
      },
    },
    puntiFiducia: [
      seSiPaga(`L'analisi costa ${PREZZO}: meno di un caffè`, "Il check è gratis, sempre"),
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
          "Lo mandi dalla tua email in 2 minuti. La compensazione arriva a te, per intero. E se restano in silenzio, dopo sei settimane trovi il sollecito già pronto.",
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
        "Distanza in linea d'aria fra i due aeroporti",
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
          "Il reclamo va alla compagnia che ha fatto volare l'aereo, non a chi ti ha venduto il biglietto. È l'errore numero uno dei reclami respinti.",
      },
    ],
    nota: "Le regole che applichiamo sono pubbliche: articoli 5, 6 e 7 del Regolamento CE 261/2004.",
    /**
     * La vetrina di COME appare un verdetto. È un caso costruito, SEMPRE
     * marcato con comune.demo (regola CLAUDE.md #3). I conti tornano con
     * lib/regole/eu261.ts: dalle 22:55 alle 02:47 passano 3 h e 52 min (232 minuti,
     * sopra la soglia dei 180) e fino a 1.500 km la fascia è 250€.
     */
    esempio: {
      etichetta: "Così appare un verdetto",
      volo: "Volo di esempio",
      tratta: "tratta fino a 1.500 km",
      occhiello: "Verifica completata",
      titolo: "Atterrato con 3 h e 52 min di ritardo.",
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
      "Se la compagnia rifiuta senza un motivo valido, o non risponde entro i termini di legge, ti rimborsiamo per intero quello che hai pagato. Ti scriviamo noi per sapere com'è andata: il rimborso non devi chiederlo.",
    punti: [
      "Rimborso integrale, non un buono",
      "Legata all'esito, non a una scadenza sul calendario",
      "Vale per ogni pratica, singola o famiglia",
    ],
    notaOnesta:
      "Non mettiamo una scadenza a giorni perché le compagnie rispondono anche dopo due o tre mesi: un limite corto ti farebbe chiedere il rimborso mentre la tua pratica è ancora viva. Possiamo permettercela perché vendiamo solo i casi in cui il dato è solido: quelli incerti non li vendiamo.",
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
      /* I numeri servono ANCHE all'animazione delle banconote: il
         componente li usa per far volare via la quota giusta, invece di
         inventarsi una proporzione a occhio. Le stringhe restano perché
         senza JavaScript la sezione deve leggersi lo stesso. */
      compensazione: 600,
      voci: [
        {
          nome: "Portale al 35%",
          costo: "trattiene 210€",
          resta: "a te restano 390€",
          trattenuto: 210,
          restano: 390,
          etichettaVia: "via 210€",
        },
        {
          nome: "Rivolio",
          costo: "costa 14,90€",
          resta: "a te restano 585,10€",
          trattenuto: 14.9,
          restano: 585.1,
          etichettaVia: "via 14,90€",
        },
      ],
      /* Le due righe sotto le banconote: dette in parole, non in cifre. */
      didascalia: {
        portale: "Una compensazione su tre resta al portale.",
        nostro: "Qui resta a te, meno il prezzo di una pizza.",
      },
    },
    piani: {
      check: {
        nome: seSiPaga("L'analisi del volo", "Il check del volo"),
        nastro: seSiPaga("Prezzo di lancio", "Sempre gratis"),
        prezzo: seSiPaga(PREZZO, "0€"),
        periodo: seSiPaga("per volo", "per sempre"),
        rassicurazione: seSiPaga(
          "Meno di un caffè. E se poi apri la pratica, questi euro si scalano dal prezzo: il totale non cambia.",
          "Niente carta, niente account. Paghi solo se decidi di aprire la pratica.",
        ),
        descrizione:
          "Numero di volo e data, oppure la foto della carta d'imbarco: in trenta secondi sai se il tuo volo rientra in una fascia del CE 261/2004, e vedi gli orari veri su cui l'abbiamo deciso.",
        punti: [
          "Numero di volo e data, nient'altro",
          "Verifica sui dati ufficiali del volo",
          "Risposta chiara anche quando è un no",
        ],
        bottone: seSiPaga(`Analizza il volo · ${PREZZO}`, "Controlla gratis"),
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
          "Sollecito già pronto dopo sei settimane",
          "Se dicono no, la replica che smonta il loro motivo",
          "Segnalazione all'ente e conciliazione gratuita, già scritte",
          "Tracker della pratica, sul web e nell'app",
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
    /** La garanzia, dentro le card: è l'obiezione numero uno di chi paga. */
    garanziaCarta: "Garanzia: se la compagnia non paga, ti rimborsiamo per intero.",
    promemoria: "Nessun abbonamento, nessuna percentuale, nessun altro costo.",
  },

  /**
   * CHI FA COSA. Nasce dallo stesso feedback del 9/08: "il lavoro resta a
   * carico tuo". È vero che il reclamo lo manda l'utente, e non è un
   * ripiego: FR, U2, W6, V7 e DY dichiarano per iscritto che lavorano
   * SOLO il reclamo inviato dal passeggero. Quello che si può togliere è
   * la fatica, non il gesto. Qui si dice quanta ne resta: due clic.
   */
  divisione: {
    occhiello: "Chi fa cosa",
    titolo: "Due clic tuoi. Il resto è mio.",
    tuo: {
      titolo: "Lo fai tu",
      tempo: "due minuti in tutto",
      voci: [
        "Dici qual era il volo: numero e data, o la foto della carta d'imbarco.",
        "Premi invio sull'email di reclamo, che trovi già scritta e già indirizzata.",
        "Mi dici se la compagnia risponde. Un tocco, dalla pratica.",
      ],
    },
    nostro: {
      titolo: "Lo faccio io",
      tempo: "il resto",
      voci: [
        "Verifico l'orario certificato di atterraggio e calcolo la fascia.",
        "Scrivo la lettera col riferimento di legge e il canale reclami giusto di quella compagnia.",
        "Ti ricordo io le scadenze, col sollecito e la replica al loro no già scritti.",
        "Se non pagano, ti preparo la segnalazione all'ente e la conciliazione: è gratuita e si fa da casa.",
        "Tengo la pratica aggiornata, e se la compagnia non paga ti restituisco i soldi.",
      ],
    },
    perche:
      "Il reclamo parte dalla tua email per un motivo pratico: Ryanair, Wizz Air ed easyJet dichiarano per iscritto che lavorano solo i reclami inviati dal passeggero. È anche il motivo per cui la compensazione arriva a te intera, senza passare da noi.",
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
        /* 🔴 QUI E NEL BLOG C'ERANO DUE RISPOSTE DIVERSE ALLA STESSA
           DOMANDA. Il Tabellone spiega, correttamente, che in Italia il
           termine è CONTESTATO fra sei mesi e un anno e che conviene
           trattarlo come sei mesi; questa card diceva "2 anni" come se
           fosse un fatto pacifico. Non lo è, e la nota citava anche
           l'articolo sbagliato. Adesso la card dice che è una stima e
           manda al pezzo che la spiega: le due pagine non si smentiscono
           più. Trovato dall'ispezione del 12/08.
           ⚠️ Le finestre NON si accorciano a sei mesi: farlo butterebbe
           via il bacino dei voli vecchi, e la richiesta si può presentare
           lo stesso oltre quel termine (è la compagnia che deve
           eccepirlo). Si dice come stanno le cose, non si sceglie il
           numero che fa più comodo in nessuna delle due direzioni. */
        nota: "stima: in Italia il termine è discusso, vedi la guida",
        /* Servono al cielo della card: scala 0-6 anni e bandierina. */
        anniStimati: 2,
        paese: "it" as const,
      },
      {
        compagnie: "Ryanair, Wizz Air e altre compagnie estere",
        finestra: "5-6 anni",
        nota: "stima: dipende dal paese della compagnia",
        anniStimati: 5.5,
        paese: "eu" as const,
      },
    ],
    /** Le due estremità della barra del tempo. */
    scalaOggi: "oggi",
    scalaFine: "6 anni",
    /** La finta casella email che si cerca da sola. */
    posta: {
      casella: "La tua casella email",
      esempio: "Esempio",
      ricerca: "conferma volo",
      mittente: "La tua compagnia aerea",
      oggettoPrima: "Prenotazione confermata, volo ",
      numero: "FR 8321",
      oggettoMezzo: " del ",
      data: "12 marzo",
      spiegazione:
        "Numero e data sono lì dentro, nell'email che ti hanno mandato quando hai prenotato. Non serve altro: il check parte da questi due dati.",
    },
    avvertenza:
      "La scadenza è una finestra stimata, dipende dalla compagnia e dal paese: la dichiariamo caso per caso dentro la tua verifica. In Italia il termine è discusso fra sei mesi e un anno, quindi prima chiedi e meglio è. Il check online oggi copre i voli degli ultimi 12 mesi.",
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
    chiusa: seSiPaga(
      `Il primo passo per non essere in quei numeri costa ${PREZZO}.`,
      "Il primo passo per non essere in quei numeri è un check gratuito.",
    ),
  },

  faq: {
    occhiello: "Domande",
    titolo: "Risposte dirette, anche quando non ci convengono.",
    voci: [
      {
        domanda: "Posso fare tutto da solo, gratis?",
        risposta:
          "Sì, e te lo diciamo volentieri. Il reclamo alla compagnia è gratuito e non serve un avvocato: ogni compagnia ha un modulo nella sezione assistenza del suo sito (cerca \"nome della compagnia + reclamo CE 261\"). Se la risposta non arriva o non ti convince, puoi presentare reclamo gratuito all'ENAC, su enac.gov.it. Noi vendiamo il tempo che risparmi, non quello che non sai.",
      },
      {
        domanda: "E allora cosa pago, esattamente?",
        risposta:
          "Tre cose. Il dato oggettivo: l'orario effettivo di atterraggio, letto dal tracciamento del volo e archiviato come prova. I colpi dopo il primo: il sollecito, la replica se dicono no, la segnalazione all'ente e la conciliazione gratuita, che è il canale dove i soldi si muovono davvero. La garanzia: se la compagnia rifiuta senza un motivo valido o non risponde nei termini, ti rimborsiamo per intero.",
      },
      {
        domanda: "Quanto ricevo, se va a buon fine?",
        risposta:
          "Dipende dalla tratta e dal ritardo. Il Regolamento CE 261/2004 fissa tre importi: 250€ fino a 1.500 km, 400€ fino a 3.500 km, 600€ oltre i 3.500 km (ridotto a 300€ se sul lungo raggio il ritardo resta tra 3 e 4 ore). Il check ti dice subito la fascia del tuo volo. La compensazione arriva tutta a te: non tratteniamo nulla.",
      },
      {
        domanda: "E se la compagnia dice che era maltempo o sciopero?",
        risposta:
          "Alcune circostanze eccezionali escludono davvero la compensazione, ed è giusto dirlo. Per questo il verdetto ti indica la fascia e le cause escludenti da verificare, mai una promessa. Se il tuo caso è incerto, non ti facciamo pagare. E se la compagnia rifiuta con una motivazione debole, la contro-risposta te la prepariamo subito; se invece tacciono, alla sesta settimana trovi il sollecito, e due settimane dopo la segnalazione all'ente nazionale, già scritti.",
      },
      {
        domanda: "Siete un'agenzia di reclami? Devo cedervi il credito?",
        risposta:
          "No. Rivolio genera documenti: niente mandato, niente cessione del credito, niente percentuali. Il reclamo lo invii tu dalla tua email e la compensazione arriva direttamente a te. Con le compagnie ostili agli intermediari è anche un vantaggio: la richiesta arriva dal passeggero, non da una società.",
      },
      {
        domanda: "Fino a quando posso fare richiesta?",
        risposta:
          "Il diritto dura a lungo: 2 anni per ITA e Aeroitalia, stimati 5 o 6 per compagnie estere come Ryanair e Wizz Air (caso per caso, nella tua verifica trovi la data indicativa). Il check online oggi verifica voli fino a 12 mesi indietro.",
      },
      {
        domanda: "Quali voli posso controllare?",
        risposta:
          "Verifichiamo i voli coperti dal Regolamento CE 261/2004: in partenza da un aeroporto UE, o in arrivo nell'UE con una compagnia europea. Copriamo il ritardo di 3 ore o più all'arrivo, il volo cancellato, il dirottamento, il negato imbarco e la coincidenza persa. Sul ritardo il verdetto è automatico; negli altri quattro casi il check ti fa una o due domande a risposta chiusa, perché quei fatti negli archivi non ci sono. Se resti nel dubbio non paghi.",
      },
      {
        /* ⚠️ QUESTA DOMANDA VIENE DALLA SEZIONE "COSA COPRE", tolta dalla
           landing il 12/08 su richiesta di Valerio. Sono le uniche due
           righe di quella sezione che è stato deciso di salvare, e il
           motivo non è la completezza: è che chi paga aspettandosi il
           rimborso del bagaglio chiede indietro i soldi e lascia una
           stella. Dirlo prima costa una riga, scoprirlo dopo costa un
           cliente. */
        domanda: "E per i bagagli o per i treni?",
        risposta:
          "Non li facciamo, e preferiamo dirlo prima che tu ci perda tempo. Il bagaglio perso o in ritardo ricade sulla Convenzione di Montreal, non sul CE 261, e nessun archivio certifica un bagaglio: un verdetto automatico non è possibile. La guida per farlo da solo però c'è, ed è gratuita: la trovi su /guida-bagagli. I treni hanno un regolamento diverso (CE 1371/2007) e non esiste un archivio pubblico sui ritardi di Trenitalia e Italo.",
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
        azione: { testo: seSiPaga("Analizza un volo", "Controlla un volo, gratis"), dove: "/app" },
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
    /**
     * I CASI CHE GLI ARCHIVI NON VEDONO: negato imbarco e coincidenza.
     * Un volo partito in orario non dice niente su chi è rimasto al
     * gate: si apre da un invito discreto sotto il verdetto.
     */
    dichiara: {
      invito: "Ti hanno lasciato a terra o hai perso una coincidenza?",
      invitoSotto:
        "Sono casi che gli archivi di volo non vedono: il tuo aereo può risultare in orario. Dimmelo tu e ti dico se ti spetta qualcosa.",
      negato: {
        scheda: "Mi hanno lasciato a terra",
        titolo: "Negato imbarco",
        presenza: {
          domanda: "Ti sei presentato all'imbarco in orario, con prenotazione confermata?",
          voci: [
            { valore: "inOrario", testo: "Sì, ero in orario al gate" },
            { valore: "tardi", testo: "No, sono arrivato oltre l'orario d'imbarco" },
            { valore: "nonRicordo", testo: "Non ne sono sicuro" },
          ],
        },
        volonta: {
          domanda: "Com'è andata al gate?",
          voci: [
            {
              valore: "involontario",
              testo: "Mi hanno lasciato a terra contro la mia volontà (overbooking o simili)",
            },
            {
              valore: "volontario",
              testo: "Ho ceduto io il posto in cambio di qualcosa (un buono, un altro volo)",
            },
          ],
        },
      },
      coincidenza: {
        scheda: "Ho perso una coincidenza",
        titolo: "Coincidenza persa",
        unica: {
          domanda: "I voli erano sulla stessa prenotazione?",
          aiuto: "Guarda l'email di conferma: un solo codice di prenotazione per tutti i voli = sì.",
          voci: [
            { valore: "si", testo: "Sì, un'unica prenotazione" },
            { valore: "no", testo: "No, biglietti comprati separatamente" },
            { valore: "nonSo", testo: "Non lo so" },
          ],
        },
        destinazione: {
          domanda: "Qual era la destinazione finale del viaggio?",
          segnaposto: "Città o aeroporto",
        },
        ritardo: {
          domanda: "Con quanto ritardo sei arrivato alla destinazione finale?",
          voci: [
            { valore: "meno3", testo: "Meno di 3 ore" },
            { valore: "fra3e4", testo: "Fra 3 e 4 ore" },
            { valore: "oltre4", testo: "Più di 4 ore" },
            { valore: "nonRicordo", testo: "Non me lo ricordo" },
          ],
        },
      },
      bottone: "Scopri il verdetto",
      nota: seSiPaga(
        "Le risposte restano sulla tua verifica come dichiarazione. Rispondere non costa niente.",
        "Le risposte restano sulla tua verifica come dichiarazione. Il check resta gratuito.",
      ),
      notaDemo: "Esempio dimostrativo: il verdetto qui non vale per una pratica vera.",
    },

    /**
     * LE DUE DOMANDE SUI VOLI CANCELLATI.
     *
     * Scritte a fasce, non a date: chi ha volato mesi fa non ricorda "il
     * 14 marzo", ricorda "una settimana prima". Una domanda a cui si
     * risponde male vale un reclamo respinto, quindi qui si chiede solo
     * quello che una persona normale sa ancora dire con sicurezza.
     */
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
      bottone: "Scopri il verdetto",
      nota: seSiPaga(
        "Le risposte restano sulla tua verifica. Rispondere non costa niente.",
        "Le risposte restano sulla tua verifica. Il check resta gratuito.",
      ),
      notaDemo: "Esempio dimostrativo: il verdetto qui non vale per una pratica vera.",
      titoloChiuso: "Ecco com'è andata.",
      esitoIdoneo: "Rientri in una fascia",
      esitoChiuso: "Il verdetto",
      dopoIdoneo:
        "Da qui puoi aprire la pratica: prepariamo la lettera con i riferimenti di legge e il canale reclami della compagnia. Il reclamo lo invii tu e la compensazione arriva a te intera.",
    },

    /**
     * CODESHARE: il numero è di una compagnia, l'aereo era di un'altra.
     * Una parola come "codeshare" o "vettore operativo" qui non compare:
     * si chiede quello che la persona ha visto con i suoi occhi.
     */
    operativo: {
      occhiello: "Una domanda sola",
      titolo: "Di che compagnia era l'aereo?",
      testo:
        "Questo biglietto è venduto da una compagnia, ma il volo lo fa un'altra. Il reclamo va a chi l'ha fatto volare: se sbagliamo destinatario, la risposta è un no e basta.",
      aiuto:
        "Guarda la carta d'imbarco: di solito c'è scritto \"operato da\". Oppure ricorda il nome sulla fiancata dell'aereo o sulla divisa dell'equipaggio.",
      etichetta: "La compagnia che ha fatto il volo",
      segnaposto: "Scrivi il nome, per esempio Delta",
      nessuna: "Nessuna compagnia con questo nome fra quelle che conosciamo.",
      bottone: "Scopri il verdetto",
      nota: seSiPaga(
        "La tua risposta resta sulla verifica. Rispondere non costa niente.",
        "La tua risposta resta sulla verifica. Il check resta gratuito.",
      ),
      notaDemo: "Esempio dimostrativo: il verdetto qui non vale per una pratica vera.",
      nonSo: "Non me lo ricordo",
      nonSoTesto:
        "Va bene lo stesso: il caso resta incerto e non paghi niente. Se ritrovi la carta d'imbarco, torna e rifai il check.",
    },

    /** IDONEO: fatto oggettivo + fascia + cose da verificare. MAI "hai diritto a". */
    idoneo: {
      occhiello: "Verifica completata",
      titoloTemplate: "Il tuo volo è atterrato con {ritardo} di ritardo.",
      /* 🔴 NEGATO IMBARCO E COINCIDENZA PERSA HANNO UN TITOLO LORO.
         Fino all'11/08 usavano quello del ritardo, e uscivano 400 euro
         accanto a «atterrato con 2 h e 35 min di ritardo»: il ritardo
         di quel volo, che per questi casi non decide niente. Chi legge
         pensa che sotto le tre ore si prenda la compensazione, e se
         manda quella lettera si fa rispondere male. */
      titoloNegato: "Ti hanno lasciato a terra contro la tua volontà.",
      titoloCoincidenza: "Hai perso la coincidenza e sei arrivato con almeno tre ore di ritardo.",
      fattoNegato:
        "Volo {volo} del {data}. Qui il ritardo non conta: la compensazione per negato imbarco è dovuta subito (art. 4, comma 3).",
      fattoCoincidenza:
        "Volo {volo} del {data}. Conta il ritardo con cui sei arrivato alla destinazione finale, non quello di questo volo.",
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
        "Riguardando i dati del volo abbiamo trovato qualcosa che non torna con questo verdetto, quindi non lo vendiamo. Rifai il check fra qualche ora: se nel frattempo l'archivio si è aggiornato, il risultato cambia.",
      /* Compare SOLO quando una persona ha guardato il verdetto e l'ha
         dichiarato sbagliato.
         🔴 Prima diceva "un controllo umano conferma entro poche ore:
         lascia l'email e ti scriviamo noi", e compariva su OGNI verdetto,
         perché in produzione lo shadow mode è acceso da solo. Era il muro
         che ha rotto il collaudo del 12/08: al posto del bottone per
         comprare, un'attesa che nessuno aspetta. */
      shadow: "Questo verdetto non è vendibile.",
      /* {prezzo} e {prezzoFamiglia} li riempie Risultato col listino che
         quella persona sta vedendo (test dei due prezzi, 9/08). */
      cta: "Prepara la pratica a {prezzo}",
      ctaFamiglia: "Eravate in più sullo stesso volo? Fino a 5 passeggeri a {prezzoFamiglia}",
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
        nota: "La garanzia non cambia: se la compagnia non ti paga, ti rimborsiamo per intero.",
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
        seSiPaga(
          "Meglio così: vuol dire che sei atterrato quasi in orario. Se un altro volo ti è andato peggio, analizzalo.",
          "Meglio così. Il check resta gratis: se un altro volo ti è andato peggio, controllalo.",
        ),
      cta: "Controlla un altro volo",
      linkPromemoria: "Questo risultato resta a questo link: salvalo se ti serve.",
      suggerimentoOsservatorio:
        "Se vuoi tenere d'occhio i cieli, l'Osservatorio esce una volta a settimana.",
    },

    /** Il link porta a un controllo che non esiste (o non esiste più). */
    nonTrovata: {
      titolo: "Questo controllo non lo troviamo.",
      testo: seSiPaga(
        "Il link può essere sbagliato o vecchio. Rifai l'analisi in 30 secondi.",
        "Il link può essere sbagliato o vecchio. Il check è gratis: rifallo in 30 secondi.",
      ),
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
    /* 🔴 Valerio, 12/08: «quella esatta email perché serve, come viene
       usata e dove viene usata?». Non era una domanda da curioso: la
       riga di prima diceva "la usiamo solo per la tua pratica", che non
       spiega niente a chi la sta scrivendo adesso. Qui ci stanno i tre
       usi veri, in ordine di quando accadono, e nient'altro. */
    rassicurazione:
      "Tre cose, e basta: ti arriva subito il risultato col link per riprendere anche da un altro telefono; è l'indirizzo con cui entri nella pratica se la apri; ed è lì che ti scriviamo come procede. Niente pubblicità, niente liste.",
    /* Quando l'indirizzo non sta in piedi. Si dice cosa controllare, non
       "email non valida": chi ha sbagliato una lettera non sa quale. */
    errore: "Controlla l'indirizzo: manca la chiocciola o il punto finale.",
    conferma: "Fatto. Riepilogo in casella: ora prepariamo il reclamo.",
    /** Sugli esempi dimostrativi non c'è niente da salvare, e lo si dice. */
    demoNota: "Questo è un esempio dimostrativo: non c'è una pratica da salvare.",
  },

  condivisione: {
    titolo: "C'era qualcuno con te su quel volo?",
    didascalia: seSiPaga(
      "La compensazione spetta a ogni passeggero: chi era con te può analizzare il suo volo.",
      "Il check è gratis e la compensazione spetta a ogni passeggero.",
    ),
    /** La card che si condivide con un tocco. */
    card: {
      titoloTemplate: "Fascia da {importo}",
      sottotitoloTemplate: "Volo {volo}, atterrato con {ritardo} di ritardo",
      piede: seSiPaga("Controlla il tuo su Rivolio", "Controlla il tuo gratis su Rivolio"),
    },
    bottone: "Condividi la card",
    /** Dove navigator.share non c'è, si copia negli appunti e lo si dice. */
    copiato: "Testo copiato. Incollalo dove vuoi.",
    nonRiuscita: "Non riesco a copiare da qui. Condividi il link dalla barra del browser.",
    /** Testo pronto per la condivisione; il link lo aggiunge il codice. */
    testoTemplate:
      seSiPaga(
        "Il mio volo {volo} è atterrato con {ritardo} di ritardo: fascia da {importo} secondo il Regolamento CE 261/2004. Controlla il tuo:",
        "Il mio volo {volo} è atterrato con {ritardo} di ritardo: fascia da {importo} secondo il Regolamento CE 261/2004. Controlla il tuo, è gratis:",
      ),
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
      /* ---- quando il passo viene PRIMA della lettera (scelta di Valerio
         col popup del 12/08). Il tono cambia: non è più un extra che
         qualcuno farà, è la cosa da fare adesso, e dice perché conviene
         invece di dire che è obbligatoria. Nessuno carica un documento
         perché glielo ordinano; lo carica se capisce che gli serve. */
      passo: "Passo 1 di 2",
      titoloBloccante: "Prima carica la carta d'imbarco",
      testoBloccante:
        "La confrontiamo con gli orari archiviati del volo. Se combaciano, la compagnia ha un argomento in meno per dirti di no, ed è lì che si perdono i reclami. Ci vuole una foto.",
      saltaPremessa: "Non ce l'hai sottomano?",
      salta: "Vai avanti senza",
      /* ---- quando il reclamo è GIÀ PARTITO. Il riquadro resta, perché
         il documento serve ancora, ma non può più dire "prima carica" né
         promettere di rendere più solido un reclamo che è già uscito di
         casa: quello che rinforza adesso è il sollecito. Era il difetto
         della schermata 2 del 13/08, dove sopra una lettera spedita
         campeggiava ancora "PASSO 1 DI 2". */
      titoloDopo: "Puoi ancora aggiungere la carta d'imbarco",
      testoDopo:
        "Il reclamo è già partito, ma il documento serve ancora: se concorda con gli orari archiviati, rafforza il sollecito e la replica a un eventuale no. Quando la trovi, caricala qui.",
    },

    /* ---- la testata dell'area riservata (/app/layout) ---- */
    testata: {
      esci: "Esci",
      piede: "Rivolio · lo scanner dei rimborsi",
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
          seSiPaga(
            `Si parte sempre dall'analisi del volo: numero e data, ${PREZZO}. Se il volo rientra in una fascia, da lì apri la pratica e quei soldi si scalano.`,
            "Si parte sempre dal check: numero di volo e data, gratis. Se il volo rientra in una fascia, da lì apri la pratica.",
          ),
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
          "Niente da fare per ora: le compagnie rispondono in 8-14 settimane. Se restano in silenzio, alla sesta ti mandiamo il sollecito già pronto. Se invece rispondono no, dillo dalla pratica e la replica parte subito.",
      },
      sollecito: {
        nome: "Sollecito",
        descrizione:
          "Sei settimane, nessuna risposta: il sollecito è pronto. È il passaggio che la maggior parte delle persone salta. Tu no.",
        prossimoPasso:
          "Invia il sollecito che ti abbiamo mandato via email, sempre dalla tua casella.",
      },
      /* 🔴 QUESTO STATO SI CHIAMAVA "ENAC" E LO DICEVA A TUTTI. Ma la
         competenza è dello Stato dell'aeroporto di PARTENZA (art. 16 par.
         1), e la lettera dal giro #38 nomina l'ente giusto paese per
         paese: chi parte da Barcellona leggeva "ENAC" nella pratica e
         "non l'ENAC" nella propria lettera, nello stesso giro.
         Adesso il nome è neutro e l'ente vero lo dice la lettera, che è
         l'unico posto che sa da dove sei partito.
         Trovato dall'ispezione del 12/08. */
      enac: {
        nome: "Segnalazione all'ente",
        descrizione:
          "La compagnia rifiuta o tace: la contro-risposta e la segnalazione all'ente nazionale sono pronte.",
        prossimoPasso:
          "Apri la lettera: dentro trovi la segnalazione già scritta, con l'ente del paese da cui sei partito. È gratuita.",
      },
      esito_pagata: {
        nome: "Pagata dalla compagnia",
        descrizione: "La compagnia ha pagato. La compensazione è arrivata a te, per intero.",
        prossimoPasso:
          seSiPaga(
            "Niente da fare: la pratica è chiusa. Se un altro volo ti è andato storto, analizzalo.",
            "Niente da fare: la pratica è chiusa. Se un altro volo ti è andato storto, il check resta gratis.",
          ),
      },
      esito_rifiutata: {
        nome: "Rifiutata",
        descrizione: "La compagnia ha rifiutato la richiesta.",
        prossimoPasso:
          "Vale la garanzia: se la compagnia non ti paga, ti rimborsiamo la pratica per intero.",
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
        enac: "Segnalazione all'ente pronta",
        esito_pagata: "La compagnia ha pagato",
        esito_rifiutata: "La compagnia ha rifiutato",
        rimborsata: "Pratica rimborsata",
        rinuncia_recesso: "Rinuncia al recesso registrata",
        rinuncia_recesso_mancante: "Rinuncia al recesso da verificare",
        email_t0: "Email di conferma inviata",
        email_t2: "Promemoria d'invio inviato",
        email_sollecito: "Email col sollecito inviata",
        email_ente: "Email con la segnalazione all'ente inviata",
        email_esito: "Email di controllo esito inviata",
        rifiuto: "La compagnia ha risposto no",
        /* 🔴 Nella cronologia usciva la parola in codice "pratica_di_prova".
           Si vede nello screenshot che Valerio ha mandato il 12/08: fra
           due righe scritte in italiano ce n'era una scritta come la
           chiama il database. Un nome tecnico in mezzo alle cose che
           legge il cliente fa sembrare tutto un prototipo, ed è anche
           l'unico posto dove si capisce che quella pratica non è vera:
           merita una frase, non un identificatore. */
        pratica_di_prova: "Pratica di collaudo, nessun pagamento",
        documento_incrociato: "Documento confrontato con i dati del volo",
        documento_saltato: "Nessun documento caricato, per scelta",
        email_invio: "Email di conferma dell'invio inviata",
        // I nomi vecchi delle stesse tappe: le pratiche di prima li hanno
        // ancora scritti in cronologia e devono restare leggibili.
        email_t15: "Email col sollecito inviata",
        email_t30: "Email col reclamo ENAC inviata",
        email_t60: "Email di controllo esito inviata",
      },
      notaOrari: "Date e orari in ora italiana.",
    },

    azioni: {
      apriLettera: "Apri la lettera",
      /* ⚠️ IL BOTTONE DEVE DIRE COSA APRE, e cambia col momento. Dopo un
         no dichiarato il foglio non è più il reclamo: è la replica scritta
         su quel no. Chiamarlo ancora "la lettera" faceva credere di
         riaprire quella di prima, ed è metà del motivo per cui Valerio,
         dopo aver cliccato "maltempo", ha scritto «non è successo
         niente». */
      apriReplica: "Apri la replica",
      apriSegnalazione: "Apri la segnalazione",
      confermaInvio: "Ho inviato il reclamo",
      confermaInvioInCorso: "Un attimo.",
      confermaInvioFatta: "Registrato. Ricarico la pagina.",
      confermaInvioErrore: "Non sono riuscito a salvare. Riprova tra poco.",
      confermaInvioNota:
        "Premilo solo dopo aver spedito davvero l'email: da quel giorno partono i tempi del sollecito.",
      /* Compare quando la lettera è ancora chiusa dietro il passo dei
         documenti. Dice cosa manca, non "non puoi": chi ha appena pagato
         merita di sapere che il documento c'è e cosa lo apre. */
      letteraChiusa:
        "La lettera è pronta e si apre appena hai caricato la carta d'imbarco, qui sotto. Se non ce l'hai adesso, puoi andare avanti lo stesso.",
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
        "Se la compagnia rifiuta senza un motivo valido, o non risponde entro i termini di legge, ti rimborsiamo la pratica per intero. Il rimborso parte da noi, senza moduli da compilare.",
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
    testo: seSiPaga(
      `Trenta secondi, niente email, nessun conto da creare. L'analisi costa ${PREZZO}.`,
      "Trenta secondi, niente email, nessun conto da creare. Il check è gratis, sempre.",
    ),
    cta: "Controlla il tuo volo",
    /** Sotto i 360 punti di larghezza: il testo pieno non ci sta. */
    ctaCorta: "Controlla",
  },

  footer: {
    frase: "Rivolio è lo scanner dei rimborsi. Oggi i voli. Presto bagagli e treni.",
    cartolina: {
      titolo: seSiPaga(`L'analisi costa ${PREZZO}.`, "Il check è gratis."),
      corsivo: "Il ritardo è già tuo.",
      testo:
        "Numero del volo e data: in 30 secondi sai se rientri nelle fasce del CE 261/2004. Senza account, senza carta.",
      bottone: "Controlla il tuo volo",
      altTelefono: "L'app di Rivolio in mano: il check del volo sul telefono",
    },
    colonne: {
      prodotto: {
        titolo: "Prodotto",
        voci: [
          { testo: seSiPaga("L'analisi del volo", "Il check gratuito"), ancora: "#controllo" },
          { testo: "La web app", ancora: "/app" },
          { testo: "Come funziona", ancora: "#come-funziona" },
          { testo: "Prezzi", ancora: "#prezzi" },
          { testo: "Il Tabellone (blog)", ancora: "/tabellone" },
          { testo: "Sciopero aerei oggi", ancora: "/sciopero-aerei" },
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
          { testo: "La compagnia non paga?", ancora: "/giudice-di-pace" },
          { testo: "Tutte le risposte", ancora: "#domande" },
        ],
      },
      legale: {
        titolo: "Note legali",
        voci: [
          { testo: "Condizioni d'uso", ancora: "/condizioni" },
          /* ⚠️ "Rimborsi" nel footer NON e' un di piu': Dodo Payments lo
             pretende per far passare la verifica dell'account (email di
             Siva, 12/08), insieme a Condizioni, Privacy, prezzi chiari e
             l'avviso che non diamo pareri legali. */
          { testo: "Rimborsi", ancora: "/rimborsi" },
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
      "Rivolio genera documenti a partire da dati di volo verificati. Non è un intermediario, non offre consulenza legale, non incassa per conto tuo e non chiede la cessione del credito. Il reclamo lo invii tu, dalla tua email. Gli importi indicati sono le fasce del Regolamento CE 261/2004: l'esito della richiesta dipende dalla compagnia.",
    /** L'indirizzo vivo oggi: si cambia in uno @rivolio quando c'è il dominio. */
    supporto: { etichetta: "Supporto", email: "valerio@artecai.it" },
    copyright: "© 2026 Rivolio",
  },
} as const;

export type Copy = typeof COPY;
