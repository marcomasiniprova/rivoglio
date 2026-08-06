# STATO — MicroStay Alert

**Aggiornato:** 2026-08-06
**Fase:** 0 — Design concordato, spec da scrivere

## Dove siamo
- Struttura creata e committata. Cancello `verify` funzionante e **testato in
  entrambi i versi**: exit 0 se ok, exit 1 se trova un segreto tracciato.
- Design del prodotto presentato a Valerio, in attesa del suo ok.
- Ricerca fonti dati chiusa: risultati in `DECISIONI.md` → "Vincoli verificati".
  **Non rifarla.**
- Zero righe di codice di prodotto. Nessun account creato. Nessuna spesa.

## Deciso (dettaglio in DECISIONI.md)
- Web app, non app nativa. Prezzo: €4,99/mese o €29/anno, annuale in evidenza.
- Promessa: prezzo alloggio reale + stima auto calcolata e dichiarata.
- Alert su Telegram (principale) + push web + email.
- Ingestione offerte = innesto sostituibile.

## Prossimo passo
Ricevuto l'ok sul design → scrivere `SPEC.md` → piano di implementazione.

## Bloccato su
- Ok di Valerio sul design.
- Tre risposte: città di lancio, nome, cosa ha già (dominio/Stripe/social).
- Fonte prezzi offerte: **parcheggiata di proposito**, si decide per ultima.
