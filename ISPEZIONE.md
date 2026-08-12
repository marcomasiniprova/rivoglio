# ISPEZIONE — 12 agosto 2026

Il giro fatto prima del collaudo di Valerio: **sette sonde in parallelo su
tutto il prodotto**, ognuna con una lente diversa (il percorso che porta ai
soldi, il motore del verdetto, ogni parola che vede l'utente, il
retrobottega, il telefono, chi può vedere cosa, l'app contro la web app).

Ogni difetto è poi passato sotto **tre scettici indipendenti**, il cui
compito era dimostrare che NON fosse vero: passa solo quello che sopravvive
a due voti su tre. Serve a non mandare a rifare cose che funzionano.

**137 agenti · 18,2 milioni di token · 2 ore e 56 minuti.**
43 segnalazioni, **34 confermate**, 9 smontate dagli scettici.

⚠️ Questo file è il verbale, non la lista delle cose fatte. Quello che si
chiude finisce in STATO.md col suo commit.

---

# LA SINTESI

# RAPPORTO DI TRIAGE PRIMA DEL COLLAUDO

## 1. I difetti in ordine di quanto rovinano il collaudo

Non è l'ordine della gravità tecnica: è l'ordine con cui Valerio ci sbatte contro, col telefono in mano.

### Gruppo A: lo blocca fisicamente, sul percorso principale
1. **Il campo "città o aeroporto" fa ingrandire la pagina all'iPhone** (verdetto, coincidenza persa). È l'unico difetto che rompe il gesto: da quel tocco in poi tutta la pagina resta storta e va rimessa a posto pizzicando lo schermo. Succede sulla schermata in cui si decide se pagare.
2. **Stesso ingrandimento sul campo "di che compagnia era l'aereo"**. Stessa causa, percorso meno frequente.

### Gruppo B: gli fa vedere un numero sbagliato sulla cosa che vendiamo
3. **Negato imbarco e coincidenza persa danno il sì anche fuori dall'Europa.** Il verdetto rosso è corretto, poi due domande sotto lo stesso volo diventa "idoneo, 250€". Se Valerio prova un volo americano si vede il prodotto contraddire sé stesso in dieci secondi.
4. **Volo cancellato dentro l'Unione ma lunghissimo: 600€ dove la legge ne dà 400.** Stesso volo in ritardo dice 400, cancellato dice 600.
5. **Stesso errore di importo su negato imbarco e coincidenza persa** (compresi i 300€ della riduzione, calcolati sulla fascia sbagliata).
6. **Diciamo che i 1,99 dell'analisi si scalano dalla pratica, e non li scala nessuno.** Se accende il muro per provarlo, paga 16,89 dopo aver letto tre volte "il totale non cambia". È l'unico difetto che gli fa uscire soldi veri dalla tasca durante la prova.

### Gruppo C: gli distrugge la fiducia nel cruscotto, che è lo strumento con cui deciderà tutto
7. **L'imbuto dice che perde il 100% delle persone su un muro spento**, e poi si riallarga dopo lo zero: una forma impossibile, sul riquadro che dovrebbe dirgli dove si perdono i soldi.
8. **Le passate di collaudo contano come vendite dentro l'imbuto**, mentre la percentuale scritta due centimetri sotto le esclude: due numeri in disaccordo sulla stessa scheda. Questo lo vede proprio perché sta facendo il collaudo.
9. **"Incassato in tutto" e i numeri di Panoramica e Traffico si accorciano da soli** quando le righe superano il tetto del database, senza dirlo. Oggi non si vede, il giorno del primo video sì.
10. **La coda dei verdetti si ferma a 30 ma è scritta come se fosse tutta**, e la Panoramica dice un altro numero nella stessa sessione. È la coda che blocca gli incassi.
11. **Il riquadro "A che punto sono" delle pratiche conta solo le ultime 60** accanto a un totale vero.
12. **La percentuale delle analisi di oggi è sempre in rosso la mattina**, perché confronta due ore di traffico con giornate intere.

### Gruppo D: legge una promessa che il prodotto non mantiene
13. **Il sito si contraddice sul tempo per chiedere: 5-6 anni in home, sei mesi nel blog.** E la versione della home finisce dentro la pratica pagata.
14. **Le email della pratica dicono 15, 30 e "due mesi"** quando i giorni veri sono 42, 56 e 90.
15. **L'email dell'ottava settimana manda tutti all'ENAC**, anche chi è partito da Barcellona, mentre la lettera della stessa pratica dice "non l'ENAC".
16. **Lo stato della pratica scrive "ENAC" a tutti**, su sito e app.
17. **La FAQ della home promette "al giorno 30"** quello che arriva al 42 e al 56.
18. **Privacy e Condizioni nominano Polar**, che oggi non incassa niente per noi; Rimborsi non nomina nessuno.
19. **Il pannello Profilo della web app promette avvisi e classifica che da web non esistono.**
20. **La linguetta "Profilo" della web app è tagliata su ogni iPhone fino al 14/15.**
21. **La lavagna delle 34 schermate mostra l'app di quattro commit fa**, senza il muro del check: era stata costruita apposta per non invecchiare.

### Gruppo E: non li vede durante il collaudo, ma non devono restare accesi quando arriva il primo estraneo
22. **Col portone del collaudo aperto chiunque crea account confermati con l'email di altri**, a ripetizione, senza limiti.
23. **La ricevuta dell'analisi, copiata prima di usarla, apre per trenta giorni la lettura delle carte d'imbarco e gli orari veri di atterraggio** (e l'OCR lo paghiamo a chiamata).
24. **L'identificativo di una verifica qualsiasi apre le tre rotte laterali su qualunque volo**, all'infinito.
25. **Il ritorno dopo il login accetta la barra rovesciata** e si può fabbricare un link che comincia col nostro dominio e finisce su un sito estraneo.

### Gruppo F: rifiniture che si notano solo guardando bene
26. Le etichette del biglietto (VOLO, DATA, TRATTA, ARRIVO EFFETTIVO) sono grigio chiarissimo: alla luce del sole spariscono, e sono la prova che vendiamo.
27. Bersagli da toccare troppo piccoli: "Come nasce questa cifra" sul verdetto, "Come nasce il 1.000 euro" nei prezzi, e la riga delle pagine legali in fondo.
28. Il bianco sui bottoni verdi è sotto il minimo di contrasto.
29. Il pallino verde "in diretta" pulsa anche dove la pagina è ferma da ore.
30. Il messaggio di errore della cassa di prova esce nero invece che rosso.

---

## 2. Le famiglie: cosa si chiude in un colpo solo

**Famiglia 1: il cancello territoriale e l'art. 7 lettera b) fuori dal motore principale** (difetti 3, 4, 5).
Tutti e tre nascono dalla stessa cosa: `eu261.ts` ha i due controlli giusti, `dichiarati.ts` e `cancellato.ts` no. Si chiudono chiamando l'ambito e la fascia dal punto unico. Una correzione, tre falsi positivi in meno.

**Famiglia 2: i giorni della pratica scritti a mano** (14, 17, e in parte 15).
Gli stessi numeri stanno in tre posti diversi: le costanti vere, le email, i testi. Si legano tutti alle costanti, come è già stato fatto per il sito nel giro #51, e si aggiunge la prova che cerca anche "giorno 30", non solo "giorno 15".

**Famiglia 3: l'ente nazionale che non segue il paese di partenza** (15, 16).
Email, stato della pratica, cronologia e testi dell'app dicono ENAC; la tabella dei 29 paesi esiste già ed è quella che usa la lettera. O si passa il paese anche a quei testi, o si scrive "l'ente del tuo paese di partenza".

**Famiglia 4: i numeri del pannello letti male** (7, 8, 9, 10, 11, 12).
Sono tutte varianti della stessa cosa: si mostra come totale quello che è solo la prima pagina di righe, e non si distingue mai la prova dal reale. Si chiude decidendo una volta per tutte che i conteggi li fa il database (non il codice sommando righe), che le righe di collaudo si escludono ovunque e non solo in un punto, e che quando la lettura è tagliata si scrive "non letto".

**Famiglia 5: i campi che fanno ingrandire l'iPhone** (1, 2).
Stessa causa (carattere sotto i 16 punti), due file, cinque minuti.

**Famiglia 6: bersagli piccoli e contrasti bassi** (26, 27, 28).
La classe `tocco-comodo` esiste già nel progetto e il verde scuro è già in palette: è applicare cose che ci sono.

**Famiglia 7: `text-errore` non esiste** (30, più i due punti già noti dall'11/08).
Un token di colore mancante in `globals.css`. Un rigo.

**Famiglia 8: le porte che si fidano del cookie invece che del database** (23, 24).
Il registro che impedisce il riuso lo consulta solo `/api/verifica`. Le altre rotte devono chiedere allo stesso registro.

**Famiglia 9: le tre pagine legali che raccontano tre versioni del pagamento** (18).
Da chiudere tutte insieme il giorno in cui il venditore è deciso, non prima e non a pezzi.

---

## 3. LA DOMANDA DEL CRITICO: cosa nessuna delle sette sonde ha guardato

Le sonde hanno coperto motore, testi, pannello, telefono, sicurezza, percorso soldi e app. Questi buchi restano aperti, e sono tutti cose che possono rompersi mentre Valerio prova.

1. **Le email vere, ricevute in una casella vera.** È stato letto il codice che le scrive, non l'email arrivata: impaginazione su Gmail e su Outlook, mittente mostrato, immagini bloccate, link di disdetta che funziona, la parola "spam". E Resend oggi spedisce solo a valerio@artecai.it: un secondo indirizzo non riceve niente e sembrerà un guasto.
2. **Il pagamento vero, da capo a fondo.** Nessuno ha percorso il venditore reale: firma del webhook, pratica che nasce dopo l'incasso, ricevuta, ritorno sul sito. Tutto quello che sappiamo viene dalla cassa finta.
3. **Il fornitore dei dati di volo sotto sforzo.** Le prove girano sui voli dimostrativi ZZ. Nessuno ha visto cosa succede con la chiave vera su un volo di ieri, con la quota superata, con la risposta lenta e i 10 secondi di tetto delle funzioni Netlify. E se la chiave manca, il fornitore dimostrativo si accende da solo: nessuno ha controllato che in quel caso il bollo "demo" si veda davvero in produzione.
4. **Registrazione, accesso, uscita e recupero password.** Il percorso completo dell'account non è stato provato da nessuna sonda; nemmeno l'eliminazione dell'account e la richiesta dei dati, costruite nel giro #49 e mai viste funzionare.
5. **I lavori automatici notturni.** Il controllo giornaliero delle pratiche, gli avvisi push, gli scioperi, l'Osservatorio: nessuno li ha fatti girare. Sono anche il posto dove le email sbagliate partono da sole.
6. **L'app vera su un telefono vero.** È stato guardato solo l'export web, che per giunta è vecchio. Comportamento su iOS e Android, permessi, notifiche: mai visti.
7. **Metà del sito.** Le sonde hanno guardato home, verdetto, pratica, pannello. Non sono stati riguardati in questo giro: il Tabellone e i dieci articoli, le pagine sciopero, le otto pagine aeroporto, la guida bagagli, il giudice di pace, l'iscrizione all'Osservatorio col doppio opt-in, la pagina di benvenuto.
8. **Il comportamento quando qualcosa non va.** Rete che cade a metà analisi, database irraggiungibile, doppio tocco sul bottone d'acquisto (doppio addebito), ricarica della pagina del verdetto, tasto indietro dopo il pagamento. Nessuna sonda ha rotto niente apposta.
9. **Safari vero.** Le misure sono state prese in un browser ristretto sul computer, non su un iPhone: lo scroll pesante costruito nel giro #52 è esattamente il genere di cosa che si comporta diversamente su Safari, col trackpad e con un mouse a scatti.
10. **Accessibilità oltre il contrasto.** Tastiera, lettori di schermo, testo ingrandito dalle impostazioni di iOS, e la modalità "meno animazioni".
11. **Fusi orari e cambio giorno.** Scriviamo "orari in ora italiana": nessuno ha controllato un volo partito da New York a cavallo di mezzanotte.
12. **L'utente che sbaglia a scrivere.** "FR 4001" con lo spazio, l'email con la maiuscola, la data di ieri, il volo di due anni fa.
13. **Velocità e peso.** Quanto ci mette la home ad aprirsi in 4G, e quanto regge la lavagna con trentatré app accese.
14. **L'anteprima del link.** Cosa si vede quando Valerio incolla rivolio.it su WhatsApp, TikTok o Instagram: è la prima immagine che vedrà il suo pubblico.
15. **Come si pulisce dopo.** Le pratiche e gli account creati durante il collaudo restano nel database e nei numeri del pannello: non esiste oggi un modo dichiarato per toglierli.

---

## 4. IL PERCORSO DI COLLAUDO

Da fare col telefono in mano, in quest'ordine. Ogni passo dice cosa deve succedere. Dove è scritto "già noto" vuol dire che il difetto è nella lista qui sopra: non serve che lo cerchi, serve che lo riconosca.

### Prima di cominciare (dal computer, cinque minuti)
- **P1.** Decidi lo stato del muro del check e scrivilo su un foglio. Il primo giro fallo com'è oggi: muro spento.
- **P2.** Controlla che `COLLAUDO_APERTO` sia acceso solo per la durata della prova, e segnati di spegnerlo alla fine (passo F3).
- **P3.** Prendi la chiave della cassa di prova aprendo una volta l'indirizzo `/api/check/prova/chiave?s=...`. Da lì in poi quel browser è il tuo.
- **P4.** Tieni pronti: un volo vero recente arrivato in ritardo, la tua email, e Telegram aperto sul telefono.

### Parte 1: la prima impressione (telefono)
1. **Home.** Deve aprirsi in meno di tre secondi, senza scorrimento laterale, col titolo e il campo del check subito visibili. La mano col telefono deve entrare in scena, non comparire di colpo.
2. **Scorri tutta la home fino in fondo.** Devono esserci, in quest'ordine sensato: come funziona, copertura, garanzia, i numeri, prezzi, chi fa cosa, domande, firma grande in fondo. Nessuna sezione vuota, nessuna immagine rotta.
3. **Apri "Perché 12 mesi" e poi la domanda "Fino a quando posso fare richiesta".** Già noto: qui leggerai 5-6 anni, e nel blog leggerai sei mesi. Segnatelo.
4. **Apri "E se la compagnia dice che era maltempo o sciopero".** Già noto: dice "al giorno 30", ma i giorni veri sono 42 e 56.
5. **Tocca "Come nasce il 1.000 euro"** nella scheda prezzi. Deve aprirsi il conto. Già noto: il bersaglio è piccolissimo, potresti doverlo centrare due volte.

### Parte 2: il check e i tre verdetti
6. **Fai il check di un volo VERO tuo, per numero.** Deve partire la scena dell'analisi, durare il tempo giusto senza tagliarsi, e finire su un verdetto. Guarda che gli orari siano quelli veri e che non compaia la parola "demo".
7. **Check di ZZ250** (volo dimostrativo). Deve uscire idoneo, 250€, col biglietto compilato.
8. **Tocca "Come nasce questa cifra".** Deve aprirsi il conto: distanza, ritardo, fascia. Già noto: bersaglio da 20 punti, e le etichette del biglietto sono quasi invisibili alla luce.
9. **Check di ZZ180.** Deve uscire non idoneo per un minuto (2h59): è la prova che non promettiamo mai più del dovuto.
10. **Check di ZZ777.** Deve uscire incerto perché cancellato, con le due domande. Rispondi "nessun avviso" e "nessun volo alternativo": deve chiudersi con un importo.
11. **Check di ZZ404.** Deve uscire incerto e dire perché, senza far sentire l'utente in errore.
12. **Sotto un verdetto non idoneo, apri "Ti hanno lasciato a terra o hai perso una coincidenza".** Prova "coincidenza persa" e tocca il campo della città. Già noto: qui l'iPhone ingrandisce la pagina e non torna indietro. È il difetto che si vede di più.
13. **Prova un volo fuori dall'Europa** (per esempio New York verso Toronto) e ripeti il passo 12. Già noto: deve restare non idoneo e invece esce un sì. È il falso positivo più grave della lista.

### Parte 3: dai soldi alla lettera
14. **Sul verdetto idoneo, scrivi la tua email e salva.** Deve confermare e non farti ripetere il volo.
15. **Premi il bottone d'acquisto.** Con la cassa di prova devi arrivare a una cassa che dichiara "modalità di prova" sopra il totale, senza nessun campo per la carta.
16. **Completa e torna.** Deve nascere una pratica e devi arrivarci senza cercare l'indirizzo a mano.
17. **Apri la pratica.** Devono esserci lo stato, la cronologia e il prossimo passo scritto in italiano. Già noto: se il volo non parte dall'Italia leggerai comunque "ENAC".
18. **Apri la lettera.** Devono comparire i fogli previsti, il bottone per copiare e quello per aprire l'email già compilata. Prova davvero a copiarla e incollala da qualche parte: il testo deve essere completo, senza segnaposto.
19. **Premi "La compagnia ti ha risposto no" e scegli un motivo.** Deve comparire la replica giusta per quel motivo, non un testo generico.
20. **Cerca la conciliazione.** Deve essere nominata come strada gratuita, con il termine di un anno.

### Parte 4: account e web app
21. **Esci e rientra con la tua email.** Il codice a sei cifre o il link devono arrivare e funzionare.
22. **Apri /app.** Devono esserci tre sezioni. Già noto: la terza è tagliata sull'iPhone.
23. **Apri il Profilo senza account.** Già noto: promette avvisi e classifica che da web non esistono.
24. **Prova "elimina il mio account"** su un account di prova, non sul tuo principale. Deve chiedere conferma scritta e deve funzionare davvero.

### Parte 5: il resto del sito
25. **Tabellone**, elenco e un articolo: le copertine devono esserci tutte, il check dentro l'articolo deve funzionare, il marchio deve riportare indietro.
26. **/sciopero-aerei** e **/aeroporto/FCO**: devono dire com'è messa oggi senza inventare certezze.
27. **Iscriviti all'Osservatorio con la tua email**, apri l'email di conferma, clicca, poi prova la disdetta. Tutti e tre i passi devono chiudersi con una pagina che dice cosa è successo.
28. **/privacy, /condizioni, /cookie, /rimborsi.** Già noto: due nominano Polar, una no; e il titolare del trattamento ha ancora un segnaposto.
29. **/anteprima-app.** Già noto: quello che vedi è l'app dell'11 agosto, non quella di adesso.

### Parte 6: il retrobottega (meglio da computer)
30. **/admin, Panoramica.** Già noto: l'imbuto ti dirà che perdi il 100% su un muro spento, e la mattina la percentuale sarà in rosso comunque. Non sono i tuoi numeri che vanno male, è il riquadro che conta male.
31. **/admin/verdetti.** Confronta il numero della Panoramica col bollo "in coda". Già noto: sopra i 30 non combaciano.
32. **/admin/pratiche.** Confronta "Pratiche in tutto" con la somma dei bollini. Già noto: i bollini contano solo le ultime 60.
33. **/admin/traffico e /admin/registro.** Il registro deve mostrare fatti con l'ora, mai indirizzi IP né nomi di persone.
34. **/admin/impostazioni.** Ogni variabile deve dire a cosa serve e cosa succede se manca, senza mostrare nessun valore.
35. **Telegram.** Fai un pagamento di prova e controlla che il telefono squilli; poi verifica che non squilli a ogni analisi.

### Chiusura
- **F1.** Scrivi cosa hai visto, schermata per schermata, mentre è fresco.
- **F2.** Segna le pratiche e gli account creati durante la prova: vanno tolti prima che entrino nei numeri veri.
- **F3.** **Spegni `COLLAUDO_APERTO`.** Finché resta acceso, chiunque conosca il sito può creare account con l'email di altri.

---

# I DIFETTI, UNO PER UNO


## 1. 🔴 Chi dichiara "mi hanno lasciato a terra" riceve un sì anche su un volo che l'Europa non copre

**Dove:** `lib/regole/dichiarati.ts:99` · confermato da 3 scettici su 3 · sonda: motore

**Come ci si arriva:** 1) Fai il check di un volo che parte e arriva fuori dall'Europa, per esempio New York (JFK) verso Toronto (YYZ) con Air Canada. 2) Il verdetto esce giustamente rosso: "Questo volo parte e arriva fuori dall'Unione Europea, quindi il Regolamento CE 261/2004 non si applica". 3) Sotto quel verdetto la pagina mostra sempre l'invito "Ti hanno lasciato a terra o hai perso una coincidenza?" (components/verifica/Risultato.tsx, il blocco DichiaraCaso dentro NonIdoneo, riga 776 circa). 4) Apri "Mi hanno lasciato a terra", scegli "Sì, ero in orario al gate" e "Mi hanno lasciato a terra contro la mia volontà (overbooking o simili)", premi "Scopri il verdetto".
Verificato eseguendo il motore con questo fatto: partenzaIata JFK / partenzaPaese US, arrivoIata YYZ / arrivoPaese CA, stato "atterrato", kmOrtodromica 588, orarioVerificato true, vettoreOperativo "AC". Stessa cosa con "Ho perso una coincidenza" (unica prenotazione, più di 4 ore, destinazione finale Vancouver YVR): esce 600€ su 3.930 km.
La causa: il cancello territoriale (ambitoCE261) è chiamato solo dentro lib/regole/eu261.ts, riga 164. valutaNegato e valutaCoincidenza non lo chiamano mai, e /api/verifica/dichiara passa loro il fatto senza controllare l'ambito.

**Cosa dovrebbe succedere:** Nessuna compensazione europea: su una tratta paese terzo verso paese terzo il Regolamento non si applica, quindi il caso deve restare "non idoneo", esattamente come il check di partenza.

**Cosa succede:** Verdetto "idoneo", 250€ per il negato imbarco e 600€ per la coincidenza persa, salvati sulla riga della verifica come esito vendibile. È lo stesso falso positivo del New York verso Toronto chiuso a suo tempo nel motore del ritardo, rimasto aperto sulla porta accanto.


## 2. 🔴 Volo cancellato dentro l'Europa ma lunghissimo: promette 600 euro dove la legge ne dà 400

**Dove:** `lib/regole/cancellato.ts:102` · confermato da 3 scettici su 3 · sonda: motore

**Come ci si arriva:** 1) Fai il check di un volo cancellato che parte e arriva dentro l'Unione ma è lungo più di 3.500 km: Parigi (CDG) verso Saint-Denis della Riunione (RUN) con Air France, 9.370 km secondo il nostro stesso archivio. 2) Il verdetto esce incerto con la frase "Questo volo risulta cancellato" e compaiono le due domande. 3) Rispondi "Nessun avviso" e "Nessun volo alternativo".
Verificato eseguendo valutaCancellato con: stato "cancellato", partenzaIata CDG / partenzaPaese FR, arrivoIata RUN / arrivoPaese RE, kmOrtodromica 9369.64, preavviso "nessuno", alternativa "nessuna".
La causa: la funzione fascia() guarda solo i chilometri (sopra 3.500 restituisce 600) e non conosce l'eccezione dell'art. 7 lettera b), quella già scritta e provata dentro lib/regole/eu261.ts alla riga 280 con il controllo intraUe. Sullo stesso identico volo, se invece è in ritardo, il motore dice correttamente 400€.

