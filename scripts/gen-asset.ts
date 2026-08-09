/**
 * Genera gli asset visivi di Rivolio.
 *
 * Due strade:
 *   1. Immagini generate (luci, sfondi, scene) con l'API Gemini
 *   2. Foto reali da Unsplash (con credito dell'autore stampato)
 *
 * Uso:
 *   npm run asset -- --prompt "luce diagonale morbida su fondo verde notte" --nome luce-hero
 *   npm run asset -- --unsplash "airplane window sunset" --nome finestrino
 *   Opzioni: --larghezza 1600 (default 2000, max)
 *
 * Regole (CLAUDE.md, sezione ASSET):
 *   - output SEMPRE in /public/assets/, formato WebP, sotto 1MB
 *   - il prompt va mostrato a Valerio e approvato PRIMA di generare
 *
 * Chiavi: GEMINI_API_KEY e UNSPLASH_ACCESS_KEY in `.env.development.local`
 * (in questo repo `.env.local` è in UTF-16 e Next lo ignora: vedi STATO).
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RADICE = path.resolve(__dirname, "..");
const USCITA = path.join(RADICE, "public", "assets");
const MODELLO_GEMINI = "gemini-2.5-flash-image";

/** Legge le chiavi dai file .env locali senza dipendenze esterne. */
function caricaEnv(): Record<string, string> {
  const valori: Record<string, string> = {};
  for (const nome of [".env.development.local", ".env.local", ".env"]) {
    const percorso = path.join(RADICE, nome);
    if (!existsSync(percorso)) continue;
    let testo = "";
    try {
      const grezzo = readFileSync(percorso);
      // il file UTF-16 storico: byte a zero alternati, salta senza rompere
      testo = grezzo.includes(0) ? grezzo.toString("utf16le") : grezzo.toString("utf8");
    } catch {
      continue;
    }
    for (const riga of testo.split(/\r?\n/)) {
      const m = riga.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in valori)) valori[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return { ...valori, ...(process.env as Record<string, string>) };
}

function leggiArgomenti() {
  const a = process.argv.slice(2);
  const prendi = (bandiera: string) => {
    const i = a.indexOf(bandiera);
    return i >= 0 && a[i + 1] ? a[i + 1] : undefined;
  };
  return {
    prompt: prendi("--prompt"),
    unsplash: prendi("--unsplash"),
    nome: prendi("--nome"),
    larghezza: Number(prendi("--larghezza") ?? 2000),
  };
}

async function generaConGemini(prompt: string, chiave: string): Promise<Buffer> {
  const risposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELLO_GEMINI}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": chiave },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!risposta.ok) {
    throw new Error(`Gemini ha risposto ${risposta.status}: ${await risposta.text()}`);
  }
  const dati = (await risposta.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
  };
  const parte = dati.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!parte?.inlineData?.data) {
    throw new Error("Gemini non ha restituito un'immagine (solo testo?). Riformula il prompt.");
  }
  return Buffer.from(parte.inlineData.data, "base64");
}

async function fotoDaUnsplash(ricerca: string, chiave: string): Promise<Buffer> {
  const r = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(ricerca)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${chiave}` } },
  );
  if (!r.ok) throw new Error(`Unsplash ha risposto ${r.status}: ${await r.text()}`);
  const dati = (await r.json()) as {
    results?: {
      urls?: { regular?: string };
      user?: { name?: string };
      links?: { html?: string };
    }[];
  };
  const foto = dati.results?.[0];
  if (!foto?.urls?.regular) throw new Error(`Nessuna foto trovata per "${ricerca}".`);
  console.log(`Credito: foto di ${foto.user?.name ?? "?"} su Unsplash (${foto.links?.html ?? ""})`);
  const img = await fetch(foto.urls.regular);
  if (!img.ok) throw new Error(`Scarico foto fallito: ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

/** WebP sotto 1MB: parte a qualità 82 e scende finché non ci sta. */
async function salvaWebp(sorgente: Buffer, nome: string, larghezza: number): Promise<void> {
  mkdirSync(USCITA, { recursive: true });
  const destinazione = path.join(USCITA, `${nome}.webp`);
  for (const qualita of [82, 72, 62, 50, 40]) {
    const dati = await sharp(sorgente)
      .resize({ width: larghezza, withoutEnlargement: true })
      .webp({ quality: qualita })
      .toBuffer();
    if (dati.length <= 1_000_000 || qualita === 40) {
      writeFileSync(destinazione, dati);
      console.log(
        `Scritto public/assets/${nome}.webp (${Math.round(dati.length / 1024)}KB, qualità ${qualita})`,
      );
      if (dati.length > 1_000_000) {
        console.warn("Attenzione: sopra 1MB anche a qualità 40. Riduci --larghezza.");
      }
      return;
    }
  }
}

async function principale() {
  const { prompt, unsplash, nome, larghezza } = leggiArgomenti();
  if (!nome || (!prompt && !unsplash)) {
    console.error(
      'Uso: npm run asset -- --prompt "descrizione" --nome nome-file\n' +
        '     npm run asset -- --unsplash "ricerca" --nome nome-file',
    );
    process.exit(1);
  }
  const env = caricaEnv();
  let immagine: Buffer;
  if (prompt) {
    if (!env.GEMINI_API_KEY) {
      console.error("Manca GEMINI_API_KEY in .env.development.local: senza, niente generazione.");
      process.exit(1);
    }
    console.log(`Genero con ${MODELLO_GEMINI}: "${prompt}"`);
    immagine = await generaConGemini(prompt, env.GEMINI_API_KEY);
  } else {
    if (!env.UNSPLASH_ACCESS_KEY) {
      console.error("Manca UNSPLASH_ACCESS_KEY in .env.development.local: senza, niente foto.");
      process.exit(1);
    }
    immagine = await fotoDaUnsplash(unsplash as string, env.UNSPLASH_ACCESS_KEY);
  }
  await salvaWebp(immagine, nome, larghezza);
}

principale().catch((errore) => {
  console.error(`Errore: ${errore instanceof Error ? errore.message : errore}`);
  process.exit(1);
});
