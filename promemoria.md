# Promemoria Rivolio

Il mio blocco note condiviso. Qui segno le cose da fare, mie e tue, e a ogni
giro ti ricordo quelle tue ancora aperte. Le spiegazioni sono in parole
semplici, come piace a te.

Aggiornato: 2026-08-14.

---

## DA FARE TU (Valerio) — le cose che solo tu puoi fare

### 1. Test in locale della seconda fonte (AviationEdge)
**A cosa serve:** misurare quanti "non lo so" diventano "idoneo" grazie alla
seconda fonte, prima di legarti ai 299 dollari al mese fissi.
**Come si fa:**
1. accendi il mese scontato di AviationEdge e prendi la chiave;
2. incolla la chiave nel file `.env.development.local` (nella cartella del
   progetto) su una riga nuova: `AVIATIONEDGE_API_KEY=la-tua-chiave`;
3. sempre da quella cartella, lancia: `npm run banco`.
**Cosa guardi:** la tabella dei 30 voli veri con la colonna "2ª FONTE", e in
fondo la riga "RECUPERATI dalla 2ª fonte: N idonei (+X€)". Quel N è il numero
che dice se vale la pena tenerla. Incollamelo e decidiamo insieme.

### 2. Meteo sul tuo VPS (Open-Meteo self-hosted)
**A cosa serve:** smontare la scusa del maltempo nella lettera di risposta a
un "no" della compagnia. NON serve a trovare clienti: serve a vincere le liti.
Costo in più zero, perché il VPS (KVM 4 Hostinger) ce l'hai già.
**Stato:** il codice è pronto. Legge da una variabile `OPENMETEO_URL`. Finché
non gliela dai, il meteo resta spento e la lettera esce lo stesso, senza la
riga meteo. Nessun errore.
**Cosa manca:** installare Open-Meteo sul VPS (Docker + lo scarico
dell'archivio meteo storico). È la parte più tecnica. **Quando vuoi partire,
dimmelo:** ti scrivo i comandi uno alla volta, in un riquadro, già provati.
Poi su Netlify aggiungi `OPENMETEO_URL` con l'indirizzo del tuo Open-Meteo.

### 3. Netlify: fai reindirizzare il vecchio indirizzo al nuovo
**Perché:** oggi il sito risponde SIA su rivolio.it SIA su
rivolio.netlify.app (li ho controllati, rispondono tutti e due). Il sito
dichiara già rivolio.it come indirizzo ufficiale (canonical), quindi Google
capisce qual è quello buono. Ma per pulizia conviene che chi apre
rivolio.netlify.app venga spinto in automatico su rivolio.it.
**Come:** su Netlify, impostazioni del dominio, metti **rivolio.it come
dominio principale (primary domain)**. Da lì Netlify reindirizza il vecchio da
solo. Cosa da due minuti.

### 4. Ri-esporta l'app dopo aver cambiato l'indirizzo
Se cambi `EXPO_PUBLIC_SITO`, l'app va ri-esportata (`npm run anteprima` dentro
`mobile/`), perché quell'indirizzo si decide quando l'app viene costruita, non
quando la apri. Ho già messo rivolio.it come riserva nel codice dell'app.

### 5. Scioperi: se trovi un file aggiornato al 2026, mandamelo
Il file del Ministero che mi hai dato ha le colonne giuste (settore, chi
sciopera, esclusioni) ma **si ferma al febbraio 2020**: nessun volo che si
reclama oggi è così vecchio, quindi per gli scioperi di oggi non serve. Per
quelli di oggi tengo l'autopilota che già gira. Se sul sito del Ministero
trovi la versione aggiornata al 2025-2026, scaricala e mandamela: il lettore
lo costruisco su quello schema in mezza giornata.

### 6. Solidità per l'alto traffico (dall'audit del 14/08)
Prima di mandare un video a migliaia di persone, quattro cose tue. Il codice
per reggerle è già a posto o pronto; queste sono configurazioni.
1. **Applica la migrazione** `supabase/2026-08-14-scala.sql` sul Supabase vero
   (SQL editor). Aggiunge gli indici che tengono in piedi il pannello sotto
   carico e il vincolo che impedisce pratiche doppie. Non tocca dati, si può
   rilanciare.
