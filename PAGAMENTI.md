# Come incassare, dopo il no di Polar

*10/08. Il controllo automatico di Polar ha risposto "Use case not
supported". Questo documento dice perché, e quali strade restano.*

## Perché hanno detto no

La motivazione che ti hanno dato, tradotta:

> È un prodotto legato ai reclami di viaggio. Rientra nei servizi di
> viaggio soggetti a restrizione e nell'attività di assistenza ai
> reclami. Il rimborso garantito e il percorso automatico da idoneità a
> reclamo aumentano il rischio di contestazioni sulla carta e il rischio
> normativo.

**Non è il testo scritto male.** Il testo era accurato e diceva le cose
giuste. È la categoria a essere segnata in rosso nei loro elenchi.

E il motivo per cui è segnata in rosso ha una logica, anche se ci danneggia:
il cliente paga **prima**, e il risultato dipende da un terzo (la
compagnia aerea). Se la compagnia dice no, una parte dei clienti non
chiede il rimborso a noi: chiama la banca e contesta l'addebito. Le carte
considerano un venditore a rischio sopra lo 0,7% di contestazioni, ed è
una soglia che si buca in fretta. Per un venditore ufficiale come Polar,
che risponde in prima persona, quel rischio è suo, non nostro.

⚠️ **La garanzia, che è la cosa più onesta che facciamo, a un modello di
rischio suona come "questi si aspettano di rimborsare parecchio".**

**Non si riscrive la descrizione per farla passare.** Polar è il
venditore ufficiale: alla verifica dei documenti guardano il sito vero, e
se trovano una cosa diversa da quella dichiarata bloccano i bonifici coi
soldi dei clienti già incassati. Sarebbe un problema molto peggiore di
questo.

---

## Le strade, in ordine di quanto costano

### 1. Chiedere una revisione umana a Polar
**Costo: una email. Probabilità: bassa, ma non zero.**

Hai già un thread aperto con Sabina, che ti aveva scritto che il percorso
obbligato era l'iscrizione. Adesso l'iscrizione ha risposto, e ha
risposto un automatismo. Vale la pena rispondere su quel thread facendo
notare tre cose che il classificatore non può vedere:

- non gestiamo reclami e non incassiamo per conto di nessuno: i soldi
  della compensazione non passano mai da noi, vanno dalla compagnia
  direttamente al passeggero;
- non c'è nessun lavoro umano: si compra un documento generato, come si
  compra un modello di contratto;
- la garanzia è la nostra politica di rimborso, non un prodotto
  assicurativo, e serve proprio a evitare le contestazioni sulla carta,
  non a produrle.

Il testo pronto è in fondo a questo documento.

### 2. Provare un altro venditore ufficiale
**Costo: un pomeriggio. Probabilità: bassa, e adesso sappiamo perché.**

**RICERCA FATTA L'11/08, leggendo le pagine ufficiali una per una.**
Non sono opinioni: sono le loro parole, aperte oggi.

| Chi | La riga che ci riguarda | Fuori? |
|---|---|---|
| **Polar** | *"Travel Services;"* e *"Regulated services or products;"* | Sì, e infatti ha già detto no |
| **Paddle** | *"Travel Services, including but not limited to reservation services, travel clubs, timeshares"* · *"pure consulting or advisory services, including but not limited to legal advice"* | Sì, ma con la formulazione più stretta |
| **Lemon Squeezy** | *"Regulated services such as: ... bankruptcy, legal, merchant, debt-relief, collections"* e *"Services of any kind"* | Sì, due volte · ⚠️ **e comunque sta chiudendo, vedi sotto** |
| **Dodo Payments** | *"Legal, accounting, medical, and professional services ... Examples include advisory work, ... **document preparation**"* · *"Travel, Immigration & Visa services"* | Sì, ed è il più esplicito di tutti |

## ⚠️ LEMON SQUEEZY ESCE DALLA LISTA (ricerca dell'11/08 sera)

**Stripe l'ha comprata, e i suoi clienti stanno migrando su Stripe
Managed Payments.** Il fondatore ha confermato a gennaio 2026 che stanno
costruendo il percorso di migrazione; non c'è una data di spegnimento
annunciata, ma non c'è nemmeno un motivo per salire su un treno che sta
tornando in deposito. Iscriversi lì oggi è tempo speso su una porta che
si chiude, **e in più il loro elenco ci vieta due volte** (riga qui
sopra). Quindi: la quarta email non si manda.

## E STRIPE MANAGED PAYMENTS, che sarebbe la porta naturale?

**È merchant of record come Polar** (quindi niente partita IVA per
incassare), costa **5% + 0,50 dollari**, cioè identico a quello che
costava Lemon Squeezy.

