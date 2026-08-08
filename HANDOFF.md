# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, notte (dopo la tratta in chiaro e la base delle
notifiche). Si aggiorna prima di ogni /clear.*

## Il pezzo in corso: LE NOTIFICHE PUSH

Scelte di Valerio (popup dell'8/08):
1. **Sul server, con account**: chi vuole l'avviso entra con l'email; i
   suoi voli vanno su Supabase e il server li ricontrolla. Il check resta
   libero e senza account per tutti gli altri.
2. **La mattina dopo**: l'orario certificato arriva con qualche ora di
   ritardo, avvisare subito darebbe verdetti su dati non consolidati.
3. **Il testo NON deve essere tecnico** (richiesta esplicita): niente
   "FR4001", si parla di TRATTA e di ore. Esempio del tono giusto:
   "Bergamo → Lanzarote: 3 ore di ritardo. Un volo così rientra nella
   fascia da 250€." Mai promettere il pagamento.
4. **Il permesso si chiede al primo volo salvato**, non all'avvio.

### Cosa è GIÀ PRONTO (fatto in questa sessione)
- Migrazione `20260810_tratta_e_voli_seguiti` applicata sul Supabase vero:
  colonne `partenza_iata/citta`, `arrivo_iata/citta` su `voli`; tabella
  `voli_seguiti` (utente_id, volo_iata, data_locale, esito_avvisato,
  avvisato_il) con RLS "ognuno vede i suoi"; `profili.expo_push_token`.
- La TRATTA arriva dal fornitore fino alla risposta di `/api/verifica`
  (`dato.da`, `dato.a`) e si vede nell'app: card dei voli salvati e
  schermata verdetto mostrano "Bergamo → Lanzarote" col codice sotto.
- I voli salvati sul telefono (`mobile/src/lib/voliSalvati.ts`) portano
  già `da` e `a`.

### Cosa MANCA per chiudere le notifiche
1. `expo-notifications` nell'app: chiedere il permesso al primo volo
   salvato, prendere il token Expo e scriverlo in `profili.expo_push_token`.
2. Quando l'utente è entrato, i voli salvati vanno copiati in
   `voli_seguiti` (e tolti quando li cancella).
3. Una rotta cron sul sito (tipo `app/api/cron/notifiche/route.ts`, sullo
   schema di quella dei follow-up email): ogni mattina prende i voli di
   ieri da `voli_seguiti`, chiama `verificaVolo`, e se l'esito è nuovo
   manda la push con l'API di Expo (https://exp.host/--/api/v2/push/send),
   poi scrive `esito_avvisato` e `avvisato_il` per non ripetersi.
4. Netlify: schedulare il cron (netlify.toml o scheduled function).

## L'ALTRA COSA GROSSA che ha detto Valerio (da fare)
**Il numero di volo è troppa frizione.** Ha ragione: l'utente medio non sa
dove trovarlo. La soluzione NON è un aiuto "come lo trovo", è togliere
l'ostacolo: **ricerca per tratta e data** (da dove sei partito, dove sei
arrivato, che giorno) con l'elenco dei voli di quel giorno fra i due
scali, da cui si sceglie il proprio. AeroDataBox ha l'endpoint degli
aeroporti (partenze/arrivi in una finestra oraria) e i 6.072 aeroporti
per l'autocomplete sono già nel repo (`lib/dati/aeroporti.json`).
Regola scritta in CLAUDE.md: "PENSA PER L'UTENTE MEDIO".

## Il resto dello stato
Vedi STATO.md: sito online e collaudato, app mobile tutta Rivoglio (tre
tab, niente più prodotto viaggi), deploy automatico a ogni push, pagine
legali online, Osservatorio coi dati veri.

## Cosa resta a Valerio
1. Polar (prodotti, checkout link, segreto webhook): è il collo di
   bottiglia per incassare.
2. Dati del titolare per le pagine legali, poi avvocato.
3. Scioperi di ottobre a inizio settembre.
