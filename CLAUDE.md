@STATO.md

# Viaggio Anche Io — regole di progetto

## Cos'è e qual è l'obiettivo
Ti avviso quando esiste una micro-vacanza (1-3 notti, entro X ore da casa tua)
sotto il budget che decidi tu. Alloggio reale + auto calcolata. Tutta Italia.
Si paga a crediti: 1 credito = 1 alert. **Obiettivo di Valerio: fare cassa entro
ottobre 2026.** Ogni scelta si giudica così: avvicina il primo utente pagante?
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
apribile: **la trasparenza è il prodotto.** Marchio per esteso: Viaggio Anche Io.
Tagline: *La tua fuga, al prezzo giusto.*

## Stack (fissato)
Next 16 + React 19 + Tailwind 4 + **Motion** su **Netlify** · **Supabase** ·
**Polar** (Valerio non ha partita IVA) · Resend · Telegram Bot API ·
dati ISTAT e MIMIT. Funzioni Netlify: 10 secondi → il matcher va a lotti.

## Confini — chiedi PRIMA
Spendere soldi · comprare domini · installare software di sistema · pubblicare
online · qualsiasi cosa irreversibile. Tutto il resto: fai, poi riferisci.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
