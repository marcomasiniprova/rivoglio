# PROGETTO — app mobile Viaggio Anche Io

*Scritto il 2026-08-07. È il contratto fra i pezzi dell'app: chi scrive un
modulo rispetta le firme scritte qui, chi lo importa si fida di queste firme.*

## Cosa è

L'app iOS + Android di Viaggio Anche Io (Expo SDK 57, expo-router, TypeScript,
Supabase). Imposti da dove parti, la tua soglia a testa, notti e ore di auto.
Quando esiste una micro-vacanza vera sotto la soglia, arriva una notifica con
il conto già fatto: alloggio + auto, diviso per le persone, apribile riga per
riga. 1 credito = 1 destinazione ricevuta, 3 gratis, nessun abbonamento.

**Fuori dalla v1:** acquisto crediti (arriverà con IAP), Telegram, mappe,
recensioni, foto delle strutture.

## Regole che valgono per ogni file

1. Stile SOLO da `src/lib/tema.ts` (COLORI, RAGGIO, SPAZIO, FONT, OMBRA,
   TINTE_TIPO). Nessun colore o raggio scritto nella schermata.
2. Testi SOLO da `src/lib/testi.ts`. Tono di BRAND.md: dai del tu,
   professionale, frasi corte, niente superlativi, MAI il trattino lungo.
3. Numeri formattati con `src/lib/formati.ts` (`euro`, `oreLeggibili`,
   `dataBreve`).
4. Niente dati finti che sembrano veri: tutto ciò che è dimostrativo passa da
   `DEMO` in `src/lib/dati.ts` ed è marcato con `<BadgeDemo />` in interfaccia.
5. Niente dipendenze nuove: si usa solo ciò che è già in `package.json`.
6. Componenti e variabili in italiano, come nel resto della repo.
7. `StyleSheet.create` in fondo al file. Niente librerie di stile.

## La mappa dei file e chi li scrive

| Area | File | Chi |
|---|---|---|
| Tema, formati | `src/lib/tema.ts` · `src/lib/formati.ts` | fatto (coordinatore) |
| Motore puro | `src/motore/viaggio.ts` · `destinazioni.ts` · `costruttore.ts` | portati dal web, NON toccarli |
| Preferenze | `src/motore/punteggio.ts` + prove | AI EXPERT |
| Supabase | `src/lib/supabase.ts` · `tipi.ts` · `dati.ts` · `sessione.tsx` · `notifiche.ts` · `supabase/migrazioni.sql` | BACKEND |
| Testi | `src/lib/testi.ts` | COPYWRITER |
| Componenti | `src/components/*` | UI ENGINEER |
| Radice + tab + feed | `src/app/_layout.tsx` · `src/app/(tabs)/*` · `src/app/destinazione/[id].tsx` | FRONTEND B |
| Onboarding + accesso | `src/app/(benvenuto)/*` | FRONTEND A |
| Ricerche + profilo | `src/app/(tabs)/ricerche.tsx` · `(tabs)/profilo.tsx` · `src/app/ricerca/nuova.tsx` | FRONTEND C |

## Il linguaggio visivo (dai riferimenti scelti da Valerio)

Riferimenti: app di viaggio su Dribbble con palette pastello calma, card
grandi con angoli 20-28, chip di categoria, meta-informazioni in pillole
(km, ore, prezzo a testa), barra tab a pillola flottante, molto bianco e
molta aria. Adattato al nostro marchio: fondo `nebbia`, accenti `verde`,
sezioni scure `verdeNotte` con testo `menta`, titoli Geist 500 con UNA parola
in `corsivo` (Instrument Serif corsivo), numeri grandi.

Le card destinazione NON hanno fotografie (non abbiamo i diritti né le foto
vere delle strutture): usano `TINTE_TIPO[tipo]` come fondo con il nome del
posto in tipografia grande. Onesto e riconoscibile.

## Modello dati (Supabase, già esistente in produzione)

- `profili`: id (uuid = auth.uid), email, comune, lat, lng, crediti,
  tetto_settimanale, chat_telegram, ruolo, expo_push_token (nuova, vedi
  migrazione).
- `ricerche`: id, utente_id, budget_max_persona, ore_viaggio_max, notti_min,
  notti_max, persone, tipi (text[]), attiva, creata_il.