**Cosa dovrebbe succedere:** 400€. L'art. 7 lettera b) tiene a 400 tutte le tratte dentro l'Unione sopra i 1.500 km, per quanto lunghe siano: Parigi verso la Riunione è Francia con Francia.

**Cosa succede:** 600€. Al passeggero viene promessa la metà in più di quanto gli riconosce il Regolamento, e la differenza la scopre la compagnia quando risponde no.


## 3. 🔴 Lo stesso errore sull'importo anche su negato imbarco e coincidenza persa

**Dove:** `lib/regole/dichiarati.ts:70` · confermato da 3 scettici su 3 · sonda: motore

**Come ci si arriva:** 1) Fai il check dello stesso volo Parigi (CDG) verso Saint-Denis della Riunione (RUN), 9.370 km, tutto dentro l'Unione. 2) Sotto il verdetto apri "Mi hanno lasciato a terra", rispondi "Sì, ero in orario al gate" e "contro la mia volontà": esce 600€.
3) Stessa cosa per la coincidenza: check di un Milano (MXP) verso Parigi (CDG), poi "Ho perso una coincidenza", unica prenotazione, più di 4 ore, destinazione finale Saint-Denis della Riunione (RUN). Il viaggio intero misura 8.774 km, tutto dentro l'Unione: esce 600€.
Verificato eseguendo valutaNegato e valutaCoincidenza con quei valori. La causa è la stessa del punto precedente: la funzione fascia() alla riga 70 e la scaletta degli importi dentro valutaCoincidenza alla riga 187 non hanno il controllo intraUe che sta in lib/regole/eu261.ts riga 280.

