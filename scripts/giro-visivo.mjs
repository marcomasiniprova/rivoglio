/**
 * IL GIRO VISIVO: le schermate del sito, scattate come le vede un utente.
 *
 * Perché uno script e non il Playwright dei test: qui il browser di
 * sistema non c'è, e il modulo `playwright` di node_modules porta con sé
 * il Chromium giusto (PLAYWRIGHT_BROWSERS_PATH).
 *
 * ⚠️ NIENTE `fullPage: true`, ed è una regola pagata con un giro sprecato
 * (ARRETRATI, voce O): con la pagina intera Playwright ridimensiona la
 * finestra, le sezioni che entrano scorrendo non si riattivano e vengono
 * BIANCHE. Una schermata bianca fa credere che il sito sia rotto quando
 * non lo è. Quindi si scorre piano, si aspetta, e si scatta quello che
 * c'è davvero sullo schermo.
 *
 * Uso: node scripts/giro-visivo.mjs [indirizzo] [cartella]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const SITO = process.argv[2] ?? "http://localhost:3000";
const FUORI = process.argv[3] ?? "schermate";

/** Le viste: il desktop più comune e l'iPhone più comune. */
const VISTE = [
  { nome: "desktop", larghezza: 1440, altezza: 900 },
  { nome: "telefono", larghezza: 390, altezza: 844 },
];

/**
 * Le tappe. `scorri` dice a che punto della pagina fermarsi (in schermate);
 * `attesa` quanto lasciare finire le animazioni prima di scattare.
 */
const TAPPE = [
  { id: "01-hero", url: "/", scorri: 0 },
  { id: "02-check", url: "/", scorri: 0.9 },
  { id: "04-prezzi", url: "/#prezzi", scorri: 0 },
  { id: "05-domande", url: "/#domande", scorri: 0 },
  { id: "06-tabellone", url: "/tabellone", scorri: 0 },
  { id: "07-articolo", url: "/tabellone/volo-in-ritardo-250-400-600-euro", scorri: 0 },
  { id: "08-articolo-check", url: "/tabellone/volo-in-ritardo-250-400-600-euro", scorri: 3 },
  { id: "09-sciopero", url: "/sciopero-aerei", scorri: 0 },
  { id: "10-aeroporto", url: "/aeroporto/FCO", scorri: 0 },
  { id: "11-webapp", url: "/app", scorri: 0 },
  { id: "12-condizioni", url: "/condizioni", scorri: 0 },
  { id: "13-giudice", url: "/giudice-di-pace", scorri: 0 },
];

const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

const bugs = [];

for (const vista of VISTE) {
  const browser = await chromium.launch();
  const contesto = await browser.newContext({
    viewport: { width: vista.larghezza, height: vista.altezza },
    deviceScaleFactor: 2,
    locale: "it-IT",
  });
  const pagina = await contesto.newPage();

  pagina.on("console", (m) => {
    if (m.type() === "error") bugs.push(`[${vista.nome}] console: ${m.text().slice(0, 160)}`);
  });
  pagina.on("pageerror", (e) => bugs.push(`[${vista.nome}] errore JS: ${String(e).slice(0, 160)}`));

  await mkdir(`${FUORI}/${vista.nome}`, { recursive: true });

  for (const tappa of TAPPE) {
    try {
      await pagina.goto(SITO + tappa.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await dormi(1200);

      /* Lo scroll è PESANTE (giro #52): non muove la pagina, alimenta un
         obiettivo con inerzia. Quindi si spinge e si aspetta che si
         fermi, invece di saltare con scrollTo. */
      if (tappa.scorri > 0) {
        const passi = Math.ceil(tappa.scorri * 4);
        for (let i = 0; i < passi; i++) {
          await pagina.mouse.wheel(0, (vista.altezza * tappa.scorri) / passi);
          await dormi(320);
        }
        await dormi(1800);
      }

      // Le sezioni che entrano in dissolvenza hanno bisogno del loro tempo.
      await dormi(900);

      await pagina.screenshot({ path: `${FUORI}/${vista.nome}/${tappa.id}.png` });

      // Lo scorrimento orizzontale è la rottura classica sul telefono.
      const largo = await pagina.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      if (largo) bugs.push(`[${vista.nome}] ${tappa.url} scorre in orizzontale`);

      console.log(`  ok  ${vista.nome}/${tappa.id}`);
    } catch (e) {
      bugs.push(`[${vista.nome}] ${tappa.url} non si apre: ${String(e).slice(0, 140)}`);
      console.log(`  KO  ${vista.nome}/${tappa.id}`);
    }
  }

  await browser.close();
}

console.log(`\n${bugs.length === 0 ? "NESSUN DIFETTO" : `DIFETTI: ${bugs.length}`}`);
for (const b of bugs) console.log("  -", b);
