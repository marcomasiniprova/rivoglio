# SPEC — Rivoglio

*Scritta il 2026-08-06. Le scelte qui dentro sono chiuse: vedi `DECISIONI.md`.*

## 1. Il problema

40 milioni di italiani non partono ad agosto 2026, e il motivo dichiarato è il
prezzo. Chi resta a casa non ha smesso di volerci andare: ha smesso di **cercare**,
perché cercare costa tempo, i prezzi hanno sorprese e non sai mai se stai
spendendo troppo.

**L'utente:** 25-45 anni, vive ovunque in Italia, budget stretto, vorrebbe
staccare 1-3 notti ma non ha voglia di passare due sere fra dieci siti.

**La frase che dice:** *"Vorrei scappare due notti, ma non ho tempo di cercare
e ho paura di spendere troppo."*

## 2. La promessa

> Dimmi da dove parti e quanto vuoi spendere. Al resto ci penso io.

Imposti **una volta sola**: da dove parti, quanto vuoi spendere a persona,
quante notti, quante ore di viaggio al massimo. Poi non cerchi mai più.
Quando esiste una micro-vacanza che rispetta i tuoi criteri, **ti arriva**.

Il valore non è "trovo offerte" — quello lo fa Booking. È **"non devo più
guardare"**.

## 3. Cosa promettiamo sul prezzo — e cosa no

Ogni alert mostra il **prezzo totale a persona = alloggio + viaggio in auto**.

- **Alloggio:** prezzo reale, dalla fonte. Mai stimato.
- **Auto:** stima calcolata e **dichiarata come stima**. Distanza reale su strada,
  carburante al prezzo medio MIMIT del giorno, pedaggi. Diviso per i passeggeri.
- **Treno:** nessun prezzo. Solo un link "controlla il treno".
  Motivo in `DECISIONI.md`: Trenitalia e Italo non hanno API ufficiale.

**Il conto è sempre apribile.** L'utente deve poter vedere:
`231 km × 2 = 462 km ÷ 15 km/l × €1,994 = €61 benzina + €18 pedaggi ÷ 2 = €40 a testa`.
La trasparenza non è una funzione in più: è il motivo per cui uno si fida.

## 4. Come si guadagna

**Crediti. Nessun abbonamento, nessun rinnovo automatico.**

| | |
|---|---|
| 5 crediti | €3,99 |
| 20 crediti | €12,99 |
| 50 crediti | €24,99 |

- **1 credito = 1 alert ricevuto.** Si scala quando l'alert **parte**, non quando
  viene generato.
- **3 crediti gratis all'iscrizione.** Provi il prodotto con alert veri prima di
  pagare. *(Decisione mia, reversibile: è un numero nel database.)*
- **I crediti non scadono.** Una scadenza fa sentire l'utente fregato.
- **Tetto settimanale scelto dall'utente** (es. max 3 alert/settimana). Sopra il
  tetto l'alert non parte e non si scala niente. Così l'utente sa sempre quanto
  può spendere al massimo.
- **Crediti finiti** → un ultimo messaggio gratuito che avvisa. Non consuma nulla.

## 5. Cosa fa, in ordine di priorità

1. **Landing page** — la vetrina che converte. Si costruisce **per prima**:
   va online e raccoglie iscritti mentre il motore è ancora in costruzione.
2. **Iscrizione + imposta la ricerca** — comune di partenza (o CAP), budget max
   a persona, notti, ore di viaggio max, tipo (mare/monte/città/terme), periodo,
   quante persone, tetto settimanale.
3. **Consegna dell'alert** — Telegram (principale), push web, email.
4. **Scheda offerta** — mappa, dettaglio, e il conto del viaggio aperto.
5. **Acquisto crediti** — Stripe.
6. **Pannello admin** — dove entrano le offerte.

## 6. Cosa NON fa — e perché conta

**Non prenotiamo. Mandiamo al sito che prenota.** Non è pigrizia: se vendessimo
trasporto + alloggio insieme diventeremmo un **pacchetto turistico** ai sensi del
Codice del Turismo, con obblighi di garanzia, assicurazione e responsabilità sul
viaggio. Noi *segnaliamo*. La stima auto è dichiarata come stima, non è un
servizio venduto. *(Da confermare con un commercialista prima di scalare.)*

Fuori dalla v1: app nativa, WhatsApp, voli, estero, prenotazione interna,
recensioni, social login.

## 7. Architettura — 5 pezzi che non si toccano fra loro

