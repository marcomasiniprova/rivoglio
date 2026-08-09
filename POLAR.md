# Polar: come funziona e cosa devi fare

*Ricerca fatta l'8/08/2026. Le pagine ufficiali `polar.sh` e
`docs.polar.sh` sono bloccate dalla rete di questa sandbox: quello che
c'è qui sotto viene dai risultati di ricerca che le citano e da recensioni
del 2026. **Ogni numero va riconfermato dal tuo PC**, dove quelle pagine
si aprono. Le fonti sono in fondo.*

---

## In una riga

Polar incassa al posto tuo. Il cliente compra da Polar, non da te; Polar
si prende l'IVA europea e la versa lui; poi ti gira il netto sul conto.
Si chiama *merchant of record*, cioè "il venditore ufficiale è lui". È
per questo che l'abbiamo scelto: senza partita IVA non potresti emettere
fatture ai clienti, e così non devi.

---

## ⚠️ LA COSA DA VERIFICARE PRIMA DI TUTTO

Polar **non accetta i "servizi umani"**. Nella loro politica d'uso
c'è scritto che marketing, design, sviluppo web e **consulenza in
generale** non sono ammessi: accettano prodotti digitali e software che
si consegnano da soli, subito, in automatico.

Rivolio sta dalla parte giusta **se lo presenti per quello che è**: un
software che incrocia i dati del volo e genera la lettera di reclamo, e
te la consegna subito. Non è una consulenza, non siamo intermediari, il
reclamo lo mandi tu. Questo è già scritto sul sito, ed è vero.

Ma è una cosa che **decide un revisore leggendo il tuo sito**, e sbagliare
qui non costa poco: la verifica arriva *prima del primo bonifico*, quindi
potresti incassare per settimane e poi non poter ritirare niente.

**Cosa fare, in concreto:** prima di costruirci sopra, scrivi al supporto
di Polar e fatti dire di sì per iscritto. Testo pronto da incollare
(in inglese, che è la lingua del loro supporto):

> Hi, before I set up my products I want to be sure my use case fits your
> Acceptable Use Policy. My service is a software tool for EU flight
> compensation (Regulation EC 261/2004). It checks flight data
> automatically against a deterministic rules engine and generates a
> ready-to-send claim letter, delivered instantly on my website. I am not
> a claims agency and not an intermediary: the customer sends the letter
> themselves and the airline pays them directly. There is no human
> consulting involved. Is this acceptable on Polar?

Se rispondono di no, le alternative dello stesso tipo sono Paddle e Dodo
Payments. Non cambia niente nel nostro codice: cambia solo il link di
pagamento.

---

## Quanto costa (agosto 2026)

- **Le organizzazioni create dal 27 maggio 2026 in poi partono dal piano
  Starter: 5% + 50 centesimi per transazione.** La tua sarà nuova, quindi
  è questa la tariffa che ti riguarda.
- La vecchia tariffa "Early Member" (4% + 40 centesimi) vale solo per chi
  aveva già l'account prima di quella data, e si perde per sempre se si
  passa a un piano a pagamento.
- **Sul bonifico:** 2 dollari al mese (solo nei mesi in cui ritiri) più
  0,25% e 25 centesimi per prelievo. Sono commissioni di Stripe, Polar
  non ci guadagna sopra.

**Cosa vuol dire sui nostri prezzi.** Su una pratica da 14,90€ te ne
restano circa **13,60€** (5% sono 0,75€, più 0,50 di quota fissa). Sulla
famiglia da 24,90€ ne restano circa **23,15€**. Sono conti miei sui
numeri qui sopra, non un preventivo di Polar: ricontrollali sulla loro
pagina prezzi.

---

## Perché due settimane

Non è burocrazia inventata, è una verifica antifrode, e funziona così:

1. **Apri l'account e vendi subito.** Non devi aspettare niente per
   incassare: i pagamenti funzionano dal primo giorno.
2. **La verifica scatta prima del primo bonifico**, e la chiedi tu dal
   pannello (Finance → Account). Serve a Polar per sapere chi sei e cosa
   vendi davvero, perché il venditore ufficiale è lui: se tu vendi
   qualcosa di irregolare, la responsabilità è sua.
3. **Ci mettono fino a 14 giorni**, dipende da quante ne hanno in coda,
   dai fine settimana e dalle feste. Chi l'ha fatto racconta circa due
   settimane.
4. **Nel frattempo le vendite continuano.** Il cliente non si accorge di
   niente. Quello che resta fermo è solo il tuo prelievo, segnato
   "Held for review", che parte da solo appena approvano.

Poi ci sono verifiche successive automatiche a certe soglie di vendite:
quelle di solito non chiedono niente, guardano solo che tu stia vendendo
la stessa cosa che avevi dichiarato e che i rimborsi e le contestazioni
siano sotto controllo (le carte considerano eccessive le contestazioni
sopra lo 0,7% delle vendite).

