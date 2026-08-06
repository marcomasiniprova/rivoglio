# STATO — Viaggio Anche Io

**Aggiornato:** 2026-08-06
**Fase:** 2 — Infrastruttura in piedi, database protetto

## Dove siamo
- **Repo privata:** github.com/marcomasiniprova/viaggioancheio (remote configurato,
  non ancora pubblicata: manca `gh auth login`).
- **Supabase attivo:** progetto `znwpzkzavzsktyfxwuye`, Francoforte (eu-central-1,
  dati in UE). Servizi tutti `ACTIVE_HEALTHY`.
- **Schema applicato e verificato:** profili, ricerche, offerte, invii,
  transazioni, iscritti. RLS su tutte. Il profilo nasce da solo alla
  registrazione, con 3 crediti.
- **Buco di sicurezza trovato e chiuso** (migrazione 002): un utente registrato
  poteva regalarsi crediti. Ora `crediti` è scrivibile solo da server.
  Verificato leggendo il catalogo permessi, non a fiducia.
- **Landing page** completa e funzionante. Logo rifatto in verde, regge a 24px.
  `BRAND.md` scritto: colori fissi, caratteri, tono.

## Prossimo passo
Skill `impeccable`/`taste` da installare a mano (l'installer vuole Node 22,
qui c'è il 20) + Playwright per le prove sul browser. Poi: login utente e
form "imposta la tua ricerca".

## Bloccato su — serve Valerio
1. **`gh auth login`** — una volta sola, poi pubblico il codice.
2. **Creare `.env.local`** — l'hook mi vieta di scriverlo (giusto). Contenuto
   già consegnato in chat.
3. **Link del template Framer** pubblicato, per ricostruirlo in codice.
4. **Commercialista**: partita IVA. Senza, non incassi. Non rimandare.
5. Dominio `viaggioancheio.it`. Fonte prezzi offerte: parcheggiata per ultima.

## Da non rifare
- Ricerca API prezzi e vincoli esterni: `DECISIONI.md`.
- `.claude/verify.cmd` NON è un file batch: una riga sola.
- Supabase: chiavi legacy da disabilitare dal pannello, usiamo `sb_publishable_`.
