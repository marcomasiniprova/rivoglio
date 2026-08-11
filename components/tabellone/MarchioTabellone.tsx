"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marchio } from "@/components/Logo";
import { NOME_BLOG, RADICE } from "@/lib/tabellone/indice";

/**
 * IL MARCHIO DELLA TESTATA, CLICCABILE (richiesta di Valerio, 11/08).
 *
 * Due comportamenti, e la differenza conta:
 * - da un ARTICOLO porta all'elenco del Tabellone, come prima;
 * - dall'ELENCO, dove il link porterebbe alla pagina in cui sei già,
 *   riporta in cima **scorrendo**, invece di ricaricare la pagina.
 *
 * Perché non basta `href="#"` o lo scroll del browser: il sito ha lo
 * scorrimento pesante (giro #52), che non muove la pagina ma alimenta un
 * obiettivo con inerzia. Un salto secco stonerebbe con tutto il resto.
 * Qui si usa `scrollTo({behavior:"smooth"})`, che è la stessa cosa che
 * fa lo scorrimento pesante quando arriva in fondo.
 *
 * ⚠️ Chi ha chiesto meno animazioni al sistema operativo riceve il salto
 * secco: per quelle persone lo scorrimento morbido è un fastidio, non
 * una rifinitura.
 */
export default function MarchioTabellone() {
  const dove = usePathname();
  const inCima = dove === RADICE || dove === `${RADICE}/`;

  return (
    <Link
      href={RADICE}
      onClick={(e) => {
        if (!inCima) return;
        e.preventDefault();
        const brusco = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: brusco ? "auto" : "smooth" });
      }}
      aria-label={inCima ? "Torna in cima al Tabellone" : "Vai al Tabellone"}
      className="group flex shrink-0 items-center gap-2.5"
    >
      <Marchio className="h-8 w-8 shrink-0 transition-transform duration-500 group-hover:-rotate-6" />
      {/* Sotto i 360 punti resta il solo segno: col ritorno "Al sito"
          aggiunto l'11/08 il nome per esteso spingeva la testata fuori
          dallo schermo e il blog scorreva di lato (preso da una prova).
          Il segno da solo resta cliccabile e resta riconoscibile. */}
      <span className="hidden font-display text-[17px] font-semibold leading-none tracking-[-0.03em] text-verde-notte min-[360px]:inline sm:text-[18.5px]">
        Rivolio <span className="corsivo font-normal text-verde-scuro">{NOME_BLOG}</span>
      </span>
    </Link>
  );
}
