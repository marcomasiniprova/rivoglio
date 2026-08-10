# Polar, dall'inizio alla fine

> # 🔴 FERMO: POLAR HA DETTO NO (10/08)
>
> Il controllo automatico dell'iscrizione ha risposto **"Use case not
> supported"**, con questa motivazione: *prodotto legato ai reclami di
> viaggio, che rientra nei servizi di viaggio soggetti a restrizione e
> nell'attività di assistenza ai reclami; il rimborso garantito e il
> percorso automatico da idoneità a reclamo aumentano il rischio di
> contestazioni sulla carta e il rischio normativo.*
>
> **Non è il testo scritto male: è la categoria.** Il testo era accurato,
> e riscriverlo più vago per farlo passare sarebbe peggio, non meglio:
> Polar è il venditore ufficiale, e quando alla verifica dei documenti
> guardano il sito vero e trovano un'altra cosa, bloccano i bonifici coi
> soldi dei clienti già dentro.
>
> Le strade vere sono in `PAGAMENTI.md`. Questo documento resta valido
> **solo se Polar cambia idea** dopo una revisione umana.

*Scritto per Valerio il 10/08. Un passo alla volta. Dove c'è un riquadro,
si copia e si incolla.*

Polar è chi incassa al posto tuo: è lui il venditore ufficiale, fa le
fatture e paga l'IVA nei paesi giusti. Serve perché non hai partita IVA.
Trattiene il 5% più 50 centesimi a vendita (tariffa per le organizzazioni
nuove, verificata in `POLAR.md`).

---

## PARTE 1. L'iscrizione, cioè quello che hai davanti adesso

### "What are you selling?"
Scegli **Digital downloads**.

Il motivo conta: Polar **vieta i servizi umani e la consulenza**. Tu non
vendi un servizio, vendi un documento generato in automatico che il
cliente scarica subito dopo il pagamento. **Non toccare "Services"**: è
la casella che ti fa bocciare.

### "Describe your product"
Incolla questo esattamente così. È il testo su cui ti valutano, quindi
ogni riga è lì per un motivo.

```
Rivolio is an automated tool for EU flight compensation (Regulation EC 261/2004).

How it works: the customer enters a flight number and date. Our deterministic rules engine compares certified flight data from a commercial aviation data provider against the Regulation and returns one of three outcomes. If the flight qualifies, the customer can buy a ready-to-send claim letter: a document generated automatically and delivered instantly on our website after payment. One-time purchase, no subscription.

What we are NOT, to be explicit: we are not a claims agency and not an intermediary. There is no human case handling, no legal advice and no consulting at any point. The customer sends the letter themselves from their own email address, the airline pays the customer directly, and we never handle or hold the customer's compensation money. Our only revenue is the one-time price of the document.

We also publish free guides and a free eligibility check, with no account required.

Guarantee: if the airline refuses without valid grounds or does not reply within the legal deadlines, we refund the purchase in full.
```

### "Pricing model"
**One-time purchase.** Non è un abbonamento: si paga una volta per pratica.

### "Currently selling on"
**Lascialo vuoto.** È facoltativo, e dire che vendi già altrove quando
non è vero apre solo domande.

### "Support Email"
```
valerio@artecai.it
```

### "Product URL"
```
https://rivoglio.netlify.app
```
Mettilo anche se non è il dominio definitivo: Polar vuole vedere un sito
vero che funziona, e quello funziona. Un campo vuoto qui rallenta la
verifica.

### Poi premi "Launch Dashboard".

---

## PARTE 2. I quattro prodotti

Sono **quattro e non due**, perché è acceso il test dei due prezzi: metà
dei visitatori vede il listino basso, metà quello alto, e dopo qualche
decina di vendite si vede quale rende di più.

Nel pannello: **Products → New product**. Per ognuno metti nome, prezzo,
e come tipo **one-time**.

| Nome del prodotto | Prezzo |
|---|---|
| `Pratica` | 14,90 € |
| `Pratica 25` | 24,90 € |
| `Pratica famiglia` | 24,90 € |
| `Pratica famiglia 40` | 39,90 € |

Descrizione, la stessa per tutti (in italiano, la legge il cliente):