- `offerte`: id, struttura, comune, lat, lng, check_in, check_out,
  prezzo_alloggio, link, tipo, fonte, stato ('demo'|'attiva'|'morta'),
  verificata_il.
- `invii`: id, utente_id, ricerca_id, offerta_id, canale, inviato_il,
  credito_consumato, aperto_il, cliccato_il.

La Row Level Security è già attiva: ogni utente legge solo le sue righe.
La chiave publishable è pubblica per costruzione (vedi `lib/supabase/chiavi.ts`
del sito): può stare nel codice come riserva.

## Contratti dei moduli

### `src/lib/supabase.ts` (BACKEND)
```ts
export const supabase: SupabaseClient   // AsyncStorage, autoRefresh, no detectSessionInUrl
```

### `src/lib/tipi.ts` (BACKEND)
```ts
export type { Tipo } from "../motore/destinazioni";
export type Profilo = { id: string; email: string; comune: string | null; lat: number | null; lng: number | null; crediti: number; tetto_settimanale: number; };
export type Ricerca = { id: string; budget_max_persona: number; ore_viaggio_max: number; notti_min: number; notti_max: number; persone: number; tipi: Tipo[]; attiva: boolean; creata_il: string; };
export type Destinazione = { id: string; inviato_il: string; aperto_il: string | null; demo?: boolean; offerta: { struttura: string; comune: string; check_in: string; check_out: string; prezzo_alloggio: number; link: string; tipo: Tipo; lat: number; lng: number; }; };
```

### `src/lib/dati.ts` (BACKEND)
```ts
export const DEMO: boolean;                    // true se EXPO_PUBLIC_DEMO === "1"
export async function caricaProfilo(): Promise<Profilo | null>;
export async function caricaRicerche(): Promise<Ricerca[]>;
export async function caricaDestinazioni(): Promise<Destinazione[]>;   // invii + offerta, più recente prima
export async function segnaAperta(id: string): Promise<void>;          // aperto_il = now, ignora errori
export async function creaRicerca(r: NuovaRicerca): Promise<{ errore?: string }>;
export type NuovaRicerca = { budget: number; ore: number; nottiMin: number; nottiMax: number; persone: number; tipi: Tipo[] };
export async function cambiaStatoRicerca(id: string, attiva: boolean): Promise<{ errore?: string }>;
export async function eliminaRicerca(id: string): Promise<{ errore?: string }>;
export async function salvaPartenza(nomeComune: string): Promise<{ errore?: string }>;  // coordinate da PARTENZE, mai dal client
export async function salvaTetto(tetto: number): Promise<{ errore?: string }>;
```
Con `DEMO` attivo ogni funzione risponde con dati dimostrativi coerenti
(campo `demo: true` sulle destinazioni) senza toccare la rete. I limiti dei
campi sono gli stessi del sito: budget 30-600, ore 0,5-8, notti 1-3,
persone 1-8 (validati qui, non solo nel modulo).

### `src/lib/sessione.tsx` (BACKEND)
```ts
export function ProviderSessione({ children }): JSX.Element;
export function useSessione(): { utente: User | null; pronto: boolean };
export async function registrati(email: string, password: string): Promise<{ errore?: string }>;
export async function accedi(email: string, password: string): Promise<{ errore?: string }>;
export async function esci(): Promise<void>;
```
Messaggi di errore di Supabase tradotti in italiano (stesse frasi di
`app/entra/azioni.ts` del sito). Mai inglese verso l'utente.

### `src/lib/notifiche.ts` (BACKEND)
```ts
export async function statoPermesso(): Promise<"da_chiedere" | "concesso" | "negato">;
export async function chiediPermesso(): Promise<boolean>;   // prompt nativo; true se concesso
export async function registraToken(): Promise<void>;       // Expo push token -> profili.expo_push_token; non lancia mai
```

### `src/motore/punteggio.ts` (AI EXPERT)
```ts
export type Preferenze = { pesoTipi: Partial<Record<Tipo, number>>; regioniViste: string[] };
export function preferenzeDaStorico(aperture: { tipo: Tipo; aperto: boolean }[]): Preferenze;
export function ordina<T extends { destinazione: { tipo: Tipo; regione: string }; restaPerNotte: number }>(proposte: T[], preferenze: Preferenze): T[];
```
Deterministico e provato con jest. È il primo pezzo del profilo che impara
da cosa apri: il punteggio pesa l'avanzo (il criterio storico del motore)
più l'affinità coi tipi che l'utente apre davvero.

