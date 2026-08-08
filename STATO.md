# STATO — Rivoglio

**Aggiornato:** 2026-08-08, alba (giro #28: chiave volo su Netlify e motore
collaudato ONLINE, Osservatorio coi dati veri, hero col glow, scanner
carta d'imbarco, foto footer raddrizzata)
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
  2026.08.3, tre stati (idoneo · incerto: MAI vendere · non idoneo).
  Dal giro #26: senza quality "Live" sull'arrivo NESSUN verdetto (una stima
  non è un fatto), codeshare non risolto sopra soglia = incerto (la lettera
  deve andare al vettore operativo). Dal giro #27: sciopero aereo noto nel
  giorno del volo e ritardo sopra soglia = incerto (sotto soglia il no
  resta un no). Golden set di 32 casi etichettati a mano col PRIMO CASO
  REALE (FR4001 del 6/08, 155 min, non idoneo) e 2 trappole sciopero, eval
  bloccante: falsi positivi 0.
- **La rinuncia al recesso (#21) è nel flusso**: spunta esplicita (art. 59
  Cod. Consumo, testo versionato in `lib/pratiche/recesso.ts`) prima del
  rimando a Polar, registrata in `verifiche.rinuncia_recesso_il/testo`; la
  rotta di checkout NON lascia passare senza firma e il webhook la copia
  nella cronologia della pratica. Migrazione applicata sul Supabase vero
  (4 colonne verificate, `supabase/2026-08-08-recesso-e-live.sql`).
- **La seconda fonte sono i documenti dell'utente (decisione di Valerio,
  8/08)**: AviationStack free è morta (solo tempo reale, licenza personale).
  Dentro la pratica, dopo il pagamento, c'è il caricamento della carta
  d'imbarco o dell'email della compagnia: Mistral OCR trasforma l'immagine
  in testo, l'estrazione dei campi è a regex, il confronto coi dati
  verificati è deterministico. Concorde = evento in cronologia; discorde =
  verifica in conferma umana, MAI un cambio di verdetto dal codice. Il FILE
  NON SI SALVA (si legge, si registra l'esito, si scarta). La landing dice
  la frase dettata: "Incrociamo i dati ufficiali del volo con i tuoi
  documenti. Se non concordano, il caso è incerto e non paghi."
- **Lo strato dei fatti**: AeroDataBox (dalla spec ufficiale, orario ruote a
  terra, mai gonfiato) + demo marcata senza chiave. Cache per volo+data,
  payload grezzo archiviato come prova. Distanze di riserva da
  `lib/dati/aeroporti.json` (OpenFlights, 6.072 scali IATA, zero API).
- **20 compagnie, scioperi e meteo (giro #27)**: `lib/lettera/compagnie.ts`
  da 10 a 20 canali reclamo, riverificati l'8/08 da una squadra di ricerca
  (entità legale, paese, NEB, indirizzo postale, fonti). FR, U2, W6, V7 e
  DY dichiarano per iscritto che lavorano solo il reclamo inviato dal
  passeggero: il modello di Rivoglio con loro è l'unico che funziona.
  Tabella `scioperi` sul Supabase vero con 10 scioperi giugno-settembre
  2026 (migrazione `20260809_scioperi`, fonti ENAC e testate; il cruscotto
  MIT dalla sandbox è bloccato, da riverificare dal PC). Meteo storico
  Open-Meteo nella lettera pronto ma SPENTO: l'archivio a uso commerciale
  richiede il piano Professional, circa 99 USD/mese (verificato dal
  sorgente ufficiale del sito); si accende con OPENMETEO_COMMERCIALE=1.
- **Il funnel web-first**: check senza login/email/app; il reveal con
  l'importo che sale; email chiesta DOPO; Polar (checkout link + webhook con
  firma Standard Webhooks provata su 10 casi); lettera deterministica coi
  canali reclamo verificati di 10 compagnie; email T+0/2/15/30/60; garanzia
  90 giorni; tracker web; `/admin` = conferma umana (shadow mode acceso).
- **Prove**: web 208/210 Playwright (2 = rete sandbox verso Supabase),
  eval 35/35 sui 32 casi d'oro, mobile tsc/lint/jest 29/29. Una prova
  vieta per sempre "hai diritto a" e il trattino lungo nei testi visibili.
- **Schema dati applicato sul Supabase vero** (voli, verifiche, pratiche,
  eventi + RLS) via Composio, come migrazione tracciata.
- **SEO/GEO**: robots, sitemap, JSON-LD Organization+WebSite, llms.txt,
  canonical, metadata Rivoglio ovunque.
- **ONLINE: https://rivoglio.netlify.app COL MOTORE VERO COLLAUDATO**
  (8/08 alba): il "FR4001 non funziona" di Valerio era SOLO la chiave
  AERODATABOX_API_KEY mancante su Netlify (il sito girava in demo).
  Messa via connettore, rideploy, controprova sul sito vero: FR4001 del
  6/08 → non idoneo, 155 minuti, orari veri, demo:false. Su Netlify ora
  ci sono TUTTE le chiavi: Supabase secret, Resend, Mistral, AeroDataBox
  (manca solo Polar, che ancora non esiste). ATTENZIONE connettore: il
  flag "secret" del connettore Netlify fallisce IN SILENZIO (risponde
  "upserted" ma non salva): le variabili vanno scritte senza quel flag.
  L'ultimo giro (design + Osservatorio dati veri) NON è ancora deployato:
  lo pubblica Valerio (scelta sua col popup). Filiera provata: zip del
  ramo da GitHub sul workbench Composio, client Netlify con l'URL firmato
  del connettore, `netlify.toml` con [build] E [[plugins]] obbligatori.
- **La web app è APERTA A TUTTI dall'8/08** (decisione di Valerio, ribaltata
  la scelta del pivot): `/app` senza account col check libero (CheckRapido),
  link "Entra" in nav e "La web app" nel footer. `/admin` resta chiuso.
