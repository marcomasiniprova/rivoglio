"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * Il confronto coi portali: banconote da 100€ PULITE, disegnate da noi.
 *
 * Perché disegnate e non fotografate: OGNI immagine legale di una banconota
 * (le riproduzioni ufficiali BCE, quelle su Wikimedia) porta stampato
 * "SPECIMEN" di traverso e la firma del governatore, per legge. Una foto
 * "pulita" di una banconota vera non esiste. Quindi la 100€ qui è ricostruita
 * a mano in SVG con la sua palette verde, l'arco, le stelle UE e la striscia
 * olografica: pulita per costruzione, nostra, e a video piccola si legge
 * come una banconota vera senza la sporcizia del timbro.
 *
 * La scena: sei banconote a ventaglio fanno i 600€. Prima il ventaglio si
 * APRE (le carte scivolano in posizione una dopo l'altra); poi, dal portale,
 * DUE prendono la rincorsa (un cenno in giù, poi via in alto ruotando); da
 * Rivolio si stacca solo un angolino. Il numero sale contando. Le proporzioni
 * escono dai numeri della riga di testo (trattenuto/600), mai a occhio.
 *
 * Con le animazioni ridotte si vede la scena già finita. Il contatore parte
 * SEMPRE dal valore vero: mai "0€ restano a te" per chi non scorre.
 */

const C = COPY.prezzi.confronto;
const QUANTE = 6;
const CURVA = [0.16, 1, 0.3, 1] as const;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) +
  "€";

/** La 100€ pulita, disegnata: verde euro, arco, stelle, striscia olografica. */
function NotaEuro({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ne-carta" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#eef5df" />
          <stop offset="1" stopColor="#d3e4ac" />
        </linearGradient>
        <linearGradient id="ne-olo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e6b0" />
          <stop offset="0.5" stopColor="#e9f0d2" />
          <stop offset="1" stopColor="#d9e7bd" />
        </linearGradient>
      </defs>

      {/* carta */}
      <rect width="180" height="100" rx="8" fill="url(#ne-carta)" />
      {/* cornice interna */}
      <rect x="4.5" y="4.5" width="171" height="91" rx="6" fill="none" stroke="#7cab52" strokeWidth="1.3" opacity="0.55" />
      {/* guilloche: righe tenui */}
      <g stroke="#8fb668" strokeWidth="0.5" opacity="0.2">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1="12" x2="168" y1={30 + i * 8} y2={30 + i * 8} />
        ))}
      </g>
      {/* striscia olografica */}
      <rect x="126" y="9" width="15" height="82" rx="3" fill="url(#ne-olo)" opacity="0.9" />
      <circle cx="133.5" cy="68" r="6.5" fill="#cbab4d" opacity="0.45" />
      {/* arco: il motivo architettonico della serie */}
      <g stroke="#5f9440" strokeWidth="1.2" fill="none" opacity="0.5">
        <path d="M148 82 V46 a9 9 0 0 1 18 0 V82" />
        <line x1="157" y1="46" x2="157" y2="82" />
      </g>
      {/* bandiera UE */}
      <rect x="12" y="12" width="20" height="13" rx="2" fill="#0a3aa8" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <circle key={i} cx={+(22 + Math.sin(a) * 4.4).toFixed(2)} cy={+(18.5 - Math.cos(a) * 4.4).toFixed(2)} r="0.85" fill="#ffcc00" />
        );
      })}
      {/* le cifre e le sigle */}
      <text x="40" y="20" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="6" letterSpacing="0.8" fill="#6fa24f">
        BCE ECB EZB
      </text>
      <text x="122" y="35" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="30" fill="#4c8236">
        100
      </text>
      <text x="13" y="90" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="25" fill="#4c8236">
        100
      </text>
      <text x="55" y="88" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="2" fill="#5f9440">
        EURO
      </text>
    </svg>
  );
}

