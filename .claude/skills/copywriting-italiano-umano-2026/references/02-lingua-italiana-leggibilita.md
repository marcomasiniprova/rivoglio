# 02 — Lingua italiana e leggibilità misurabile

## Indice Gulpease — l'unico indice di leggibilità tarato sull'italiano [S1]

Fonte: sviluppato nel 1988 dal Gruppo Universitario Linguistico Pedagogico (GULP), Università "La Sapienza" di Roma — a differenza dell'indice di Flesch (inglese, basato sulle sillabe), il Gulpease è costruito sulla lunghezza delle parole in **lettere**, più adatto alla struttura dell'italiano. È lo standard italiano di riferimento (usato anche dentro Microsoft Word in italiano).

**Formula esatta** (calcolabile su ogni testo, anche a mano):

```
Gulpease = 89 − (10 × lettere / parole) + (300 × frasi / parole)
```

**Come leggere il punteggio** (0-100, più alto = più facile da leggere):
- **Sopra 80**: leggibile anche da chi ha la sola licenza elementare
- **60-80**: leggibile da chi ha la licenza media — **è il target giusto per un sito consumer generico**: scrivi per capire, non per impressionare
- **40-60**: leggibile solo da chi ha un diploma di scuola superiore — accettabile per contenuti B2B tecnici, non per una landing page consumer
- **Sotto 40**: quasi illeggibile per chi non ha una laurea — non dovrebbe mai capitare in un sito che vuole vendere

**Come si abbassa il punteggio (da evitare)**: parole lunghe (più lettere) e frasi lunghe (poche frasi per molte parole). Due frasi corte quasi sempre leggono meglio di una frase lunga con una subordinata.

**Processo pratico per Claude Code**: dopo aver scritto un paragrafo importante (headline, primo paragrafo, CTA), calcola mentalmente una stima del punteggio (conta lettere/parole/frasi di un campione) e se il risultato stimato è sotto 60 per un testo consumer, riscrivi accorciando parole e frasi prima di consegnare.

---

## Tu o Lei? — la scelta che cambia tutto il tono

Non c'è una regola fissa, ma un criterio chiaro dalle fonti consultate:
- **Il "tu" è la scelta di default per il web/consumer moderno**: crea vicinanza, è quello che il pubblico si aspetta oggi da un brand digitale, soprattutto SaaS/app.
- **Il "lei" resta riservato a**: settori finanziari/assicurativi/legali formali, comunicazioni istituzionali, o quando ci si rivolge a un professionista con cui non c'è un rapporto diretto.
- **Per un prodotto consumer digitale**: il "tu" è quasi sempre la scelta giusta (vicinanza, momento emotivo o quotidiano) — ma il tono deve restare autorevole quando si parla della parte legale/normativa/tecnica (lì i fatti restano precisi e citati, non si "addolcisce" la sostanza, solo il tono di chi la spiega).
- **Non mischiare** tu/lei/voi nello stesso testo — sceglierne uno e mantenerlo con coerenza in tutto il sito.

---

## Regole pratiche di scrittura

- **Frasi brevi, non frasi tutte uguali**: alterna frasi corte e medie, evita la monotonia sia di frasi tutte lunghe (stanca) sia tutte cortissime (sembra un elenco, non un discorso umano).
- **Una parola semplice batte una parola difficile a parità di significato**: "usare" invece di "utilizzare", "capire" invece di "comprendere appieno" — a meno che la parola tecnica sia effettivamente più precisa e necessaria.
- **Elimina il gergo aziendale/marketing vuoto**: "soluzione innovativa", "leader di mercato", "sinergie", "ecosistema" — sono parole che non dicono niente di specifico e ogni lettore italiano le riconosce come rumore pubblicitario.
- **Scrivere per lo schermo, non per la carta**: online si scansiona più che leggere parola per parola — paragrafi brevi, grassetto sulle parole chiave (non tutte le frasi), struttura scannerizzabile.
- **Una sola idea per frase**: se una frase ha due-tre concetti concatenati con "e", "che", "il quale", quasi sempre va spezzata in due frasi.

---

## Fonti principali di questo file
Indice Gulpease (Wikipedia, andreapacchiarotti.it, mindtraduzioni.it, seogarden.net — formula e soglie confermate in modo consistente da più fonti indipendenti), Studio AEsse Communication e sayagency.com (scelta tu/lei), Tready.it (web copywriting).
