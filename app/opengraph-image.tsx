import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { COPY } from "@/lib/copy";

/**
 * L'immagine che si vede quando qualcuno incolla il link su WhatsApp,
 * Telegram, Facebook o X. Vende esattamente quello che vende il sito:
 * il verdetto col dato oggettivo, gli stessi numeri di COPY (il caso
 * costruito di lib/copy.ts, quello marcato demo sulla landing).
 */
export const alt = "Rivoglio: riprenditi i soldi che ti devono";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const E = COPY.datoOggettivo.esempio;

/* Il segno nuovo (la lente): letto da disco al momento, Next impacchetta
   l'asset. Dentro la funzione e con ripiego: una promessa a livello di
   modulo restava appesa nei contesti doppi del dev server. */
async function leggiMarchio(): Promise<string | null> {
  try {
    const dati = await readFile(new URL("./marchio-og.png", import.meta.url));
    return `data:image/png;base64,${dati.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Anteprima() {
  const segno = await leggiMarchio();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #052e1f 0%, #067a46 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* marchio: la lente su gettone bianco, il nome in due toni */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#fff",
            }}
          >
            {segno && <img src={segno} alt="" width={46} height={46} />}
          </div>
          <span style={{ color: "#fff", fontSize: 32, fontWeight: 600 }}>
            Rivo<span style={{ color: "#7fe8ae" }}>glio</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span
              style={{
                color: "#fff",
                fontSize: 66,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -2.5,
              }}
            >
              Riprenditi i soldi
            </span>
            <span
              style={{
                color: "#7fe8ae",
                fontSize: 66,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -2.5,
              }}
            >
              che ti devono.
            </span>
            <span style={{ color: "#a7d9c2", fontSize: 27, marginTop: 26, lineHeight: 1.4 }}>
              Volo in ritardo nell&apos;ultimo anno? Check gratuito
              <br />
              in 30 secondi, senza account. Reg. CE 261/2004.
            </span>
          </div>

          {/* il verdetto, com'è sul sito */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              borderRadius: 28,
              padding: 32,
              width: 400,
            }}
          >
            <span
              style={{
                fontSize: 19,
                color: "#0a9d5c",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {E.occhiello}
            </span>
            <span style={{ fontSize: 33, fontWeight: 700, marginTop: 12, letterSpacing: -1 }}>
              {E.titolo}
            </span>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 22,
                fontSize: 21,
                color: "#6b7280",
              }}
            >
              <span>{E.previstoEtichetta}</span>
              <span style={{ color: "#0a0a0a", fontWeight: 600 }}>{E.previsto}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 21,
                color: "#6b7280",
              }}
            >
              <span>{E.effettivoEtichetta}</span>
              <span style={{ color: "#0a0a0a", fontWeight: 600 }}>{E.effettivo}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 18,
                paddingTop: 18,
                borderTop: "1px solid #e4e9ee",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 600 }}>La fascia</span>
              <span style={{ fontSize: 44, fontWeight: 700, color: "#0a9d5c" }}>
                {E.fascia}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