function Contatore({ a, parti }: { a: number; parti: boolean }) {
  const fermo = useReducedMotion();
  const [n, setN] = useState(a);
  const eraGiaLì = useRef<boolean | null>(null);

  useEffect(() => {
    if (eraGiaLì.current === null) eraGiaLì.current = parti;
    if (!parti || fermo || eraGiaLì.current) return;
    let vivo = true;
    const durata = 1400;
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

/** Il ventaglio di banconote. `via` = quante se ne volano dal portale. */
function Ventaglio({
  via,
  parziale,
  parti,
  ritardo,
}: {
  via: number;
  /** Vero quando se ne va solo un angolino (Rivolio), non banconote intere. */
  parziale: boolean;
  parti: boolean;
  ritardo: number;
}) {
  const fermo = useReducedMotion();
  /* Due tempi: prima il ventaglio si apre, POI le banconote volano via.
     Il volo aspetta che le carte siano in posizione, così si legge la scena. */
  const [vola, setVola] = useState(false);
  useEffect(() => {
    if (!parti || fermo) return;
    const id = setTimeout(() => setVola(true), 950 + ritardo * 1000);
    return () => clearTimeout(id);
  }, [parti, fermo, ritardo]);

  return (
    <div className="relative mx-auto h-[96px] w-[210px] sm:h-[108px] sm:w-[240px]">
      {Array.from({ length: QUANTE }, (_, i) => {
        const inVolo = !parziale && i >= QUANTE - via;
        /* posizione a ventaglio: ognuna ruotata e spostata un filo */
        const base = { rotate: -9 + i * 3.6, x: i * 14, y: Math.abs(i - 2.5) * 2.2 };
        const flyX = base.x + 52 + (i % 2) * 30;
        const flyY = base.y - 78 - (i % 3) * 16;
        const flyR = base.rotate + 34 + (i % 2) * 18;

        let animate: TargetAndTransition;
        let transition: Transition;
        if (fermo) {
          animate = inVolo ? { opacity: 0 } : { ...base, opacity: 1, scale: 1 };
          transition = { duration: 0 };
        } else if (!parti) {
          animate = { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.9 };
          transition = { duration: 0.3 };
        } else if (inVolo && vola) {
          /* la rincorsa: un cenno in giù (anticipazione), poi via in alto */
          animate = {
            x: [base.x, base.x - 4, flyX],
            y: [base.y, base.y + 8, flyY],
            rotate: [base.rotate, base.rotate - 5, flyR],
            opacity: [1, 1, 0],
            scale: 1,
          };
          transition = { duration: 1.5, ease: CURVA, times: [0, 0.16, 1], delay: 0.04 * (i - (QUANTE - via)) };
        } else {
          /* il ventaglio si apre: ogni carta scivola in posizione */
          animate = { ...base, opacity: 1, scale: 1 };
          transition = { duration: 0.7, ease: CURVA, delay: ritardo + 0.1 + i * 0.09 };
        }

        return (
          <motion.div
            key={i}
            className="absolute left-2 top-3 w-[128px] drop-shadow-[0_3px_8px_rgba(5,46,31,0.22)] sm:w-[146px]"
            style={{ zIndex: i, transformOrigin: "24% 92%" }}
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.9 }}
            animate={animate}
            transition={transition}
          >
            <NotaEuro className="h-auto w-full" />
          </motion.div>
        );
      })}

      {/* l'angolino che si stacca da Rivolio: la quota vera, 14,90 su 600 */}
      {parziale && (
        <motion.span
          aria-hidden="true"
          className="absolute right-[10px] top-[8px] z-20 h-[30px] w-[40px] overflow-hidden rounded-[4px] shadow-[0_2px_8px_rgba(5,46,31,0.3)]"
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={
            fermo
              ? { opacity: 0 }
              : !parti
                ? { opacity: 0 }
                : vola
                  ? { x: [0, -3, 40], y: [0, 5, -40], rotate: [0, -4, 40], opacity: [1, 1, 0] }
                  : { opacity: 1, x: 0, y: 0, rotate: 0 }
          }
          transition={
            vola
              ? { duration: 1.4, ease: CURVA, times: [0, 0.16, 1] }
              : { duration: 0.6, ease: CURVA, delay: ritardo + 0.2 }
          }
        >
          <NotaEuro className="h-auto w-[128px] max-w-none -translate-x-[90px] -translate-y-[2px]" />
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
