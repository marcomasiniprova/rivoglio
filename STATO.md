# STATO — Viaggio Anche Io

**Aggiornato:** 2026-08-06
**Fase:** 2 — Landing finita e viva. Prossimo: l'app.

## Dove siamo
- **Landing a 13 sezioni** in stile Zentivo, in verde. Movimento con Motion 13:
  ingressi allo scroll, testo che si accende parola per parola, macchina da
  scrivere, contatori. Sistemata sul telefono, sfondo rifatto.
- **Costruttore di micro-vacanze funzionante**, provabile senza iscriversi.
  Da Bologna con 120€: Ferrara 0h42, auto 9€, restano 111€. Numeri veri.
- **Calcolo del viaggio** (`lib/viaggio.ts`) puro e testato: è lo stesso pezzo
  che userà l'app.
- **48 prove** Playwright su desktop e telefono, dentro `npm run verify`.
- Repo pubblicata, Supabase attivo con RLS, buco sui crediti già chiuso.
- `PIANO.md` (mappa), `ARRETRATI.md` (debiti), `CONTENUTI.md` (piano social).

## Prossimo passo
Login utente (Supabase Auth) + pagina `/app` con le ricerche salvate.

## Bloccato su — serve Valerio
1. **`lib/archivio.ts` scrive su file.** Su Netlify sparisce: va spostato su
   Supabase **prima di pubblicare**, o perdi le email degli iscritti.
2. **Creare `.env.local`** (l'hook mi vieta di scriverlo). Contenuto in chat.
3. **Commercialista / partita IVA.** Senza, non incassi.
4. Dominio `viaggioancheio.it` · social `@viaggioancheio` · account Polar.
5. Fonte prezzi offerte: parcheggiata per ultima.

## Da non rifare
- Zentivo usa **fotografie** ad altissima risoluzione, non CSS. Non imitarlo
  con i gradienti: per quel look serve un grafico.
- Ricerca API prezzi e vincoli esterni: `DECISIONI.md`.
- ESLint non controlla `.claude/`. Le catture si lanciano con `CATTURA=1`.
- Spegni l'anteprima prima di `npm run verify`: Next rifiuta due dev server.