```
Lettera di reclamo pronta da inviare alla compagnia aerea, ai sensi del Regolamento CE 261/2004, generata sui dati verificati del tuo volo. Compresi nel prezzo: il sollecito se la compagnia non risponde o risponde no, e la segnalazione all'ente nazionale già scritta. Il reclamo lo invii tu dalla tua email e la compensazione arriva a te intera. Se la compagnia rifiuta senza un motivo valido o non risponde nei termini di legge, ti rimborsiamo per intero.
```

Per la famiglia, aggiungi in fondo:

```
Vale per un massimo di 5 passeggeri sullo stesso volo.
```

**Poi, per ogni prodotto, apri la sua pagina e copia il "checkout link".**
Sono quattro indirizzi che cominciano per `https://buy.polar.sh/` o
`https://polar.sh/...`. Mandameli tutti e quattro, o mettili tu su
Netlify come spiegato più sotto.

---

## PARTE 3. Il collegamento col sito

Sul pannello Netlify: **Site configuration → Environment variables →
Add a variable**. Una alla volta, senza spuntare "secret" (quella spunta
sul connettore Netlify fallisce in silenzio, ci abbiamo già perso un
giro).

| Nome | Cosa ci va |
|---|---|
| `POLAR_CHECKOUT_PRATICA` | il link del prodotto **Pratica** |
| `POLAR_CHECKOUT_FAMIGLIA` | il link di **Pratica famiglia** |
| `POLAR_CHECKOUT_PRATICA_B` | il link di **Pratica 25** |
| `POLAR_CHECKOUT_FAMIGLIA_B` | il link di **Pratica famiglia 40** |
| `POLAR_WEBHOOK_SECRET` | il segreto del webhook (parte 4) |

⚠️ Se i due `_B` mancano, non si rompe niente: il sito serve il listino
basso a tutti e il test semplicemente non parte.

---

## PARTE 4. Il webhook, cioè come il sito sa che hai incassato

Senza questo, il cliente paga e la pratica non si apre. È il pezzo più
importante di tutti.

Nel pannello Polar: **Settings → Webhooks → Add endpoint**.

- **URL**: 
  ```
  https://rivoglio.netlify.app/api/polar/webhook
  ```
  (il giorno che il dominio cambia, va cambiato anche qui)
- **Format**: Raw
- **Eventi**: spunta almeno `order.paid` (o `checkout.updated` se non
  c'è: il nostro codice li gestisce tutti e due)

Polar ti mostra un **segreto**. Copialo e mettilo su Netlify come
`POLAR_WEBHOOK_SECRET`. **Non incollarlo qui né in nessun file del
progetto**: vive solo nelle variabili di Netlify.

---

## PARTE 5. La verifica dell'account. Falla SUBITO.

Nel pannello: **Finance → Account → richiedi la verifica**.

- Puoi **vendere dal primo giorno**: non devi aspettare.
- La verifica serve prima del **primo bonifico a te**, non prima delle
  vendite.
- Ci mettono **fino a 14 giorni**. Chiederla oggi invece che alla prima
  vendita ti fa risparmiare due settimane di attesa a soldi fermi.
- Nel frattempo il cliente non si accorge di niente: resta fermo solo il
  tuo prelievo, segnato "Held for review", e parte da solo appena
  approvano.

Serve anche il collegamento a **Stripe** per ricevere i soldi: te lo
chiede lui, con documento d'identità e IBAN.

---

## PARTE 6. La prova, senza farsi male

⚠️ **Non provare l'acquisto con la tua carta vera.** I circuiti lo
leggono come *card testing* e ti aprono una verifica addosso. Per le
prove c'è la **modalità sandbox** di Polar, che ha le sue carte finte.

Quando hai fatto tutto, dimmelo: faccio un giro di controllo sul sito
vero e ti dico se il collegamento risponde.

---

## Se qualcosa va storto

- **"Il cliente ha pagato ma la pratica non si è aperta"** → è il
  webhook: controlla l'indirizzo e che `POLAR_WEBHOOK_SECRET` su Netlify
  sia esattamente quello che ti ha dato Polar.
- **"Il bottone di pagamento non porta da nessuna parte"** → manca uno
  dei `POLAR_CHECKOUT_*`, oppure il link è stato incollato con uno spazio
  davanti.
- **"Mi hanno chiesto altri documenti"** → è la verifica antifrode, è
  normale: rispondi e riparte.