🟡 **Ma oggi è ancora in beta chiusa, e l'ammissione dipende da dove ha
sede l'attività.** Le fonti concordano su tre cose: sta partendo dagli
Stati Uniti, funziona solo con Checkout e Payment Links di Stripe, e
Stripe rivede gli account prima di dare l'accesso. **Per un venditore
italiano senza partita IVA, oggi, la porta probabilmente non è ancora
aperta.**

⚠️ **Non è verificato sulla fonte ufficiale**: da questo ambiente
`stripe.com` è bloccato dal proxy. Va aperto dal PC di Valerio e
guardato se il bottone dice *Get started* (aperto) o *Join the waitlist*
(chiuso), e se l'Italia compare fra i paesi. In ARRETRATI.

🔴 **La conclusione onesta: la categoria è chiusa sullo scaffale
standard.** Non è che Polar ci abbia trattati peggio degli altri, e non
è che il testo dell'iscrizione fosse scritto male. Tutti e quattro hanno
una riga che ci prende. **Riscrivere la descrizione per farla passare
sarebbe la mossa peggiore possibile**: al momento della verifica
guardano il sito vero, e a quel punto i bonifici si bloccano coi soldi
dei clienti dentro.

**Ma due argomenti veri esistono, e vanno usati con un essere umano.**
1. **Non vendiamo viaggi.** Le loro righe sui viaggi nominano tre cose
   precise: prenotazioni, club vacanze, multiproprietà (Paddle), oppure
   biglietti aerei, crociere, visti (Dodo). Noi non vendiamo, non
   rivendiamo e non prenotiamo niente: vendiamo un documento su un volo
   **già avvenuto**. La categoria merceologica non è la stessa.
2. **Non è un servizio umano né una professione regolamentata.** Dodo
   scrive che va bene *"un prodotto digitale fisso e predefinito,
   consegnato allo stesso modo a ogni acquirente"*, ed è esattamente cosa
   siamo: il motore è deterministico, a parità di volo esce lo stesso
   documento. E la loro riga sulle professioni dice *"servizi che
   richiedono licenza, certificazione o conformità normativa"*: preparare
   una lettera che poi manda il passeggero, dalla propria email, non
   richiede una licenza in Italia. È il motivo per cui su tutti e tre i
   fogli c'è scritto **"non costituisce parere legale"**.

**Chi provare per primo, e perché: Paddle.** La sua riga sui viaggi è la
più stretta delle quattro (nomina solo tre cose che noi non siamo), e la
sua esclusione dei *"servizi umani"* gioca **a nostro favore**, non
contro: quella riga esclude chi vende consulenza, e noi vendiamo
software. ⚠️ Paddle però ha stretto le maglie dopo un accordo con la FTC
americana (giugno 2025) e chiede una verifica più severa: aspettarsi
domande, non un sì automatico.

⚠️ **Vanno provati dicendo la verità, come con Polar.** Se uno di loro
dice sì avendo capito cosa vendiamo, è una strada solida. Se dice sì
perché ha capito un'altra cosa, il problema torna al primo bonifico.

