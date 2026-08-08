# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, alba (dopo il giro #28: motore collaudato online,
Osservatorio dati veri, hero col glow, scanner carta d'imbarco).
Si aggiorna prima di ogni /clear.*

## Stato attuale
- **Il motore sul sito VERO funziona ed è collaudato**: il "FR4001 non
  funziona" era solo AERODATABOX_API_KEY mancante su Netlify. Messa via
  connettore, rideploy, controprova live: non idoneo, 155 min, demo:false.
  Su Netlify ora ci sono TUTTE le chiavi (Supabase secret, Resend,
  Mistral, AeroDataBox). ATTENZIONE: il flag "secret" del connettore
  Netlify fallisce IN SILENZIO, variabili da scrivere senza quel flag.
- **#25 CHIUSO**: `osservatorio_ritardi` sul Supabase vero (migrazione
  tracciata), lib/osservatorio/ritardi.ts (cache 24h, 2 lotti da 4,
  fail-open), /api/osservatorio, striscia nella sezione scura. Prima
  rilevazione vera seminata (notte: 4 scali con indice).
- **Giro design fatto e visto con gli screenshot** (1440 e 390): hero con
  corsivo verde e glow stile Osservatorio su fondo chiaro (il corsivo era
  sparito: aggancio spezzaTitolo rotto dal cambio headline 12 mesi);
  scanner = CartaImbarcoScan condiviso (hero + verdetto); punti fiducia in
  striscia; sezioni ravvicinate; titoli +7%; foto footer ritagliata al
  polso e centrata (940x917, 205KB); bottone retroattivo e dato oggettivo
  centrati su mobile.
- Email: iscrizione Osservatorio provata sul sito vero con
  valerio@artecai.it (benvenuto spedito, deve controllare la casella).
  La sequenza pratiche si collauda solo con Polar.
- **Il deploy dell'ultimo giro lo fa Valerio** (scelta col popup): online
  c'è il motore vero ma non ancora design nuovo e striscia Osservatorio.
- Il connettore Netlify in QUESTA sessione è attivo (env var lette e
  scritte, 2 deploy fatti). Composio nuovo prefisso: mcp__Composio__*.

## Decisioni prese (ultime, coi popup)
- Chiave AeroDataBox su Netlify: la mette Claude col connettore. FATTO.
- Hero: fondo CHIARO con font e glow dell'Osservatorio (non fondo scuro).
- Osservatorio #25: top 8 aeroporti italiani, aggiornamento 1 volta al
  giorno (FCO MXP LIN BGY VCE NAP CTA BLQ).
- Deploy finale: lo fa Valerio a mano.
- Aeroporti senza indice (niente traffico notturno) non si mostrano.

## File toccati in questo giro
components/rivoglio/CartaImbarcoScan.tsx (nuovo) · HeroCheck.tsx (scanner,
corsivo+glow, punti fiducia, timbro passo 3) · verifica/Risultato.tsx
(overlay con la stessa carta) · ComeFunziona/DatoOggettivo/Garanzia/
Retroattivo/PrezziRivoglio/NumeriMercato/FaqRivoglio/Osservatorio
(spaziature, titoli, centrature, striscia ritardi) · app/page.tsx ·
components/Footer.tsx (foto nuova 940x917) · public/telefono-app.png ·
app/globals.css (.luce-corsivo, .scan-lettura, .scan-raggio) · lib/copy.ts
(osservatorio.ritardi) · lib/osservatorio/ritardi.ts (nuovo) ·
app/api/osservatorio/route.ts (nuovo) ·
supabase/2026-08-08-osservatorio-ritardi.sql (nuovo) · STATO/PIANO/
ARRETRATI/HANDOFF.

## Cosa resta da fare
1. **Valerio deploya l'ultimo giro** e controlla nella casella l'email di
   benvenuto; poi controprova su rivoglio.netlify.app: hero col corsivo,
   scanner nuovo, striscia Osservatorio (di giorno con più indici).
2. Polar: prodotti, checkout link, segreto webhook, approvazione org.
   È il collo di bottiglia per incassare.
3. Scioperi di ottobre a inizio settembre (cruscotto MIT dal PC).
4. Onboarding mobile ancora al prodotto viaggi (col tracker completo).
5. Dominio, social, legale, fatturazione Gemini, Unsplash.
