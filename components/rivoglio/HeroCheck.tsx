"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Anima } from "@/components/Anima";
import SfondoColonne from "@/components/SfondoColonne";
import SchedaCheck from "@/components/check/SchedaCheck";
import { COPY } from "@/lib/copy";

/**
 * L'hero di Rivoglio: il gancio, e dentro LA SCHEDA DEL CHECK, che dall'8/08
 * è lo standard unico di tutto il prodotto (components/check/SchedaCheck):
 * tratta predefinita, numero per chi lo sa, foto della carta d'imbarco, e
 * il teatro onesto coi sei passi veri e il biglietto che si compila.
 *
 * Qui restano solo le cose da hero: titolo con la luce, note apribili sui
 * numeri (ogni numero è apribile: la trasparenza è il prodotto), colonne
 * animate dietro, punti di fiducia sotto.
 */

const HERO = COPY.hero;
const CURVA = [0.16, 1, 0.3, 1] as const;

/** Spezza il titolo per dare il corsivo alla parte finale, senza duplicare il testo in COPY. */
function spezzaTitolo(titolo: string, taglio: string): [string, string] {
  const i = titolo.indexOf(taglio);
  if (i < 0) return [titolo, ""];
  return [titolo.slice(0, i).trimEnd(), titolo.slice(i)];
}

export default function HeroCheck() {
  const [titoloPrima, titoloCorsivo] = spezzaTitolo(HERO.titolo, "nell'ultimo");
  const [notaAperta, setNotaAperta] = useState<"importo" | "finestra" | null>(null);

  return (
    <section
      id="controllo"
      className="cielo relative -mt-[72px] overflow-hidden px-5 pb-16 pt-[124px] sm:-mt-[84px] sm:px-8 sm:pb-20 sm:pt-[164px]"
    >
      {/* Il bordo che pulsa: definito qui perché vive solo in questo campo.
          Solo opacity e transform, si ferma al focus e con reduced-motion. */}
      <style>{`
        .hc-pulsa { position: relative; }
        .hc-pulsa::before {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 1.9rem;
          border: 2px solid var(--color-verde);
          opacity: 0;
          pointer-events: none;
          animation: hc-pulsa 2.6s cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }
        .hc-pulsa:focus-within::before { animation: none; opacity: 0; }
        @keyframes hc-pulsa {
          0% { opacity: 0.55; transform: scale(0.995); }
          70% { opacity: 0; transform: scale(1.012); }
          100% { opacity: 0; transform: scale(1.012); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hc-pulsa::before { animation: none; opacity: 0.35; transform: none; }
        }
      `}</style>

      <SfondoColonne />
      <span className="alone" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl text-center">
        <Anima ritardo={0.04}>
          <span className="vetro inline-flex items-center gap-2 rounded-pillola px-4 py-1.5 text-[13px] font-medium text-inchiostro">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-verde" />
            {HERO.occhiello}
          </span>
        </Anima>

        <Anima ritardo={0.12}>
          <h1 className="luce-testo mt-6 text-[clamp(2.45rem,7.8vw,4.8rem)] leading-[0.98]">
            {titoloPrima}
            {titoloCorsivo && (
              <>
                <br />
                <span className="corsivo luce-corsivo text-verde-scuro">{titoloCorsivo}</span>
              </>
            )}
          </h1>
        </Anima>

        <Anima ritardo={0.2}>
          <p className="mx-auto mt-6 max-w-[32rem] text-[16px] leading-relaxed text-fumo sm:text-[17.5px]">
            {HERO.sottotitolo}
          </p>
          {/* Ogni numero è apribile: il 600€ e i 5 anni si spiegano qui. */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[14px]">
            {(
              [
                ["importo", HERO.apriImporto],
                ["finestra", HERO.apriFinestra],
              ] as const
            ).map(([chiave, testo]) => (
              <button
                key={chiave}
                type="button"
                aria-expanded={notaAperta === chiave}
                onClick={() => setNotaAperta(notaAperta === chiave ? null : chiave)}
                className={`rounded-pillola px-2 py-0.5 font-medium underline decoration-dotted underline-offset-4 transition-colors ${
                  notaAperta === chiave ? "text-verde-scuro" : "text-fumo hover:text-verde-scuro"
                }`}
              >
                {testo}
              </button>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {notaAperta && (
              <motion.div
                key={notaAperta}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: CURVA }}
                className="mx-auto mt-3 max-w-lg"
              >
                <p className="vetro rounded-2xl px-5 py-4 text-left text-[13.5px] leading-relaxed text-inchiostro/80">
                  {notaAperta === "importo" ? HERO.notaImporto : HERO.notaFinestra}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Anima>

        {/* LA SCHEDA DEL CHECK: il protagonista della pagina. */}
        <Anima ritardo={0.3}>
          <div className="hc-pulsa mx-auto mt-9 max-w-2xl">
            <div className="vetro rounded-[1.75rem] p-5 text-left sm:p-7">
              <SchedaCheck />
            </div>
          </div>
        </Anima>

        <Anima ritardo={0.4}>
          {/* I tre punti di fiducia: righe allineate a sinistra dentro una
              striscia di vetro, non più centrati "a piramide" (fix 8/08). */}
          <div className="vetro mx-auto mt-7 max-w-md rounded-2xl px-5 py-4 sm:max-w-3xl sm:rounded-pillola sm:px-7 sm:py-3.5">
            <ul className="flex flex-col gap-2.5 text-[13.5px] font-medium text-inchiostro/85 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              {HERO.puntiFiducia.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-left">
                  <svg viewBox="0 0 16 16" className="h-4.5 w-4.5 shrink-0" aria-hidden="true">
                    <circle cx="8" cy="8" r="7.2" fill="var(--color-menta)" />
                    <path
                      d="m5 8.2 2 2 4-4.2"
                      fill="none"
                      stroke="var(--color-verde-notte)"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Anima>
      </div>
    </section>
  );
}
