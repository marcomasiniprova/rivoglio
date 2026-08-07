# ARRETRATI — cose chieste da Valerio

*Creato il 2026-08-06 dopo che Valerio ha fatto notare, giustamente, che
chiedeva cose che poi non venivano fatte e nessuno gliene rendeva conto.*

**Regola: si aggiorna a ogni sessione. Niente sparisce da qui senza essere
stato fatto o senza che Valerio dica di lasciar perdere.**

---

## ✅ CHIUSI il 06/08

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 1 | **Landing "da urlo, cinematica bella"** | Motion 13. Ingressi allo scroll, sfalsamento fra le card, sollevamento al passaggio del mouse, contatori che salgono. |
| 2 | **AI Vacation Builder** | `lib/costruttore.ts` + `/api/costruttore` + sezione «Dove arrivi con quello che hai» sulla landing. Dai partenza, budget, notti, persone e voglia, ti dà 3 posti veri con distanza, ore, costo auto calcolato e quanto ti resta per dormire. **16 prove.** |
| 3 | **"Voglio esplodere sui social"** | `CONTENUTI.md`: formato video ripetibile, 12 aperture, 3 script pronti, ritmo, canali, cosa non fare, come si misura. |
| 4 | **Skill `webapp-testing`** | `.claude/skills/prova-browser/SKILL.md`: guida Playwright, legge console e DOM, cattura e **guarda** le schermate, con la tabella delle trappole già pagate su questo progetto. |
| 5 | **Esplorare il codice di Zentivo** | Fatto, e ha cambiato la strategia. Vedi sotto. |
| 6 | **Copy professionale** | Tolti tutti i trattini lunghi dal testo visibile. Riscritte le sezioni dal tono da confessione. |
| 7 | **Tenerti aggiornato** | `PIANO.md`: mappa in tre pezzi, percentuali, cosa blocca cosa. |
| 8 | **Telefono rotto** | Nav compatta sotto i 420px, titolo che rientra, `overflow-x` bloccato. Catture automatiche anche su telefono. |
| 9 | **Sfondo brutto** | Erano macchie bianche sparse a caso. Ora: un alone verde unico centrato sul titolo più una trama a puntini. |
| 10 | **Animazioni tipo ScrollRevealText e Typewriter** | `TestoRivelato.tsx` (testo che si accende parola per parola con lo scroll) e `Macchina.tsx` (macchina da scrivere), ricavati dai due moduli Framer che avevi linkato. |

### Cosa ha rivelato il bundle di Zentivo
**Zentivo non fa lo sfondo in CSS: usa fotografie**, alcune da 4923×4778 pixel
(cielo, mano che regge il telefono, card). Per questo sembrava «di un altro
livello»: è artwork professionale, non codice. Imitarlo con i gradienti è una
gara persa. La strada giusta è un design pulito e preciso che sta in piedi da
solo. **Se un giorno vuoi quel look, serve un grafico o delle immagini vere,
non altro codice.**

---

---

## ✅ CHIUSI il 06/08 — secondo giro

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 11 | **Login** | Email+password, link magico, conferma via email. `proxy.ts` chiude `/app`. Messaggi di errore tradotti in italiano. **16 prove.** |
| 12 | **La pagina app** | `/app`: imposti partenza, budget, ore, notti, persone, voglia. Ogni ricerca mostra dove arrivi oggi con quel budget. Pausa, riaccendi, cancella. |
| 13 | **"Non vedo UI e UX"** | Le pagine esistono e si guardano: `/entra` fotografata, `/app` appena crei `.env.local`. |
| 14 | **Tech stack avanzato, shadcn** | shadcn/ui montato a mano (Button, Input, Label, Card) sui nostri colori, Radix sotto, Motion 13 sopra, lucide per le icone. Niente `init`: avrebbe riscritto `globals.css`. |
| 15 | **Il piano completo in tre fasi** | `PIANO.md` riscritto: COSTRUISCI · DISTRIBUISCI · MANTIENI, con le percentuali vere. |
| 16 | **Marketing e distribuzione** | `DISTRIBUZIONE.md`: imbuto TOFU/MOFU/BOFU, personaggio AI, blog quotidiano, community, creator, calendario, cosa faccio io e cosa serve da te. |
| 17 | **Iscritti su file** | Spostati su Supabase. In produzione senza chiavi si alza un errore invece di perderli in silenzio. |

---

