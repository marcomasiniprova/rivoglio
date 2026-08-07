import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { esci } from "@/app/entra/azioni";
import { utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { COPY } from "@/lib/copy";

/**
 * La cornice della web app: marchio, uscita (o ingresso), in mezzo il check
 * e le pratiche. Dall'8/08 la pagina è APERTA anche a chi non è collegato
 * (decisione di Valerio): niente redirect, chi entra senza account trova
 * il check libero; l'elenco pratiche appare solo da collegati.
 */
export const metadata: Metadata = {
  title: "La web app | Rivoglio",
  robots: { index: false },
};

export default async function LayoutApp({ children }: LayoutProps<"/app">) {
  const utente = SUPABASE_CONFIGURATO ? await utenteCollegato() : null;

  return (
    <div className="flex min-h-dvh flex-col bg-nebbia">
      <header className="sticky top-0 z-40 border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Logo />
          {utente ? (
            <form action={esci}>
              <Button
                type="submit"
                variant="fantasma"
                size="sm"
                title={COPY.pratica.testata.esci}
              >
                <LogOut className="size-4" aria-hidden="true" />
                {COPY.pratica.testata.esci}
              </Button>
            </form>
          ) : (
            <Link
              href="/entra?poi=/app"
              className="text-[14px] font-medium text-verde transition-colors hover:text-verde-scuro"
            >
              {COPY.nav.entra}
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">{children}</main>

      <footer className="border-t border-bordo px-5 py-6 text-center text-xs text-fumo-2">
        {COPY.pratica.testata.piede}
      </footer>
    </div>
  );
}
