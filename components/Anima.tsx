"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Lo strato di movimento del sito.
 *
 * Regole che tengono il tutto coerente (non improvvisare per sezione):
 * - Una curva sola: [0.16, 1, 0.3, 1]. È quella che dà il "morbido" ai siti
 *   fatti bene: parte veloce e si posa piano.
 * - Si entra SEMPRE dal basso, mai da destra o sinistra: gli ingressi laterali
 *   fanno ballare la pagina in orizzontale sul telefono.
 * - `once: true`: l'animazione parte una volta. Se si ripete a ogni scroll
 *   diventa fastidiosa dopo trenta secondi.
 * - `amount: 0.2`: parte quando è entrato un quinto dell'elemento, non quando
 *   è tutto dentro. Altrimenti l'utente vede la roba comparire in ritardo.
 * - Chi ha chiesto meno animazioni nel sistema operativo non ne vede nessuna
 *   (`prefers-reduced-motion`, gestito da Motion in automatico).
 */
const CURVA = [0.16, 1, 0.3, 1] as const;

export const salita: Variants = {
  fermo: { opacity: 0, y: 26 },
  vivo: { opacity: 1, y: 0, transition: { duration: 0.7, ease: CURVA } },
};

/** Un blocco che sale entrando in vista. */
export function Anima({
  children,
  ritardo = 0,
  className,
}: {
  children: ReactNode;
  ritardo?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: CURVA, delay: ritardo }}
    >
      {children}
    </motion.div>
  );
}

/** Contenitore che fa entrare i figli uno dopo l'altro. Usa <Figlio> dentro. */
export function AnimaLista({
  children,
  className,
  passo = 0.09,
}: {
  children: ReactNode;
  className?: string;
  passo?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="fermo"
      whileInView="vivo"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ vivo: { transition: { staggerChildren: passo } } }}
    >
      {children}
    </motion.div>
  );
}

export function Figlio({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={salita} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Numero che sale da zero quando entra in vista.
 * Formattato all'italiana (virgola decimale). Parte una volta sola.
 */
export function Contatore({
  a,
  decimali = 0,
  prefisso = "",
  suffisso = "",
  durata = 1600,
}: {
  a: number;
  decimali?: number;
  prefisso?: string;
  suffisso?: string;
  durata?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inVista = useInView(ref, { once: true, amount: 0.5 });
  const [valore, setValore] = useState(0);

  useEffect(() => {
    if (!inVista) return;

    let frame = 0;

    // Chi ha chiesto meno animazioni vede subito il numero finale.
    // Va comunque passato da requestAnimationFrame: un setState sincrono
    // dentro l'effect fa partire render a catena (lo segnala ESLint).
    const fermi = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fermi) {
      frame = requestAnimationFrame(() => setValore(a));
      return () => cancelAnimationFrame(frame);
    }

    const inizio = performance.now();
    const avanza = (ora: number) => {
      const t = Math.min((ora - inizio) / durata, 1);
      // stessa curva del resto del sito: parte veloce, si posa piano
      setValore(a * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(avanza);
    };
    frame = requestAnimationFrame(avanza);
    return () => cancelAnimationFrame(frame);
  }, [inVista, a, durata]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefisso}
      {valore.toLocaleString("it-IT", {
        minimumFractionDigits: decimali,
        maximumFractionDigits: decimali,
      })}
      {suffisso}
    </span>
  );
}

/** Card che si solleva al passaggio del mouse. */
export function CardViva({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={salita}
      whileHover={{ y: -5, transition: { duration: 0.25, ease: "easeOut" } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
