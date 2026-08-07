---
name: prova-browser
description: Usa quando devi verificare che una pagina o un flusso funzioni davvero nel browser, quando hai cambiato qualcosa di visibile, prima di dire "fatto" su del frontend, o quando qualcosa "sembra rotto" e serve capire cosa. Guida Playwright, naviga i flussi, cattura schermate, legge il DOM e la console, e riporta cosa non va.
---

# Prova nel browser

Serve a rispondere a **una domanda sola**: *la pagina funziona davvero, o me lo
sto raccontando?*

## Regola zero

**Uno screenshot non guardato non vale niente.** Se catturi un'immagine, poi la
apri e la guardi. Se non la guardi, non hai verificato: hai solo creato un file.

## Il giro completo

### 1. Accendi il server
```
preview_start con { name: "rivoglio" }
```
Se dice che la porta è occupata, un server sta già girando: usalo, non
ammazzarlo. Next rifiuta un secondo `next dev` sulla stessa cartella, quindi
`npm run verify` fallisce finché l'anteprima è accesa. Ricordatelo.

### 2. Guarda gli errori PRIMA di guardare la grafica
```
read_console_messages { onlyErrors: true }
preview_logs { level: "error" }
read_network_requests            → richieste fallite, 404, 500
```
Un errore in console spiega il 90% dei "non funziona" senza aprire un'immagine.

### 3. Leggi la struttura, non fidarti dell'occhio
```
read_page          → albero accessibile, con i ref per cliccare
get_page_text      → il testo vero della pagina
```
Serve a verificare i CONTENUTI: che i numeri tornino, che i testi ci siano,
che non ci sia rimasto un segnaposto.

### 4. Prova le interazioni
```
computer { action: "left_click", ref: "ref_N" }
form_input { ref: "ref_N", value: "..." }
```
Poi rileggi la pagina per confermare che sia successo qualcosa.

### 5. Cattura e GUARDA
```
CATTURA=1 BASE_URL=http://localhost:3000 npx playwright test prove/cattura-nostro.spec.ts
```
Produce `prove/desktop/` e `prove/telefono/`. **Aprile con Read, una per una.**

## Trappole già pagate su questo progetto

| Trappola | Come si manifesta | Cosa fare |
|---|---|---|
| **Animazioni allo scroll** | Una fascia esce completamente vuota | Non usare `fullPage` dopo una scorsa veloce: fermati su ogni fascia e aspetta 1,1s che l'ingresso finisca |
| **Il telefono si controlla a parte** | Su desktop è perfetto, sul telefono è spappolato | Cattura SEMPRE anche `--project=telefono`. Guardare solo il desktop non è verificare |
| **Segnalazioni TypeScript vecchie** | L'editor segnala errori già corretti | Fidati di `npx tsc --noEmit`, non del pannellino |
| **Scorrimento orizzontale** | Si vede solo sul telefono vero | C'è già una prova apposta in `prove/landing.spec.ts`, non toglierla |
| **Contatori animati** | La schermata coglie numeri sbagliati a metà corsa | È normale. Ma se il numero ha una fonte citata, non animarlo (vedi `Numeri.tsx`) |

## Prima di dire "fatto"

```
npm run verify
```
Spegni l'anteprima prima di lanciarlo, altrimenti il server dei test non parte.
Deve fare: build, tipi, lint, e tutte le prove Playwright. Exit 0 o non è fatto.

## Quando una prova fallisce

1. Leggi il messaggio vero, non la riga di riepilogo.
2. `npx playwright show-trace test-results/<cartella>/trace.zip` per vedere cosa
   ha visto il browser.
3. **Non indebolire la prova per farla passare.** Se una prova dà fastidio,
   quasi sempre ha ragione lei.
