# STATO — Rivolio

**Aggiornato:** 2026-08-10 (giro #49: L'APP MIGRA AL DESIGN DELLA TAVOLA
DEFINITIVA, terza ondata: la migrazione è COMPLETA per tutto ciò che è
onesto costruire oggi · giro #48: IL QUARTO COLPO, cioè quello che i
soldi li muove davvero, più la riforma del 2027 scritta e messa in
calendario · giro #47: LA SVIZZERA VERIFICATA, non più un
punto interrogativo · giro #46: IL GIRO DA UTENTE CRITICO, tre
difetti veri trovati e chiusi · il titolo della hero ha il font del
Tabellone · giro #45: IL DOPO-LETTERA, cioè il secondo e
il terzo colpo quando la compagnia dice no · ramo unito a main · giro #44: IL MOTORE CHE NON LASCIA PIÙ NESSUNO
SENZA RISPOSTA (la cache che congelava gli incerti, gli aeroporti che si
aggiornano da soli, i vettori extra UE, il codeshare che si chiede) ·
giro #43: IL CANCELLO TERRITORIALE LASCIAVA SOLDI
SUL TAVOLO, chiuso · giro #42: LE FOTO VERE sulle copertine del blog ·
giro #41: LE PAGINE EVENTO e l'autopilot degli
scioperi · giro #40: IL TABELLONE, il blog · più un
falso positivo sull'IMPORTO chiuso nel motore (art. 7 lett. b) ·
giro #39: test dei due prezzi · giro #38: garanzia legata all'ESITO invece
che ai 90 giorni, enti nazionali per paese di partenza nella lettera,
l'app ha finalmente i casi cancellato/negato imbarco/coincidenza persa ·
giro #37: cancello territoriale, chiuso un falso positivo vero (New York
→ Toronto usciva idoneo a 600€), banco di prova coi 30 casi reali, ricerca
su archivi, conversione e mercato · giro #36: repo BLINDATA — rate limit e
CORS chiusa su /api/verifica e tutte le rotte, poi= reso a prova di
open-redirect E di XSS in auth/conferma, header di sicurezza CSP ovunque,
strato anti-copia; banconote del confronto RIFATTE pulite (le vere hanno
"specimen" per legge, ora sono 100€ disegnate da noi), animazione più
lunga e umana, barra grigia tolta dalle scadenze, busta email 3D verde,
landing riordinata · giro #35: Rivoglio estinto anche nei
lockup spezzati e nel mockup, negato imbarco e coincidenza persa con
verdetto, banconote VERE nel confronto, aerei in volo sulle scadenze,
Entra dritto al login, ritardo in parole · giro #34: il marchio è RIVOLIO, i voli
cancellati hanno un verdetto vero, social veri, velo nero tolto · giro #33: firma del footer a tutta larghezza,
mano che entra in scena, check gratis con la sua scheda, confronto con le
banconote, casella che si cerca da sola, barre della scadenza, sezioni
"Cosa copre" e "Chi fa cosa" dal feedback esterno · giro #32: mockup del footer con l'app VERA,
monumenti sulle card dell'Osservatorio, doppio opt-in con conferma e
disdetta, tasti muti dell'anteprima app, skill copertura-prompt)
**RIVOLIO È COSTRUITO E ONLINE.** Il prodotto definito dal documento di
Valerio esiste da capo a fondo: check gratuito sul web col dato oggettivo,
verdetto a tre stati dal motore deterministico, pagamento Polar, lettera di
reclamo pronta, sequenza di follow-up, tracker, admin in shadow mode.
Rifinito con impeccable, taste e seo. Tagline: *Riprenditi i soldi che ti
devono.* Valerio ha messo online una copia su rivoglioo.netlify.app (suo
account) e ha scelto il **logo definitivo: la lente con l'aereo e le barre**
(vedi BRAND). L'8/08 sera: logo montato ovunque, footer con la cartolina
bianca e il telefono in mano (foto sua, sfondo tolto), FAQ centrata,
campo email dell'Osservatorio non più schiacciato sul telefono, immagine
social rifatta (era rimasta al prodotto viaggi).

