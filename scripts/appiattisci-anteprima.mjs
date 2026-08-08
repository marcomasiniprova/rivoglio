/**
 * APPIATTISCE gli asset dell'anteprima app.
 *
 * Perché esiste: l'export web di Expo mette i font in cartelle chiamate
 * `node_modules/...`, e Netlify NON pubblica i percorsi che contengono
 * `node_modules`: sul sito vero davano 404 e l'anteprima usciva coi font
 * di ripiego e le icone quadrate (visto da Valerio l'8/08).
 *
 * Cosa fa: sposta ogni file di `assets/**` nella radice di `assets/`
 * (il nome contiene già l'hash, quindi è unico) e riscrive i percorsi
 * dentro i bundle JavaScript.
 *
 * Si lancia da `npm run anteprima` dentro mobile/, dopo l'export.
 */
import {
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "app-anteprima");
const ASSETS = join(RADICE, "assets");
const JS = join(RADICE, "_expo", "static", "js", "web");

function file(dir) {
  const trovati = [];
  for (const nome of readdirSync(dir)) {
    const pieno = join(dir, nome);
    if (statSync(pieno).isDirectory()) trovati.push(...file(pieno));
    else trovati.push(pieno);
  }
  return trovati;
}

// 1. sposta tutto nella radice di assets/ e annota vecchio → nuovo percorso
const mappa = [];
for (const vecchio of file(ASSETS)) {
  const rel = relative(ASSETS, vecchio).replaceAll("\\", "/");
  if (!rel.includes("/")) continue; // già in radice
  const nome = rel.split("/").pop();
  const nuovo = join(ASSETS, nome);
  renameSync(vecchio, nuovo);
  mappa.push([`assets/${rel}`, `assets/${nome}`]);
}

// 2. togli le cartelle rimaste vuote
function potaVuote(dir) {
  for (const nome of readdirSync(dir)) {
    const pieno = join(dir, nome);
    if (statSync(pieno).isDirectory()) potaVuote(pieno);
  }
  if (dir !== ASSETS && readdirSync(dir).length === 0) rmdirSync(dir);
}
potaVuote(ASSETS);

// 3. riscrivi i percorsi dentro i bundle
let sostituzioni = 0;
for (const bundle of file(JS).filter((f) => f.endsWith(".js"))) {
  let testo = readFileSync(bundle, "utf-8");
  for (const [vecchio, nuovo] of mappa) {
    if (testo.includes(vecchio)) {
      testo = testo.split(vecchio).join(nuovo);
      sostituzioni++;
    }
  }
  writeFileSync(bundle, testo);
}

/* 4. tieni SOLO i font che l'app carica davvero (i 5 del marchio via
   useFonts + Feather, l'unica famiglia di icone usata): l'export di
   Expo trascina TUTTI i ttf di @expo/vector-icons, ~8MB che nessuno
   scarica mai. Il bundle continua a nominarli, ma non li chiede. */
const FONT_USATI = [
  "Feather.",
  "Geist_500Medium.",
  "InstrumentSerif_400Regular_Italic.",
  "Poppins_400Regular.",
  "Poppins_500Medium.",
  "Poppins_600SemiBold.",
];
let tolti = 0;
for (const percorso of file(ASSETS).filter((f) => f.endsWith(".ttf"))) {
  const nome = percorso.split("/").pop();
  if (!FONT_USATI.some((ok) => nome.startsWith(ok))) {
    rmSync(percorso);
    tolti++;
  }
}

console.log(
  `Appiattiti ${mappa.length} asset, riscritti ${sostituzioni} riferimenti, tolti ${tolti} font inutili.`,
);