2. 🔴 **AeroDataBox è il vero collo di bottiglia: 3 richieste al secondo.**
   Con la cache un volo = una chiamata, ma in un video virale la gente
   controlla voli DIVERSI, quindi la cache aiuta poco: sopra ~3 voli nuovi al
   secondo i check escono "non lo so". Non è un errore (nessuno paga per un
   verdetto sbagliato), ma il video "non regge". Prima di un lancio grosso:
   **chiedi ad AeroDataBox il piano più alto e se ammette picchi (burst).**
3. **Accendi il freno condiviso:** su Netlify metti `UPSTASH_REDIS_REST_URL`
   e `UPSTASH_REDIS_REST_TOKEN` (account gratuito Upstash). Il codice del
   freno c'è già, è spento perché mancano quelle due righe. Senza, le rotte
   che ci costano (dati volo, OCR) non hanno un tetto vero sotto tanti
   utenti da tante macchine.
4. **Resend a pagamento prima del lancio:** il piano gratis manda 100 email
   al giorno. Il giorno del video le superi e i benvenuti dei clienti
   paganti si perdono in silenzio. I 20 $/mese che avevi in mente bastano.


- **Telegram:** su Netlify mancano due righe, `TELEGRAM_BOT_TOKEN` e
  `TELEGRAM_ADMIN_CHAT` (chat id 8534801784), poi *Trigger deploy*. I valori
  stanno in `.env.development.local`.
- **Supabase, una spunta:** Authentication, Policies, accendi "Leaked
  password protection". Impedisce che qualcuno apra un account con una
  password già rubata. Dieci secondi.
- **Pagamenti:** Polar ha detto no alla categoria. Serve la tua decisione fra
  le tre strade in `PAGAMENTI.md` (revisione umana, un altro venditore,
  oppure partita IVA + Stripe diretto). Finché non c'è un incassatore, il
  check resta gratis e il traffico si costruisce lo stesso.
- **Dominio email:** verifica `send.rivolio.it` su Resend e metti
  `RESEND_MITTENTE = "Valerio di Rivolio <valerio@send.rivolio.it>"`. Finché
  non è verificato, le email partono solo verso valerio@artecai.it.

---

## DA FARE IO (prossimi passi)

- **Scioperi, motore più furbo:** sciopero della compagnia stessa = resta
  idoneo (la legge dice che paga lei, sentenza europea C-28/20); sciopero di
  ENAV o degli addetti a terra (handling) = incerto. Recupera vendite senza
  rischi. Uso lo schema del file del Ministero come guida.
- **Solidità, secondo giro (i fix più delicati dell'audit):** timeout sulle
  query al database (perché una query lenta diventi "non lo so" invece di un
  errore dopo 10 secondi); il freno d'emergenza sul fornitore (dopo tanti
  "troppe richieste" di fila, rispondere subito invece di riprovare per 8
  secondi); il lavoro notturno che cancella i dati vecchi (12/24 mesi, come
  dice la privacy); l'allarme se manca la chiave AeroDataBox; l'email di
  benvenuto che si recupera se il pagamento va in timeout. Li faccio uno alla
  volta, ognuno provato, perché toccano il flusso dei soldi.

## Fatto in questo giro (14/08)
- **Conto costi/profitto** nella pagina `/admin/economia` (tre scenari).
- **Audit di scalabilità** a cinque lanterne + primi fix: rete di sicurezza
  sugli errori (mai più un 500/404 nudo), indici del database (migrazione),
  idempotenza del pagamento a prova di corsa, una sola chiamata al fornitore
  per lo stesso volo, allarmi che non intasano il telefono.

---

## Fatto di recente (così non lo richiediamo)
- Collaudo del motore: 57 casi d'oro + 81 sui rami, zero falsi positivi.
- Seconda fonte AviationEdge collegata (spenta finché non metti la chiave),
  incrocio a prova di fuso orario.
- Meteo pronto a leggere dal VPS.
- Dominio: rivolio.it è l'indirizzo ufficiale ovunque, verificato sul sito
  vero.
- Suite prove: 1612 verdi, zero rosse.
