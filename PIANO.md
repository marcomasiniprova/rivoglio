# PIANO — Viaggio Anche Io

*Se leggi un file solo, leggi questo. Risponde a una domanda: **a che punto siamo?***

**Obiettivo: €30-100k entro settembre/ottobre 2026.** Sprint, non maratona.
Ogni scelta si giudica così: avvicina il primo utente pagante o no?

---

## Le tre fasi

```
  FASE 1               FASE 2                  FASE 3
  COSTRUISCI     →     DISTRIBUISCI      →     MANTIENI
  prodotto vero        traffico e vendite      utenti e crescita

  █████████░░░ 75%     ██░░░░░░░░░░ 15%        ░░░░░░░░░░░░ 0%
```

Le fasi si **sovrappongono**: la distribuzione non aspetta che il prodotto sia
finito, altrimenti arrivi a settembre con un'app perfetta e zero persone che la
conoscono. Appena c'è qualcosa da mostrare, si comincia a mostrarlo.

---

# FASE 1 — COSTRUISCI

**Fatta quando:** uno sconosciuto si registra, imposta una ricerca, riceve un
alert vero e può comprare crediti. End to end, senza che io tocchi niente.

## 1.1 La vetrina (landing) — 95%

| | Stato |
|---|---|
| 13 sezioni in stile Zentivo, in verde | ✅ |
| Colori, caratteri, logo, marchio | ✅ |
| Movimento: scroll, testo rivelato, macchina da scrivere | ✅ |
| Costruttore di micro-vacanze provabile senza iscriversi | ✅ |
| Telefono e sfondo sistemati | ✅ |
| Iscritti salvati su Supabase (non più su file) | ✅ |
| Link "Entra" e "Provalo gratis" verso l'app | ✅ |
| Schermate vere dell'app dentro la landing | ⏳ appena `.env.local` esiste |
| Immagine di anteprima per i social (og:image) | ⏳ |

## 1.2 Il motore e il pannello (web) — il retrobottega, resta e serve

| | Stato |
|---|---|
| Database, schema, RLS, buco sui crediti chiuso | ✅ |
| Motore che abbina offerte e ricerche (a lotti, limite 10s) | ✅ **provato dal vivo il 07/08** |
| Invio destinazioni via email (Resend) con scalo e rimborso del credito | ✅ |
| Pannello `/admin`: verifica offerte, raccolta e abbinamento a mano | ✅ |
| Cron in produzione (endpoint pronti, serve MOTORE_SEGRETO su Netlify) | ⏳ |
| Invio come notifica push all'app (canale nuovo in `lib/alert/invia.ts`) | ⏳ |
| La web app utente (`/app`, `/entra`) esiste ma non è più linkata: il prodotto è l'app mobile | ✅ |

## 1.2bis L'APP MOBILE — il prodotto (pivot del 07/08)

Expo SDK 57, React Native, stessa Supabase. Contratti in `mobile/PROGETTO.md`.

| | Stato |
|---|---|
| Impalcatura, marchio, icone dal logo, caratteri del sito | ✅ 07/08 |
| Motore di calcolo portato (viaggio, costruttore, destinazioni) | ✅ 07/08 |
| Fondamenta: Supabase, sessione, dati, notifiche, componenti, testi | 🔨 in corso 07/08 |
| Onboarding in 6 passi (valore prima dell'account) + accesso | 🔨 in corso 07/08 |
| Tab: Destinazioni, Ricerche, Profilo + dettaglio col conto aperto | 🔨 in corso 07/08 |
| Punteggio preferenze (il seme dell'AI: impara da cosa apri) | 🔨 in corso 07/08 |
| Prova su telefono vero (Expo Go / build di sviluppo) | ⏳ serve Valerio |
| Account store: Apple 99$/anno, Play 25$ + **12 tester × 14 giorni** | ⏳ **serve Valerio, è il collo di bottiglia dei tempi** |
| Build EAS + submission | ⏳ dopo gli account |
| Acquisto crediti in-app (IAP Apple/Google, non Polar dentro l'app) | ⏳ v2, si parte coi 3 gratis |

## 1.3 Da dove arrivano le offerte — ❓ **decisione tua, parcheggiata**

Senza questa, il motore gira a vuoto. Le opzioni verificate stanno in
`DECISIONI.md`. **È il pezzo che decide se il prodotto esiste o no.**

---

# FASE 2 — DISTRIBUISCI

Il piano operativo per esteso sta in **`DISTRIBUZIONE.md`**: canali, formati,
imbuto TOFU/MOFU/BOFU, calendario, cosa faccio io e cosa serve da te.

In due righe: **video verticali con un personaggio AI che prova l'app** come
motore principale, blog quotidiano per la ricerca, presenza vera (non spam) in
gruppi e community, contatto agli influencer. Tutto porta a una pagina sola:
imposta la tua ricerca, prendi 3 alert gratis.

| | Stato |
|---|---|
| Formato video, 12 aperture, 3 script pronti (`CONTENUTI.md`) | ✅ |
| Piano completo di distribuzione (`DISTRIBUZIONE.md`) | ✅ |
| Account social `@viaggioancheio` | ⏳ **serve Valerio** |
| Dominio: comprato `ancheioviaggio.it` (07/08). ⚠️ diverso dal marchio: decisione aperta in `DECISIONI.md` | ✅/❓ |
| Higgsfield / Seedance collegati | ⏳ **serve Valerio** |
| Primo video pubblicato | ⏳ |
| Blog sul sito (`/diario`) + primi 10 pezzi | ⏳ |

---

# FASE 3 — MANTIENI

Si apre quando esistono utenti paganti. Prima è teoria.

- Supporto: una casella che leggo io, risposte pronte, tempi dichiarati
- Misure che contano: quanti si registrano → quanti impostano una ricerca →
  quanti ricevono un alert → quanti comprano di nuovo
- Il numero che decide tutto: **chi ricompra crediti dopo il primo pacchetto**
- Miglioramenti guidati da quello che chiedono gli utenti, non da quello che
  mi sembra bello

---

## Cosa blocca cosa

```
 account Play (25$) ──→ test chiuso: 12 tester × 14 giorni ──→ produzione   ← IL PIÙ LENTO: si apre OGGI
 account Apple (99$/anno) ──→ review 1-2 settimane ──→ App Store
 dominio ancheioviaggio.it ──→ Resend verificato ──→ email a tutti (oggi solo a valerio@artecai.it)
 fonte offerte ──→ EXA_API_KEY su Netlify + cron ──→ destinazioni vere
 incasso: 3 crediti gratis al lancio; acquisti = IAP negli store (v2)
```

**Le cose più urgenti non sono codice: i due account developer e i 12
tester per Google.** Ogni giorno senza account Play è un giorno in più di
attesa a valle.

---

## Prossimo pezzo di codice
Chiudere l'app mobile (QA, prova su telefono), poi il canale push nel motore
di invio e il cron in produzione.

Le cose chieste e non ancora fatte stanno in `ARRETRATI.md`.