| Pezzo | Firma | Perché è separato |
|---|---|---|
| **Fonti** | `cerca(zona, date) → Offerta[]` | La fonte prezzi **non è ancora decisa** (scelta di Valerio: si decide per ultima). Ogni fonte è un modulo con la stessa firma. Oggi: `manuale`. Domani: SerpAPI, partner. Aggiungerne una non tocca nient'altro |
| **Catalogo** | tabella `offerte` | Il punto unico dove vivono le offerte, da qualunque fonte arrivino |
| **Calcolo viaggio** | `viaggio(da, a, persone) → {km, ore, costo}` | Funzione pura: stessi input, stesso output. **Qui un bug significa prezzi sbagliati agli utenti** → test obbligatori |
| **Motore di match** | `abbina(ricerche[], offerte[]) → Coppia[]` | Funzione pura. **Qui un bug manda l'offerta sbagliata alla persona sbagliata** → test obbligatori |
| **Consegna** | `invia(utente, coppia) → esito` | Tre uscite dietro un'unica firma: telegram, push, email. Aggiungerne una (WhatsApp, SMS) = un file nuovo, zero modifiche altrove |

```
Fonte ──→ offerte ─┐
                   ├──→ Motore di match ──→ Consegna ──→ 📱 utente
Utente ─→ ricerche ┘           ↑
                        Calcolo viaggio
```

**Il senso della forma:** la casella non ancora decisa (la fonte) è isolata
dietro un innesto. Rimandarla non costa niente e non blocca nessun altro pezzo.

## 8. Modello dati

- **utenti** — email, telefono?, chat_telegram?, comune, lat, lng, **crediti**,
  tetto_settimanale, creato_il
- **ricerche** — utente_id, budget_max_persona, notti_min, notti_max,
  ore_viaggio_max, tipi[], periodo_da, periodo_a, persone, attiva
- **offerte** — struttura, comune, lat, lng, check_in, check_out,
  prezzo_alloggio, link, **fonte**, verificata_il, scade_il, tipo, stato
- **invii** — utente_id, ricerca_id, offerta_id, canale, inviato_il,
  credito_consumato, aperto_il, cliccato_il
- **transazioni** — utente_id, stripe_id, crediti, importo, creato_il

`invii` serve a due cose: non mandare due volte la stessa offerta alla stessa
persona, e sapere quali offerte funzionano davvero.

## 9. Vincoli tecnici — scoperti, non da riscoprire

- **Funzioni Netlify: 10 secondi.** Il matcher non può passare tutti gli utenti
  in un colpo. Lavora **a lotti**, con un puntatore a dove è arrivato.
- **Netlify Starter gratuito: 300 crediti/mese**, uso commerciale permesso.
- **iOS non riceve push web** se il sito non è aggiunto alla schermata Home.
  Per questo Telegram è il canale principale, non un'alternativa.
- **Isole.** Chi vive in Sicilia o Sardegna non raggiunge in auto nessuna offerta
  continentale. Senza offerte locali quegli iscritti non ricevono **mai** niente.
  Vanno gestiti esplicitamente: o offerte lì, o si dice chiaramente che la
  copertura nella loro zona è ancora sottile.
- **Prezzo carburante:** letto dall'osservatorio MIMIT, **mai scritto fisso**.
- **Comuni + coordinate:** elenco ISTAT.

## 10. Come si verifica che funzioni

`.claude/verify.cmd` (→ `verify.ps1`) deve passare. Blocca se:
1. manca un file di contesto;
2. un file di segreti è tracciato da git;
3. `npm run verify` fallisce → build + test su **calcolo viaggio** e
   **motore di match**, i due punti dove un errore diventa un utente arrabbiato;
4. un'offerta senza fonte verificata non è marcata `demo`.

**Prova finale, a mano:** mi iscrivo con la mia email, imposto una ricerca,
carico un'offerta che la soddisfa, e l'alert **mi arriva davvero** con il conto
giusto. Finché non succede, non è finito.

## 11. Il piano dei 7 giorni

| Giorno | Cosa esce |
|---|---|
| 1-2 | **Landing page completa** + raccolta iscritti. Online. |
| 3 | Supabase: schema, iscrizione, form "imposta la tua ricerca" |
| 4 | Calcolo viaggio + motore di match, **con i test** |
| 5 | Consegna: Telegram + email + push |
| 6 | Stripe crediti + pannello admin + prime offerte vere |
| 7 | Deploy, prova end-to-end vera, primo video |

## 12. Domande ancora aperte

1. **Fonte prezzi offerte** — rimandata di proposito a fine progetto.
   Opzioni già studiate in `DECISIONI.md`.
2. **Dominio** — `rivoglio.it` da verificare e comprare (Valerio).
3. **Stripe** — account da aprire (Valerio: servono dati fiscali e IBAN).
