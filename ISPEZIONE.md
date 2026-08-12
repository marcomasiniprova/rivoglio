# ISPEZIONE — 12 agosto 2026

Il giro fatto prima del collaudo di Valerio: **sette sonde in parallelo su
tutto il prodotto**, ognuna con una lente diversa (il percorso che porta ai
soldi, il motore del verdetto, ogni parola che vede l'utente, il
retrobottega, il telefono, chi può vedere cosa, l'app contro la web app).
Ogni difetto è poi passato sotto **tre scettici indipendenti**, il cui
compito era dimostrare che non fosse vero.

**45 difetti trovati: 14 rossi, 25 gialli, 6 verdi.**

⚠️ Questo file è il verbale, non la lista delle cose fatte. Quello che si
chiude si segna qui accanto e finisce in STATO.md col suo commit.

---

## 1. 🔴 Chi dichiara "mi hanno lasciato a terra" riceve un sì anche su un volo che l'Europa non copre

**Dove:** `lib/regole/dichiarati.ts:99`

**Come ci si arriva:** 1) Fai il check di un volo che parte e arriva fuori dall'Europa, per esempio New York (JFK) verso Toronto (YYZ) con Air Canada. 2) Il verdetto esce giustamente rosso: "Questo volo parte e arriva fuori dall'Unione Europea, quindi il Regolamento CE 261/2004 non si applica". 3) Sotto quel verdetto la pagina mostra sempre l'invito "Ti hanno lasciato a terra o hai perso una coincidenza?" (components/verifica/Risultato.tsx, il blocco DichiaraCaso dentro NonIdoneo, riga 776 circa). 4) Apri "Mi hanno lasciato a terra", scegli "Sì, ero in orario al gate" e "Mi hanno lasciato a terra contro la mia volontà (overbooking o simili)", premi "Scopri il verdetto".
Verificato eseguendo il motore con questo fatto: partenzaIata JFK / partenzaPaese US, arrivoIata YYZ / arrivoPaese CA, stato "atterrato", kmOrtodromica 588, orarioVerificato true, vettoreOperativo "AC". Stessa cosa con "Ho perso una coincidenza" (unica prenotazione, più di 4 ore, destinazione finale Vancouver YVR): esce 600€ su 3.930 km.
La causa: il cancello territoriale (ambitoCE261) è chiamato solo dentro lib/regole/eu261.ts, riga 164. valutaNegato e valutaCoincidenza non lo chiamano mai, e /api/verifica/dichiara passa loro il fatto senza controllare l'ambito.

**Cosa dovrebbe succedere:** Nessuna compensazione europea: su una tratta paese terzo verso paese terzo il Regolamento non si applica, quindi il caso deve restare "non idoneo", esattamente come il check di partenza.

**Cosa succede:** Verdetto "idoneo", 250€ per il negato imbarco e 600€ per la coincidenza persa, salvati sulla riga della verifica come esito vendibile. È lo stesso falso positivo del New York verso Toronto chiuso a suo tempo nel motore del ritardo, rimasto aperto sulla porta accanto.

## 2. 🔴 Volo cancellato dentro l'Europa ma lunghissimo: promette 600 euro dove la legge ne dà 400

**Dove:** `lib/regole/cancellato.ts:102`

**Come ci si arriva:** 1) Fai il check di un volo cancellato che parte e arriva dentro l'Unione ma è lungo più di 3.500 km: Parigi (CDG) verso Saint-Denis della Riunione (RUN) con Air France, 9.370 km secondo il nostro stesso archivio. 2) Il verdetto esce incerto con la frase "Questo volo risulta cancellato" e compaiono le due domande. 3) Rispondi "Nessun avviso" e "Nessun volo alternativo".
Verificato eseguendo valutaCancellato con: stato "cancellato", partenzaIata CDG / partenzaPaese FR, arrivoIata RUN / arrivoPaese RE, kmOrtodromica 9369.64, preavviso "nessuno", alternativa "nessuna".
La causa: la funzione fascia() guarda solo i chilometri (sopra 3.500 restituisce 600) e non conosce l'eccezione dell'art. 7 lettera b), quella già scritta e provata dentro lib/regole/eu261.ts alla riga 280 con il controllo intraUe. Sullo stesso identico volo, se invece è in ritardo, il motore dice correttamente 400€.

**Cosa dovrebbe succedere:** 400€. L'art. 7 lettera b) tiene a 400 tutte le tratte dentro l'Unione sopra i 1.500 km, per quanto lunghe siano: Parigi verso la Riunione è Francia con Francia.

**Cosa succede:** 600€. Al passeggero viene promessa la metà in più di quanto gli riconosce il Regolamento, e la differenza la scopre la compagnia quando risponde no.

## 3. 🔴 Lo stesso errore sull'importo anche su negato imbarco e coincidenza persa

**Dove:** `lib/regole/dichiarati.ts:70`

**Come ci si arriva:** 1) Fai il check dello stesso volo Parigi (CDG) verso Saint-Denis della Riunione (RUN), 9.370 km, tutto dentro l'Unione. 2) Sotto il verdetto apri "Mi hanno lasciato a terra", rispondi "Sì, ero in orario al gate" e "contro la mia volontà": esce 600€.
3) Stessa cosa per la coincidenza: check di un Milano (MXP) verso Parigi (CDG), poi "Ho perso una coincidenza", unica prenotazione, più di 4 ore, destinazione finale Saint-Denis della Riunione (RUN). Il viaggio intero misura 8.774 km, tutto dentro l'Unione: esce 600€.
Verificato eseguendo valutaNegato e valutaCoincidenza con quei valori. La causa è la stessa del punto precedente: la funzione fascia() alla riga 70 e la scaletta degli importi dentro valutaCoincidenza alla riga 187 non hanno il controllo intraUe che sta in lib/regole/eu261.ts riga 280.

**Cosa dovrebbe succedere:** 400€ in tutti e due i casi, per l'art. 7 lettera b).

**Cosa succede:** 600€. Nella coincidenza persa, se l'utente risponde "fra 3 e 4 ore", escono 300€: anche quello è sbagliato, perché la riduzione del 50 per cento si applica alla fascia da 600, e qui la fascia giusta è 400 piena.

## 4. 🔴 Con il portone aperto, il bottone "Prepara la pratica" su un volo dimostrativo rimbalza all'infinito

**Dove:** `components/verifica/Risultato.tsx:541`

**Come ci si arriva:** Metti COLLAUDO_APERTO=1 e lascia i link Polar non configurati (è la situazione di oggi). 1) Dalla landing fai il check del volo dimostrativo ZZ250 con la data di ieri. 2) Se sei online su Netlify il verdetto nasce in attesa: vai su /admin/verdetti e confermalo (oppure metti SHADOW_MODE=0). 3) Apri /verifica/<id>, lascia la tua email nel riquadro e aspetta la spunta verde. 4) Metti la spunta del consenso e premi "Prepara la pratica". 5) Ripeti la spunta e il bottone quante volte vuoi.

**Cosa dovrebbe succedere:** Si arriva alla cassa di prova della pratica e si finisce sulla pagina /pratica/<id>, che è esattamente quello che /admin/impostazioni promette di COLLAUDO_APERTO: «far camminare i voli dimostrativi (ZZ*) fino in fondo al percorso».

**Cosa succede:** Si torna sempre sulla stessa pagina del verdetto con la frase «Manca la spunta del consenso alla consegna immediata: mettila e riprova», anche se la spunta era messa. Il giro non finisce mai e /api/pratiche/prova non viene mai raggiunta. Il motivo: quando il volo è dimostrativo il browser salta la chiamata che registra il consenso (riga 541: `if (dati.demo) { window.location.assign(destinazione); return; }`) e va dritto al checkout, ma il checkout pretende quel consenso sul database (app/api/pratiche/checkout/route.ts:76) e rispedisce indietro. La scorciatoia aveva senso quando i voli dimostrativi avevano indirizzi tipo "demo-ZZ250-...", che il checkout intercetta prima; con il portone aperto quel volo ha un identificativo normale e finisce nel cancello del consenso.

## 5. 🔴 Con il portone aperto, chi controlla un volo VERO e preme il bottone d'acquisto finisce su una pagina bianca con del codice

**Dove:** `app/api/pratiche/prova/route.ts:73`

