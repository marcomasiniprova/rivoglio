/**
 * L'AUTOPILOT DEGLI AEROPORTI.
 *
 * Scarica l'elenco pubblico di OurAirports, lo converte nel nostro
 * formato, lo controlla e solo se il controllo passa riscrive
 * `lib/dati/aeroporti.json`. Lo lancia GitHub ogni lunedì da solo
 * (.github/workflows/aeroporti.yml): se qualcosa cambia nasce un commit,
 * Netlify ricostruisce, e nessuno ha dovuto fare niente.
 *
 * Uso:
 *   node scripts/aeroporti-aggiorna.mjs            scarica e aggiorna
 *   node scripts/aeroporti-aggiorna.mjs --prova    dice cosa cambierebbe, non scrive
 *   node scripts/aeroporti-aggiorna.mjs --da f.csv usa un file già scaricato
 *
 * La fonte: https://ourairports.com/data/ — dominio pubblico, aggiornata
 * ogni giorno dalla comunità che la mantiene.
 */
import { readFile, writeFile } from "node:fs/promises";
import { controlla, daOurAirports, leggiCsv, serializza } from "./aeroporti/converti.mjs";

const FONTE = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const ARCHIVIO = "lib/dati/aeroporti.json";

const argomenti = process.argv.slice(2);
const prova = argomenti.includes("--prova");
const daFile = argomenti[argomenti.indexOf("--da") + 1];

async function scarica() {
  if (argomenti.includes("--da")) return readFile(daFile, "utf8");
  const risposta = await fetch(FONTE, { headers: { "user-agent": "Rivolio/1.0" } });
  if (!risposta.ok) throw new Error(`la fonte ha risposto ${risposta.status}`);
  const testo = await risposta.text();
  if (testo.length < 1_000_000) throw new Error(`scaricati solo ${testo.length} byte: file monco`);
  return testo;
}

async function main() {
  const vecchio = JSON.parse(await readFile(ARCHIVIO, "utf8"));
  const csv = await scarica();
  const righe = leggiCsv(csv);
  const { archivio, nuovi, spariti } = daOurAirports(righe, vecchio);
  const esito = controlla(archivio, vecchio);

  console.log(`Scali nell'archivio: ${esito.prima} → ${esito.quanti}`);
  if (nuovi.length) console.log(`Nuovi (${nuovi.length}): ${nuovi.slice(0, 20).join(", ")}`);
  if (spariti.length) console.log(`Non più nella fonte, tenuti: ${spariti.length}`);

  if (!esito.ok) {
    console.error("NON AGGIORNO, l'archivio nuovo non passa il controllo:");
    for (const m of esito.motivi) console.error(`  - ${m}`);
    process.exit(1);
  }

  const testo = serializza(archivio);
  if (prova) {
    console.log("Prova: non scrivo niente. Il file sarebbe di", testo.length, "byte.");
    return;
  }
  await writeFile(ARCHIVIO, testo);
  console.log(`✓ ${ARCHIVIO} aggiornato (${testo.length} byte).`);
}

await main();
