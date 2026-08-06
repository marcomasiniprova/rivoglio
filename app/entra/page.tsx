import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import ModuloEntra from "@/components/ModuloEntra";
import { CONTO, ESEMPIO, euro } from "@/lib/esempio";

export const metadata: Metadata = {
  title: "Entra | Viaggio Anche Io",
  description: "Entra nel tuo account e imposta le tue ricerche.",
  robots: { index: false },
};

export default async function PaginaEntra({ searchParams }: PageProps<"/entra">) {
  const p = await searchParams;
  const grezzo = typeof p.poi === "string" ? p.poi : "/app";
  const poi = grezzo.startsWith("/") && !grezzo.startsWith("//") ? grezzo : "/app";
  const modo = p.modo === "registrati" ? "registrati" : "accedi";
  const errore = typeof p.errore === "string" ? p.errore : null;

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* ---------- sinistra: il modulo ---------- */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-fumo transition-colors hover:text-inchiostro"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Torna al sito
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-14">
          <ModuloEntra modoIniziale={modo} poi={poi} errore={errore} />
        </div>

        <p className="text-center text-xs leading-relaxed text-fumo-2">
          Entrando accetti che ti scriviamo solo per gli alert che hai chiesto tu.
          Niente pubblicità, niente liste vendute a nessuno.
        </p>
      </div>

      {/* ---------- destra: cosa ci fai dentro ----------
          Non è decorazione: è l'esempio vero preso da lib/esempio.ts, gli
          stessi numeri della landing. Se cambiano lì, cambiano anche qui. */}
      <aside className="relative hidden overflow-hidden bg-verde-notte lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(90% 60% at 20% 0%, rgba(127,232,174,0.22) 0%, transparent 62%)",
          }}
        />
        <div className="relative">
          <p className="text-[0.8rem] font-medium uppercase tracking-[0.18em] text-menta">
            Cosa ricevi
          </p>
          <h2 className="mt-5 max-w-md font-display text-[2.6rem] leading-[1.05] tracking-[-0.04em] text-white">
            Una notifica sola, quando il conto torna davvero.
          </h2>

          <div className="mt-10 max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-verde">
              <span className="size-1.5 rounded-full bg-verde" />
              Sotto la tua soglia
            </div>
            <p className="mt-3 font-display text-xl tracking-[-0.03em]">
              {ESEMPIO.partenza} → {ESEMPIO.destinazione}
            </p>
            <p className="mt-1 text-sm text-fumo">
              {ESEMPIO.notti} notti · {ESEMPIO.persone} persone · {ESEMPIO.kmAndata} km
            </p>

            <dl className="mt-5 flex flex-col gap-2 border-t border-bordo pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-fumo">Alloggio a testa</dt>
                <dd className="font-medium">{euro(ESEMPIO.alloggioPersona)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fumo">Auto a testa</dt>
                <dd className="font-medium">{euro(CONTO.autoPersona)}</dd>
              </div>
              <div className="flex justify-between border-t border-bordo pt-2">
                <dt className="font-medium">Totale a testa</dt>
                <dd className="font-display text-lg text-verde">{euro(CONTO.totalePersona)}</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-xl bg-menta-tenue px-3 py-2 text-center text-xs text-verde-notte">
              Sotto la tua soglia di {euro(ESEMPIO.soglia)}. Ti restano{" "}
              {euro(CONTO.avanzo)}.
            </p>
          </div>

          <p className="mt-8 max-w-sm text-sm leading-relaxed text-menta/80">
            Ogni numero è apribile: ti mostriamo km, consumo, pedaggi e da dove
            arriva il prezzo del carburante. La trasparenza è il prodotto.
          </p>
        </div>
      </aside>
    </main>
  );
}
