"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

/**
 * IL TRAGUARDO: quando la compagnia ha pagato.
 *
 * Sobrio e premium (scelta di Valerio col popup, 18/08: prima era un
 * trofeo coi coriandoli, «fa schifo, schermata piatta»). Niente festa da
 * cartone: al centro la cifra recuperata, grande, che sale contando. Un
 * sigillo pulito, e basta. La soddisfazione sta nel numero, non nei fuochi
 * d'artificio.
 *
 * ⚠️ Chi ha chiesto meno movimento (prefers-reduced-motion) vede subito la
 * cifra piena, senza il conteggio.
 */

/** Estrae l'intero dalla cifra già scritta ("1.200€" → 1200, "600€" → 600). */
function numeroDa(testo: string | null): number | null {
  if (!testo) return null;
  const cifre = testo.replace(/[^\d]/g, "");
  return cifre ? Number(cifre) : null;
}

export default function Traguardo({
  importoTesto,
  famiglia,
}: {
  /** Quanto ha recuperato, già scritto («600€»). null = non lo mostriamo. */
  importoTesto: string | null;
  famiglia: boolean;
}) {
  const totale = numeroDa(importoTesto);
  const [mostrato, setMostrato] = useState(0);
  const fatto = useRef(false);

  useEffect(() => {
    if (fatto.current || totale === null) return;
    fatto.current = true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setMostrato(totale);
      return;
    }
    const durata = 1200;
    let inizio: number | null = null;
    let raf = 0;
    const passo = (t: number) => {
      if (inizio === null) inizio = t;
      const q = Math.min(1, (t - inizio) / durata);
      // ease-out cubica: parte decisa, rallenta arrivando al numero.
      const e = 1 - Math.pow(1 - q, 3);
      setMostrato(Math.round(totale * e));
      if (q < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [totale]);

  return (
    <section className="rounded-2xl border border-verde/25 bg-gradient-to-b from-menta-tenue/70 to-white px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full border border-verde/30 bg-white text-verde shadow-[0_10px_24px_-12px_rgba(6,122,70,0.5)]">
        <Check className="size-6" aria-hidden="true" strokeWidth={2.5} />
      </span>
      <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-verde">
        La compagnia ha pagato
      </p>

      {totale !== null ? (
        <>
          <p
            className="numeri mt-3 font-display leading-none tracking-[-0.04em] text-verde-notte"
            style={{ fontSize: "clamp(3rem, 12vw, 4.75rem)" }}
            aria-label={`${importoTesto}${famiglia ? " a passeggero" : ""} recuperati`}
          >
            {mostrato.toLocaleString("it-IT")}
            <span className="text-verde">€</span>
          </p>
          <p className="mt-3 text-[1rem] leading-relaxed text-verde-notte/75">
            {famiglia ? "a passeggero, " : ""}sul tuo conto. Due clic tuoi, il resto l&apos;ho fatto
            io.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.03em] text-verde-notte sm:text-4xl">
            Ce l&apos;hai fatta.
          </h2>
          <p className="mt-3 text-[1rem] leading-relaxed text-verde-notte/75">
            La compagnia ha pagato. Due clic tuoi, il resto l&apos;ho fatto io.
          </p>
        </>
      )}
    </section>
  );
}
