# DECISIONI — MicroStay Alert

Una riga per scelta chiusa: **cosa**, **perché**, **quando**.
Se una cosa è qui, non si ridiscute. Se cambia, si aggiunge una riga nuova
con la data e si marca la vecchia `[SUPERATA]`.

| Data | Decisione | Perché |
|---|---|---|
| 2026-08-06 | Struttura repo a 4 file (CLAUDE.md / STATO.md / SPEC.md / DECISIONI.md) + `.claude/` | Contesto pulito: solo CLAUDE.md e STATO.md caricati sempre, il resto letto su richiesta |
| 2026-08-06 | Nessuno stack scelto prima della spec approvata | Scegliere la tecnologia prima di sapere cosa si costruisce fa buttare lavoro |
| 2026-08-06 | **Web app, non app nativa** (iOS/Android) | Apple chiede €99/anno + In-App Purchase obbligatorio sugli abbonamenti digitali (15-30% di commissione); Google Play $25 + review. Con Stripe su web la commissione è ~1,5% + €0,25. Un alert non ha bisogno di un'app: email/Telegram/push arrivano lo stesso. La web app è online in giornata a €0. Reversibile: l'app nativa si aggiunge dopo, quando gli abbonati la pagano |
| 2026-08-06 | **Ingestione offerte = innesto sostituibile** (`source` adapter) | La scelta della fonte prezzi è rimandata (Valerio, 06/08). Il resto del prodotto non deve dipenderne: le offerte entrano in una tabella `offerte` con un campo `fonte`, e ogni fonte è un modulo separato che si può aggiungere o togliere senza toccare il motore di match né gli alert |
| 2026-08-06 | **Nome: `Viaggio Anche Io`**, per esteso ovunque | Scelto da Valerio. Nasce dal dato di partenza: 40 milioni di italiani non partono ad agosto — "anche io" è la rivendicazione di chi ci va lo stesso, col suo budget. Avevo obiettato sulla lunghezza (14 lettere) e proposto il marchio corto `Anche Io` + payoff: **Valerio ha confermato la forma estesa. Chiuso.** |
| 2026-08-06 | **Tono: amico diretto, si dà del tu** | Pubblico 25-45 che arriva dai social. Voce: *"Dimmi da dove parti e quanto vuoi spendere. Al resto ci penso io."* Frasi corte, zero gergo, zero superlativi pubblicitari |
| 2026-08-06 | **Tutta Italia dal giorno 1**, partenza per comune/CAP e non da un menù di città | Deciso da Valerio. Non costa quanto sembra: un'offerta è un punto sulla mappa, non appartiene a una città — un agriturismo in Toscana serve chi parte da Milano, Bologna, Firenze e Roma insieme. In più le iscrizioni dicono dove sta davvero la domanda. **Buco noto: le isole** (vedi SPEC §9) |
| 2026-08-06 | **Pricing: crediti. 1 credito = 1 alert ricevuto.** 5/€3,99 · 20/€12,99 · 50/€24,99. Nessun abbonamento | Deciso da Valerio. Avevo obiettato due cose — l'incentivo si inverte (guadagni mandandone di più, l'utente ne vuole meno e migliori) e l'utente non sa quanto spenderà — e avevo proposto di vendere la "caccia da 30 giorni". **Valerio ha scelto i crediti avendo le obiezioni sotto gli occhi. Chiuso, si implementa così.** Mitigazione concordata dentro il suo modello: **tetto di alert/settimana scelto dall'utente** |
| 2026-08-06 | 3 crediti gratis all'iscrizione; i crediti non scadono | *Decisione mia, reversibile (è un numero nel DB).* Provare con alert veri è il modo migliore di convertire su un modello a consumo, e una scadenza fa sentire l'utente fregato |
| 2026-08-06 | **Netlify, non Vercel** | Verificato: il piano gratuito Netlify **permette l'uso commerciale** (SaaS a pagamento dentro i 300 crediti/mese); Vercel Hobby lo **vieta** nei Termini e obbliga a Pro a $20/mese appena incassi. Valerio ha già l'account. Risparmio: $240/anno |
| 2026-08-06 | **Si costruisce la landing page per prima**, prima del motore | Deciso da Valerio. Va online e raccoglie iscritti mentre il resto è in costruzione: puoi iniziare i video al giorno 2 invece che al giorno 7. Riferimento visivo dato da Valerio: stile Monex — fondo chiaro, accento verde menta, titoli grandi, angoli arrotondati, mockup telefono con card che fluttuano, CTA a pillola |

