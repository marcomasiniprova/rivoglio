# STATO — Viaggio Anche Io

**Aggiornato:** 2026-08-06
**Fase:** 1 — Landing page (giorno 1 di 7)

## Dove siamo
- `SPEC.md` scritta e completa. `DECISIONI.md` pieno: nome, tono, pricing a
  crediti, tutta Italia, Netlify, landing page per prima. **Non ridiscuterle.**
- Cancello `verify` funzionante e testato nei due versi (exit 0 ok, exit 1 se
  trova un segreto tracciato).
- Ricerca fonti dati chiusa e scritta in `DECISIONI.md` → "Vincoli verificati".
  **Non rifarla.**
- Zero codice di prodotto scritto finora. Nessuna spesa fatta.

## Prossimo passo
Costruire la **landing page** (giorno 1-2 del piano in `SPEC.md` §11):
vetrina + come funziona + prezzi a crediti + raccolta iscritti.

## Bloccato su — serve Valerio
- **Dominio** `viaggioancheio.it`: verificare se è libero e comprarlo.
  Io non riesco a controllare i domini da qui (rdap e DNS non funzionano
  nell'ambiente — provato, dà falsi positivi).
- **Stripe**: account da aprire, servono dati fiscali e IBAN. Serve al giorno 6.
- **Fonte prezzi offerte**: parcheggiata di proposito, si decide per ultima.

## Da non rifare
- Ricerca API prezzi (Booking, Amadeus, Travelpayouts, SerpAPI, Trenitalia).
- `.claude/verify.cmd` NON è un file batch: una riga sola. Vedi DECISIONI.md.
