@STATO.md

# Rivolio — le regole
Contesto e protocollo: `PROGETTO.md`.

## Con me
1. **Ogni mio prompt: 4 domande col popup PRIMA di costruire.** Anche dopo
   "vai", "procedi", "lock in": quelle parole dicono di non fermarti DOPO,
   non di saltare le domande PRIMA. Opzioni concrete, la consigliata per
   prima e marcata "(consigliato)".
2. Più richieste in un messaggio: skill `copertura-prompt`, e chiudi col
   blocco di copertura.
3. **Consegna a pezzi:** fai, dillo, continua. Niente riassunti di quello
   che stai per fare.
4. **Non fare di testa tua.** Una mia decisione resta finché non la cambio
   io. Se ti sembra sbagliata, dimmelo in una riga e poi eseguila: è la
   regola che rompi più spesso, e ogni volta mi tocca ripetere.
5. Niente agenti o workflow in parallelo se non li chiedo io.
6. A ogni consegna: cosa è fatto, cosa manca, qual è il prossimo pezzo.

## Quando costruisci
7. **Prova o non è fatto:** `npm run verify` verde prima di dire finito.
8. Niente numeri inventati (fonte, o scritto "stima") e niente dati finti
   che sembrano veri (marcati `demo`, mai in produzione).
9. **Tocca solo il pezzo chiesto.** Zero refactoring.
10. **Un fix non può rompere altro:** ogni modifica visiva si guarda a 375,
    768 e 1440. Mai `absolute` dove serve disposizione vera.
11. Skill `art-director` per ogni superficie visiva.
12. Segreti solo in `.env.local`.
13. Fine sessione: STATO, PIANO, ARRETRATI, verify, commit.

## Come parli
14. A me: zero gergo senza traduzione, comandi uno alla volta in un
    riquadro, prima cosa succede poi perché. Le spiegazioni in chat o
    dentro il sito, mai in un file del repo.
15. All'utente: pensa a dieci persone normali (ce l'ha questa informazione?
    si capisce in tre secondi? cosa succede se sbaglia?). Dai del tu, frasi
    corte, **MAI il trattino lungo**, ogni numero apribile.

## Chiedi PRIMA
16. Spendere soldi · domini · software di sistema · pubblicare online ·
    qualsiasi cosa irreversibile.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
