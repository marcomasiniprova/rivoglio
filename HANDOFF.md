# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, notte fonda (dopo #21 + #26 + audit prompt).
Si aggiorna prima di ogni /clear.*

## Stato attuale
- Rivoglio costruito e rifinito; ramo `claude/saas-app-repo-analysis-ghehqa`.
  Verify dell'8/08 notte: build, tipi, lint ok; Playwright 204/206 (2 =
  Osservatorio, rete sandbox verso Supabase, sul PC di Valerio passano);
  eval motore 33/33, falsi positivi 0.
- **#21 CHIUSO**: rinuncia al recesso con spunta versionata prima di Polar,
  registrata in `verifiche`, cancello nella rotta di checkout, firma
  copiata negli eventi pratica dal webhook.
- **#26 CHIUSO**: motore 2026.08.2 sui campi veri: senza quality "Live"
  nessun verdetto, codeshare non risolto sopra soglia = incerto, FR4001
  reale nel golden set (30 casi).
- **Punto 3 CHIUSO**: "due fonti indipendenti" tolto dalla vetrina finché
  la seconda fonte non è viva (copy su "tracciamento reale del volo").
- Migrazione `supabase/2026-08-08-recesso-e-live.sql` APPLICATA sul
  Supabase vero via Composio (4 colonne verificate a mano).
- ONLINE su rivoglio.netlify.app ma VECCHIO: i commit da f4e05a5 in poi
  NON sono deployati. I deploy li fa Valerio a mano (o si riautorizza il
  connettore Netlify su claude.ai).
- Chiavi in .env.development.local: GEMINI (quota immagini 0, serve
  fatturazione), FIGMA, MISTRAL, AERODATABOX. Mancano AVIATIONSTACK (la
  crea Valerio) e UNSPLASH (in approvazione). Su Netlify mancano TUTTE
  le chiavi segrete (Supabase secret, Resend, AeroDataBox, Mistral).

## Decisioni prese (ultime)
- Senza "Live" sull'arrivo il motore non dà NESSUN verdetto (nemmeno il
  no): un orario stimato non è un fatto. Cache: un atterrato non
  verificato si richiede al fornitore, non si congela.
- Codeshare IsCodeshared sopra soglia = incerto (la lettera va al vettore
  operativo, che l'API non nomina). Sotto soglia il no resta un no.
- Il testo della rinuncia è UNICO e versionato in `lib/pratiche/recesso.ts`;
  copy.ts lo importa da lì. Se cambia il testo, cambia la versione.
- Niente `aria-disabled` sui bottoni d'acquisto: il click senza spunta
  mostra il richiamo (più onesto anche per gli screen reader).
- Headline sui 12 MESI · voli ZZ* sempre demo · prove con chiavi azzerate.

## File toccati in questo giro
lib/regole/eu261.ts · lib/regole/casi-oro.ts · lib/voli/verifica.ts ·
lib/voli/fornitori/{aerodatabox,demo}.ts · lib/pratiche/recesso.ts (nuovo) ·
app/api/pratiche/recesso/route.ts (nuovo) · app/api/pratiche/checkout/route.ts ·
app/api/polar/webhook/route.ts · app/verifica/[id]/page.tsx ·
components/verifica/Risultato.tsx · lib/copy.ts · prove/verifica.spec.ts ·
supabase/2026-08-08-recesso-e-live.sql (nuovo) · STATO.md · ARRETRATI.md

## Cosa resta da fare (la mega to do vera è in ARRETRATI)
1. #22 AviationStack appena arriva la chiave di Valerio (poi rimettere
   "due fonti" in vetrina: le frasi vecchie sono nella history di copy.ts).
2. #25 Osservatorio con le statistiche ritardi AeroDataBox.
3. #27 i 7 pezzi: OpenFlights, fusi, Open-Meteo nel reclamo (l'asso),
   scioperi MIT/ENAC, indirizzi 40 compagnie, OCR Mistral (da costruire:
   è per questo che "sembra non funzionare").
4. Onboarding mobile ancora al prodotto viaggi (col tracker completo).
5. Serve Valerio: deploy, chiavi su Netlify, prodotti Polar + approvazione,
   AviationStack, fatturazione Gemini, dominio, social, legale.
