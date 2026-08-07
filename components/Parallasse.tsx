"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Parallasse: il contenuto si muove più piano dello scroll.
 *
 * È l'effetto che fa sembrare una fotografia "dentro" la pagina invece che
 * appiccicata sopra. Il figlio è più alto del contenitore (-inset-y-12),
 * così durante la corsa non si scoprono mai i bordi.
 * Solo `transform`: niente ridisegni, va liscio anche sul telefono.
 */
export default function Parallasse({
  children,
  className,
  forza = 46,
}: {
  children: ReactNode;
  className?: string;
  forza?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-forza, forza]);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <motion.div style={{ y }} className="absolute -inset-y-14 inset-x-0">
        {children}
      </motion.div>
    </div>
  );
}
