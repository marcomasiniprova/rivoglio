"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * Quanto tempo hai ancora: la finestra di prescrizione VOLATA, non scritta.
 *
 * Ogni compagnia ha la sua card con un cielo: un aereo in rilievo decolla
 * da "oggi" e vola lungo la rotta tratteggiata fino a dove arriva la sua
 * finestra (2 anni, o 5-6). La scia se la lascia dietro e la bandierina
 * dice il paese della legge che comanda (Italia / Unione Europea).
 *
 * L'aereo è NOSTRO, disegnato col rilievo dei monumenti (faccia in luce,
 * fianco in ombra): i loghi delle compagnie sono marchi registrati e un
 * logo rifatto male è peggio di niente (deciso con Valerio, 9/08).
 */

const S = COPY.retroattivo;
const CURVA = [0.16, 1, 0.3, 1] as const;
const SCALA_ANNI = 6;

/** L'aereo in rilievo, muso a destra. Vola lui, non un'icona qualsiasi. */
function Aereo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      {/* fusoliera */}
      <path
        d="M4 22c14-4 34-5 47-4 4.4.4 8 1.8 9 3.4-1 1.6-4.6 3-9 3.4-13 1-33 0-47-4Z"
        className="fill-verde"
      />
      {/* la pancia in ombra */}
      <path
        d="M4 22c14 2.6 34 3.6 47 2.6 4.4-.3 8-1 9-1.2-1 1.6-4.6 3-9 3.4-13 1-33 0-47-4Z"
        className="fill-verde-scuro"
      />
      {/* la coda */}
      <path d="M10 21.5 2 8h5.5l9 12.6Z" className="fill-verde-scuro" />
      {/* l'ala, verso chi guarda */}
      <path d="M28 21 20 34h6.5l9.5-12.4Z" className="fill-verde-scuro" />
      {/* i finestrini */}
      <g className="fill-white/85">
        <circle cx="40" cy="20" r="1.3" />
        <circle cx="45" cy="20" r="1.3" />
        <circle cx="50" cy="20" r="1.3" />
      </g>
      {/* il muso vetrato */}
      <path d="M56.5 19.2c1.8.3 3 .8 3.5 1.4-.5.6-1.7 1.1-3.5 1.4Z" className="fill-menta" />
    </svg>
  );
}

/** La bandierina del paese della legge: Italia o Unione Europea. */
function Bandiera({ paese }: { paese: "it" | "eu" }) {
  if (paese === "it") {
    return (
      <svg viewBox="0 0 24 16" className="h-3 w-[18px] overflow-hidden rounded-[2px]" aria-hidden="true">
        <rect width="8" height="16" fill="#009246" />
        <rect x="8" width="8" height="16" fill="#ffffff" />
        <rect x="16" width="8" height="16" fill="#ce2b37" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 16" className="h-3 w-[18px] overflow-hidden rounded-[2px]" aria-hidden="true">
      <rect width="24" height="16" fill="#003399" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        /* coordinate arrotondate: senza, il server e il browser stampano
           l'ultima cifra decimale in modo diverso e React segnala un
           "hydration mismatch" (il pallino 1 Issue del dev server). */
        return (
          <circle key={i} cx={+(12 + Math.sin(a) * 5).toFixed(2)} cy={+(8 - Math.cos(a) * 5).toFixed(2)} r="0.8" fill="#FFCC00" />
        );
      })}
    </svg>
  );
}

function Card({
  f,
  i,
  dentro,
}: {
  f: (typeof S.finestre)[number];
  i: number;
  dentro: boolean;
}) {
  const fermo = useReducedMotion();
  const quota = Math.min(1, f.anniStimati / SCALA_ANNI);
  const vola = dentro || fermo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={dentro ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.7, ease: CURVA, delay: i * 0.12 }}
      className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_1px_2px_rgba(5,46,31,.06),0_12px_28px_-20px_rgba(5,46,31,.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(5,46,31,.07),0_28px_56px_-26px_rgba(5,46,31,.4)]"
    >
      <div className="flex items-start justify-between gap-6 px-6 pt-6 sm:px-7">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[16px] font-medium leading-snug">
            <Bandiera paese={f.paese} />
            {f.compagnie}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fumo">{f.nota}</p>
        </div>
        <p className="numeri shrink-0 text-right font-display text-[clamp(1.7rem,3.4vw,2.3rem)] font-medium leading-none tracking-[-0.04em] text-verde">
          {f.finestra}
        </p>
      </div>

      {/* IL CIELO: la striscia dove vola l'aereo. Sfuma verso l'alto e
          la rotta è tratteggiata; l'aereo si ferma dove scade la finestra. */}
      <div className="relative mx-6 mb-5 mt-4 h-[64px] overflow-hidden rounded-xl bg-[linear-gradient(180deg,var(--color-menta-tenue),#ffffff_78%)] sm:mx-7">
        {/* la rotta completa, tenue */}
        <div className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-verde/20" />
        {/* la scia: si allunga fin dove arriva la finestra */}
        <motion.div
          className="absolute left-4 top-1/2 border-t-2 border-dashed border-verde"
          style={{ right: undefined }}
          initial={false}
          animate={{ width: vola ? `calc((100% - 32px) * ${quota})` : "0%" }}
          transition={{ duration: fermo ? 0 : 1.3, ease: CURVA, delay: fermo ? 0 : 0.25 + i * 0.15 }}
        />
        {/* l'aereo che vola fino alla fine della finestra */}
        <motion.div
          className="absolute top-1/2 -mt-[14px] -ml-[46px]"
          initial={false}
          animate={{ left: vola ? `calc(16px + (100% - 32px) * ${quota})` : "16px" }}
          transition={{ duration: fermo ? 0 : 1.3, ease: CURVA, delay: fermo ? 0 : 0.25 + i * 0.15 }}
        >
          <Aereo className="h-[28px] w-[46px] drop-shadow-[0_3px_4px_rgba(5,46,31,.25)]" />
        </motion.div>
      </div>

      <div className="flex items-center justify-between px-6 pb-5 text-[11.5px] text-fumo-2 sm:px-7">
        <span>{S.scalaOggi}</span>
        <span className="numeri">{S.scalaFine}</span>
      </div>
    </motion.div>
  );
}

export default function FinestreScadenza() {
  const zona = useRef<HTMLDivElement>(null);
  const dentro = useInView(zona, { once: true, amount: 0.3 });

  return (
    <div ref={zona} className="space-y-4">
      {S.finestre.map((f, i) => (
        <Card key={f.compagnie} f={f} i={i} dentro={dentro} />
      ))}
    </div>
  );
}
