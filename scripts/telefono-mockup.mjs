/**
 * Monta lo schermo VERO dell'app dentro la foto del telefono in mano.
 *
 * Perché esiste: la foto originale aveva incollata dentro una finta
 * schermata generata dall'AI ("Ciao, Marco", tab "Rimborsi") che non è mai
 * esistita nell'app. Un mockup che mostra un prodotto diverso da quello
 * che si scarica è una bugia, e si vede.
 *
 * Cosa fa, in ordine:
 * 1. trova il rettangolo dello schermo nella foto (transizione cornice
 *    scura → schermo chiaro, misurata sui pixel, non a occhio);
 * 2. ci incolla dentro la schermata catturata dall'app vera, con gli
 *    angoli arrotondati come quelli del telefono;
 * 3. rialza tutto a 2x: la parte con del testo torna nitida;
 * 4. ricentra la tela sul CENTRO DELLO SCHERMO, non sull'ingombro della
 *    mano: è il telefono che l'occhio usa per giudicare se è storto.
 *
 * Uso:  node scripts/telefono-mockup.mjs <schermata.png> [uscita.png]
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

/* La foto di partenza (mano + telefono, sfondo tolto) resta a sorgente:
   l'uscita in /public è un file DERIVATO e si può rifare quando vuoi. */
const FOTO = "sorgenti/telefono-mano.png";
const schermata = process.argv[2];
const uscita = process.argv[3] ?? "public/telefono-app.webp";
if (!schermata) {
  console.error("Serve la schermata: node scripts/telefono-mockup.mjs <file.png>");
  process.exit(1);
}

/* ── 1. lo schermo dentro la foto ─────────────────────────────────────── */

const base = sharp(readFileSync(FOTO));
const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const px = (x, y) => {
  const i = (y * W + x) * C;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: C === 4 ? data[i + 3] : 255 };
};
const lum = (p) => 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;
const scuro = (p) => p.a > 200 && lum(p) < 70;
const chiaro = (p) => p.a > 200 && lum(p) > 170;

/** La mediana è a prova di riga sbagliata: un pixel strano non sposta il bordo. */
const mediana = (v) => v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)];

const sx = [];
const dx = [];
for (let y = 60; y < H - 100; y += 3) {
  for (let x = 6; x < W - 6; x++)
    if (chiaro(px(x, y)) && chiaro(px(x + 3, y)) && scuro(px(x - 4, y)) && scuro(px(x - 7, y))) {
      sx.push(x);
      break;
    }
  for (let x = W - 8; x > 6; x--)
    if (chiaro(px(x, y)) && chiaro(px(x - 3, y)) && scuro(px(x + 4, y)) && scuro(px(x + 7, y))) {
      dx.push(x);
      break;
    }
}
const x0 = mediana(sx);
const x1 = mediana(dx);

const su = [];
const giu = [];
for (let x = x0 + 40; x < x1 - 40; x += 3) {
  for (let y = 6; y < H - 6; y++)
    if (chiaro(px(x, y)) && chiaro(px(x, y + 3)) && scuro(px(x, y - 4)) && scuro(px(x, y - 7))) {
      su.push(y);
      break;
    }
  for (let y = H - 8; y > 6; y--)
    if (chiaro(px(x, y)) && chiaro(px(x, y - 3)) && scuro(px(x, y + 4)) && scuro(px(x, y + 7))) {
      giu.push(y);
      break;
    }
}
const y0 = mediana(su);
const y1 = mediana(giu);
const sw = x1 - x0 + 1;
const sh = y1 - y0 + 1;
console.log(`schermo trovato: ${sw}x${sh} a (${x0},${y0})`);

/* ── 2. la schermata vera, agli angoli del telefono ───────────────────── */

const SCALA = 2; // la foto sale a 2x: lo schermo è la parte che si legge
const SW = sw * SCALA;
const SH = sh * SCALA;
/* Raggio dello schermo iPhone: 55/393 della larghezza. Misurato sulla
   foto darebbe lo stesso numero, ma il rapporto non sbaglia mai. */
const RAGGIO = Math.round((SW * 55) / 393);

const maschera = Buffer.from(
  `<svg width="${SW}" height="${SH}"><rect width="${SW}" height="${SH}" rx="${RAGGIO}" ry="${RAGGIO}" fill="#fff"/></svg>`,
);

const schermo = await sharp(readFileSync(schermata))
  .resize(SW, SH, { fit: "fill", kernel: "lanczos3" })
  .composite([{ input: maschera, blend: "dest-in" }])
  .png()
  .toBuffer();

const fotoGrande = await base
  .clone()
  .resize(W * SCALA, H * SCALA, { kernel: "lanczos3" })
  .png()
  .toBuffer();

const montata = await sharp(fotoGrande)
  .composite([{ input: schermo, left: x0 * SCALA, top: y0 * SCALA }])
  .png()
  .toBuffer();

/* ── 3. il centro ottico è il centro dello schermo ────────────────────── */

const centroSchermo = (x0 + sw / 2) * SCALA;
const larghezza = W * SCALA;
const scarto = Math.round(larghezza / 2 - centroSchermo); // >0: il telefono sta a sinistra
const bordo = Math.abs(scarto);
const finale = await sharp(montata)
  .extend({
    left: scarto > 0 ? bordo : 0,
    right: scarto > 0 ? 0 : bordo,
    top: 0,
    bottom: 0,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  /* WebP con trasparenza: stessa immagine, un quinto del peso. Il PNG
     dello stesso mockup pesa 1 MB, e 1 MB nel footer si sente. */
  .webp({ quality: 92, alphaQuality: 100, effort: 6 })
  .toBuffer();

/* Si scrive il buffer com'è: passarlo di nuovo da sharp lo ricomprime
   una seconda volta e la nitidezza del testo se ne va. */
await writeFile(uscita, finale);
const meta = await sharp(finale).metadata();
console.log(
  `scarto corretto: ${scarto}px · uscita ${meta.width}x${meta.height} · ${(finale.length / 1024).toFixed(0)} KB → ${uscita}`,
);