## ✅ CHIUSI il 07/08 — terzo giro

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 18 | **Auth rotta ("link scaduto")** | Erano il rimbalzo di Supabase senza token + la lista redirect vuota. Sistemati entrambi, autoconferma accesa: registrazione immediata, provata dal vivo. |
| 19 | **Email su Resend, non Supabase** | 8 email (benvenuto, conferma, link, ricerca, destinazione, crediti, ricevuta) + gancio Send Email. |
| 20 | **Vocabolario italiano** | "alert" → **destinazione**, in 20 file: landing, app, email, prove. |
| 21 | **Bottoni rettangolari + vetro** | Raggio 9px ovunque, vetro sui secondari, riflesso al passaggio. |
| 22 | **Badge App Store / Google Play** | Nel footer, disegnati a mano, inerti con "Presto su" (un badge cliccabile verso il nulla è pratica ingannevole). |
| 23 | **Corsivo + luce in tutte le sezioni** | 12 titoli col serif corsivo e ombre a due aloni. |
| 24 | **Sfondo hero vivo** | Colonne a fisarmonica più ampie + faro di luce che le attraversa. Parallasse sulla foto di Manarola. |
| 25 | **Google sign-in** | Bottone con la G ufficiale, flusso già collegato a /auth/conferma. Si accende con Client ID + Secret. |
| 26 | **Il motore (blocco B)** | Raccolta Exa → anagrafe `strutture` → pannello `/admin` → abbinamento → **prima destinazione partita davvero** (Rimini, 147€, credito 3→2, rimborso provato sul fallimento). |

## ✅ CHIUSI il 07/08 — quarto giro: controllo completo della repo (chiesto da Valerio)

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 27 | **"Controlla che tutto sia a posto"** | Repo letta per intero (documenti, codice, prove). `npm run verify`: build, tipi e lint passano; prove 106/108 nella sandbox remota. Le 2 fallite sono la stessa prova (iscrizione con email valida) e falliscono solo perché la rete della sandbox blocca Supabase con un 403: sul tuo PC passano tutte e 108. |
| 28 | Errori trovati dal controllo, corretti subito | **Data dell'esempio sulla landing**: diceva "ven 9 ago", ma il 9/8/2026 è domenica. Ora: ven 14 · dom 16 ago (calendario verificato). **Trattino lungo** tolto dai due testi visibili che lo avevano (versione testo dell'email destinazione, data dell'esempio). **`.env.example` completato**: mancavano EXA_API_KEY, MOTORE_SEGRETO e RESEND_HOOK_SECRET, e il commento mandava nella trappola di `.env.local` in UTF-16. |

## ✅ CHIUSI il 07/08 — quinto giro: il pivot mobile (pomeriggio)

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 29 | **"Togli dalla landing ogni collegamento con l'app"** | Via "Entra" e ogni CTA verso `/entra` e `/app` da 11 componenti. Tutto porta alla lista d'attesa, la FAQ e i canali raccontano l'app in arrivo sugli store. Prova nuova: zero `href` verso l'app web in pagina. |
| 30 | **"Che framework suggerisci? Fai ricerche online"** | Tre esperti con fonti: **Expo SDK 57** (riusa TypeScript e Supabase, EAS compila iOS senza Mac). Vincoli store verificati e scritti in `DECISIONI.md`. |
| 31 | **"Costruisci un team di agenti e fammi l'app"** | 8 agenti coordinati (backend, UI, copy, AI, 3 frontend, QA): app in `mobile/` con onboarding in 6 passi, tab Destinazioni/Ricerche/Profilo, dettaglio col conto aperto, punteggio preferenze. Esito verificato due volte: tsc 0 errori, lint pulito, **29 prove su 29**. |
| 32 | **"Usa Composio"** | Usato per operare sul tuo Supabase vero (la sandbox non lo raggiunge): schema di `profili` verificato colonna per colonna e **migrazione `expo_push_token` applicata e riverificata** in produzione. |

