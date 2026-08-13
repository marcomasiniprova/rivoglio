/**
 * CERCARE UN AEROPORTO SCRIVENDO IL NOME DELLA CITTÀ.
 *
 * Perché esiste: il numero di volo è il primo ostacolo del prodotto.
 * L'utente medio non sa dove trovarlo, e chiederglielo è chiedere di
 * andare a cercare una mail vecchia di mesi. La tratta invece se la
 * ricorda: "sono partito da Bergamo e sono arrivato a Lanzarote".
 * Questo modulo trasforma quella frase in due codici IATA.
 *
 * Dataset: lo stesso `lib/dati/aeroporti.json` (OpenFlights, 6.072 scali)
 * già usato per le distanze. Zero chiamate API, zero costi, per sempre.
 *
 * Attenzione a un dettaglio che conta: nel dataset le città hanno il nome
 * INGLESE ("Rome", "Milan", "Naples"). Un italiano scrive "Roma". Perciò
 * qui sotto c'è una tabella di traduzioni: senza, la ricerca fallirebbe
 * proprio sulle città più cercate.
 */
import aeroporti from "@/lib/dati/aeroporti.json";
import type { Aeroporto } from "@/lib/voli/distanza";

const ELENCO = aeroporti as Record<string, Aeroporto>;

export type AeroportoTrovato = {
  iata: string;
  citta: string;
  nome: string;
  /**
   * Come si scrive all'utente: "Milano Malpensa", "Parigi Charles de
   * Gaulle". Non il nome grezzo dell'archivio, che è in inglese e pieno
   * di parole di riempimento, e non il comune, che dopo l'aggiornamento
   * del 10/08 faceva diventare Malpensa "Ferno". Vedi `etichettaScalo`.
   */
  etichetta: string;
  paese: string;
};

