# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, sera (giro #29 chiuso: app piena). Si aggiorna
prima di ogni /clear.*

## Cosa è appena stato chiuso (giro #29)
L'app non rimanda più al sito, tranne che per il pagamento:
- pratiche col tracker DENTRO l'app (`/api/pratiche/{id}/scheda`,
  Bearer + cookie; timeline, lettera via mailto, "L'ho inviata");
- profilo stile riferimento (avatar, Dati personali con nickname e
  adesione classifica, invito amici via Share, voci con icona);
- classifica end-to-end SPENTA: si accende con CLASSIFICA_ATTIVA=1 su
  Netlify quando ci sono ~10 giorni di vincite vere. Conta solo
  `esito_pagata`, compare solo chi ha nickname + opt-in;
- biglietto tipo carta d'imbarco (strappo, fori, codice a barre);
- prima ancora: ricerca per tratta (predefinita), foto carta d'imbarco
  (/api/leggi-carta, foto mai salvata), notifiche push (cron 6 UTC,
  testo per tratta, mai il numero del volo).

## I pezzi che restano sull'app
1. Ricontrollo del volo "ancora in coda" dalla notifica: quando l'utente
   tocca la push, aprire direttamente il verdetto (deep link con
   dati.volo/data già nel payload della notifica).
2. La ricerca per tratta anche sul SITO (l'app ce l'ha, il sito no).
3. Store: icone pronte, serve l'account sviluppatore (scelta di Valerio:
   prima app completa, store dopo).

## Cosa resta a Valerio (in ordine)
1. **Polar**: leggere POLAR.md. PRIMA di tutto mandare al supporto il
   testo pronto per farsi approvare il caso d'uso (vietano la
   "consulenza": noi siamo software, ma deve dirlo un loro revisore).
   Poi: prodotti 14,90/24,90, checkout link, segreto webhook, verifica
   da Finance → Account SUBITO (fino a 14 giorni, vendite mai ferme).
2. PC suo: se l'app resta vecchia, la guida riparata è in
   mobile/ANTEPRIMA-WINDOWS.md (fetch + reset, mai git pull).
3. Quando ci sono vincite vere da 10 giorni: CLASSIFICA_ATTIVA=1 su
   Netlify e la tab compare da sola.

## Attenzioni tecniche fresche
- `voli` NON ha RLS: l'app non deve mai leggerla direttamente, passa
  dalle API del sito.
- Il CORS condiviso sta in lib/api/limite.ts e permette Authorization:
  serve alle chiamate col Bearer dall'app.
- Migrazioni applicate sul Supabase vero e tracciate in supabase/:
  2026-08-10-tratta-e-voli-seguiti.sql, 2026-08-10-profilo-e-classifica.sql.
- expo-image-picker e expo-clipboard sono a versione SDK 57 (~57.0.x):
  `npx expo install` non funziona in sandbox (proxy), si usa npm con la
  versione giusta a mano.