**Cosa dovrebbe succedere:** 400€ in tutti e due i casi, per l'art. 7 lettera b).

**Cosa succede:** 600€. Nella coincidenza persa, se l'utente risponde "fra 3 e 4 ore", escono 300€: anche quello è sbagliato, perché la riduzione del 50 per cento si applica alla fascia da 600, e qui la fascia giusta è 400 piena.


## 4. 🔴 Le email della pratica dicono al cliente giorni che non sono quelli veri

**Dove:** `lib/email/pratiche.ts:189` · confermato da 3 scettici su 3 · sonda: testi

**Come ci si arriva:** 1. Apri una pratica e premi "Ho inviato il reclamo" (la data d'invio si scrive sulla pratica).
2. Aspetta che passino 42 giorni dall'invio (oppure sposta indietro di 42 giorni la data d'invio sul database) e lascia girare il controllo giornaliero delle pratiche (`/api/motore/segui`).
3. Guarda l'email che arriva: l'oggetto è "15 giorni di silenzio. Il sollecito è pronto.".
4. Ripeti a 56 giorni: arriva un'email con oggetto "30 giorni senza esito" e dentro c'è scritto "Sono passati 30 giorni dal tuo reclamo" (lib/email/pratiche.ts:221 e :227).
5. Ripeti a 90 giorni: l'email dice "Sono passati due mesi dall'invio del reclamo" (lib/email/pratiche.ts:263).

