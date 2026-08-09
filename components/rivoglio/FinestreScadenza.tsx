"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * Quanto tempo hai ancora: le finestre di prescrizione, disegnate.
 *
 * Prima erano due riquadri bianchi con un numero grande a destra. Il
 * numero c'era, ma "2 anni" e "5-6 anni" restavano due etichette: non si
 * capiva quanto sono lunghi rispetto a oggi, né dove finisce quello che
 * il check copre adesso.
 *
 * Ora ogni riga ha la sua BARRA DEL TEMPO che si riempie entrando in
 * vista, tutte sulla stessa scala (0 → 6 anni): a colpo d'occhio si vede
 * che con un vettore estero la finestra è tre volte quella italiana. La
 * tacca a un anno è la profondità del nostro archivio, ed è marcata per
 * quello che è: quello che possiamo verificare oggi, non il diritto.
 *
 * Le finestre restano STIME dichiarate, come in COPY: qui cambia il
 * disegno, non la promessa.
 */

const S = COPY.retroattivo;
const CURVA = [0.16, 1, 0.3, 1] as const;
/** La scala comune di tutte le barre. Sei anni è la finestra più lunga. */
const SCALA_ANNI = 6;

function Barra({ anni, ritardo, parti }: { anni: number; ritardo: number; parti: boolean }) {
  const fermo = useReducedMotion();
  const quota = Math.min(1, anni / SCALA_ANNI);
  return (
    <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full bg-nebbia">
      <motion.span
        className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--color-verde),var(--color-menta))]"
        initial={false}
        animate={{ width: parti || fermo ? `${quota * 100}%` : "0%" }}
        transition={{ duration: fermo ? 0 : 1.05, ease: CURVA, delay: fermo ? 0 : ritardo }}
      />
      {/* la tacca del primo anno: fin lì arriva l'archivio, oggi */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 w-[2px] bg-white/90"
        style={{ left: `${(1 / SCALA_ANNI) * 100}%` }}
      />
    </div>
  );
}

export default function FinestreScadenza() {
  const zona = useRef<HTMLDivElement>(null);
  const dentro = useInView(zona, { once: true, amount: 0.3 });

  return (
    <div ref={zona} className="space-y-4">
      {S.finestre.map((f, i) => (
        <motion.div
          key={f.compagnie}
          initial={{ opacity: 0, y: 22 }}
          animate={dentro ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{ duration: 0.7, ease: CURVA, delay: i * 0.12 }}
          className="rounded-[1.5rem] bg-white p-6 shadow-[0_1px_2px_rgba(5,46,31,.06),0_12px_28px_-20px_rgba(5,46,31,.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(5,46,31,.07),0_28px_56px_-26px_rgba(5,46,31,.4)] sm:p-7"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[16px] font-medium leading-snug">{f.compagnie}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-fumo">{f.nota}</p>
            </div>
            <p className="numeri shrink-0 text-right font-display text-[clamp(1.7rem,3.4vw,2.3rem)] font-medium leading-none tracking-[-0.04em] text-verde">
              {f.finestra}
            </p>
          </div>

          <Barra anni={f.anniStimati} ritardo={0.2 + i * 0.15} parti={dentro} />

          <div className="mt-2 flex items-center justify-between text-[11.5px] text-fumo-2">
            <span>{S.scalaOggi}</span>
            <span className="numeri">{S.scalaFine}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
