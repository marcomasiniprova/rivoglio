---
name: copertura-prompt
description: Garantisce che ogni singola istruzione di un prompt venga soddisfatta o dichiarata esplicitamente come non soddisfatta, senza omissioni silenziose. Usa SEMPRE questa skill quando il prompt dell'utente contiene più di una richiesta, una lista di punti, istruzioni numerate, vincoli multipli, un brief lungo, un messaggio con più paragrafi, o comunque ogni volta che il messaggio contiene abbastanza contenuto che una parte potrebbe passare inosservata. Attivare anche senza richiesta esplicita. Non attivare su domande secche a risposta unica.
---

# Copertura prompt

Il fallimento che questa skill previene non è la mancanza di capacità: è l'omissione
silenziosa. Su un prompt con molte istruzioni, le prime e le ultime vengono soddisfatte,
quelle centrali scivolano via, e l'utente non se ne accorge finché non è troppo tardi.
Il rimedio non è leggere "con più attenzione" — è rendere la copertura verificabile.

## Come lavorare

### 1. Inventario

Prima di iniziare, estrai ogni istruzione atomica del prompt e numerala.
Atomica significa: una cosa sola, verificabile come fatta o non fatta.
Se una frase contiene due richieste, sono due voci.

Includi anche le istruzioni implicite: formato, lingua, tono, lunghezza, cosa NON fare,
vincoli ereditati da messaggi precedenti della conversazione.

Classifica ogni voce:

| Tipo | Significato |
|---|---|
| **Vincolo** | Non negoziabile. Se non è soddisfatto il lavoro è sbagliato |
| **Preferenza** | Da rispettare, ma cede se collide con un vincolo |
| **Contesto** | Informazione di sfondo, non genera un'azione |

### 2. Conflitti e ambiguità — prima, non dopo

Se due istruzioni si contraddicono, o una è interpretabile in più modi con esiti
diversi, fermati e chiedi **prima** di iniziare il lavoro. Una domanda costa trenta
secondi; il lavoro rifatto costa un'ora.

Se l'ambiguità è marginale, non chiedere: scegli l'interpretazione più probabile,
procedi, e dichiara la scelta fatta nel resoconto finale.

Non inventare istruzioni non date. Se il prompt non specifica qualcosa, quella è
libertà, non un buco da riempire con assunzioni presentate come fatti.

### 3. Ordine

Esegui nell'ordine imposto dalle dipendenze, non nell'ordine in cui le istruzioni
appaiono nel testo. Se il punto 12 va fatto prima del punto 3, fallo e basta.

### 4. Resoconto di copertura

Alla fine del lavoro, chiudi SEMPRE con questo blocco:

```
--- COPERTURA: [soddisfatte]/[totali] ---
Non soddisfatte:
- #N: [istruzione] → [motivo: impossibile / mancano informazioni / in conflitto con #M]
Interpretazioni scelte:
- #N: [ambiguità] → [interpretazione adottata]
```

Se tutte le istruzioni sono soddisfatte e non c'erano ambiguità, basta la prima riga.

Non dichiarare soddisfatta un'istruzione che hai soddisfatto solo parzialmente:
elencala tra le non soddisfatte specificando cosa manca. Un numero gonfiato
distrugge l'unico motivo per cui questo resoconto esiste.

## Cosa questa skill NON deve fare

- Non allungare la risposta con riassunti del prompt o parafrasi delle richieste.
  L'inventario è lavoro interno, non output. Nella risposta va solo il blocco finale.
- Non aggiungere verifiche, controprove o passaggi di sicurezza non richiesti.
- Non trasformare ogni risposta in una checklist: l'output mantiene il formato
  richiesto dall'utente, il blocco copertura è l'unica aggiunta.
- Non attivarsi su domande singole. "Che ore sono a Tokyo?" non ha bisogno di niente.
