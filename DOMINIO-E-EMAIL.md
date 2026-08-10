# Il dominio e le email, passo per passo

*Scritto per Valerio il 10/08. È il pezzo che sblocca tutto il resto:
finché non è fatto, **Resend spedisce SOLO a valerio@artecai.it**. Non è
una scelta nostra, è una regola di Resend: senza un dominio verificato
non ti lascia scrivere a nessun altro.*

Cosa resta fermo intanto: la conferma d'iscrizione all'Osservatorio, il
benvenuto, tutta la sequenza della pratica (promemoria, sollecito,
segnalazione all'ente, controllo esito) e gli avvisi. Cioè: un cliente
che paga non riceve niente.

---

## PASSO 1. Scegli il dominio e dimmelo

Hai uno slot gratuito su Hostinger. `rivolio.it` risultava libero il
9/08. Quando l'hai registrato, mandami il nome esatto: da lì in avanti
il resto è mio più due incolla tuoi.

---

## PASSO 2. Il dominio punta su Netlify

Sul pannello Netlify: **Domain management → Add a domain**, scrivi il
dominio, e Netlify ti dice cosa mettere. Di solito sono due cose, da
incollare nel pannello DNS di Hostinger:

- un record **A** per `rivolio.it` che punta all'indirizzo che ti dà
  Netlify;
- un record **CNAME** per `www` che punta al tuo indirizzo `.netlify.app`.

Il certificato di sicurezza (il lucchetto) lo fa Netlify da solo, dopo
qualche minuto. Non serve comprarlo.

⚠️ I DNS ci mettono da pochi minuti a qualche ora. Se apri subito e non
funziona, non è rotto: è in viaggio.

---

## PASSO 3. Il sito impara il suo indirizzo nuovo

Su Netlify, **Environment variables**:

| Nome | Valore |
|---|---|
| `NEXT_PUBLIC_SITO` | `https://rivolio.it` |

Da quella variabile dipendono già tutti i link dentro le email, la
sitemap, i dati per Google e l'immagine social. **Nel sito non c'è
nessun indirizzo scritto a mano**: l'ho controllato oggi, e i quattro
punti dove c'era ancora (dentro l'app del telefono) adesso leggono la
stessa variabile.

Per l'app, quando la ricostruisci: `EXPO_PUBLIC_SITO=https://rivolio.it`.

---

## PASSO 4. Resend: verificare il dominio

Su resend.com: **Domains → Add Domain**, scrivi `rivolio.it`.

Resend ti mostra **tre record** da incollare nel DNS di Hostinger. Sono
sempre di questo tipo:

1. un **TXT** che comincia per `resend._domainkey` (è la firma DKIM: dice
   ai server di posta che quella email l'hai mandata davvero tu);
2. un **TXT** con dentro `v=spf1` (dice chi è autorizzato a spedire per
   tuo conto);
3. un **TXT** che comincia per `_dmarc` (dice cosa fare se qualcuno prova
   a fingersi te).

Incollali tutti e tre, poi torna su Resend e premi **Verify**. Quando
diventano verdi, hai finito.

**Perché servono tutti e tre:** senza, le tue email finiscono in spam.
Non "a volte": Gmail e Outlook li pretendono da febbraio 2024 per chi
manda email in serie.

---

## PASSO 5. Il mittente

Su Netlify:

| Nome | Valore |
|---|---|
| `RESEND_MITTENTE` | `Valerio di Rivolio <valerio@rivolio.it>` |

Il nome davanti è quello che il cliente vede nella casella. "Valerio di
Rivolio" è la tua scelta dell'8/08 e resta: da una persona si aprono più
email che da un marchio.

---

## PASSO 6. La prova, in tre minuti

1. Vai sul sito vero e iscriviti all'Osservatorio con **un indirizzo che
   non è il tuo** (uno di famiglia va benissimo).
2. Deve arrivare "Confermi l'iscrizione?". Clicca il link.
3. Deve arrivare il benvenuto con dentro gli scali di oggi.

Se arrivano tutte e due a un indirizzo diverso dal tuo, il dominio è
verificato davvero. Se non arriva niente, guarda su Resend nella sezione
**Emails**: lì c'è scritto se è partita e cosa ha risposto il server
dall'altra parte.

---

## PASSO 7. Le altre due cose da cambiare lo stesso giorno

- **Polar**, l'indirizzo del webhook: da
  `https://rivoglio.netlify.app/api/polar/webhook` a
  `https://rivolio.it/api/polar/webhook`. Se te lo dimentichi, il
  cliente paga e la pratica non si apre.
- **Supabase**, in Authentication → URL Configuration: il "Site URL" e i
  "Redirect URLs" vanno aggiornati, se no il link per entrare rimanda al
  vecchio indirizzo.

---

## Cosa NON devi fare

- Non serve comprare un certificato SSL: lo fa Netlify.
- Non serve spostare le email personali: `valerio@artecai.it` continua a
  funzionare, questo dominio serve solo a Rivolio.
- Non cancellare `rivoglio.netlify.app`: resta come indirizzo di riserva,
  e se un giorno il DNS fa i capricci il sito è comunque raggiungibile.
