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

## 1.2 L'app — 45%

| | Stato |
|---|---|
| Database, schema, RLS, buco sui crediti chiuso | ✅ |
| **Accesso**: email+password, link magico, conferma via email | ✅ |
| **Porta chiusa**: `proxy.ts` respinge chi non è collegato | ✅ |
| **`/app`**: imposti partenza, budget, ore, notti, persone, voglia | ✅ |
| **Anteprima onesta**: dove arrivi oggi con quel budget | ✅ |
| Metti in pausa / riaccendi / cancelli una ricerca | ✅ |
| Errori di Supabase tradotti in italiano | ✅ |
| Contatore crediti in testa all'app | ✅ |
| Motore che abbina offerte e ricerche (a lotti, limite 10s) | ✅ **provato dal vivo il 07/08** |
| Invio destinazioni: email fatto (Resend), Telegram pronto (manca il token del bot) | ✅/⏳ |
| Acquisto crediti con Polar | ⏳ |
| Pannello `/admin`: verifica offerte, raccolta e abbinamento a mano | ✅ |
| Installabile sulla schermata Home (PWA + manifest) | ✅ |

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
| Dominio `viaggioancheio.it` | ⏳ **serve Valerio** |
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
 dominio ──→ Resend verificato ──→ email che partono davvero ──→ lancio
                                          ↑
              (oggi Supabase manda 2 email l'ora: al terzo iscritto ti fermi)

 partita IVA ──→ Polar ──→ incassare
 fonte offerte ──→ alert veri (senza, il motore gira a vuoto)
```

**Le due cose più urgenti non sono tecniche: partita IVA e dominio.**

---

## Prossimo pezzo di codice
Motore di abbinamento offerte ↔ ricerche, a lotti per stare nei 10 secondi
delle funzioni Netlify. Poi l'invio su Telegram.

Le cose chieste e non ancora fatte stanno in `ARRETRATI.md`.