## ✅ CHIUSI il 07-08/08 — sesto giro: il pivot Rivoglio

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 33 | **"Elimina ogni traccia del vecchio nome, rinomina tutto in Rivoglio"** | Repo GitHub rinominata in `rivoglio` (remote ripuntato, push provato), progetto Supabase rinominato, bundle `it.rivoglio.app`, codice e documenti ripuliti. Via Composio, senza rifare nulla da zero. |
| 34 | **"Esplora il documento e costruisci il prodotto"** | Documento (1432 righe) letto per intero, `SPEC.md` riscritto come bibbia. Costruito tutto: motore EU261 deterministico (`lib/regole/eu261.ts`, 3 stati, l'AI non decide mai), golden set 25 casi + eval bloccante falsi positivi 0, strato voli (AeroDataBox + AviationStack + demo marcata), check gratuito senza login, reveal, Polar (webhook firmato, provato 10/10), lettera coi canali verificati di 10 compagnie, follow-up T+0/2/15/30/60, tracker, `/admin` in shadow mode. Schema (voli, verifiche, pratiche, eventi) applicato sul Supabase vero. |
| 35 | **"Web app Next + app mobile Expo"** | Web completa (16 pagine). Mobile: pivot minimo a tab Pratiche/Profilo; il tracker completo arriva dopo che il web incassa (il documento è chiaro: l'app non è la porta d'ingresso). |
| 36 | **"Netlify col connettore collegato a te"** | Progetto `rivoglio` creato via connettore, 5 variabili impostate, `rivoglio.netlify.app` riservato. |
| 37 | **"/impeccable, poi /taste-skill, poi /seo, prima del deploy"** | Fatti in quest'ordine. Impeccable: schermate desktop/mobile/reveal verificate, detector a 0. Taste: trattini lunghi 0, occhielli 7→4, CTA coerenti. SEO: robots, sitemap, JSON-LD, llms.txt, canonical, metadata Rivoglio (tutti provati con 200 sul server di sviluppo). |
| 38 | **"Installa le skill di Emil Kowalski"** | 9 skill ufficiali in `.claude/skills/` (animate, apple-design, prototype, review-animations e le altre). |
| 39 | **"Le 3 fasi: SVILUPPO, DISTRIBUZIONE, MIGLIORAMENTO"** | `PIANO.md` riscritto con le tre fasi come le hai definite + artefatto visivo della fase SVILUPPO consegnato. |
| 40 | **"UI come le 4 foto di riferimento"** | Direzione registrata in `BRAND.md` (luce e aria, vetro smerigliato, card pulite, stepper): cielo sull'hero, form col bordo che pulsa, reveal col contatore, schermate di conferma consegnate. |

## ✅ CHIUSI l'8/08 — settimo giro: logo definitivo e rifiniture dal vivo

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 41 | **"Logo nuovo definitivo, posizionalo benissimo e migliora la qualità"** | Sfondo tolto col riempimento dai bordi, solo la lente estratta come componente connesso, upscalata a 1024px e affilata. Montata in nav, footer e card di condivisione via `components/Logo.tsx`; scritta accanto in due toni (Rivo scuro, glio verde) come nel lockup. Icone rifatte: `app/icon.png` 512, `apple-icon.png` 180, favicon.ico, manifest e JSON-LD aggiornati. Vecchio segno (sole e strada) eliminato. |
| 42 | **"Nel footer l'immagine del telefono come il riferimento, senza sfondo"** | La tua foto ripulita (sfondo a righe tolto, tenuto solo il componente mano+telefono, 878x1257) in una card bianca sul footer scuro: titolo, testo, bottone verde e il telefono che entra dal bordo basso. Come la quarta immagine, coi nostri colori. |
| 43 | **"La scritta Rivoglio in basso più grande e occupante"** | Maiuscola come nel lockup, fino a 15rem, taglio sul bordo basso, sfumatura menta. Occupa tutta la larghezza. |
| 44 | **"FAQ: testo in disparte, centralo"** | Titolo centrato sopra le domande, lista in colonna da 760px. Prima era una griglia con la colonna laterale. |
| 45 | **"Newsletter schiacciata piccolissima"** | Trovata la causa vera: `flex-1` sul campo email dentro un contenitore in colonna (sul telefono governa l'altezza, non la larghezza): campo a 27px contro i 52 del bottone. Ora `sm:flex-1`: 52px misurati, prova visiva fatta. |

## ✅ CHIUSI l'8/08 — ottavo giro: la squadra del design

| # | Cosa avevi chiesto | Come è stato chiuso |
|---|---|---|
| 46 | **"Installa questi MCP"** | `.mcp.json` nel repo (vale per ogni sessione futura, anche sul tuo PC): playwright (gli occhi), context7 (documentazione vera di GSAP/Motion/Lenis), shadcn (componenti veri), figma (serve FIGMA_API_KEY), blender (gira solo dove c'è Blender aperto + uv, non nella sandbox). |
| 47 | **"Installa la skill art-director"** | `.claude/skills/art-director/SKILL.md`, identica al tuo file, più il subagente `art-director` in `.claude/agents/` che la segue fase per fase. |
| 48 | **"Scrivi gen-asset.ts"** | `scripts/gen-asset.ts` + `npm run asset`: Gemini per le scene, Unsplash per le foto (col credito), WebP sotto 1MB in `/public/assets/`. Servono GEMINI_API_KEY e UNSPLASH_ACCESS_KEY. |
| 49 | **"Salva le regole d'oro"** | In CLAUDE.md: realismo = asset, orchestrazione = codice; le hero belle sono immagini; una sezione per volta; loop visivo con gli occhi; vietati i pattern slop. |

## ⏳ ANCORA DA FARE

### Per Rivoglio (dal documento, rimandati di proposito)
- **Golden set da 25 a 100+ casi** man mano che passano voli veri (il
  documento chiede di arricchirlo con casi reali etichettati a mano).
- **Tracker mobile completo** (oggi tab minima): dopo i primi incassi web.
- **Contatore rate-limit condiviso**: oggi il tetto 20/min per IP vive in
  memoria del singolo processo; con più istanze serve Supabase o KV.
- **Verticali di contenuto** (rotte per compagnia/aeroporto) e Osservatorio
  come newsletter: fase DISTRIBUZIONE.
- **Bagagli (settembre) e treni (ottobre)**: espansioni previste dal
  documento, non si toccano ora.

### [SUPERATI dal pivot del 07/08 sera — idea viaggi chiusa da Valerio]
<details>
<summary>Arretrati dell'idea viaggi (congelati, non cancellati)</summary>
- **Il passo "avvisi" può essere scavalcato**: provato dal vivo nel browser,
  dopo la registrazione lo smistamento della radice porta subito alle tab
  prima che la schermata del permesso notifiche si veda. Da verificare su
  telefono e sistemare (vincolare lo smistamento mentre si è nel gruppo
  benvenuto, o chiedere il permesso dal feed).
- **Prova sul telefono vero** (Expo Go per il giro veloce, build di sviluppo
  per le notifiche): serve il telefono di Valerio.
- **Account store**: Apple Developer (99$/anno) e Play Console (25$ +
  12 tester × 14 giorni). Sono il collo di bottiglia dei tempi.
- **Canale push nel motore**: `lib/alert/invia.ts` oggi manda email;
  aggiungere l'invio al token `expo_push_token` (API di Expo) come canale
  primario quando esiste.
- **Il dettaglio destinazione ricava persone e soglia dalla prima ricerca
  attiva**: `invii` ha già `ricerca_id`, va selezionato in
  `caricaDestinazioni` e usato per prendere la ricerca giusta.
- Schermate vere dell'app nella landing (dall'export web appena stabile).
- Benzina ferma (1,994) anche in 2 punti dell'app mobile: si sistema
  insieme al lettore MIMIT.

- Cron in produzione per raccolta/abbinamento (endpoint pronti, serve MOTORE_SEGRETO su Netlify)
- Bot Telegram (il codice c'è, manca TELEGRAM_BOT_TOKEN)
- Acquisto crediti con Polar (serve partita IVA). Nel codice di Polar non c'è
  ancora niente: è l'unico pezzo di prodotto tutto da scrivere.
- Schermate vere dell'app dentro la landing al posto del telefono disegnato

### Aperti dal controllo del 07/08 (decisioni o pezzi nuovi)

- **La camera per quante persone vale?** Le offerte non hanno una capienza:
  il motore divide il prezzo camera per le persone della ricerca (1-8).
  Una ricerca in 4 su una doppia produce un totale falso. Oggi regge solo
  la verifica umana, ma il pannello non chiede "per quante persone vale
  questo prezzo". Serve una decisione di Valerio (campo in più, o limite).
- **Lettore del prezzo benzina dal MIMIT**: 1,994 è scritto fisso in 7 file
  (motore, pagina app, API costruttore, onboarding, landing). La regola dice
  "mai scritto fisso": ogni settimana che passa i conti invecchiano.
- **Rimborso credito atomico**: `restituisciCredito` riscrive il valore
  letto prima (`rimasti + 1`). Se fra scalo e rimborso arrivasse un acquisto,
  verrebbe sovrascritto. Oggi non può succedere (niente acquisti), va chiuso
  con una RPC come `consuma_credito` quando entra Polar.

</details>

---

## 📌 COSE CHE VALGONO SEMPRE

- **Obiettivo: fare cassa entro ottobre 2026.** Ogni scelta si giudica così.
- **Prodotto: Rivoglio**, lo scanner dei rimborsi EU261. Check gratis,
  pratica 14,90€, famiglia 24,90€, garanzia 90 giorni. **Chiuso.**
- **Nome: Rivoglio**, per esteso. Tagline: *Riprenditi i soldi che ti devono.*
- **L'incerto non si vende MAI. I falsi positivi sono 0, bloccante.**
- **Web-first**: il check e l'incasso stanno sul web; l'app mobile è il
  tracker post-pagamento, non la porta d'ingresso.
- Bianco e verde. **Polar**, non Stripe (niente partita IVA fino a 10k/mese:
  da confermare col commercialista, il documento stesso lo chiede).
- **Ti servono:** chiave AeroDataBox, prodotti Polar, dominio, account social.
- **Come vuoi che lavori:** tutte le cose chieste in una seduta, domande mentre
  si lavora e non al posto di lavorare, aggiornandoti su dove siamo.
