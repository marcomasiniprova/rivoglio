"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * Il confronto coi portali: BANCONOTE VERE, non disegnini.
 *
 * La 100€ è la riproduzione ufficiale da Wikimedia Commons
 * (`/assets/banconota-100.webp`, 460px: dimensione da anteprima, entro le
 * regole BCE sulle riproduzioni). Richiesta esplicita di Valerio (9/08):
 * un elemento visivo REALE, non codificato.
 *
 * La scena: sei banconote vere a ventaglio fanno i 600€. Dal portale DUE
 * volano via con rotazione e caduta; da Rivolio si stacca solo un
 * angolino (il 2,5%). Poi il numero sale contando. Le proporzioni escono
 * dagli stessi numeri della riga di testo (210/600 e 14,90/600), mai a
 * occhio.
 *
 * Con le animazioni ridotte si vede la scena già finita. Il contatore
 * parte SEMPRE dal valore vero: mai "0€ restano a te" per chi non scorre.
 */

const C = COPY.prezzi.confronto;
const QUANTE = 6;
const CURVA = [0.16, 1, 0.3, 1] as const;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) +
  "€";

function Contatore({ a, parti }: { a: number; parti: boolean }) {
  const fermo = useReducedMotion();
  const [n, setN] = useState(a);
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

/** Il ventaglio di banconote vere. `via` = quante se ne volano. */
function Ventaglio({
  via,
  parziale,
  parti,
  ritardo,
}: {
  via: number;
  /** Vero quando se ne va solo un angolino, non una banconota intera. */
  parziale: boolean;
  parti: boolean;
  ritardo: number;
}) {
  const fermo = useReducedMotion();
  return (
    <div className="relative mx-auto h-[92px] w-[210px] sm:h-[104px] sm:w-[240px]">
      {Array.from({ length: QUANTE }, (_, i) => {
        const vola = !parziale && i >= QUANTE - via;
        /* il ventaglio: ognuna ruotata e spostata un filo */
        const base = {
          rotate: -9 + i * 3.6,
          x: i * 14,
          y: Math.abs(i - 2.5) * 2.2,
        };
        return (
          <motion.div
            key={i}
            className="absolute left-2 top-3 w-[128px] overflow-hidden rounded-[4px] shadow-[0_2px_10px_rgba(5,46,31,.22)] sm:w-[146px]"
            style={{ zIndex: i, transformOrigin: "20% 90%" }}
            initial={false}
            animate={
              parti && vola && !fermo
                ? {
                    ...base,
                    x: base.x + 46 + (i % 2) * 26,
                    y: base.y - 64 - (i % 3) * 14,
                    rotate: base.rotate + 32 + (i % 2) * 16,
                    opacity: 0,
                  }
                : { ...base, opacity: vola && (fermo || parti) ? 0 : 1 }
            }
            transition={{ duration: 0.95, ease: CURVA, delay: ritardo + (vola ? 0.08 * i : 0) }}
          >
            <Image
              src="/assets/banconota-100.webp"
              alt=""
              width={460}
              height={257}
              sizes="146px"
              className="h-auto w-full"
            />
          </motion.div>
        );
      })}

      {/* l'angolino che si stacca da Rivolio: la quota vera, 14,90 su 600 */}
      {parziale && (
        <motion.span
          aria-hidden="true"
          className="absolute right-[8px] top-[6px] z-20 h-[26px] w-[34px] overflow-hidden rounded-[3px] shadow-[0_2px_8px_rgba(5,46,31,.3)]"
          initial={false}
          animate={
            parti && !fermo
              ? { x: 34, y: -34, rotate: 38, opacity: 0 }
              : { x: 0, y: 0, rotate: 0, opacity: parti || fermo ? 0 : 1 }
          }
          transition={{ duration: 0.9, ease: CURVA, delay: ritardo + 0.15 }}
        >
          <Image
            src="/assets/banconota-100.webp"
            alt=""
            width={460}
            height={257}
            sizes="120px"
            className="h-auto w-[120px] max-w-none -translate-x-[86px] -translate-y-[2px]"
          />
        </motion.span>
      )}
    </div>
  );
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
  const quanteVia = Math.round((voce.trattenuto / C.compensazione) * QUANTE);
  return (
    <div
      className={`rounded-2xl border p-4 text-center sm:p-5 ${
        nostra ? "border-verde/40 bg-menta-tenue/70" : "border-bordo bg-nebbia"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-left">
        <p className="text-[14px] font-semibold text-inchiostro">{voce.nome}</p>
        <p className={`text-[12.5px] font-medium ${nostra ? "text-verde-scuro" : "text-red-500"}`}>
          {voce.etichettaVia}
        </p>
      </div>

      <div className="mt-4">
        <Ventaglio via={quanteVia} parziale={nostra} parti={parti} ritardo={ritardo} />
      </div>

      <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
        <span
          className={`numeri font-display text-[28px] font-medium leading-none tracking-[-0.03em] sm:text-[32px] ${
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
            ritardo={0.15 + i * 0.3}
          />
        ))}
      </div>
    </div>
  );
}
