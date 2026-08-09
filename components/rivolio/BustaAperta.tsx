"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * La busta email, resa come un asset 3D (stile "render matte") invece che
 * come un disegnino piatto.
 *
 * Il riferimento di Valerio era una busta 3D lucida col bollo della
 * chiocciola; lui l'ha voluta nei VERDI del marchio, non blu. Non è un file
 * scaricato (i render 3D belli hanno licenze, e qui la macchina di rendering
 * non è disponibile): è costruita in SVG dando a ogni faccia una sfumatura
 * che finge la luce (chiaro in alto, scuro in basso), un'ombra morbida a
 * terra e i bordi arrotondati. A schermo, piccola, legge come un oggetto 3D.
 *
 * `aperta`: quando la ricerca trova la mail, la lettera SALE e il bollo con
 * la chiocciola compare con un piccolo rimbalzo. Prima galleggia appena, come
 * un oggetto in scena.
 */

const CURVA = [0.16, 1, 0.3, 1] as const;

export default function BustaAperta({
  aperta,
  className,
}: {
  aperta: boolean;
  className?: string;
}) {
  const fermo = useReducedMotion();

  return (
    <div className={`relative ${className ?? ""}`}>
      <motion.div
        className="h-full w-full"
        initial={false}
        animate={fermo ? {} : { y: [0, -4, 0] }}
        transition={fermo ? undefined : { duration: 4.6, ease: "easeInOut", repeat: Infinity }}
      >
        <svg viewBox="0 0 160 150" className="h-full w-full" aria-hidden="true">
          <defs>
            {/* le facce: chiaro in alto, scuro in basso = luce dall'alto */}
            <linearGradient id="ba-retro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#12a862" />
              <stop offset="1" stopColor="#067a47" />
            </linearGradient>
            <linearGradient id="ba-fronte" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#41c084" />
              <stop offset="1" stopColor="#0a9d5c" />
            </linearGradient>
            <linearGradient id="ba-lettera" x1="0" y1="0" x2="0.15" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#eaf3e4" />
            </linearGradient>
            <linearGradient id="ba-bollo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#15b56e" />
              <stop offset="1" stopColor="#0a8f52" />
            </linearGradient>
            <radialGradient id="ba-alone" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#63e6a8" stopOpacity="0.55" />
              <stop offset="1" stopColor="#63e6a8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* l'alone morbido dietro: il palcoscenico dell'oggetto */}
          <motion.ellipse
            cx="80"
            cy="74"
            rx="60"
            ry="52"
            fill="url(#ba-alone)"
            initial={false}
            animate={{ opacity: aperta ? 1 : 0.45 }}
            transition={{ duration: 0.8, ease: CURVA }}
          />
          {/* l'ombra a terra */}
          <ellipse cx="80" cy="138" rx="52" ry="7" fill="#052e1f" opacity="0.16" />

          {/* l'aletta aperta dietro la lettera: dà il "è aperta" */}
          <path d="M32 92 80 34 128 92Z" fill="url(#ba-retro)" opacity="0.65" />

          {/* LA LETTERA che sale, col bollo */}
          <motion.g
            initial={false}
            animate={fermo ? { y: aperta ? -6 : 4 } : { y: aperta ? -6 : 6 }}
            transition={{ duration: 0.75, ease: CURVA, delay: aperta ? 0.15 : 0 }}
          >
            <rect x="47" y="24" width="66" height="82" rx="7" fill="url(#ba-lettera)" />
            <rect x="47" y="24" width="66" height="82" rx="7" fill="none" stroke="#0a9d5c" strokeOpacity="0.14" strokeWidth="1" />
            {/* righe di testo accennate */}
            <g fill="#cfe3d4">
              <rect x="56" y="36" width="32" height="4" rx="2" />
              <rect x="56" y="46" width="48" height="3.4" rx="1.7" />
              <rect x="56" y="54" width="40" height="3.4" rx="1.7" />
            </g>
            {/* il bollo con la chiocciola */}
            <motion.g
              initial={false}
              animate={{ scale: aperta ? 1 : 0, opacity: aperta ? 1 : 0 }}
              transition={{ duration: 0.5, ease: CURVA, delay: aperta ? 0.4 : 0 }}
              style={{ transformOrigin: "80px 78px" }}
            >
              <circle cx="80" cy="78" r="19" fill="#eafff3" />
              <circle cx="80" cy="78" r="15.5" fill="url(#ba-bollo)" />
              <text
                x="80"
                y="85"
                textAnchor="middle"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="700"
                fontSize="20"
                fill="#eafff3"
              >
                @
              </text>
            </motion.g>
          </motion.g>

          {/* la tasca davanti: la parete frontale con la piega centrale */}
          <path d="M24 96 80 118 136 96 136 120a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8Z" fill="url(#ba-fronte)" />
          {/* i due lembi laterali, un filo più scuri per la profondità */}
          <path d="M24 96 80 118 24 120Z" fill="#0a8f52" />
          <path d="M136 96 80 118 136 120Z" fill="#0a8f52" />
          {/* il taglio superiore della tasca, luce */}
          <path d="M24 96 80 118 136 96" fill="none" stroke="#5fce97" strokeWidth="1.4" strokeLinejoin="round" opacity="0.7" />
        </svg>
      </motion.div>
    </div>
  );
}