- **L'APP MOBILE È RIVOGLIO (8/08, due giri)**: niente più tracce del
  prodotto viaggi. Tre tab: **Controlla** (il check, prima schermata),
  **Pratiche**, **Profilo**. Nessuna tab è protetta: il check funziona
  senza account, come sul sito; le pratiche invitano a entrare invece di
  sbattere un muro. Il verdetto ha la sua schermata coi tre esiti.
  Il motore NON è duplicato: `mobile/src/lib/api.ts` chiama la stessa
  `/api/verifica` del sito (EXPO_PUBLIC_SITO punta al server locale in
  sviluppo). CANCELLATI: onboarding viaggi, registrati, destinazioni,
  ricerche, `src/motore/` (punteggio viaggi), tipi e componenti relativi.
  Prove: tipi puliti e 4 prove nuove sul campo data (l'unico punto dove
  un testo diventa un dato per il motore).
- **CORS sul check (8/08)**: `/api/verifica` risponde con
  Access-Control-Allow-Origin *. Serve all'app: senza, il browser blocca
  la risposta e l'app dice "sei offline" pur avendo rete.
- **Anteprima mobile da Windows**: guida in `mobile/ANTEPRIMA-WINDOWS.md`
  (clone nella cartella utente, `BROWSER=none`, F12 per la vista
  telefono). Su iPhone fisico non si può: Expo Go dell'App Store è fermo
  all'SDK 54 e noi siamo al 57, servirebbe TestFlight.
- **L'Osservatorio ha i dati VERI (#25, 8/08 alba)**: tabella
  `osservatorio_ritardi` sul Supabase vero (migrazione applicata), indice
  ritardi AeroDataBox (0-5 sugli arrivi delle ultime 2 ore) per gli 8
  aeroporti scelti da Valerio col popup (FCO MXP LIN BGY VCE NAP CTA BLQ),
  cache di 24 ore rinnovata da /api/osservatorio, striscia nella sezione
  scura della landing. Prima rilevazione vera seminata (notte: 4 scali con
  indice, gli altri senza traffico = nascosti, onestà). Senza chiave o
  senza DB la striscia sparisce, mai un errore.
- **Il giro di design dell'8/08 alba**: hero con lo stile dell'Osservatorio
  su fondo chiaro (corsivo verde col glow; il corsivo era SPARITO per un
  aggancio rotto dal cambio headline 12 mesi, trovato con lo screenshot);
  scanner rifatto come vera carta d'imbarco (componente condiviso
  `CartaImbarcoScan`: fascia scura, campi in lettura, codice a barre,
  timbro CE 261/2004, raggio con nucleo luminoso) usato da hero e pagina
  verdetto; punti fiducia in striscia allineata (niente piramide); sezioni
  ravvicinate (py-24/28 → 16/20) e titoli leggermente più grandi; bottone
  del retroattivo centrato su telefono; sezione dato oggettivo centrata su
  telefono; foto del footer analizzata pixel per pixel: telefono già
  dritto, il difetto era il polso tagliato dal bordo SINISTRO; ritagliata
  al polso (esce solo dal fondo card), telefono al centro ottico, 205KB.
- **Chiavi**: GEMINI, FIGMA, MISTRAL e AERODATABOX in
  `.env.development.local`.
  Gemini: rete e chiave ok ma quota immagini 0 sul piano gratuito, serve
  la fatturazione su Google AI Studio. Manca UNSPLASH_ACCESS_KEY.
