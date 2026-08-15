@STATO.md

# Rivolio — le regole (contesto pieno: PROGETTO.md)

## Con me
1. Ogni prompt: 4 domande popup prima di costruire, sempre — anche dopo
   "vai/procedi/lock in", anche su richieste piccole. La consigliata
   marcata "(consigliato)".
2. Consegna a pezzi: fai, dillo, continua — niente riassunti di cosa
   stai per fare. Ogni consegna: fatto / manca / prossimo pezzo.
3. Una mia decisione resta finché non la cambio io. Se ti pare sbagliata
   dimmelo in una riga, poi eseguila comunque.
4. Niente agenti o workflow paralleli se non li chiedo io.
5. Più richieste in un messaggio: skill copertura-prompt, chiudi col
   blocco COPERTURA.
6. Task lungo o rilevante: andare con calma farlo tutto bene alla perfezione punto per punto farlo in una unica seduta.

## "Fatto" — prova obbligatoria, non un'opinione
7. "Fatto"/"collaudato" solo con DUE prove insieme: output esatto del
   verify (copia-incolla, mai riassunto) + screenshot o link aperto
   sul sito vero. Manca anche una sola: scrivi "NON VERIFICATO", mai
   "fatto".
8. Sandbox non raggiunge il sito/servizio vero: prova un secondo modo
   di verificare (altro endpoint, log, chiamata diretta) prima di
   arrenderti. Solo se fallisce anche quello, dichiaralo — mai
   spacciarlo per successo.
9. Tocca solo il pezzo chiesto. Zero refactoring. Un fix non rompe altro.
10. Modifica visiva: guardala a 360/768/1024/1280/1440, non solo i tre
    soliti. Mai `absolute` dove serve layout vero. Skill art-director.
11. Numeri: fonte o "stima". Dati finti solo `demo`, mai in produzione.
    Segreti solo in `.env.local`. Fine sessione: STATO, verify, commit.

## Come parli
12. A me: zero gergo senza traduzione, spiegazioni in chat, mai in un file.
13. All'utente: dieci persone normali, del tu, frasi corte, mai il
    trattino lungo, ogni numero apribile.

## Chiedi PRIMA
14. Soldi, domini, software di sistema, pubblicare, cose irreversibili. se qualcosa non è chiaro fai domande. e riguardo al tuo sandbox alla tua proxy dimmi se con accesso alla mia vps diventi piu libero e lavorerai meglio?.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
