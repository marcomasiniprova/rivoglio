import type { Metadata } from "next";
import { Geist, Instrument_Serif, Poppins } from "next/font/google";
import "./globals.css";

// Geist per i titoli, Poppins per il testo.
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * La terza voce: un serif in corsivo, solo per la parola che deve restare
 * in testa. Serve a spezzare la riga del titolo con un cambio di carattere
 * invece che con un colore o un grassetto. È il trucco che fa sembrare
 * scritto a mano un titolo altrimenti da modello.
 * Si usa POCO: una frase per sezione al massimo, mai per un paragrafo.
 */
const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

/**
 * L'indirizzo di casa del sito. Serve a rendere assoluto il link
 * dell'immagine social: senza, Facebook e WhatsApp cercano l'anteprima su
 * localhost e non trovano niente.
 * Su Netlify arriva da sola in URL; in locale ripiega su localhost.
 */
const CASA = new URL(
  process.env.NEXT_PUBLIC_SITO ?? process.env.URL ?? "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase: CASA,
  title: "Viaggio Anche Io | La tua fuga, al prezzo giusto",
  description:
    "Imposti da dove parti e quanto vuoi spendere. Ricevi una notifica quando esiste una micro-vacanza di 1-3 notti sotto la tua soglia, col prezzo totale calcolato: alloggio e viaggio.",
  openGraph: {
    title: "Viaggio Anche Io",
    description:
      "40 milioni di italiani non partiranno ad agosto. Ricevi una notifica quando esiste una fuga di due notti sotto il tuo budget.",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geist.variable} ${poppins.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-nebbia text-inchiostro">{children}</body>
    </html>
  );
}
