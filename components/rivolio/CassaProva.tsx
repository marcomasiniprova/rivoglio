"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

/**
 * LA CASSA DI PROVA: quello che si vede.
 *
 * Ricalca una cassa vera nell'ordine delle cose (cosa compri, quanto
 * costa, un bottone solo), ma **non chiede una carta e non incassa
 * niente**, e lo dice con un bollo giallo che non si può non vedere.
 *
 * Perché è fatta così e non "realistica": una cassa finta che sembra
 * vera è il tipo di cosa che poi finisce online per sbaglio. Qui
 * l'unica somiglianza utile è il PERCORSO (muro → cassa → ricevuta →
 * check sbloccato), che è quello che c'è da provare.
 */
export default function CassaProva({ prezzoTesto }: { prezzoTesto: string }) {
  const router = useRouter();
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function paga() {
    setErrore(null);
    setInCorso(true);
    try {
      /* Niente parola segreta nella richiesta: chi arriva fin qui ha già
         la chiave nel cookie, e il server guarda quella. */
      const r = await fetch("/api/check/prova", { method: "POST" });
      const dati = await r.json().catch(() => null);
      if (!r.ok || !dati?.ok) {
        setErrore(typeof dati?.errore === "string" ? dati.errore : "Non ha funzionato.");
        setInCorso(false);
        return;
      }
      /* Torna al check con la ricevuta già nel cookie: da lì l'analisi
         parte come se avesse pagato davvero. */
      router.push("/#controllo");
      router.refresh();
    } catch {
      setErrore("Non ha funzionato. Riprova.");
      setInCorso(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-nebbia px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-3xl border border-bordo bg-white p-6 shadow-[0_18px_50px_-30px_rgba(5,46,31,.35)] sm:p-8">
          <p className="inline-flex rounded-lg bg-sole px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-inchiostro">
            Cassa di prova · non si paga niente
          </p>

          <h1 className="mt-5 font-display text-[1.9rem] leading-[1.1] tracking-[-0.03em]">
            L&apos;analisi del tuo volo
          </h1>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-fumo">
            Questa pagina serve a provare il percorso, non a incassare. Nessuna
            carta viene chiesta e nessun euro si muove: premendo il bottone
            ricevi la stessa ricevuta che riceverai pagando davvero.
          </p>

          <div className="mt-6 flex items-baseline justify-between border-y border-bordo py-4">
            <span className="text-[0.95rem] text-fumo">Totale</span>
            <span className="font-display text-[2rem] leading-none tracking-[-0.03em]">
              {prezzoTesto}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {[
              "Una analisi completa del volo che scegli",
              "Se il verdetto esce incerto, il credito resta",
              "Vale trenta giorni",
            ].map((v) => (
              <li key={v} className="flex gap-2.5 text-[14px] leading-relaxed text-fumo">
                <Check className="mt-0.5 size-4 shrink-0 text-verde" aria-hidden="true" />
                {v}
              </li>
            ))}
          </ul>

          {errore && (
            <p className="mt-5 text-[14px] text-errore" role="alert">
              {errore}
            </p>
          )}

          <Button
            onClick={() => void paga()}
            disabled={inCorso}
            className="mt-7 h-12 w-full rounded-bottone text-[15px]"
          >
            <CreditCard className="size-4" aria-hidden="true" />
            {inCorso ? "Un attimo." : "Fai finta di pagare"}
          </Button>

          <p className="mt-3 text-center text-[12.5px] leading-relaxed text-fumo-2">
            Poi torni al check e l&apos;analisi parte da sola.
          </p>
        </div>
      </div>
    </main>
  );
}
