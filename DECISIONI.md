# DECISIONI — MicroStay Alert

Una riga per scelta chiusa: **cosa**, **perché**, **quando**.
Se una cosa è qui, non si ridiscute. Se cambia, si aggiunge una riga nuova
con la data e si marca la vecchia `[SUPERATA]`.

| Data | Decisione | Perché |
|---|---|---|
| 2026-08-06 | Struttura repo a 4 file (CLAUDE.md / STATO.md / SPEC.md / DECISIONI.md) + `.claude/` | Contesto pulito: solo CLAUDE.md e STATO.md caricati sempre, il resto letto su richiesta |
| 2026-08-06 | Nessuno stack scelto prima della spec approvata | Scegliere la tecnologia prima di sapere cosa si costruisce fa buttare lavoro |
| 2026-08-06 | **Web app, non app nativa** (iOS/Android) | Apple chiede €99/anno + In-App Purchase obbligatorio sugli abbonamenti digitali (15-30% di commissione); Google Play $25 + review. Con Stripe su web la commissione è ~1,5% + €0,25. Un alert non ha bisogno di un'app: email/Telegram/push arrivano lo stesso. La web app è online in giornata a €0. Reversibile: l'app nativa si aggiunge dopo, quando gli abbonati la pagano |
| 2026-08-06 | **Ingestione offerte = innesto sostituibile** (`source` adapter) | La scelta della fonte prezzi è rimandata (Valerio, 06/08). Il resto del prodotto non deve dipenderne: le offerte entrano in una tabella `deals` con un campo `source`, e ogni fonte è un modulo separato che si può aggiungere o togliere senza toccare il motore di match né gli alert |

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

## Decisioni ancora aperte
Vivono in `SPEC.md` → "Domande aperte". Appena chiuse, scendono qui.
- Fonte prezzi offerte — **rimandata volontariamente** a fine progetto.