/** Minuscolo, senza accenti, senza punteggiatura: "Città del Capo" → "citta del capo". */
function piatto(testo: string): string {
  return testo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['`´]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Come lo scrive un italiano → come sta scritto nel dataset.
 * Solo i casi in cui i due nomi DIVERSIFICANO davvero: dove l'italiano e
 * l'inglese coincidono (Palermo, Barcellona quasi, Madrid) non serve nulla.
 */
const ESONIMI: Record<string, string> = {
  roma: "rome",
  milano: "milan",
  napoli: "naples",
  venezia: "venice",
  firenze: "florence",
  torino: "turin",
  genova: "genoa",
  padova: "padua",
  mantova: "mantua",
  siracusa: "syracuse",
  livorno: "leghorn",
  londra: "london",
  parigi: "paris",
  nizza: "nice",
  marsiglia: "marseille",
  lione: "lyon",
  tolosa: "toulouse",
  strasburgo: "strasbourg",
  bordeaux: "bordeaux",
  bruxelles: "brussels",
  anversa: "antwerp",
  amsterdam: "amsterdam",
  laia: "the hague",
  monaco: "munich",
  "monaco di baviera": "munich",
  francoforte: "frankfurt",
  colonia: "cologne",
  amburgo: "hamburg",
  berlino: "berlin",
  stoccarda: "stuttgart",
  norimberga: "nuremberg",
  vienna: "vienna",
  zurigo: "zurich",
  ginevra: "geneva",
  basilea: "basel",
  berna: "bern",
  lussemburgo: "luxembourg",
  praga: "prague",
  varsavia: "warsaw",
  cracovia: "krakow",
  budapest: "budapest",
  bucarest: "bucharest",
  belgrado: "belgrade",
  sofia: "sofia",
  atene: "athens",
  barcellona: "barcelona",
  rodi: "rhodes",
  corfu: "kerkyra",
  spalato: "split",
  zagabria: "zagreb",
  lubiana: "ljubljana",
  salisburgo: "salzburg",
  brema: "bremen",
  lipsia: "leipzig",
  dresda: "dresden",
  smirne: "izmir",
  salonicco: "thessaloniki",
  lisbona: "lisbon",
  siviglia: "seville",
  saragozza: "zaragoza",
  maiorca: "palma de mallorca",
  "palma di maiorca": "palma de mallorca",
  minorca: "menorca",
  copenaghen: "copenhagen",
  stoccolma: "stockholm",
  goteborg: "gothenburg",
  helsinki: "helsinki",
  dublino: "dublin",
  edimburgo: "edinburgh",
  mosca: "moscow",
  "san pietroburgo": "saint petersburg",
  kiev: "kyiv",
  istanbul: "istanbul",
  "il cairo": "cairo",
  cairo: "cairo",
  algeri: "algiers",
  tunisi: "tunis",
  marrakech: "marrakesh",
  "citta del capo": "cape town",
  "nuova york": "new york",
  filadelfia: "philadelphia",
  "nuova orleans": "new orleans",
  "citta del messico": "mexico city",
  "san paolo": "sao paulo",
  "l avana": "havana",
  avana: "havana",
  bogota: "bogota",
  pechino: "beijing",
  canton: "guangzhou",
  "hong kong": "hong kong",
  tokyo: "tokyo",
  giacarta: "jakarta",
  "citta ho chi minh": "ho chi minh city",
  saigon: "ho chi minh city",
  male: "male",
  "nuova delhi": "new delhi",
  "tel aviv": "tel aviv",
  teheran: "tehran",
  damasco: "damascus",
  bagdad: "baghdad",
  riad: "riyadh",
};

/**
 * Come la gente chiama davvero gli scali italiani. Nel dataset BGY si
 * chiama "Il Caravaggio International Airport": chi ha volato da lì lo
 * chiama Orio al Serio e basta. Senza questa tabella, cercare "orio" non
 * trovava niente.
 */
const SOPRANNOMI: Record<string, string> = {
  orio: "BGY",
  "orio al serio": "BGY",
  caravaggio: "BGY",
  malpensa: "MXP",
  linate: "LIN",
  fiumicino: "FCO",
  ciampino: "CIA",
  capodichino: "NAP",
  caselle: "TRN",
  "marco polo": "VCE",
  "san giusto": "TRS",
  "marco polo venezia": "VCE",
  treviso: "TSF",
  "sant angelo": "TSF",
  peretola: "FLR",
  "vespucci": "FLR",
  marconi: "BLQ",
  catullo: "VRN",
  "punta raisi": "PMO",
  "falcone borsellino": "PMO",
  fontanarossa: "CTA",
  elmas: "CAG",
  "galileo galilei": "PSA",
  "costa smeralda": "OLB",
  "karol wojtyla": "BRI",
  "salvo d acquisto": "SUF",
  "pertini": "TRN",
  "abruzzo": "PSR",
};

/**
 * I paesi dove va davvero chi parte dall'Italia. Serve solo a ordinare:
 * cercando "londra" devono uscire prima gli scali di Londra in Inghilterra
 * e non London in Ontario.
 */
const VICINI = new Set([
  "Italy", "Spain", "France", "Germany", "United Kingdom", "Portugal", "Greece",
  "Netherlands", "Belgium", "Austria", "Switzerland", "Ireland", "Poland",
  "Czech Republic", "Hungary", "Romania", "Croatia", "Denmark", "Sweden",
  "Norway", "Finland", "Malta", "Albania", "Serbia", "Bulgaria", "Slovakia",
  "Slovenia", "Luxembourg", "Morocco", "Tunisia", "Egypt", "Turkey",
]);

/**
 * Gli scali principali: a parità di città e di paese esce prima quello
 * grosso. Il dataset OpenFlights non dice quanti passeggeri fa uno scalo,
 * e inventarselo sarebbe peggio: questa è una lista corta e dichiarata.
 */
const PRINCIPALI = new Set([
  "FCO", "MXP", "LHR", "CDG", "AMS", "FRA", "MAD", "BCN", "MUC", "LIS", "ATH",
  "DUB", "ZRH", "VIE", "CPH", "ARN", "OSL", "HEL", "BRU", "WAW", "PRG", "IST",
  "JFK", "LAX", "ORD", "MIA", "YYZ", "GRU", "DXB", "DOH", "SIN", "HND", "HKG",
]);

/** L'indice si costruisce una volta sola, al primo uso. */
type Riga = { iata: string; a: Aeroporto; citta: string; nome: string };
let indice: Riga[] | null = null;

/**
 * SOLO GLI SCALI CON VOLI DI LINEA (scelta di Valerio, 13/08).
 *
 * L'archivio ne ha 9.016, ma 4.456 sono piste private, eliporti e campi
 * di volo da cui non è mai partito un passeggero: nella ricerca uscivano
 * insieme agli aeroporti veri, e chi scriveva "mila" se li trovava in
 * mezzo. Il `peso` viene dal tipo dichiarato da OurAirports: 2 = grande,
 * 1 = medio, 0 = piccolo.
 *
 * ⚠️ Gli scali esclusi restano nell'archivio e continuano a servire per
 * le distanze e per il cancello territoriale: spariscono SOLO dal campo
 * di ricerca. Un volo da uno di quelli si analizza lo stesso.
 */
const CERCABILE = 1;

function costruisci(): Riga[] {
  if (indice) return indice;
  indice = Object.entries(ELENCO)
    .filter(([, a]) => (a.peso ?? 0) >= CERCABILE)
    .map(([iata, a]) => ({
      iata,
      a,
      citta: piatto(a.citta ?? ""),
      nome: piatto(a.nome ?? ""),
    }));
  return indice;
}

/**
 * Punteggio: più è basso, più il risultato è pertinente.
 * L'ordine non è un'opinione, è quello che si aspetta chi scrive:
 * prima il codice esatto, poi la città che inizia così, poi il resto.
 *
 * Il confronto "in mezzo alla stringa" è ancorato all'inizio di una
 * PAROLA, non a un pezzo qualunque: senza, cercando "roma" saltavano
 * fuori tutti gli "Aerodrome" del mondo.
 */
function punteggio(riga: Riga, q: string, parola: RegExp): number | null {
  if (riga.iata.toLowerCase() === q) return 0;
  if (riga.citta === q) return 1;
  if (riga.citta.startsWith(q)) return 2;
  if (riga.nome.startsWith(q)) return 3;
  if (parola.test(riga.citta)) return 4;
  if (parola.test(riga.nome)) return 5;
  return null;
}

const MASSIMO = 8;

/**
 * Gli aeroporti che corrispondono a quello che è stato scritto.
 *
 * A parità di pertinenza vengono prima gli scali italiani: il prodotto è
 * italiano e chi scrive "Rome" quasi sempre intende Fiumicino, non Rome
 * in Georgia. Non è un giudizio sul mondo, è dove sta il nostro utente.
 */
export function cercaAeroporti(query: string, limite = MASSIMO): AeroportoTrovato[] {
  const q0 = piatto(query);
  if (q0.length < 2) return [];

  // Un soprannome è una risposta secca: "orio" è Orio al Serio, punto.
  const soprannome = SOPRANNOMI[q0];
  if (soprannome) {
    const trovato = aeroportoPerIata(soprannome);
    if (trovato) return [trovato];
  }

  /* Si prova sia com'è scritto sia tradotto: "Milano" deve trovare Linate
     (nel dataset "Milan") E Malpensa (nel dataset "Milano"), e vince la
     corrispondenza migliore delle due. */
  const forme = [q0, ESONIMI[q0]].filter((f): f is string => Boolean(f));
  const cerche = forme.map((f) => ({
    q: f,
    parola: new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
  }));

  const trovati: Array<{ riga: Riga; p: number }> = [];
  for (const riga of costruisci()) {
    let p: number | null = null;
    for (const c of cerche) {
      const q = punteggio(riga, c.q, c.parola);
      if (q !== null && (p === null || q < p)) p = q;
    }
    if (p !== null) trovati.push({ riga, p });
  }

  /* L'ordine a parità di pertinenza: prima l'Italia, poi i paesi dove
     vola davvero chi parte da qui, poi gli scali principali. Non è un
     giudizio sul mondo: è dove sta il nostro utente. */
  const rango = (r: Riga) =>
    (r.a.paese === "Italy" ? 0 : VICINI.has(r.a.paese) ? 1 : 2) * 2 +
    (PRINCIPALI.has(r.iata) ? 0 : 1);

  trovati.sort((x, y) => {
    if (x.p !== y.p) return x.p - y.p;
    const rx = rango(x.riga);
    const ry = rango(y.riga);
    if (rx !== ry) return rx - ry;
    return x.riga.citta.localeCompare(y.riga.citta) || x.riga.iata.localeCompare(y.riga.iata);
  });

  /* LA CITTÀ SI MOSTRA IN ITALIANO, e non è un vezzo.
     Prima chi scriveva "Roma" vedeva questo elenco: Rome (Fiumicino),
     Rome (Ciampino), e "Roma", che è una cittadina in AUSTRALIA. L'unica
     voce scritta come l'aveva scritta lui era quella sbagliata, ed è
     esattamente il modo di far scegliere l'aeroporto sbagliato a una
     persona che ha fretta. `inItaliano` gira i nomi che conosciamo; gli
     altri restano come sono, mai inventati. */
  return trovati.slice(0, limite).map(({ riga }) => ({
    iata: riga.iata,
    citta: inItaliano(riga.a.citta) ?? riga.a.citta,
    nome: riga.a.nome,
    /* Come si legge davvero: "Milano Malpensa", non "Milan Malpensa
       International Airport" e non "Ferno". Vedi etichettaScalo. */
    etichetta: etichettaScalo(riga.a.nome, riga.a.citta),
    paese: paeseInItaliano(riga.a.iso, riga.a.paese),
  }));
}

/**
 * Il nome della città come lo scrive un italiano.
 *
 * Il dataset (e AeroDataBox) parlano inglese: "Milan", "Rome", "Naples".
 * Un utente italiano che legge "Palermo → Milan" pensa a un errore, e ha
 * ragione. Qui si gira la tabella degli esonimi: dataset → italiano.
 * Se il nome non è in tabella si restituisce identico: mai inventato.
 */
const IN_ITALIANO: Record<string, string> = Object.fromEntries(
  Object.entries(ESONIMI).map(([it, en]) => [en, it]),
);

/**
 * Esonimi che si accettano SCRITTI ma non si mostrano mai.
 *
 * "Nuova York" sta in tabella perché qualcuno potrebbe cercarlo così, ma
 * nessuno lo dice più: farlo comparire nell'elenco farebbe sembrare il
 * sito tradotto con un dizionario del secolo scorso.
 */
const SOLO_IN_ENTRATA = new Set(["new york", "philadelphia", "new orleans"]);

export function inItaliano(nome: string | null | undefined): string | null {
  if (!nome) return null;
  if (SOLO_IN_ENTRATA.has(nome.trim().toLowerCase())) return nome;
  const italiano = IN_ITALIANO[nome.trim().toLowerCase()];
  if (!italiano) return nome;
  /* Le iniziali maiuscole, parola per parola: "the hague" → "L'Aia" no,
     ma "monaco di baviera" → "Monaco Di Baviera" sarebbe brutto. Si
     alza solo la prima lettera di ogni parola lunga. */
  return italiano
    .split(" ")
    .map((p) => (p.length > 2 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

/**
 * Il PAESE in italiano, dal codice ISO che ogni scalo si porta dietro.
 *
 * Non serve una tabella scritta a mano: i nomi dei paesi li sa già Node.
 * Serve invece per un motivo pratico: nell'elenco degli aeroporti
 * l'utente legge "Italy", "United States", "Australia", e su un sito
 * italiano sembra un sito tradotto male. Se il codice manca o non si
 * riconosce, resta il nome inglese: mai inventato.
 */
const NOMI_PAESE = new Intl.DisplayNames(["it"], { type: "region" });

export function paeseInItaliano(iso: string | null | undefined, riserva: string): string {
  const c = (iso ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return riserva;
  try {
    const nome = NOMI_PAESE.of(c);
    return !nome || nome === c ? riserva : nome;
  } catch {
    return riserva;
  }
}

/**
 * COME SI SCRIVE UN AEROPORTO ALL'UTENTE: "Milano Malpensa".
 *
 * 🔴 Il difetto che ha fatto nascere questa funzione. L'archivio scrive
 * il nome in inglese e con le parole di riempimento: "Milan Malpensa
 * International Airport", "Charles de Gaulle International Airport". E
 * la CITTA' a volte è il comune, non la città: dopo l'aggiornamento
 * automatico del 10/08 Malpensa era diventata "Ferno". Chi cerca il
 * proprio volo non riconosce né l'uno né l'altro, e se ne va.
 *
 * Le tre regole, in ordine:
 * 1. si tolgono le parole che non dicono niente (Airport, International,
 *    Aeroporto, e le loro versioni in altre lingue);
 * 2. se quello che resta comincia col nome inglese della città, si
 *    sostituisce con l'italiano: "Milan Malpensa" → "Milano Malpensa";
 * 3. se non contiene affatto la città, la si mette davanti: "Charles de
 *    Gaulle" → "Parigi Charles de Gaulle".
 *
 * ⚠️ Non si inventa mai un nome: se la tabella degli esonimi non
 * conosce quella città, resta quella dell'archivio. Meglio "Anaa" che
 * una traduzione fantasiosa.
 */
const RIEMPITIVI =
  /\b(international|intl|airport|aeroporto|aeropuerto|a[ée]roport|flughafen|regional|municipal|metropolitan|field)\b/gi;

/** Toglie spazi, virgole e trattini (anche quelli lunghi) dai bordi. */
const spuntato = (t: string) => t.replace(/^[\s,\-–—]+|[\s,\-–—]+$/g, "");

export function etichettaScalo(nomeGrezzo: string, cittaGrezza: string): string {
  /* ⚠️ L'ARCHIVIO NON È PULITO: qualche riga ha spazi in coda alla città
     ("Artigas "), e quello spazio finiva dritto nell'etichetta. Si
     spunta all'ingresso, una volta sola. */
  const nome = (nomeGrezzo ?? "").trim();
  const citta = (cittaGrezza ?? "").trim();
  const cittaIt = (inItaliano(citta) ?? citta).trim();

  const pulito = spuntato(nome.replace(RIEMPITIVI, " ").replace(/\s{2,}/g, " "));

  /* Un nome che si riduce a niente (succede sugli scali che si chiamano
     solo "Airport") lascia il posto alla sola città. */
  if (!pulito) return cittaIt;

  const piattoNome = piatto(pulito);
  const piattaCitta = piatto(citta);
  const piattaCittaIt = piatto(cittaIt);

  /* Il nome È la città: "Munich Airport" → "Monaco di Baviera". */
  if (piattoNome === piattaCitta || piattoNome === piattaCittaIt) return cittaIt;

  /* ⚠️ LA CITTA' DENTRO IL NOME PUO' ESSERE SCRITTA IN UN'ALTRA LINGUA E
     ATTACCATA CON UN TRATTINO. L'archivio ha "Milan Malpensa" con città
     "Milano", e "Rome–Fiumicino Leonardo da Vinci" con città "Rome".
     Si tolgono in testa, esattamente, i nomi che sappiamo essere quella
     città: quello italiano, quello dell'archivio e quello inglese della
     tabella degli esonimi. Tagliare invece "la prima parola" costava
     pezzi veri del nome: da Fiumicino spariva "Fiumicino", e da
     "Paris-Le Bourget" spariva "Le". */
  const candidati = [cittaIt, citta, ESONIMI[piattaCittaIt], ESONIMI[piattaCitta]].filter(
    (c): c is string => Boolean(c),
  );
  for (const c of candidati) {
    const n = c.length;
    if (piatto(pulito.slice(0, n)) !== piatto(c)) continue;
    /* Deve finire lì o essere seguito da uno stacco: senza questo,
       "Romeo" verrebbe tagliato come se fosse "Rome". */
    if (pulito.length > n && !/[\s\-–—]/.test(pulito[n])) continue;
    const resto = spuntato(pulito.slice(n));
    return resto ? `${cittaIt} ${resto}` : cittaIt;
  }

  /* La città non compare da nessuna parte: la si mette davanti, che è
     come si dice. "Parigi Charles de Gaulle".
     ⚠️ Il confronto è a PAROLA INTERA. Con `includes` semplice, "Romeo"
     conteneva "Rome" e lo scalo restava senza città davanti: un nome
     che comincia come la città non è la città. */
  const comeParola = (dentro: string, cercata: string) =>
    new RegExp(`\\b${cercata.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(dentro);
  if (!comeParola(piattoNome, piattaCitta) && !comeParola(piattoNome, piattaCittaIt)) {
    return spuntato(`${cittaIt} ${pulito}`);
  }
  return spuntato(pulito);
}

/** Un aeroporto preciso dal suo codice, per mostrarlo in chiaro. */
export function aeroportoPerIata(iata: string): AeroportoTrovato | null {
  const codice = (iata ?? "").trim().toUpperCase();
  const a = ELENCO[codice];
  if (!a) return null;
  return {
    iata: codice,
    citta: inItaliano(a.citta) ?? a.citta,
    nome: a.nome,
    etichetta: etichettaScalo(a.nome, a.citta),
    paese: paeseInItaliano(a.iso, a.paese),
  };
}
