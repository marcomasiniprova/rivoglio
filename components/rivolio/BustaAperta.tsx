"use client";

import { motion } from "motion/react";

/**
 * La busta che si apre e lascia uscire la lettera.
 *
 * Serve al riquadro "cercala nella tua posta": un riquadro con dentro
 * del testo resta un riquadro con dentro del testo, per quanto sia
 * scritto bene. Un oggetto che si muove lo guardi.
 *
 * Il rilievo è quello dei monumenti dell'Osservatorio, stessa lingua:
 * faccia in luce piena, fianco al 40%, e le pieghe scavate nel colore
 * del fondo. Niente immagini da scaricare: sono una ventina di forme.
 *
 * L'ordine conta: prima si alza l'aletta, POI esce la lettera. Al
 * contrario sembrerebbe che la carta attraversi la busta.
 */

const CURVA = [0.16, 1, 0.3, 1] as const;

export default function BustaAperta({
  aperta,
  className,
}: {
  aperta: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* l'alone: il palcoscenico dell'oggetto */}
      <motion.span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-menta/50 blur-[26px]"
        initial={false}
        animate={{ opacity: aperta ? 1 : 0.35, scale: aperta ? 1 : 0.75 }}
        transition={{ duration: 0.9, ease: CURVA }}
      />

      <svg viewBox="0 0 96 72" className="relative h-full w-full" aria-hidden="true">
        {/* l'ombra a terra */}
        <ellipse cx="48" cy="66.5" rx="30" ry="3.4" className="fill-verde-scuro/15" />

        {/* LA LETTERA: sta dietro il corpo della busta e sale */}
        <motion.g
          initial={false}
          animate={aperta ? { y: -22, opacity: 1 } : { y: 8, opacity: 0 }}
          transition={{ duration: 0.75, ease: CURVA, delay: aperta ? 0.28 : 0 }}
        >
          <rect x="24" y="16" width="48" height="34" rx="3" className="fill-white" />
          <rect x="24" y="16" width="48" height="34" rx="3" className="fill-none stroke-verde/25" strokeWidth="1.2" />
          <rect x="30" y="23" width="24" height="3.2" rx="1.6" className="fill-verde/70" />
          <rect x="30" y="30" width="36" height="2.6" rx="1.3" className="fill-fumo-2/45" />
          <rect x="30" y="36" width="30" height="2.6" rx="1.3" className="fill-fumo-2/45" />
          <rect x="30" y="42" width="18" height="2.6" rx="1.3" className="fill-fumo-2/45" />
        </motion.g>

        {/* IL CORPO della busta: davanti alla lettera */}
        <path d="M14 30h68a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V34a4 4 0 0 1 4-4Z" className="fill-verde" />
        {/* la piega inferiore, la V che fa riconoscere una busta */}
        <path d="M10 62 48 42l38 20v2a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2Z" className="fill-verde-scuro" />
        <path d="M10 34 48 54l38-20v-1.5a2.5 2.5 0 0 0-2.5-2.5h-71A2.5 2.5 0 0 0 10 32.5Z" className="fill-verde/55" />

        {/* L'ALETTA: chiusa copre la bocca, aperta si ribalta all'indietro */}
        <motion.path
          d="M10 32.5A2.5 2.5 0 0 1 12.5 30h71a2.5 2.5 0 0 1 2.5 2.5L48 54Z"
          className="fill-verde-scuro"
          style={{ transformOrigin: "48px 30px" }}
          initial={false}
          animate={{ scaleY: aperta ? -0.72 : 1, opacity: aperta ? 0.85 : 1 }}
          transition={{ duration: 0.5, ease: CURVA }}
        />
      </svg>
    </div>
  );
}
