# Prima di lanciare

*Scritto l'11/08 dopo il giro completo: setaccio dei testi, attacco al
muro, giro visivo, e la lettura delle pagine dei fornitori. Ogni numero
qui dentro viene da una pagina aperta oggi o da un comando rieseguito,
mai da una stima travestita da fatto.*

---

## Il semaforo, in una schermata

| | Stato |
|---|---|
| Il motore che decide (CE 261/2004) | 🟢 **collaudato**: 58 casi d'oro, 58 su 58, falsi positivi 0 |
| Il muro del check | 🟢 **invalicabile**, provato attaccandolo: 20 tentativi su 20 respinti |
| I testi (mai "check gratis" col muro acceso) | 🟢 **setacciato tutto**, con una prova che lo tiene fermo per sempre |
| Il sito visto da fuori | 🟢 26 schermate a 1440 e 390: zero errori, zero scorrimenti storti |
| Le prove | 🟢 **922 verdi, zero rosse** |
| **La cassa che incassa** | 🔴 **NON ESISTE** |
| **La capienza a 2 milioni di visite** | 🟡 **il tetto è 3 richieste al secondo**, non i soldi |
| Il registro delle analisi pagate | 🟡 **serve il punto 6 della migrazione**, altrimenti la ricevuta si riusa |

---

## 1. 🔴 Quello che ferma tutto: non c'è un venditore

Il bottone "Sblocca l'analisi" oggi non porta a un incasso vero. Polar ha
detto no, e l'11/08 ho letto le pagine ufficiali degli altri tre: hanno
**tutti** una riga che ci prende (`PAGAMENTI.md`).

**Finché non si risolve, la distribuzione è soldi buttati**: la gente
arriva, trova un muro, non può pagare, se ne va e non torna.

Le due strade vere, in ordine di quanto sono nelle nostre mani:
1. **Provare Paddle dicendo la verità.** La sua riga sui viaggi nomina
   tre cose che noi non siamo (prenotazioni, club vacanze,
   multiproprietà) e la sua esclusione dei "servizi umani" gioca a
   nostro favore, perché noi vendiamo software. Aspettarsi domande.
2. **Partita IVA e incasso diretto.** È l'unica che non dipende
   dall'umore di qualcun altro, e cambia anche il conto: senza
   intermediario si tiene di più. Ma è una decisione fiscale e va presa
   col commercialista, non qui.

---

## 2. 🟡 Il vero rischio a due milioni di visite: TRE al secondo

Questo è il numero che conta, e non è quello dei soldi.