| 2026-08-06 | **Obiettivo: cassa entro ottobre 2026**, non prodotto perenne | Valerio punta a €30-100k in ~8 settimane e poi mette in pausa fino all'anno prossimo. Ogni scelta si giudica su "avvicina il primo pagante?" — niente architettura per scalare a milioni |
| 2026-08-06 | **Web app installabile (PWA), niente App Store** | Apple: €99/anno + 15-30% di commissione sugli abbonamenti digitali + revisione di giorni o settimane. Con 8 settimane di tempo è insostenibile. Le notifiche arrivano su Telegram, che è già un'app installata: la sensazione di "app vera" si ha lo stesso |
| 2026-08-06 | **Landing e app sono lo stesso progetto**: `/` pubblica, `/app` dietro login | Un solo dominio, un solo codice, uno stile solo. Serve in più: Supabase Auth + RLS (regole a livello di database, così un bug nel codice non può esporre i dati di un altro utente) |
| 2026-08-06 | **Pagamenti: Polar (Merchant of Record), non Stripe** | Valerio **non ha ancora la partita IVA**. Polar diventa il venditore legale, incassa a nome proprio, gestisce l'IVA europea e gira il netto. ⚠️ NON risolve come ricevere legalmente il denaro in Italia: serve comunque un commercialista |
| 2026-08-06 | **Prezzi confermati: 5/€3,99 · 20/€12,99 · 50/€24,99** | Gli ho mostrato il conto (con ordine medio ~€10 servono ~3.000 clienti per €30k, cioè ~1.070 iscritti al giorno per 8 settimane) e ho proposto una scala più alta. **Valerio ha scelto di restare così avendo i numeri sotto gli occhi. Chiuso: non si riapre** |
| 2026-08-06 | **Marchio bianco + verde.** Logo di Valerio da rifare semplificato e in verde; tagline sua tenuta: *"La tua fuga, al prezzo giusto"* | Il logo originale (oro + blu notte, emblema dettagliato) ha due problemi: illeggibile a 24-32px, che è dove si vedrà quasi sempre (favicon, avatar Telegram, icona home), e la palette oro/blu comunica lusso — l'opposto di quello che si vende |
| 2026-08-06 | **Framer non esporta codice**: la landing si ricostruisce in Next.js dal template | Framer genera un albero di componenti proprietario che gira solo sulla loro infrastruttura. Il plugin ufficiale di export costa $50/mese (personale) o $250/mese (commerciale). Valerio manda il link del template pubblicato e lo rifaccio in codice |
| 2026-08-06 | **shadcn/ui per l'area riservata**, non per la landing | Componenti già accessibili e testati per menu, finestre, form: giorni risparmiati. La landing resta su misura perché è lì che il marchio si vede |

## Vincoli esterni VERIFICATI — non riaprire, non ricercare di nuovo
Verificato il 2026-08-06. Se serve rimetterlo in discussione, prima rileggi qui.

