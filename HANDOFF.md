# HANDOFF — fine giro #40 (9/08/2026)

## Stato

Il blog **Il Tabellone** è costruito, provato e spinto su
`claude/saas-app-repo-analysis-ghehqa` (commit `f570467`).
`npm run verify`: **538 prove verdi**, le 2 rosse sono le solite
dell'Osservatorio che nella sandbox non raggiunge Supabase.
Eval del motore: **45 su 45, falsi positivi 0**.

## Decisioni prese in questo giro (col popup)

1. Il blog si chiama **Il Tabellone**, vive su `/tabellone`.
2. Le copertine sono **illustrazioni nostre in SVG**, più i dieci prompt
   consegnati in `COPERTINE.md` per sostituirle con le foto.
3. Gli articoli sono firmati **"La redazione di Rivolio"**.
4. Le **pagine evento sono ferme**: Valerio ha scritto "non ho ancora
   capito come si intreccia col blog e se sono la stessa cosa o no".
   Vanno rispiegate e riproposte al prossimo giro (ARRETRATI, voce A).

## File toccati

- **Nuovi**: `app/tabellone/**` (indice, articolo, argomento, archivio,
  feed RSS, immagine social), `components/tabellone/**` (14 componenti),
  `lib/tabellone/**` (tipi, indice, seo, i 10 articoli in `pezzi/`),
  `prove/tabellone.spec.ts`, `COPERTINE.md`.
- **Modificati**: `lib/regole/eu261.ts` e `lib/regole/casi-oro.ts` (il
  falso positivo sull'importo, vedi sotto), `app/globals.css` (la carta
  del blog, la tipografia dell'articolo, la cornice sfalsata),
  `app/sitemap.ts`, `lib/copy.ts` (Tabellone in nav e footer),
  `public/llms.txt`, `STATO.md`, `PIANO.md`, `ARRETRATI.md`.

## La cosa da non perdere di vista

Scrivendo l'articolo pilastro è saltato fuori che **il motore prometteva
600 euro dove il Regolamento ne dà 400**: l'art. 7 lett. b) tiene a 400
tutte le tratte intracomunitarie sopra i 1500 km, per quanto lunghe.
Chiuso, regole alla **2026.08.6**, due casi d'oro nuovi. Se qualcuno tocca
le fasce in `eu261.ts`, quella riga (`intraUe`) non si tocca.

## Cosa resta

Tutto in `ARRETRATI.md`, voci da A a F. Le due che servono davvero:

- **A**: rispiegare le pagine evento e riproporle.
- **B e C**: le foto di copertina (prompt pronti) e la riverifica delle
  fonti degli articoli dal PC di Valerio. Da qui la rete è chiusa e
  nessuna delle pagine citate si apre: gli indirizzi sono reali, i numeri
  vengono dagli estratti dei motori di ricerca.
