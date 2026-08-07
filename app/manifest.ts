import type { MetadataRoute } from "next";

/**
 * Rende il sito installabile sulla schermata Home.
 *
 * Non è una formalità: su iPhone le notifiche web arrivano SOLO se l'utente
 * ha aggiunto il sito alla Home. È anche il motivo per cui il canale
 * principale degli alert è Telegram e non la notifica del browser.
 *
 * `display: standalone` = si apre a schermo pieno, senza barra del browser.
 * A quel punto sul telefono è indistinguibile da un'app scaricata.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rivoglio",
    short_name: "Viaggio",
    description:
      "Ti avviso quando esiste una micro-vacanza sotto il tuo budget, col prezzo totale: alloggio e viaggio.",
    lang: "it-IT",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f8fa",
    theme_color: "#0a9d5c",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/icona.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
