import { ImageResponse } from "next/og";

/** Icona quadrata generata: serve al manifest per la schermata Home. */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icona() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a9d5c",
        }}
      >
        {/* stesse tre forme del marchio, ingrandite */}
        <svg width="512" height="512" viewBox="0 0 32 32">
          <circle cx="16" cy="13.2" r="5.1" fill="#f5c451" />
          <path
            d="M4.5 24.2C9 20.6 23 20.6 27.5 24.2"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M12.4 21.9h3.1M18 22.3h3"
            stroke="#0a9d5c"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
