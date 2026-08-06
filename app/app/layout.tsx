import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Coins, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { esci } from "@/app/entra/azioni";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";

export const metadata: Metadata = {
  title: "La tua area | Viaggio Anche Io",
  robots: { index: false },
};

export default async function LayoutApp({ children }: LayoutProps<"/app">) {
  // Il middleware già respinge chi non è collegato. Questo è il secondo
  // controllo: se un giorno il matcher cambia, l'area resta chiusa lo stesso.
  if (!SUPABASE_CONFIGURATO) redirect("/entra");
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  const supabase = await supabaseServer();
  const { data: profilo } = await supabase
    .from("profili")
    .select("crediti")
    .eq("id", utente.id)
    .single();

  const crediti = profilo?.crediti ?? 0;

  return (
    <div className="flex min-h-dvh flex-col bg-nebbia">
      <header className="sticky top-0 z-40 border-b border-bordo bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-pillola bg-menta-tenue px-3 py-1.5 text-sm font-medium text-verde-notte"
              title="1 credito = 1 alert ricevuto"
            >
              <Coins className="size-4 text-verde" aria-hidden="true" />
              {crediti}
              <span className="hidden sm:inline">{crediti === 1 ? "credito" : "crediti"}</span>
            </span>

            <form action={esci}>
              <Button type="submit" variant="fantasma" size="icona" title="Esci">
                <LogOut className="size-4" aria-hidden="true" />
                <span className="sr-only">Esci</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 sm:py-14">{children}</main>

      <footer className="border-t border-bordo px-5 py-6 text-center text-xs text-fumo-2">
        Viaggio Anche Io · un credito si consuma solo quando ricevi un alert
      </footer>
    </div>
  );
}
