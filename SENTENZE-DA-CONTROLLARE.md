# Le sentenze citate nelle lettere

*Aggiornato l'11/08. Le lettere che il cliente manda alla compagnia
citano cinque sentenze. Un numero di causa sbagliato lo fa sembrare
sprovveduto proprio nel punto in cui ha ragione, quindi ognuna va letta
sul testo, non ricordata a memoria.*

---

## Cosa ho potuto verificare da qui, e cosa no

Da questa macchina **EUR-Lex non si apre**: risponde con una pagina
vuota (è un blocco anti-robot, non un guasto). Anche il sito della Corte
serve una pagina generica, e il browser non esce in rete: solo `curl`
passa dal proxy.

Quindi ho verificato quello che si poteva verificare, e **lo dichiaro
riga per riga** invece di far finta.

| Sentenza | Cosa deve dire | Verificata? |
|---|---|---|
| **Sturgeon**, C-402/07 e C-432/07 | il ritardo di 3 ore o più **all'arrivo** dà la stessa compensazione della cancellazione | ✅ **SÌ, sul testo ufficiale** |
| **Germanwings**, C-452/13 | l'orario di arrivo è il momento in cui **si apre almeno una porta** | 🟡 fonti secondarie concordi |
| **Wallentin-Hermann**, C-549/07 | un problema tecnico **non è** di per sé circostanza eccezionale | 🟡 da rileggere |
| **van der Lans**, C-257/14 | vale anche per un **guasto improvviso** non causato da eventi esterni | 🟡 da rileggere |
| **Airhelp contro SAS**, C-28/20 | lo sciopero del **personale della compagnia** non è, in linea di principio, circostanza eccezionale | 🟡 da rileggere |

---

## ✅ Sturgeon: verificata, ed è quella che regge tutto

**Fonte aperta l'11/08**, ed è la migliore possibile per noi perché è
l'ENAC stessa a pubblicarla:
`https://www.enac.gov.it/app/uploads/2024/04/sentenza_091119_ritardosopra3ore.pdf`

**Il dispositivo, punto 2, parola per parola:**

> *«Gli artt. 5, 6 e 7 del regolamento n. 261/2004 devono essere
> interpretati nel senso che i passeggeri di voli ritardati possono
> essere assimilati ai passeggeri di voli cancellati ai fini
> dell'applicazione del diritto alla compensazione pecuniaria e che essi
> possono pertanto reclamare il diritto alla compensazione pecuniaria
> previsto dall'art. 7 di tale regolamento quando, a causa di un volo
> ritardato, subiscono una perdita di tempo pari o superiore a tre ore,
> ossia quando giungono alla loro destinazione finale tre ore o più dopo
> l'orario di arrivo originariamente previsto dal vettore aereo. Tuttavia,
> un siffatto ritardo non implica il diritto alla compensazione pecuniaria
> per i passeggeri se il vettore aereo è in grado di dimostrare che il
> ritardo prolungato è dovuto a circostanze eccezionali...»*

È esattamente quello che scrive la nostra lettera. **Nessuna modifica da
fare.**

---

## 🔴 L'errore che questa lettura ha fatto saltare fuori

Nel dispositivo di Sturgeon, qui sopra, **le porte dell'aeromobile non
compaiono mai**. Ma la nostra replica al "il volo non era così in
ritardo" usava proprio l'argomento delle porte, e citava **solo**
Sturgeon.

Quell'argomento è di un'altra sentenza: **Germanwings contro Henning,
causa C-452/13**. Il caso è quello di un passeggero Salisburgo →
Colonia le cui ruote toccarono terra con 2 ore e 58 minuti di ritardo,
mentre le porte si aprirono oltre le tre ore: la compagnia diceva di non
dover niente, la Corte ha stabilito che conta l'apertura delle porte.

**Corretto l'11/08** in `lib/pratiche/rifiuto.ts`: adesso la replica
cita tutte e due, ognuna per quello che dice davvero.

⚠️ **L'attribuzione a Germanwings viene da fonti secondarie
concordanti** (tre riviste giuridiche italiane, tutte con lo stesso
testo del dispositivo), **non dal testo ufficiale**: da qui non si apre.
È comunque meglio della situazione di prima, dove l'argomento era
attribuito a una sentenza che ho **letto** e che non lo contiene. Ma va
confermata: è la prima riga della lista qui sotto.

---

## 🟡 Quello che devi rileggere tu, e cosa deve dirti ognuna

Aprile dal tuo PC, dove EUR-Lex funziona. Per ognuna: apri, cerca **«Per
questi motivi, la Corte dichiara»** (è il dispositivo, in fondo) e
controlla la frase indicata.

### 1. Germanwings, C-452/13 · *la più urgente*
`https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:62013CJ0452`

**Deve dire** che la nozione di «orario di arrivo» corrisponde al
momento in cui **almeno una delle porte dell'aeromobile si apre**, a
condizione che ai passeggeri sia consentito lasciare l'apparecchio.

**Se non lo dice**, dimmelo subito: quella replica va riscritta.

### 2. Wallentin-Hermann, C-549/07
`https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:62007CJ0549`

**Deve dire** che un problema tecnico emerso nella manutenzione o
derivante da carenza di manutenzione **non costituisce di per sé** una
circostanza eccezionale: lo è solo se deriva da eventi che, per natura o
origine, non sono inerenti al normale esercizio dell'attività del
vettore e sfuggono al suo effettivo controllo.

### 3. van der Lans, C-257/14
`https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:62014CJ0257`

**Deve dire** che lo stesso vale per un **guasto improvviso** non
causato da eventi esterni all'attività del vettore.

### 4. Airhelp contro SAS, C-28/20
`https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:62020CJ0028`
Oppure, e forse è più comoda, la pagina che l'ENAC le dedica:
`https://www.enac.gov.it/la-normativa/normativa-internazionale/normativa-europea/sentenze/sentenza-della-corte-di-giustizia-europea-del-23-marzo-2021-c-2820/`

**Deve dire** che uno sciopero indetto dalle organizzazioni sindacali
del personale del vettore, nell'ambito della normale gestione dei
rapporti di lavoro, **non rientra** nella nozione di circostanza
eccezionale.

⚠️ Questa è la sentenza che regge la distinzione che ci differenzia dai
portali (sciopero della compagnia = di solito si paga; sciopero dei
controllori = di solito no). Se cadesse, cadrebbe un pezzo di prodotto.

---

## Come dirmi l'esito

Per ognuna basta una riga: **"la 452 dice le porte: ok"** oppure
**"la 452 dice un'altra cosa: <cosa>"**. Al primo "dice un'altra cosa"
riscrivo la replica e aggiungo una prova che la tiene ferma.
