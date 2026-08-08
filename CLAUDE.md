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
*Io segnalo i reset del contesto: Valerio non se ne accorge da solo.*

0. **Metodo:** batch di TUTTI i fix, poi UN solo verify alla fine (mai
   fix → verify → fix → verify: raddoppia i tempi morti). Per trovare
   un punto nel codice: `rg`, non leggere file interi. Schermate solo
   alla consegna, non a ogni ritocco.
1. Dopo ogni task completato E verificato E committato, chiudo la
   risposta con esattamente:
   --- CHECKPOINT: task chiuso. Consigliato /clear. Prossimo task? ---
2. Se Valerio chiede qualcosa che non c'entra col task corrente (file
   diversi, layer diverso, feature diversa), NON inizio. Rispondo solo:
   "Questo è un task nuovo. /clear prima, poi ripeti la richiesta."
3. Se noto uno di questi sintomi, mi fermo e lo segnalo:
   - sto per rileggere un file già letto in questa sessione
   - sto riproponendo un approccio già scartato
   - sto richiedendo un'informazione già data
   - un fix richiede più di 3 tentativi
   Output: --- SINTOMO DEGRADO: [quale]. Consigliato /compact ---
4. Prima di ogni /clear che consiglio, aggiorno HANDOFF.md con: stato
   attuale, decisioni prese, file toccati, cosa resta da fare. Poi
   dico che l'ho scritto.
5. Distinzione: /compact <focus> = stesso task, sessione lunga, la
   storia serve ancora. /clear = task chiuso o pivot totale.
6. Un task = una unità committabile. "Costruire la SaaS" NON è un
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
