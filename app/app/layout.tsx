import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { esci } from "@/app/entra/azioni";
import { utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { COPY } from "@/lib/copy";

/**
 * La cornice dell'area riservata: marchio, uscita, e in mezzo le pratiche.
 * Niente contatori: qui non c'è nulla da consumare, solo pratiche da seguire.
 */
export const metadata: Metadata = {
  title: "Le tue pratiche | Rivoglio",
  robots: { index: false },
};

export default async function LayoutApp({ children }: LayoutProps<"/app">) {
  // Il proxy già respinge chi non è collegato. Questo è il secondo
  // controllo: se un giorno il matcher cambia, l'area resta chiusa lo stesso.
  if (!SUPABASE_CONFIGURATO) redirect("/entra");
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  return (
    <div className="flex min-h-dvh flex-col bg-nebbia">
      <header className="sticky top-0 z-40 border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <form action={esci}>
            <Button type="submit" variant="fantasma" size="sm" title={COPY.pratica.testata.esci}>
              <LogOut className="size-4" aria-hidden="true" />
              {COPY.pratica.testata.esci}
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">{children}</main>

      <footer className="border-t border-bordo px-5 py-6 text-center text-xs text-fumo-2">
        {COPY.pratica.testata.piede}
      </footer>
    </div>
  );
}
