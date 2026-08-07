import sharp from "sharp";

const SORGENTE =
  "/root/.claude/uploads/84da703a-484b-51df-82ff-b3b625d7c270/d9f9317b-IMG_4378.jpeg";
const SCRATCH =
  "/tmp/claude-0/-home-user-viaggioancheio/84da703a-484b-51df-82ff-b3b625d7c270/scratchpad";

// la sorgente è uno screenshot con gli angoli scuri arrotondati:
// via una cornice del 7% prima di tutto, il contenuto sta ben dentro
const meta0 = await sharp(SORGENTE).metadata();
const inset = Math.round(Math.min(meta0.width, meta0.height) * 0.07);
const { data, info } = await sharp(SORGENTE)
  .extract({
    left: inset,
    top: inset,
    width: meta0.width - inset * 2,
    height: meta0.height - inset * 2,
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
console.log("sorgente:", W + "x" + H);

const px = (x, y) => (y * W + x) * 4;
const eBg = (i, soglia = 30, min = 198) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx >= min && mx - mn <= soglia;
};

// riempimento dai bordi: via lo sfondo chiaro, restano le forme chiuse
const visto = new Uint8Array(W * H);
const coda = [];
for (let x = 0; x < W; x++) { coda.push([x, 0], [x, H - 1]); }
for (let y = 0; y < H; y++) { coda.push([0, y], [W - 1, y]); }
while (coda.length) {
  const [x, y] = coda.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const k = y * W + x;
  if (visto[k]) continue;
  visto[k] = 1;
  const i = px(x, y);
  if (!eBg(i)) continue;
  data[i + 3] = 0;
  coda.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}
// un giro di pulizia dell'alone: pixel chiari attaccati al trasparente
const daPulire = [];
for (let y = 1; y < H - 1; y++) {
  for (let x = 1; x < W - 1; x++) {
    const i = px(x, y);
    if (data[i + 3] === 0) continue;
    const vicini = [px(x + 1, y), px(x - 1, y), px(x, y + 1), px(x, y - 1)];
    if (vicini.some((v) => data[v + 3] === 0) && eBg(i, 42, 182)) daPulire.push(i);
  }
}
for (const i of daPulire) data[i + 3] = 0;

// profilo per riga: dove finisce il segno e inizia la scritta
const perRiga = new Array(H).fill(0);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) if (data[px(x, y) + 3] > 0) perRiga[y]++;
let vuotoInizio = -1, vuotoMiglior = [0, 0];
for (let y = Math.floor(H * 0.3); y < H * 0.95; y++) {
  if (perRiga[y] <= 2) {
    if (vuotoInizio < 0) vuotoInizio = y;
  } else if (vuotoInizio >= 0) {
    if (y - vuotoInizio > vuotoMiglior[1] - vuotoMiglior[0]) vuotoMiglior = [vuotoInizio, y];
    vuotoInizio = -1;
  }
}
const taglio = Math.floor((vuotoMiglior[0] + vuotoMiglior[1]) / 2);
console.log("banda vuota:", vuotoMiglior.join(".."), "taglio a", taglio);

// bordi del segno (sopra il taglio)
let sx = W, dx = 0, alto = H, basso = 0;
for (let y = 0; y < taglio; y++)
  for (let x = 0; x < W; x++)
    if (data[px(x, y) + 3] > 0) {
      if (x < sx) sx = x;
      if (x > dx) dx = x;
      if (y < alto) alto = y;
      if (y > basso) basso = y;
    }
console.log("segno:", { sx, dx, alto, basso, larg: dx - sx, alt: basso - alto });

const trasparente = sharp(Buffer.from(data), { raw: { width: W, height: H, channels: 4 } });
const margine = 14;
const ritaglio = {
  left: Math.max(0, sx - margine),
  top: Math.max(0, alto - margine),
  width: Math.min(W, dx + margine) - Math.max(0, sx - margine),
  height: Math.min(taglio, basso + margine) - Math.max(0, alto - margine),
};

// 1) il segno trasparente, upscalato a 1024 di larghezza
await trasparente
  .clone()
  .extract(ritaglio)
  .resize({ width: 1024, kernel: "lanczos3" })
  .sharpen({ sigma: 0.8 })
  .png()
  .toFile("public/marchio.png");

// 2) lockup intero trasparente upscalato 2x (per footer scuro e usi vari)
await trasparente
  .clone()
  .resize({ width: W * 2, kernel: "lanczos3" })
  .sharpen({ sigma: 0.8 })
  .png()
  .toFile("public/marchio-completo.png");

// prova visiva: segno su fondo scuro e su nebbia, affiancati
const segno = await sharp("public/marchio.png").resize({ width: 360 }).png().toBuffer();
const m = await sharp(segno).metadata();
await sharp({
  create: { width: 800, height: m.height + 40, channels: 4, background: "#052E1F" },
})
  .composite([
    { input: segno, left: 20, top: 20 },
    {
      input: await sharp({
        create: { width: 400, height: m.height + 40, channels: 4, background: "#F6F8FA" },
      }).png().toBuffer(),
      left: 400,
      top: 0,
    },
    { input: segno, left: 420, top: 20 },
  ])
  .png()
  .toFile(`${SCRATCH}/prova-marchio.png`);
console.log("scritti: public/marchio.png, public/marchio-completo.png, prova-marchio.png");
