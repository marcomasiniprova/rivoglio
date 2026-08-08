@STATO.md

# Rivoglio — regole di progetto

## Cos'è e qual è l'obiettivo
**Rivoglio è lo scanner dei rimborsi aerei (Reg. CE 261/2004)**, definito
dal documento di Valerio del 07/08 e COSTRUITO: check gratuito sul web,
verdetto a tre stati dal motore deterministico (l'AI non decide MAI),
pratica 14,90 / famiglia 24,90 con Polar, lettera pronta che l'utente
invia da sé (non siamo intermediari), garanzia 90 giorni, admin in shadow
mode. Online: **rivoglio.netlify.app**. L'idea viaggi è morta il 07/08.
**Obiettivo di Valerio: fare cassa entro ottobre 2026.** Ogni scelta si
giudica così: avvicina il primo utente pagante?
Mappa: `PIANO.md`. Arretrati: `ARRETRATI.md`. Cosa costruiamo: `SPEC.md`.
Scelte chiuse: `DECISIONI.md`. Marchio: `BRAND.md`. Social: `CONTENUTI.md`.

## Come devi lavorare — questa parte è la più importante
- **A OGNI prompt di Valerio: 4 domande col popup** (regola sua, 8/08,
  "ogni mio prompt"). Prima di costruire, AskUserQuestion con 4 domande
  sulle decisioni VERE di quel giro: opzioni concrete, la consigliata
  marcata, mai domande di riempimento. Se il giro ha meno di 4 decisioni
  vere, le restanti si usano per scelte di prodotto che prima o poi
  andranno prese comunque.
- **Consegna a pezzi, non in blocco.** Se la richiesta contiene più cose, fai la
  prima, dilla, e continua con la successiva senza fermarti ad aspettare. Non
  accumulare dieci lavori in un turno solo: Valerio resta mezz'ora davanti allo
  schermo senza vedere niente. Il lavoro va avanti lo stesso, ma lui lo vede
  crescere e può correggerti al primo pezzo invece che all'ultimo.
- **Niente fumo.** Ogni turno produce qualcosa che si vede e che è provato.
  Zero riassunti di quello che stai per fare: fallo e poi dillo.
- **Aggiornalo su dove siamo.** A ogni consegna: cosa è fatto, cosa manca, qual
  è il prossimo pezzo. Non lasciarlo indovinare.
- **Zero lavoro inutile.** Niente ricerche che non cambiano una decisione,
  niente metriche che non servono a spedire.
- **Copia i migliori.** Prima di inventare guarda i concorrenti e le app grandi.
- **Trattalo come se fosse tuo**, non come un compito da consegnare.

## PROTOCOLLO CONTESTO
*Io segnalo i reset del contesto: Valerio non se ne accorge da solo.
Checkpoint, task nuovo, degrado e HANDOFF stanno nel "Protocollo
operativo" in fondo: lì una volta sola, qui niente doppioni.*

1. **Metodo:** batch di TUTTI i fix, poi UN solo verify alla fine (mai
   fix → verify → fix → verify: raddoppia i tempi morti). Per trovare
   un punto nel codice: `rg`, non leggere file interi. Schermate solo
   alla consegna, non a ogni ritocco.
2. Distinzione: /compact <focus> = stesso task, sessione lunga, la
   storia serve ancora. /clear = task chiuso o pivot totale.
3. Un task = una unità committabile. "Costruire la SaaS" NON è un
   task. "Fixare il salvataggio iscritti" è un task.

## Le 6 regole
1. **Prova o non è fatto.** Output reale: comando rieseguito o schermata
   guardata. `npm run verify` deve passare prima di dire finito.
2. **Niente numeri inventati.** Fonte reale citata, o scritto "stima".
3. **Niente dati finti che sembrano veri.** Un'offerta non verificata va marcata
   `demo` nel DB e nell'interfaccia. Mai in produzione.
4. **Modifica solo il pezzo richiesto.** Zero refactoring non chiesti.
5. **Segreti solo in `.env.local`.** Mai in un file tracciato.
6. **Fine sessione:** aggiorna `STATO.md`, `PIANO.md` e `ARRETRATI.md`, verify,
   committa.

## Come parlare a Valerio (regola sua, 8/08)
Valerio NON è tecnico e non deve diventarlo. Quindi:
- **Zero gergo senza traduzione.** Se serve una parola tecnica, spiegala
  in mezza riga con un paragone concreto.
- **I comandi si danno uno alla volta**, in un riquadro, col percorso già
  giusto: mai segnaposto tipo `C:\percorso\della\cartella`. E si dice
  sempre dove si incolla (PowerShell) e cosa deve succedere dopo.
- **Prima cosa succede, poi perché.** Il risultato in cima, la spiegazione
  sotto, e solo se serve.
- Quando qualcosa non si può fare sul suo PC (Windows), dirlo subito e
  dare l'alternativa che funziona, non la teoria.

## PENSA PER L'UTENTE MEDIO (regola di Valerio, 8/08)
Prima di costruire qualsiasi cosa, mettiti nei panni di **dieci persone
normali** che aprono Rivoglio per la prima volta. Non sanno cos'è un
numero di volo, non hanno il biglietto sottomano, non leggono le
istruzioni. Le domande da farsi, ogni volta:
- **Questa informazione l'utente ce l'ha?** Se per rispondere deve
  cercare un'email o rovistare in casa, la domanda è sbagliata: si
  cambia la domanda, non si aggiunge una guida.
- **Si capisce in tre secondi?** Vale per notifiche, titoli, bottoni.
  "FR4001" è un codice da pilota: la gente pensa "Bergamo-Lanzarote".
  Parla di città e di orari, non di codici e di articoli di legge.
- **Cosa succede se sbaglia?** Ogni campo deve perdonare: maiuscole,
  spazi, formati diversi.
Un aiuto ("come trovo il numero?") è l'ultima spiaggia, non la
soluzione: prima si toglie l'ostacolo.

## Come si scrive (ogni parola che vede l'utente)
Dai del tu, ma **professionale, non da amici al bar**. Frasi corte, zero gergo,
zero superlativi. **MAI il trattino lungo (—): è il segno più riconoscibile del
testo scritto da un'AI.** Usa punti e virgole. Ogni numero mostrato dev'essere
apribile: **la trasparenza è il prodotto.** Marchio per esteso: Rivoglio.
Tagline: *Riprenditi i soldi che ti devono.*

## Come si costruisce l'interfaccia (regole d'oro dell'8/08)
- **Skill `art-director` SEMPRE** per ogni superficie visiva; con
  un'immagine di riferimento allegata è OBBLIGATORIA, fase per fase
  (intervista → scomposizione → asset → piano → una sezione → giro visivo).
- **Regola d'oro:** se l'effetto richiede realismo (luce, materiali,
  profondità) è un **ASSET**; se richiede orchestrazione (timing,
  sequenza, reazione) è **CODICE**.
- **Le hero belle sono immagini, non codice.** Procura gli asset prima:
  senza asset non si arriva al livello dei riferimenti, mai.
- **Una sezione per volta.** "Fammi la landing" in un colpo produce slop.
- **Gli occhi:** UN giro in batch alla consegna: schermate Playwright
  (1440 e 390), elenco dei difetti, fix tutti insieme, UNA controprova.
  Le sezioni whileInView vanno scrollate piano e attese 2s prima dello
  scatto.
- Vietati i pattern slop: la lista è nella skill, vale sempre.

## ASSET
Per generare immagini usa `scripts/gen-asset.ts` (`npm run asset`):
Gemini per le scene, `--unsplash` per le foto reali. Chiavi
GEMINI_API_KEY e UNSPLASH_ACCESS_KEY in `.env.development.local`
(qui `.env.local` è rotto, vedi STATO). Output sempre in
`/public/assets/`, WebP, max 1MB. **Prima di generare, mostra il prompt
a Valerio e aspetta l'ok.**

## Stack (fissato)
Next 16 + React 19 + Tailwind 4 + **Motion** su **Netlify** · **Supabase** ·
**Polar** (Valerio non ha partita IVA) · Resend · Telegram Bot API ·
dati ISTAT e MIMIT. Funzioni Netlify: 10 secondi → il matcher va a lotti.

## Confini — chiedi PRIMA
Spendere soldi · comprare domini · installare software di sistema · pubblicare
online · qualsiasi cosa irreversibile. Tutto il resto: fai, poi riferisci.

## Protocollo operativo

- Per localizzare codice usa `rg -C 20 <pattern>` in un solo comando.
  Mai "cerca" e poi "leggi intorno" come due step separati.
  Leggi un file intero solo se devi modificarne più punti.
- Prima di un edit verifica che la stringa target sia unica nel file.
  Se un edit fallisce due volte, fermati e chiedimi.
- Non spawnare subagenti per task singoli o piccoli: costano un
  moltiplicatore di token. Solo per esplorazione ampia e indipendente.
- Non aggiungere feature, refactor o astrazioni oltre quanto richiesto.
- Dopo ogni task completato, verificato e committato, chiudi con:
  --- CHECKPOINT: task chiuso. Consigliato /clear. Prossimo task? ---
- Se ti chiedo qualcosa che non c'entra col task corrente, non iniziare.
  Rispondi: "Task nuovo. /clear prima, poi ripeti la richiesta."
- Se noti uno di questi sintomi, fermati e segnalalo:
  rileggi un file già letto in sessione / riproponi un approccio scartato /
  mi richiedi un'informazione già data / un fix supera i 3 tentativi.
  Output: "--- DEGRADO: [quale]. Consigliato /compact ---"
- Prima di ogni /clear che consigli, scrivi HANDOFF.md con:
  stato attuale, decisioni prese, file toccati, cosa resta.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