### `src/lib/testi.ts` (COPYWRITER)
```ts
export const TESTI = { comune: {...}, onboarding: {...}, accesso: {...}, destinazioni: {...}, ricerche: {...}, profilo: {...}, notifiche: {...}, errori: {...} } as const;
```
Ogni stringa dell'app vive qui. Le schermate importano `TESTI`, mai stringhe
inline (etichette di accessibilità comprese).

### Componenti (`src/components/`, UI ENGINEER)
```ts
Bottone.tsx:  export default function Bottone({ testo, onPress, variante = "pieno" | "vetro" | "fantasma", disabilitato?, caricamento?, icona? }): JSX
Campo.tsx:    export default function Campo({ etichetta, valore, onChange, segnaposto?, tipo? ("email"|"password"|"numero"|"testo"), errore? }): JSX
Chip.tsx:     export default function Chip({ testo, attivo, onPress, tinta? }): JSX
Scheda.tsx:   export default function Scheda({ children, su? (fondo colore), stile? }): JSX
BadgeDemo.tsx: export default function BadgeDemo(): JSX                      // pillola "demo", obbligatoria sui dati dimostrativi
ContoAperto.tsx: export default function ContoAperto({ alloggio, auto, totale, soglia, persone, km, ore, dettaglio? }): JSX
                 // righe Alloggio a testa / Auto a testa / Totale, avanzo in verde, dettaglio auto apribile (km, litri, benzina, pedaggi)
SchedaDestinazione.tsx: export default function SchedaDestinazione({ destinazione, totale, avanzo, onPress }): JSX
                 // card grande: fondo TINTE_TIPO, comune in tipografia grande, meta in pillole, BadgeDemo se demo
Vuoto.tsx:    export default function Vuoto({ titolo, testo, azione?, testoAzione? }): JSX
BarraTab.tsx: export default function BarraTab(props: BottomTabBarProps-compatibile): JSX   // pillola flottante, 3 voci, icona + etichetta
Titolo.tsx:   export default function Titolo({ prima, corsivo, dopo? }): JSX  // "La tua" + "fuga." col corsivo del marchio
```

## Il flusso (deciso con la ricerca onboarding del 07/08)

Radice `_layout.tsx`: carica i font (Geist_500Medium, Poppins_400Regular,
Poppins_500Medium, Poppins_600SemiBold, InstrumentSerif_400Regular_Italic),
monta `ProviderSessione`, e reindirizza: senza sessione a `(benvenuto)/`,
con sessione a `(tabs)/`.

`(benvenuto)` in 6 passi, una decisione per schermata:
1. `index` — marchio, tagline, cosa fa, "Inizia" + "Ho già un account".
2. `valore` — una destinazione di esempio con `ContoAperto` apribile e
   `BadgeDemo`: il momento aha è il conto, non una promessa.
3. `criteri` — partenza (elenco `PARTENZE`), soglia a testa, ore max. Senza account.
4. `aggancio` — riepilogo criteri: "Con questi limiti ti avviso io. Le prime 3 sono gratis."
5. `registrati` — email + password, presentata come "dove ti mando le destinazioni". Da qui si salvano partenza + prima ricerca.
6. `avvisi` — spiegazione onesta, poi bottone che innesca il prompt nativo. Chi rifiuta va avanti lo stesso (email di riserva).
Più `accesso` per chi ha già l'account.

`(tabs)`: `index` (Destinazioni: le tue destinazioni ricevute + "dove arrivi
oggi" dal costruttore, ordinato da `punteggio.ordina`), `ricerche`,
`profilo` (crediti grandi, partenza, tetto, esci; acquisto crediti: pannello
"Presto", onesto, senza bottoni finti).

`destinazione/[id]`: dettaglio con `ContoAperto` completo, "Vedi l'offerta"
(browser), avviso stima. `ricerca/nuova`: modale di creazione.

## Come si prova

`npm run tipi` (tsc), `npm run lint` (expo lint), `npm run prove` (jest sul
motore). La rete verso Supabase NON è raggiungibile dalla sandbox di
sviluppo: si prova con `EXPO_PUBLIC_DEMO=1`.
