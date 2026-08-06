# STATO — Viaggio Anche Io

**Aggiornato:** 2026-08-06
**Fase 1 (costruisci) al 50%.** Landing viva, accesso e area utente in piedi.

## Dove siamo
- **Accesso fatto**: email+password, link magico, conferma via email.
  `proxy.ts` (in Next 16 il middleware si chiama così) chiude `/app`.
  Errori di Supabase tradotti in italiano, mai testo inglese all'utente.
- **`/app` esiste**: imposti partenza, budget, ore, notti, persone, voglia.
  Ogni ricerca mostra **dove arrivi oggi** con quel budget. Pausa e cancella.
- **Iscritti su Supabase**, non più su file (su Netlify sparivano).
  In produzione senza chiavi si alza un errore invece di perderli.
- **shadcn/ui a mano** (Button, Input, Label, Card) sui nostri colori:
  niente `init`, avrebbe riscritto `globals.css` e distrutto il design.
- **64 prove** su desktop e telefono dentro `npm run verify` (erano 48).
- Piano riscritto in tre fasi: `PIANO.md`. Marketing: `DISTRIBUZIONE.md`.

## Prossimo passo
Motore di abbinamento offerte ↔ ricerche (a lotti, limite 10s di Netlify),
poi invio alert su Telegram.

## Bloccato su — serve Valerio
1. **`.env.local`**: l'hook me lo vieta. Le due righe sono in chat. Senza,
   login e app non partono e non posso fotografarti l'app vera.
2. **Supabase → Authentication → "Confirm email" su OFF.** Oggi la posta
   interna manda **2 email l'ora**: al terzo iscritto ti fermi. Un clic.
3. **Partita IVA** (senza non incassi) · **dominio** (senza non pubblichi
   e Resend non verifica) · account social · account Polar.
4. Fonte delle offerte: decisione tua, ancora parcheggiata.

## Da non rifare
- Zentivo usa **fotografie** enormi, non CSS: per quel look serve un grafico.
- API prezzi e vincoli esterni già studiati: `DECISIONI.md`.
- Supabase rifiuta email su domini senza MX (`example.com` incluso).
- Spegni l'anteprima prima di `npm run verify`: Next rifiuta due dev server.
