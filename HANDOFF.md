# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, pomeriggio (dopo il giro #30: barre dell'hero,
regole unificate, ambiente Claude, guida anteprima mobile).
Si aggiorna prima di ogni /clear.*

## Stato attuale
- **Deploy automatico dal repo GitHub**: ogni push sul ramo fa build e
  deploy su rivoglio.netlify.app. Il fix che lo sbloccava era
  `@netlify/plugin-nextjs` come devDependency (nei build da repo il
  plugin di netlify.toml va installato nel progetto).
- Il motore online è collaudato (FR4001: non idoneo, 155 min, demo:false).
  Su Netlify ci sono tutte le chiavi tranne Polar (che non esiste ancora).
- **Pagine legali** /privacy /condizioni /cookie online (prima bozza).
  Manca da Valerio: cognome e dati societari del titolare, poi revisione
  avvocato.
- **Barre dell'hero** come il riferimento: attaccate, quadrate in ogni
  estremo, a tutta larghezza, base 0.55 e picco 1, onda una-alla-volta
  da sinistra a destra (8,3s a giro).
- **Regole unificate**: checkpoint / task nuovo / degrado / HANDOFF solo
  nel "Protocollo operativo" di CLAUDE.md. Il PROTOCOLLO CONTESTO tiene
  metodo batch, /compact vs /clear, task = unità committabile.
  art-director FASE 0 ora salta le domande già risposte nel brief.
- **Ambiente Claude**: `.claude/settings.json` (tracciato) porta
  USE_BUILTIN_RIPGREP=0 e ENABLE_TOOL_SEARCH=auto:5 su ogni macchina.
  FIGMA_API_KEY sta in `.claude/settings.local.json` (gitignored): sul PC
  di Valerio va ricreato a mano, la riga è nel rapporto in chat.
- **Composio NON è nel codice**: è solo un utensile di sessione per
  applicare migrazioni sul Supabase vero. L'app parla a Supabase da
  `lib/supabase/servizio.ts:27` (chiave di servizio) e
  `lib/supabase/chiavi.ts:28` (chiave pubblica).

## Decisioni prese (ultime)
- Colonne: attaccate e quadrate, la tinta pari/dispari le separa.
- Variabili non segrete in settings.json tracciato, segreti solo in
  settings.local.json (mai nel repo, regola #5).
- Mobile: si guarda con l'emulatore Android da Windows; iPhone fisico
  solo con TestFlight, quindi non ora.

## File toccati in questo giro
app/globals.css (colonne attaccate/quadrate, onda più visibile) ·
CLAUDE.md (dedup regole) · .claude/skills/art-director/SKILL.md (FASE 0
ammorbidita) · .claude/settings.json (nuovo) · .claude/settings.local.json
(nuovo, non tracciato) · mobile/ANTEPRIMA-WINDOWS.md (nuovo) ·
STATO/ARRETRATI/HANDOFF.

## Cosa resta da fare
1. Valerio: dati del titolare per le pagine legali; poi avvocato.
2. Polar: prodotti, checkout link, segreto webhook, approvazione org.
   È il collo di bottiglia per incassare.
3. Mobile: l'onboarding è ancora al prodotto viaggi. Va rifatto per
   Rivoglio (il tracker della pratica) guardandolo dall'emulatore.
4. Scioperi di ottobre a inizio settembre (cruscotto MIT dal PC).
5. MCP da scollegare (scelta di Valerio): Shopify, Miro, Notion, e
   probabilmente Blender.
