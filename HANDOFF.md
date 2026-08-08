# HANDOFF — per la prossima sessione

*Aggiornato: 2026-08-08, notte fonda (giro #31 CHIUSO per intero).*

## Il giro #31 è finito: tutti i 6 pezzi del vecchio handoff
1. Scena di scansione NATIVA nell'app (`ScenaScan.tsx`): identica al
   sito, provata end-to-end su Expo web (ZZ250 → 15s di scena → verdetto
   da sola). Tratta su riga sua, data intera, timbro a molla.
2. Sezione prezzi = due carte d'imbarco + striscia del check gratis.
3. Messaggi cancellato/dirottato riscritti (regole 2026.08.4).
4. `/guida-bagagli` (Montreal, solo guida): footer + sitemap.
5. Email benvenuto account riscritta per Rivoglio (era ANCORA quella
   dei crediti viaggi e partiva a ogni registrazione). T+0..T+60 rilette:
   già giuste.
6. QA visivo (app, prezzi 1440/390, guida 1440/390): zero errori
   console, zero scroll orizzontale. Lint mobile risanato (era rosso
   dal giro della welcome: `useValoreAnimato` + import statici .png).
   Anteprima `/anteprima-app` rigenerata con la scena nuova.

## Trappole nuove scritte in STATO ("Da non rifare")
- Metro nella sandbox NON vede gli edit: riavviare Expo con `--clear`.
- Il giro visivo si fa con script Node su `node_modules/playwright`
  (il MCP Playwright vuole un Chrome che qui non c'è).
- MAI `npm run ... | tail`: la pipe maschera l'exit code (pagato).

## Cosa resta a Valerio (invariato + 2 novità)
1. Risposta di Polar alla mail; poi prodotti + checkout link + segreto.
2. Dopo il deploy automatico di questo push: riprovare la newsletter
   (deve arrivare a valerio@artecai.it) e aprire /anteprima-app per
   VEDERE la scena di scansione nell'app.
3. Il resto è in STATO ("Serve Valerio") e ARRETRATI ("Tocca a Valerio").

## Prossimi pezzi di codice (da decidere con Valerio, popup)
- Spegnere il ramo email/alert del prodotto viaggi (voce in ARRETRATI).
- Golden set oltre i 32 casi coi voli veri.
- Eventuale verticale bagagli VENDITA (settembre, da documento): oggi
  esiste solo la guida, per scelta.
