# Il linguaggio visivo dell'app, misurato

*Estratto il 10/08/2026 dal file `Rivolio App.dc.html` prodotto con Claude
Design (29 schermate). Non sono stime a occhio: sono i valori letti dal
CSS vero. Questo documento è la fonte unica quando si porta una schermata
in React Native.*

> Il file originale pesa 1,8 MB con le immagini in base64 e **non sta nel
> repo di proposito**: se lo mettessimo dentro, ogni clone se lo
> porterebbe appresso per sempre. Qui restano i numeri, che sono la parte
> che serve. Il file ce l'ha Valerio.

---

## La palette coincide con la nostra, esadecimale per esadecimale

È il fatto che rende la migrazione un lavoro di struttura e non di
ricolorazione. Dieci colori su dieci sono già in `src/lib/tema.ts`.

| Uso | Valore | Nome nel tema |
|---|---|---|
| Verde del marchio | `#0A9D5C` | `verde` |
| Verde scuro | `#067A46` | `verdeScuro` |
| Verde notte | `#052E1F` | `verdeNotte` |
| Menta tenue | `#E6FAF0` | `mentaTenue` |
| Nebbia | `#F6F8FA` | `nebbia` |
| Nebbia 2 | `#EEF2F5` | `nebbia2` |
| Bordo | `#E4E9EE` | `bordo` |
| Inchiostro | `#0A0A0A` | `inchiostro` |
| Fumo | `#6B7280` | `fumo` |
| Fumo 2 | `#9AA4B0` | `fumo2` |

**Due colori che noi non avevamo e che servono:**

| Uso | Valore | Dove |
|---|---|---|
| Verde acceso | `#12C375` | accenti su fondo verde notte, dove `verde` sparisce |
| Ambra del testo | `#A9791A` | il testo dentro i riquadri gialli, che deve restare leggibile |

---

## Caratteri

Gli stessi tre del marchio: **Geist** (display), **Poppins** (testo),
**Instrument Serif** in corsivo (la parola accentata dentro i titoli).

**I pesi usati sono tre e uno è nuovo per noi:** 400, 500 e **600**.
Nel nostro tema il display sta a 500 perché BRAND dice "mai grassetto
pieno"; lui usa 600 sui corpi in evidenza, non sui titoli, e quella
distinzione va tenuta.

### Scala dei corpi

Non è una progressione regolare: sono misure scelte una per una.
I valori davvero ricorrenti, in ordine di frequenza:

`17 · 27 · 19 · 24 · 30 · 16 · 22 · 29 · 32 · 20 · 28 · 21`

più tre misure singole per i momenti grossi: **40**, **50**, **74**.

Il 74 è l'importo del verdetto. Il 27 e il 30 sono i titoli di schermata.
Il 17 e il 19 sono il corpo lungo. Sotto i 16 si scende solo per gli
occhielli e le note.

### Spaziatura fra le lettere

| Dove | Valore |
|---|---|
| Occhielli in maiuscolo | **`.16em`** (il più usato, di gran lunga) |
| Occhielli molto piccoli | `.18em`, fino a `.22em` |
| Etichette | da `.06em` a `.12em` |
| Titoli grandi | `-0.04em` |
| Numeri giganti | `-0.012em` e oltre in negativo |

⚠️ **Il nostro occhiello è più stretto del suo**: usiamo 1,2-1,4px, che
a 11px fa circa `.11em`. Il suo `.16em` è visibilmente più arioso, e
questa è una delle differenze che si notano di più mettendo le due
schermate vicine.

### Interlinea dei titoli

`.9` · `.92` · `1` · `1.1` · `1.15`. Sotto l'unità solo sui numeri
giganti, dove la riga sarebbe altrimenti troppo alta.

---

## Raggi degli angoli

Qui c'è la differenza più grande dal nostro tema, ed è una scelta di
mestiere, non un capriccio.

Noi abbiamo cinque raggi fissi. Lui ne usa **dodici**, e ogni elemento ha
il suo:

`999` (102 volte) · `16` · `11` · `9` · `20` · `22` · `14` · `18` · `13`
· `12` · `10` · `24`

Il 999 domina perché pillole, badge e chip sono ovunque. Gli altri
seguono la dimensione dell'elemento: più è grande, più il raggio cresce.
Un raggio unico su ogni cosa è uno dei difetti che la skill
`art-director` vieta esplicitamente, ed è quello che il nostro tema
rischiava.

---

## Ombre

Sono il motivo per cui le sue card sembrano appoggiate e le nostre
sembrano incollate. Le sue, in CSS:

```
0 14px 30px -26px rgba(5,46,31,.55)
0 18px 36px -30px rgba(5,46,31,.55)
0 22px 44px -32px rgba(5,46,31,.6)
inset 0 1px 0 rgba(255,255,255,.45)
```

Tre cose da capire, perché in React Native non si copiano e basta.

1. **L'ombra è tinta di verde notte** (`rgba(5,46,31,…)`), mai nera.
   Questo lo facevamo già.
2. **Lo spread negativo forte** (`-26px` su un blur di `30px`) stringe
   l'ombra sotto l'elemento invece di spanderla intorno: il risultato è
   un appoggio, non un alone. React Native **non ha lo spread**: si
   approssima alzando l'offset verticale e abbassando l'opacità.
3. **La lucina in cima** (`inset 0 1px 0 rgba(255,255,255,.45)`) è il
   dettaglio che dà lo spessore. In React Native non esiste l'inset: si
   fa con un bordo superiore bianco al 45% oppure con una riga di 1px.

### La traduzione usata in `tema.ts`

| CSS | React Native |
|---|---|
| `0 14px 30px -26px rgba(5,46,31,.55)` | offset `{0, 10}`, radius `14`, opacity `0.13` |
| `0 22px 44px -32px rgba(5,46,31,.6)` | offset `{0, 16}`, radius `20`, opacity `0.16` |

Sono approssimazioni dichiarate, non conversioni esatte: lo spread
negativo non ha un equivalente e il compromesso è tenere l'ombra bassa e
stretta invece che larga e diffusa.

---

## Cosa NON si porta da quel file

Tre cose sono giuste per un browser e sbagliate per un'app nativa:

- **il vetro sfocato** (`backdrop-filter`): su React Native serve una
  libreria a parte e costa in prestazioni;
- **le cornici di iPhone** attorno alle schermate: sono la presentazione
  della tavola, non l'app;
- **i gradienti animati di sfondo**: in app si degrada a bande statiche,
  che è quello che fa `VeloVerde` in `components/ScenaVerdetto.tsx`.

---

## Gli errori di sostanza della tavola

Sono elencati e spiegati nel prompt di correzione consegnato a Valerio il
10/08. In sintesi, quello che **non va portato così com'è**:

1. il chip "Termine 2031" nel verdetto: una scadenza che non abbiamo;
2. il chip "Meteo sereno": l'archivio meteo commerciale è spento;
3. il prezzo dentro i bottoni: è acceso il test dei due listini;
4. "la compagnia deve 400 euro": è una promessa di pagamento;
5. la lettera che chiede il pagamento in 14 giorni invece di 30;
6. i fogli senza la riga "non costituisce parere legale";
7. la replica senza l'onere della prova dell'art. 5 par. 3;
8. "CNS" fra le identità digitali di ConciliaWeb: non verificata.
