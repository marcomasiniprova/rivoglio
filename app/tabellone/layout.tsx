import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Masthead from "@/components/tabellone/Masthead";

/**
 * Il guscio del Tabellone. La classe `tabellone` accende il fondo carta
 * su tutta la pagina (vedi globals.css: `body:has(.tabellone)`), così
 * oltre il fondo della pagina non ricompare il grigio del sito.
 *
 * Il piede è quello del sito, non uno suo: il blog è una stanza di
 * Rivolio, non un altro indirizzo.
 */
export default function LayoutTabellone({ children }: { children: ReactNode }) {
  return (
    <div className="tabellone flex min-h-screen flex-col">
      <Masthead />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