- **DEPLOY AUTOMATICO: il repo GitHub è collegato a Netlify** (8/08,
  mossa di Valerio). Ogni push sul ramo = build e deploy da soli. Il
  primo build da repo moriva con "plugin-nextjs missing manifest.yml":
  nei build da repo il plugin dichiarato in netlify.toml va installato
  come devDependency (fatto, `@netlify/plugin-nextjs`). Controprova:
  il sito vero serve il giro design. Niente più giri manuali né zip.
- **Le pagine legali esistono (8/08)**: /privacy, /condizioni e /cookie
  (linkate dal footer, in sitemap). PRIMA BOZZA onesta: solo cookie
  tecnici quindi niente banner (linee guida Garante 2021), documenti
  OCR mai salvati, rinuncia recesso art. 59, garanzia 90 giorni, foro
  del consumatore. Titolare indicato col contatto valerio@artecai.it:
  cognome e dati societari da completare, revisione legale in ARRETRATI.
- **CLAUDE.md ha il "Protocollo operativo"** dettato da Valerio (8/08):
  rg in un colpo, edit con stringa unica, niente subagenti per task
  piccoli, checkpoint e degrado. Le 4 regole che erano doppie (checkpoint,
  task nuovo, degrado, HANDOFF) ora vivono SOLO lì: il PROTOCOLLO
  CONTESTO tiene metodo batch, /compact vs /clear e "un task = una
  unità committabile".
- **Le colonne dell'hero sono le barre del riferimento (8/08)**:
  attaccate (gap 0), QUADRATE in ogni estremo (raggio 0, colore fino al
  bordo basso), a tutta larghezza (flex 1), base di luminosità 0.55 e
  picco 1. L'onda accende una colonna alla volta da sinistra a destra,
  giro di 8,3 secondi. A separarle è la tinta pari/dispari, non il vuoto.
- **Variabili d'ambiente di Claude, una volta sola**: `.claude/settings.json`
  (tracciato) porta USE_BUILTIN_RIPGREP=0 e ENABLE_TOOL_SEARCH=auto:5, e
  vale su OGNI macchina che apre il repo. I segreti no: FIGMA_API_KEY sta
  in `.claude/settings.local.json`, che è in .gitignore.
- **Guida anteprima mobile da Windows**: `mobile/ANTEPRIMA-WINDOWS.md`
  (Android Studio + emulatore, oppure `expo start --web` in 2 minuti).

## Serve Valerio (in ordine)
1. **Deploy dell'ultimo giro** (design + Osservatorio dati veri): il ramo è
   pronto e collaudato, pubblichi tu (tua scelta col popup). Il motore
   online funziona già.
2. **Polar**: creare i 2 prodotti (pratica 14,90 · famiglia 24,90), darmi i
   checkout link e il segreto webhook; chiedere SUBITO l'approvazione
   dell'organizzazione (~2 settimane).
3. **Email**: l'iscrizione all'Osservatorio dal sito vero è stata provata
   con valerio@artecai.it: controlla la casella, l'email di benvenuto deve
   esserci. Resend spedisce SOLO lì finché il dominio non è verificato.
4. **Scioperi e meteo**: riverifica le date scioperi sul cruscotto MIT
   (scioperi.mit.gov.it, la sandbox non lo apre) e a inizio settembre
   aggiungi quelli di ottobre. La riga meteo nel reclamo si accende solo
   col piano Open-Meteo Professional (~99 USD/mese): decidi quando ci sono
   incassi. Alla prossima fattura AeroDataBox chiedi la profondità storica.
   Poi 30 casi reali a mano per il golden set.
5. **Dominio** per Rivoglio (slot gratuito Hostinger da configurare) e
   account social `@rivoglio`.
6. Legale: le 3 pagine (privacy, condizioni, cookie) sono una PRIMA BOZZA
   scritta l'8/08: falle rivedere da un avvocato e dammi cognome e dati
   societari del titolare da inserire. Commercialista sul regime fiscale
   (il documento stesso lo chiede). Fatturazione Google AI Studio per
   Gemini e UNSPLASH_ACCESS_KEY quando l'approvazione arriva.

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
- La tabella `scioperi` non ha API: si aggiorna a mano con una migrazione.
  `compagnie` usa SOLO codici IATA; vuoto = sciopero generale, vale per
  tutti i voli del giorno.
- OPENMETEO_COMMERCIALE assente = modulo meteo muto per scelta: la lettera
  esce senza riga meteo, nessun errore. Non "sistemarlo".
