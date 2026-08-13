---
name: video-review
description: Collaudo filmato del prodotto vero, end to end. Un video solo, continuo, in cui ogni passo si USA e si verifica a schermo. Da usare quando Valerio chiede di provare tutto, di filmare un giro, o quando si è appena messo online un pezzo che nessuno ha ancora percorso.
---

# Video review

Un collaudo filmato serve a una cosa sola: **far vedere che il prodotto
funziona, senza che nessuno debba fidarsi del racconto.** Se il filmato
non permette a chi guarda di dire da solo «questo funziona / questo è
rotto», il collaudo non è stato fatto, è stato descritto.

Questa skill nasce dai difetti del primo giro filmato (13/08), tutti
segnalati da Valerio guardando i video:

> «Perché moltissimi video sono uguali, si ripetono e non cambia un
> cazzo? Perché molti sono inutili, cioè guardano e basta senza usare e
> testare? Perché video di 2 secondi, poi 30, poi 1 minuto e 30, tutti
> spezzettati? Da quello che vedo non c'è niente di nuovo.»

Aveva ragione su tutto, e ognuna di quelle frasi qui sotto è una regola.

## Le sette regole

### 1. Un video solo, continuo

Niente spezzoni. Un filmato che parte dalla home e arriva alla fine del
percorso, di fila. Chi guarda deve poter dire «l'ho visto fare», non
«ho visto undici pezzi e mi fido che si incastrino».

### 2. Mai rifare lo stesso pezzo due volte

È il difetto più visibile del primo giro: nove video su undici
cominciavano con gli stessi quaranta secondi (scrivi il volo, muro,
cassa, verdetto). Sembravano lo stesso video.

**Si paga una volta sola e si apre una pratica sola.** Da lì i rami si
aprono uno dopo l'altro sulla stessa sessione. Quando un ramo ha bisogno
davvero di un caso diverso (un volo cancellato, un negato imbarco), si
fa quel pezzo e basta, non si ricomincia dalla home.

### 3. Ogni passo si USA, non si guarda

Scorrere una pagina non è provarla. Un passo vale se c'è un gesto che
cambia lo stato: si scrive, si carica un file, si preme, si conferma.
Se in un ramo non c'è niente da premere, quel ramo nel video dura dieci
secondi e si dice a voce alta che è solo da leggere.

### 4. La didascalia dice tre cose, e la terza è il verdetto

In fondo allo schermo, per ogni passo:

```
FACCIO    carico la foto della carta d'imbarco
ASPETTO   volo e data si compilano da soli, oppure compare il muro
È ANDATA  ✓ letto ZZ250 del 06/08/2026
```

L'ultima riga è **verde se torna, rossa se no**, e la scrive il codice
confrontando quello che c'è in pagina con quello che ci si aspettava.
Non la scrivo io a mano dopo: se la scrivessi io, il video tornerebbe a
essere il mio racconto.

⚠️ La striscia è **nostra, non del sito**: va detto a chi guarda, e non
deve mai coprire un bottone (`pointer-events:none`, in fondo, e mai
sopra l'area dove si sta per premere).

### 5. Si filma DOPO il deploy, e il deploy si verifica

Il difetto peggiore del primo giro: i video mostravano il prodotto
**prima** delle correzioni, e sembrava che non fosse cambiato niente.

Prima di girare si controlla che il codice nuovo sia davvero online (si
cerca un pezzo del codice nuovo dentro gli script serviti dal sito, o si
chiama una rotta che si comporta in modo diverso). Se il deploy non è
arrivato, si aspetta: un video girato sul vecchio è peggio di nessun
video, perché racconta una bugia con l'aria della prova.

### 6. Si aspetta la pagina, non l'orologio

Dopo un gesto che cambia lo stato (dichiarare un invio, mandare la
risposta della compagnia) la pagina si rifà **da sola**, e ci mette
quello che ci mette. Chi misura tre secondi dopo legge ancora lo stato
di prima e lo scrive come difetto.

Mai `attesa(3000)` prima di una misura. Si aspetta la cosa:

```js
async function finoA(regola, secondi = 25) {
  for (let i = 0; i < secondi * 2; i++) {
    if (regola.test(await testoPagina())) return true;
    await attesa(500);
  }
  return false;
}
```

È successo davvero, e ha prodotto tre falsi difetti su undici passi nel
primo giro completo: la pratica era regolarmente al passo 3, e il mio
script guardava troppo presto.

### 7. Un difetto si dichiara solo se si riproduce due volte

Il 13/08 ho dichiarato un difetto che non c'era (un finto passo nascosto
nel consenso al recesso): era il mio script che riempiva il campo
sbagliato. Un difetto annunciato e poi ritirato costa più di un difetto
non trovato, perché toglie peso a tutti gli altri.

Prima di scriverlo: lo si rifà da capo, e si guarda il codice per
capire *perché* succede. Se la spiegazione non c'è, non è un difetto: è
un sospetto, e si dice che è un sospetto.

### 7. Alla fine si pulisce

I giri veri lasciano righe nel database: pratiche, verifiche, eventi.
Si cancellano, e si dice quante. Un cruscotto che conta le prove è un
cruscotto che mente il giorno del primo cliente.

## Come si gira, in pratica

Playwright registra da solo: basta chiedere il video al contesto.

```js
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },       // il telefono, sempre
  recordVideo: { dir: "video", size: { width: 390, height: 844 } },
});
```

Il filmato si scrive su disco **quando si chiude il contesto**
(`ctx.close()`), non alla fine dello script: se il processo muore per
un errore, il video si perde. Quindi ogni giro sta dentro un
`try/finally`, e nel `finally` si chiude il contesto.

### La didascalia

```js
async function passo(p, faccio, aspetto) {
  await mostra(p, { faccio, aspetto, esito: null });
  return async (vero, ok) => mostra(p, { faccio, aspetto, esito: { vero, ok } });
}
```

`mostra` inietta (o aggiorna) un solo `<div>` fisso in fondo alla
pagina, con le tre righe. L'esito arriva **dopo** aver misurato la
pagina, non prima.

### Il ritmo

Le pause servono a chi guarda, non al codice. Due secondi dopo ogni
didascalia, e un secondo dopo ogni gesto. La scena dell'analisi dura
sedici secondi per scelta di prodotto: non si taglia, si lascia scorrere
e la didascalia spiega perché è lunga.

### Cosa deve esserci in un giro completo

Il percorso del prodotto, in ordine, senza salti:

1. il check (i tre modi: foto, tratta, numero)
2. il muro e la cassa
3. il verdetto nei suoi tre esiti (idoneo, non idoneo, incerto)
4. i rami che chiudono un incerto con una domanda (cancellato, negato
   imbarco, coincidenza persa)
5. l'email lasciata sul verdetto
6. l'apertura della pratica (singola e famiglia)
7. la lettera, e l'invio dichiarato
8. la risposta della compagnia (incollata E fotografata)
9. la replica, il secondo no, l'ente, la conciliazione
10. l'elenco pratiche e il profilo

Quello che non si può percorrere (il calendario, il pannello che vuole
un ruolo, il telefono fisico) si dichiara **nel video stesso**, non solo
nel messaggio dopo: una riga che dice «questo non lo posso provare io,
ecco perché».

## Il rapporto che accompagna il video

Tre righe, non tre pagine:

- **cosa ho percorso** (l'elenco dei passi, col ✓ o ✗ di ognuno)
- **cosa si è rotto** (con la riga esatta che lo dimostra)
- **cosa NON ho potuto provare, e perché**

Il terzo punto è quello che rende utile il collaudo: senza, chi legge
crede che sia stato provato tutto.
