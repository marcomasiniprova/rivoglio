# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, mattina (dopo il giro #29: deploy automatico dal
repo, pagine legali, onda colonne, task di configurazione).
Si aggiorna prima di ogni /clear.*

## Stato attuale
- **DEPLOY AUTOMATICO**: il repo GitHub è collegato a Netlify (mossa di
  Valerio) e il build da repo funziona dopo il fix `@netlify/plugin-nextjs`
  come devDependency (nei build da repo il plugin di netlify.toml va
  installato nel progetto). Ogni push sul ramo = deploy. Controprova:
  il sito vero serve già il giro design (luce-corsivo presente).
- Il motore online resta collaudato (FR4001: non idoneo, 155 min,
  demo:false). Tutte le chiavi su Netlify tranne Polar.
- **Pagine legali** /privacy /condizioni /cookie: PRIMA BOZZA onesta
  (art. 13 GDPR; Garante 2021: soli cookie tecnici = niente banner).
  Titolare indicato solo col contatto email: cognome e dati societari
  li deve dare Valerio (popup senza risposta, usato il default), poi
  revisione avvocato. Cookie aggiunta al footer, tutte in sitemap.
- **Onda colonne hero** rifatta come il riferimento di Valerio: altezze
  diverse, impulso una-colonna-alla-volta che viaggia da sinistra a
  destra in loop (8.3s), base 0.3 picco 1. Faro rimosso.
- **CLAUDE.md**: aggiunta la sezione "Protocollo operativo" IDENTICA
  alla dettatura di Valerio (il popup con la proposta di deduplica col
  PROTOCOLLO CONTESTO è rimasto senza risposta: eseguito alla lettera).
  Le 4 regole doppie (checkpoint, task nuovo, degrado, HANDOFF) ora
  esistono in due versioni: unificarle resta a scelta di Valerio.
- Config: USE_BUILTIN_RIPGREP=0 e ENABLE_TOOL_SEARCH=auto:5 nell'rc del
  CONTAINER cloud (evapora col container): le stesse righe vanno
  aggiunte sul PC di Valerio, gliel'ho scritto in chat col doctor report.
- Mobile: la strada per l'anteprima da PC Windows è Android Studio +
  emulatore + `npx expo start` (installa da solo l'Expo Go per SDK 57).
  Passi dettagliati dati in chat. Lo sviluppo mobile vero resta da fare
  (onboarding ancora al prodotto viaggi).

## Decisioni prese (ultime)
- Deploy: repo collegato, niente più zip né giri manuali.
- Legali: prima bozza pubblicata subito per chiudere i 404; identità
  completa del titolare e revisione legale come passi successivi.
- Colonne: una alla volta, sinistra→destra, loop; niente faro.
- Protocollo operativo in CLAUDE.md: versione letterale di Valerio.

## File toccati in questo giro
package.json (+@netlify/plugin-nextjs devDep) · components/SfondoColonne.tsx
· app/globals.css (onda, .legale, niente faro) ·
components/legale/PaginaLegale.tsx (nuovo) · app/privacy/page.tsx ·
app/condizioni/page.tsx · app/cookie/page.tsx (nuovi) · app/sitemap.ts ·
lib/copy.ts (footer link Cookie) · CLAUDE.md (Protocollo operativo) ·
STATO/ARRETRATI/HANDOFF.

## Cosa resta da fare
1. Valerio: cognome + dati societari del titolare per le pagine legali,
   poi revisione avvocato (segnato in ARRETRATI).
2. Polar: prodotti, checkout link, segreto webhook, approvazione org.
   Collo di bottiglia per incassare.
3. Mobile: onboarding da rifare per Rivoglio (tracker), da vedere con
   l'emulatore Android seguendo i passi dati in chat.
4. Scioperi di ottobre a inizio settembre (cruscotto MIT dal PC).
5. Se Valerio risponde sul CLAUDE.md: eventualmente unificare le 4
   regole doppie fra Protocollo operativo e PROTOCOLLO CONTESTO.