**Come ci si arriva:** Metti COLLAUDO_APERTO=1 e lascia i link Polar non configurati. 1) Fai il check di un volo reale che esce idoneo (per esempio un volo con oltre tre ore di ritardo). 2) Conferma il verdetto da /admin/verdetti (in produzione ogni verdetto nasce in attesa). 3) Sulla pagina del verdetto lascia l'email, metti la spunta del consenso e premi "Prepara la pratica a 14,90".

**Cosa dovrebbe succedere:** Il messaggio onesto che il sito dà quando il venditore non c'è: «Il pagamento non è ancora attivo. Lascia l'email qui sopra: ti scriviamo appena lo è», dentro la pagina del verdetto, con tutto il resto ancora intorno. È esattamente quello che succede senza COLLAUDO_APERTO.

**Cosa succede:** Una pagina bianca con scritto {"errore":"La cassa di prova vale solo sui voli dimostrativi (ZZ*)"}. Niente testata, niente marchio, nessun link per tornare indietro: l'unica via d'uscita è il tasto indietro del browser. E non capita solo a chi collauda: con COLLAUDO_APERTO=1 il codice tratta CHIUNQUE come collaudatore, quindi lo vede ogni visitatore vero che arriva fin lì. Il portone acceso peggiora il percorso invece di aprirlo.

## 6. 🔴 Le email della pratica dicono al cliente giorni che non sono quelli veri

**Dove:** `lib/email/pratiche.ts:189`

**Come ci si arriva:** 1. Apri una pratica e premi "Ho inviato il reclamo" (la data d'invio si scrive sulla pratica).
2. Aspetta che passino 42 giorni dall'invio (oppure sposta indietro di 42 giorni la data d'invio sul database) e lascia girare il controllo giornaliero delle pratiche (`/api/motore/segui`).
3. Guarda l'email che arriva: l'oggetto è "15 giorni di silenzio. Il sollecito è pronto.".
4. Ripeti a 56 giorni: arriva un'email con oggetto "30 giorni senza esito" e dentro c'è scritto "Sono passati 30 giorni dal tuo reclamo" (lib/email/pratiche.ts:221 e :227).
5. Ripeti a 90 giorni: l'email dice "Sono passati due mesi dall'invio del reclamo" (lib/email/pratiche.ts:263).

**Cosa dovrebbe succedere:** I giorni scritti nell'email devono essere quelli in cui l'email parte davvero, cioè 42 (sei settimane), 56 (otto settimane) e 90 (tre mesi). Sono i numeri decisi nel giro #45 e scritti nel codice come GIORNI_PRIMA_DEL_SOLLECITO = 42 e GIORNI_PRIMA_DELL_ENTE = 14 (lib/pratiche/rifiuto.ts:225 e :228), usati dal calendario in app/api/motore/segui/route.ts:99-105.

**Cosa succede:** Le tre email sono rimaste ai tempi di prima del 9/08: 15, 30 e due mesi. Il cliente riceve un'email che dice "sono passati 30 giorni" quando in realtà ne sono passati 56, e conta i giorni sbagliati per capire a che punto è. È la stessa bugia che il giro #51 aveva già tolto dal sito, ma nelle email non è mai stata corretta.

## 7. 🔴 L'email dell'ottava settimana manda tutti all'ENAC, anche chi non è partito dall'Italia

**Dove:** `lib/email/pratiche.ts:214`

**Come ci si arriva:** 1. Fai una pratica su un volo partito da un aeroporto non italiano, per esempio Barcellona verso Roma.
2. Segna il reclamo come inviato e lascia passare 56 giorni.
3. Leggi l'email che arriva: dice "Il passo successivo è il reclamo all'ENAC" e manda a enac.gov.it.
4. Poi apri la pagina della lettera dentro la stessa pratica: lì il foglio di segnalazione nomina l'ente spagnolo, non l'ENAC.

**Cosa dovrebbe succedere:** L'email deve nominare lo stesso ente della lettera, cioè quello del paese da cui il volo è partito (art. 16 par. 1 del Regolamento). La tabella dei 29 paesi esiste già in lib/lettera/neb.ts ed è quella che usa la lettera.

**Cosa succede:** La funzione che scrive l'email riceve solo numero di volo, data e link: il paese non le arriva mai, quindi scrive ENAC per tutti. Chi parte da Barcellona viene mandato all'ufficio sbagliato e perde settimane. È esattamente l'errore che il giro #38 aveva chiuso nella lettera e che nell'email è rimasto. Lo stesso vale per il testo dello stato della pratica, che dice "Presenta il reclamo ENAC" (lib/copy.ts:1085).

## 8. 🔴 Il sito si contraddice su quanto tempo hai per chiedere: da una parte 5-6 anni, dall'altra sei mesi

**Dove:** `lib/copy.ts:474`

**Come ci si arriva:** 1. Apri la home e premi "Perché 12 mesi" sotto il titolo: leggi "2 anni per ITA e Aeroitalia, stimati 5 o 6 per le compagnie estere" (lib/copy.ts:190).
2. Scendi alla sezione "Vale anche per i voli dell'anno scorso": le due schede dicono "2 anni" e "5-6 anni" (lib/copy.ts:474-490).
3. Apri la domanda "Fino a quando posso fare richiesta?" nelle FAQ: stessa cosa (lib/copy.ts:577).
4. Adesso apri l'articolo del Tabellone /tabellone/quanto-tempo-hai-per-chiedere-il-rimborso: in apertura dice "il numero da tenere in testa è il più severo: sei mesi", la tabella dà sei mesi o un anno, e una domanda in fondo si intitola proprio "Ho letto che ci sono due anni di tempo. È falso?" rispondendo che quei due anni non sono il tempo per chiedere i soldi.

**Cosa dovrebbe succedere:** Una risposta sola su tutto il sito. O si dice sei mesi/un anno dappertutto (con la sfumatura del caso), o si spiega in tutti e due i posti perché i numeri sono diversi. Un utente non può leggere "hai 5-6 anni" in home e "muoviti entro sei mesi" nel blog dello stesso sito.

**Cosa succede:** Le due versioni convivono, e quella della home è anche quella che il motore mette dentro la pratica pagata: scadenzaStimata in lib/regole/eu261.ts:304-320 dà 2 anni ai vettori italiani e 5 a tutti gli altri, e il risultato finisce sotto la scritta "Secondo la nostra stima, fino al ...". Quindi a chi paga per un volo Ryanair di undici mesi fa diciamo che ha tempo fino a fra quattro anni, mentre il nostro stesso articolo dice che con ogni probabilità è già tardi. È una promessa che la compagnia può smontare con una riga, e a quel punto scatta la garanzia e il rimborso lo paghiamo noi.

## 9. 🔴 Promettiamo che i soldi dell'analisi si scalano dalla pratica, ma nessuno li scala

**Dove:** `lib/check/ingresso.ts:132`