**Fonti** (riaperte l'11/08 da questa sessione):
`paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle` ·
`polar.sh/legal/acceptable-use-policy` ·
`docs.lemonsqueezy.com/help/getting-started/prohibited-products` ·
`docs.dodopayments.com/miscellaneous/merchant-acceptance`

### 3. Partita IVA e Stripe diretto
**Costo: soldi veri e un commercialista. Probabilità: alta.**

È l'unica strada che non dipende dall'umore di qualcun altro, e il motivo
è semplice: con una partita IVA il venditore sei tu, e Stripe è solo
l'incassatore. La compensazione dei voli non è nella lista dei divieti di
Stripe; è una categoria che chiede documenti in più, e AirHelp e
Flightright incassano con carta senza problemi.

Cosa comporta, in breve, e va confermato da un commercialista:
- regime forfettario, con l'aliquota agevolata per le nuove attività nei
  primi anni;
- contributi INPS gestione separata sul reddito;
- fatturazione elettronica, che si fa da sola con un gestionale da poche
  decine di euro l'anno.

⚠️ **Questa è una decisione tua, non tecnica.** Io non posso dirti se
conviene: dipende da quanto pensi di incassare e da quanto sei disposto a
impegnarti. Un commercialista te lo dice in mezz'ora.

### 4. Cambiare quello che si vende
**Costo: rifare il prodotto. Non la consiglio.**

Si potrebbe smettere di vendere la lettera e vendere altro: un abbonamento
all'Osservatorio, strumenti per chi viaggia spesso, spazi pubblicitari.
Ma il valore di Rivolio è la lettera: è quello che la gente vuole quando
scopre che le devono 400 euro. Cambiare per far contento un incassatore
significa buttare il prodotto e tenere il tubo.

⚠️ **E soprattutto: rinominare la stessa cosa non funziona.** Chiamarla
"generatore di documenti" e vendere esattamente quello che vendiamo oggi
è la strada che porta ai soldi bloccati, non ai soldi incassati.

---

## Quello che intanto NON si ferma

Il prodotto è finito e funziona. Il check è gratuito e non ha bisogno di
nessun incasso: continua a girare, a portare traffico, a raccogliere
iscritti all'Osservatorio e a costruire il posizionamento del blog. Il
giorno che l'incasso si sblocca, si accende un link e si vende.

Quindi la coda di lavoro non cambia: dominio, email, distribuzione.

---

## Il testo da mandare a Polar

```
Hi Sabina,

I completed the onboarding flow and the automated review returned "Use case not supported", classifying Rivolio as a travel claims / claim-assistance product with chargeback and regulatory risk. I would like to ask for a human review, because I believe three material facts are not visible to the automated classifier.

1. We do not handle claims and we never touch the customer's money. The compensation is paid by the airline directly to the passenger. We never receive, hold, or forward it. Our only revenue is the one-time price of a document.

2. There is no human service of any kind. The customer buys a generated document, in the same way one buys a contract template. No case handling, no representation, no legal advice, no ongoing relationship.

3. The guarantee is our own refund policy, and it exists to reduce disputes, not to create them. If the airline refuses without valid grounds or does not reply within the legal deadlines, we refund the purchase ourselves, before the customer has any reason to contact their bank. It is not an insurance product and we underwrite no risk.

If the classification still stands after a human review, I would appreciate knowing whether a different product structure would be acceptable, so that I do not build on the wrong assumption.

Thank you,
Valerio
```

---

## La decisione dell'11/08: il check si paga

Valerio ha deciso, dopo il conto qui sotto: **il check non resta
gratuito**. Cancello all'ingresso, **1,99** come prezzo di lancio, e il
totale del percorso **resta 14,90**, perché i 1,99 si scalano dalla
pratica. Il check a pagamento non è un rincaro: è un anticipo.

### Il conto che ha portato alla decisione

**Cosa costa oggi il check gratuito.** Non è un costo per chiamata, è un
abbonamento: AeroDataBox va da 5,35 a 160 dollari al mese secondo il
piano, e la nostra cache fa sì che un volo con 180 passeggeri costi UNA
chiamata. Anche 10.000 check stanno dentro il piano più caro: circa 145
euro al mese, cioè **1,4 centesimi a check**. Netlify e Supabase a quei
volumi sono ancora gratis.

**Cosa può portare il check a pagamento.** Su 10.000 analisi:
- se paga il 50% (la stima di Valerio): circa 6.950 euro netti, molto
  più dei 2.980 delle sole pratiche di oggi;
- se paga il 5-10% (la stima prudente): 700-1.400 euro, cioè meno di
  adesso, perché si perdono anche le pratiche di chi non entra.

La differenza sta in un numero che nessuno conosce, e che **si misura**.

### I tre rischi, scritti prima di partire

1. **I concorrenti danno il check gratis.** AirHelp e Flightright lo
   fanno gratuito e stanno a un clic di distanza. Il cancello va
   giustificato da qualcosa che loro non danno.
2. **Il finto sconto è illegale.** La direttiva Omnibus vuole che il
   prezzo barrato sia il più basso praticato nei 30 giorni precedenti.
   Per questo il testo dice "1,99 adesso, poi 4,99": è una promessa sul
   futuro, ed è lecita **a patto di mantenerla**.
3. **Le commissioni sui micro-importi.** Una tariffa tipo 5% + 50
   centesimi su 1,99 lascia 1,39: il 30% se ne va. Sotto i 2 euro
   conviene solo con un venditore adatto, oppure vendendo pacchetti.

### Com'è costruito (e perché è spento)

- `lib/check/ingresso.ts`: prezzi, posti di lancio, e l'interruttore
  `NEXT_PUBLIC_CHECK_PREZZO_ATTIVO`. **Senza quella variabile non cambia niente per
  nessuno.**
- `lib/check/pass.ts`: la ricevuta firmata che apre il cancello. Niente
  account, niente password: un cookie firmato, come i link delle email.
- Il controllo sta sul **server**, dentro `/api/verifica`. Un muro che
  vive solo nel browser lo scavalca chiunque, e ogni check scavalcato è
  una chiamata che paghiamo noi.
- **Un verdetto incerto non consuma il credito.** Chi paga per sapere e
  si sente rispondere "non lo so" non ha comprato una risposta: tenergli
  i soldi è la strada più breve per una contestazione sulla carta, che è
  poi il motivo per cui un venditore guarda storto questo prodotto.

### Cosa manca prima di poterlo accendere

1. Un venditore che incassi (è tutto il resto di questo documento).
2. Il muro visibile col prezzo, e il conteggio vero dei posti rimasti.
3. La rinuncia al recesso in un tocco: per un contenuto digitale
   consegnato subito serve, ma su 1,99 non può essere un modulo.
