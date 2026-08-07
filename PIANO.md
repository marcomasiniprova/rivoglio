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
| Golden set etichettato a mano + eval (falsi positivi 0, bloccante) | ✅ 25 casi, 28/28 verdi |
| Schema dati: voli (cache+payload grezzo), verifiche, pratiche, eventi + RLS | ✅ applicato sul Supabase vero |
| Fornitori dati volo (AeroDataBox, AviationStack, demo marcata) | ✅ 07/08, cache + payload grezzo come prova |
| **Prova delle 2 ore: chiave AeroDataBox su 10 voli reali** | ⏳ **serve Valerio: è l'unico rischio che resta** |
| Golden set esteso a 500 casi reali (gruppi FB, amici) | ⏳ dopo la prova |

## 1.2 Le superfici web

| | Stato |
|---|---|
| Landing check-first (hero col campo volo+data, garanzia, prezzi, FAQ oneste) | ✅ 07/08, rifinita (impeccable, taste, seo) |
| Pagina risultato: reveal, dato oggettivo, card condivisibile, cattura email | ✅ 07/08 |
| Checkout Polar (pratica 14,90 / famiglia 24,90) + webhook | ✅ codice pronto, firma provata su 10 casi · ⏳ i 2 link e il segreto da Valerio |
| Lettera di reclamo deterministica + canali compagnie verificati | ✅ 10 compagnie, verificate il 07/08 |
| Sequenza email T+0/2/15/30/60 (Resend) + cron follow-up | ✅ 07/08, invii idempotenti marcati a evento |
| Tracker pratica (web) + area utente | ✅ 07/08 |
| `/admin` shadow mode (conferma umana dei verdetti) | ✅ 07/08, SHADOW_MODE=1 |
| Prove Playwright del flusso in modalità demo | ✅ 190/192 (2 = rete sandbox verso Supabase) + eval 28/28 |

## 1.3 Deploy e conti

| | Stato |
|---|---|
| Netlify: progetto `rivoglio` creato, variabili impostate, rivoglio.netlify.app | ✅ 07/08 via connettore |
| Primo deploy di produzione | ⏳ **serve Valerio: riautorizzare il connettore Netlify su claude.ai** (si è scollegato; la sandbox non raggiunge Netlify e i link firmati del connettore scadono in minuti: filiera pronta e provata fino a Netlify) |
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
 chiave AeroDataBox ──→ prova 10 voli veri ──→ il check dà dati VERI (oggi: demo)
 Polar: 2 checkout link + webhook secret ──→ si incassa
 chiavi su Netlify ──→ deploy completo (admin, email, motore)
 dominio ──→ Resend verificato ──→ email a chiunque + link puliti nei video
 account social ──→ FASE 2
```

**L'unico rischio tecnico rimasto è la prova AeroDataBox.** Tutto il resto
è esecuzione.

## Prossimo pezzo di codice
Chiudere il QA della build, deploy, poi: bagagli (settembre) e il tracker
mobile completo. Le cose chieste e non fatte: `ARRETRATI.md`.
