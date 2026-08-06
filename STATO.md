# STATO — Viaggio Anche Io

**Aggiornato:** 2026-08-06
**Fase:** 2 — Landing finita, infrastruttura pronta

## Dove siamo
- **Landing completa in stile Zentivo, in verde.** 11 sezioni, 9669px.
  Struttura e misure prese misurando il template dal vivo col browser.
  Framer non esporta il codice: è ricostruita a mano.
- **Repo privata pubblicata:** github.com/marcomasiniprova/viaggioancheio
- **Supabase attivo** (`znwpzkzavzsktyfxwuye`, Francoforte). Schema + RLS.
  Buco di sicurezza sui crediti trovato e chiuso (migrazione 002).
- **Playwright:** 12 prove su desktop e telefono, dentro `npm run verify`.
  Più due catture a fasce (`prove/cattura-*.spec.ts`) da lanciare a mano.
- **Skill installate a mano** in `.claude/skills/`: impeccable, taste,
  redesign, image-to-code. Nessun installer, hook di Valerio intatti.

## Prossimo passo
Login utente (Supabase Auth) + pagina `/app` con "imposta la tua ricerca".

## Bloccato su — serve Valerio
1. **Creare `.env.local`** — l'hook mi vieta di scriverlo. Contenuto in chat.
2. **Node 22**: `winget install OpenJS.NodeJS.LTS` (lo lanci tu, è il tuo PC).
3. **Commercialista / partita IVA.** Senza, non incassi. Non rimandare.
4. Dominio `viaggioancheio.it`. Fonte prezzi offerte: parcheggiata per ultima.
5. Supabase: disabilitare le chiavi legacy dal pannello.

## Da non rifare
- Ricerca API prezzi e vincoli esterni: `DECISIONI.md`.
- `.claude/verify.cmd` NON è un file batch: una riga sola.
- ESLint non controlla `.claude/` (skill di terzi).