**Come ci si arriva:** 1. Accendi il muro del check mettendo NEXT_PUBLIC_CHECK_PREZZO_ATTIVO=1 (è l'interruttore previsto per il lancio).
2. Apri la home: sotto la scheda dell'analisi c'è scritto "E se poi apri la pratica, questi euro si scalano dal prezzo: il totale non cambia" (lib/copy.ts:384). Lo stesso è scritto sul muro del check (components/rivolio/MuroCheck.tsx:130) e nella scheda dell'app ospite (lib/copy.ts:80).
3. Fai un check, paga 1,99 e ottieni un verdetto idoneo.
4. Guarda il bottone d'acquisto sulla pagina del verdetto: dice "Prepara la pratica a 14,90€".
5. Premilo: la rotta di pagamento manda al link del prodotto pieno da 14,90 (app/api/pratiche/checkout/route.ts, lib/polar.ts:24-42).

**Cosa dovrebbe succedere:** Chi ha già pagato 1,99 deve trovare la pratica a 12,91 (o comunque un totale di 14,90), come promesso in almeno quattro punti del sito e come prevede la funzione scontoDaCheck.

**Cosa succede:** La funzione che calcola lo sconto (scontoDaCheck, lib/check/ingresso.ts:132) non è chiamata da nessuna parte del prodotto: cercandola nel repository compare solo dentro le prove. Il verdetto mostra sempre il prezzo pieno del listino e il pagamento punta sempre al prodotto pieno. Il cliente paga 1,99 + 14,90 = 16,89 dopo che gli abbiamo scritto tre volte che il totale non cambia.

## 10. 🔴 L'imbuto accusa il muro del pagamento di far perdere tutti, ma il muro oggi è spento

**Dove:** `app/admin/page.tsx:68`

**Come ci si arriva:** 1. Su Netlify NEXT_PUBLIC_CHECK_PREZZO_ATTIVO non c'è (è lo stato di oggi: il muro nasce spento, lo dice lib/check/ingresso.ts riga 44). 2. Fai qualche analisi dal sito e clicca almeno una volta il bottone che porta al pagamento della pratica. 3. Apri /admin e guarda il riquadro "Dove si ferma la gente".

**Cosa dovrebbe succedere:** Quando il muro è spento, i due passi "Vedono il muro" e "Pagano l'analisi" non esistono e non vanno disegnati (o vanno marcati "non applicabile"). L'imbuto deve mostrare solo passi che possono succedere davvero.

**Cosa succede:** L'imbuto mostra "Vedono il muro: 0" con accanto la perdita scritta "meno 100%", e sotto "Pagano l'analisi: 0". Poi il passo successivo, "Aprono la pratica", torna a un numero maggiore di zero. Il riquadro dice testualmente "Dove il numero crolla, è lì che perdi", quindi Valerio legge che perde il 100% delle persone su un muro che non ha mai acceso, e legge un imbuto che si riallarga dopo lo zero, cioè una forma impossibile. È il numero su cui si decide se il check a pagamento funziona.

## 11. 🔴 Le passate di collaudo contano come conversioni dentro l'imbuto, mentre la percentuale scritta due centimetri sotto le esclude

**Dove:** `lib/eventi/lettura.ts:202`

**Come ci si arriva:** 1. Con CASSA_PROVA_SEGRETO (o COLLAUDO_APERTO=1) attivi, percorri il prodotto cinque volte usando la cassa finta: ogni volta si registra un fatto "analisi pagata" marcato come prova (app/api/check/prova/route.ts riga 61). 2. Apri anche due volte la pratica dimostrativa (app/api/pratiche/prova/route.ts riga 137). 3. Apri /admin e guarda il riquadro "Dove si ferma la gente" e la riga di testo sotto di esso.

**Cosa dovrebbe succedere:** Le righe di collaudo restano nel registro ma stanno fuori da tutti i numeri che servono a decidere, come già fa la percentuale di conversione. I due numeri devono raccontare la stessa cosa.

**Cosa succede:** L'imbuto conta le prove come conversioni vere: mostra "Pagano l'analisi: 5" e "Aprono la pratica: 2". La riga subito sotto, che invece le filtra, dice "Di chi vede il muro, paga lo 0%". Due numeri in disaccordo sulla stessa scheda. Il filtro delle prove (righe 195-198) è applicato solo alla percentuale, mai ai conteggi che alimentano l'imbuto. In più, con "Aprono la pratica: 2" e "Pagano la pratica: 0" l'imbuto segnala una fuga del 100% alla cassa che non è mai avvenuta.

## 12. 🔴 Con il portone del collaudo aperto, un estraneo può far nascere account Rivolio con l'email di chiunque

**Dove:** `app/api/pratiche/prova/route.ts:46`

**Come ci si arriva:** Serve COLLAUDO_APERTO=1 su Netlify (è la riga accesa il 12/08). Da un browser qualsiasi, senza account e senza cookie: 1) fai il check del volo dimostrativo ZZ250 con una data qualsiasi (i voli che iniziano per ZZ vanno SEMPRE al fornitore dimostrativo, anche in produzione con la chiave vera: lib/voli/verifica.ts:140) e ottieni un identificativo di verifica con esito idoneo; 2) apri /verifica/<identificativo> e nel campo email scrivi l'indirizzo di un'altra persona: con il portone aperto quel campo salva davvero (components/verifica/Risultato.tsx:202) e /api/verifica/email non chiede a nessuno se quell'indirizzo è suo; 3) premi il bottone per aprire la pratica. Senza venditore configurato la rotta di checkout manda a /api/pratiche/prova (app/api/pratiche/checkout/route.ts:98), che con il portone aperto lascia passare chiunque perché inCollaudo torna vero per tutti (lib/check/cancello.ts:104). Da lì creaPratica chiama db.auth.admin.createUser({ email, email_confirm: true }) (lib/pratiche/pratiche.ts:111). Su questa rotta non c'è nessun tetto di richieste: si ripete a piacere con indirizzi diversi.

**Cosa dovrebbe succedere:** Il portone del collaudo dichiara cosa NON apre mai (il retrobottega, il bollo sui voli dimostrativi). Un estraneo non dovrebbe poter creare, senza autenticarsi, account già confermati intestati a email che non sono sue, né scrivere pratiche nel database dei clienti.

**Cosa succede:** Chiunque conosca il sito crea a ripetizione account Rivolio con email già confermata, intestati all'indirizzo che vuole, più le relative pratiche. La persona vera che poi prova a registrarsi si sente rispondere che con quella email esiste già un account.

## 13. 🔴 Sul verdetto, il campo "dove dovevi arrivare" fa ingrandire la pagina all'iPhone

**Dove:** `components/verifica/DichiaraCaso.tsx:137`

**Come ci si arriva:** 1. Da iPhone apri una pagina di verdetto, per esempio /verifica/demo-ZZ180-2026-08-07. 2. Scorri in fondo, fino a "Ti hanno lasciato a terra o hai perso una coincidenza?". 3. Tocca "Ho perso una coincidenza". 4. Tocca il campo con scritto "Citta o aeroporto". Misurato nel browser a 320 e a 390 punti: il carattere del campo e' 15px.

**Cosa dovrebbe succedere:** Il carattere del campo e' almeno 16px, come in tutti gli altri campi del sito (la scheda del check li ha gia' a 16, e la barra del pannello scrive text-[16px] con sm:text-[13.5px] proprio per questo). La pagina resta ferma.

**Cosa succede:** Il campo e' scritto a 15px. Sotto i 16px iOS ingrandisce da solo la pagina appena tocchi il campo, e non torna piu' indietro: da li' in poi il verdetto, i bottoni e il prezzo si guardano storti e serve pizzicare lo schermo per rimettere a posto. Succede a ogni larghezza, perche' quel 15px non ha nessuna eccezione per il telefono.

## 14. 🔴 Accendendo il prezzo del check, l'app pubblicata continuerà a promettere "gratis": la variabile su Netlify non la legge nessuno

**Dove:** `mobile/src/lib/ingresso.ts:19`

**Come ci si arriva:** 1. In STATO.md, "Serve Valerio 0-zero b", c'è scritto di aggiungere su Netlify EXPO_PUBLIC_CHECK_PREZZO_ATTIVO con lo stesso valore di NEXT_PUBLIC_CHECK_PREZZO_ATTIVO.
2. Ma netlify.toml alla voce [build] esegue solo `npm run build`, cioè `next build`. L'app non viene mai ricostruita: è un export statico già committato dentro public/app-anteprima.
3. Prova che la variabile è già stata "cotta" dentro il file al momento dell'export: `grep -c EXPO_PUBLIC_CHECK_PREZZO_ATTIVO public/app-anteprima/_expo/static/js/web/entry-*.js` risponde 0. Expo la sostituisce con il valore fisso al momento di `npm run anteprima`, e all'ultimo export non c'era: quindi lì dentro il muro è spento per sempre.
4. E non c'è nessun posto che lo ricordi: `rg EXPO_PUBLIC app lib components` non trova niente, e /admin/impostazioni (la pagina che elenca le variabili e dice cosa succede se mancano) elenca solo NEXT_PUBLIC_CHECK_PREZZO_ATTIVO.
Risultato: il giorno che si accende il muro, il sito fa pagare 1,99 e l'app dentro rivolio.netlify.app/app-anteprima continua a scrivere "Il check è gratis, sempre" e "30 secondi, gratis".

**Cosa dovrebbe succedere:** Accendendo l'interruttore su Netlify, sito e app dicono la stessa cosa nello stesso momento. È esattamente quello che il commento in cima a mobile/src/lib/ingresso.ts promette.

**Cosa succede:** Su Netlify quella variabile non ha nessun effetto. Per allinearla bisogna lanciare `npm run anteprima` dentro mobile/ e committare il risultato, e questo passaggio non è scritto in nessun posto che si guardi (né nella pagina delle impostazioni né in un controllo delle prove).

