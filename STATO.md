# STATO — Rivoglio

**Aggiornato:** 2026-08-08, notte (giro #21 recesso + #26 campi veri)
**RIVOGLIO È COSTRUITO E ONLINE.** Il prodotto definito dal documento di
Valerio esiste da capo a fondo: check gratuito sul web col dato oggettivo,
verdetto a tre stati dal motore deterministico, pagamento Polar, lettera di
reclamo pronta, sequenza di follow-up, tracker, admin in shadow mode.
Rifinito con impeccable, taste e seo. Tagline: *Riprenditi i soldi che ti
devono.* Valerio ha messo online una copia su rivoglioo.netlify.app (suo
account) e ha scelto il **logo definitivo: la lente con l'aereo e le barre**
(vedi BRAND). L'8/08 sera: logo montato ovunque, footer con la cartolina
bianca e il telefono in mano (foto sua, sfondo tolto), FAQ centrata,
campo email dell'Osservatorio non più schiacciato sul telefono, immagine
social rifatta (era rimasta al prodotto viaggi).

## Dove siamo
- **Il motore EU261 decide, l'AI mai**: `lib/regole/eu261.ts`, versione
  2026.08.2, tre stati (idoneo · incerto: MAI vendere · non idoneo).
  Dal giro #26: senza quality "Live" sull'arrivo NESSUN verdetto (una stima
  non è un fatto), codeshare non risolto sopra soglia = incerto (la lettera
  deve andare al vettore operativo). Golden set di 30 casi etichettati a
  mano col PRIMO CASO REALE (FR4001 del 6/08, 155 min, non idoneo), eval
  bloccante: falsi positivi 0.
- **La rinuncia al recesso (#21) è nel flusso**: spunta esplicita (art. 59
  Cod. Consumo, testo versionato in `lib/pratiche/recesso.ts`) prima del
  rimando a Polar, registrata in `verifiche.rinuncia_recesso_il/testo`; la
  rotta di checkout NON lascia passare senza firma e il webhook la copia
  nella cronologia della pratica. Migrazione applicata sul Supabase vero
  (4 colonne verificate, `supabase/2026-08-08-recesso-e-live.sql`).
- **La promessa "due fonti" tolta dalla vetrina**: finché AviationStack non
  ha la chiave, landing e FAQ dicono "tracciamento reale del volo" (vero,
  ora lo è anche nel motore). Si ripristina quando la seconda fonte è viva.
- **Lo strato dei fatti**: AeroDataBox (dalla spec ufficiale, orario ruote a
  terra, mai gonfiato) + AviationStack di riserva + demo marcata senza
  chiave. Cache per volo+data, payload grezzo archiviato come prova.
- **Il funnel web-first**: check senza login/email/app; il reveal con
  l'importo che sale; email chiesta DOPO; Polar (checkout link + webhook con
  firma Standard Webhooks provata su 10 casi); lettera deterministica coi
  canali reclamo verificati di 10 compagnie; email T+0/2/15/30/60; garanzia
  90 giorni; tracker web; `/admin` = conferma umana (shadow mode acceso).
- **Prove**: web 204/206 Playwright (2 = rete sandbox verso Supabase),
  eval 33/33, mobile tsc/lint/jest 29/29. Una prova vieta per sempre
  "hai diritto a" e il trattino lungo nei testi visibili.
- **Schema dati applicato sul Supabase vero** (voli, verifiche, pratiche,
  eventi + RLS) via Composio, come migrazione tracciata.
- **SEO/GEO**: robots, sitemap, JSON-LD Organization+WebSite, llms.txt,
  canonical, metadata Rivoglio ovunque.
