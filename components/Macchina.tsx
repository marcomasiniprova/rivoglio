"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Effetto macchina da scrivere: scrive una frase, la cancella, passa alla
 * successiva. Meccanica dal componente Framer TypewriterEffect indicato da
 * Valerio (setInterval + slice, scrittura e cancellazione, cursore lampeggiante).
 *
 * Accessibilità: il testo che cambia in continuazione è illeggibile per uno
 * screen reader, quindi la parte animata è aria-hidden e c'è un testo fisso
 * per chi non vede. Chi ha chiesto meno animazioni vede la prima frase e basta.
 */
export default function Macchina({
  frasi,
  velocita = 55,
  velocitaCancella = 28,
  pausa = 1700,
  className = "",
}: {
  frasi: string[];
  velocita?: number;
  velocitaCancella?: number;
  pausa?: number;
  className?: string;
}) {
  const [testo, setTesto] = useState("");
  const [indice, setIndice] = useState(0);
  const [cancella, setCancella] = useState(false);
  const fermo = useRef(false);

  useEffect(() => {
    fermo.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Il setState va rimandato: sincrono dentro un effect fa partire
    // render a catena, e in React 19 ESLint lo blocca.
    if (!fermo.current) return;
    const t = setTimeout(() => setTesto(frasi[0]), 0);
    return () => clearTimeout(t);
  }, [frasi]);

  useEffect(() => {
    if (fermo.current) return;

    const attuale = frasi[indice % frasi.length];

    // finita la scrittura: aspetta, poi comincia a cancellare
    if (!cancella && testo === attuale) {
      const t = setTimeout(() => setCancella(true), pausa);
      return () => clearTimeout(t);
    }

    // finita la cancellazione: piccola pausa e poi la frase dopo.
    // La pausa serve anche a non aggiornare lo stato in modo sincrono.
    if (cancella && testo === "") {
      const t = setTimeout(() => {
        setCancella(false);
        setIndice((i) => i + 1);
      }, 220);
      return () => clearTimeout(t);
    }

    const t = setTimeout(
      () =>
        setTesto((v) =>
          cancella ? attuale.slice(0, v.length - 1) : attuale.slice(0, v.length + 1),
        ),
      cancella ? velocitaCancella : velocita,
    );
    return () => clearTimeout(t);
  }, [testo, cancella, indice, frasi, velocita, velocitaCancella, pausa]);

  return (
    <span className={className}>
      <span className="sr-only">{frasi.join(", ")}</span>
      <span aria-hidden="true">
        {testo}
        <span className="ml-0.5 inline-block w-[2px] animate-[lampeggia_1s_steps(2)_infinite] self-stretch bg-verde align-middle">
          &nbsp;
        </span>
      </span>
    </span>
  );
}