**Cosa dovrebbe succedere:** I giorni scritti nell'email devono essere quelli in cui l'email parte davvero, cioè 42 (sei settimane), 56 (otto settimane) e 90 (tre mesi). Sono i numeri decisi nel giro #45 e scritti nel codice come GIORNI_PRIMA_DEL_SOLLECITO = 42 e GIORNI_PRIMA_DELL_ENTE = 14 (lib/pratiche/rifiuto.ts:225 e :228), usati dal calendario in app/api/motore/segui/route.ts:99-105.

**Cosa succede:** Le tre email sono rimaste ai tempi di prima del 9/08: 15, 30 e due mesi. Il cliente riceve un'email che dice "sono passati 30 giorni" quando in realtà ne sono passati 56, e conta i giorni sbagliati per capire a che punto è. È la stessa bugia che il giro #51 aveva già tolto dal sito, ma nelle email non è mai stata corretta.


## 5. 🔴 L'email dell'ottava settimana manda tutti all'ENAC, anche chi non è partito dall'Italia

**Dove:** `lib/email/pratiche.ts:214` · confermato da 3 scettici su 3 · sonda: testi

**Come ci si arriva:** 1. Fai una pratica su un volo partito da un aeroporto non italiano, per esempio Barcellona verso Roma.
2. Segna il reclamo come inviato e lascia passare 56 giorni.
3. Leggi l'email che arriva: dice "Il passo successivo è il reclamo all'ENAC" e manda a enac.gov.it.
4. Poi apri la pagina della lettera dentro la stessa pratica: lì il foglio di segnalazione nomina l'ente spagnolo, non l'ENAC.

**Cosa dovrebbe succedere:** L'email deve nominare lo stesso ente della lettera, cioè quello del paese da cui il volo è partito (art. 16 par. 1 del Regolamento). La tabella dei 29 paesi esiste già in lib/lettera/neb.ts ed è quella che usa la lettera.

**Cosa succede:** La funzione che scrive l'email riceve solo numero di volo, data e link: il paese non le arriva mai, quindi scrive ENAC per tutti. Chi parte da Barcellona viene mandato all'ufficio sbagliato e perde settimane. È esattamente l'errore che il giro #38 aveva chiuso nella lettera e che nell'email è rimasto. Lo stesso vale per il testo dello stato della pratica, che dice "Presenta il reclamo ENAC" (lib/copy.ts:1085).


## 6. 🔴 Il sito si contraddice su quanto tempo hai per chiedere: da una parte 5-6 anni, dall'altra sei mesi

**Dove:** `lib/copy.ts:474` · confermato da 3 scettici su 3 · sonda: testi

**Come ci si arriva:** 1. Apri la home e premi "Perché 12 mesi" sotto il titolo: leggi "2 anni per ITA e Aeroitalia, stimati 5 o 6 per le compagnie estere" (lib/copy.ts:190).
2. Scendi alla sezione "Vale anche per i voli dell'anno scorso": le due schede dicono "2 anni" e "5-6 anni" (lib/copy.ts:474-490).
3. Apri la domanda "Fino a quando posso fare richiesta?" nelle FAQ: stessa cosa (lib/copy.ts:577).
4. Adesso apri l'articolo del Tabellone /tabellone/quanto-tempo-hai-per-chiedere-il-rimborso: in apertura dice "il numero da tenere in testa è il più severo: sei mesi", la tabella dà sei mesi o un anno, e una domanda in fondo si intitola proprio "Ho letto che ci sono due anni di tempo. È falso?" rispondendo che quei due anni non sono il tempo per chiedere i soldi.

**Cosa dovrebbe succedere:** Una risposta sola su tutto il sito. O si dice sei mesi/un anno dappertutto (con la sfumatura del caso), o si spiega in tutti e due i posti perché i numeri sono diversi. Un utente non può leggere "hai 5-6 anni" in home e "muoviti entro sei mesi" nel blog dello stesso sito.

**Cosa succede:** Le due versioni convivono, e quella della home è anche quella che il motore mette dentro la pratica pagata: scadenzaStimata in lib/regole/eu261.ts:304-320 dà 2 anni ai vettori italiani e 5 a tutti gli altri, e il risultato finisce sotto la scritta "Secondo la nostra stima, fino al ...". Quindi a chi paga per un volo Ryanair di undici mesi fa diciamo che ha tempo fino a fra quattro anni, mentre il nostro stesso articolo dice che con ogni probabilità è già tardi. È una promessa che la compagnia può smontare con una riga, e a quel punto scatta la garanzia e il rimborso lo paghiamo noi.


## 7. 🔴 Promettiamo che i soldi dell'analisi si scalano dalla pratica, ma nessuno li scala

**Dove:** `lib/check/ingresso.ts:132` · confermato da 3 scettici su 3 · sonda: testi

**Come ci si arriva:** 1. Accendi il muro del check mettendo NEXT_PUBLIC_CHECK_PREZZO_ATTIVO=1 (è l'interruttore previsto per il lancio).
2. Apri la home: sotto la scheda dell'analisi c'è scritto "E se poi apri la pratica, questi euro si scalano dal prezzo: il totale non cambia" (lib/copy.ts:384). Lo stesso è scritto sul muro del check (components/rivolio/MuroCheck.tsx:130) e nella scheda dell'app ospite (lib/copy.ts:80).
3. Fai un check, paga 1,99 e ottieni un verdetto idoneo.
4. Guarda il bottone d'acquisto sulla pagina del verdetto: dice "Prepara la pratica a 14,90€".
5. Premilo: la rotta di pagamento manda al link del prodotto pieno da 14,90 (app/api/pratiche/checkout/route.ts, lib/polar.ts:24-42).

**Cosa dovrebbe succedere:** Chi ha già pagato 1,99 deve trovare la pratica a 12,91 (o comunque un totale di 14,90), come promesso in almeno quattro punti del sito e come prevede la funzione scontoDaCheck.

**Cosa succede:** La funzione che calcola lo sconto (scontoDaCheck, lib/check/ingresso.ts:132) non è chiamata da nessuna parte del prodotto: cercandola nel repository compare solo dentro le prove. Il verdetto mostra sempre il prezzo pieno del listino e il pagamento punta sempre al prodotto pieno. Il cliente paga 1,99 + 14,90 = 16,89 dopo che gli abbiamo scritto tre volte che il totale non cambia.


## 8. 🔴 L'imbuto accusa il muro del pagamento di far perdere tutti, ma il muro oggi è spento

**Dove:** `app/admin/page.tsx:68` · confermato da 3 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Su Netlify NEXT_PUBLIC_CHECK_PREZZO_ATTIVO non c'è (è lo stato di oggi: il muro nasce spento, lo dice lib/check/ingresso.ts riga 44). 2. Fai qualche analisi dal sito e clicca almeno una volta il bottone che porta al pagamento della pratica. 3. Apri /admin e guarda il riquadro "Dove si ferma la gente".

**Cosa dovrebbe succedere:** Quando il muro è spento, i due passi "Vedono il muro" e "Pagano l'analisi" non esistono e non vanno disegnati (o vanno marcati "non applicabile"). L'imbuto deve mostrare solo passi che possono succedere davvero.

**Cosa succede:** L'imbuto mostra "Vedono il muro: 0" con accanto la perdita scritta "meno 100%", e sotto "Pagano l'analisi: 0". Poi il passo successivo, "Aprono la pratica", torna a un numero maggiore di zero. Il riquadro dice testualmente "Dove il numero crolla, è lì che perdi", quindi Valerio legge che perde il 100% delle persone su un muro che non ha mai acceso, e legge un imbuto che si riallarga dopo lo zero, cioè una forma impossibile. È il numero su cui si decide se il check a pagamento funziona.


## 9. 🔴 Le passate di collaudo contano come conversioni dentro l'imbuto, mentre la percentuale scritta due centimetri sotto le esclude

**Dove:** `lib/eventi/lettura.ts:202` · confermato da 3 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Con CASSA_PROVA_SEGRETO (o COLLAUDO_APERTO=1) attivi, percorri il prodotto cinque volte usando la cassa finta: ogni volta si registra un fatto "analisi pagata" marcato come prova (app/api/check/prova/route.ts riga 61). 2. Apri anche due volte la pratica dimostrativa (app/api/pratiche/prova/route.ts riga 137). 3. Apri /admin e guarda il riquadro "Dove si ferma la gente" e la riga di testo sotto di esso.

**Cosa dovrebbe succedere:** Le righe di collaudo restano nel registro ma stanno fuori da tutti i numeri che servono a decidere, come già fa la percentuale di conversione. I due numeri devono raccontare la stessa cosa.

**Cosa succede:** L'imbuto conta le prove come conversioni vere: mostra "Pagano l'analisi: 5" e "Aprono la pratica: 2". La riga subito sotto, che invece le filtra, dice "Di chi vede il muro, paga lo 0%". Due numeri in disaccordo sulla stessa scheda. Il filtro delle prove (righe 195-198) è applicato solo alla percentuale, mai ai conteggi che alimentano l'imbuto. In più, con "Aprono la pratica: 2" e "Pagano la pratica: 0" l'imbuto segnala una fuga del 100% alla cassa che non è mai avvenuta.


## 10. 🔴 Sul verdetto, il campo "dove dovevi arrivare" fa ingrandire la pagina all'iPhone

**Dove:** `components/verifica/DichiaraCaso.tsx:137` · confermato da 3 scettici su 3 · sonda: telefono

**Come ci si arriva:** 1. Da iPhone apri una pagina di verdetto, per esempio /verifica/demo-ZZ180-2026-08-07. 2. Scorri in fondo, fino a "Ti hanno lasciato a terra o hai perso una coincidenza?". 3. Tocca "Ho perso una coincidenza". 4. Tocca il campo con scritto "Citta o aeroporto". Misurato nel browser a 320 e a 390 punti: il carattere del campo e' 15px.

**Cosa dovrebbe succedere:** Il carattere del campo e' almeno 16px, come in tutti gli altri campi del sito (la scheda del check li ha gia' a 16, e la barra del pannello scrive text-[16px] con sm:text-[13.5px] proprio per questo). La pagina resta ferma.

