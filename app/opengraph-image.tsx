import { ImageResponse } from "next/og";
import { CONTO, ESEMPIO, euro } from "@/lib/esempio";

/**
 * L'immagine che si vede quando qualcuno incolla il link su WhatsApp,
 * Telegram, Facebook o X. Prima non c'era: usciva un rettangolo grigio,
 * che su un prodotto di viaggi è il modo più veloce per non farsi cliccare.
 *
 * Dentro ci mettiamo il conto vero, gli stessi numeri di lib/esempio.ts:
 * l'anteprima vende esattamente quello che vende il sito.
 */
export const alt = "Rivoglio: la tua fuga, al prezzo giusto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Anteprima() {
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
        {/* marchio */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8.5" fill="#0a9d5c" />
            <circle cx="16" cy="13.2" r="5.1" fill="#f5c451" />
            <path
              d="M4.5 24.2C9 20.6 23 20.6 27.5 24.2"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ color: "#fff", fontSize: 30, fontWeight: 600 }}>
            Rivoglio
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span
              style={{
                color: "#fff",
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -2.5,
              }}
            >
              La tua fuga,
            </span>
            <span
              style={{
                color: "#7fe8ae",
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -2.5,
              }}
            >
              al prezzo giusto.
            </span>
            <span style={{ color: "#a7d9c2", fontSize: 27, marginTop: 26, lineHeight: 1.4 }}>
              Ti avviso quando esiste una fuga di due notti
              <br />
              sotto il tuo budget. Alloggio e auto, tutto compreso.
            </span>
          </div>

          {/* il conto vero */}
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
            <span style={{ fontSize: 19, color: "#0a9d5c", fontWeight: 600 }}>
              SOTTO LA TUA SOGLIA
            </span>
            <span style={{ fontSize: 34, fontWeight: 700, marginTop: 12, letterSpacing: -1 }}>
              {ESEMPIO.partenza} → {ESEMPIO.destinazione}
            </span>
            <span style={{ fontSize: 20, color: "#6b7280", marginTop: 6 }}>
              {ESEMPIO.notti} notti · in {ESEMPIO.persone} · {ESEMPIO.kmAndata} km
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
              <span>Alloggio</span>
              <span style={{ color: "#0a0a0a" }}>{euro(ESEMPIO.alloggioPersona)}</span>
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
              <span>Auto a testa</span>
              <span style={{ color: "#0a0a0a" }}>{euro(CONTO.autoPersona)}</span>
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
              <span style={{ fontSize: 22, fontWeight: 600 }}>Totale a testa</span>
              <span style={{ fontSize: 40, fontWeight: 700, color: "#0a9d5c" }}>
                {euro(CONTO.totalePersona)}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