## 15. 🟡 Con il portone aperto il percorso si ferma comunque al verdetto, perché il controllo umano resta acceso

**Dove:** `lib/voli/verifica.ts:318`

**Come ci si arriva:** COLLAUDO_APERTO=1 su Netlify (che è l'unico posto dove ha senso metterlo) e SHADOW_MODE non impostata. 1) Fai il check di ZZ250. 2) Apri la pagina del verdetto.

**Cosa dovrebbe succedere:** Il volo dimostrativo cammina fino in fondo, come dichiara la scheda di COLLAUDO_APERTO in /admin/impostazioni.

**Cosa succede:** Al posto dei bottoni compare il riquadro «Un controllo umano conferma il verdetto entro poche ore: lascia l'email e ti scriviamo noi», e non c'è nessun modo di proseguire da lì. In produzione il controllo umano è acceso da solo (riga 318: basta che NODE_ENV sia "production") e il portone non lo apre. La mossa che sblocca (andare in /admin/verdetti e confermare a mano) non è scritta da nessuna parte sulla pagina: chi non conosce il retrobottega si ferma e basta.

## 16. 🟡 Dopo la cassa di prova della pratica ti trovi davanti a un accesso di cui non hai la chiave

**Dove:** `app/api/pratiche/prova/route.ts:139`

**Come ci si arriva:** 1) Arriva a far aprire una pratica di prova (una volta sistemato il rimbalzo del punto 1, oppure aprendo a mano /api/pratiche/prova?verifica=<id>&tipo=singola con COLLAUDO_APERTO=1). 2) Segui il rimando automatico.

**Cosa dovrebbe succedere:** Si finisce sulla pratica, con i quattro fogli e la lettera. Nel percorso vero questo funziona perché il pagamento fa partire un'email con dentro un link che ti fa entrare senza password (app/api/polar/webhook/route.ts).

**Cosa succede:** Si viene rimandati su /pratica/<id>, che chiede l'accesso e manda su /entra. Ma l'account con quell'email è stato appena creato dal codice SENZA password (lib/pratiche/pratiche.ts, `createUser` senza campo password), quindi "Accedi" risponderà sempre «Email o password non corrispondono», e "Registrati" con lo stesso indirizzo non apre nessuna sessione. La cassa di prova non manda nessuna email con il link. L'unica porta che funziona è "entra senza password", e la pagina non dice che è l'unica.

## 17. 🟡 Un'email scritta male sulla pagina del verdetto non si può più correggere, e la risposta non dice cosa fare

**Dove:** `app/api/verifica/email/route.ts:77`

**Come ci si arriva:** 1) Fai un check che esce idoneo. 2) Sulla pagina del verdetto scrivi un indirizzo con un refuso (per esempio mario@gmial.com) e premi il bottone: compare la conferma verde. 3) Ricarica la pagina: il riquadro dell'email torna vuoto. 4) Scrivi l'indirizzo giusto e premi di nuovo.

**Cosa dovrebbe succedere:** O l'indirizzo si corregge, oppure il messaggio dice la mossa successiva («l'email è già collegata a questa verifica: rifai il check per cambiarla»).

**Cosa succede:** Esce in rosso «Non ho potuto salvare questa email su questa verifica.» e finisce lì. La persona non sa se il problema è suo o del sito, e soprattutto non sa che deve rifare il check. Il danno vero viene dopo: la pratica si crea su quell'indirizzo sbagliato (è il campo che legge /api/pratiche/prova e il webhook di Polar) e diventa l'account con cui bisogna entrare per leggere la lettera. Chi ha sbagliato una lettera nell'indirizzo ha pagato una pratica che non riuscirà ad aprire.

## 18. 🟡 Una FAQ della home promette la replica e il reclamo all'ente al giorno 30

**Dove:** `lib/copy.ts:567`

**Come ci si arriva:** 1. Apri la home e scendi alla sezione Domande.
2. Apri "E se la compagnia dice che era maltempo o sciopero?".
3. Ultima riga: "al giorno 30 trovi contro-risposta e reclamo ENAC già pronti".

**Cosa dovrebbe succedere:** I giorni veri: la replica al no è disponibile subito se il no è già arrivato, altrimenti al giorno 42; la segnalazione all'ente al giorno 56. Sono le costanti in lib/pratiche/rifiuto.ts:225 e :228.

**Cosa succede:** La FAQ è rimasta al calendario vecchio e promette il giorno 30, cioè 26 giorni prima di quando quel materiale arriva davvero. Il giro #51 aveva ripulito i "giorno 15" e la prova che lo controlla (prove/quarto-colpo.spec.ts:264) cerca solo la stringa "giorno 15": il "giorno 30" le è passato sotto.

## 19. 🟡 Privacy e Condizioni dichiarano che i pagamenti li gestisce Polar, la pagina Rimborsi no

**Dove:** `app/privacy/page.tsx:67`

**Come ci si arriva:** 1. Apri /privacy e leggi il punto "Pagamenti": "sono gestiti dal fornitore di pagamento (Polar, in qualità di merchant of record)".
2. Apri /condizioni: "I pagamenti sono gestiti da Polar (merchant of record), che emette anche la ricevuta" (app/condizioni/page.tsx:73).
3. Apri /rimborsi, sezione "Chi incassa": "Il pagamento è gestito da un fornitore esterno che agisce da rivenditore", senza nome (app/rimborsi/page.tsx:150).

**Cosa dovrebbe succedere:** Le tre pagine devono dire la stessa cosa, e l'informativa privacy deve nominare il fornitore a cui i dati vanno davvero: è un'informazione obbligatoria, non un dettaglio di stile.

**Cosa succede:** Due pagine legali su tre nominano Polar, che ha rifiutato l'iscrizione il 10/08 (ARRETRATI voce A0) e quindi oggi non incassa niente per noi, mentre la terza, scritta il 12/08 dopo il sì di Dodo Payments, evita il nome. Il lettore trova tre versioni diverse dello stesso fatto e l'informativa privacy indica un destinatario dei dati che non è quello vero.

## 20. 🟡 L'email di conferma indirizzo manda l'utente su rivolio.it, che non è il sito

**Dove:** `lib/email/messaggi.ts:173`

**Come ci si arriva:** 1. Registra un account nuovo sul sito.
2. Apri l'email "Conferma il tuo indirizzo".
3. Leggi la riga in fondo: "Ricevi questa email perché qualcuno ha usato questo indirizzo per registrarsi su rivolio.it".
4. Scrivi rivolio.it nel browser: non è il sito di Rivolio.

**Cosa dovrebbe succedere:** L'indirizzo deve venire dalla funzione casa(), come in tutte le altre email (per esempio lib/email/pratiche.ts:110), così il giorno che il dominio cambia si muove da solo. Oggi casa() restituisce l'indirizzo vero, rivolio.netlify.app.

**Cosa succede:** Il dominio è scritto a mano dentro il testo. Chi riceve l'email e vuole controllare da dove arriva finisce su un indirizzo che non serve il sito, e questa è proprio l'email che deve rassicurare qualcuno sul fatto di non essere finito in una truffa. Contraddice anche la regola del giro #47, secondo cui l'indirizzo del sito non è più scritto a mano da nessuna parte.

## 21. 🟡 Il conteggio dei verdetti da confermare si ferma a 30, ma è scritto come se fosse tutta la coda

**Dove:** `app/admin/verdetti/page.tsx:180`

**Come ci si arriva:** 1. Fai in modo che ci siano più di 30 verdetti idonei in attesa di conferma (con lo shadow mode acceso basta che arrivino 31 analisi idonee). 2. Apri /admin: la casella "Verdetti da confermare" mostra il numero vero, contato dal database. 3. Apri /admin/verdetti e leggi il bollo in alto a destra della scheda "Da confermare".

**Cosa dovrebbe succedere:** O il bollo dice il numero vero della coda, o dice chiaramente che si stanno mostrando i primi 30 di un totale più grande.

**Cosa succede:** Il bollo dice "30 in coda" e l'elenco si ferma a 30 righe, senza nessun avviso: la lettura è limitata a 30 (riga 112) e il bollo stampa quante righe sono state lette, non quante ce ne sono. Se in coda ce ne sono 45, la Panoramica dice 45 e i Verdetti dicono 30 nella stessa sessione. È la coda che blocca gli incassi (finché non confermi, quel cliente non può pagare), quindi il numero sbagliato è quello che fa credere di aver finito il lavoro.