**Cosa succede:** Il campo e' scritto a 15px. Sotto i 16px iOS ingrandisce da solo la pagina appena tocchi il campo, e non torna piu' indietro: da li' in poi il verdetto, i bottoni e il prezzo si guardano storti e serve pizzicare lo schermo per rimettere a posto. Succede a ogni larghezza, perche' quel 15px non ha nessuna eccezione per il telefono.


## 11. 🔴 Con il portone del collaudo aperto, un estraneo può far nascere account Rivolio con l'email di chiunque

**Dove:** `app/api/pratiche/prova/route.ts:46` · confermato da 3 scettici su 3 · sonda: sicurezza

**Come ci si arriva:** Serve COLLAUDO_APERTO=1 su Netlify (è la riga accesa il 12/08). Da un browser qualsiasi, senza account e senza cookie: 1) fai il check del volo dimostrativo ZZ250 con una data qualsiasi (i voli che iniziano per ZZ vanno SEMPRE al fornitore dimostrativo, anche in produzione con la chiave vera: lib/voli/verifica.ts:140) e ottieni un identificativo di verifica con esito idoneo; 2) apri /verifica/<identificativo> e nel campo email scrivi l'indirizzo di un'altra persona: con il portone aperto quel campo salva davvero (components/verifica/Risultato.tsx:202) e /api/verifica/email non chiede a nessuno se quell'indirizzo è suo; 3) premi il bottone per aprire la pratica. Senza venditore configurato la rotta di checkout manda a /api/pratiche/prova (app/api/pratiche/checkout/route.ts:98), che con il portone aperto lascia passare chiunque perché inCollaudo torna vero per tutti (lib/check/cancello.ts:104). Da lì creaPratica chiama db.auth.admin.createUser({ email, email_confirm: true }) (lib/pratiche/pratiche.ts:111). Su questa rotta non c'è nessun tetto di richieste: si ripete a piacere con indirizzi diversi.

**Cosa dovrebbe succedere:** Il portone del collaudo dichiara cosa NON apre mai (il retrobottega, il bollo sui voli dimostrativi). Un estraneo non dovrebbe poter creare, senza autenticarsi, account già confermati intestati a email che non sono sue, né scrivere pratiche nel database dei clienti.

**Cosa succede:** Chiunque conosca il sito crea a ripetizione account Rivolio con email già confermata, intestati all'indirizzo che vuole, più le relative pratiche. La persona vera che poi prova a registrarsi si sente rispondere che con quella email esiste già un account.


## 12. 🟡 Una FAQ della home promette la replica e il reclamo all'ente al giorno 30

**Dove:** `lib/copy.ts:567` · confermato da 3 scettici su 3 · sonda: testi

**Come ci si arriva:** 1. Apri la home e scendi alla sezione Domande.
2. Apri "E se la compagnia dice che era maltempo o sciopero?".
3. Ultima riga: "al giorno 30 trovi contro-risposta e reclamo ENAC già pronti".

**Cosa dovrebbe succedere:** I giorni veri: la replica al no è disponibile subito se il no è già arrivato, altrimenti al giorno 42; la segnalazione all'ente al giorno 56. Sono le costanti in lib/pratiche/rifiuto.ts:225 e :228.

**Cosa succede:** La FAQ è rimasta al calendario vecchio e promette il giorno 30, cioè 26 giorni prima di quando quel materiale arriva davvero. Il giro #51 aveva ripulito i "giorno 15" e la prova che lo controlla (prove/quarto-colpo.spec.ts:264) cerca solo la stringa "giorno 15": il "giorno 30" le è passato sotto.


## 13. 🟡 Privacy e Condizioni dichiarano che i pagamenti li gestisce Polar, la pagina Rimborsi no

**Dove:** `app/privacy/page.tsx:67` · confermato da 3 scettici su 3 · sonda: testi

**Come ci si arriva:** 1. Apri /privacy e leggi il punto "Pagamenti": "sono gestiti dal fornitore di pagamento (Polar, in qualità di merchant of record)".
2. Apri /condizioni: "I pagamenti sono gestiti da Polar (merchant of record), che emette anche la ricevuta" (app/condizioni/page.tsx:73).
3. Apri /rimborsi, sezione "Chi incassa": "Il pagamento è gestito da un fornitore esterno che agisce da rivenditore", senza nome (app/rimborsi/page.tsx:150).

**Cosa dovrebbe succedere:** Le tre pagine devono dire la stessa cosa, e l'informativa privacy deve nominare il fornitore a cui i dati vanno davvero: è un'informazione obbligatoria, non un dettaglio di stile.

**Cosa succede:** Due pagine legali su tre nominano Polar, che ha rifiutato l'iscrizione il 10/08 (ARRETRATI voce A0) e quindi oggi non incassa niente per noi, mentre la terza, scritta il 12/08 dopo il sì di Dodo Payments, evita il nome. Il lettore trova tre versioni diverse dello stesso fatto e l'informativa privacy indica un destinatario dei dati che non è quello vero.


## 14. 🟡 Il conteggio dei verdetti da confermare si ferma a 30, ma è scritto come se fosse tutta la coda

**Dove:** `app/admin/verdetti/page.tsx:180` · confermato da 3 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Fai in modo che ci siano più di 30 verdetti idonei in attesa di conferma (con lo shadow mode acceso basta che arrivino 31 analisi idonee). 2. Apri /admin: la casella "Verdetti da confermare" mostra il numero vero, contato dal database. 3. Apri /admin/verdetti e leggi il bollo in alto a destra della scheda "Da confermare".

**Cosa dovrebbe succedere:** O il bollo dice il numero vero della coda, o dice chiaramente che si stanno mostrando i primi 30 di un totale più grande.

**Cosa succede:** Il bollo dice "30 in coda" e l'elenco si ferma a 30 righe, senza nessun avviso: la lettura è limitata a 30 (riga 112) e il bollo stampa quante righe sono state lette, non quante ce ne sono. Se in coda ce ne sono 45, la Panoramica dice 45 e i Verdetti dicono 30 nella stessa sessione. È la coda che blocca gli incassi (finché non confermi, quel cliente non può pagare), quindi il numero sbagliato è quello che fa credere di aver finito il lavoro.


## 15. 🟡 Il riquadro "A che punto sono" delle pratiche conta solo le ultime 60, accanto a un totale che invece è vero

