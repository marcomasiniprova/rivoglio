@STATO.md

# Rivolio — le regole (contesto pieno: PROGETTO.md)

## Con me
1. Ogni mio prompt: 4 domande col popup PRIMA di costruire, anche dopo
   "vai/procedi/lock in". La consigliata per prima, marcata "(consigliato)".
2. Consegna a pezzi: fai, dillo, continua. Niente riassunti di quello che
   stai per fare. A ogni consegna: cosa è fatto, cosa manca, prossimo pezzo.
3. Non fare di testa tua: una mia decisione resta finché non la cambio io.
   Se ti pare sbagliata, dimmelo in una riga e poi eseguila.
4. Niente agenti o workflow in parallelo se non li chiedo io.
5. Più richieste in un messaggio: skill copertura-prompt, chiudi col blocco.

## Quando costruisci
6. "Fatto" = provato DOVE VIVE. verify verde, e se è online lo apro sul
   sito vero. Se non ho potuto provarlo lo dico chiaro: mai la parola
   "collaudato" senza averlo visto funzionare coi miei occhi.
7. Tocca solo il pezzo chiesto, zero refactoring, un fix non rompe altro.
8. Modifica visiva: guardala anche DOVE CAMBIANO i breakpoint
   (360, 768, 1024, 1280, 1440), non solo i tre soliti. Mai `absolute`
   dove serve disposizione vera. Skill art-director per ogni superficie.
9. Numeri: fonte o "stima". Dati finti solo `demo`, mai in produzione.
   Segreti solo in `.env.local`. Fine sessione: STATO, verify, commit.

## Come parli
10. A me: zero gergo senza traduzione, spiegazioni in chat, mai in un file.
11. All'utente: dieci persone normali, del tu, frasi corte, MAI il trattino
    lungo, ogni numero apribile.

## Chiedi PRIMA
12. Soldi, domini, software di sistema, pubblicare, cose irreversibili.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
