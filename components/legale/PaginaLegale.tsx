import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

/**
 * La cornice delle pagine legali (privacy, condizioni, cookie): testata
 * leggera, colonna di lettura, footer. I testi sono la PRIMA BOZZA
 * operativa dell'8/08: funzionano e coprono l'essenziale, la revisione
 * legale professionale è segnata in ARRETRATI (la chiede anche il
 * documento di Valerio).
 */
export default function PaginaLegale({
  titolo,
  aggiornata,
  children,
}: {
  titolo: string;
  aggiornata: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-nebbia">
      <header className="border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-fumo transition-colors hover:text-inchiostro"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Torna alla home
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="font-display text-[2rem] leading-[1.05] tracking-[-0.04em] sm:text-[2.4rem]">
          {titolo}
        </h1>
        <p className="numeri mt-3 text-[13.5px] text-fumo-2">
          Versione 1, aggiornata il {aggiornata}.
        </p>
        <div className="legale mt-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
