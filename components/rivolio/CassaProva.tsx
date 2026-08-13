"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { RITORNO_DALLA_CASSA } from "@/lib/check/ripresa";

/**
 * LA CASSA DI PROVA: quello che si vede.
 *
 * Ricalca l'IMPIANTO di una cassa vera, perché è quello che serve
 * provare: il riepilogo di cosa compri a sinistra, il totale e il
 * bottone a destra, la riga sulla sicurezza in fondo. È l'ordine con cui
 * lavorano Polar, Stripe e chiunque altro, e vederlo montato dice se il
 * percorso funziona.
 *
 * ⚠️ QUELLO CHE NON C'È, E NON CI SARÀ: nessun campo per la carta.
 * Un modulo che chiede numero, scadenza e codice, anche se non manda
 * niente da nessuna parte, è indistinguibile da una truffa per chi ci
 * finisce sopra per caso, e questa pagina sta su un sito pubblico. La
 * somiglianza che serve è il PERCORSO (muro, cassa, ricevuta, analisi
 * sbloccata), non la finta raccolta di dati di pagamento.
 *
 * Il bollo che dice cos'è resta, più piccolo di prima ma sempre sopra
 * il totale, cioè nel punto che si guarda per forza.
 */
/**
 * DUE PRODOTTI, UNA CASSA SOLA (richiesta di Valerio, 12/08: «anche
 * quando paga i 14,90 per la pratica, SEMPRE checkout finto: il muro c'è
 * sempre anche se finto per adesso»).
 *
 * Aveva ragione, e non è una pignoleria: prima il pagamento della pratica
 * saltava ogni schermata e la pratica si apriva da sola, quindi il
 * passaggio che nel prodotto vero decide se incassi o no non lo vedeva
 * nessuno. Un percorso che si prova saltando il pezzo dei soldi non è
 * provato.
 */
type Cosa = {
  /** "analisi" o "pratica": cambia il riepilogo e dove si va dopo. */
  chiave: "analisi" | "pratica";
  titolo: string;
  sotto: string;
  voci: string[];
  rigaTotale: string;
  vale: string;
  dopo: string;
};

export default function CassaProva({
  prezzoTesto,
  cosa,
  verifica,
  tipo,
}: {
  prezzoTesto: string;
  cosa: Cosa;
  /** Solo per la pratica: su quale verifica si apre. */
  verifica?: string;
  tipo?: "singola" | "famiglia";
}) {
  const router = useRouter();
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function paga() {
    setErrore(null);
    setInCorso(true);
    try {
      if (cosa.chiave === "pratica") {
        /* La pratica la apre la stessa rotta che userebbe il webhook del
           venditore: quello che vedi è il percorso vero, non una copia. */
        window.location.assign(
          `/api/pratiche/prova?verifica=${encodeURIComponent(verifica ?? "")}&tipo=${tipo ?? "singola"}`,
        );
        return;
      }
      const r = await fetch("/api/check/prova", { method: "POST" });
      const dati = await r.json().catch(() => null);
      if (!r.ok || !dati?.ok) {
        setErrore(typeof dati?.errore === "string" ? dati.errore : "Non ha funzionato.");
        setInCorso(false);
        return;
      }
      /* Torna al check con la ricevuta già nel cookie E col segno che fa
         ripartire l'analisi sul volo di prima: senza, si tornava su un
         modulo vuoto subito dopo aver pagato (vedi lib/check/ripresa.ts).
         ⚠️ Il venditore vero dovrà riportare indietro sullo STESSO
         indirizzo, se no il difetto rinasce il giorno dell'incasso. */
      router.push(RITORNO_DALLA_CASSA);
      router.refresh();
    } catch {
      setErrore("Non ha funzionato. Riprova.");
      setInCorso(false);
    }
  }

  return (
    <main className="min-h-dvh bg-nebbia px-5 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex justify-center sm:mb-9">
          <Logo />
        </div>

        <div className="overflow-hidden rounded-3xl border border-bordo bg-white shadow-[0_20px_60px_-35px_rgba(5,46,31,.4)]">
          <div className="grid md:grid-cols-[1.05fr_1fr]">
            {/* ── COSA STAI COMPRANDO ─────────────────────────────── */}
            <div className="border-b border-bordo p-6 sm:p-8 md:border-b-0 md:border-r">
              <p className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-fumo-2">
                Riepilogo
              </p>

              <h1 className="mt-4 font-display text-[1.75rem] leading-[1.15] tracking-[-0.03em] sm:text-[2rem]">
                {cosa.titolo}
              </h1>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">{cosa.sotto}</p>

              <ul className="mt-6 space-y-3">
                {cosa.voci.map((v) => (
                  <li key={v} className="flex gap-2.5 text-[14px] leading-relaxed text-fumo">
                    <Check className="mt-0.5 size-4 shrink-0 text-verde" aria-hidden="true" />
                    {v}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-baseline justify-between border-t border-bordo pt-5">
                <span className="text-[0.95rem] text-fumo">{cosa.rigaTotale}</span>
                <span className="text-[0.95rem] text-inchiostro">{prezzoTesto}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-[0.95rem] text-fumo">Vale</span>
                <span className="text-[0.95rem] text-inchiostro">{cosa.vale}</span>
              </div>
            </div>

            {/* ── IL PAGAMENTO ────────────────────────────────────── */}
            <div className="flex flex-col p-6 sm:p-8">
              {/* Il bollo sta QUI, sopra il totale: è il punto che si
                  guarda per forza prima di premere. */}
              <p className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-sole px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-inchiostro">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Modalità di prova
              </p>

              <div className="mt-5 flex items-baseline justify-between border-y border-bordo py-5">
                <span className="text-[0.95rem] font-medium text-inchiostro">Totale</span>
                <span className="font-display text-[2.2rem] leading-none tracking-[-0.03em]">
                  {prezzoTesto}
                </span>
              </div>

              <p className="mt-5 text-[13.5px] leading-relaxed text-fumo">
                Questa pagina serve a provare il percorso, non a incassare.
                <strong className="font-medium text-inchiostro">
                  {" "}
                  Non ti viene chiesta nessuna carta e non si muove nessun euro.
                </strong>{" "}
                Premendo il bottone ricevi la stessa ricevuta che riceverai
                pagando davvero, e l&apos;analisi si sblocca.
              </p>

              {errore && (
                <p /* text-errore non esiste fra i colori: la riga usciva del colore
                     del testo intorno, cioe' rossa solo nelle intenzioni. */
                  className="mt-5 text-[14px] text-red-600" role="alert">
                  {errore}
                </p>
              )}

              <div className="mt-auto pt-7">
                <Button
                  onClick={() => void paga()}
                  disabled={inCorso}
                  className="h-13 w-full rounded-bottone text-[15px]"
                >
                  <Lock className="size-4" aria-hidden="true" />
                  {inCorso ? "Un attimo." : `Paga ${prezzoTesto}`}
                </Button>

                <p className="mt-3 text-center text-[12.5px] leading-relaxed text-fumo-2">
                  {cosa.dopo}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-[12px] leading-relaxed text-fumo-2">
          Rivolio non è un intermediario: la compagnia paga te, direttamente, e
          la somma arriva intera.
        </p>
      </div>
    </main>
  );
}
