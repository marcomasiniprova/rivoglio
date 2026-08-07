import sharp from "sharp";

const { data, info } = await sharp("public/telefono-app.png")
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (x, y) => (y * W + x) * 4;

// etichetta i componenti connessi dei pixel opachi, tieni il più grande
const etichetta = new Int32Array(W * H).fill(-1);
let prossima = 0;
const dimensioni = [];
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (etichetta[k] >= 0 || data[k * 4 + 3] <= 8) continue;
    let n = 0;
    const coda = [[x, y]];
    etichetta[k] = prossima;
    while (coda.length) {
      const [cx, cy] = coda.pop();
      n++;
      for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1],[cx+1,cy+1],[cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1]]) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nk = ny * W + nx;
        if (etichetta[nk] >= 0 || data[nk * 4 + 3] <= 8) continue;
        etichetta[nk] = prossima;
        coda.push([nx, ny]);
      }
    }
    dimensioni.push(n);
    prossima++;
  }
const grande = dimensioni.indexOf(Math.max(...dimensioni));
console.log("componenti:", prossima, "il più grande:", dimensioni[grande], "pixel");

let sx = W, dx = 0, alto = H, basso = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (etichetta[k] !== grande) {
      data[k * 4 + 3] = Math.min(data[k * 4 + 3], 0);
    } else {
      if (x < sx) sx = x;
      if (x > dx) dx = x;
      if (y < alto) alto = y;
      if (y > basso) basso = y;
    }
  }
console.log("bordi:", { sx, dx, alto, basso });

await sharp(Buffer.from(data), { raw: { width: W, height: H, channels: 4 } })
  .extract({
    left: Math.max(0, sx - 4),
    top: Math.max(0, alto - 4),
    width: Math.min(W, dx + 4) - Math.max(0, sx - 4),
    height: basso - Math.max(0, alto - 4) + 1,
  })
  .png()
  .toFile("public/telefono-app-pulito.png");
console.log("scritto: public/telefono-app-pulito.png");
