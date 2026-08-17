# 05 — Microcopy: bottoni, errori, notifiche, stati vuoti

Il microcopy è una disciplina diversa dal copy lungo, non solo "la stessa cosa più corta". Fonte: Nielsen Norman Group (via ecommercefastlane.com) definisce il microcopy come testo funzionale sotto le 3 frasi — bottoni, etichette dei form, messaggi di errore, conferme, tooltip. **Il copy lungo vende un'idea, il microcopy accompagna un gesto.** Non deve emozionare, deve rendere ogni passaggio così chiaro che l'utente non si fermi mai a pensare.

Dato di contesto: **il 79% dei visitatori scansiona invece di leggere parola per parola** — questo vale ancora di più per il microcopy, che spesso viene notato solo con la coda dell'occhio.

---

## Bottoni (CTA)

- [ ] **Mai bottoni generici**: "Invia", "Clicca qui", "Continua" non dicono nulla del valore dell'azione.
- [ ] **Verbo + oggetto specifico**: non "Invia" ma "Iscrivimi alla newsletter"; non "Continua" ma "Controlla il mio volo"; non "Conferma" ma "Genera il mio reclamo".
- [ ] Il bottone dovrebbe poter completare la frase "Voglio [testo del bottone]" in modo naturale — se non ci riesce, va riscritto.
- [ ] Coerenza tra il titolo/domanda sopra il bottone e il testo del bottone stesso (se il titolo chiede "Vuoi il tuo rimborso?" il bottone non dovrebbe dire un'azione diversa da quella implicita nella domanda).
- [ ] Mai il MAIUSCOLO su tutto il testo del bottone — in italiano si legge come se si stesse urlando, non aumenta l'autorevolezza.

---

## Messaggi di errore

- [ ] **[REGOLA CHIAVE] Mai dare la colpa all'utente.** "Hai sbagliato l'indirizzo email" intimidisce. "Verifica che l'indirizzo email sia scritto giusto" guida senza accusare.
- [ ] **Evita termini che intimidiscono**: "è obbligatorio", "campo richiesto" in tono burocratico — meglio uno stile conversazionale che spiega perché serve quell'informazione.
- [ ] **Inizia con un verbo che dice cosa fare subito**, non solo cosa è andato storto: non "Numero di volo non valido" ma "Controlla il numero di volo — di solito è nel formato FR1234".
- [ ] **Considera lo stato emotivo di chi legge l'errore in quel momento.** Se il prodotto risolve un problema urgente o stressante (es. un disservizio da segnalare, una pratica da sbloccare), chi compila il form è probabilmente già in uno stato di tensione — un errore tecnico scritto in modo freddo o accusatorio peggiora un'esperienza già negativa. Il messaggio deve rassicurare, non aggiungere frustrazione.
- [ ] Sii specifico su come si risolve, non solo su cosa è successo: "non riusciamo a trovare questo volo" da solo lascia l'utente bloccato; "non troviamo questo volo — controlla la data o il codice IATA della compagnia" gli dà un'azione concreta.

---

## Stati vuoti (empty states)

Non semplici riempitivi — un'opportunità per guidare l'utente verso l'azione giusta, non solo dire "non c'è niente qui".
- [ ] Invece di "Nessun risultato", spiega perché e cosa fare: "Non abbiamo trovato reclami collegati a questa email — se pensi sia un errore, scrivici".
- [ ] Se lo stato vuoto è normale/atteso (es. prima ancora di usare il prodotto), usalo per spiegare cosa succederà quando l'utente inizierà, non solo constatare il vuoto.

---

## Messaggi di conferma/successo

- [ ] Non limitarti a dire "Fatto" o "Successo" — conferma cosa è successo davvero e cosa succede dopo: "Fatto! Ti abbiamo mandato il documento via email, controlla anche lo spam".
- [ ] È il momento giusto per rassicurare, soprattutto su prodotti dove l'utente ha appena pagato o inviato dati sensibili: dopo il pagamento, il messaggio deve confermare cosa riceverà e quando, non lasciarlo in dubbio.

---

## Notifiche (email transazionali, push)

- [ ] L'oggetto deve funzionare da solo, letto in mezzo a una lista di altre notifiche — beneficio o informazione concreta, non genericità ("Il tuo reclamo è pronto" non "Aggiornamento sul tuo account").
- [ ] Stesso tono/persona del resto del sito — un cambio di voce tra sito ed email tradisce che sono stati scritti da mani/momenti diversi senza cura.

---

## Collegamento con la GEO/visibilità (se hai anche la skill `visibility-full-stack-2026`)

Nel 2026 il microcopy non lo leggono solo le persone: gli assistenti AI (ChatGPT, Claude, browser agentici) leggono etichette, bottoni e messaggi per capire cosa fa un sito e riassumerlo agli utenti. La buona notizia è che le due esigenze coincidono: un'etichetta esplicita e un bottone descrittivo sono contemporaneamente buona usabilità per l'utente umano e un segnale più chiaro per il modello che deve interpretare la pagina — scrivere microcopy chiaro è una delle poche cose che paga su entrambi i fronti contemporaneamente.

---

## Fonti principali di questo file
Nielsen Norman Group (definizione di microcopy, via ecommercefastlane.com), Learnn.com (messaggi di errore inline, stati vuoti), Officina Microtesti (principi sui messaggi di errore, stato emotivo dell'utente), Armonia.io (esempio Invia→Iscrivimi→Iscrivimi alla newsletter), Gianluca Lorenzini (collegamento microcopy/leggibilità AI, dato 79% skimming), Parallel HQ (UX writing best practices 2026).
