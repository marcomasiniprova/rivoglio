# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, notte fonda (giro #31 in corso, contesto al limite).*

## Giro #31: FATTO e pushato (5 commit)
1. Newsletter RIPARATA: l'invio era ucciso dal congelamento serverless
   (void senza await). Ora si aspetta e la risposta dice email:true/false.
   DA RIPROVARE sul sito vero dopo il deploy.
2. Anteprima /anteprima-app RIPARATA: Netlify non pubblica i percorsi
   node_modules → scripts/appiattisci-anteprima.mjs appiattisce gli asset
   (agganciato a `npm run anteprima` in mobile/).
3. Campo data: showPicker su tutto il campo (hero + web app).
4. STANDARD CHECK UNICO: components/check/SchedaCheck (foto carta
   d'imbarco + tratta predefinita + numero + teatro col biglietto che si
   compila) montato su hero E web app. L'app mobile ce l'ha già.
5. WELCOME cinematica app (benvenuto.tsx: logo in volo, colonne che
   respirano, email, salta; si vede una volta, CHIAVE_BENVENUTO) e
   /entra rifatta sul riferimento (cornice scura, carta unica, citazione
   + skyline a linee).

## Giro #31: RESTA DA FARE (Valerio l'ha chiesto, contesto finito)
- Scena di scansione NATIVA nell'app mobile (oggi il check salta dritto
  al verdetto): versione RN del teatro col biglietto che si compila.
- Sezione prezzi della landing ("Su una compensazione da 600€") da
  rifare esteticamente.
- Messaggi del motore per cancellato/dirottato (oggi generici).
- Pagina guida bagagli/Montreal (scelta popup: guida sì, vendita no).
- Giro QA da utente critico su tutto + verify completo.
- Email brandizzate: il modello c'è già (lib/email/modello.ts, tabelle
  + colori marchio); da ricontrollare i testi dei messaggi.

## La caccia ai 10 voli "sicuramente idonei": esito ONESTO
~40 voli veri verificati live in due stress test (da febbraio a ieri):
zero errori, ritardi misurati al minuto (max 155'), incerti solo dove
l'archivio non ha l'arrivo. NESSUN idoneo trovato: i ritardi ≥3h sono
l'1-2% dei voli, e i voli disastrati delle cronache vengono riprotetti
con altri numeri (verificato su NAP-VCE 10/07 e PMO caos vento 26-27/07,
FR6255 dirottato → incerto onesto). Per provare il flusso idoneo end to
end: voli demo ZZ250/ZZ400/ZZ300/ZZ600 (motore vero, marcati demo).
A Valerio serve saperlo: il business È il volume sul check, non trovare
più idonei di quanti ne esistano.

## Risposte date a Valerio (popup senza risposta → consigliate)
Welcome primo avvio con salta · check a tre modi ovunque · EU261 + guida
bagagli (vendita bagagli dopo il lancio) · caccia ~60 chiamate.

## Cosa resta a Valerio
1. Risposta di Polar alla mail (inviata l'8/08).
2. Prodotti Polar + checkout link + segreto webhook quando arriva l'ok.
3. Dopo il deploy: riprovare la newsletter (deve arrivare a
   valerio@artecai.it) e /anteprima-app (font e icone giusti).
