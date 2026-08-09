import { ImageResponse } from "next/og";
import { ARTICOLI_SLUG, FIRMA, NOME_BLOG, dataInItaliano, perSlug } from "@/lib/tabellone/indice";

/**
 * L'immagine che esce su WhatsApp, LinkedIn e X quando si condivide un
 * articolo. È generata dal titolo vero: un'immagine social uguale per
 * tutti gli articoli fa sembrare il blog una pagina sola.
 *
 * Niente font caricati da rete: nella build di Netlify non si scaricano,
 * e l'immagine morirebbe in silenzio. Si usa il sans di sistema del
 * generatore, che qui basta perché il carattere è grosso e pieno.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `Un articolo del ${NOME_BLOG} di Rivolio`;

export function generateStaticParams() {
  return ARTICOLI_SLUG.map((slug) => ({ slug }));
}

export default async function Immagine({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = perSlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#052e1f",
          padding: "72px 76px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: "#0a9d5c",
            opacity: 0.28,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14, zIndex: 1 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#7fe8ae",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", fontSize: 30, color: "#fbf9ef", fontWeight: 700 }}>
            Rivolio
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#7fe8ae" }}>{NOME_BLOG}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              fontSize: a && a.titolo.length > 62 ? 60 : 72,
              lineHeight: 1.06,
              letterSpacing: -2.4,
              color: "#fbf9ef",
              fontWeight: 700,
              maxWidth: 1000,
            }}
          >
            {a?.titolo ?? `${NOME_BLOG}, il blog di Rivolio`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "#7fe8ae",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex" }}>{FIRMA}</div>
          {a && <div style={{ display: "flex", opacity: 0.5 }}>·</div>}
          {a && <div style={{ display: "flex", opacity: 0.8 }}>{dataInItaliano(a.data)}</div>}
        </div>
      </div>
    ),
    size,
  );
}
