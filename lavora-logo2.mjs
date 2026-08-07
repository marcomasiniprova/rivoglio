import sharp from "sharp";

const SCRATCH =
  "/tmp/claude-0/-home-user-viaggioancheio/84da703a-484b-51df-82ff-b3b625d7c270/scratchpad";

// riparto dal lockup già trasparente (694 di larghezza sarebbe 2x: uso il raw)
const { data, info } = await sharp("public/marchio-completo.png")
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (x, y) => (y * W + x) * 4;

// seme: il primo pixel opaco scendendo lungo la colonna centrale
let seme = null;
for (let y = 0; y < H && !seme; y++)
  for (let x = Math.floor(W * 0.35); x < W * 0.65 && !seme; x++)
    if (data[px(x, y) + 3] > 40) seme = [x, y];
console.log("seme:", seme);

// componente connesso del vetro (8 direzioni)
const dentro = new Uint8Array(W * H);
const coda = [seme];
let sx = W, dx = 0, alto = H, basso = 0, n = 0;
while (coda.length) {
  const [x, y] = coda.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const k = y * W + x;
  if (dentro[k]) continue;
  if (data[px(x, y) + 3] <= 40) continue;
  dentro[k] = 1;
  n++;
  if (x < sx) sx = x;
  if (x > dx) dx = x;
  if (y < alto) alto = y;
  if (y > basso) basso = y;
  for (let ddx = -1; ddx <= 1; ddx++)
    for (let ddy = -1; ddy <= 1; ddy++) coda.push([x + ddx, y + ddy]);
}
console.log("vetro:", { sx, dx, alto, basso, n, larg: dx - sx, alt: basso - alto });

// tieni SOLO il componente del vetro
const solo = Buffer.from(data);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (!dentro[y * W + x]) solo[px(x, y) + 3] = 0;

const margine = 10;
const box = {
  left: Math.max(0, sx - margine),
  top: Math.max(0, alto - margine),
  width: Math.min(W - 1, dx + margine) - Math.max(0, sx - margine),
  height: Math.min(H - 1, basso + margine) - Math.max(0, alto - margine),
};
await sharp(solo, { raw: { width: W, height: H, channels: 4 } })
  .extract(box)
  .resize({ width: 1024, kernel: "lanczos3", fit: "inside" })
  .sharpen({ sigma: 0.6 })
  .png()
  .toFile("public/marchio.png");

// icone: segno centrato su fondo bianco, quadrate
const segno = await sharp("public/marchio.png").png().toBuffer();
async function icona(lato, dove) {
  const m = await sharp(segno).metadata();
  const scala = Math.round(lato * 0.72);
  const ridotto = await sharp(segno)
    .resize({ width: scala, height: scala, fit: "inside" })
    .png()
    .toBuffer();
  const rm = await sharp(ridotto).metadata();
  await sharp({ create: { width: lato, height: lato, channels: 4, background: "#ffffff" } })
    .composite([
      {
        input: ridotto,
        left: Math.round((lato - rm.width) / 2),
        top: Math.round((lato - rm.height) / 2),
      },
    ])
    .png()
    .toFile(dove);
}
await icona(512, "app/icon.png");
await icona(180, "app/apple-icon.png");

// prova visiva: segno su scuro e su chiaro + icona
const anteprima = await sharp("public/marchio.png").resize({ width: 300 }).png().toBuffer();
const am = await sharp(anteprima).metadata();
const ic = await sharp("app/icon.png").resize({ width: 120 }).png().toBuffer();
await sharp({
  create: { width: 760, height: am.height + 40, channels: 4, background: "#052E1F" },
})
  .composite([
    { input: anteprima, left: 20, top: 20 },
    {
      input: await sharp({
        create: { width: 380, height: am.height + 40, channels: 4, background: "#F6F8FA" },
      }).png().toBuffer(),
      left: 380,
      top: 0,
    },
    { input: anteprima, left: 400, top: 20 },
    { input: ic, left: 620, top: 20 },
  ])
  .png()
  .toFile(`${SCRATCH}/prova-marchio-2.png`);
console.log("scritti: public/marchio.png (solo segno), app/icon.png, app/apple-icon.png");
