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

function costruisci(): Riga[] {
  if (indice) return indice;
  indice = Object.entries(ELENCO).map(([iata, a]) => ({
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

  return trovati.slice(0, limite).map(({ riga }) => ({
    iata: riga.iata,
    citta: riga.a.citta,
    nome: riga.a.nome,
    paese: riga.a.paese,
  }));
}

/** Un aeroporto preciso dal suo codice, per mostrarlo in chiaro. */
export function aeroportoPerIata(iata: string): AeroportoTrovato | null {
  const codice = (iata ?? "").trim().toUpperCase();
  const a = ELENCO[codice];
  if (!a) return null;
  return { iata: codice, citta: a.citta, nome: a.nome, paese: a.paese };
}