## Dove siamo
- **GIRO #49 (10/08): L'APP MIGRA AL DESIGN DELLA TAVOLA DEFINITIVA.**
  Valerio ha consegnato la tavola finale di Claude Design (34 schermate,
  con le 9 correzioni di sostanza chieste col prompt: via il "Termine
  2031", via il meteo, via i prezzi dai bottoni, la lettera a 30 giorni,
  "non costituisce parere legale" sui fogli, l'onere della prova nella
  replica). Decisioni prese col popup: 4 tab (Home · Check · Pratiche ·
  Account), la Home compare con la prima pratica, NESSUNA cifra di
  prezzo nell'app finché dura il test A/B (la variante la decide un
  cookie del browser: l'app non può saperla), cinematica sulle 3 scene
  chiave. **Migrate finora 5 schermate su 34**, ognuna col giro visivo
  sull'app vera a 390px:
  1. **il verdetto** (giro precedente, commit "verdetto rifatto");
  2. **il check coi tre modi** (6a, 7a, 7b): tratta predefinita che
     cerca da sola, elenco che racconta i voli ("Doveva arrivare alle
     09:55. Atterrato alle 13:47" è un dato VERO: il fornitore manda
     l'orario aggiornato e la filiera lo buttava, ora è in
     `lib/voli/tratta.ts` con la sua prova), riquadro anti-prenotazione,
     conferma dei campi letti dalla carta;
  3. **la scena dell'analisi** (7c): schermo verde notte, biglietto di
     vetro coi dati veri, sei passi con la loro riga, "5 archivi su 6",
     contarello dei secondi;
  4. **la home premium** (3d): card "Richiesti alle compagnie" con la
     somma delle fasce dichiarata "a passeggero", contatori veri, "Da
     fare oggi" guidata dallo STATO (niente "giorno 42/42": il giorno
     d'invio non è nel dato dell'elenco e non si stima);
  5. **le 4 tab** coi nomi della tavola, Home e Classifica con lo stesso
     interruttore.
  - I valori esatti del design (colori, corpi, raggi, ombre) sono in
    `mobile/RIFERIMENTO-DESIGN.md`, estratti dal CSS della tavola: la
    palette combaciava con la nostra esadecimale per esadecimale. Il
    file da 1,8 MB resta fuori dal repo.
  - **SECONDA ONDATA (stessa giornata): migrate altre 11, siamo a 16 su
    34.** La pratica coi QUATTRO FOGLI (6e) con la scheda API estesa (i
    fogli li calcola il server, stesso codice del sito), il no della
    compagnia a scelta chiusa (6d) coi badge onesti, la conciliazione
    (6f) coi passi e ConciliaWeb, il foglio a schermo pieno (6g) con
    Copia e mailto, le pratiche aperte/chiuse col prossimo passo (7d) e
    lo stato vuoto (7e), il permesso notifiche cuscinetto (4g, prima
    della finestra di sistema), il codice a sei cifre via email (3c,
    accanto alla password: scelta "entrambi"), il portafoglio coi soli
    numeri veri (3f: niente cifre di acquisto finché non c'è un
    venditore).
  - **Restano 18 schermate**, quasi tutte di contorno: l'apertura
    cinematica (3a), il restyle di 6b/6c (cancellato e codeshare, che
    FUNZIONANO già con lo stile vecchio), gli stati d'errore dedicati
    (4a/4b/4c), il passaggio al pagamento (4d/4h, fermo con Polar), il
    rimborso (4i), l'esito celebrativo (3h), il tracker in volo (3i:
    servono dati che oggi non abbiamo), sicurezza account con Face ID
    (18: libreria in più).
  - **TERZA ONDATA (stessa giornata): la migrazione è COMPLETA.** Chiusi
    anche: il codeshare dentro il verdetto (6c: "Di che compagnia era
    l'aereo?", ricerca chiusa, il server richiude il verdetto), gli
    errori dedicati del check (4b volo non trovato coi tre controlli, 4c
    senza rete), il passaggio alla cassa (4d: il foglio che dice che si
    paga sul sito e perché, PRIMA di aprire il browser), gli esiti in
    faccia sulla pratica (3h "La compagnia ha pagato" con la fascia
    citata, 4i la garanzia rimborsata), la card del volo salvato con gli
    orari veri ("Doveva arrivare alle... Atterrato alle..."), la
    Classifica nel linguaggio nuovo, SICUREZZA E DATI (18) con cambio
    password, richiesta dei dati e **l'eliminazione dell'account vera**
    (rotta `/api/account/elimina`: conferma scritta, cancella pratiche,
    voli seguiti e profilo, anonimizza le verifiche, elimina l'accesso).
  - **Cosa della tavola NON è stato costruito, e perché è un motivo e
    non un ritardo:** il Face ID (libreria nativa: con gli store),
    l'elenco dei dispositivi collegati (servirebbe una tabella sessioni
    che non esiste: mostrarla finta è vietato dalla regola 3), la
    POSIZIONE dell'aereo nel tracker (nessun nostro fornitore pagato la
    dà; OpenSky è gratis ma vieta l'uso commerciale: in ARRETRATI la
    domanda ad AeroDataBox), il modulo "le fonti non concordano" con le
    due fonti affiancate (l'API oggi non espone le fonti separate: il
    caso esce incerto onesto, che è la stessa sostanza).
  - ⚠️ **Il codice via SMS che voleva Valerio richiede un fornitore a
    pagamento** (Twilio o simili su Supabase): in ARRETRATI, si decide
    coi confini di spesa. Il codice via EMAIL è vivo e gratuito.
  - **COLLAUDO FINALE: 834 verdi sul sito** (le 2 rosse sono le note
    dell'Osservatorio in sandbox, le 4 saltate la sveglia del 2027).
    Mobile: tipi, lint e jest verdi; giri visivi su check, scena, home,
    pratiche, pratica coi 4 fogli, accesso col codice, permessi,
    sicurezza e cassa: zero errori in console.
  - Prove: la suite della tratta 15 su 15 (dentro c'è quella nuova
    sull'arrivo aggiornato); l'ultima suite piena del sito resta quella
    del giro #48, 832 verdi. Mobile: tipi, lint e jest verdi, zero
    errori console nei giri visivi.
- **GIRO #48 (10/08): IL QUARTO COLPO. Perché la pratica finiva con un
  documento che, per sua natura, i soldi non li muove.**
  - 🔴 **LA SEGNALAZIONE ALL'ENTE NON PAGA, E LO SAPEVAMO.** Lo scriviamo
    da giorni al passeggero, correttamente: l'ente accerta la violazione e
    può sanzionare la compagnia, ma non liquida la compensazione. Lo dice
    la Commissione stessa nel PDF che Valerio ha aperto. Il problema è che
    quello era **l'ultimo foglio della pratica**: il cliente arrivava in
    fondo a tutto quello che aveva comprato e il bonifico non l'aveva
    ancora visto.
  - **ADESSO C'È IL BINARIO CHE PAGA: LA CONCILIAZIONE**
    (`lib/lettera/conciliazione.ts`). In Italia la gestisce l'**Autorità
    di regolazione dei trasporti** sulla piattaforma **ConciliaWeb**: è
    gratis, si fa da casa con SPID, e i casi del Regolamento CE 261/2004
    ci rientrano per espressa previsione. Le compagnie ci si siedono
    perché è un passaggio previsto prima della causa: **Ryanair gli dedica
    una sezione del proprio centro assistenza**, che è la prova migliore
    che il canale funziona. Partenza da un altro paese: la strada gratuita
    è la rete dei centri europei consumatori (ECC-Net), e non nominiamo un
    organismo che per quel paese non abbiamo verificato.
  - 🔴 **E APRE PRIMA DEL NOSTRO SOLLECITO, non dopo.** Servono il reclamo
    già mandato e poi 30 giorni di silenzio, oppure una risposta che non
    soddisfa. **Un no dichiarato apre subito.** Il nostro sollecito parte
    al giorno 42: allineare i due numeri "per coerenza" costerebbe al
    cliente due settimane di strada gratuita, e una prova lo vieta.
    ⚠️ La domanda va presentata **entro un anno dal reclamo**: è più corto
    dei due anni per fare causa, e chi non lo sa perde il canale migliore
    senza accorgersene.
  - 🔴 **/giudice-di-pace MANDAVA LA GENTE A SBATTERE.** Diceva "resta una
    strada sola: il giudice", ma nel trasporto il tentativo di
    conciliazione viene prima, ed è previsto come passaggio: chi deposita
    senza averlo nemmeno provato rischia di vedersi rimandare indietro e
    di aver buttato il contributo unificato. Adesso la pagina lo dice in
    cima, col link, e la sezione sull'avvocato resta dov'era.
  - **LE REPLICHE HANNO LE DUE GAMBE DELL'ART. 5 PAR. 3**
    (`ONERE_DELLA_PROVA`). Prima le repliche dicevano che il no non regge;
    adesso dicono anche **perché non tocca a te dimostrarlo**, e la cosa
    che le compagnie contano che tu non sappia: anche quando la
    circostanza è davvero eccezionale, l'esonero non scatta da solo, serve
    **anche** la prova di aver preso tutte le misure ragionevoli,
    riprotezione su altri vettori compresa. Sono due gambe, e la seconda è
    quella che spesso non hanno. Il paragrafo è scritto una volta sola ed
    entra nelle cinque repliche dove la compagnia invoca una circostanza:
    sulle altre tre (ritardo contestato, voucher, silenzio) sarebbe fuori
    luogo, e una prova lo tiene fermo.
  - **"NON COSTITUISCE PARERE LEGALE" IN FONDO A TUTTI E TRE I FOGLI.**
    Non è una formula di cortesia: ci tiene fuori dall'esercizio abusivo
    della professione, e non toglie forza alla lettera perché la forza sta
    negli orari certificati e nelle sentenze pubbliche, non nel farsi
    passare per avvocati. Una prova controlla che nessuno la tolga da
    nessuno dei tre.
  - **L'ARTICOLO SULLA RIFORMA DEL 2027 È ONLINE**
    (`/tabellone/riforma-261-2027-cosa-cambia`, in evidenza). È la parola
    chiave che tutti cercheranno da qui al 2027 e in italiano non l'ha
    scritta bene quasi nessuno: in giro si trovano ancora titoli tipo
    "addio ai rimborsi", che è falso, e articoli che raccontano il modulo
    precompilato e il pagamento automatico come se fossero legge, quando
    dal testo finale sono stati tolti. Il pezzo dice **quali numeri
    vengono dai comunicati e non dall'articolato in Gazzetta**: è la
    stessa trasparenza che vendiamo, applicata a noi.
    ⚠️ Corretto anche il pezzo sulla prescrizione, che diceva ancora "il
    testo non è ancora applicabile": era vero il 9/08, non più il 10.
  - **LE DUE SCADENZE DEL 2027 NON SONO PIÙ UNA NOTA IN UN FILE.**
    `prove/quarto-colpo.spec.ts` porta una **sveglia**: dal 1° maggio 2027
    la suite comincia a fallire se il retroattivo promette ancora "l'anno
    scorso" (il termine diventa 9 mesi) e se il sollecito è ancora a 42
    giorni (le compagnie ne avranno 30 per legge, quindi il giorno giusto
    per battere diventa il 31). Si spegne da sola appena le due modifiche
    sono fatte. Un ARRETRATI si può non leggere, una suite rossa no.
  - ⚠️ **Le fonti della conciliazione vanno rilette dal PC di Valerio**:
    da qui `autorita-trasporti.it` è bloccato dal proxy, quindi i numeri
    (gratis, un anno, 30 giorni) vengono dagli estratti dei motori di
    ricerca. In ARRETRATI, voce Q.
  - Prove: **832 verdi** (restano le 2 note dell'Osservatorio). Le 4
    saltate sono la sveglia del 2027, che dorme fino al 1° maggio e non
    è un buco: è il suo mestiere.
- **GIRO #47 (10/08): LA SVIZZERA NON È PIÙ UN PUNTO INTERROGATIVO.**
  - Dal giro #37 i voli svizzeri uscivano incerti perché non avevamo una
    fonte sotto mano. Adesso ce l'abbiamo, e sono **due indipendenti**: il
    Regolamento si applica in Svizzera per l'**Accordo bilaterale sul
    trasporto aereo** (Decisione 1/2006 del Comitato misto, che lo
    inserisce nell'allegato; le disposizioni introduttive dicono che i
    riferimenti agli Stati membri valgono anche per la Svizzera e che
    "vettore comunitario" comprende chi ha sede principale lì). L'**ENAC**,
    cioè l'ente a cui scriverebbe un passeggero italiano, elenca la
    Svizzera insieme a Norvegia e Islanda.
  - 🔴 **MA NON OVUNQUE, e questa è la parte che conta.** Sulle tratte fra
    Svizzera e paesi TERZI (in un verso o nell'altro) le compagnie
    svizzere, i tribunali svizzeri e l'UFAC **non applicano** le regole
    sulla compensazione. Quindi:
    - Zurigo → Roma = **coperto** (prima era incerto: vendita recuperata)
    - Roma → Zurigo = coperto, già dalla lettera a)
    - New York → Roma con Swiss = **coperto** (la licenza svizzera vale)
    - Zurigo → New York e New York → Zurigo = **incerti**, e non per
      prudenza nostra: è il limite vero dell'Accordo.
  - **ETICHETTA DEL GOLDEN SET CAMBIATA, la terza volta in assoluto, e la
    PRIMA nella direzione difficile** (da "non lo so" a "sì"). Va detto:
    finora si era sempre andati verso il no. Qui la fonte c'è, è doppia, e
    una delle due è l'ente competente per i nostri utenti. Regole alla
    versione **2026.08.8**, golden set da 55 a **58 casi**, **58 su 58,
    falsi positivi 0**.
  - **IL CAMPO MORTO È SPARITO**: `autoritaNazionale` dentro
    `compagnie.ts` era agganciato alla COMPAGNIA, ma la competenza è dello
    Stato dell'aeroporto di PARTENZA (art. 16 par. 1). Non lo usava
    nessuno: il rischio era che un domani qualcuno lo ripescasse
    credendolo buono. Tolto da tutte e 20 le schede, con una prova che
    vieta di rimetterlo.
  - ✅ **GLI ENTI NAZIONALI SONO COMPLETI: 29 paesi.** Valerio ha aperto
    il PDF ufficiale della Commissione (13 luglio 2026) e me ne ha passato
    il testo. Aggiunti Croazia, Slovenia, Slovacchia, Romania, Cipro,
    Estonia, Lettonia, Lituania **e la Svizzera**. Il Liechtenstein resta
    fuori perché nel PDF non c'è, né fra gli Stati membri né fra i paesi
    SEE: non si inventa.
  - 🔴 **E IL PDF HA FATTO EMERGERE TRE ERRORI VERI nella tabella che
    avevamo.** In **Ungheria**, **Finlandia** e **Norvegia** mandavamo il
    passeggero all'autorità dell'aviazione civile, ma in quei tre paesi i
    casi individuali li tratta un altro ufficio: il PDF ungherese lo
    scrive in modo esplicito ("i reclami mandati qui non vengono
    trattati"). Chi seguiva la nostra lettera scriveva a chi non gli
    avrebbe risposto. Corretti tutti e tre, più la Polonia (il Difensore
    dei passeggeri, non l'autorità). **La Svizzera nel PDF sta nella
    sezione dei paesi che applicano norme equivalenti: è la terza conferma
    indipendente del giro #47.**
  - **L'INDIRIZZO DEL SITO NON È PIÙ SCRITTO A MANO DA NESSUNA PARTE.**
    Il web già leggeva tutto da `NEXT_PUBLIC_SITO`; l'app invece aveva
    `rivoglio.netlify.app` scritto in quattro punti (l'invito agli amici,
    la voce del profilo, il messaggio di riserva, l'esempio della
    lettera). Adesso leggono tutti `SITO`: il giorno del dominio si
    cambia una variabile e si muove tutto, invece di lasciare in giro
    inviti che portano a un sito morto.
  - **`DOMINIO-E-EMAIL.md` e `POLAR-PASSO-PASSO.md`**: le due cose che
    deve fare Valerio, scritte un passo alla volta, coi riquadri da
    copiare. Più `SENTENZE-DA-CONTROLLARE.md`, i quattro indirizzi delle
    sentenze citate nelle repliche, con scritto accanto cosa ognuna deve
    dire.
  - Prove: **776 verdi** (restano le 2 note dell'Osservatorio), app
    tipi/lint/jest tutti verdi.
- **GIRO #46 (10/08): IL GIRO DA UTENTE CRITICO. Sito, blog, pagine
  evento e web app provati come dieci persone normali, a 1440 e a 390.**
  - 🔴 **CHI SCRIVEVA "ROMA" VEDEVA L'AEROPORTO SBAGLIATO SCRITTO GIUSTO.**
    L'elenco rispondeva: *Rome* (Fiumicino), *Rome* (Ciampino), e poi
    *"Roma"*, che è una cittadina in **Australia**. L'unica voce scritta
    come l'aveva scritta lui era quella sbagliata. Ora la città esce in
    italiano (`inItaliano`, che c'era già ma non veniva applicato alla
    ricerca) e anche il **paese**: "Italia", "Stati Uniti", "Regno Unito",
    presi dal codice ISO che ogni scalo si porta dietro dal giro #44,
    senza nessuna tabella scritta a mano.
  - 🔴 **LA LANDING DICHIARAVA DI NON COPRIRE UNA COSA CHE COPRE.** Nella
    colonna "Non ancora" c'era ancora *"Negato imbarco e coincidenza
    persa: è il prossimo pezzo che costruiamo"*, ma quel pezzo esiste dal
    giro #35. Una vendita persa scritta nero su bianco sulla pagina
    principale. Spostati nella colonna gialla con la loro spiegazione, e
    la FAQ non dice più "cancellazioni e negato imbarco arrivano a breve".
  - 🔴 **CHI SBAGLIAVA A SCRIVERE IL NUMERO VENIVA MANDATO AD ASPETTARE.**
    Il messaggio diceva solo "il volo è recente, ricontrolla domani". Ma
    un refuso è comune quanto un volo fresco, e domani quel numero non
    esisterà lo stesso: la persona torna, riprova e se ne va. Ora il
    messaggio dice tutte e due le possibilità e manda a controllare il
    numero sulla carta d'imbarco.
  - **IL TITOLO DELLA HERO HA LA TIPOGRAFIA DEL TABELLONE** (richiesta di
    Valerio). Il carattere era già lo stesso: a cambiare erano il peso
    (500 contro 700) e la spaziatura, e a quella dimensione bastano a far
    sembrare due font diversi.
  - **Cosa NON era rotto, anche se sembrava:** il cerchio nero in basso a
    sinistra è l'indicatore di Next in sviluppo e online non c'è; le
    sezioni "bianche" nelle catture a pagina intera sono un artefatto di
    Playwright con le animazioni (scorrendo davvero ci sono tutte); il
    verdetto idoneo il bottone d'acquisto ce l'ha. **Le catture a pagina
    intera su questo sito non fanno testo: vanno fatte scorrendo.**
  - Controllati anche: **40 link interni, zero rotti**; nessun errore in
    console su 13 pagine; nessuno scorrimento orizzontale su telefono;
    nessuna immagine rotta.
  - Prove: **758 verdi** (restano le 2 note dell'Osservatorio). Le 20
    nuove sono `prove/giro-utente.spec.ts`, una per ogni difetto trovato.
- **GIRO #45 (10/08): IL DOPO-LETTERA. Fino a ieri il cliente si prendeva
  un no e restava lì.**
  - 🔴 **PRIMA COSA, IL RAMO È STATO UNITO A `main`.** `main` era fermo 79
    commit indietro, al pivot del nome: motore, blog, pagine evento e
    sicurezza vivevano solo sul ramo laterale. Il sintomo che lo ha fatto
    scoprire: la scheda Actions di GitHub era vuota, perché **i lavori
    programmati si leggono SOLO dal ramo predefinito**, quindi l'autopilot
    degli aeroporti non poteva nemmeno comparire. Da qui in avanti si
    lavora su `main` e basta (decisione di Valerio, 10/08).
  - **IL SECONDO COLPO: LA REPLICA CAMBIA COL NO CHE HAI RICEVUTO**
    (`lib/pratiche/rifiuto.ts`). Otto motivi a scelta chiusa, ognuno con la
    sua replica scritta una volta. Il motivo non è un dato da collezione:
    decide il paragrafo centrale del sollecito. A un guasto tecnico si
    risponde che gli aerei si rompono e fa parte del mestiere; a uno
    sciopero del PERSONALE DELLA COMPAGNIA si risponde che i rapporti coi
    propri dipendenti non sono una circostanza eccezionale; al silenzio che
    il silenzio non estingue niente. Un testo libero non avrebbe permesso
    di decidere nessuna di queste cose.
    ⚠️ **Due motivi su otto dicono in faccia che la compagnia può avere
    ragione** (maltempo e sciopero dei controllori). Una prova impedisce di
    venderli come vittorie sicure a chi ha appena pagato.
  - 🔴 **I TEMPI ERANO SBAGLIATI, e di molto.** Il sollecito partiva al
    giorno 15 e la segnalazione all'ente al 30: ma le compagnie rispondono
    in 8-14 settimane, quindi quel sollecito arrivava prima che qualcuno
    avesse aperto la pratica. Ora **42 giorni** (che è anche il termine che
    l'ENAC indica prima di poterlo interpellare) e **56**. I nomi vecchi
    delle tappe restano riconosciuti: nessuna pratica riceve due volte la
    stessa email. **Il rifiuto dichiarato scavalca il calendario**: se la
    risposta è già arrivata, aspettare altre cinque settimane sarebbe
    assurdo.
  - **SULLA PRATICA C'È IL BOTTONE** "La compagnia ti ha risposto no?", con
    gli otto motivi. Non è un'email che arriva un giorno a caso: il no
    arriva quando arriva, e chi se lo becca dopo dieci giorni non deve
    restare fermo a guardare per un mese e mezzo.
  - **SULLA PAGINA DELLA LETTERA CI SONO TRE FOGLI**, che compaiono uno
    alla volta quando servono: il reclamo, il sollecito (o la replica al
    loro no), la **segnalazione all'ente nazionale già scritta**
    (`generaSegnalazioneEnte`), con dentro il volo, il ritardo verificato e
    le date dei due invii. L'ente lo sceglie il paese di PARTENZA, come da
    art. 16 par. 1: la tabella dei 20 paesi c'era già dal giro #38.
    ⚠️ La segnalazione **non promette che l'ente paga**, perché non paga:
    accerta e sanziona. Una prova vieta di lasciarlo credere.
  - **`/giudice-di-pace`: la guida onesta** (scelta di Valerio col popup).
    Dice la cosa che quasi nessuno sa, cioè che per una causa da 250-600
    euro **non serve per forza un avvocato**, e dice anche quando NON
    conviene. Nessun atto preparato da noi e nessuna consulenza: non siamo
    avvocati, e Polar vieta i servizi umani.
    ⚠️ **Nessuna cifra precisa nella pagina, di proposito**: il contributo
    unificato cambia nel tempo, e una cifra sbagliata in una pagina che
    parla di soldi è peggio di nessuna cifra. Una prova lo tiene fermo.
  - **IL POPUP DELLE DOMANDE NON SCADE PIÙ.** Valerio rispondeva e il
    riquadro si chiudeva da solo: non era distrazione sua, dalla versione
    2.1.198 di Claude Code il riquadro si auto-risponde dopo 60 secondi.
    `askUserQuestionTimeout: "never"` in `.claude/settings.json`, che è
    tracciato e vale su ogni macchina. Il limite di **4 domande e 4 opzioni
    è invece un limite vero** e non si alza: sta nella documentazione
    ufficiale.
  - **Sistemata una prova che falliva a caso**: l'immagine social si
    disegna a ogni richiesta e col carico della suite intera il server
    locale chiudeva la connessione. Ora riprova due volte prima di dire che
    è rotta: una prova che fallisce a caso è peggio di una prova che non
    c'è.
  - Prove: **738 verdi** (restano le 2 note dell'Osservatorio). Le 28 nuove
    sono sul dopo-lettera. ⚠️ Migrazione `2026-08-15-dopo-lettera.sql` da
    applicare: è dentro `supabase/DA-APPLICARE.sql`, punto 5.
- **GIRO #44 (9/08 notte): PERCHÉ FR4001 NON FUNZIONAVA, E LE ALTRE TRE
  COSE CHE LASCIAVANO GENTE SENZA RISPOSTA.**
  - 🔴 **LA CACHE POTEVA CONGELARE UN "INCERTO" PER SEMPRE.** È questo il
    motivo di FR4001 del 6 agosto, il volo che ha provato Valerio. La riga
    di quel volo era stata salvata l'8/08, quando il cancello territoriale
    non esisteva ancora e gli scali non si scrivevano. Da quel momento
    OGNI check su quel volo, di chiunque, rispondeva "non riconosciamo
    l'aeroporto di partenza": il fornitore non veniva più interpellato,
    quindi il dato buono non poteva arrivare. **La cache è una fotografia,
    e una fotografia sbagliata non si corregge da sola.** Ora
    `rigaUsabile` (in `lib/voli/verifica.ts`) butta la riga che non sa
    dire da dove si parte, dove si arriva o quanto è lunga la tratta, e il
    volo si richiede. Non è un problema di ieri: vale ogni volta che il
    motore impara a usare un dato nuovo. **8 prove.**
  - 🔴 **IL PAESE DEGLI SCALI NON VENIVA SALVATO.** Il fornitore lo manda,
    il motore lo usa, ma in cache non ci finiva: il primo passeggero
    chiudeva il caso, il secondo ripartiva senza. Quattro colonne nuove su
    `voli` (`partenza_paese`, `arrivo_paese`, `partenza_icao`,
    `arrivo_icao`). ⚠️ Finché la migrazione non è applicata, il codice se
    ne accorge e riprova senza quelle colonne: la cache non si spegne.
  - **GLI AEROPORTI NON SONO PIÙ FERMI AL 2017.** L'archivio veniva da
    OpenFlights, che ha smesso di aggiornarsi: ogni scalo nuovo del mondo
    era una vendita persa. Ora c'è **l'autopilot**
    (`.github/workflows/aeroporti.yml` + `scripts/aeroporti-aggiorna.mjs`):
    ogni lunedì alle 5:10 UTC GitHub scarica l'elenco pubblico di
    OurAirports, lo converte, **lo controlla** e committa solo se è sano.
    Netlify vede il commit e ricostruisce. Se il file arriva monco o la
    fonte cambia colonne, il lavoro fallisce e non pubblica niente: meglio
    un archivio vecchio di una settimana che uno rotto in produzione.
    ⚠️ **Da qui non l'ho potuto provare sul dato vero**: il proxy risponde
    403 a OurAirports. Il primo giro lo fa GitHub (in ARRETRATI come
    forzarlo a mano).
  - **OGNI SCALO HA IL SUO CODICE PAESE** (6.068 su 6.073; i 5 senza sono
    le vecchie Antille Olandesi, uno Stato che non esiste più dal 2010).
    Il cancello territoriale adesso legge il CODICE, non la grafia del
    nome: se un aggiornamento scrivesse "Czechia" al posto di "Czech
    Republic", il confronto per nome smetterebbe di funzionare in silenzio
    e i voli da Praga uscirebbero incerti.
    ⚠️ **Una prova ha trovato un errore vero mentre lo costruivo:** la
    tabella dei paesi di Node risponde "Germany" anche al codice della
    Germania Est (DD, ritirato), e girando l'alfabeto in ordine DD si era
    preso il posto di DE. Berlino Brandeburgo si era ritrovata in un paese
    che non è nell'Unione. Chiuso confrontando ogni codice con la sua
    forma canonica.
  - **I GRANDI VETTORI EXTRA UE SI RICONOSCONO** (`lib/regole/vettori.ts`,
    55 compagnie con nome e paese della licenza). Prima un New York → Roma
    con Delta usciva incerto: non perché il caso fosse dubbio, ma perché
    il codice non sapeva che Delta è americana. Ora esce un no pulito.
    Stanno FUORI da `compagnie.ts` di proposito: quel file dichiara canali
    reclamo verificati a mano, e per queste non li abbiamo.
    ⚠️ **La Svizzera resta incerta di proposito**, anche dal lato
    compagnia: applica il Regolamento per accordo bilaterale e senza una
    fonte verificata non ci sbilanciamo. Serve Valerio (ARRETRATI G).
  - **IL CODESHARE SI CHIUDE CON UNA DOMANDA.** Quando il fornitore non sa
    chi ha operato il volo, il reclamo rischia di partire verso la
    compagnia sbagliata e il motore si ferma. Ma quella risposta l'utente
    ce l'ha sotto gli occhi, sulla carta d'imbarco. Ora gliela chiediamo:
    "Di che compagnia era l'aereo?", con la ricerca per nome sulle 55+20
    compagnie che conosciamo. **La parola "codeshare" all'utente non
    compare mai.** La scelta è chiusa, il verdetto resta del server
    (`lib/regole/operativo.ts` + `/api/verifica/operativo`).
  - **UNA ETICHETTA DEL GOLDEN SET CAMBIATA, la seconda volta in assoluto.**
    Il caso Delta New York → Roma era etichettato incerto: ma quella
    etichetta fotografava un limite del nostro codice, non il Regolamento.
    Il verso del cambiamento è sicuro: da "non lo so" a "no", mai a "sì".
    Golden set da 52 a **55 casi**, **55 su 55, falsi positivi 0**.
  - **`MOTORE.md`: di cosa è fatto il motore, spiegato senza gergo.**
    Cinque pezzi, uno solo usa l'AI, Python non c'è. Dentro c'è anche la
    risposta alla domanda di Valerio: **sì, sito e app usano lo stesso
    Supabase, ed è uno solo.** Il check l'app non lo calcola, lo chiede al
    sito: il motore è uno, e se cambia una regola cambia per tutti e due
    nello stesso istante.
  - **`supabase/DA-APPLICARE.sql`: le quattro migrazioni in un file solo**,
    con le istruzioni passo passo e il controllo finale. Si può rilanciare
    quante volte si vuole. ⚠️ **Da qui non si applica**: l'egress blocca
    `*.supabase.co` e il connettore Composio, che Valerio ha indicato, non
    si può autorizzare in una sessione senza schermo (serve il login).
  - Prove: **682 verdi** (restano le 2 note dell'Osservatorio). Le nuove
    sono 41: cache, archivio scali, codeshare e licenze.
- **GIRO #43 (9/08 notte): «NON RICONOSCIAMO L'AEROPORTO DI PARTENZA» ERA
  UN BUCO NOSTRO, NON UN LIMITE DEI DATI.**
  - Valerio ha fatto un check e gli è uscito «Non riconosciamo l'aeroporto
    di partenza». Aveva ragione a incazzarsi: erano **tre buchi diversi**,
    tutti nella direzione sbagliata, cioè quella che perde vendite vere.
  - 🔴 **1. L'archivio degli scali è una fotografia del 2017.** Il cancello
    territoriale cercava il paese confrontando i NOMI dentro
    `aeroporti.json`, che viene da OpenFlights e non si aggiorna dal 2017:
    **Berlino Brandeburgo, aperto nel 2020, non c'era**. Un Milano →
    Berlino con quattro ore di ritardo usciva incerto. Ora il paese arriva
    **insieme al volo**, dal fornitore (`countryCode`), che è un dato di
    prima mano e non invecchia; l'archivio resta come seconda strada, e
    BER è stato aggiunto.
  - 🔴 **2. Senza sigla IATA il motore si fermava.** Se il fornitore non
    manda la sigla dello scalo (succede), non c'era altra strada. Ora ce
    ne sono tre in fila: il paese dal fornitore, poi l'archivio per sigla,
    poi il **prefisso ICAO** (LI = Italia, ED = Germania, LF = Francia...).
    L'ICAO può solo dire «sì, è Europa»: non lo usiamo mai per dire di no.
  - 🔴 **3. La scorciatoia che mancava.** Se si ATTERRA in Europa e chi ha
    operato il volo ha licenza europea, il volo è coperto **comunque**: o
    partiva dall'Europa (lettera a) o partiva da un paese terzo con vettore
    comunitario (lettera b), e le due strade portano allo stesso posto.
    Non serve sapere da dove è decollato. Prima, con la partenza ignota,
    quel caso usciva incerto pur avendo una risposta certa.
  - **UNA ETICHETTA DEL GOLDEN SET ERA SBAGLIATA, e si è cambiata lei.**
    Il caso «aeroporto di partenza non riconosciuto» era etichettato
    incerto: ma quel volo atterra a Roma con Ryanair, ed è coperto. La
    vecchia etichetta fotografava un limite del nostro codice, non il
    Regolamento. È il primo caso in cui si tocca un'etichetta, e il perché
    sta scritto nel file accanto alla riga.
  - **PRUDENZA NUOVA SULLA SVIZZERA**: prima usciva un no secco, adesso
    esce incerto. La Svizzera applica il Regolamento per accordo
    bilaterale e non come Stato membro: dire di no su quei casi era una
    risposta sbagliata data con sicurezza. Resta da verificare (ARRETRATI).
  - **DUE VOLI DIMOSTRATIVI NON DIMOSTRAVANO PIÙ NIENTE**: dopo il fix
    dell'art. 7 lett. b) del giro #40, ZZ300 e ZZ600 (tratta Bergamo →
    Palermo, tutta dentro l'Unione) mostravano 400€ invece di 300 e 600.
    Ora volano Roma → New York, e **una prova lega la descrizione di ogni
    volo demo al verdetto vero**: se un domani divergono, la suite si
    ferma.
  - Regole alla versione **2026.08.7**. Golden set da 45 a **52 casi**,
    con dentro Berlino, il volo senza sigla IATA, quello col solo ICAO e
    la scorciatoia. **52 su 52, falsi positivi 0.**
  - Prove: **596 verdi** (restano le 2 note dell'Osservatorio).
- **GIRO #42 (9/08 sera): LE COPERTINE DEL BLOG SONO FOTO VERE.**
  - Valerio ha generato le dieci immagini coi prompt di `COPERTINE.md` e le
    ha spinte su `main`, a 2624x1632 e 8 MB l'una. Da lì le ho prese,
    lavorate e montate: **nove su dieci sono online** al posto delle
    illustrazioni. Il blog adesso somiglia al riferimento non solo nella
    struttura ma anche nel materiale.
  - **LA FILIGRANA GEMINI NON STA NELL'ANGOLO**, e questo cambia il taglio:
    è una stellina larga un centinaio di pixel piazzata *dentro*
    l'immagine, a 230 pixel dal bordo destro e 190 dal basso. Tagliare la
    striscia in fondo (la scelta iniziale di Valerio) sarebbe costato il
    19% dell'altezza; tagliando da destra ne basta l'11%. Si taglia da
    destra, poi si riporta l'inquadratura a 16:10 togliendo il resto dal
    basso, dove c'è solo pavimento. Lo fa `scripts/copertine.mjs`, che
    **si ferma e non pubblica** se il ritaglio comprende la filigrana.
    ⚠️ La filigrana INVISIBILE (SynthID) resta dentro i pixel: non si
    toglie e non si vede.
  - **CONTROLLO FATTO**: ho guardato l'angolo in basso a destra di tutte e
    nove le copertine lavorate, una per una. Pulite. Ogni file è 1600x1000
    WebP fra i 73 e i 315 KB.
  - 🟡 **LA DECIMA NON È USABILE E NON L'HO MESSA.** La foto per l'articolo
    easyJet inquadra due pile di fogli con titoli leggibili che parlano di
    un report sull'energia rinnovabile, e sotto un testo finto: a
    dimensione di copertina si legge, e fa sembrare la pagina montata a
    caso. Quell'articolo tiene l'illustrazione. In `COPERTINE.md` il
    prompt numero 4 è stato riscritto per pretendere fogli **bianchi e
    vuoti**: si rigenera solo quella.
  - Una prova nuova: se un articolo dichiara una foto e il file non c'è, la
    suite si ferma. Senza, la card resterebbe vuota e nessuno se ne
    accorgerebbe finché non lo vede un lettore.
  - ⚠️ **Le dieci immagini originali (84 MB) sono nella radice di `main`.**
    Vanno tolte da lì: gonfiano ogni clone. La cartella giusta è
    `public/assets/tabellone/originali/`, che è di scarico e si svuota.
  - Prove: **578 verdi** (restano le 2 note dell'Osservatorio).
- **GIRO #41 (9/08): LE PAGINE EVENTO, E GLI SCIOPERI CHE SI AGGIORNANO DA SOLI.**
  - **TRE FAMIGLIE DI PAGINE che si costruiscono dai nostri dati**, senza
    scrivere una riga a mano (scelta di Valerio: tutte e tre).
    1. **`/sciopero-aerei`**: la pagina fissa che risponde a "sciopero aerei
       oggi". È la più importante: quel giorno lì la gente cerca quello, non
       "reclamo Ryanair", e il blog quella ricerca non la prende perché non
       può avere un articolo per ogni giorno del calendario. Dice com'è messa
       oggi, elenca le date proclamate, spiega cosa spetta comunque.
    2. **`/sciopero-aerei/<data>`**: una pagina per ogni sciopero in tabella.
       Cambia testo secondo il momento: prima serve a chi ha il biglietto,
       il giorno stesso a chi è bloccato, dopo a chi vuole i soldi.
    3. **`/aeroporto/<sigla>`**: otto pagine, una per scalo dell'Osservatorio,
       coi ritardi della giornata. "Ritardi Fiumicino oggi" si cerca 365
       giorni all'anno, anche senza scioperi.
    Dentro ognuna c'è il check VERO (lo stesso componente dell'hero), il
    blocco "cosa ti spetta comunque", la tabella dei tipi di sciopero, i
    ponti verso gli articoli del Tabellone e le fonti dichiarate.
  - **LA DISTINZIONE CHE VALE I SOLDI, scritta nero su bianco**: lo sciopero
    del personale DELLA COMPAGNIA in linea di principio non è circostanza
    eccezionale (la compensazione di solito spetta); quello dei controllori
    viene da fuori e di solito lo è. In ogni caso deve essere la compagnia a
    provare il legame col TUO volo. I portali si fermano a "lo sciopero è
    circostanza eccezionale", che è la versione comoda per loro.
  - **L'AUTOPILOT** (`lib/scioperi/raccolta.ts` + `/api/motore/scioperi` +
    `netlify/functions/scioperi.mjs`, ogni giorno alle 4:20 UTC). Scarica le
    pagine pubbliche (cruscotto MIT, Commissione di Garanzia, ENAC), le fa
    trascrivere a un modello e fa passare OGNI riga da un filtro
    deterministico prima del database: data valida e in una finestra
    credibile, testo che parla davvero di volo, codici compagnia in formato
    IATA, link alla fonte obbligatorio. Non cancella mai niente.
    ⚠️ **Perché qui l'AI è ammessa** mentre nel verdetto non lo è mai: un
    errore di questo modulo può solo segnare come sciopero un giorno che non
    lo era, e allora il motore diventa PIÙ prudente (quel volo esce incerto,
    e un caso incerto non si vende). Sbaglia dalla parte di chi non paga.
    ⚠️ **Non l'ho potuto provare da qui**: il proxy non apre nessuna delle
    fonti. Per questo NON fallisce in silenzio: se non legge niente manda
    un'email di allarme (e un Telegram, se c'è il canale), e si può lanciare
    a mano da `/api/motore/scioperi?segreto=...` per guardarlo funzionare.
    **Il primo giro vero lo deve fare Valerio dopo il deploy.**
  - **UNA CERTEZZA INVENTATA, CHIUSA**: con il database irraggiungibile la
    pagina scriveva "oggi non risultano scioperi", che è una cosa che non
    sappiamo. Ora la lettura distingue "letto e non c'è niente" da "non si è
    aperto", e nel secondo caso lo dice.
  - Prove: **578 verdi** (restano le 2 note dell'Osservatorio). Le 40 nuove
    sono quasi tutte sul filtro dell'autopilot: è l'unico punto del progetto
    dove un modello scrive nel database, e quello che scrive finisce su una
    pagina pubblica col nostro nome sopra.
- **GIRO #40 (9/08): IL TABELLONE, IL BLOG. E UN FALSO POSITIVO SULL'IMPORTO,
  TROVATO SCRIVENDOLO.**
  - 🔴 **IL MOTORE PROMETTEVA 600 EURO DOVE LA NORMA NE DÀ 400.** L'art. 7
    lett. b) tiene a 400€ **tutte** le tratte intracomunitarie sopra i 1500 km,
    quanto lunghe siano: Parigi → Riunione fa 9.300 km ed è Francia-Francia.
    Il motore guardava solo il chilometraggio e usciva con 600. È un falso
    positivo sull'IMPORTO, cioè la stessa famiglia del New York → Toronto del
    giro #37: si promette al passeggero la metà in più di quanto gli
    riconosce il Regolamento, e la differenza la scopre la compagnia.
    Chiuso in `lib/regole/eu261.ts` col cancello `zonaDiScalo` già esistente;
    regole alla versione **2026.08.6**; golden set con **2 casi nuovi**
    (Parigi → Riunione e Helsinki → Canarie) e i tre casi di lungo raggio
    riscritti su tratte extra UE, se no misuravano il contrario di quello che
    dicevano. **45 su 45, falsi positivi 0.** Trovato scrivendo l'articolo
    pilastro: è il motivo per cui il blog serve anche a noi.
  - **IL BLOG SI CHIAMA «IL TABELLONE»** (scelta di Valerio col popup) e vive
    su `/tabellone`. È ricostruito **elemento per elemento sul riferimento
    Untitled UI** che Valerio ha allegato: testata piatta col menu argomenti,
    apertura con occhiello, titolo grosso e la seconda parte in corsivo serif,
    campo email, adesivo olografico, "Gli ultimi articoli" col pezzo grande a
    sinistra e due orizzontali a destra, "Tutti gli articoli" a tre colonne,
    paginazione Precedente/Successivo. Colori nostri: il fondo è una **carta
    calda** (`--color-carta`), l'unico posto del sito dove il fondo cambia,
    e serve a far capire con gli occhi che si è passati dal prodotto alla
    lettura.
  - **LA SEZIONE NEWSLETTER È LO STESSO BLOCCO DELL'APERTURA**, come chiesto:
    stessi elementi, stesso adesivo, stesso campo; cambiano solo il fondo
    (verde notte) e le parole. Non è una lista nuova: chiama la stessa
    `/api/iscriviti` dell'Osservatorio, quindi vale il doppio opt-in di sempre.
  - **DIECI ARTICOLI VERI**, non due: 2 guide pilastro, 3 per compagnia
    (Ryanair, easyJet, Wizz Air), 1 di situazione (la prescrizione), 2 di
    emergenza (sciopero e volo cancellato, scritti per lo schermo di un
    telefono in aeroporto) e 2 sui dati (Eurocontrol/ENAC 2025 e gli scali
    italiani 2026). Ognuno ha il check VERO dentro il testo a metà articolo
    (non un rimando: lo stesso componente dell'hero), il confronto coi
    portali, l'invito all'Osservatorio, le domande in fondo e **le fonti
    dichiarate una per una**.
  - **LA REGOLA DEI NUMERI È DIVENTATA UNA PROVA.** `prove/tabellone.spec.ts`
    (162 prove) vieta il trattino lungo e "hai diritto a" in ogni articolo,
    controlla che ogni copertina esista, che ogni link interno porti a una
    pagina vera, che ogni articolo abbia il suo gancio e le sue fonti, e che
    ogni pezzo rimandi a un pilastro. **Fuori dagli articoli sono rimaste solo
    cifre con la fonte:** le percentuali dei portali sono state tolte tutte
    (nessun listino è stato riaperto oggi), resta il solo dato che Ryanair
    scrive sul proprio sito (oltre il 40% trattenuto su un reclamo da 250€).
  - ⚠️ **I PREZZI NON SI SCRIVONO PIÙ NEGLI ARTICOLI.** Erano hardcoded a
    14,90/24,90: con il test dei due prezzi acceso, metà dei lettori avrebbe
    letto un prezzo e trovato l'altro alla cassa. Ora gli articoli dicono
    "prezzo fisso, scritto prima" e linkano `/#prezzi`; i box del confronto
    leggono il listino dal cookie della variante.
  - **Copertine:** dieci illustrazioni editoriali in SVG, disegnate qui (in
    questo ambiente non si generano immagini e non si scaricano). Il sistema
    preferisce la foto appena c'è: `COPERTINE.md` porta i **dieci prompt
    dettagliati** per generarle e una riga per articolo per sostituirle.
  - **SEO:** sitemap con tutti gli articoli e le pagine argomento, JSON-LD
    (Blog, BlogPosting con le citazioni, BreadcrumbList, FAQPage dove le
    domande esistono), canonical, feed RSS su `/tabellone/feed.xml`,
    immagine social generata dal titolo vero di ogni articolo, llms.txt
    aggiornato. Le pagine di archivio sono `noindex`: sono elenchi.
  - ⚠️ **LE PAGINE EVENTO SONO FERME PER SCELTA DI VALERIO** ("non ho capito
    come si intrecciano col blog"). Da rispiegare e riproporre: in ARRETRATI.
  - Prove: **538 verdi** (restano le 2 note dell'Osservatorio, che nella
    sandbox non raggiunge Supabase). Eval del motore: 45 su 45.
- **GIRO #39 (9/08): IL TEST DEI DUE PREZZI, ACCESO.**
  - **Metà del pubblico vede 14,90 / 24,90, metà 24,90 / 39,90** (scelta di
    Valerio col popup: "provo due prezzi"). Il motivo è aritmetico: alzare
    il prezzo **taglia del 40% il traffico necessario** per lo stesso
    incasso, ed è la leva più veloce che c'è. Su un rimborso da 400€ anche
    24,90 resta sedici volte meno del valore consegnato, e AirHelp per lo
    stesso lavoro ne trattiene 100-140.
  - Come funziona: il proxy tira **una moneta alla prima visita** e la
    scrive in un cookie che dura sei mesi. Chi vede 24,90 sulla landing
    trova 24,90 anche alla cassa: prezzi delle card, CTA del verdetto,
    confronto con le banconote e link Polar seguono tutti la stessa
    variante. Se il cookie manca o è sporco si serve il listino di sempre.
  - **Come si legge il risultato senza toccare il database**: la divisione è
    50 e 50, quindi quanti hanno VISTO i due prezzi è lo stesso numero e
    basta contare le vendite. A 24,90 ne bastano 60 per battere 100 vendite
    da 14,90. Il prodotto Polar comprato dice da solo in che variante era il
    cliente: nessuna migrazione, nessuna colonna nuova.
  - ⚠️ **SERVE VALERIO**: su Polar vanno creati **QUATTRO prodotti**, non
    due (`Pratica` 14,90 · `Pratica 25` 24,90 · `Pratica famiglia` 24,90 ·
    `Pratica famiglia 40` 39,90) e i due link nuovi vanno in
    `POLAR_CHECKOUT_PRATICA_B` e `POLAR_CHECKOUT_FAMIGLIA_B`. Senza quelli
    il sito serve il listino basso a tutti: il test non parte, ma niente si
    rompe e nessuno finisce su una cassa che non esiste.
  - 5 prove nuove. Le prove vecchie che asserivano un prezzo ora **fissano
    la variante**, se no passavano a testa o croce.
  - Prove: **372 verdi** (restano le 2 note dell'Osservatorio).
- **GIRO #38 (9/08): GARANZIA SULL'ESITO, ENTI NAZIONALI PER PAESE,
  E L'APP NON È PIÙ UN VICOLO CIECO.**
  - **LA GARANZIA È LEGATA ALL'ESITO** (scelta di Valerio col popup). Non
    più "90 giorni": ora scatta **se la compagnia rifiuta senza un motivo
    valido o non risponde entro i termini di legge**. Il perché è un conto:
    le compagnie rispondono in 8-14 settimane, quindi il giorno 90 cadeva
    DENTRO l'attesa e un cliente onesto avrebbe chiesto il rimborso a
    pratica ancora viva. Al 50% di escussioni il margine per pratica
    scendeva da 13,66 a 6,83 euro: metà del guadagno, per un calendario.
    Aggiornati landing, card prezzi, FAQ, verdetto, condizioni d'uso, email
    T+0 e T+60, app, llms.txt, SPEC e DECISIONI. La colonna
    `garanzia_fino_al` resta popolata (nessuna migrazione da fare) ma non la
    vede più nessuno: vale come promemoria interno.
  - **GLI ENTI NAZIONALI SEGUONO L'AEROPORTO DI PARTENZA** (`lib/lettera/
    neb.ts`). L'art. 16 par. 1 dà la competenza allo Stato dello scalo di
    PARTENZA: la lettera mandava tutti all'ENAC, quindi chi partiva da
    Barcellona scriveva all'ufficio sbagliato. Ora la lettera e la guida
    passo-passo nominano l'ente giusto, col suo sito. **20 paesi in tabella**
    con fonte verificata una per una (Italia, Spagna, Germania, Francia,
    Olanda, Grecia, Austria, Ungheria, Cechia, Bulgaria, Polonia, Irlanda,
    Portogallo, Belgio, Lussemburgo, Finlandia, Svezia, Danimarca, Norvegia,
    Malta). ⚠️ Per i paesi NON in tabella la lettera **non inventa un
    ufficio**: dice il paese e rimanda all'elenco ufficiale della
    Commissione. Mancano Croazia, Slovenia, Slovacchia, Romania, Cipro,
    Estonia, Lettonia, Lituania, Liechtenstein: la pagina ufficiale UE è
    bloccata dal proxy di questo ambiente, sono in ARRETRATI. **6 prove
    nuove**, fra cui quella che vieta di nominare un ente non verificato.
  - **L'APP HA I CASI CHE VALGONO SOLDI** (`mobile/src/components/
    DomandeCaso.tsx`). Prima sull'app un volo cancellato diceva "incerto" e
    finiva lì, mentre sul sito si chiudeva con due domande: era il vicolo
    cieco più caro che avevamo, perché il cancellato è il caso in cui la
    compensazione spetta più spesso. Ora l'app ha **le due domande dell'art.
    5** (preavviso e volo alternativo) e **negato imbarco + coincidenza
    persa**, con la ricerca dello scalo di destinazione. Il verdetto resta
    del server: in quel file non c'è una riga di Regolamento.
  - Prove: **362 verdi** sul web (restano le 2 note dell'Osservatorio),
    mobile tipi/lint/jest tutti verdi.
- **GIRO #37 (9/08): IL CANCELLO TERRITORIALE (un falso positivo vero) +
  BANCO DI PROVA + LA RICERCA CHE RISPONDE AL PIANO DELL'AMICO.**
  - 🔴 **TROVATO E CHIUSO UN FALSO POSITIVO VERO.** Il motore calcolava
    ritardo e fascia senza chiedersi MAI se il Regolamento si applicasse:
    un **New York → Toronto** con 4 ore di ritardo usciva **idoneo a 600€**.
    È esattamente il falso positivo che la regola numero uno vieta (si vende
    una lettera per un diritto che non esiste, poi si rimborsa con la
    garanzia e si prende una stella). Nato `lib/regole/territorio.ts`:
    l'art. 3 par. 1 dice che conta **da dove parte l'aereo**. Partenza
    UE/SEE = coperto sempre, con qualsiasi compagnia; partenza da paese
    terzo = coperto solo se chi ha operato ha licenza europea; terzo→terzo
    = mai. Il cancello gira PRIMA di tutto il resto in `valuta()`. Dove non
    siamo sicuri esce **incerto, mai idoneo**. Regole alla versione
    **2026.08.5**. Golden set portato da 36 a **43 casi** con 7 casi nuovi
    di ambito: **43 verdi, falsi positivi 0**.
    ⚠️ Due prudenze dichiarate: la **Svizzera** non è nell'elenco (applica
    il 261 per accordo bilaterale, non come Stato membro: senza fonte
    verificata i suoi casi restano incerti), e i **grandi vettori extra UE
    non in tabella** (Delta, United, American...) danno incerto invece di
    un no pulito. Entrambe in ARRETRATI.
  - **IL BANCO DI PROVA** (`scripts/banco-prova.ts`, `npm run banco`): passa
    una lista di voli veri dentro il motore e stampa verdetto, ritardo,
    tratta e importo, col riepilogo idonei/incerti/non idonei e gli esiti
    salvati in `prove/casi-reali-esiti.json`. **`prove/casi-reali.json` ha i
    30 casi pronti**: voli VERI (numero, tratta, distanza calcolata in
    ortodromica sul nostro stesso file scali), sparsi su 12 mesi, con dentro
    i casi limite (Bergamo-Malaga a 1550 km, appena sopra la soglia) e le
    prove di ambito (Dublino-Roma, Malpensa-New York con Delta).
    ⚠️ **Lo deve lanciare Valerio dal suo PC**: da qui l'egress blocca
    AeroDataBox e anche il sito vivo.
  - **LA RICERCA (10 agenti, 6 filoni + 3 controlli avversariali).** I punti
    che cambiano le decisioni:
    - **"2 paganti su 100 check" NON è conservativo**: è il caso medio-buono
      da mese sei. Il numero di lavoro è **1% al lancio, 2-3% a regime**.
      Il collo di bottiglia non è la conversione, **è il traffico**.
    - **La soglia delle 3 ore è CONFERMATA** dalla riforma approvata a
      luglio 2026 (Parlamento, 646 voti contro 12). Il rischio che poteva
      uccidere il progetto è passato. Ma dall'estate 2027 arriva un
      **termine unico di 9 mesi**: il bacino retroattivo si chiude da solo.
    - **Il retroattivo lungo non conviene comprarlo**: prima si scrive al
      supporto AeroDataBox (due domande in ARRETRATI), e comunque la
      finestra dura circa dodici mesi. **Marketing sui 5 anni spento**: la
      descrizione social prometteva ancora "ultimi 5 anni" e portava
      traffico che converte a zero per costruzione (ogni volo vecchio →
      incerto → non si vende). Ora dice "volo in ritardo o cancellato".
    - **Italia o Europa: il prodotto copre GIÀ tutta la UE** e non serve
      aprire una lingua nuova (costo alto, zero visitatori in più). Un
      millesimo del solo mercato italiano basta per l'obiettivo cassa.
  - Prove: **350 verdi**, restano le 2 note dell'Osservatorio (la sandbox
    non raggiunge Supabase). Eval del motore: 43 su 43.
- **GIRO #36 (9/08): SICUREZZA A TAPPETO + IL GIRO DI STILE CHIESTO.**
  - **LA REPO È BLINDATA (audit del team di Valerio + scan con la skill
    Masriyan/Claude-Code-CyberSecurity-Skill).** Le difese vere, quelle che
    contano:
    - **/api/verifica** non era senza freno per davvero (aveva già un tetto
      inline da 20/min), ma il **CORS era aperto a chiunque (`*`)**: ora usa
      il tetto condiviso (`lib/api/limite`) e il CORS è chiuso alla NOSTRA
      origine. Il check same-origin della landing non se ne accorge (il
      browser non applica il CORS allo stesso sito), l'app nativa nemmeno
      (non è un browser). Stessa chiusura su leggi-carta e tutte le rotte
      che spartiscono `CORS`.
    - **`poi=` (dove torni dopo il login)**: c'era già il filtro "inizia con
      /" ma bucava col **backslash** (`/\evil.com` → il browser lo gira in
      `//evil.com`). Peggio: in `auth/conferma` il `poi` finiva DENTRO uno
      `<script>` via `JSON.stringify` → un `poi` con `</script>` eseguiva
      codice (**XSS reale**, più grave di quanto visto dal team). Chiuso alla
      radice con `lib/api/percorso.ts` (`percorsoInterno`: solo caratteri da
      percorso vero) in tutti e 4 i punti + escape del `<` nello script.
    - **Header di sicurezza** (mancavano del tutto): `next.config.ts` ora
      mette CSP (script/style solo da noi + inline, `object-src none`,
      `base-uri self`, `frame-ancestors self`, connect solo self+supabase),
      X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy
      (fotocamera/micro/posizione spenti), nosniff, HSTS. `unsafe-eval` solo
      in sviluppo (Fast Refresh), sparisce in produzione.
    - **Verificato NON presente**: verdetto/lettera sbloccati lato client
      (il gating è già server-side: auth + proprietà + stato `pagata`, e il
      webhook Polar verifica la firma); segreti nel bundle (solo le chiavi
      pubbliche per progetto usano `NEXT_PUBLIC_`, mai la service key);
      segreti hardcoded (zero).
    - **Strato anti-copia** (`components/AntiCopia.tsx`, scelto da Valerio
      col popup "entrambi"): tasto destro e scorciatoie devtools bloccati
      fuori dai campi, messaggio in console. ⚠️ È DEBOLE PER NATURA e va
      detto: su un sito il codice della pagina è sempre raggiungibile; alza
      solo la soglia di fastidio. NON blocca la selezione del testo, se no
      la lettera di reclamo non si potrebbe copiare. La difesa vera sono le
      chiavi server-side, RLS, rate limit e header qui sopra.
    - **Privacy**: retention delle verifiche resa concreta (24 mesi, poi si
      tolgono i dati che identificano). ⚠️ Il **titolare del trattamento**
      resta col placeholder: servono cognome/dati societari di Valerio
      (in ARRETRATI e in "Serve Valerio"). Cookie: la pagina già dichiara
      "solo tecnici, niente banner" (a posto).
  - **IL CONFRONTO HA LE BANCONOTE PULITE, ORA DISEGNATE DA NOI**
    (`ConfrontoBanconote.tsx`, via `public/assets/banconota-100.webp`). La
    foto vera aveva "specimen" di traverso e la firma: OGNI immagine legale
    di una banconota ce l'ha per legge, una foto pulita non esiste. Quindi
    la 100€ è ricostruita in SVG (verde euro, arco, stelle UE, striscia
    olografica): pulita per costruzione, nostra, legale. L'animazione è **1
    secondo più lunga e più umana**: il ventaglio si APRE una carta alla
    volta, poi le banconote prendono la **rincorsa** (un cenno in giù, poi
    via in alto ruotando), il contatore sale in 1,4s.
  - **VIA LA BARRA GRIGIA VERTICALE** dalle scadenze (`FinestreScadenza.tsx`):
    la tacca del "primo anno" nel tragitto dell'aereo, tolta. Resta la rotta
    tratteggiata e l'aereo che si ferma dove scade la finestra. (Sistemato
    anche l'hydration mismatch delle stelle UE: coordinate arrotondate.)
  - **LA BUSTA EMAIL È UN 3D VERDE** (`BustaAperta.tsx` rifatta): render
    "matte" in SVG (facce sfumate = luce dall'alto, ombra a terra, bordi
    tondi) col bollo della chiocciola, nei verdi del marchio (scelta di
    Valerio col popup; il riferimento era blu). La lettera sale quando la
    ricerca trova. Non è un file scaricato: Blender non era collegato e i
    render stock hanno licenze.
  - **LANDING RIORDINATA** (Valerio d'accordo): "I numeri del problema" sale
    tra Garanzia e Retroattivo (argomento che convince, prima era sepolto
    sotto i prezzi); "Chi fa cosa" scende sotto la Garanzia (non fa più due
    spiegoni di fila con "Cosa copre"). L'Invito finale RESTA finché non
    arrivano i testimonial. La **garanzia** ora è una riga dentro le due card
    prezzi, sotto la cifra (era un punto sepruto solo nella pratica).
  - **TESTIMONIAL: fermo, come chiesto.** Serve `EFFERD_REGISTRY_TOKEN`
    (a pagamento, Efferd Pro) che Valerio non ha ancora: STOP come da sue
    istruzioni. Niente sezione finché non arriva il token e le recensioni
    vere.
- **GIRO #35 (9/08): GLI ULTIMI DUE CASI CE 261 E IL GIRO DI STILE.**
  - **RIVOGLIO È DAVVERO ESTINTO.** La passata del giro #34 non poteva
    vedere i lockup SPEZZATI in due stringhe ("Rivo"+"glio"): nav del
    sito (Logo.tsx), hero e welcome dell'app, testata delle email,
    immagine social (opengraph-image.tsx). Sistemati tutti, anteprima
    app riesportata e mockup del telefono RIFATTO con la cattura nuova
    (dentro c'era ancora la scritta vecchia). Restano SOLO gli indirizzi
    veri delle macchine (rivoglio.netlify.app), come da nota del #34.
  - **NEGATO IMBARCO E COINCIDENZA PERSA HANNO IL VERDETTO**
    (`lib/regole/dichiarati.ts`, rotta `/api/verifica/dichiara`,
    migrazione `2026-08-13-dichiarati.sql` DA APPLICARE). Sono i casi
    che gli archivi NON vedono: il volo può risultare in orario mentre
    tu sei rimasto al gate. Invito discreto sotto i verdetti non idoneo
    e incerto ("Ti hanno lasciato a terra o hai perso una coincidenza?"),
    scelte chiuse, verdetto dal motore sul server. Negato (art. 4):
    volontario = no; involontario + in orario = compensazione SUBITO
    sulla distanza del volo. Coincidenza (Folkerts C-11/11): biglietti
    separati = no; unica prenotazione + arrivo finale ≥3h = fascia
    sull'INTERO viaggio, con destinazione finale chiesta col campo di
    ricerca scali e distanza calcolata da OpenFlights. Chi non ricorda
    resta incerto e non paga. 14 prove nuove.
  - **IL CONFRONTO HA LE BANCONOTE VERE**: riproduzione ufficiale della
    100€ da Wikimedia Commons (`/assets/banconota-100.webp`, 460px, entro
    le regole BCE), a ventaglio; dal portale due volano via, da Rivolio
    si stacca un angolino. Richiesta esplicita di Valerio: elemento
    visivo REALE, non disegnato in codice.
  - **LE SCADENZE SONO CIELI CON L'AEREO IN VOLO**: aereo in rilievo che
    decolla da "oggi" e vola sulla rotta tratteggiata fino alla sua
    finestra, bandierina del paese della legge (Italia/UE), tacca del
    primo anno = archivio. Niente loghi delle compagnie: marchi
    registrati (scelta col popup).
  - **LA BUSTA È UNA BUSTA** (semafori colorati, avatar del mittente,
    lettera che esce) e la scheda del check gratis, la Copertura a tre
    pesi (verde notte pieno la prima), il timbro senza codice a barre.
  - **ENTRA VA DRITTO AL LOGIN** (nav → /entra): prima portava alla web
    app dove c'era un ALTRO Entra. Il labirinto è chiuso; la web app
    resta dal footer e dal check.
  - **IL RITARDO SI LEGGE**: "3 h e 52 min", mai più "3h52"
    (`formattaMinuti` in eu261.ts, usato da motore, verdetto, landing).
  - Prove: le nuove sui casi dichiarati verdi; suite piena verde tranne
    le 2 note della sandbox. Prove aggiornate: il formato del ritardo e
    "Entra → /entra" sono il comportamento voluto.
- **GIRO #34 (9/08): IL NOME CAMBIA E I CANCELLATI PAGANO.**
  - **RIVOGLIO È DIVENTATO RIVOLIO OVUNQUE** (scelta di Valerio, 9/08):
    rivoglio.it risultava già registrato (risponde a un indirizzo di
    parcheggio) e rivoglio.com è di una gelateria, mentre rivolio.it è
    libero e combacia coi suoi profili @rivolio_ai. Rinominati 88 file
    più la cartella `components/rivolio/`; la tagline e tutto il resto
    NON si toccano, era la sua condizione.
    ⚠️ RESTA `rivoglio.netlify.app` in una manciata di punti, ed è
    voluto: quello è l'indirizzo VERO della macchina dove gira il sito
    oggi. Il giorno che rivolio.it punta su Netlify si cambiano due
    variabili (NEXT_PUBLIC_SITO sul sito, EXPO_PUBLIC_SITO sull'app) e
    sparisce anche quello. Cambiare la stringa prima significherebbe
    mandare l'app su un indirizzo che non esiste.
  - **I VOLI CANCELLATI NON SONO PIÙ UN VICOLO CIECO.** Finivano tutti
    "incerto" perché l'art. 5 del CE 261/2004 lega la compensazione a due
    fatti che nessun archivio conosce. Ora la pagina del verdetto li
    chiede: quando ti hanno avvisato (a fasce, non a date: la gente
    ricorda "una settimana prima", non "il 14 marzo") e quanto dopo sei
    arrivato con l'alternativa. `lib/regole/cancellato.ts` applica
    l'albero e chiude il caso. Chi non ricorda resta incerto e non paga.
    ⚠️ Siamo PIÙ SEVERI della legge di proposito: la legge esclude la
    compensazione solo se la riprotezione rispetta anche un limite sulla
    PARTENZA, che non chiediamo. Sbagliamo dalla parte di chi non paga.
    Rotta `/api/verifica/cancellato`, risposte scritte sulla riga di
    `verifiche` (servono come prova), 14 prove nuove.
    Migrazione `2026-08-12-cancellato.sql` DA APPLICARE.
  - **IL BLOCCO NERO DELL'ANIMAZIONE**: sopra lo schermo del telefono
    c'era un velo scuro che faceva lo "schermo spento", e a metà
    scorrimento si vedeva come un rettangolo nero. Tolto: resta la lama
    di luce, che racconta la stessa cosa e non può sporcare niente.
  - **SOCIAL VERI**: solo Instagram e TikTok @rivolio_ai. YouTube e
    Telegram tolti: un'icona che porta a un account inesistente è una
    promessa rotta al primo clic.
  - **LA BUSTA CHE SI APRE** nel riquadro "cercala nella tua posta":
    l'aletta si alza e la lettera esce (`BustaAperta.tsx`), poi parte la
    ricerca che si scrive da sola.
- **GIRO #33 (9/08)**: il giro estetico chiesto da Valerio più i due
  limiti segnalati da un esperto esterno.
  - **LA FIRMA "RIVOLIO"** in fondo tocca i due bordi su qualsiasi
    schermo. Non è tentata: nel font display quella parola è larga 4,23
    volte la propria dimensione, quindi la misura è
    `min(calc((100vw - margini) / 4.23), 293px)` (classe
    `.marchio-gigante` in globals.css). Alzata di un filo: prima il
    taglio in basso se ne mangiava un quarto.
  - **LA MANO ENTRA IN SCENA** (`components/rivolio/ManoRivelata.tsx`):
    alone verde che si apre da terra, mano che sale ruotando appena, e
    SOLO DOPO lo schermo che si accende con una lama di luce in
    diagonale. Tutto in codice, zero peso aggiunto. La finestra dello
    schermo dentro la foto sono le misure vere dello script del mockup,
    girate in percentuale. Telefono spinto di 7px a destra: la mano pesa
    a sinistra e senza quel filo si legge storta.
  - **IL CHECK GRATUITO HA LA SUA SCHEDA**, la più grande della sezione
    prezzi: 0€ enorme, nastro "Sempre gratis", i tre punti visibili
    ANCHE sul telefono (sparivano sotto i 640px) e bottone grande.
  - **IL CONFRONTO COI PORTALI SI VEDE**: sei banconote da 100€ fanno i
    600€, due se ne volano via dal portale, da noi se ne va un pezzetto
    di una sola, e il numero che resta sale contando. ⚠️ Il contatore
    parte dal valore VERO, non da zero: una prova ha beccato "0€ restano
    a te" per chi non scorreva fin lì.
  - **LA CASELLA SI CERCA DA SOLA** (`CercaInPosta.tsx`): "conferma
    volo" si scrive una lettera alla volta e la mail salta fuori con
    numero e data evidenziati, dentro un riquadro marcato "Esempio".
  - **LE FINESTRE DI SCADENZA HANNO UNA BARRA DEL TEMPO** sulla stessa
    scala 0-6 anni, con la tacca a un anno che segna l'archivio di oggi.
  - **DAL FEEDBACK ESTERNO, due sezioni nuove sulla landing:**
    - `/#copertura` **"Non solo i ritardi"**: tre colonne oneste. Verde =
      verdetto automatico (ritardo). Giallo = riconosciuto ma il verdetto
      dipende da un dato che ha solo l'utente (cancellato, dirottato) e
      finché è incerto NON si paga. Grigio = non ancora (negato imbarco e
      coincidenza persa, bagagli con link alla guida, treni). Il motore
      gestiva cancellati e dirottati da giorni: era il SITO a non dirlo.
    - `/#chi-fa-cosa` **"Due clic tuoi. Il resto è mio."**: tre righe da
      una parte, quattro dall'altra, e il perché l'invio parte dalla
      email dell'utente (FR, U2, W6 lavorano solo i reclami mandati dal
      passeggero, ed è lo stesso motivo per cui la compensazione arriva
      intera).
- **GIRO #32 (9/08)**: il giro delle cose che Valerio ha visto rotte
  guardando il sito dal telefono.
  - **IL TELEFONO DEL FOOTER MOSTRA L'APP VERA**: dentro la foto c'era
    una schermata inventata dall'AI ("Ciao, Marco", tab "Rimborsi") di
    un'app mai esistita. Ora c'è la cattura vera dell'app (check di
    U23508 Palermo → Milano a metà analisi), senza tacca nera, col
    telefono centrato sul centro dello SCHERMO (era 72px a sinistra),
    a 2x e in WebP: da 1 MB a 178 KB. Lo fa `scripts/telefono-mockup.mjs`
    (trova il rettangolo dello schermo dai pixel); la foto di partenza
    sta in `sorgenti/telefono-mano.png`.
  - **LA TAB CLASSIFICA SI VEDEVA ANCHE DA SPENTA**: expo-router traduce
    `href: null` in `tabBarItemStyle {display:"none"}`, e la nostra
    BarraTab su misura non lo guardava. Il tocco portava su una
    schermata vuota. Ora rispetta il segnale (`prove`: l'export
    dell'anteprima mostra 3 tab, non 4).
  - **I TASTI MUTI DELL'ANTEPRIMA**: nel browser (l'unico posto dove
    Valerio può provare l'app) "Fai controllare un volo a chi ami" e
    "Notifiche" non facevano NIENTE: `Share` non esiste su web e
    `Linking.openSettings` nemmeno (TypeError in console). Nato
    `mobile/src/lib/sistema.ts`: Web Share → appunti → messaggio in
    chiaro. Mai più un tocco senza risposta.
  - **LE CARD DELL'OSSERVATORIO HANNO UN MONUMENTO**: Colosseo, Duomo,
    Campanone, Campanile, Vesuvio, Etna, Due Torri, disegnati in SVG
    (`components/rivolio/Monumenti.tsx`), tinti col colore della
    giornata, più cinque tacche e il giudizio in parole. I buchi (archi,
    finestre) sono in verde notte pieno: con una trasparenza dello
    stesso colore sparivano e il Colosseo era un barattolo.
  - **IL TESTO INVISIBILE IN FONDO**: l'alone verde della sezione era a
    opacità 25 e su telefono copriva la metà bassa. Ora 0.10, più in
    basso, e le card hanno un fondo pieno che non dipende da lui.
  - **DOPPIO OPT-IN SULL'OSSERVATORIO** (scelta di Valerio): chi scrive
    l'email riceve "Confermi l'iscrizione?"; solo dopo il clic parte il
    benvenuto, con dentro gli scali di oggi. Link firmati HMAC
    (`lib/iscritti/gettone.ts`, 30 giorni, confronto a tempo costante),
    rotte `/api/iscriviti/conferma` e `/disdetta`, esiti su `/iscrizione`.
    Migrazione `2026-08-11-doppio-optin.sql` (confermato_il, disdetto_il)
    DA APPLICARE sul Supabase vero.
  - **EMAIL RIVESTITE**: testata col marchio a parole, corpo pulito, un
    solo bottone verde, link di disdetta in fondo (la landing promette
    "si annulla con un clic": adesso è vero). Mittente mostrato:
    "Valerio di Rivolio" (scelta sua). Anteprima in sviluppo su
    `/api/email-anteprima?q=conferma|benvenuto`, che chiama le stesse
    funzioni delle email vere: non può divergere.
  - **"Milan" è diventato "Milano"**: l'archivio scrive i nomi in
    inglese, `inItaliano()` li gira sulla tratta del verdetto.
  - **Skill `copertura-prompt`** salvata in `.claude/skills/` e regola
    aggiunta in CLAUDE.md (messaggi con più richieste).
- **GIRO #31 COMPLETATO (8/08 notte fonda)**: i 6 pezzi rimasti dal
  handoff, tutti chiusi e provati.
  - **La scena di scansione è NELL'APP** (`mobile/src/components/
    ScenaScan.tsx`): identica al sito, 6 passi veri da 2,4s che non si
    tagliano mai, biglietto che si COMPILA coi dati del server (tratta su
    una riga sua: su 390px le tre colonne del sito troncavano), luce
    dello scanner in loop 3,4s, timbro CE a molla. Provata end-to-end su
    Expo web: ZZ250 → 15 secondi di scena → verdetto da sola, zero
    errori console. Il sipario resta giù durante la transizione al
    verdetto (il reset avviene al ritorno del focus), e un cambio tab a
    metà analisi non rompe niente (ref `analisiViva`).
  - **Il lint mobile era ROSSO dal giro della welcome** (react-hooks v6
    vieta `useRef(...).current` letto in render sugli Animated.Value, e
    i `require()` delle immagini): nato `useValoreAnimato` in
    `mobile/src/lib/animazioni.ts` (stesso comportamento, da useState),
    immagini a import statico con `src/tipi/immagini.d.ts`. Ora tsc,
    lint e jest mobile: tutti verdi.
  - **La sezione prezzi è due carte d'imbarco** (scelta popup): pratica
    evidenziata col nastro "La più scelta" nella fascia scura, famiglia
    accanto, strappo coi fori, codice a barre derivato dal nome, timbro
    "Rivolio · Reg. CE 261/2004". Il check gratis è una striscia sopra
    le carte, non un terzo biglietto. Confronto coi portali e conti
    apribili invariati (la prova landing li blinda).
  - **Cancellato e dirottato parlano all'utente** (versione regole
    2026.08.4): il cancellato spiega che il preavviso lo sa solo lui e
    che rimborso o volo alternativo si chiedono comunque; il dirottato
    spiega l'atterraggio in un altro scalo. Via il gergo interno ("è il
    prossimo pezzo che costruiamo", "da guardare a mano").
  - **/guida-bagagli** (scelta popup: guida sì, vendita no): PIR subito
    in aeroporto, reclamo scritto in 7/21 giorni, perso dopo 21, azione
    in 2 anni, tetto 1.519 DSP (revisione ICAO dal 28/12/2024, circa
    1.900€ dichiarati come stima), fonti nel finale. Linkata dal footer
    (colonna Domande) e in sitemap. In fondo il ponte al check EU261.
  - **L'email di benvenuto era ANCORA del prodotto viaggi** (crediti,
    destinazioni) e partiva a ogni registrazione: riscritta per
    Rivolio. Le T+0/2/15/30/60 della pratica rilette: già giuste. Il
    ramo email/alert viaggi (ricerca attiva, destinazione, crediti,
    ricevuta + chiamanti) è segnato in ARRETRATI da spegnere.
  - **La data sul biglietto in scansione del sito** era l'ISO grezza
    (2026-08-07): ora GG/MM/AAAA, come nell'app.
- **GIRO #30 (8/08 notte)**: stress test sul motore VERO (14 voli reali
  via workbench remoto, da ieri a febbraio: 11 verdetti certificati, 3
  incerti onesti per orario mancante in archivio, 0 errori). Un incerto
  su un volo degli ultimi 2 giorni ora DICE che il dato arriva entro un
  giorno (prima "controlla numero e data" faceva credere a un errore).
  Scan rifatto: fascia di luce lenta 3,4s + il biglietto si COMPILA coi
  dati veri al passo giusto. **/anteprima-app**: l'app dentro un iPhone
  di CSS su Netlify, si aggiorna con `npm run anteprima` (mobile/) +
  push; font ridotti da 12 a 3 MB (solo i 6 caricati). **La web app /app
  ha le tre sezioni dell'app** (Controlla / Pratiche / Profilo con
  nickname e classifica via server action). Regola nuova in CLAUDE.md:
  4 domande popup a ogni prompt di Valerio. POLAR.md: mail al supporto
  pronta, consegnata a Valerio in chat.
- **L'APP NON SCAPPA PIÙ NEL SITO (8/08 sera, richiesta di Valerio)**:
  l'unica cosa che apre il browser è il pagamento (scelta sua: in-app
  Apple e Google trattengono il 15-30%). Le regole del giro, decise coi
  popup: pratiche "tutto tranne pagare", classifica costruita completa ma
  SPENTA al lancio (10 giorni di dati veri, poi si accende con
  CLASSIFICA_ATTIVA=1 su Netlify e la tab compare da sola), nickname
  opt-in per la classifica, invito agli amici SENZA premi in denaro.
- **I tre modi di dire qual è il volo nell'app**: foto della carta
  d'imbarco (Mistral OCR via /api/leggi-carta, la foto NON si salva),
  ricerca per tratta (predefinita: "da dove sei partito", autocompletamento
  su 6.072 scali OpenFlights con nomi italiani ed esonimi, poi l'elenco
  dei voli del giorno da AeroDataBox), numero di volo per chi lo ha.
- **La pratica si segue DENTRO l'app**: /api/pratiche/{id}/scheda (Bearer
  dall'app, cookie dal sito, CORS con Authorization) dà stato, tratta,
  cronologia e lettera in una chiamata. Timeline coi sei passi, lettera
  che si apre nell'email già compilata (mailto), copia/condividi, canale
  reclami e "L'ho inviata" (conferma-invio ora accetta anche il Bearer).
- **Le notifiche push**: permesso chiesto al primo volo salvato, voli su
  `voli_seguiti`, cron alle 6 UTC (netlify/functions/avvisa.mjs →
  /api/motore/avvisa) che ricontrolla i voli di ieri e manda la push
  SOLO sugli idonei, scritta per tratta ("Bergamo → Lanzarote: 3 ore e
  15 minuti di ritardo... fascia da 250€"), mai col numero del volo.
  8 prove bloccano il testo. Incerti in coda 7 giorni, poi chiusi.
- **Profilo come il riferimento**: avatar con le iniziali, "Modifica il
  profilo" (nickname + adesione classifica, migrazione
  2026-08-10-profilo-e-classifica applicata sul Supabase vero con
  vincolo formato e unicità), riquadro "Fai controllare un volo a chi
  ami" (Share nativo), voci con icona e sottotitolo.
- **Il biglietto**: CardVolo è una carta d'imbarco con strappo, fori,
  tratta grande e codice a barre derivato dal numero del volo.
- **POLAR.md**: la ricerca completa su Polar (agosto 2026). Tariffa nuove
  organizzazioni 5% + 50 cent; verifica prima del primo bonifico, fino a
  14 giorni, vendite MAI ferme; ⚠️ vietati i "servizi umani" e la
  consulenza: prima di tutto farsi approvare il caso d'uso per iscritto
  dal supporto (testo pronto nel documento).
- **Il motore EU261 decide, l'AI mai**: `lib/regole/eu261.ts`, versione
  2026.08.3, tre stati (idoneo · incerto: MAI vendere · non idoneo).
  Dal giro #26: senza quality "Live" sull'arrivo NESSUN verdetto (una stima
  non è un fatto), codeshare non risolto sopra soglia = incerto (la lettera
  deve andare al vettore operativo). Dal giro #27: sciopero aereo noto nel
  giorno del volo e ritardo sopra soglia = incerto (sotto soglia il no
  resta un no). Golden set di 32 casi etichettati a mano col PRIMO CASO
  REALE (FR4001 del 6/08, 155 min, non idoneo) e 2 trappole sciopero, eval
  bloccante: falsi positivi 0.
- **La rinuncia al recesso (#21) è nel flusso**: spunta esplicita (art. 59
  Cod. Consumo, testo versionato in `lib/pratiche/recesso.ts`) prima del
  rimando a Polar, registrata in `verifiche.rinuncia_recesso_il/testo`; la
  rotta di checkout NON lascia passare senza firma e il webhook la copia
  nella cronologia della pratica. Migrazione applicata sul Supabase vero
  (4 colonne verificate, `supabase/2026-08-08-recesso-e-live.sql`).
- **La seconda fonte sono i documenti dell'utente (decisione di Valerio,
  8/08)**: AviationStack free è morta (solo tempo reale, licenza personale).
  Dentro la pratica, dopo il pagamento, c'è il caricamento della carta
  d'imbarco o dell'email della compagnia: Mistral OCR trasforma l'immagine
  in testo, l'estrazione dei campi è a regex, il confronto coi dati
  verificati è deterministico. Concorde = evento in cronologia; discorde =
  verifica in conferma umana, MAI un cambio di verdetto dal codice. Il FILE
  NON SI SALVA (si legge, si registra l'esito, si scarta). La landing dice
  la frase dettata: "Incrociamo i dati ufficiali del volo con i tuoi
  documenti. Se non concordano, il caso è incerto e non paghi."
- **Lo strato dei fatti**: AeroDataBox (dalla spec ufficiale, orario ruote a
  terra, mai gonfiato) + demo marcata senza chiave. Cache per volo+data,
  payload grezzo archiviato come prova. Distanze di riserva da
  `lib/dati/aeroporti.json` (OpenFlights, 6.072 scali IATA, zero API).
- **20 compagnie, scioperi e meteo (giro #27)**: `lib/lettera/compagnie.ts`
  da 10 a 20 canali reclamo, riverificati l'8/08 da una squadra di ricerca
  (entità legale, paese, NEB, indirizzo postale, fonti). FR, U2, W6, V7 e
  DY dichiarano per iscritto che lavorano solo il reclamo inviato dal
  passeggero: il modello di Rivolio con loro è l'unico che funziona.
  Tabella `scioperi` sul Supabase vero con 10 scioperi giugno-settembre
  2026 (migrazione `20260809_scioperi`, fonti ENAC e testate; il cruscotto
  MIT dalla sandbox è bloccato, da riverificare dal PC). Meteo storico
  Open-Meteo nella lettera pronto ma SPENTO: l'archivio a uso commerciale
  richiede il piano Professional, circa 99 USD/mese (verificato dal
  sorgente ufficiale del sito); si accende con OPENMETEO_COMMERCIALE=1.
- **Il funnel web-first**: check senza login/email/app; il reveal con
  l'importo che sale; email chiesta DOPO; Polar (checkout link + webhook con
  firma Standard Webhooks provata su 10 casi); lettera deterministica coi
  canali reclamo verificati di 10 compagnie; email T+0/2/15/30/60; garanzia
  90 giorni; tracker web; `/admin` = conferma umana (shadow mode acceso).
- **Prove**: web 682/684 Playwright (9/08, dopo il giro #44: dentro ci sono le 41 nuove su cache, archivio scali, codeshare e licenze). Storico (giro #34: dentro ci sono le 14 nuove sui voli cancellati). Le 2 rosse sono lo stesso
  test su desktop e telefono, "il modulo dell'Osservatorio accetta
  un'email valida e conferma": la sandbox non arriva a Supabase (`Host
  not in allowlist`), quindi il salvataggio dell'iscritto risponde 500 e
  il pannello di conferma non compare. Sul PC di Valerio e su Netlify
  passa. Tutto il resto verde, comprese le 8 nuove sul doppio opt-in;
  eval sui 32 casi d'oro dentro, mobile tsc/lint/jest verdi. Una prova
  vieta per sempre "hai diritto a" e il trattino lungo nei testi visibili.
  Dall'8/08 notte le prove del funnel passano dal selettore "So il
  numero" (il modo predefinito è la tratta): `prove/aiuti.ts` porta
  l'helper col click ripetuto (l'idratazione può mangiare il primo) e
  `exact: true` (senza, "Non so il numero" si prende il click).
- **Schema dati applicato sul Supabase vero** (voli, verifiche, pratiche,
  eventi + RLS) via Composio, come migrazione tracciata.
- **SEO/GEO**: robots, sitemap, JSON-LD Organization+WebSite, llms.txt,
  canonical, metadata Rivolio ovunque.
- **ONLINE: https://rivoglio.netlify.app COL MOTORE VERO COLLAUDATO**
  (8/08 alba): il "FR4001 non funziona" di Valerio era SOLO la chiave
  AERODATABOX_API_KEY mancante su Netlify (il sito girava in demo).
  Messa via connettore, rideploy, controprova sul sito vero: FR4001 del
  6/08 → non idoneo, 155 minuti, orari veri, demo:false. Su Netlify ora
  ci sono TUTTE le chiavi: Supabase secret, Resend, Mistral, AeroDataBox
  (manca solo Polar, che ancora non esiste). ATTENZIONE connettore: il
  flag "secret" del connettore Netlify fallisce IN SILENZIO (risponde
  "upserted" ma non salva): le variabili vanno scritte senza quel flag.
  L'ultimo giro (design + Osservatorio dati veri) NON è ancora deployato:
  lo pubblica Valerio (scelta sua col popup). Filiera provata: zip del
  ramo da GitHub sul workbench Composio, client Netlify con l'URL firmato
  del connettore, `netlify.toml` con [build] E [[plugins]] obbligatori.
- **La web app è APERTA A TUTTI dall'8/08** (decisione di Valerio, ribaltata
  la scelta del pivot): `/app` senza account col check libero (CheckRapido),
  link "Entra" in nav e "La web app" nel footer. `/admin` resta chiuso.
- **L'APP MOBILE È RIVOLIO (8/08, due giri)**: niente più tracce del
  prodotto viaggi. Tre tab: **Controlla** (il check, prima schermata),
  **Pratiche**, **Profilo**. Nessuna tab è protetta: il check funziona
  senza account, come sul sito; le pratiche invitano a entrare invece di
  sbattere un muro. Il verdetto ha la sua schermata coi tre esiti.
  Il motore NON è duplicato: `mobile/src/lib/api.ts` chiama la stessa
  `/api/verifica` del sito (EXPO_PUBLIC_SITO punta al server locale in
  sviluppo). CANCELLATI: onboarding viaggi, registrati, destinazioni,
  ricerche, `src/motore/` (punteggio viaggi), tipi e componenti relativi.
  Prove: tipi puliti e 4 prove nuove sul campo data (l'unico punto dove
  un testo diventa un dato per il motore).
- **I TUOI VOLI nell'app (8/08)**: ogni volo controllato resta salvato sul
  telefono (AsyncStorage, `src/lib/voliSalvati.ts`) con l'esito copiato dal
  motore e il bottone "Ricontrolla". È la base delle notifiche push, il
  pezzo dopo. Scelte di Valerio col popup: (1) le tre funzioni in ordine
  notifiche → fotocamera carta d'imbarco → tracker; (2) pagamento SUL
  SITO, mai dentro l'app (Apple e Google trattengono 15-30%); (3) i voli
  li aggiunge l'utente a mano, niente casella email collegata; (4) prima
  l'app completa e bella, gli store dopo.
- **CORS sul check (8/08)**: `/api/verifica` risponde con
  Access-Control-Allow-Origin *. Serve all'app: senza, il browser blocca
  la risposta e l'app dice "sei offline" pur avendo rete.
- **Anteprima mobile da Windows**: guida in `mobile/ANTEPRIMA-WINDOWS.md`
  (clone nella cartella utente, `BROWSER=none`, F12 per la vista
  telefono). Su iPhone fisico non si può: Expo Go dell'App Store è fermo
  all'SDK 54 e noi siamo al 57, servirebbe TestFlight.
- **L'Osservatorio ha i dati VERI (#25, 8/08 alba)**: tabella
  `osservatorio_ritardi` sul Supabase vero (migrazione applicata), indice
  ritardi AeroDataBox (0-5 sugli arrivi delle ultime 2 ore) per gli 8
  aeroporti scelti da Valerio col popup (FCO MXP LIN BGY VCE NAP CTA BLQ),
  cache di 24 ore rinnovata da /api/osservatorio, striscia nella sezione
  scura della landing. Prima rilevazione vera seminata (notte: 4 scali con
  indice, gli altri senza traffico = nascosti, onestà). Senza chiave o
  senza DB la striscia sparisce, mai un errore.
- **Il giro di design dell'8/08 alba**: hero con lo stile dell'Osservatorio
  su fondo chiaro (corsivo verde col glow; il corsivo era SPARITO per un
  aggancio rotto dal cambio headline 12 mesi, trovato con lo screenshot);
  scanner rifatto come vera carta d'imbarco (componente condiviso
  `CartaImbarcoScan`: fascia scura, campi in lettura, codice a barre,
  timbro CE 261/2004, raggio con nucleo luminoso) usato da hero e pagina
  verdetto; punti fiducia in striscia allineata (niente piramide); sezioni
  ravvicinate (py-24/28 → 16/20) e titoli leggermente più grandi; bottone
  del retroattivo centrato su telefono; sezione dato oggettivo centrata su
  telefono; foto del footer analizzata pixel per pixel: telefono già
  dritto, il difetto era il polso tagliato dal bordo SINISTRO; ritagliata
  al polso (esce solo dal fondo card), telefono al centro ottico, 205KB.
- **Chiavi**: GEMINI, FIGMA, MISTRAL e AERODATABOX in
  `.env.development.local`.
  Gemini: rete e chiave ok ma quota immagini 0 sul piano gratuito, serve
  la fatturazione su Google AI Studio. Manca UNSPLASH_ACCESS_KEY.
- **DEPLOY AUTOMATICO: il repo GitHub è collegato a Netlify** (8/08,
  mossa di Valerio). Ogni push sul ramo = build e deploy da soli. Il
  primo build da repo moriva con "plugin-nextjs missing manifest.yml":
  nei build da repo il plugin dichiarato in netlify.toml va installato
  come devDependency (fatto, `@netlify/plugin-nextjs`). Controprova:
  il sito vero serve il giro design. Niente più giri manuali né zip.
- **Le pagine legali esistono (8/08)**: /privacy, /condizioni e /cookie
  (linkate dal footer, in sitemap). PRIMA BOZZA onesta: solo cookie
  tecnici quindi niente banner (linee guida Garante 2021), documenti
  OCR mai salvati, rinuncia recesso art. 59, garanzia 90 giorni, foro
  del consumatore. Titolare indicato col contatto valerio@artecai.it:
  cognome e dati societari da completare, revisione legale in ARRETRATI.
- **CLAUDE.md ha il "Protocollo operativo"** dettato da Valerio (8/08):
  rg in un colpo, edit con stringa unica, niente subagenti per task
  piccoli, checkpoint e degrado. Le 4 regole che erano doppie (checkpoint,
  task nuovo, degrado, HANDOFF) ora vivono SOLO lì: il PROTOCOLLO
  CONTESTO tiene metodo batch, /compact vs /clear e "un task = una
  unità committabile".
- **Le colonne dell'hero sono le barre del riferimento (8/08)**:
  attaccate (gap 0), QUADRATE in ogni estremo (raggio 0, colore fino al
  bordo basso), a tutta larghezza (flex 1), base di luminosità 0.55 e
  picco 1. L'onda accende una colonna alla volta da sinistra a destra,
  giro di 8,3 secondi. A separarle è la tinta pari/dispari, non il vuoto.
- **Variabili d'ambiente di Claude, una volta sola**: `.claude/settings.json`
  (tracciato) porta USE_BUILTIN_RIPGREP=0 e ENABLE_TOOL_SEARCH=auto:5, e
  vale su OGNI macchina che apre il repo. I segreti no: FIGMA_API_KEY sta
  in `.claude/settings.local.json`, che è in .gitignore.
- **Guida anteprima mobile da Windows**: `mobile/ANTEPRIMA-WINDOWS.md`
  (Android Studio + emulatore, oppure `expo start --web` in 2 minuti).

## Serve Valerio (in ordine)
0-bis. ~~LE MIGRAZIONI DEL DATABASE~~ ✅ **FATTE da Valerio il 10/08**:
   `supabase/DA-APPLICARE.sql` è stato eseguito sul Supabase vero. Da qui
   in avanti sono attivi il doppio opt-in, i voli cancellati, il negato
   imbarco e il paese degli scali in cache. Il file resta nel repo e si
   può rilanciare: non cancella niente.
0-ter. ~~IL RAMO NON È MAI STATO UNITO A `main`~~ ✅ **FATTO il 10/08**:
   79 commit uniti, zero conflitti. Da qui in avanti si lavora su `main`
   e basta. L'autopilot degli aeroporti adesso compare in Actions.
0-quater. 🟡 **LA QUINTA MIGRAZIONE.** `supabase/DA-APPLICARE.sql` ha un
   punto 5 nuovo (il no della compagnia, per il dopo-lettera). Le prime
   quattro le hai già eseguite: rilanciare tutto il file non fa danni.
0. **DUE COSE SOLO TUE, e sbloccano le email:**
   a. **Il dominio.** Finché `rivolio.it` (o quello che scegli) non è
      verificato su Resend, le email partono SOLO verso
      valerio@artecai.it: lo decide Resend, non il nostro codice. Dammi
      il dominio dello slot gratuito Hostinger e ti do i 3 record DNS.
      Poi su Netlify: RESEND_MITTENTE = "Valerio di Rivolio
      <valerio@TUODOMINIO>".
   b. **La migrazione del doppio opt-in** (`supabase/2026-08-11-doppio-
      optin.sql`) va applicata sul Supabase vero, altrimenti il clic di
      conferma non si registra e la pagina dice "riprova".
1. **Deploy dell'ultimo giro** (design + Osservatorio dati veri): il ramo è
   pronto e collaudato, pubblichi tu (tua scelta col popup). Il motore
   online funziona già.
2. 🔴 **POLAR HA DETTO NO (10/08).** Il controllo automatico
   dell'iscrizione ha risposto "Use case not supported": prodotto legato
   ai reclami di viaggio, categoria a restrizione, e la garanzia più il
   percorso automatico da idoneità a reclamo alzano il rischio di
   contestazioni sulla carta. **Non è il testo scritto male, è la
   categoria**, e riscriverlo più vago sarebbe peggio: alla verifica
   guardano il sito vero e bloccano i bonifici coi soldi dei clienti
   dentro. Le tre strade vere sono in `PAGAMENTI.md`: revisione umana
   (email pronta), un altro venditore ufficiale (gli elenchi si
   somigliano tutti), oppure partita IVA e Stripe diretto, che è l'unica
   che non dipende dall'umore di qualcun altro. **Serve una decisione di
   Valerio.** Intanto niente si ferma: il check è gratuito e il traffico
   si costruisce lo stesso.
3. **Email**: l'iscrizione all'Osservatorio dal sito vero è stata provata
   con valerio@artecai.it: controlla la casella, l'email di benvenuto deve
   esserci. Resend spedisce SOLO lì finché il dominio non è verificato.
4. **Scioperi e meteo**: riverifica le date scioperi sul cruscotto MIT
   (scioperi.mit.gov.it, la sandbox non lo apre) e a inizio settembre
   aggiungi quelli di ottobre. La riga meteo nel reclamo si accende solo
   col piano Open-Meteo Professional (~99 USD/mese): decidi quando ci sono
   incassi. Alla prossima fattura AeroDataBox chiedi la profondità storica.
   Poi 30 casi reali a mano per il golden set.
5. **Dominio** per Rivolio (slot gratuito Hostinger da configurare) e
   account social `@rivolio`.
4-bis. **L'autopilot degli scioperi, primo giro a mano.** Dopo il deploy
   apri una volta `https://<il-sito>/api/motore/scioperi?segreto=<MOTORE_SEGRETO>`
   e guarda cosa risponde: dice quante fonti si sono aperte e quante righe
   sono entrate. Da qui non l'ho potuto provare, il proxy non apre nessuna
   delle fonti. Se qualcosa non va ti arriva comunque un'email da solo.
   Facoltative: `TELEGRAM_ADMIN_CHAT` (per l'allarme anche su Telegram) e
   `ALERT_EMAIL` (se vuoi l'allarme a un indirizzo diverso dal tuo).
5-bis. **Rigenera SOLO la copertina numero 4 (easyJet)**: il prompt in
   `COPERTINE.md` è già corretto e pretende fogli bianchi e vuoti. Le
   altre nove sono montate. Poi **togli le dieci immagini originali dalla
   radice di `main`**: sono 84 MB che tutti si portano dietro a ogni clone.
   Poi: **riapri dal tuo PC le fonti citate negli articoli** (ENAC, AGCM,
   Eurocontrol, le condizioni di trasporto delle compagnie) e conferma i
   numeri. Da qui l'uscita di rete è bloccata e le pagine non si aprono:
   i numeri vengono dagli estratti dei motori di ricerca, e in un blog che
   vende trasparenza vanno riletti sulla pagina.
6. Legale: le 3 pagine (privacy, condizioni, cookie) sono una PRIMA BOZZA
   scritta l'8/08: falle rivedere da un avvocato e dammi cognome e dati
   societari del titolare da inserire. Commercialista sul regime fiscale
   (il documento stesso lo chiede). Fatturazione Google AI Studio per
   Gemini e UNSPLASH_ACCESS_KEY quando l'approvazione arriva.

## Da non rifare
- **Nella sandbox il watcher di Metro NON vede gli edit**: dopo una
  modifica al codice mobile il dev server Expo va riavviato con
  `--clear`, o l'anteprima continua a servire il codice VECCHIO (pagato
  con una controprova identica alla prova).
- Il MCP Playwright cerca Chrome di sistema che nella sandbox non c'è:
  il giro visivo si fa con uno script Node che importa
  `node_modules/playwright` (Chromium preinstallato via
  PLAYWRIGHT_BROWSERS_PATH).
- `.env.local` è in UTF-16 e Next lo ignora: chiavi vive in
  `.env.development.local`.
- Il fornitore demo si accende DA SOLO senza AERODATABOX_API_KEY: i voli
  demo iniziano per ZZ e ogni risposta è marcata demo.
- SHADOW_MODE=1 in produzione finché 100 verdetti di fila non passano
  puliti: si spegne dal pannello, non dal codice.
- Le 2 prove dell'Osservatorio falliscono SOLO nella sandbox: l'egress
  blocca *.supabase.co ("Host not in allowlist"). Non è un bug del
  codice e non va "sistemato": sul PC di Valerio e su Netlify passano.
- **La cache dei voli non è una verità, è una fotografia.** Ogni volta
  che il motore impara a usare un campo nuovo, le righe salvate prima non
  ce l'hanno, e senza un controllo continuerebbero a produrre lo stesso
  verdetto sbagliato per sempre (è stato il caso di FR4001). Il controllo
  sta in `rigaUsabile`, dentro `lib/voli/verifica.ts`: quando aggiungi un
  campo che serve al verdetto, aggiungilo anche lì.
- **Le compagnie extra UE stanno in `lib/regole/vettori.ts`, non in
  `compagnie.ts`.** Non è disordine: `compagnie.ts` dichiara canali
  reclamo VERIFICATI uno per uno, e per quelle 55 non li abbiamo.
  Metterle lì significherebbe dire "verificato" di una cosa non
  verificata.
- **In `vettori.ts` non si aggiunge una compagnia "a occhio".** Se scrivi
  europea una che non lo è, hai fatto un falso positivo, cioè la cosa che
  la regola numero uno vieta. Nel dubbio si lascia fuori: resta incerto,
  come prima.
- Le tabelle viaggi (offerte, ricerche, invii, strutture) sono eredità nel
  DB: non usarle, non cancellarle.
- Resend in prova spedisce SOLO a valerio@artecai.it finché il dominio non
  è verificato.
- La tabella `scioperi` non ha API: si aggiorna a mano con una migrazione.
  `compagnie` usa SOLO codici IATA; vuoto = sciopero generale, vale per
  tutti i voli del giorno.
- OPENMETEO_COMMERCIALE assente = modulo meteo muto per scelta: la lettera
  esce senza riga meteo, nessun errore. Non "sistemarlo".