- **ONLINE: https://rivoglio.netlify.app** ma col DEPLOY VECCHIO dell'8/08
  (logo e footer sì; onda, pricing nuovo, scanner, 12 mesi, recesso NO:
  i commit da `f4e05a5` in poi non sono deployati). Filiera provata: zip del ramo da GitHub
  scaricato sul workbench Composio (la sandbox blocca gli host Netlify),
  client Netlify lanciato da lì con l'URL firmato del connettore. Servono
  TUTTI E DUE i pezzi di `netlify.toml`: senza `[build]` l'upload viene
  pubblicato com'è (sorgenti esposti, home 404); senza `[[plugins]]`
  la build gira ma pubblica `.next` cruda senza server. Ora: 1 function
  (Next.js Server Handler), sorgenti non esposti, API viva.
  Il `rivoglioo.netlify.app` di Valerio è su un ALTRO account Netlify,
  fuori dal connettore e senza le 5 variabili: da dismettere o aggiornare
  a mano, il sito buono è rivoglio.netlify.app.
- **La web app è APERTA A TUTTI dall'8/08** (decisione di Valerio, ribaltata
  la scelta del pivot): `/app` senza account col check libero (CheckRapido),
  link "Entra" in nav e "La web app" nel footer. `/admin` resta chiuso.
- **Mobile**: pivot minimo fatto (tab Pratiche); **l'onboarding è ancora al
  prodotto viaggi** (visto con l'anteprima web dell'8/08, da rifare col
  tracker). Per vederla su iPhone: da maggio 2026 l'Expo Go dell'App Store
  è fermo all'SDK 54 (noi 57), quindi anteprima web (`npx expo start --web`
  dal PC) oppure TestFlight con l'account Apple Developer.
- **Chiavi**: GEMINI_API_KEY e FIGMA_API_KEY in `.env.development.local`.
  Gemini: rete e chiave ok ma quota immagini 0 sul piano gratuito, serve
  la fatturazione su Google AI Studio. Manca UNSPLASH_ACCESS_KEY.
- **Il connettore Netlify si è scollegato di nuovo**: per il prossimo
  deploy va riautorizzato su claude.ai (le modifiche dell'8/08 sera sono
  pushate ma NON ancora online).

## Serve Valerio (in ordine)
1. **Deploy**: il sito online è vecchio. O rifai il giro manuale su Netlify,
   o riautorizzi il connettore su claude.ai e lo faccio io.
2. **Polar**: creare i 2 prodotti (pratica 14,90 · famiglia 24,90), darmi i
   checkout link e il segreto webhook; chiedere SUBITO l'approvazione
   dell'organizzazione (~2 settimane).
3. **Chiavi su Netlify** (progetto `rivoglio`): SUPABASE_SECRET_KEY,
   RESEND_API_KEY, e ora anche AERODATABOX_API_KEY e MISTRAL_API_KEY (in
   locale ci sono, online no: senza la prima il sito vero gira in demo).
4. **Chiave AviationStack** (free tier, hai scelto di crearla tu): accende
   l'incrocio delle fonti e ci fa rimettere "due fonti" in vetrina. Alla
   prossima fattura AeroDataBox chiedi la profondità storica dei piani a
   pagamento. Poi 30 casi reali a mano per il golden set.
5. **Dominio** per Rivoglio (slot gratuito Hostinger da configurare) e
   account social `@rivoglio`.
6. Legale su condizioni d'uso; commercialista sul regime fiscale (il
   documento stesso lo chiede). Fatturazione Google AI Studio per Gemini
   e UNSPLASH_ACCESS_KEY quando l'approvazione arriva (per gli asset).

## Da non rifare
- `.env.local` è in UTF-16 e Next lo ignora: chiavi vive in
  `.env.development.local`.
- Il fornitore demo si accende DA SOLO senza AERODATABOX_API_KEY: i voli
  demo iniziano per ZZ e ogni risposta è marcata demo.
- SHADOW_MODE=1 in produzione finché 100 verdetti di fila non passano
  puliti: si spegne dal pannello, non dal codice.
- Le 2 prove Playwright dell'Osservatorio falliscono SOLO nella sandbox
  (rete verso Supabase bloccata): sul PC di Valerio passano.
- Le tabelle viaggi (offerte, ricerche, invii, strutture) sono eredità nel
  DB: non usarle, non cancellarle.
- Resend in prova spedisce SOLO a valerio@artecai.it finché il dominio non
  è verificato.