**Dove:** `app/admin/pratiche/page.tsx:107` · confermato da 3 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Fai in modo che ci siano più di 60 pratiche nel database. 2. Apri /admin/pratiche. 3. Confronta il riquadro "Pratiche in tutto" con la somma dei bollini del riquadro "A che punto sono".

**Cosa dovrebbe succedere:** O i bollini contano tutte le pratiche, o dicono che si riferiscono solo alle ultime 60, come fa il titolo dell'elenco sotto.

**Cosa succede:** "Pratiche in tutto" mostra il totale vero contato dal database, mentre i bollini sono calcolati sulle sole 60 righe caricate per l'elenco e non lo dicono da nessuna parte. Con 100 pratiche si legge "Pratiche in tutto: 100" e sotto bollini che sommano 60. Peggio: quelle vecchie e ferme (per esempio le "inviate" che aspettano il sollecito) escono dalla finestra delle ultime 60 e spariscono dal conteggio proprio quando andrebbero guardate. Lo stesso difetto era già stato chiuso il 12/08 sui due riquadri accanto, ma non su questo.


## 16. 🟡 I numeri della Panoramica e del Traffico si accorciano da soli quando gli eventi superano il tetto, e nessuno lo scrive

**Dove:** `lib/eventi/lettura.ts:129` · confermato da 3 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Fai in modo che negli ultimi 7 giorni ci siano più eventi del tetto di lettura (ogni visita alla landing è un evento: bastano poche migliaia di visite al giorno, cioè un video che gira). 2. Apri /admin e /admin/traffico.

**Cosa dovrebbe succedere:** Come già fa la lettura del grafico per giorno (righe 400-420), quando la lettura viene tagliata bisogna dirlo, e i numeri incompleti non vanno presentati come totali.

**Cosa succede:** La lettura chiede al massimo 20.000 righe e non controlla mai se ne sono arrivate esattamente 20.000: se il tetto è stato toccato, visite, analisi, provenienze, paesi e l'intero imbuto vengono calcolati su un pezzo della settimana e mostrati come se fossero i totali dei 7 giorni. Nessun avviso, nessun "non letto": i numeri semplicemente calano. In più il tetto vero è quello che impone Supabase (di serie 1.000 righe per richiesta, alzabile solo dalle impostazioni del progetto), quindi il taglio scatta molto prima dei 20.000 e neutralizza anche il controllo che il grafico per giorno fa a riga 415, perché quel controllo scatta solo a 20.000 righe esatte e non ci arriverà mai.


## 17. 🟡 "Incassato in tutto" viene sommato su una lettura senza tetto: oltre il limite del database smette di crescere in silenzio

**Dove:** `app/admin/pratiche/page.tsx:88` · confermato da 3 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Fai in modo che ci siano più pratiche del tetto di righe del progetto Supabase (di serie 1.000). 2. Apri /admin/pratiche e guarda il riquadro verde "Incassato in tutto".

**Cosa dovrebbe succedere:** O la somma la fa il database (una somma, non un elenco di righe da sommare a mano), o si dichiara che è parziale.

**Cosa succede:** La lettura chiede l'elenco di tutti i prezzi pagati senza nessun tetto e senza nessun ordine, e li somma nel codice. Supabase taglia comunque la risposta al proprio limite di righe, quindi da quel punto in poi il totale degli incassi resta fermo, mostrato in verde e in grande come se fosse la somma di tutto. Non c'è nemmeno un ordinamento, quindi non si può nemmeno sapere quali righe sono state prese: sono quelle che fa comodo al database. Il riquadro dice testualmente "Somma di quanto è stato pagato davvero, su tutte le pratiche".


## 18. 🟡 La percentuale accanto alle analisi di oggi confronta mezza giornata con giornate intere, quindi la mattina è sempre in rosso

**Dove:** `app/admin/page.tsx:41` · confermato da 3 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Apri /admin la mattina presto, per esempio alle 9. 2. Guarda la pillola sotto la casella "Analisi lanciate oggi".

**Cosa dovrebbe succedere:** O si confronta oggi con lo stesso pezzo di giornata dei giorni prima, o il confronto si mostra solo a giornata finita. E l'etichetta deve dire su quanti giorni è fatta la media.

**Cosa succede:** La pillola confronta il conteggio di oggi (che alle 9 vale due ore di traffico) con la media di giornate intere, quindi mostra sistematicamente una freccia in giù con una percentuale molto negativa anche in una giornata che sta andando meglio delle altre. È il primo numero che si guarda la mattina e dice il contrario di quello che sta succedendo. In più l'etichetta scrive "sulla media dei 14 giorni" mentre la media è fatta su 13 (oggi viene tolto dal confronto, riga 41).


## 19. 🟡 Stesso ingrandimento sul campo "di che compagnia era l'aereo"

**Dove:** `components/verifica/ChiHaOperato.tsx:177` · confermato da 3 scettici su 3 · sonda: telefono

**Come ci si arriva:** 1. Da iPhone apri il verdetto di un volo in codeshare (quello in cui compare il riquadro "Di che compagnia era l'aereo?"). 2. Tocca il campo di ricerca della compagnia. Il carattere dichiarato nel codice e' text-[15.5px], senza nessuna eccezione per schermi piccoli.

**Cosa dovrebbe succedere:** Almeno 16px, come sugli altri campi.

**Cosa succede:** 15,5px: iOS ingrandisce la pagina da solo. E' lo stesso difetto di sopra, su un percorso meno frequente ma che serve proprio a chiudere un caso incerto, cioe' a farlo diventare vendibile.


## 20. 🟡 In fondo a ogni pagina, Privacy Cookie e Condizioni sono bersagli da 20 punti a 8 punti l'uno dall'altro

**Dove:** `components/Footer.tsx:197` · confermato da 2 scettici su 3 · sonda: telefono

**Come ci si arriva:** 1. Apri qualsiasi pagina del sito da un telefono da 390 punti. 2. Scorri fino in fondo, alla riga sotto la linea, dove ci sono Supporto, Condizioni d'uso, Rimborsi, Privacy, Cookie. Misurato nel browser: ogni link e' alto 20,3 punti, "Cookie" e "Privacy" sono larghi 48 e 49; la riga va a capo e i due gruppi restano a 7,7 punti di distanza verticale.

**Cosa dovrebbe succedere:** Un bersaglio da toccare alto almeno 44 punti, come gia' fatto altrove nel sito con la classe tocco-comodo (Logo, HeroCheck, PrezziRivolio, Masthead, StrisciaArgomenti).

**Cosa succede:** 20,3 punti di altezza e meno di 8 di stacco: col pollice si prende Privacy volendo Cookie, o non si prende niente. Nella stessa condizione stanno anche le tre colonne di link sopra (Il check gratuito, Come funziona, Prezzi e le altre), alte 21,8 punti con 14 di stacco. Sono le pagine legali, cioe' quelle che devono essere raggiungibili sempre.


## 21. 🟡 Nella scheda prezzi, "Come nasce il 1.000 euro" e' alto 18 punti mentre il suo gemello a 46 righe di distanza e' gia' stato sistemato

**Dove:** `components/rivolio/PrezziRivolio.tsx:241` · confermato da 3 scettici su 3 · sonda: telefono

**Come ci si arriva:** 1. Apri la home da un telefono da 390 punti. 2. Scorri alla sezione dei prezzi. 3. Prova a toccare la scritta tratteggiata "Come nasce il 1.000 euro" dentro la card. Misurato: 18,8 punti di altezza, 147 di larghezza. Il link "Come nasce questa cifra" del confronto, riga 287 dello stesso file, misura 44 perche' ha la classe tocco-comodo.

**Cosa dovrebbe succedere:** Anche questo bersaglio a 44 punti sul telefono: e' lo stesso tipo di elemento, nello stesso file, e la soluzione esiste gia'.

**Cosa succede:** 18,8 punti. E' il link che apre il conto, cioe' la trasparenza che il prodotto vende, ed e' il piu' piccolo da toccare di tutta la pagina.


## 22. 🟡 Sul verdetto, "Come nasce questa cifra" e' alto 20 punti

**Dove:** `components/verifica/Risultato.tsx:371` · confermato da 3 scettici su 3 · sonda: telefono

**Come ci si arriva:** 1. Da un telefono da 390 punti apri /verifica/demo-ZZ250-2026-08-07. 2. Nel riquadro verde scuro con la cifra grande, prova a toccare "Come nasce questa cifra". Misurato nel browser: 20 punti di altezza.

**Cosa dovrebbe succedere:** Almeno 44 punti sul telefono, come per gli altri link di trasparenza gia' sistemati.

