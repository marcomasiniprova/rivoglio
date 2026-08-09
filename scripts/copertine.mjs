/**
 * DALLE FOTO GENERATE ALLE COPERTINE DEL TABELLONE.
 *
 * Le dieci immagini escono da Gemini a 2624x1632 e portano la stellina
 * della filigrana, che NON sta nell'angolo: sta dentro l'immagine, a circa
 * 230 pixel dal bordo destro e 190 dal basso, ed è larga un centinaio di
 * pixel. Per questo non basta tagliare la striscia in fondo: per portarla
 * fuori dal fotogramma servirebbe togliere il 19% dell'altezza, mentre
 * tagliando da DESTRA basta l'11%. Si taglia da destra.
 *
 * Poi si riporta l'inquadratura a 16:10 togliendo il resto dal basso (in
 * tutte e dieci il fondo è pavimento o piano d'appoggio, cioè la parte
 * che non racconta niente).
 *
 * Una sola immagine ha una regola sua, ed è dichiarata nella tabella: la
 * numero 10 ha dei titoli leggibili che parlano d'altro, e va inquadrata
 * più stretta.
 *
 * ⚠️ La filigrana INVISIBILE (SynthID) resta dentro i pixel: non si toglie
 * e non si vede. Va detto, non nascosto.
 *
 * Uso:  node scripts/copertine.mjs <cartella-con-i-png>
 */
import { readdir, mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SORGENTE = process.argv[2];
const DESTINAZIONE = "public/assets/tabellone";

/** Dove sta la stellina: misurata sulle immagini vere, non stimata. */
const FILIGRANA = { x: 2330, y: 1325, larghezza: 120, altezza: 130 };

/** Il taglio buono per nove immagini su dieci. */
const STANDARD = { left: 0, top: 0, width: 2320, height: 1450 };

/**
 * La mappa: quale foto va su quale articolo.
 * L'ordine dei file è quello alfabetico dei nomi che dà Gemini; il
 * riconoscimento l'ho fatto guardandole una per una.
 */
const MAPPA = [
  { file: "2gsmk9", nome: "volo-cancellato", cosa: "mano che fotografa il tabellone" },
  { file: "78q9lb", nome: "reclamo-wizz", cosa: "ragazzo al gate col telefono" },
  { file: "bkcw7j", nome: "sciopero-aerei", cosa: "hall check-in vuota" },
  { file: "h8bbkk", nome: "dati-europa", cosa: "folla mossa, una persona ferma" },
  { file: "irqwxl", nome: "quanto-tempo", cosa: "pennarello sul calendario" },
  { file: "p1d84w", nome: "volo-in-ritardo", cosa: "donna che guarda il tabellone" },
  { file: "qwr2t5", nome: "scali-italiani", cosa: "costa italiana dall'oblò" },
  { file: "s8irxs", nome: "reclamo-ryanair", cosa: "telefono col modulo di check-in" },
  { file: "y5vwqr", nome: "compagnia-dice-no", cosa: "tavolo di sera, lettera e mani" },
  {
    file: "ytnk11",
    nome: "reclamo-easyjet",
    cosa: "due pile di fogli e una mano che sceglie",
    /* Inquadratura sua: nella parte alta ci sono titoli leggibili che
       parlano di tutt'altro (un report sull'energia). A dimensione di
       copertina si leggerebbero, e farebbero sembrare la pagina montata
       a caso. Si stringe sulla mano che sceglie fra le due pile. */
    taglio: { left: 700, top: 632, width: 1600, height: 1000 },
  },
];

const LARGO = 1600;

async function main() {
  if (!SORGENTE) {
    console.error("Serve la cartella dei PNG: node scripts/copertine.mjs <cartella>");
    process.exit(1);
  }

  await mkdir(DESTINAZIONE, { recursive: true });
  const presenti = await readdir(SORGENTE);

  for (const voce of MAPPA) {
    const file = presenti.find((f) => f.includes(voce.file) && f.endsWith(".png"));
    if (!file) {
      console.error(`✗ manca l'originale di ${voce.nome} (${voce.file})`);
      process.exitCode = 1;
      continue;
    }

    const taglio = voce.taglio ?? STANDARD;

    /* Il controllo che conta: il ritaglio non deve toccare la stellina.
       Se un giorno cambia la posizione della filigrana, questo si ferma
       invece di pubblicare dieci copertine marchiate. */
    const tocca =
      taglio.left < FILIGRANA.x + FILIGRANA.larghezza &&
      taglio.left + taglio.width > FILIGRANA.x &&
      taglio.top < FILIGRANA.y + FILIGRANA.altezza &&
      taglio.top + taglio.height > FILIGRANA.y;
    if (tocca) {
      console.error(`✗ ${voce.nome}: il ritaglio comprende la filigrana. Non pubblico.`);
      process.exitCode = 1;
      continue;
    }

    const alto = Math.round((taglio.width / taglio.height) === 1.6 ? LARGO / 1.6 : LARGO / (taglio.width / taglio.height));

    await sharp(join(SORGENTE, file))
      .extract(taglio)
      .resize(LARGO, alto, { fit: "cover", kernel: "lanczos3" })
      /* Un filo di nitidezza dopo il ridimensionamento: scendendo da 2320
         a 1600 pixel il dettaglio si ammorbidisce sempre. */
      .sharpen({ sigma: 0.6 })
      .webp({ quality: 82, effort: 6 })
      .toFile(join(DESTINAZIONE, `${voce.nome}.webp`));

    console.log(`✓ ${voce.nome}.webp  (${voce.cosa})`);
  }
}

await main();
