# HANDOFF — fine giro #41 (9/08/2026)

## Stato

Sul ramo `claude/saas-app-repo-analysis-ghehqa`.
`npm run verify`: **578 prove verdi**, le 2 rosse sono le solite
dell'Osservatorio che nella sandbox non raggiunge Supabase.
Eval del motore: 45 su 45, falsi positivi 0.

## Cosa è entrato in questo giro

**Le tre famiglie di pagine evento**, tutte generate dai dati che avevamo già:

- `/sciopero-aerei` (fissa, risponde a "sciopero aerei oggi")
- `/sciopero-aerei/<data>` (una per ogni sciopero in tabella)
- `/aeroporto/<sigla>` (otto scali, dall'Osservatorio)

**L'autopilot degli scioperi**: `lib/scioperi/raccolta.ts` fa il lavoro,
`/api/motore/scioperi` è la porta, `netlify/functions/scioperi.mjs` è
l'orologio (4:20 UTC ogni giorno). Scarica le fonti pubbliche, fa
trascrivere a un modello, e ogni riga passa da un filtro deterministico
prima del database.

## Le due cose da non perdere di vista

1. **L'autopilot non è mai stato provato contro le fonti vere.** Da qui il
   proxy non apre né il cruscotto MIT né la Commissione di Garanzia né
   l'ENAC. Il filtro è coperto da prove, lo scarico no. Il primo giro vero
   va lanciato a mano dopo il deploy:
   `/api/motore/scioperi?segreto=<MOTORE_SEGRETO>`.
   Se si rompe non tace: manda un'email (e un Telegram se c'è
   `TELEGRAM_ADMIN_CHAT`).

2. **`scioperiInArrivo` torna `null`, non `[]`, quando il database non
   risponde.** Non è pignoleria: con l'array vuoto la pagina scriveva
   "oggi non risultano scioperi" anche quando non ne sapeva niente. Chi
   tocca quelle funzioni non riporti indietro quella distinzione.

## Le immagini di copertina

Valerio ha generato le dieci foto ma non riesce a committarle. La strada
concordata: le copia in `public/assets/tabellone/originali/` dal suo PC e
le spinge; poi qui si taglia la filigrana Gemini (striscia in basso, scelta
sua), si ridimensiona, si converte in WebP e si aggiunge la riga `foto:`
a ogni articolo. `sharp` è disponibile in questo ambiente, quindi il
lavoro si fa qui e non sul suo PC.

## Cosa resta

`ARRETRATI.md`, voci A2 (primo giro autopilot), B (le foto), C (riaprire
le fonti degli articoli dal suo PC), D, E, F.
