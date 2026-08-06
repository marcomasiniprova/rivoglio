# PIANO — dove siamo e cosa manca

*Questo file risponde a una domanda sola: **a che punto siamo?***
Si aggiorna a ogni sessione. Se leggi solo un file, leggi questo.

**Obiettivo:** primo utente pagante, poi €30-100k entro ottobre 2026.

---

## La mappa in tre pezzi

```
  [1] LA VETRINA          [2] L'APP              [3] LA BENZINA
  la landing page    →    quello che usano   →   come ti trovano
  (convince)              (il prodotto)          (distribuzione)

  ████████████ 95%        ███░░░░░░░░░ 25%       ████░░░░░░░░ 30%
```

Il **[3]** non è più a zero: `CONTENUTI.md` ha formato, script e ritmo pronti.
Manca eseguirlo, e quello lo fai tu (account social e videocamera).

---

## [1] LA VETRINA — la landing page

**A che serve:** convincere uno sconosciuto a lasciare l'email in 30 secondi.

| | Stato |
|---|---|
| Struttura a 11 sezioni in stile Zentivo | ✅ fatto |
| Colori, caratteri, logo, marchio | ✅ fatto |
| Modulo iscrizione funzionante | ✅ fatto (salva su file, va spostato su Supabase) |
| 12 prove automatiche su desktop e telefono | ✅ fatto |
| Animazioni e movimento (Motion 13) | ✅ fatto |
| Testo che si accende con lo scroll + macchina da scrivere | ✅ fatto |
| Copy professionale, zero trattini lunghi | ✅ fatto |
| Telefono sistemato + sfondo rifatto | ✅ fatto |
| **Costruttore di micro-vacanze**, provabile senza iscriversi | ✅ fatto, 16 prove |
| Iscritti salvati su Supabase invece che su file | ⏳ **obbligatorio prima di pubblicare** |
| Immagine di anteprima per i social | ⏳ da fare |

## [2] L'APP — quello che la gente userà davvero

**A che serve:** è il prodotto. Senza, la landing vende il nulla.

| | Stato |
|---|---|
| Database, schema, regole di sicurezza | ✅ fatto |
| Login e registrazione | ⏳ **il prossimo pezzo** |
| Pagina "imposta la tua ricerca" | ⏳ da fare |
| Calcolo viaggio (km, ore, benzina, pedaggi) | ⏳ da fare |
| Motore che abbina offerte e ricerche | ⏳ da fare |
| Invio alert su Telegram / email / notifica | ⏳ da fare |
| Acquisto crediti con Polar | ⏳ da fare |
| Pannello admin per caricare le offerte | ⏳ da fare |
| AI Vacation Builder | ⏳ da fare (era nel piano originale) |
| **Da dove arrivano le offerte** | ❓ **decisione parcheggiata da Valerio** |

## [3] LA BENZINA — come ti trovano

**A che serve:** portare gente sulla vetrina. Zero fatto finora.

| | Stato |
|---|---|
| Piano contenuti per TikTok e Reels | ⏳ da fare |
| Format video ripetibile e script | ⏳ da fare |
| Account social | ⏳ serve Valerio |
| Dominio `viaggioancheio.it` | ⏳ serve Valerio |

---

## Cosa blocca cosa

```
partita IVA / Polar ──→ incassare
    dominio ──────────→ pubblicare
 fonte offerte ───────→ alert veri (l'app funziona a vuoto senza)
```

**La partita IVA è la cosa più urgente e non è tecnica.** Senza, tutto il
resto è un esercizio.

---

## L'ordine in cui procediamo

1. **Adesso:** movimento e copy sulla landing (la stai giudicando tu)
2. **Poi:** login + pagina "imposta la tua ricerca"
3. **Poi:** calcolo viaggio + motore di abbinamento, con i test
4. **Poi:** invio alert
5. **Poi:** crediti con Polar + pannello admin
6. **Poi:** contenuti e lancio

Gli arretrati e le cose promesse e non fatte stanno in `ARRETRATI.md`.
