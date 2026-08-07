# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, notte. Si aggiorna prima di ogni /clear.*

## Stato attuale
- Rivoglio costruito e rifinito; ramo `claude/saas-app-repo-analysis-ghehqa`
  pushato fino al protocollo contesto. Verify: 192/194 (2 = rete sandbox
  verso Supabase, passano sul PC di Valerio).
- ONLINE su rivoglio.netlify.app ma VECCHIO: i commit da f4e05a5 in poi
  (onda, pricing, scanner, 12 mesi, fix campo data e cartolina) NON sono
  deployati. I deploy li fa Valerio a mano.
- Chiavi in .env.development.local: GEMINI (quota immagini 0, serve
  fatturazione), FIGMA, MISTRAL, AERODATABOX. Manca AVIATIONSTACK (la sta
  creando Valerio) e UNSPLASH (in approvazione).

## Decisioni prese (ultime)
- Headline sui 12 MESI (il piano BASIC AeroDataBox rifiuta oltre 365
  giorni; dentro l'anno il dato è Live anche a 11 mesi).
- actualTime NON esiste più nell'API: si chiama revisedTime; runwayTime =
  ruote a terra (prudente, già nostra scelta).
- Voli ZZ* SEMPRE al fornitore demo; le prove azzerano le chiavi.
- Supporto: valerio@artecai.it nel footer. Social: restano, li crea lui.
- PROTOCOLLO CONTESTO in CLAUDE.md: batch + un verify, rg non read,
  checkpoint a fine task.

## File toccati di recente
CLAUDE.md · .claude/skills/art-director/SKILL.md ·
.claude/agents/art-director.md · lib/copy.ts · lib/voli/verifica.ts ·
lib/email/messaggi.ts · playwright.config.ts · components/Footer.tsx ·
components/app/CheckRapido.tsx · app/opengraph-image.tsx · public/llms.txt

## Cosa resta da fare (attività #, vedi anche ARRETRATI)
1. #21 Rinuncia al recesso prima del rimando a Polar (il buco più costoso).
2. #26 Motore sui campi veri: quality Live obbligatorio, revisedTime,
   codeshare IsOperator; FR4001 del 6/08 (155 min) nel golden set.
3. #22 AviationStack appena arriva la chiave. #25 Osservatorio con le
   statistiche AeroDataBox. #27 OpenFlights, Open-Meteo, scioperi,
   indirizzi 40 compagnie, OCR Mistral.
4. Serve Valerio: deploy manuale, chiavi RESEND e SUPABASE_SECRET su
   Netlify, fatturazione Gemini, prodotti Polar, dominio.
