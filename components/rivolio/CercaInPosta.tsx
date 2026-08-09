"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY } from "@/lib/copy";
import BustaAperta from "./BustaAperta";

/**
 * "Non ricordi numero e data? Cercali nella tua posta."
 *
 * Prima era un riquadro verde con dentro una frase. La frase era giusta
 * ma nessuno la eseguiva: leggere "cerca conferma volo" e vedere qualcuno
 * che la cerca sono due cose diverse. Qui la scena si fa da sola: la
 * lente scrive nella casella, e la mail salta fuori con numero e data
 * evidenziati. In tre secondi l'utente ha capito cosa deve fare.
 *
 * È una FINZIONE DICHIARATA: il riquadro porta l'etichetta "esempio" e i
 * dati dentro sono quelli del segnaposto del sito (FR 8321), non un volo
 * vero preso da qualche parte.
 */

const S = COPY.retroattivo.posta;
const CURVA = [0.16, 1, 0.3, 1] as const;

export default function CercaInPosta() {
  const zona = useRef<HTMLDivElement>(null);
  const dentro = useInView(zona, { once: true, amount: 0.5 });
  const fermo = useReducedMotion();
  const [lettere, setLettere] = useState(0);
  /* Con le animazioni ridotte la parola è già lì: si decide in render,
     non con un setState dentro l'effetto. */
  const scritto = fermo ? S.ricerca : S.ricerca.slice(0, lettere);

  /* La ricerca si scrive da sola, una lettera alla volta. */
  useEffect(() => {
    if (!dentro || fermo) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setLettere(i);
      if (i >= S.ricerca.length) clearInterval(id);
    }, 85);
    return () => clearInterval(id);
  }, [dentro, fermo]);

  const trovata = scritto.length >= S.ricerca.length;

  return (
    <div
      ref={zona}
      className="overflow-hidden rounded-2xl border border-verde/20 bg-white shadow-[0_18px_44px_-32px_rgba(5,46,31,.35)]"
    >
      {/* la testata della finta casella */}
      <div className="flex items-center gap-2 border-b border-bordo/70 bg-nebbia px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          {/* i semafori veri di una finestra: grigi sembravano spenti */}
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </span>
        <p className="ml-1 truncate text-[11.5px] font-medium text-fumo-2">{S.casella}</p>
        <span className="ml-auto shrink-0 whitespace-nowrap rounded-pillola bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-fumo-2">
          {S.esempio}
        </span>
      </div>

      <div className="relative p-4 sm:p-5">
        {/* LA SCENA: la busta che si apre quando la ricerca trova. È lei
            a trasformare un riquadro di testo in una cosa che si guarda. */}
        <div className="pointer-events-none mx-auto mb-1 h-[86px] w-[118px] sm:h-[96px] sm:w-[132px]">
          <BustaAperta aperta={trovata} className="h-full w-full" />
        </div>

        {/* il campo di ricerca che si scrive da solo */}
        <div className="flex items-center gap-2.5 rounded-xl border border-bordo bg-nebbia px-3.5 py-2.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="var(--color-verde)" strokeWidth="1.9" />
            <path d="m15.4 15.4 4.1 4.1" stroke="var(--color-verde)" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          <p className="text-[14.5px] text-inchiostro">
            {scritto}
            {!trovata && (
              <motion.span
                aria-hidden="true"
                className="ml-px inline-block h-[15px] w-[1.5px] translate-y-[2px] bg-verde"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            )}
          </p>
        </div>

        {/* il risultato: appare quando la ricerca è finita */}
        <motion.div
          initial={false}
          animate={trovata ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.55, ease: CURVA }}
          className="mt-3 rounded-xl border border-verde/25 bg-menta-tenue/70 p-3.5"
        >
          <div className="flex items-center gap-2.5">
            {/* l'avatar del mittente, come in una casella vera */}
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-verde text-[11px] font-bold text-white"
            >
              ✈
            </span>
            <p className="text-[13px] font-semibold text-inchiostro">{S.mittente}</p>
            <span className="ml-auto text-[11px] text-fumo-2">12:38</span>
          </div>
          <p className="mt-1.5 text-[13.5px] leading-snug text-fumo">
            {S.oggettoPrima}
            <mark className="rounded bg-verde/25 px-1 font-semibold text-inchiostro">
              {S.numero}
            </mark>
            {S.oggettoMezzo}
            <mark className="rounded bg-verde/25 px-1 font-semibold text-inchiostro">
              {S.data}
            </mark>
          </p>
        </motion.div>

        <p className="mt-3 text-[13px] leading-relaxed text-fumo">{S.spiegazione}</p>
      </div>
    </div>
  );
}
