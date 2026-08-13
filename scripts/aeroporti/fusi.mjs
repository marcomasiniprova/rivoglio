import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * RIEMPIE I FUSI ORARI MANCANTI, senza inventarne nemmeno uno.
 *
 * 🔴 Perché serve. Dei 9.016 scali dell'archivio, **3.500 non avevano il
 * fuso orario**, e fra questi Doha, cioè lo scalo di Qatar Airways.
 * OurAirports quel campo non lo pubblica per tutti.
 *
 * ⚠️ E VA DETTA UNA COSA, perché è una correzione a quello che avevo
 * scritto io a Valerio: il fuso **non cambia nessun verdetto**. Il
 * ritardo si calcola sugli orari UTC che manda il fornitore. Serve a
 * mostrare gli orari nell'ora dello scalo, che è come li legge la gente
 * sul biglietto, e a quello soltanto.
 *
 * COME SI RIEMPIE, e perché non è un'invenzione. Non si tira a indovinare
 * e non si usa una tabella scritta a mano: si guarda **l'archivio
 * stesso**, che per 5.516 scali il fuso ce l'ha.
 *
 * 1. Se tutti gli scali noti di quel paese stanno nello stesso fuso, lo
 *    prende. Vale per la stragrande maggioranza dei paesi del mondo, e
 *    non è una stima: è un fatto sul paese.
 * 2. Se il paese ha più fusi (Stati Uniti, Russia, Brasile, Australia,
 *    Canada, Messico, Indonesia, Cile), prende quello dello scalo noto
 *    **geograficamente più vicino**, in linea d'aria. Su un territorio i
 *    fusi sono fasce larghe centinaia di chilometri: l'aeroporto più
 *    vicino sta quasi sempre nella stessa.
 * 3. Se di quel paese non sappiamo niente, resta **null**. Meglio un
 *    campo vuoto che un'ora sbagliata scritta con sicurezza.
 *
 * Ogni riga riempita si porta dietro `tzDedotto: true`, così chi legge
 * sa che quel valore non viene dalla fonte: è nostro.
 *
 * Si lancia a mano: `node scripts/aeroporti/fusi.mjs`. Va rilanciato
 * dopo ogni aggiornamento dell'archivio (l'autopilot del lunedì).
 */

const QUI = dirname(fileURLToPath(import.meta.url));
const FILE = join(QUI, "..", "..", "lib", "dati", "aeroporti.json");

const archivio = JSON.parse(readFileSync(FILE, "utf8"));
const righe = Object.entries(archivio);

/** Distanza in linea d'aria, in km. La stessa formula del motore. */
function distanza(a, b) {
  const R = 6371;
  const r = (g) => (g * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLon = r(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/* Chi il fuso ce l'ha, raggruppato per paese. */
const noti = new Map();
for (const [, a] of righe) {
  if (!a.tz || !a.iso) continue;
  if (!noti.has(a.iso)) noti.set(a.iso, []);
  noti.get(a.iso).push(a);
}

let daPaese = 0;
let daVicino = 0;
let restano = 0;

for (const [iata, a] of righe) {
  if (a.tz) continue;
  const compagni = noti.get(a.iso);
  if (!compagni || compagni.length === 0) {
    restano++;
    continue;
  }

  const fusi = new Set(compagni.map((c) => c.tz));
  if (fusi.size === 1) {
    a.tz = compagni[0].tz;
    a.tzDedotto = true;
    daPaese++;
    continue;
  }

  /* Paese con più fusi: si prende quello dello scalo più vicino. Senza
     coordinate non si può, e allora si lascia vuoto. */
  if (typeof a.lat !== "number" || typeof a.lon !== "number") {
    restano++;
    continue;
  }
  let vicino = null;
  let minima = Infinity;
  for (const c of compagni) {
    if (typeof c.lat !== "number" || typeof c.lon !== "number") continue;
    const d = distanza(a, c);
    if (d < minima) {
      minima = d;
      vicino = c;
    }
  }
  if (!vicino) {
    restano++;
    continue;
  }
  a.tz = vicino.tz;
  a.tzDedotto = true;
  daVicino++;
  void iata;
}

writeFileSync(FILE, JSON.stringify(archivio) + "\n", "utf8");

const senza = righe.filter(([, a]) => !a.tz).length;
console.log(`Scali totali:            ${righe.length}`);
console.log(`Fuso dedotto dal paese:  ${daPaese}`);
console.log(`Fuso dedotto dal vicino: ${daVicino}`);
console.log(`Restano senza fuso:      ${senza} (dichiarati, non inventati)`);
void restano;
