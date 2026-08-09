"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * Il confronto coi portali a percentuale, fatto con le BANCONOTE.
 *
 * Prima era un riquadro con due righe di testo: giusto nei numeri e
 * invisibile agli occhi. La differenza fra "trattiene 210€" e "costa
 * 14,90€" è la cosa più importante che abbiamo da dire, e leggerla non
 * è come vederla.
 *
 * Come funziona la scena, quando entra in vista:
 * 12 banconote da 50€ fanno i 600€ della compensazione. Nella riga del
 * portale QUATTRO E MEZZA se ne volano via ruotando; nella nostra se ne
 * va un angolo di una sola. Poi il numero che resta sale contando.
 *
 * Le proporzioni non sono a occhio: 210/600 e 14,90/600 vengono da
 * COPY.prezzi.confronto, gli stessi numeri della riga di testo.
 *
 * Senza JavaScript, o con le animazioni ridotte nel sistema operativo,
 * si vede la scena già finita: stessa informazione, zero movimento.
 */

const C = COPY.prezzi.confronto;
/* SEI banconote da 100€ fanno i 600€. Con dodici da 50 ognuna diventava
   larga 25px sul telefono: a quella misura non si capiva più che erano
   soldi, sembravano tessere. Sei si leggono. */
const QUANTE = 6;
const CURVA = [0.16, 1, 0.3, 1] as const;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) +
  "€";

/** Una banconota: fascia, cifra e il tondo del ritratto. Niente foto. */
function Banconota({ via, nostra }: { via: boolean; nostra: boolean }) {
  return (
    <svg viewBox="0 0 40 22" className="h-full w-full" aria-hidden="true">
      <rect
        x="0.6"
        y="0.6"
        width="38.8"
        height="20.8"
        rx="2.4"
        className={
          via
            ? nostra
              ? "fill-verde/25 stroke-verde/50"
              : "fill-red-100 stroke-red-300"
            : "fill-menta-tenue stroke-verde/35"
        }
        strokeWidth="1"
      />
      <circle
        cx="11"
        cy="11"
        r="4.6"
        className={via && !nostra ? "fill-red-200/70" : "fill-verde/20"}
      />
      <text
        x="26.5"
        y="14.4"
        textAnchor="middle"
        className={via && !nostra ? "fill-red-400/80" : "fill-verde/55"}
        style={{ font: "600 9px ui-sans-serif, system-ui, sans-serif" }}
      >
        100€
      </text>
    </svg>
  );
}

/**
 * Il numero che sale contando.
 *
 * ATTENZIONE, e c'è un motivo se è scritto qui: il valore di partenza è
 * quello VERO, non zero. Prima partiva da zero e restava zero per chi non
 * scorreva fin qui: una prova ha beccato "0€ restano a te" nella pagina,
 * che è esattamente il tipo di numero sbagliato che questo sito non può
 * permettersi. Il conto parte solo quando la sezione entra in vista
 * DOPO essere stata fuori: chi ci atterra sopra vede subito la cifra
 * giusta, senza il tuffo a zero.
 */
function Contatore({ a, parti }: { a: number; parti: boolean }) {
  const fermo = useReducedMotion();
  const [n, setN] = useState(a);
  /* Se al primo giro la sezione era già davanti agli occhi, non si
     anima: si mostra e basta. */
  const eraGiaLì = useRef<boolean | null>(null);

  useEffect(() => {
    if (eraGiaLì.current === null) eraGiaLì.current = parti;
    if (!parti || fermo || eraGiaLì.current) return;
    let vivo = true;
    const durata = 900;
    const inizio = performance.now();
    setN(0);
    const passo = (ora: number) => {
      if (!vivo) return;
      const t = Math.min(1, (ora - inizio) / durata);
      /* stessa sensazione della curva del sito: parte veloce, si posa */
      setN(a * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(passo);
    };
    const id = requestAnimationFrame(passo);
    return () => {
      vivo = false;
      cancelAnimationFrame(id);
    };
  }, [a, parti, fermo]);

  return <>{euro(Math.round(n * 100) / 100)}</>;
}

function Riga({
  voce,
  nostra,
  parti,
  ritardo,
}: {
  voce: (typeof C.voci)[number];
  nostra: boolean;
  parti: boolean;
  ritardo: number;
}) {
  const fermo = useReducedMotion();
  /* Quante banconote se ne vanno: la quota vera, non un'idea. */
  const quoteVia = (voce.trattenuto / C.compensazione) * QUANTE;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        nostra ? "border-verde/35 bg-menta-tenue/70" : "border-bordo bg-nebbia"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[14px] font-semibold text-inchiostro">{voce.nome}</p>
        <p
          className={`text-[12.5px] font-medium ${nostra ? "text-verde-scuro" : "text-red-500"}`}
        >
          {voce.etichettaVia}
        </p>
      </div>

      {/* le dodici banconote: quelle che se ne vanno volano via */}
      <div className="mt-3 flex h-[34px] items-stretch gap-[5px] sm:h-[38px]">
        {Array.from({ length: QUANTE }, (_, i) => {
          /* Da noi se ne va MENO di una banconota: ne parte comunque una,
             ma rimpicciolita alla frazione vera. Senza, sulla nostra riga
             non si muoveva niente e il confronto perdeva il suo colpo. */
          const quante = nostra ? 1 : Math.round(quoteVia);
          const via = i >= QUANTE - quante;
          /* La frazione di banconota: il pezzetto che tocca a noi non è
             una nota intera, ed è giusto che si veda che è un angolo. */
          const frazione = !nostra ? 1 : quoteVia % 1;
          const parziale = nostra && via;
          return (
            <motion.span
              key={i}
              className="relative block h-full flex-1 origin-bottom"
              initial={false}
              animate={
                parti && via && !fermo
                  ? {
                      x: parziale ? 6 : 10 + (i % 3) * 8,
                      y: parziale ? -14 : -26 - (i % 3) * 7,
                      rotate: parziale ? 14 : 16 + (i % 4) * 7,
                      opacity: 0,
                      scale: parziale ? Math.max(0.25, frazione) : 0.9,
                    }
                  : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
              }
              transition={{
                duration: 0.85,
                ease: CURVA,
                delay: ritardo + (via ? 0.06 * (QUANTE - i) : 0),
              }}
            >
              <Banconota via={via} nostra={nostra} />
            </motion.span>
          );
        })}
      </div>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={`numeri font-display text-[26px] font-medium leading-none tracking-[-0.03em] sm:text-[30px] ${
            nostra ? "text-verde" : "text-inchiostro"
          }`}
        >
          <Contatore a={voce.restano} parti={parti} />
        </span>
        <span className="text-[12.5px] text-fumo">restano a te</span>
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-fumo">
        {nostra ? C.didascalia.nostro : C.didascalia.portale}
      </p>
    </div>
  );
}

export default function ConfrontoBanconote() {
  const zona = useRef<HTMLDivElement>(null);
  const dentro = useInView(zona, { once: true, amount: 0.4 });

  return (
    <div ref={zona}>
      <p className="text-center text-[12px] font-medium uppercase tracking-[0.18em] text-fumo-2">
        {C.base}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {C.voci.map((v, i) => (
          <Riga
            key={v.nome}
            voce={v}
            nostra={i === C.voci.length - 1}
            parti={dentro}
            ritardo={0.15 + i * 0.35}
          />
        ))}
      </div>
    </div>
  );
}
