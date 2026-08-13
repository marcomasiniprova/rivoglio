@STATO.md

# Rivolio — le regole

*Contesto, flusso e protocollo: `PROGETTO.md`. Qui solo gli ordini.*

## Come lavori con me
1. **A OGNI mio prompt: 4 domande col popup, prima di costruire.** Sempre.
   Anche dopo "vai", "procedi", "lock in", "fai tutto": quelle parole dicono
   di non fermarti DOPO, non di saltare le domande PRIMA. Opzioni concrete,
   la consigliata per prima e marcata "(consigliato)". L'unica eccezione è
   se scrivo di non farlo.
2. **Se il mio messaggio contiene più richieste, usa la skill
   copertura-prompt** e chiudi col blocco di copertura.
3. **Consegna a pezzi.** Fai la prima cosa, dilla, continua. Non accumulare
   dieci lavori in un turno solo.
4. **Niente fumo.** Zero riassunti di quello che stai per fare: fallo e dillo.
5. **Non fare di testa tua.** Se ho già deciso una cosa, quella resta finché
   non la cambio io. Se una mia scelta ti sembra sbagliata, dimmelo in una
   riga e poi eseguila.
6. **Niente agenti o workflow in parallelo se non te lo chiedo io.**
7. Aggiornami sempre su: cosa è fatto, cosa manca, qual è il prossimo pezzo.

## Come costruisci
8. **Prova o non è fatto.** `npm run verify` verde prima di dire finito.
9. **Niente numeri inventati.** Fonte citata, o scritto "stima".
10. **Niente dati finti che sembrano veri.** Marcati `demo`, mai in produzione.
11. **Tocca solo il pezzo chiesto.** Zero refactoring non chiesti.
12. **Un fix non può rompere altro.** Ogni modifica visiva si guarda ad
    almeno tre larghezze (375, 768, 1440). Mai `absolute` dove serve
    disposizione vera. Prima del commit controlla il pezzo ACCANTO.
13. **Skill `art-director`** per ogni superficie visiva; obbligatoria con
    un'immagine di riferimento.
14. **Segreti solo in `.env.local`**, mai in un file tracciato.
15. **Fine sessione:** aggiorna `STATO.md`, `PIANO.md`, `ARRETRATI.md`,
    verify, committa.

## Come parli a me
16. Non sono tecnico e non devo diventarlo. Zero gergo senza traduzione.
17. I comandi uno alla volta, in un riquadro, col percorso già giusto.
18. Prima cosa succede, poi perché. Se una cosa non si può fare sul mio PC
    (Windows), dillo subito e dammi l'alternativa che funziona.
19. Le spiegazioni per me vanno in chat o dentro il sito, mai in un documento
    nel repository: non lo leggerò.

## Come parli all'utente
20. **Pensa a dieci persone normali.** L'informazione ce l'ha? Si capisce in
    tre secondi? Cosa succede se sbaglia? Un aiuto è l'ultima spiaggia:
    prima si toglie l'ostacolo.
21. Dai del tu, professionale non da bar. Frasi corte, zero superlativi.
    **MAI il trattino lungo.** Ogni numero mostrato dev'essere apribile.

## Chiedi PRIMA
22. Spendere soldi · comprare domini · installare software di sistema ·
    pubblicare online · qualsiasi cosa irreversibile.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
