import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";

// Gli stessi caratteri di Zentivo: Geist per i titoli, Poppins per il testo.
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viaggio Anche Io — la tua fuga, al prezzo giusto",
  description:
    "Dimmi da dove parti e quanto vuoi spendere. Ti avviso io quando c'è una micro-vacanza di 1-3 notti sotto la tua soglia, col prezzo totale: alloggio più viaggio.",
  openGraph: {
    title: "Viaggio Anche Io",
    description:
      "40 milioni di italiani non partiranno ad agosto. Tu sì. Ti avviso quando c'è una fuga di due notti sotto il tuo budget.",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geist.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-nebbia text-inchiostro">{children}</body>
    </html>
  );
}
