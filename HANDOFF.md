# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, notte fonda (dopo il giro #27: seconda fonte
documenti, 20 compagnie, scioperi). Si aggiorna prima di ogni /clear.*

## Stato attuale
- Rivoglio costruito e rifinito; ramo `claude/saas-app-repo-analysis-ghehqa`.
  Verify del giro #27: build, tipi, lint ok; Playwright 208/210 (2 =
  Osservatorio, rete sandbox verso Supabase); eval 35/35 sui 32 casi d'oro.
- **#22 e #27 CHIUSI** (ARRETRATI righe 72-77): la seconda fonte sono i
  DOCUMENTI dell'utente (AviationStack free era finta: solo tempo reale,
  licenza personale). OCR Mistral dentro la pratica dopo il pagamento,
  file mai salvato, estrazione a regex, confronto deterministico,
  discorde = conferma umana. Landing con la frase dettata da Valerio.
- Motore 2026.08.3: regola scioperi (sopra soglia + sciopero noto =
  incerto), golden set 32 casi, eval bloccante FP 0.
- `lib/lettera/compagnie.ts`: 20 compagnie con entità legale, NEB,
  indirizzo postale, accettaIntermediari (FR/U2/W6/V7/DY = solo reclamo
  diretto del passeggero). Iberia e Transavia senza chiavi di nome
  (sorelle omonime = società diverse).
- Tabella `scioperi` APPLICATA e POPOLATA sul Supabase vero (migrazione
  `20260809_scioperi`, 10 righe verificate con SELECT). Il file locale è
  `supabase/2026-08-09-scioperi.sql`.
- Open-Meteo nella lettera: PRONTO ma SPENTO dietro OPENMETEO_COMMERCIALE=1.
  Scoperta: l'archivio commerciale richiede il piano Professional
  (~99 USD/mese), non lo Standard da 29.
- `lib/dati/aeroporti.json` (OpenFlights, 6.072 scali) + haversine come
  riserva distanze.
- ONLINE su rivoglio.netlify.app ma VECCHIO: i commit da f4e05a5 in poi
  NON sono deployati. In QUESTA sessione remota il connettore Netlify non
  è agganciato (serve l'autorizzazione su claude.ai, la sessione non può
  fare l'OAuth): il deploy lo fa Valerio, o una sessione col connettore.
- Chiavi in .env.development.local: GEMINI (quota immagini 0), FIGMA,
  MISTRAL, AERODATABOX. Su Netlify mancano TUTTE le chiavi segrete
  (Supabase secret, Resend, AeroDataBox, Mistral).

## Decisioni prese (ultime)
- Seconda fonte = documenti utente; l'upload vive DENTRO la pratica, dopo
  il pagamento (popup dell'8/08). L'AI legge, non decide mai.
- Scioperi: v1 conservativa, qualsiasi sciopero aereo del giorno (anche
  handling/ATC locale) + ritardo sopra soglia = incerto; sotto soglia il
  no resta un no. Confronto per codice IATA (voloIata.slice(0,2)).
- Esclusi dal seed: scioperi revocati e settori non di linea (elicotteri).
- Open-Meteo implementato ma spento finché Valerio non paga il piano.
- PEC solo dal registro imprese; email reclami solo se vista su pagine del
  dominio ufficiale (Air Europa sì; ITA, Lufthansa, Emirates no).

## File toccati in questo giro
lib/copy.ts (frase documenti + blocco pratica.documenti) ·
lib/ocr/carta-imbarco.ts (nuovo) · app/api/pratiche/[id]/documento/route.ts
(nuovo) · components/pratica/CaricaDocumento.tsx (nuovo, montato in
app/pratica/[id]/page.tsx) · lib/lettera/compagnie.ts (10→20) ·
lib/lettera/genera.ts (riga meteo opzionale) ·
app/pratica/[id]/lettera/page.tsx (meteo + payload_grezzo) ·
lib/meteo/openmeteo.ts (nuovo) · lib/scioperi/scioperi.ts (nuovo) ·
lib/voli/distanza.ts + lib/dati/aeroporti.json (nuovi) ·
lib/voli/verifica.ts (strato scioperi) · lib/voli/fornitori/aerodatabox.ts
(IsOperator, km di riserva) · lib/regole/eu261.ts + casi-oro.ts (2026.08.3)
· supabase/2026-08-09-scioperi.sql · STATO/PIANO/ARRETRATI/HANDOFF.

## Cosa resta da fare
1. **Deploy**: il sito online è fermo a prima di f4e05a5. Serve Valerio
   (manuale) o una sessione col connettore Netlify autorizzato.
2. #25 Osservatorio con le statistiche ritardi AeroDataBox (ultimo pezzo
   numerato).
3. Scioperi di ottobre a inizio settembre (cruscotto MIT dal PC).
4. Onboarding mobile ancora al prodotto viaggi (col tracker completo).
5. Serve Valerio: chiavi su Netlify, prodotti Polar + approvazione org,
   fatturazione Gemini, dominio, social, legale.
