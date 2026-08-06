@STATO.md

# MicroStay Alert — regole di progetto

## Cos'è
SaaS B2C italiano: avvisa l'utente quando esiste una micro-vacanza (1-3 notti,
entro X ore da casa sua) con prezzo TOTALE sotto la soglia che decide lui.
Dettaglio completo: leggi `SPEC.md` (solo quando serve, non ogni volta).
Scelte già chiuse: `DECISIONI.md` (non si ridiscutono).

## Regole di lavoro su questo progetto
1. **Prova o non è fatto.** Ogni "fatto" va con output reale: comando rieseguito
   o file riletto. `.claude/verify.cmd` deve passare prima di dire "finito".
2. **Niente numeri inventati.** Prezzi, conversioni, dati di mercato: fonte web
   reale e citata, oppure si scrive "stima non verificata".
3. **Niente dati finti in produzione.** Se un'offerta mostrata all'utente non
   viene da una fonte reale, va etichettata `demo` nel DB e nell'interfaccia.
4. **Modifica solo il pezzo richiesto.** Zero refactoring non chiesti, zero
   riscritture, non cancellare commenti o edge case esistenti.
5. **Segreti mai nel codice.** Solo in `.env.local` (che è in `.gitignore`).
   Se una chiave finisce in un file tracciato: fermati e avvisa.
6. **Fine sessione:** aggiorna `STATO.md` (max 25 righe) e committa.

## Stack (fissato — vedi DECISIONI.md)
Da definire dopo l'approvazione della spec. Non assumere nulla prima.

## Confini
- Non spendere soldi (API a pagamento, domini, ads) senza chiedere prima.
- Non pubblicare/deployare su un dominio pubblico senza chiedere prima.
- Non toccare account esterni (Stripe, store, social) senza chiedere prima.
- Tutto il resto: fai, poi riferisci.

## Vocabolario del dominio
- **offerta / deal**: una micro-vacanza concreta (struttura + date + prezzo).
- **prezzo totale**: alloggio + trasporto A/R, per persona. Mai solo alloggio.
- **soglia**: budget massimo per persona impostato dall'utente.
- **raggio**: distanza espressa in ORE di viaggio, non in km.
- **alert**: notifica inviata quando un deal rispetta i criteri dell'utente.