**Cosa succede:** 20 punti. E' l'unico modo che ha l'utente di aprire il conto dietro il numero che gli stiamo mostrando, sulla schermata dove decide se pagare.


## 23. 🟡 Le etichette del biglietto sul verdetto sono grigio chiarissimo a 9 punti: contrasto 2,5 su 4,5 richiesto

**Dove:** `components/rivolio/CartaImbarcoScan.tsx:113` · confermato da 3 scettici su 3 · sonda: telefono

**Come ci si arriva:** 1. Da un telefono da 390 punti apri /verifica/demo-ZZ250-2026-08-07. 2. Guarda le scritte VOLO, DATA, TRATTA, ARRIVO PREVISTO, ARRIVO EFFETTIVO, VERIFICA sopra i dati del biglietto. Misurato due volte nel browser: colore #9aa4b0 su bianco, contrasto 2,53 a 1, corpo 9 punti con le lettere distanziate. Stesso problema per VERIFICA COMPLETATA in cima (2,37 a 1) e per "Orari in ora italiana." (2,53 a 1).

**Cosa dovrebbe succedere:** Almeno 4,5 a 1, che e' il minimo di legge per il testo piccolo.

**Cosa succede:** 2,53 a 1. Alla luce del sole quelle scritte spariscono, e sono proprio le etichette della prova che vendiamo: quale volo, che giorno, a che ora doveva arrivare e a che ora e' arrivato. Il colore arriva dal token --color-fumo-2 in app/globals.css:16, quindi lo stesso grigio si porta dietro anche le righe "Fonte: ENAC" e simili sulla home.


## 24. 🟡 Un indirizzo rivolio.it che rimbalza su un sito qualsiasi: il filtro del ritorno dopo il login non ferma la barra rovesciata

**Dove:** `app/auth/sessione/route.ts:24` · confermato da 3 scettici su 3 · sonda: sicurezza

**Come ci si arriva:** 1) Registra un account qualsiasi su Rivolio e, dagli strumenti da sviluppatore, copia i due gettoni della tua sessione (access_token e refresh_token). 2) Componi https://rivolio.it/auth/sessione?access_token=<il tuo>&refresh_token=<il tuo>&poi=/\sito-cattivo.it (barra normale seguita da barra rovesciata). 3) Aprilo: il filtro di riga 24 controlla solo che il valore inizi per una barra e non per due, quindi lo lascia passare; poi new URL(poi, request.url) normalizza la barra rovesciata e il browser finisce su https://sito-cattivo.it/. Verificato eseguendolo: new URL("/\\sito-cattivo.it", "https://rivolio.it/auth/sessione").href vale "https://sito-cattivo.it/". La regola giusta esiste già ed è scritta apposta per questo caso in lib/api/percorso.ts, ma questa rotta non la usa: si è fatta un controllo suo.

**Cosa dovrebbe succedere:** Come le altre porte d'ingresso (auth/conferma, entra, posta-auth), anche questa dovrebbe passare da percorsoInterno, che accetta solo i caratteri di un percorso interno vero e manda /\sito-cattivo.it su /app.

**Cosa succede:** Si fabbrica un link che comincia per rivolio.it e finisce su un sito estraneo, dopo aver anche collegato chi lo apre a un account che non è il suo. È l'ingrediente di una pagina di imitazione: la persona vede il nostro dominio nel messaggio e si fida.


## 25. 🟡 La ricevuta dell'analisi, copiata prima di essere consumata, apre per trenta giorni la lettura delle carte d'imbarco e gli orari veri di atterraggio

**Dove:** `app/api/leggi-carta/route.ts:55` · confermato da 3 scettici su 3 · sonda: sicurezza

**Come ci si arriva:** Serve il muro acceso (NEXT_PUBLIC_CHECK_PREZZO_ATTIVO=1). 1) Paga un'analisi (o passa dalla cassa di prova) e, prima di usarla, copia dagli strumenti da sviluppatore il valore del cookie rivolio_check. 2) Fai la tua analisi: il credito si consuma e il cookie viene cancellato. 3) Rimetti a mano nel browser il cookie con il valore copiato. 4) Chiama /api/leggi-carta con una foto: risponde e legge il documento, quante volte vuoi. Stessa cosa su /api/voli-tratta (riga 93): con quel cookie rimesso torna a uscire l'orario di atterraggio VERO di ogni volo cercato, cioè la cosa che il muro esiste per far pagare. Il registro sul database che impedisce proprio il riuso (creditoFinito, lib/check/cancello.ts) lo consulta solo /api/verifica; queste due rotte guardano soltanto se il cookie è firmato e non scaduto.

**Cosa dovrebbe succedere:** Una ricevuta già consumata non deve aprire più niente su nessuna porta: il conto lo tiene il database e non il cookie, e questo vale anche per la lettura della carta d'imbarco e per l'elenco dei voli di una tratta.

**Cosa succede:** Un'analisi pagata una volta sola dà, per trenta giorni, chiamate illimitate all'OCR (che paghiamo a chiamata) e la lettura illimitata degli orari di atterraggio certificati. Basta salvare una stringa prima di usarla, e quella stringa si può passare ad altri.


## 26. 🟡 L'identificativo di una verifica qualsiasi apre le tre rotte laterali, e vale per qualunque volo

**Dove:** `lib/check/cancello.ts:219` · confermato da 3 scettici su 3 · sonda: sicurezza

**Come ci si arriva:** Serve il muro acceso. 1) Procurati l'identificativo di una verifica esistente: basta il tuo (una sola analisi pagata) oppure un indirizzo /verifica/<identificativo> condiviso da qualcun altro, visto che quelle pagine sono pubbliche e fatte per essere passate. 2) Chiama /api/verifica/dichiara con quel verificaId ma con numero e data di un volo COMPLETAMENTE DIVERSO, caso "negato", presenza "inOrario", volonta "involontario". Il cancello di riga 219 controlla soltanto che quella riga esista da qualche parte nel database: non guarda né di chi è né se parla dello stesso volo. 3) Ricevi il verdetto idoneo con l'importo della fascia (valutaNegato in lib/regole/dichiarati.ts), e ogni chiamata fa partire una richiesta al fornitore dati che paghiamo noi. Si ripete quante volte si vuole senza consumare niente. Lo stesso vale per /api/verifica/cancellato e /api/verifica/operativo.

**Cosa dovrebbe succedere:** Il commento della funzione dice che quell'identificativo si ottiene in un modo solo, passando dal cancello, e che serve a non far pagare due volte la stessa persona per lo stesso volo: dovrebbe quindi aprire solo il seguito di QUEL volo, non essere una chiave universale e riusabile all'infinito.

**Cosa succede:** Un identificativo solo, anche di un'altra persona, dà verdetti a pagamento illimitati su qualunque volo, e ogni verdetto ci costa una chiamata al fornitore. Il muro resta in piedi solo sulla porta principale.


## 27. 🟡 Chi parte da un aeroporto non italiano vede scritto "ENAC" mentre la sua lettera dice "non l'ENAC"

**Dove:** `lib/copy.ts:1082` · confermato da 3 scettici su 3 · sonda: app-mobile

**Come ci si arriva:** 1. Una pratica che arriva allo stato `enac` (56 giorni dall'invio, oppure subito col no dichiarato).
2. Su /app, linguetta "Le tue pratiche": il bollino dello stato scrive "ENAC" e il prossimo passo scrive "Presenta il reclamo ENAC seguendo i passi nell'email".
3. Su /pratica/<id>: stesso titolo, e nella cronologia "Reclamo ENAC pronto" (lib/copy.ts:1120) ed "Email col reclamo ENAC inviata" (:1135).
4. Su /pratica/<id>/lettera, la segnalazione generata per lo STESSO volo dice, testualmente (lib/lettera/genera.ts:359): "Il tuo volo è partito da un aeroporto in Spagna, quindi l'organismo competente è AESA, non l'ENAC".
Lo stesso testo sbagliato è anche nell'app: mobile/src/lib/testi.ts:857 ("ENAC") e :995 ("Reclamo all'ENAC").

**Cosa dovrebbe succedere:** Lo stato e la cronologia nominano l'ente del paese di partenza, come già fanno la lettera e la guida dal giro #38 (art. 16 par. 1: la competenza è dello Stato dell'aeroporto di partenza). Oppure usano una parola neutra: "Segnalazione all'ente".

**Cosa succede:** Lo stato dice "ENAC" a tutti. Chi parte da Barcellona, Monaco o Varsavia legge nella propria pratica un ufficio che non tratterà mai il suo caso, e lo legge nello stesso giro in cui la lettera gli spiega il contrario.