## 22. 🟡 Il riquadro "A che punto sono" delle pratiche conta solo le ultime 60, accanto a un totale che invece è vero

**Dove:** `app/admin/pratiche/page.tsx:107`

**Come ci si arriva:** 1. Fai in modo che ci siano più di 60 pratiche nel database. 2. Apri /admin/pratiche. 3. Confronta il riquadro "Pratiche in tutto" con la somma dei bollini del riquadro "A che punto sono".

**Cosa dovrebbe succedere:** O i bollini contano tutte le pratiche, o dicono che si riferiscono solo alle ultime 60, come fa il titolo dell'elenco sotto.

**Cosa succede:** "Pratiche in tutto" mostra il totale vero contato dal database, mentre i bollini sono calcolati sulle sole 60 righe caricate per l'elenco e non lo dicono da nessuna parte. Con 100 pratiche si legge "Pratiche in tutto: 100" e sotto bollini che sommano 60. Peggio: quelle vecchie e ferme (per esempio le "inviate" che aspettano il sollecito) escono dalla finestra delle ultime 60 e spariscono dal conteggio proprio quando andrebbero guardate. Lo stesso difetto era già stato chiuso il 12/08 sui due riquadri accanto, ma non su questo.

## 23. 🟡 I numeri della Panoramica e del Traffico si accorciano da soli quando gli eventi superano il tetto, e nessuno lo scrive

**Dove:** `lib/eventi/lettura.ts:129`

**Come ci si arriva:** 1. Fai in modo che negli ultimi 7 giorni ci siano più eventi del tetto di lettura (ogni visita alla landing è un evento: bastano poche migliaia di visite al giorno, cioè un video che gira). 2. Apri /admin e /admin/traffico.

**Cosa dovrebbe succedere:** Come già fa la lettura del grafico per giorno (righe 400-420), quando la lettura viene tagliata bisogna dirlo, e i numeri incompleti non vanno presentati come totali.

**Cosa succede:** La lettura chiede al massimo 20.000 righe e non controlla mai se ne sono arrivate esattamente 20.000: se il tetto è stato toccato, visite, analisi, provenienze, paesi e l'intero imbuto vengono calcolati su un pezzo della settimana e mostrati come se fossero i totali dei 7 giorni. Nessun avviso, nessun "non letto": i numeri semplicemente calano. In più il tetto vero è quello che impone Supabase (di serie 1.000 righe per richiesta, alzabile solo dalle impostazioni del progetto), quindi il taglio scatta molto prima dei 20.000 e neutralizza anche il controllo che il grafico per giorno fa a riga 415, perché quel controllo scatta solo a 20.000 righe esatte e non ci arriverà mai.

## 24. 🟡 "Incassato in tutto" viene sommato su una lettura senza tetto: oltre il limite del database smette di crescere in silenzio

**Dove:** `app/admin/pratiche/page.tsx:88`

**Come ci si arriva:** 1. Fai in modo che ci siano più pratiche del tetto di righe del progetto Supabase (di serie 1.000). 2. Apri /admin/pratiche e guarda il riquadro verde "Incassato in tutto".

**Cosa dovrebbe succedere:** O la somma la fa il database (una somma, non un elenco di righe da sommare a mano), o si dichiara che è parziale.

**Cosa succede:** La lettura chiede l'elenco di tutti i prezzi pagati senza nessun tetto e senza nessun ordine, e li somma nel codice. Supabase taglia comunque la risposta al proprio limite di righe, quindi da quel punto in poi il totale degli incassi resta fermo, mostrato in verde e in grande come se fosse la somma di tutto. Non c'è nemmeno un ordinamento, quindi non si può nemmeno sapere quali righe sono state prese: sono quelle che fa comodo al database. Il riquadro dice testualmente "Somma di quanto è stato pagato davvero, su tutte le pratiche".

## 25. 🟡 La percentuale accanto alle analisi di oggi confronta mezza giornata con giornate intere, quindi la mattina è sempre in rosso

**Dove:** `app/admin/page.tsx:41`

**Come ci si arriva:** 1. Apri /admin la mattina presto, per esempio alle 9. 2. Guarda la pillola sotto la casella "Analisi lanciate oggi".

**Cosa dovrebbe succedere:** O si confronta oggi con lo stesso pezzo di giornata dei giorni prima, o il confronto si mostra solo a giornata finita. E l'etichetta deve dire su quanti giorni è fatta la media.

**Cosa succede:** La pillola confronta il conteggio di oggi (che alle 9 vale due ore di traffico) con la media di giornate intere, quindi mostra sistematicamente una freccia in giù con una percentuale molto negativa anche in una giornata che sta andando meglio delle altre. È il primo numero che si guarda la mattina e dice il contrario di quello che sta succedendo. In più l'etichetta scrive "sulla media dei 14 giorni" mentre la media è fatta su 13 (oggi viene tolto dal confronto, riga 41).

## 26. 🟡 Un indirizzo rivolio.it che rimbalza su un sito qualsiasi: il filtro del ritorno dopo il login non ferma la barra rovesciata

**Dove:** `app/auth/sessione/route.ts:24`

**Come ci si arriva:** 1) Registra un account qualsiasi su Rivolio e, dagli strumenti da sviluppatore, copia i due gettoni della tua sessione (access_token e refresh_token). 2) Componi https://rivolio.it/auth/sessione?access_token=<il tuo>&refresh_token=<il tuo>&poi=/\sito-cattivo.it (barra normale seguita da barra rovesciata). 3) Aprilo: il filtro di riga 24 controlla solo che il valore inizi per una barra e non per due, quindi lo lascia passare; poi new URL(poi, request.url) normalizza la barra rovesciata e il browser finisce su https://sito-cattivo.it/. Verificato eseguendolo: new URL("/\\sito-cattivo.it", "https://rivolio.it/auth/sessione").href vale "https://sito-cattivo.it/". La regola giusta esiste già ed è scritta apposta per questo caso in lib/api/percorso.ts, ma questa rotta non la usa: si è fatta un controllo suo.

**Cosa dovrebbe succedere:** Come le altre porte d'ingresso (auth/conferma, entra, posta-auth), anche questa dovrebbe passare da percorsoInterno, che accetta solo i caratteri di un percorso interno vero e manda /\sito-cattivo.it su /app.

**Cosa succede:** Si fabbrica un link che comincia per rivolio.it e finisce su un sito estraneo, dopo aver anche collegato chi lo apre a un account che non è il suo. È l'ingrediente di una pagina di imitazione: la persona vede il nostro dominio nel messaggio e si fida.

## 27. 🟡 La ricevuta dell'analisi, copiata prima di essere consumata, apre per trenta giorni la lettura delle carte d'imbarco e gli orari veri di atterraggio

**Dove:** `app/api/leggi-carta/route.ts:55`

**Come ci si arriva:** Serve il muro acceso (NEXT_PUBLIC_CHECK_PREZZO_ATTIVO=1). 1) Paga un'analisi (o passa dalla cassa di prova) e, prima di usarla, copia dagli strumenti da sviluppatore il valore del cookie rivolio_check. 2) Fai la tua analisi: il credito si consuma e il cookie viene cancellato. 3) Rimetti a mano nel browser il cookie con il valore copiato. 4) Chiama /api/leggi-carta con una foto: risponde e legge il documento, quante volte vuoi. Stessa cosa su /api/voli-tratta (riga 93): con quel cookie rimesso torna a uscire l'orario di atterraggio VERO di ogni volo cercato, cioè la cosa che il muro esiste per far pagare. Il registro sul database che impedisce proprio il riuso (creditoFinito, lib/check/cancello.ts) lo consulta solo /api/verifica; queste due rotte guardano soltanto se il cookie è firmato e non scaduto.

**Cosa dovrebbe succedere:** Una ricevuta già consumata non deve aprire più niente su nessuna porta: il conto lo tiene il database e non il cookie, e questo vale anche per la lettura della carta d'imbarco e per l'elenco dei voli di una tratta.

**Cosa succede:** Un'analisi pagata una volta sola dà, per trenta giorni, chiamate illimitate all'OCR (che paghiamo a chiamata) e la lettura illimitata degli orari di atterraggio certificati. Basta salvare una stringa prima di usarla, e quella stringa si può passare ad altri.

