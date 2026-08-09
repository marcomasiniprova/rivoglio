"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/**
 * La mano col telefono che SBUCA, invece di stare lì ferma.
 *
 * Cosa succede quando la cartolina entra in vista, in quest'ordine:
 * 1. un alone verde si apre da terra (0,15s): dà il palcoscenico;
 * 2. la mano sale dal basso ruotando appena e si posa (1,1s): è il
 *    movimento vero di una mano che entra nell'inquadratura, non uno
 *    scivolamento da robot;
 * 3. lo SCHERMO SI ACCENDE (0,9s dopo): un velo scuro se ne va mentre
 *    una lama di luce lo attraversa in diagonale. È il momento che fa
 *    sembrare l'immagine un video invece di una figura.
 *
 * Perché in codice e non un video: un video di questa scena pesa
 * qualche MB, su rete lenta arriva dopo tutto il resto e su iOS parte
 * solo se è muto e in linea. Qui il peso aggiunto è zero.
 *
 * La finestra dello schermo dentro la foto NON è indovinata: sono le
 * misure che `scripts/telefono-mockup.mjs` trova sui pixel, girate in
 * percentuale così restano giuste a qualsiasi dimensione.
 *   schermo: x 660/1952, y 36/1834, largo 704/1952, alto 1618/1834
 */
const SCHERMO = {
  left: "33.81%",
  top: "1.96%",
  width: "36.07%",
  height: "88.22%",
  borderRadius: "5.2%/2.3%",
} as const;

/** La curva del sito: parte decisa e si posa piano. */
const CURVA = [0.16, 1, 0.3, 1] as const;

export default function ManoRivelata({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  /* Chi ha chiesto meno animazioni nel sistema operativo vede la scena
     già montata: nessun movimento, stessa informazione. */
  const fermo = useReducedMotion();

  return (
    <motion.div
      className="relative flex items-end justify-center overflow-hidden pt-4 md:pt-8"
      initial="fermo"
      whileInView="vivo"
      viewport={{ once: true, amount: 0.35 }}
    >
      {/* 1. l'alone che si apre da terra */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[55%] w-[78%] -translate-x-1/2 rounded-[50%] bg-menta/45 blur-[46px]"
        variants={{
          fermo: { opacity: 0, scaleX: 0.55, scaleY: 0.3 },
          vivo: {
            opacity: fermo ? 0.55 : 1,
            scaleX: 1,
            scaleY: 1,
            transition: { duration: 1.1, ease: CURVA, delay: fermo ? 0 : 0.15 },
          },
        }}
      />

      {/* 2. la mano che entra nell'inquadratura */}
      <motion.div
        className="relative"
        variants={{
          fermo: fermo
            ? { opacity: 1, y: 0, rotate: 0 }
            : { opacity: 0, y: "34%", rotate: 3.5 },
          vivo: {
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: { duration: 1.15, ease: CURVA, delay: fermo ? 0 : 0.05 },
          },
        }}
        style={{ transformOrigin: "50% 100%" }}
      >
        <Image
          src={src}
          alt={alt}
          width={976}
          height={917}
          sizes="(min-width: 768px) 480px, 340px"
          priority={false}
          className="mb-[-2px] h-[320px] w-auto object-contain object-bottom sm:h-[380px] md:h-[440px]"
        />

        {/* 3. lo schermo che si accende: prima è spento… */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bg-verde-notte"
          style={SCHERMO}
          variants={{
            fermo: { opacity: fermo ? 0 : 0.72 },
            vivo: {
              opacity: 0,
              transition: { duration: 0.75, ease: "easeOut", delay: fermo ? 0 : 0.95 },
            },
          }}
        />

        {/* …e una lama di luce lo attraversa una volta sola */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute overflow-hidden"
          style={SCHERMO}
        >
          <motion.span
            className="absolute inset-y-[-30%] left-0 w-[65%] rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)]"
            variants={{
              fermo: { x: "-160%", opacity: 0 },
              vivo: fermo
                ? { x: "-160%", opacity: 0 }
                : {
                    x: "260%",
                    opacity: [0, 1, 1, 0],
                    transition: { duration: 1.15, ease: "easeInOut", delay: 1.0 },
                  },
            }}
          />
        </span>
      </motion.div>
    </motion.div>
  );
}