## 28. 🟡 La landing promette "al giorno 30" quello che il motore fa al giorno 42 e al 56

**Dove:** `lib/copy.ts:567` · confermato da 3 scettici su 3 · sonda: app-mobile

**Come ci si arriva:** 1. Apri la home e scendi alle Domande, voce "E se la compagnia dice che era maltempo o sciopero?".
2. Si legge: "...al giorno 30 trovi contro-risposta e reclamo ENAC già pronti". Verificato sul sito che gira: `curl -s http://localhost:3000/ | grep "al giorno 30 trovi"` lo trova due volte.
3. I numeri veri sono in lib/pratiche/rifiuto.ts:225 (GIORNI_PRIMA_DEL_SOLLECITO = 42) e :228 (+14, quindi 56), e app/api/motore/segui/route.ts:21 lo scrive nero su bianco: "T+56 dall'invio → segnalazione all'ente nazionale".
È lo stesso errore chiuso nel giro #51 in sei punti del sito: questa riga era rimasta fuori.

**Cosa dovrebbe succedere:** La FAQ dice quello che il motore fa davvero: la replica alla sesta settimana, la segnalazione all'ente due settimane dopo.

**Cosa succede:** Promette 26 giorni prima di quando succede. Chi compra si aspetta la contro-risposta al giorno 30 e a quel giorno non trova niente.


## 29. 🟡 La linguetta "Profilo" della web app è tagliata su ogni telefono fino a 414 punti

**Dove:** `components/app/AppRivolio.tsx:86` · confermato da 3 scettici su 3 · sonda: app-mobile

**Come ci si arriva:** 1. Apri /app con un telefono (o il browser ristretto) e guarda la barra delle tre sezioni.
2. Misurato nel browser: a 320 punti la barra è larga 280 e il contenuto 380, quindi 97 punti restano fuori e di "Profilo" si legge una lettera; a 375 (iPhone SE, iPhone 8) ne restano fuori 42; a 390 (iPhone 14/15) ne restano fuori 27; entra tutta solo da 430 in su.
3. La barra ha `[scrollbar-width:none]`, quindi non c'è nessun segno che si possa trascinare di lato.
Il giro di oggi (commit f7ac3f7, "la barra della web app era 379 su uno schermo da 375") ha tolto lo scorrimento della PAGINA intera, che era il sintomo peggiore, ma la terza linguetta resta tagliata.

**Cosa dovrebbe succedere:** Le tre sezioni della web app si vedono tutte su un telefono normale.

**Cosa succede:** La terza è mozzata. Su uno schermo da 320 punti l'unico modo per arrivarci è scoprire per caso che quella barra si trascina.


## 30. 🟡 Il pannello Profilo promette avvisi e classifica che nella web app non esistono

**Dove:** `lib/copy.ts:149` · confermato da 3 scettici su 3 · sonda: app-mobile

**Come ci si arriva:** 1. Apri /app senza essere entrato e premi "Profilo".
2. Si legge: "Il check funziona lo stesso. Con l'account trovi le pratiche, gli avvisi e la classifica."
3. Entra con un account: nella web app non c'è nessuna classifica (cercato in tutto il sito: la classifica esiste solo come rotta /api/classifica, nessuna pagina la mostra) e non c'è nessun avviso o notifica (esistono solo dentro l'app sul telefono).
4. Nello stesso pannello c'è la spunta "Partecipa alla classifica" (lib/copy.ts:162) che dice "il tuo nome pubblico e l'importo entrano in classifica": il dato si salva davvero, ma da web non c'è nessun posto dove quella classifica si possa vedere.

**Cosa dovrebbe succedere:** O la web app ha la classifica e gli avvisi, o non li promette.

**Cosa succede:** Promette due cose su tre che da web non esistono, e offre una spunta che porta in un posto irraggiungibile.


## 31. 🟡 L'app che il sito mostra nella lavagna è ferma a quattro commit fa: manca il muro del check

**Dove:** `public/app-anteprima/_expo/static/js/web/entry-4daa30591e502d810932b4569420adf5.js:1` · confermato da 3 scettici su 3 · sonda: app-mobile

**Come ci si arriva:** 1. `git log -1 -- public/app-anteprima` → commit f983f39, 11/08 alle 09:30.
2. `git log f983f39..HEAD --oneline -- mobile/src` → quattro commit dopo, fra cui "Il muro anche nell'app", "Le 60 promesse di gratis passano tutte dall'interruttore" e quello di oggi.
3. Prova diretta: `grep -c "Gli orari certificati di partenza e atterraggio" public/app-anteprima/_expo/static/js/web/entry-*.js` risponde 0. Quella frase è dentro mobile/src/components/MuroCheck.tsx, cioè il muro del check dell'app: nel file pubblicato non c'è proprio.
4. Quindi /anteprima-app (la lavagna con le 34 schermate) e /app-anteprima mostrano l'app dell'11 agosto mattina, non quella di adesso.

**Cosa dovrebbe succedere:** La lavagna è stata costruita apposta perché ogni riquadro sia l'app VERA (STATO, giro #50: "uno screenshot invecchierebbe al primo push senza che nessuno se ne accorga").

**Cosa succede:** Invecchia esattamente come uno screenshot, perché è un export statico committato che nessuna build rifà. Chi guarda la lavagna per decidere il design della web app sta guardando una versione che non esiste più.


## 32. 🟢 L'errore della cassa di prova esce del colore del testo normale, non rosso

**Dove:** `components/rivolio/CassaProva.tsx:128` · confermato da 3 scettici su 3 · sonda: percorso-soldi

**Come ci si arriva:** 1) Apri /cassa-prova. 2) Fai fallire il pagamento finto (per esempio togliendo la chiave con cui il server firma la ricevuta: la rotta risponde «Il server non è configurato per firmare la ricevuta»). 3) Premi il bottone "Paga".

**Cosa dovrebbe succedere:** Il messaggio di errore si distingue a colpo d'occhio dal resto della pagina.

**Cosa succede:** Il messaggio esce nero come tutto il testo intorno. La classe usata è `text-errore`, ma in app/globals.css non esiste nessun colore chiamato "errore": Tailwind quella classe non la genera proprio, quindi non colora niente. È lo stesso difetto già trovato l'11/08 su altre due schermate e mai chiuso qui.


## 33. 🟢 Il pallino verde "in diretta" pulsa anche sulle sezioni che non si aggiornano mai da sole

**Dove:** `components/admin/Guscio.tsx:178` · confermato da 2 scettici su 3 · sonda: pannello

**Come ci si arriva:** 1. Apri /admin/verdetti (oppure /admin/pratiche o /admin/iscritti). 2. Lascia la scheda aperta e fai arrivare un verdetto idoneo nuovo (o una pratica nuova). 3. Aspetta qualche minuto senza toccare niente e guarda in alto a destra.

**Cosa dovrebbe succedere:** Il pallino che pulsa e l'ora accanto vanno mostrati solo dove i numeri si rinfrescano davvero; altrove deve restare il solo bottone "aggiorna".

**Cosa succede:** Il rinfresco automatico è acceso solo su quattro indirizzi (riga 51), ma il pallino verde che pulsa e la scritta "aggiornato alle HH:MM" compaiono su tutte le sezioni. Su Verdetti, Pratiche e Iscritti la pagina resta ferma per ore mentre la testata continua a dire che è aggiornata e il pallino continua a pulsare. Il commento nel codice dice che quel pallino significa "i numeri si muovono da soli": su cinque sezioni su nove non è vero, e una di quelle è la coda che blocca gli incassi.


## 34. 🟢 Il bianco sui bottoni verdi principali sta a 3,5 di contrasto invece di 4,5

**Dove:** `app/globals.css:18` · confermato da 3 scettici su 3 · sonda: telefono

**Come ci si arriva:** 1. Apri la home da un telefono. 2. Guarda il testo dei bottoni pieni: "Cerca il volo", "Controlla gratis", "Carica la foto", "Prepara la pratica", e sul verdetto "Salva e continua" e "Prepara la pratica a 14,90". Misurato nel browser: bianco su #0a9d5c, contrasto 3,51 a 1, corpo fra 13,5 e 16,5 punti.

**Cosa dovrebbe succedere:** 4,5 a 1 per un testo di quella dimensione. Si arriva li' usando il verde scuro gia' in palette (--color-verde-scuro #067a46) come fondo del bottone invece del verde chiaro.

**Cosa succede:** 3,51 a 1 su tutti i bottoni principali del sito. Non e' illeggibile, ma e' sotto il minimo, e riguarda esattamente il comando che deve farsi premere.
