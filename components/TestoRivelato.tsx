"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/**
 * Testo che si accende parola per parola mentre scorri.
 *
 * Meccanica presa dal componente Framer ScrollRevealText che ha indicato
 * Valerio: il testo si spezza in parole, ognuna ha una sua fetta di scroll,
 * e l'opacità va da 0,3 a 1 dentro quella fetta. Le parole non spariscono
 * mai del tutto (0,3 e non 0) altrimenti il blocco sembra rotto mentre
 * arriva, e chi legge con uno screen reader non se ne accorge comunque.
 *
 * Il testo resta un unico nodo leggibile per gli screen reader grazie a
 * aria-label sul contenitore e aria-hidden sulle singole parole.
 */
export default function TestoRivelato({
  testo,
  className = "",
}: {
  testo: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // parte quando l'elemento entra dal basso, finisce quando è a metà schermo
    offset: ["start 0.9", "start 0.35"],
  });

  const parole = testo.split(" ");

  return (
    <p ref={ref} className={className} aria-label={testo}>
      {parole.map((parola, i) => (
        <Parola
          key={i}
          progresso={scrollYProgress}
          da={i / parole.length}
          a={(i + 1) / parole.length}
        >
          {parola}
        </Parola>
      ))}
    </p>
  );
}

function Parola({
  children,
  progresso,
  da,
  a,
}: {
  children: string;
  progresso: MotionValue<number>;
  da: number;
  a: number;
}) {
  const opacity = useTransform(progresso, [da, a], [0.18, 1]);
  return (
    <motion.span aria-hidden="true" style={{ opacity }} className="inline-block">
      {children}
      {" "}
    </motion.span>
  );
}