## 28. 🟡 L'identificativo di una verifica qualsiasi apre le tre rotte laterali, e vale per qualunque volo

**Dove:** `lib/check/cancello.ts:219`

**Come ci si arriva:** Serve il muro acceso. 1) Procurati l'identificativo di una verifica esistente: basta il tuo (una sola analisi pagata) oppure un indirizzo /verifica/<identificativo> condiviso da qualcun altro, visto che quelle pagine sono pubbliche e fatte per essere passate. 2) Chiama /api/verifica/dichiara con quel verificaId ma con numero e data di un volo COMPLETAMENTE DIVERSO, caso "negato", presenza "inOrario", volonta "involontario". Il cancello di riga 219 controlla soltanto che quella riga esista da qualche parte nel database: non guarda né di chi è né se parla dello stesso volo. 3) Ricevi il verdetto idoneo con l'importo della fascia (valutaNegato in lib/regole/dichiarati.ts), e ogni chiamata fa partire una richiesta al fornitore dati che paghiamo noi. Si ripete quante volte si vuole senza consumare niente. Lo stesso vale per /api/verifica/cancellato e /api/verifica/operativo.

**Cosa dovrebbe succedere:** Il commento della funzione dice che quell'identificativo si ottiene in un modo solo, passando dal cancello, e che serve a non far pagare due volte la stessa persona per lo stesso volo: dovrebbe quindi aprire solo il seguito di QUEL volo, non essere una chiave universale e riusabile all'infinito.

**Cosa succede:** Un identificativo solo, anche di un'altra persona, dà verdetti a pagamento illimitati su qualunque volo, e ogni verdetto ci costa una chiamata al fornitore. Il muro resta in piedi solo sulla porta principale.

## 29. 🟡 Stesso ingrandimento sul campo "di che compagnia era l'aereo"

**Dove:** `components/verifica/ChiHaOperato.tsx:177`

**Come ci si arriva:** 1. Da iPhone apri il verdetto di un volo in codeshare (quello in cui compare il riquadro "Di che compagnia era l'aereo?"). 2. Tocca il campo di ricerca della compagnia. Il carattere dichiarato nel codice e' text-[15.5px], senza nessuna eccezione per schermi piccoli.

**Cosa dovrebbe succedere:** Almeno 16px, come sugli altri campi.

**Cosa succede:** 15,5px: iOS ingrandisce la pagina da solo. E' lo stesso difetto di sopra, su un percorso meno frequente ma che serve proprio a chiudere un caso incerto, cioe' a farlo diventare vendibile.

## 30. 🟡 In fondo a ogni pagina, Privacy Cookie e Condizioni sono bersagli da 20 punti a 8 punti l'uno dall'altro

**Dove:** `components/Footer.tsx:197`

**Come ci si arriva:** 1. Apri qualsiasi pagina del sito da un telefono da 390 punti. 2. Scorri fino in fondo, alla riga sotto la linea, dove ci sono Supporto, Condizioni d'uso, Rimborsi, Privacy, Cookie. Misurato nel browser: ogni link e' alto 20,3 punti, "Cookie" e "Privacy" sono larghi 48 e 49; la riga va a capo e i due gruppi restano a 7,7 punti di distanza verticale.

**Cosa dovrebbe succedere:** Un bersaglio da toccare alto almeno 44 punti, come gia' fatto altrove nel sito con la classe tocco-comodo (Logo, HeroCheck, PrezziRivolio, Masthead, StrisciaArgomenti).

**Cosa succede:** 20,3 punti di altezza e meno di 8 di stacco: col pollice si prende Privacy volendo Cookie, o non si prende niente. Nella stessa condizione stanno anche le tre colonne di link sopra (Il check gratuito, Come funziona, Prezzi e le altre), alte 21,8 punti con 14 di stacco. Sono le pagine legali, cioe' quelle che devono essere raggiungibili sempre.

## 31. 🟡 Nella scheda prezzi, "Come nasce il 1.000 euro" e' alto 18 punti mentre il suo gemello a 46 righe di distanza e' gia' stato sistemato

**Dove:** `components/rivolio/PrezziRivolio.tsx:241`

**Come ci si arriva:** 1. Apri la home da un telefono da 390 punti. 2. Scorri alla sezione dei prezzi. 3. Prova a toccare la scritta tratteggiata "Come nasce il 1.000 euro" dentro la card. Misurato: 18,8 punti di altezza, 147 di larghezza. Il link "Come nasce questa cifra" del confronto, riga 287 dello stesso file, misura 44 perche' ha la classe tocco-comodo.

**Cosa dovrebbe succedere:** Anche questo bersaglio a 44 punti sul telefono: e' lo stesso tipo di elemento, nello stesso file, e la soluzione esiste gia'.

**Cosa succede:** 18,8 punti. E' il link che apre il conto, cioe' la trasparenza che il prodotto vende, ed e' il piu' piccolo da toccare di tutta la pagina.

## 32. 🟡 Sul verdetto, "Come nasce questa cifra" e' alto 20 punti

**Dove:** `components/verifica/Risultato.tsx:371`

**Come ci si arriva:** 1. Da un telefono da 390 punti apri /verifica/demo-ZZ250-2026-08-07. 2. Nel riquadro verde scuro con la cifra grande, prova a toccare "Come nasce questa cifra". Misurato nel browser: 20 punti di altezza.

**Cosa dovrebbe succedere:** Almeno 44 punti sul telefono, come per gli altri link di trasparenza gia' sistemati.

**Cosa succede:** 20 punti. E' l'unico modo che ha l'utente di aprire il conto dietro il numero che gli stiamo mostrando, sulla schermata dove decide se pagare.

## 33. 🟡 Le etichette del biglietto sul verdetto sono grigio chiarissimo a 9 punti: contrasto 2,5 su 4,5 richiesto

**Dove:** `components/rivolio/CartaImbarcoScan.tsx:113`

**Come ci si arriva:** 1. Da un telefono da 390 punti apri /verifica/demo-ZZ250-2026-08-07. 2. Guarda le scritte VOLO, DATA, TRATTA, ARRIVO PREVISTO, ARRIVO EFFETTIVO, VERIFICA sopra i dati del biglietto. Misurato due volte nel browser: colore #9aa4b0 su bianco, contrasto 2,53 a 1, corpo 9 punti con le lettere distanziate. Stesso problema per VERIFICA COMPLETATA in cima (2,37 a 1) e per "Orari in ora italiana." (2,53 a 1).

**Cosa dovrebbe succedere:** Almeno 4,5 a 1, che e' il minimo di legge per il testo piccolo.

**Cosa succede:** 2,53 a 1. Alla luce del sole quelle scritte spariscono, e sono proprio le etichette della prova che vendiamo: quale volo, che giorno, a che ora doveva arrivare e a che ora e' arrivato. Il colore arriva dal token --color-fumo-2 in app/globals.css:16, quindi lo stesso grigio si porta dietro anche le righe "Fonte: ENAC" e simili sulla home.

## 34. 🟡 Chi parte da un aeroporto non italiano vede scritto "ENAC" mentre la sua lettera dice "non l'ENAC"

**Dove:** `lib/copy.ts:1082`

**Come ci si arriva:** 1. Una pratica che arriva allo stato `enac` (56 giorni dall'invio, oppure subito col no dichiarato).
2. Su /app, linguetta "Le tue pratiche": il bollino dello stato scrive "ENAC" e il prossimo passo scrive "Presenta il reclamo ENAC seguendo i passi nell'email".
3. Su /pratica/<id>: stesso titolo, e nella cronologia "Reclamo ENAC pronto" (lib/copy.ts:1120) ed "Email col reclamo ENAC inviata" (:1135).
4. Su /pratica/<id>/lettera, la segnalazione generata per lo STESSO volo dice, testualmente (lib/lettera/genera.ts:359): "Il tuo volo è partito da un aeroporto in Spagna, quindi l'organismo competente è AESA, non l'ENAC".
Lo stesso testo sbagliato è anche nell'app: mobile/src/lib/testi.ts:857 ("ENAC") e :995 ("Reclamo all'ENAC").

**Cosa dovrebbe succedere:** Lo stato e la cronologia nominano l'ente del paese di partenza, come già fanno la lettera e la guida dal giro #38 (art. 16 par. 1: la competenza è dello Stato dell'aeroporto di partenza). Oppure usano una parola neutra: "Segnalazione all'ente".

