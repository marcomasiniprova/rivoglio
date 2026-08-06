@STATO.md

# Viaggio Anche Io — regole di progetto

## Cos'è
Ti avvisa quando esiste una micro-vacanza (1-3 notti, entro X ore da casa tua)
sotto il budget che decidi tu. Prezzo = alloggio reale + auto calcolata. Tutta
Italia. Si paga a crediti: 1 credito = 1 alert. Dettagli: `SPEC.md`. Scelte
chiuse: `DECISIONI.md`. Leggili su richiesta, non ogni volta.

## Le 6 regole
1. **Prova o non è fatto.** Ogni "fatto" va con output reale: comando rieseguito
   o file riletto. `.claude/verify.cmd` deve passare prima di dire "finito".
2. **Niente numeri inventati.** Prezzi, dati di mercato, benchmark: fonte reale
   e citata, oppure scritto "stima non verificata". Mai un numero a caso.
3. **Niente dati finti che sembrano veri.** Un'offerta non verificata va marcata
   `demo` nel DB **e** visibilmente nell'interfaccia. Mai in produzione.
4. **Modifica solo il pezzo richiesto.** Zero refactoring non chiesti, zero
   riscritture, non cancellare commenti o edge case esistenti.
5. **Segreti solo in `.env.local`** (già in `.gitignore`). Se una chiave finisce
   in un file tracciato: fermati e avvisa.
6. **Fine sessione:** aggiorna `STATO.md` (max 25 righe), lancia verify, committa.

## Come si scrive (vale per OGNI parola che vede l'utente)
- **Dai del tu.** Amico diretto che ha già fatto la ricerca al posto tuo.
- Frasi corte. Zero gergo, zero inglese inutile, zero superlativi da pubblicità.
- Voce del marchio: *"Dimmi da dove parti e quanto vuoi spendere.
  Al resto ci penso io."*
- Ogni numero mostrato all'utente deve essere apribile: se scrivi "€26 di auto",
  deve poter vedere il conto. **La trasparenza è il prodotto.**
- Marchio scritto sempre per esteso: **Viaggio Anche Io**.

## Stack (fissato)
Next.js su **Netlify** (il piano gratuito permette l'uso commerciale, Vercel no)
· **Supabase** (database + login) · **Stripe** (crediti) · **Resend** (email) ·
**Telegram Bot API** (notifica principale) · dati: **ISTAT** comuni, **MIMIT**
carburante. Funzioni Netlify: **10 secondi di limite** → il matcher va a lotti.

## Confini — fermati e chiedi PRIMA
Spendere soldi · comprare domini · toccare account esterni (Stripe, Netlify,
social) · pubblicare su un dominio pubblico · qualsiasi cosa irreversibile.
Tutto il resto: fai, poi riferisci.

## Vocabolario
**offerta** = una micro-vacanza concreta (struttura + date + prezzo).
**prezzo totale** = alloggio + auto, per persona. Mai solo alloggio.
**ricerca** = i criteri salvati da un utente. **alert** = un invio.
**credito** = 1 alert ricevuto. **tetto** = max alert/settimana scelto dall'utente.
**raggio** = ORE di viaggio, mai chilometri.
