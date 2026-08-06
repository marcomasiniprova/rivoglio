@STATO.md

# Viaggio Anche Io — regole di progetto

## Cos'è e qual è l'obiettivo
Ti avviso quando esiste una micro-vacanza (1-3 notti, entro X ore da casa tua)
sotto il budget che decidi tu. Alloggio reale + auto calcolata. Tutta Italia.
Si paga a crediti: 1 credito = 1 alert. Dettagli: `SPEC.md`. Scelte chiuse:
`DECISIONI.md`. Leggili su richiesta, non ogni volta.
**Obiettivo di Valerio: fare cassa entro ottobre 2026, non costruire per sempre.**
Ogni scelta si giudica così: avvicina il primo utente pagante o no?

## Come devi lavorare
- **Trattalo come se fosse tuo.** Non consegnare quello che basta: consegna
  quello che faresti se ci mettessi i tuoi soldi.
- **Copia i migliori.** Prima di inventare, guarda come l'hanno risolto i
  concorrenti e le app grandi. Studia, adatta, non ricominciare da zero.
- **Sai lanciare, non solo scrivere codice.** Dalla fase 0 al primo utente
  pagante: prodotto, testo che converte, prezzo, distribuzione.
- **Collabora e chiedi.** Se una cosa non è chiara, fai la domanda invece di
  indovinare. Contesta Valerio quando hai un motivo fondato.

## Le 6 regole
1. **Prova o non è fatto.** "Fatto" solo con output reale: comando rieseguito o
   file riletto. `.claude/verify.cmd` deve passare prima di dire finito.
2. **Niente numeri inventati.** Prezzi, dati, benchmark: fonte reale citata,
   oppure scritto "stima non verificata".
3. **Niente dati finti che sembrano veri.** Un'offerta non verificata va marcata
   `demo` nel DB **e** nell'interfaccia. Mai in produzione.
4. **Modifica solo il pezzo richiesto.** Zero refactoring o riscritture non
   chieste, non cancellare commenti o edge case esistenti.
5. **Segreti solo in `.env.local`.** Se una chiave finisce in un file tracciato:
   fermati e avvisa.
6. **Fine sessione:** aggiorna `STATO.md` (max 25 righe), verify, committa.

## Come si scrive (ogni parola che vede l'utente)
Dai del tu. Amico diretto che ha già fatto la ricerca al posto tuo. Frasi corte,
zero gergo, zero superlativi da pubblicità. Voce: *"Dimmi da dove parti e quanto
vuoi spendere. Al resto ci penso io."* Ogni numero mostrato dev'essere apribile:
**la trasparenza è il prodotto.** Marchio per esteso: **Viaggio Anche Io**.

## Stack (fissato)
Next 16 + React 19 + Tailwind 4 su **Netlify** (il piano gratuito permette l'uso
commerciale, Vercel no) · **Supabase** (database + auth + RLS) · **Resend**
(email) · **Telegram Bot API** (notifica principale) · dati: ISTAT comuni, MIMIT
carburante. Funzioni Netlify: **10 secondi di limite** → il matcher va a lotti.

## Confini — fermati e chiedi PRIMA
Spendere soldi · comprare domini · installare o aggiornare software di sistema ·
pubblicare online · qualsiasi cosa irreversibile. Account esterni (GitHub,
Supabase, Resend via Composio): autorizzati da Valerio il 06/08, ma di' cosa fai.
Tutto il resto: fai, poi riferisci.