**Cosa succede:** Lo stato dice "ENAC" a tutti. Chi parte da Barcellona, Monaco o Varsavia legge nella propria pratica un ufficio che non tratterà mai il suo caso, e lo legge nello stesso giro in cui la lettera gli spiega il contrario.

## 35. 🟡 La landing promette "al giorno 30" quello che il motore fa al giorno 42 e al 56

**Dove:** `lib/copy.ts:567`

**Come ci si arriva:** 1. Apri la home e scendi alle Domande, voce "E se la compagnia dice che era maltempo o sciopero?".
2. Si legge: "...al giorno 30 trovi contro-risposta e reclamo ENAC già pronti". Verificato sul sito che gira: `curl -s http://localhost:3000/ | grep "al giorno 30 trovi"` lo trova due volte.
3. I numeri veri sono in lib/pratiche/rifiuto.ts:225 (GIORNI_PRIMA_DEL_SOLLECITO = 42) e :228 (+14, quindi 56), e app/api/motore/segui/route.ts:21 lo scrive nero su bianco: "T+56 dall'invio → segnalazione all'ente nazionale".
È lo stesso errore chiuso nel giro #51 in sei punti del sito: questa riga era rimasta fuori.

**Cosa dovrebbe succedere:** La FAQ dice quello che il motore fa davvero: la replica alla sesta settimana, la segnalazione all'ente due settimane dopo.

**Cosa succede:** Promette 26 giorni prima di quando succede. Chi compra si aspetta la contro-risposta al giorno 30 e a quel giorno non trova niente.

## 36. 🟡 La linguetta "Profilo" della web app è tagliata su ogni telefono fino a 414 punti

**Dove:** `components/app/AppRivolio.tsx:86`

**Come ci si arriva:** 1. Apri /app con un telefono (o il browser ristretto) e guarda la barra delle tre sezioni.
2. Misurato nel browser: a 320 punti la barra è larga 280 e il contenuto 380, quindi 97 punti restano fuori e di "Profilo" si legge una lettera; a 375 (iPhone SE, iPhone 8) ne restano fuori 42; a 390 (iPhone 14/15) ne restano fuori 27; entra tutta solo da 430 in su.
3. La barra ha `[scrollbar-width:none]`, quindi non c'è nessun segno che si possa trascinare di lato.
Il giro di oggi (commit f7ac3f7, "la barra della web app era 379 su uno schermo da 375") ha tolto lo scorrimento della PAGINA intera, che era il sintomo peggiore, ma la terza linguetta resta tagliata.

**Cosa dovrebbe succedere:** Le tre sezioni della web app si vedono tutte su un telefono normale.

**Cosa succede:** La terza è mozzata. Su uno schermo da 320 punti l'unico modo per arrivarci è scoprire per caso che quella barra si trascina.

## 37. 🟡 Il pannello Profilo promette avvisi e classifica che nella web app non esistono

**Dove:** `lib/copy.ts:149`

**Come ci si arriva:** 1. Apri /app senza essere entrato e premi "Profilo".
2. Si legge: "Il check funziona lo stesso. Con l'account trovi le pratiche, gli avvisi e la classifica."
3. Entra con un account: nella web app non c'è nessuna classifica (cercato in tutto il sito: la classifica esiste solo come rotta /api/classifica, nessuna pagina la mostra) e non c'è nessun avviso o notifica (esistono solo dentro l'app sul telefono).
4. Nello stesso pannello c'è la spunta "Partecipa alla classifica" (lib/copy.ts:162) che dice "il tuo nome pubblico e l'importo entrano in classifica": il dato si salva davvero, ma da web non c'è nessun posto dove quella classifica si possa vedere.

**Cosa dovrebbe succedere:** O la web app ha la classifica e gli avvisi, o non li promette.

**Cosa succede:** Promette due cose su tre che da web non esistono, e offre una spunta che porta in un posto irraggiungibile.

## 38. 🟡 Fatto un check dentro la web app si finisce sulla landing e non si torna più indietro

**Dove:** `app/verifica/[id]/page.tsx:76`

**Come ci si arriva:** 1. Apri /app, linguetta "Controlla", premi "So il numero".
2. Scrivi ZZ250 e la data 06/08/2026, premi "Controlla gratis".
3. Dopo l'analisi si arriva su /verifica/demo-ZZ250-2026-08-06.
4. Ho elencato tutti i link di quella pagina: sono quattro, e i due di navigazione puntano entrambi a "/" (il marchio in alto e "Controlla un altro volo"). Gli altri due sono i bottoni della cassa.
5. Dalla landing non si torna a /app se non conoscendo l'indirizzo: la barra in alto ha "Entra", che porta al login.

**Cosa dovrebbe succedere:** Chi fa il check DENTRO la web app resta nella web app: il verdetto ha lo stesso guscio, o almeno un ritorno a /app.

**Cosa succede:** Il check è l'unica cosa che la web app sa fare, e usarla butta l'utente fuori dalla web app.

## 39. 🟡 L'app che il sito mostra nella lavagna è ferma a quattro commit fa: manca il muro del check

**Dove:** `public/app-anteprima/_expo/static/js/web/entry-4daa30591e502d810932b4569420adf5.js:1`

**Come ci si arriva:** 1. `git log -1 -- public/app-anteprima` → commit f983f39, 11/08 alle 09:30.
2. `git log f983f39..HEAD --oneline -- mobile/src` → quattro commit dopo, fra cui "Il muro anche nell'app", "Le 60 promesse di gratis passano tutte dall'interruttore" e quello di oggi.
3. Prova diretta: `grep -c "Gli orari certificati di partenza e atterraggio" public/app-anteprima/_expo/static/js/web/entry-*.js` risponde 0. Quella frase è dentro mobile/src/components/MuroCheck.tsx, cioè il muro del check dell'app: nel file pubblicato non c'è proprio.
4. Quindi /anteprima-app (la lavagna con le 34 schermate) e /app-anteprima mostrano l'app dell'11 agosto mattina, non quella di adesso.

**Cosa dovrebbe succedere:** La lavagna è stata costruita apposta perché ogni riquadro sia l'app VERA (STATO, giro #50: "uno screenshot invecchierebbe al primo push senza che nessuno se ne accorga").

**Cosa succede:** Invecchia esattamente come uno screenshot, perché è un export statico committato che nessuna build rifà. Chi guarda la lavagna per decidere il design della web app sta guardando una versione che non esiste più.

## 40. 🟢 L'errore della cassa di prova esce del colore del testo normale, non rosso

**Dove:** `components/rivolio/CassaProva.tsx:128`

**Come ci si arriva:** 1) Apri /cassa-prova. 2) Fai fallire il pagamento finto (per esempio togliendo la chiave con cui il server firma la ricevuta: la rotta risponde «Il server non è configurato per firmare la ricevuta»). 3) Premi il bottone "Paga".

**Cosa dovrebbe succedere:** Il messaggio di errore si distingue a colpo d'occhio dal resto della pagina.

**Cosa succede:** Il messaggio esce nero come tutto il testo intorno. La classe usata è `text-errore`, ma in app/globals.css non esiste nessun colore chiamato "errore": Tailwind quella classe non la genera proprio, quindi non colora niente. È lo stesso difetto già trovato l'11/08 su altre due schermate e mai chiuso qui.

## 41. 🟢 Il pallino verde "in diretta" pulsa anche sulle sezioni che non si aggiornano mai da sole

**Dove:** `components/admin/Guscio.tsx:178`

**Come ci si arriva:** 1. Apri /admin/verdetti (oppure /admin/pratiche o /admin/iscritti). 2. Lascia la scheda aperta e fai arrivare un verdetto idoneo nuovo (o una pratica nuova). 3. Aspetta qualche minuto senza toccare niente e guarda in alto a destra.

**Cosa dovrebbe succedere:** Il pallino che pulsa e l'ora accanto vanno mostrati solo dove i numeri si rinfrescano davvero; altrove deve restare il solo bottone "aggiorna".