- **Booking.com Demand API** — domande di connettività *sospese* per aggiornamento T&C; e le regole d'uso vietano l'impiego dei contenuti Booking in *comparatori di prezzo*. Non è una strada.
- **Amadeus Self-Service** — il piano gratuito è in dismissione, chiavi esistenti disattivate a metà 2026. Nessun equivalente free.
- **Travelpayouts / Hotellook cache API** — **spenta.** Test diretto: `engine.hotellook.com/api/v2/cache.json` e `/lookup.json` → HTTP 404 su ogni rotta; `hotellook.com` non risponde (HTTP 000).
- **Travelpayouts Hotel Search API** — richiede approvazione via email *e* impone che ogni ricerca sia avviata da un utente in tempo reale. Incompatibile con uno scanner in background.
- **SerpAPI (Google Hotels)** — funziona, nessuna approvazione. $25/mese per 1.000 ricerche, $75 per 5.000, $150 per 15.000. Tetto di throughput: 20% del volume mensile per ora.
- **Trenitalia / Italo** — **nessuna API pubblica ufficiale.** Solo librerie non ufficiali da reverse engineering, che gli autori dichiarano instabili. Non reggono una promessa di prezzo.
- **iOS e notifiche push web** — un sito normale NON può notificare un iPhone. Servono le PWA aggiunte alla schermata Home (da iOS 16.4, ancora vero nel 2026, su tutti i browser perché Apple impone WebKit). Su Android basta un tap. Per questo Telegram è il canale principale: è già un'app con i permessi di notifica.
- **Prezzo carburante** — dato pubblico dell'Osservatorio MIMIT, aggiornato ogni settimana. Il 06/08/2026: benzina self **€1,994/l** (rete stradale), €2,072/l in autostrada. **Da leggere dalla fonte, mai scritto fisso nel codice.**
- **`.claude/verify.cmd` NON è uno script batch**, nonostante l'estensione. L'hook `verify-gate.js` legge il file, prende la **prima riga non commentata** e la passa a `powershell.exe -Command`. Quindi contiene UNA riga sola. La logica vera sta in `.claude/verify.ps1`. Sbagliato una volta il 06/08 (scritto come `.cmd` batch → PowerShell non sa leggere `@echo off`).

## Chiuse il 06/08 — secondo giro

| Decisione | Perché |
|---|---|
| **Web app ora, store dopo il primo incasso.** Scelta di Valerio. | Apple: 99€/anno, 15-30% su ogni credito venduto, più una revisione che su uno sprint di 8 settimane può costarne 2. Il pacchetto per gli store (Capacitor) entra in FASE 3, dopo che l'incasso esiste. Nel frattempo il manifest la rende installabile sulla schermata Home: sul telefono è indistinguibile da un'app scaricata. |
| **Accesso: email+password come strada principale, link magico come alternativa.** | La password funziona a ogni accesso senza dipendere dalla consegna di un'email. Con la posta interna di Supabase limitata a 2 email l'ora, un login basato solo sul link magico si sarebbe piantato al terzo utente. |
| **I pulsanti principali della landing portano a registrarsi, non alla lista d'attesa.** | La lista d'attesa aveva senso quando non esisteva il prodotto. Ora esiste: mandare la gente su un modulo email invece che dentro l'app butta via l'unica cosa che convince, cioè provarla. Il modulo resta in fondo per chi non vuole ancora un account. |
| **`shadcn init` non si lancia su questo progetto.** | Riscrive `globals.css` con i suoi token e cancella il sistema di colori costruito sul verde. I componenti si copiano a mano: è lo stesso codice, senza il danno. |
| **Nessun testo di Supabase arriva all'utente così com'è.** | Risponde in inglese. Un messaggio inglese in mezzo a un prodotto italiano fa sembrare tutto un giocattolo. Quello che non riconosciamo diventa generico e finisce nei log. |

## Da rivedere quando ci sarà il dominio
- **`mailer_autoconfirm` acceso** (conferma email spenta) è una toppa, non una scelta.
  Motivo: la posta interna di Supabase manda **2 email l'ora**, quindi con la
  conferma accesa il terzo iscritto della giornata non entra. Si riaccende
  appena Resend è verificato sul dominio e collegato come SMTP.
- `site_url` è ancora `http://localhost:3000` e `uri_allow_list` è vuota: i link
  nelle email punteranno al posto sbagliato finché non si cambiano.

## Decisioni ancora aperte
Vivono in `SPEC.md` → "Domande aperte". Appena chiuse, scendono qui.
- Fonte prezzi offerte — **rimandata volontariamente** a fine progetto.
