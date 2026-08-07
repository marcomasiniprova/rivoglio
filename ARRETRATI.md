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

## ⏳ ANCORA DA FARE

- Cron in produzione per raccolta/abbinamento (endpoint pronti, serve MOTORE_SEGRETO su Netlify)
- Bot Telegram (il codice c'è, manca TELEGRAM_BOT_TOKEN)
- Acquisto crediti con Polar (serve partita IVA)
- Schermate vere dell'app dentro la landing al posto del telefono disegnato

---

## 📌 COSE CHE VALGONO SEMPRE

- **Obiettivo: €30-100k entro settembre/ottobre 2026.** Sprint di 2 mesi.
- **Prezzi: crediti, 1 credito = 1 alert.** €3,99 / €12,99 / €24,99. **Chiuso.**
- **Nome: Viaggio Anche Io**, per esteso. Tagline: *La tua fuga, al prezzo giusto.*
- **Tutta Italia dal giorno 1.** Bianco e verde. Riferimento: Zentivo.
- **Web app installabile, non nativa.** **Polar**, non Stripe.
- **Ti servono:** partita IVA, dominio, account Polar, account social.
- **Come vuoi che lavori:** tutte le cose chieste in una seduta, domande mentre
  si lavora e non al posto di lavorare, aggiornandoti su dove siamo.
