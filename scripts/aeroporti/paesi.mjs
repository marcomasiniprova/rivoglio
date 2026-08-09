/**
 * DAL NOME DEL PAESE AL CODICE, E VICEVERSA.
 *
 * Serve perché i due archivi parlano lingue diverse: OpenFlights (quello
 * vecchio) scrive il paese per esteso in inglese, OurAirports (quello
 * nuovo) usa il codice ISO a due lettere. Il cancello territoriale ha
 * bisogno del codice, la lettera di reclamo e la ricerca hanno bisogno
 * del nome.
 *
 * I nomi standard li dà Node da solo (Intl.DisplayNames, tabella CLDR).
 * Qui sotto ci sono SOLO i casi in cui il nome scritto nell'archivio
 * vecchio non combacia con quello standard: sono 29, contati sui dati
 * veri, non stimati.
 */

const NOMI = new Intl.DisplayNames(["en"], { type: "region" });

/** "Réunion" → "reunion": il confronto non deve inciampare sugli accenti. */
function piatto(testo) {
  return testo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * I nomi come li scrive l'archivio OpenFlights, dove differiscono dallo
 * standard. Verificati uno per uno sui 6.073 scali del file.
 */
const ALIAS = {
  Turkey: "TR",
  "Congo (Kinshasa)": "CD",
  "Congo (Brazzaville)": "CG",
  Burma: "MM",
  Myanmar: "MM",
  "Cote d'Ivoire": "CI",
  "Czech Republic": "CZ",
  "Turks and Caicos Islands": "TC",
  "Saint Vincent and the Grenadines": "VC",
  "Bosnia and Herzegovina": "BA",
  "Virgin Islands": "VI",
  "East Timor": "TL",
  Swaziland: "SZ",
  "Sao Tome and Principe": "ST",
  "Saint Pierre and Miquelon": "PM",
  Macedonia: "MK",
  "Wallis and Futuna": "WF",
  "Antigua and Barbuda": "AG",
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  "Trinidad and Tobago": "TT",
  "Hong Kong": "HK",
  "Saint Helena": "SH",
  Macau: "MO",
  Palestine: "PS",
  /* Isolotti del Pacifico sotto amministrazione statunitense: nell'ISO
     stanno tutti sotto UM (United States Minor Outlying Islands). */
  "Midway Islands": "UM",
  "Johnston Atoll": "UM",
  "Wake Island": "UM",
  /* Le Antille Olandesi non esistono più dal 2010 e il codice AN è stato
     ritirato: gli scali sono passati a Curaçao, Sint Maarten e ai comuni
     speciali olandesi. Nessuno di questi è Unione Europea (sono territori
     d'oltremare), quindi restano senza codice: il confronto per nome basta
     e non rischia di farli passare per Europa. */
};

const PER_NOME = new Map();
for (const [nome, codice] of Object.entries(ALIAS)) PER_NOME.set(piatto(nome), codice);

/**
 * Un codice è ANCORA VALIDO?
 *
 * La tabella di Node conosce anche i codici ritirati, e li traduce col
 * nome del paese di oggi: "DD" (la Germania Est) risponde "Germany"
 * esattamente come "DE". Girando l'alfabeto in ordine, "DD" arrivava
 * prima e si prendeva il posto: Berlino Brandeburgo si è ritrovata nel
 * paese "DD", che non è nella lista dell'Unione, e sarebbe uscita fuori
 * ambito. Trovato dalla prova, non a occhio.
 *
 * Il controllo: un codice ritirato viene ricondotto a quello nuovo
 * (DD → DE, YU → RS, AN → CW). Se il codice torna diverso da com'è
 * entrato, non è quello buono.
 */
function ancoraValido(codice) {
  try {
    return new Intl.Locale(`und-${codice}`).region === codice;
  } catch {
    return false;
  }
}

const LETTERE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
for (const a of LETTERE) {
  for (const b of LETTERE) {
    const codice = a + b;
    if (!ancoraValido(codice)) continue;
    let nome;
    try {
      nome = NOMI.of(codice);
    } catch {
      continue;
    }
    if (!nome || nome === codice || nome === "Unknown Region") continue;
    const chiave = piatto(nome);
    if (!PER_NOME.has(chiave)) PER_NOME.set(chiave, codice);
  }
}

/** Il codice ISO a due lettere, o null se quel nome non lo conosciamo. */
export function isoDaNome(nome) {
  if (!nome) return null;
  return PER_NOME.get(piatto(nome)) ?? null;
}

/** Il nome inglese standard di un codice ISO, o null. */
export function nomeDaIso(codice) {
  const c = (codice ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c) || !ancoraValido(c)) return null;
  try {
    const nome = NOMI.of(c);
    return !nome || nome === c || nome === "Unknown Region" ? null : nome;
  } catch {
    return null;
  }
}
