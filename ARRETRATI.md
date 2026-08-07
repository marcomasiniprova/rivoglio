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

## ⏳ ANCORA DA FARE

### Per l'app mobile (dal pivot del 07/08)
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

---

## 📌 COSE CHE VALGONO SEMPRE

- **Obiettivo: €30-100k entro settembre/ottobre 2026.** Sprint di 2 mesi.
- **Prezzi: crediti, 1 credito = 1 alert.** €3,99 / €12,99 / €24,99. **Chiuso.**
- **Nome: Rivoglio**, per esteso. Tagline: *La tua fuga, al prezzo giusto.*
- **Tutta Italia dal giorno 1.** Bianco e verde. Riferimento: Zentivo.
- **Web app installabile, non nativa.** **Polar**, non Stripe.
- **Ti servono:** partita IVA, dominio, account Polar, account social.
- **Come vuoi che lavori:** tutte le cose chieste in una seduta, domande mentre
  si lavora e non al posto di lavorare, aggiornandoti su dove siamo.
