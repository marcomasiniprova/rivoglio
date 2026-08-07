# STATO — Rivoglio

**Aggiornato:** 2026-08-08, sera
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
  2026.08.1, tre stati (idoneo · incerto: MAI vendere · non idoneo).
  Golden set di 25 casi etichettati a mano, eval bloccante: falsi positivi 0.
- **Lo strato dei fatti**: AeroDataBox (dalla spec ufficiale, orario ruote a
  terra, mai gonfiato) + AviationStack di riserva + demo marcata senza
  chiave. Cache per volo+data, payload grezzo archiviato come prova.
- **Il funnel web-first**: check senza login/email/app; il reveal con
  l'importo che sale; email chiesta DOPO; Polar (checkout link + webhook con
  firma Standard Webhooks provata su 10 casi); lettera deterministica coi
  canali reclamo verificati di 10 compagnie; email T+0/2/15/30/60; garanzia
  90 giorni; tracker web; `/admin` = conferma umana (shadow mode acceso).
- **Prove**: web 190/192 Playwright (2 = rete sandbox verso Supabase),
  eval 28/28, mobile tsc/lint/jest 29/29. Una prova vieta per sempre
  "hai diritto a" e il trattino lungo nei testi visibili.
- **Schema dati applicato sul Supabase vero** (voli, verifiche, pratiche,
  eventi + RLS) via Composio, come migrazione tracciata.
- **SEO/GEO**: robots, sitemap, JSON-LD Organization+WebSite, llms.txt,
  canonical, metadata Rivoglio ovunque.
- **ONLINE: https://rivoglio.netlify.app** (deploy dell'8/08 sera, con
  logo nuovo, footer nuovo e fix). Filiera provata: zip del ramo da GitHub
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

## Serve Valerio (in ordine, il primo è l'unico rischio tecnico)
1. **Chiave AeroDataBox** (RapidAPI, piano Pro ~5$) e la prova delle 2 ore:
   10 voli reali, l'orario EFFETTIVO deve esserci. Poi 30 casi a mano.
2. **Polar**: creare i 2 prodotti (pratica 14,90 · famiglia 24,90), darmi i
   checkout link e il segreto webhook; chiedere SUBITO l'approvazione
   dell'organizzazione (~2 settimane).
3. **Chiavi su Netlify** (progetto `rivoglio`): SUPABASE_SECRET_KEY e
   RESEND_API_KEY (le hai tu). Senza, il sito gira ma admin ed email no.
4. **Dominio** per Rivoglio (slot gratuito Hostinger da configurare) e
   account social `@rivoglio`.
5. Legale su condizioni d'uso; commercialista sul regime fiscale (il
   documento stesso lo chiede).

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
