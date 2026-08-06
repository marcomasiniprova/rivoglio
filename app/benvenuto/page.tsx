import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import Onboarding from "@/components/Onboarding";
import { PARTENZE } from "@/lib/costruttore";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iniziamo | Viaggio Anche Io",
  robots: { index: false },
};

export default async function PaginaBenvenuto() {
  if (!SUPABASE_CONFIGURATO) redirect("/entra");
  const utente = await utenteCollegato();
  if (!utente) redirect("/entra");

  // Chi ha già finito l'onboarding non lo rifà.
  const supabase = await supabaseServer();
  const { data: profilo } = await supabase
    .from("profili")
    .select("comune")
    .eq("id", utente.id)
    .single();
  if (profilo?.comune) redirect("/app");

  return (
    /* Il logo sta NEL flusso, non sopra: in posizione assoluta finiva
       esattamente sopra la barra di avanzamento. */
    <div className="flex min-h-dvh flex-col bg-nebbia">
      <div className="flex justify-center pt-8">
        <Logo />
      </div>
      <Onboarding citta={PARTENZE.filter((p) => !p.isola).map((p) => p.nome)} />
    </div>
  );
}
