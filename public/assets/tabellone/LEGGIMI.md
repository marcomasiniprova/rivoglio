# Le copertine del Tabellone

Qui dentro vanno le **foto** di copertina degli articoli del blog.

Finché una foto non c'è, il sito disegna da solo la sua copertina
(`components/tabellone/Copertine.tsx`): il blog è già completo e non si
vede nessun buco. Appena la foto arriva, vince lei.

## Come si aggiunge una foto

1. Metti il file qui dentro, in WebP, largo 1600 pixel.
2. Nell'articolo (`lib/tabellone/pezzi/<nome>.ts`) aggiungi una riga:
   `foto: "/assets/tabellone/<nomefile>.webp",`

Tutto il resto (ritaglio, cornice, versione per il telefono, immagine
social) è già a posto e non va toccato.

## `originali/`

È la cartella di scarico: ci finiscono le immagini appena generate, come
escono dal generatore, anche pesanti. Da lì vengono ritagliate (filigrana
compresa), ridimensionate e convertite in WebP; poi la cartella si svuota.
I prompt per generarle stanno in `COPERTINE.md`, nella radice del progetto.
