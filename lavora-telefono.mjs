import sharp from "sharp";

const SORGENTE =
  "/root/.claude/uploads/84da703a-484b-51df-82ff-b3b625d7c270/d7c07e94-1648930928754d65df139c2f9b7272e45c1114d4.png";
const SCRATCH =
  "/tmp/claude-0/-home-user-viaggioancheio/84da703a-484b-51df-82ff-b3b625d7c270/scratchpad";

const { data, info } = await sharp(SORGENTE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
console.log("sorgente:", W + "x" + H);
const px = (x, y) => (y * W + x) * 4;

// sfondo: chiarissimo e poco saturo (righe verdine, bianco, ombra tenue).
// la pelle è calda (r-b alto), la cornice del telefono è scura: restano.
const eBg = (i, delta = 34, min = 196) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx >= min && mx - mn <= delta && r - b < 26;
};

const visto = new Uint8Array(W * H);
const coda = [];
for (let x = 0; x < W; x++) coda.push([x, 0], [x, H - 1]);
for (let y = 0; y < H; y++) coda.push([0, y], [W - 1, y]);
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
// alone: due giri di pulizia sul bordo del trasparente
for (let giro = 0; giro < 2; giro++) {
  const daPulire = [];
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = px(x, y);
      if (data[i + 3] === 0) continue;
      const vicini = [px(x + 1, y), px(x - 1, y), px(x, y + 1), px(x, y - 1)];
      if (vicini.some((v) => data[v + 3] === 0) && eBg(i, 46, 178)) daPulire.push(i);
    }
  for (const i of daPulire) data[i + 3] = 0;
}

// bordi del contenuto rimasto
let sx = W, dx = 0, alto = H, basso = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (data[px(x, y) + 3] > 0) {
      if (x < sx) sx = x;
      if (x > dx) dx = x;
      if (y < alto) alto = y;
      if (y > basso) basso = y;
    }
console.log("contenuto:", { sx, dx, alto, basso });

await sharp(Buffer.from(data), { raw: { width: W, height: H, channels: 4 } })
  .extract({
    left: Math.max(0, sx - 6),
    top: Math.max(0, alto - 6),
    width: Math.min(W, dx + 6) - Math.max(0, sx - 6),
    height: basso - Math.max(0, alto - 6) + 1, // fino in fondo: la mano esce dal bordo
  })
  .png()
  .toFile("public/telefono-app.png");

// prova su fondo bianco e su nebbia
const t = await sharp("public/telefono-app.png").resize({ height: 460 }).png().toBuffer();
const tm = await sharp(t).metadata();
await sharp({
  create: { width: tm.width * 2 + 60, height: 500, channels: 4, background: "#ffffff" },
})
  .composite([
    { input: t, left: 20, top: 20 },
    {
      input: await sharp({
        create: { width: tm.width + 20, height: 500, channels: 4, background: "#052E1F" },
      }).png().toBuffer(),
      left: tm.width + 40,
      top: 0,
    },
    { input: t, left: tm.width + 50, top: 20 },
  ])
  .png()
  .toFile(`${SCRATCH}/prova-telefono.png`);
console.log("scritto: public/telefono-app.png");