**I piani di AeroDataBox** (letti sulla loro pagina prezzi l'11/08):

| Piano | Al mese | Unità al mese | **Richieste al secondo** |
|---|---|---|---|
| Basic | gratis | 600 | **1** |
| Pro | 5 $ | 6.000 | **1** |
| Pro 2 | 15 $ | 24.000 | **1** |
| Ultra | 30 $ | 60.000 | **2** |
| Ultra 2 | 90 $ | 240.000 | **2** |
| Mega | 150 $ (poi 0,00025 $ a unità) | 600.000 | **3** |

**La quota mensile non è il problema.** Con la cache, un volo con 180
passeggeri costa UNA chiamata: 600.000 unità al mese sono tantissime
analisi, e comunque sopra il tetto si paga a consumo invece di
fermarsi.

**Il problema è la colonna a destra.** Anche sul piano più caro sono
**3 richieste al secondo**. Un video che va bene manda mille persone in
due minuti: se controllano mille voli diversi, la coda dura più di
cinque minuti.

**Cosa succede davvero quando si supera:** il fornitore risponde "troppe
richieste", il nostro codice se ne accorge e il verdetto esce
**incerto**. Quindi:
- ✅ **niente si rompe**, nessuna pagina bianca, nessun errore in faccia;
- ✅ **nessun verdetto sbagliato**: incerto vuol dire "non lo so", mai un
  "sì" inventato;
- ✅ **nessuno paga per niente**: un incerto non consuma il credito;
- ❌ ma quella persona non ha avuto la sua risposta, e probabilmente non
  torna.

**Quindi il rischio non è il crash né la brutta recensione per un
verdetto sbagliato. È la vendita persa nel momento di punta.**

Le tre cose che lo riducono, in ordine di efficacia:
1. **La cache, che c'è già.** Se il video parla di UNO sciopero o di UNA
   tratta, le mille persone che arrivano chiedono più o meno le stesse
   cose, e il fornitore lo interroghiamo una volta sola.
2. **Una coda con ritentativo**, da costruire: invece di rispondere
   subito "incerto", si aspetta un secondo e si riprova. ⚠️ Il tetto è
   che le funzioni di Netlify muoiono a 10 secondi.
3. **Un piano più alto**, che alza il tetto da 1 a 3 al secondo.

---

## 3. Cosa usa il check, per davvero

Nessuna libreria Python. Nessun modello di intelligenza artificiale che
decide qualcosa.

| Cosa | A cosa serve | Si paga? |
|---|---|---|
| **AeroDataBox** | gli orari veri del volo: partenza, atterraggio, stato | sì, abbonamento |
| **Mistral OCR** | SOLO trasformare la foto della carta d'imbarco in testo | sì, a chiamata |
| **Supabase** | il database: cache dei voli, verifiche, pratiche, iscritti | piano gratuito, per ora |
| **Resend** | le email | piano gratuito, per ora |
| **Expo push** | le notifiche dell'app | gratis |
| Archivio aeroporti | 9.016 scali con città, paese e coordinate | gratis, è un file nostro |
| Distanze | calcolate da noi, in linea d'aria | zero chiamate |
| Meteo (Open-Meteo) | **spento** di proposito: l'uso commerciale costa | no |
| AviationStack | **dormiente**: si accende solo se qualcuno mette la chiave | no |

**Dove c'è l'AI, e non è mai nel verdetto:**
1. **La foto della carta d'imbarco** → testo. Poi i campi si estraggono
   con regole fisse e l'utente li vede e li può correggere.
2. **L'autopilot degli scioperi** → legge le pagine pubbliche. Ogni riga
   passa da un filtro rigido prima del database, e un errore può solo
   rendere il motore PIÙ prudente.

**Il verdetto è codice, punto.** `lib/regole/eu261.ts`: stesso volo,
stesso risultato, sempre.

---

## 4. Le 2 rosse e le 4 saltate: cosa erano

**Le 2 rosse: risolte oggi.** Erano una prova sola (contata due volte,
una su computer e una su telefono) che compilava il modulo
dell'Osservatorio per davvero. Per farlo deve scrivere nel database. La
macchina dove giro io ha la rete verso il database **chiusa**, quindi il
salvataggio rispondeva "errore" e la prova falliva. **Non era un guasto
del sito**: sul tuo PC e online passava.

Il problema non era la prova, era l'abitudine: leggere ogni volta "verde
tranne quelle due" vuol dire che il giorno che diventano tre nessuno se
ne accorge. Adesso la prova si accorge da sola che il database non
risponde e si dichiara **saltata** invece che fallita. **Zero rosse.**

**Le 4 saltate: una sveglia, e sta facendo il suo mestiere.** Nel 2027
cambiano due regole europee. Invece di scrivere un promemoria in un file
che nessuno rilegge, quelle quattro prove **dormono fino al 1° maggio
2027** e da quel giorno cominciano a fallire se il sito promette ancora
le cose vecchie. Non c'è niente da fare: quando suonano, si sistemano le
due cose e si spengono da sole.

---

## 5. La FASE 1 è finita?

**Il prodotto sì. Il business no.**

Il prodotto definito il 07/08 esiste da capo a fondo ed è collaudato:
check, verdetto a tre stati, lettera, i quattro colpi del dopo-lettera,
tracker, app, blog, pagine evento, muro del check.

Ma la FASE 1 era "fare cassa", e **cassa non se ne fa senza un
venditore**. Quindi: **la costruzione è finita, la fase no.**

---

## 6. La lista, in ordine

### 🔴 Prima della distribuzione (senza questi, non si parte)
1. **Un venditore che accetti il caso d'uso.** È il tappo. `PAGAMENTI.md`.
2. **Il punto 6 della migrazione** (`supabase/DA-APPLICARE.sql`). Senza,
   una ricevuta si riusa all'infinito: uno paga 1,99 e la passa agli
   amici.
3. **Le sentenze citate nelle repliche**, rilette su EUR-Lex. Un numero
   di causa sbagliato in una lettera che il cliente manda alla compagnia
   lo fa sembrare sprovveduto. `ARRETRATI` voce M.
4. **Il dominio e le email.** Finché il dominio non è verificato su
   Resend, **le email partono SOLO verso valerio@artecai.it**: chi si
   iscrive non riceve niente.

### 🟡 Prima del picco di traffico
5. **Il piano AeroDataBox**, scelto sapendo che il tetto è 3 al secondo.
6. **La coda con ritentativo** sul fornitore, per non buttare via le
   richieste nel minuto di punta.
7. **Il contatore delle richieste è per singola funzione**, quindi con
   dieci funzioni in parallelo sono dieci contatori diversi. Col muro
   acceso conta poco (il cancello ferma prima la spesa), ma con la cassa
   vera va rifatto condiviso.

### 🟢 Quando c'è tempo
8. Le fonti degli articoli rilette dal tuo PC.
9. Le pagine legali riviste da un avvocato, coi tuoi dati di titolare.
10. Il vecchio codice del prodotto viaggi (sei componenti che nessuno
    usa più) da togliere: non lo vede nessun utente, ma sporca ogni
    ricerca futura.

---

## 7. Il collaudo del muro, per esteso

Ho provato a scavalcarlo in venti modi. Ogni riga è un comando
rieseguibile (`attacco.sh`).

| Tentativo | Risposta |
|---|---|
| Il check senza ricevuta | 402, muro |
| Volo cancellato, rotta diretta | 402 |
| Negato imbarco, rotta diretta | 402 |
| Codeshare, rotta diretta | 402 |
| Lettura carta d'imbarco (costa a noi) | 402 |
| Id di verifica inventato | 402 |
| Quattro ricevute false e manomesse | 402 |
| L'orario di atterraggio nell'elenco voli | assente |
| La cassa di prova senza chiave | 404 |
| Emettere una ricevuta senza chiave | 404 |
| La chiave con la parola sbagliata | 404 |
| **Riusare una ricevuta già consumata** | **era 200 🔴, ora chiuso col registro** |

**I due che sono passati, e come li ho chiusi:**
- **La ricevuta riusabile.** Il credito stava nel cookie, cioè nel
  browser dell'utente: bastava rimettere il valore di prima. Adesso il
  conto lo tiene il database (serve il punto 6 della migrazione).
- **Il muro che rispondeva 500** quando il database non rispondeva:
  restituiva un guasto invece del muro. Adesso qualunque cosa vada
  storta chiude, non apre.

E due prove nuove impediscono che si riaprano: una controlla **ogni
rotta** del sito e pretende il cancello su quelle che ci costano soldi;
l'altra controlla **ogni testo** e vieta di promettere il check gratuito
fuori dall'interruttore. La prima ha trovato subito una porta che non
avevo guardato.
