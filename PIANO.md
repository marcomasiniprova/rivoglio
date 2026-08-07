# PIANO — Rivoglio

*Se leggi un file solo, leggi questo. Risponde a una domanda: **a che punto siamo?***
*Riscritto il 2026-08-07 (notte) col prodotto definito: lo scanner dei rimborsi.*

**Obiettivo: cassa entro settembre/ottobre 2026.** Realistico dal documento:
10-25k€ agosto-settembre se la distribuzione gira. Ogni scelta si giudica
così: avvicina il primo pagante?

---

## Le tre fasi (definite da Valerio il 07/08)

```
  FASE 1               FASE 2                  FASE 3
  SVILUPPO       →     DISTRIBUZIONE     →     MIGLIORAMENTO
  si finisce TUTTO     3 contenuti al          iterazione e
  il prodotto          giorno, ogni giorno     mantenimento
```

FASE 1 = il prodotto completo e provato (check, pratica, lettera, follow-up,
tracker). FASE 2 = distribuzione, parte appena il check è online (65%
dell'energia, dal documento). FASE 3 = miglioramento continuo, iterazione
sui dati veri e mantenimento: i verticali nuovi (bagagli, treni), il golden
set che cresce coi rifiuti veri, le correzioni da feedback.

---

# FASE 1 — SVILUPPO

**Fatta quando:** uno sconosciuto fa il check, vede il dato oggettivo, paga,
riceve la lettera, la invia e la sequenza di follow-up parte da sola.

## 1.1 Il motore (lo strato che decide)

| | Stato |
|---|---|
| Rules engine EU261 versionato, 3 stati, zero AI (`lib/regole/eu261.ts`) | ✅ 07/08 |
| Golden set etichettato a mano + eval (falsi positivi 0, bloccante) | ✅ 32 casi (dentro il FR4001 vero e 2 trappole sciopero) |
| Schema dati: voli (cache+payload grezzo), verifiche, pratiche, eventi + RLS + scioperi | ✅ applicato sul Supabase vero |
| Fornitori dati volo (AeroDataBox + demo marcata; distanze di riserva OpenFlights) | ✅ 8/08, cache + payload grezzo come prova |
| Seconda fonte: documenti dell'utente via OCR Mistral dentro la pratica | ✅ 8/08 (concorde/discorde/illeggibile; discorde = conferma umana; file mai salvato) |
| **Prova delle 2 ore: chiave AeroDataBox su voli reali** | ✅ 8/08: dati solidi con Live fino a 11 mesi (AZ610); oltre 365 giorni il BASIC rifiuta → vetrina onesta sui 12 mesi |
| Golden set esteso a 500 casi reali (gruppi FB, amici) | ⏳ man mano che passano voli veri |

## 1.2 Le superfici web

| | Stato |
|---|---|
| Landing check-first (hero col campo volo+data, garanzia, prezzi, FAQ oneste) | ✅ 07/08, rifinita (impeccable, taste, seo) |
| Pagina risultato: reveal, dato oggettivo, card condivisibile, cattura email | ✅ 07/08 |
| Checkout Polar (pratica 14,90 / famiglia 24,90) + webhook | ✅ codice pronto, firma provata su 10 casi · ⏳ i 2 link e il segreto da Valerio |
| Lettera di reclamo deterministica + canali compagnie verificati | ✅ 20 compagnie, riverificate l'8/08 (entità legali, NEB, chi rifiuta gli intermediari) + riga meteo pronta ma spenta |
| Sequenza email T+0/2/15/30/60 (Resend) + cron follow-up | ✅ 07/08, invii idempotenti marcati a evento |
| Tracker pratica (web) + area utente | ✅ 07/08 |
| `/admin` shadow mode (conferma umana dei verdetti) | ✅ 07/08, SHADOW_MODE=1 |
| Prove Playwright del flusso in modalità demo | ✅ 208/210 (2 = rete sandbox verso Supabase) + eval 35/35 |

## 1.3 Deploy e conti

| | Stato |
|---|---|
| Netlify: progetto `rivoglio` creato, variabili impostate, rivoglio.netlify.app | ✅ 07/08 via connettore |
| Primo deploy di produzione | ✅ 8/08: **https://rivoglio.netlify.app** (via workbench + connettore; netlify.toml con build e plugin Next). Il rivoglioo.netlify.app di Valerio è un altro account, senza variabili: da dismettere |
| Polar: account aperto (Valerio) | ✅ · ⏳ prodotti, webhook, richiesta approvazione organizzazione (2 settimane, farla SUBITO) |
| Chiavi su Netlify: SUPABASE_SECRET_KEY, RESEND_API_KEY, AERODATABOX, POLAR | ⏳ **serve Valerio** (le ha lui) |
| Dominio di Rivoglio (slot Hostinger gratuito da configurare) | ⏳ **serve Valerio** |
| Legale: condizioni d'uso + disclaimer da avvocato; commercialista sul fiscale | ⏳ prima del lancio vero |

## 1.4 L'app mobile (il tracker, NON la porta)

| | Stato |
|---|---|
| App Expo rinominata, icone, motore, 29 prove | ✅ (base del 07/08) |
| Pivot minimo: tab "Le tue pratiche" | ✅ 07/08 (tsc, lint, 29/29) |
| Tracker completo + notifiche push sulle pratiche | ⏳ dopo che il web incassa (da documento: app = retention, novembre) |
| Store (Apple 99$, Play 25$ + 12 tester × 14 giorni) | ⏳ serve Valerio, non è il collo di bottiglia ora |

---

# FASE 2 — DISTRIBUZIONE (piano in `DISTRIBUZIONE.md` e `CONTENUTI.md`)

| | Stato |
|---|---|
| Formati video (tabellone, disruption-jacking, check dal vivo, screenshot loop) | ✅ scritti |
| Account `@rivoglio` su TikTok/IG/YouTube | ⏳ **serve Valerio, subito** |
| Primi 10 video girati (si può PRIMA del lancio) | ⏳ Valerio |
| Newsletter "Osservatorio dei Disservizi" (Brevo) | ⏳ coi primi iscritti |

# FASE 3 — MIGLIORAMENTO, ITERAZIONE E MANTENIMENTO

Si apre quando la FASE 1 è chiusa e la 2 gira. Dentro ci sta:
- **I verticali nuovi** (la retention vera): bagagli a settembre (Montreal,
  scontrino 300-1.900€, la Cassazione 2026 sul PIR è un argomento che
  nessuno usa) · treni gratis a ottobre (calamita) · bollette 2027.
- **Iterazione sui dati veri**: ogni rifiuto delle compagnie diventa un caso
  etichettato nel golden set; shadow mode che si spegne a 100 verdetti
  puliti; correzioni guidate da quello che chiedono gli utenti.
- **Mantenimento**: regole aggiornate quando la riforma UE entra in vigore
  (~agosto 2027, ruleset v2), canali compagnie riverificati, costi API
  sotto controllo.
Niente gamification, mai: si torna perché "mi devono dei soldi" succede
3-4 volte l'anno, non per gli streak.

---

## Cosa blocca cosa

```
 chiavi su Netlify (AERODATABOX + MISTRAL) ──→ il sito vero esce dalla demo e legge i documenti
 Polar: 2 checkout link + webhook secret ──→ si incassa
 deploy dell'ultimo ramo ──→ online il prodotto vero (oggi c'è il vecchio)
 dominio ──→ Resend verificato ──→ email a chiunque + link puliti nei video
 account social ──→ FASE 2
```

**La prova AeroDataBox è fatta (8/08, chiave vera su voli reali): non
restano rischi tecnici aperti.** Tutto il resto è esecuzione.

## Prossimo pezzo di codice
Deploy dell'ultimo ramo, poi #25 (Osservatorio con statistiche ritardi
vere). Le cose chieste e non fatte: `ARRETRATI.md`.