**Cosa succede:** Il rinfresco automatico è acceso solo su quattro indirizzi (riga 51), ma il pallino verde che pulsa e la scritta "aggiornato alle HH:MM" compaiono su tutte le sezioni. Su Verdetti, Pratiche e Iscritti la pagina resta ferma per ore mentre la testata continua a dire che è aggiornata e il pallino continua a pulsare. Il commento nel codice dice che quel pallino significa "i numeri si muovono da soli": su cinque sezioni su nove non è vero, e una di quelle è la coda che blocca gli incassi.

## 42. 🟢 Le Impostazioni dicono "c'è" per una variabile che su Netlify non c'è (e "non c'è" per una che c'è)

**Dove:** `app/admin/impostazioni/page.tsx:176`

**Come ci si arriva:** 1. Su Netlify non mettere nessuna variabile SHADOW_MODE. 2. Apri /admin/impostazioni e cerca la scheda SHADOW_MODE: dice "c'è", in verde. 3. Poi metti NEXT_PUBLIC_CHECK_PREZZO_ATTIVO con valore 0, rilancia il deploy e guarda la sua scheda: dice "non c'è (va bene)".

**Cosa dovrebbe succedere:** Questa pagina serve a rispondere a una domanda sola: quella variabile su Netlify c'è o non c'è. La risposta deve combaciare con quello che si vede su Netlify.

**Cosa succede:** Per SHADOW_MODE il codice controlla se il valore è diverso da "0", quindi una variabile assente viene raccontata come presente: Valerio apre Netlify, non la trova, e il pannello continua a dirgli che c'è. Per NEXT_PUBLIC_CHECK_PREZZO_ATTIVO succede il contrario: con valore 0 la variabile esiste su Netlify ma il pannello dice che non c'è. Sono due schede su sedici che rispondono a una domanda diversa da quella che pongono, su una pagina il cui unico scopo dichiarato è dire cosa è configurato.

## 43. 🟢 "Righe in tutto" negli Iscritti conta solo le ultime 200

**Dove:** `app/admin/iscritti/page.tsx:111`

**Come ci si arriva:** 1. Fai in modo che ci siano più di 200 iscritti. 2. Apri /admin/iscritti. 3. Somma le prime tre caselle (Iscritti veri, In attesa di conferma, Disdette) e confrontala con la quarta, "Righe in tutto".

**Cosa dovrebbe succedere:** O la casella conta tutte le righe (le prime tre sono già contate dal database sull'intera tabella), o non si chiama "in tutto".

**Cosa succede:** Le prime tre caselle sono contate sul database e crescono, la quarta si ferma a 200 perché conta le righe caricate per l'elenco. Con 500 iscritti si legge, sulla stessa riga, 300 + 150 + 50 accanto a "Righe in tutto: 200". La nota sotto dice "Le ultime 200", ma l'etichetta grossa dice il contrario e le tre caselle accanto la smentiscono a vista.

## 44. 🟢 Il bianco sui bottoni verdi principali sta a 3,5 di contrasto invece di 4,5

**Dove:** `app/globals.css:18`

**Come ci si arriva:** 1. Apri la home da un telefono. 2. Guarda il testo dei bottoni pieni: "Cerca il volo", "Controlla gratis", "Carica la foto", "Prepara la pratica", e sul verdetto "Salva e continua" e "Prepara la pratica a 14,90". Misurato nel browser: bianco su #0a9d5c, contrasto 3,51 a 1, corpo fra 13,5 e 16,5 punti.

**Cosa dovrebbe succedere:** 4,5 a 1 per un testo di quella dimensione. Si arriva li' usando il verde scuro gia' in palette (--color-verde-scuro #067a46) come fondo del bottone invece del verde chiaro.

**Cosa succede:** 3,51 a 1 su tutti i bottoni principali del sito. Non e' illeggibile, ma e' sotto il minimo, e riguarda esattamente il comando che deve farsi premere.

## 45. 🟢 L'inventario: cosa sa fare l'app, cosa sa fare la web app, e dove la web app è indietro

**Dove:** `components/app/AppRivolio.tsx:1`

**Come ci si arriva:** NON È UN DIFETTO: è la fotografia chiesta al punto 1, messa qui perché la sonda torna solo elenchi.

L'APP (cartella mobile/: 13 schermate, 16 componenti, ~10.600 righe).
- Ingresso: benvenuto cinematico una volta sola; accesso con password E con codice a sei cifre via email.
- Cinque linguette: Home (compare con la prima pratica), Check, Pratiche, Classifica (la accende il server), Account.
- Check: tre modi (foto della carta d'imbarco letta dall'OCR, tratta + giorno con l'elenco dei voli, numero del volo), la scena d'analisi a sei passi, il muro del check a pagamento, le domande sui casi che gli archivi non vedono (cancellato, negato imbarco, coincidenza persa), "di che compagnia era l'aereo" per il codeshare, e due schermate d'errore dedicate (volo non trovato, senza rete).
- Verdetto: schermata sua a tre esiti, con la cinematica.
- Voli salvati sul telefono, con "Ricontrolla".
- Notifiche: schermata-cuscinetto dei permessi, voli seguiti, avviso il giorno dopo la partenza.
- Pratiche: aperte sopra e chiuse sotto, il prossimo passo guidato dallo stato, si tira giù per aggiornare, e lo stato vuoto è distinto dallo stato d'errore.
- Pratica: i quattro fogli (reclamo, sollecito o replica, segnalazione all'ente, conciliazione), ogni foglio a schermo pieno con Copia e apertura dell'email, "la compagnia ti ha risposto no?" a scelta chiusa con otto motivi, gli esiti finali.
- Account: avatar, portafoglio (richiesti, recuperati, rimborsate), invito agli amici, Sicurezza e dati (cambia password, chiedi la copia dei dati, elimina l'account per sempre), modifica profilo (nome pubblico + classifica), notifiche, privacy, condizioni, scrivici, apri il sito, esci.

LA WEB APP (app/app/ + components/app/: in tutto TRE file vivi, 370 + 340 righe).
- Tre linguette: Controlla (che è la stessa scheda del check della landing, non una cosa sua), Le tue pratiche (elenco, stato vuoto, stato d'errore), Profilo (email, nome pubblico, spunta della classifica, tre link a privacy/condizioni/scrivici).
- Fuori dal guscio, con un'altra grafica: /pratica/[id] (cronologia, garanzia, scadenza, "ho inviato il reclamo", "la compagnia ha detto no", carica il documento) e /pratica/[id]/lettera (i fogli).
- Nella testata: Esci.

DOVE LA WEB APP È INDIETRO, in ordine di quanto pesa:
1. Non c'è la Home: nessun "richiesti", "recuperati", "check fatti", nessun "da fare oggi".
2. Non c'è la Classifica: sul web non esiste NESSUNA pagina, solo la rotta /api/classifica.
3. Non c'è il portafoglio.
4. Non ci sono i voli salvati né il "Ricontrolla".
5. Non ci sono avvisi/notifiche di alcun tipo.
6. Non c'è Sicurezza e dati: dal web non si cambia la password, non si chiede la copia dei dati e NON SI ELIMINA L'ACCOUNT (l'app lo fa davvero, con /api/account/elimina).
7. Non c'è l'invito agli amici.
8. Le pratiche non sono divise fra aperte e chiuse e non si aggiornano tirando giù.
9. Il check porta fuori dal guscio e non si rientra (difetto a parte, sotto).
10. La linguetta scelta non finisce nell'indirizzo: ricaricando si torna sempre su Controlla, e il proprio Profilo non ha un link.
UNA COSA CE L'HA IN PIÙ: il caricamento del documento dentro la pratica, che nell'app non esiste.

DA SAPERE PRIMA DI RIFARLA (codice morto, non è un difetto per chi usa il sito): app/app/azioni.ts porta ancora salvaPartenza, creaRicerca, cambiaStato ed eliminaRicerca del vecchio prodotto viaggi, e components/app/BaseDiPartenza.tsx, NuovaRicerca.tsx e SchedaRicerca.tsx non li importa nessuno. Ho controllato che non siano raggiungibili: il manifesto delle azioni di /app ne registra cinque e nessuna delle quattro vecchie. Nell'app la stessa cosa: in mobile/src/lib/testi.ts i blocchi onboarding, destinazioni, ricerche e profilo (circa 250 righe, con dentro "Le prime 3 sono gratis" e i "Crediti") non li legge nessuna schermata.

**Cosa dovrebbe succedere:** —

**Cosa succede:** —
