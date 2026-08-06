# STATO — Viaggio Anche Io

**Aggiornato:** 2026-08-06
**Fase:** 1 — Landing page fatta (giorno 1-2 di 7)

## Dove siamo
- **Landing page completa e funzionante.** Next 16 + React 19 + Tailwind 4.
  Sezioni: hero col telefono, come funziona, il conto aperto, prezzi a crediti,
  domande, iscrizione, footer. Build + tipi + lint: tutto verde.
- Modulo di iscrizione **provato davvero**: email valida → 200 e salvata
  (ripulita e in minuscolo); email sbagliata → 400; corpo rotto → 400.
- I numeri dell'esempio vivono in un solo posto (`lib/esempio.ts`) così telefono
  e sezione conto non possono divergere: 78 + 27 = 105, sotto soglia 120.
- `SPEC.md` e `DECISIONI.md` completi. **Non ridiscutere le scelte lì dentro.**

## Prossimo passo
Giorno 3: Supabase — schema, iscrizione vera, form "imposta la tua ricerca".

## Bloccato su — serve Valerio
- **`lib/archivio.ts` scrive su file locale.** Su Netlify il filesystem non è
  persistente: **va sostituito con Supabase PRIMA di mettere online**, altrimenti
  le email degli iscritti si perdono in silenzio.
- **Dominio** `viaggioancheio.it`: verificare e comprare (io non riesco a
  controllare i domini da qui — rdap e DNS danno falsi positivi, provato).
- **Stripe**: account da aprire (dati fiscali + IBAN). Serve al giorno 6.
- **Fonte prezzi offerte**: parcheggiata di proposito, si decide per ultima.

## Da non rifare
- Ricerca API prezzi: risultati in `DECISIONI.md` → "Vincoli verificati".
- `.claude/verify.cmd` NON è un file batch: una riga sola.
