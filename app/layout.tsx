import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viaggio Anche Io — due notti sotto il tuo budget",
  description:
    "Dimmi da dove parti e quanto vuoi spendere. Ti avviso io quando c'è una micro-vacanza di 1-3 notti sotto la tua soglia, con il prezzo totale: alloggio più viaggio.",
  openGraph: {
    title: "Viaggio Anche Io",
    description:
      "40 milioni di italiani non partiranno ad agosto. Tu sì. Ti avviso io quando c'è una fuga di due notti sotto il tuo budget.",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${fraunces.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sabbia text-inchiostro">
        {children}
      </body>
    </html>
  );
}