**Come farla andare veloce.** Polar dice che una verifica è rapida quando
trova tutto già pronto: prodotti configurati, pagamento collegato al sito,
e un sito vero e online che si può guardare. Noi siamo messi bene: il
sito è online, il check funziona, le pagine legali ci sono.

**Una cosa da non fare mai:** provare l'acquisto con una carta vera per
"vedere se funziona". I circuiti lo leggono come *card testing* e ti
aprono una verifica addosso. Per le prove si usa la modalità sandbox di
Polar.

---

## Cosa serve a Stripe per pagarti

Il bonifico non lo fa Polar direttamente: lo fa Stripe, con un account
"Express" che apri dentro il flusso di Polar. L'Italia è supportata e si
può aprire come **persona fisica**, non serve per forza una società.

Ti chiederà: documento d'identità, codice fiscale, indirizzo, e l'IBAN
su cui vuoi i soldi. Se dichiari di avere partita IVA può chiederti anche
i dati camerali (RI/REA), quindi non dichiararla se non ce l'hai.

**Il pezzo su cui non posso rispondere io:** se puoi incassare da persona
fisica senza aprire partita IVA, e fino a quale cifra. Dipende da quanto
incassi e da come lo qualifichi (occasionale o abituale). È una domanda
da **commercialista**, ed è già nella lista delle cose da fare. Non
inventarti una risposta e non fartela dare da me.

---

## La procedura, passo per passo

**1. Crea l'account e l'organizzazione**
Vai su polar.sh, registrati, crea l'organizzazione. Chiamala `rivolio`.

**2. Attiva la sandbox e provaci dentro**
Polar ha un ambiente di prova separato (sandbox.polar.sh). Le carte
finte funzionano lì. Tutto quello che segue lo fai prima lì, poi in
produzione.

**3. Crea i due prodotti**
- **Pratica** · pagamento singolo · **14,90 €**
  Descrizione: la lettera di reclamo pronta per un passeggero, i
  documenti a supporto e la sequenza di promemoria.
- **Famiglia** · pagamento singolo · **24,90 €**
  Stessa cosa fino a 4 passeggeri sullo stesso volo.

Nella descrizione usa parole da prodotto digitale: "documento generato
automaticamente", "disponibile subito dopo il pagamento". Mai "ci
occupiamo noi del tuo reclamo", mai "assistenza legale": quelle parole
ti fanno finire nella casella "consulenza", che è vietata.

**4. Prendi i due link di pagamento**
Su ogni prodotto c'è "Checkout link" (o "Share"). Copiali. Sono due
indirizzi che iniziano per `https://buy.polar.sh/...`.

**5. Crea il webhook**
Settings → Webhooks → Add endpoint.
- Indirizzo: `https://rivoglio.netlify.app/api/polar/webhook`
- Eventi: almeno `order.paid` (e `checkout.updated` se te lo propone).
- Formato: **Raw** (non Discord, non Slack).
Alla fine ti mostra un **segreto** che inizia per `polar_whs_...`:
copialo subito, dopo non si rivede più.

**6. Mandami tre cose**
1. il link di pagamento della **pratica**;
2. il link di pagamento della **famiglia**;
3. il **segreto del webhook**.

Poi le metto su Netlify con questi nomi (il codice le cerca già):
`POLAR_CHECKOUT_PRATICA`, `POLAR_CHECKOUT_FAMIGLIA`,
`POLAR_WEBHOOK_SECRET`.

⚠️ Il segreto **non va scritto qui né in nessun file del progetto**:
me lo mandi e basta, lo metto solo fra le variabili di Netlify.

**7. Chiedi la verifica**
Pannello → Finance → Account → invii la richiesta e colleghi Stripe. Da
lì partono i massimo 14 giorni. **Fallo subito**, non quando arriva il
primo cliente: è tempo che scorre in parallelo mentre finiamo il resto.

---

## Fonti

- [Account reviews — Polar](https://polar.sh/docs/merchant-of-record/account-reviews)
- [Acceptable use — Polar](https://polar.sh/docs/merchant-of-record/acceptable-use)
- [Acceptable Use Policy — Polar](https://polar.sh/legal/acceptable-use-policy)
- [Fees — Polar](https://polar.sh/docs/merchant-of-record/fees)
- [Supported countries — Polar](https://polar.sh/docs/merchant-of-record/supported-countries)
- [Polar.sh Review 2026 (Fungies)](https://fungies.io/polar-sh-review-2026/)
- [Polar.sh Review 2026 (Dodo Payments)](https://dodopayments.com/blogs/polar-sh-review)
- [Payout accounts — Polar](https://polar.sh/docs/features/finance/accounts)
- [Stripe: e-invoicing e IVA in Italia](https://support.stripe.com/questions/faq-vat-e-invoicing-requirements-in-italy)
