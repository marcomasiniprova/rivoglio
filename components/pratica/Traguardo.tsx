"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

/**
 * IL TRAGUARDO: la festa quando la compagnia ha pagato (Valerio, 16/08:
 * «quando dichiara pagato fallo divertente, effetto wow, festa, una
 * milestone obiettivo completato»).
 *
 * È il picco emotivo di tutto il prodotto: la persona ha recuperato dei
 * soldi che le spettavano, con due clic. Qui NON serve altro sulla pagina
 * (via garanzia, fascicolo, «come mai»): serve solo far sentire la
 * vittoria.
 *
 * ⚠️ La festa rispetta chi ha chiesto meno animazioni (prefers-reduced-
 * motion): niente coriandoli, resta il traguardo fermo. E i coriandoli
 * durano un attimo e spariscono: non ballano in eterno sotto gli occhi.
 */

const COLORI = ["#067A46", "#0FA968", "#F4C64B", "#7CD9A6", "#052E1F"];

type Pezzo = {
  sinistra: number;
  ritardo: number;
  durata: number;
  colore: string;
  ruota: number;
  larghezza: number;
  altezza: number;
};

export default function Traguardo({
  importoTesto,
  famiglia,
}: {
  /** Quanto ha recuperato, già scritto («600€»). null = non lo mostriamo. */
  importoTesto: string | null;
  famiglia: boolean;
}) {
  const [pezzi, setPezzi] = useState<Pezzo[]>([]);

  useEffect(() => {
    // Chi ha chiesto meno movimento non riceve coriandoli.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // I coriandoli si generano nel browser (Math.random è lato client, ok).
    const nuovi: Pezzo[] = Array.from({ length: 70 }, () => ({
      sinistra: Math.random() * 100,
      ritardo: Math.random() * 0.5,
      durata: 2.2 + Math.random() * 1.6,
      colore: COLORI[Math.floor(Math.random() * COLORI.length)],
      ruota: Math.random() * 360,
      larghezza: 6 + Math.random() * 6,
      altezza: 9 + Math.random() * 8,
    }));
    /* ⚠️ Lo stato non si tocca dentro il corpo dell'effetto (React lo vieta:
       secondo disegno a catena). Un rinvio di un giro basta, come fa la
       ripresa dentro SchedaCheck. */
    const avvia = setTimeout(() => setPezzi(nuovi), 0);
    const pulisci = setTimeout(() => setPezzi([]), 4200);
    return () => {
      clearTimeout(avvia);
      clearTimeout(pulisci);
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-verde/30 bg-gradient-to-b from-menta-tenue to-white px-6 py-10 text-center">
      {/* i coriandoli, sopra il riquadro ma sotto il testo */}
      {pezzi.length > 0 && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {pezzi.map((p, i) => (
            <span
              key={i}
              className="traguardo-coriandolo absolute top-[-14px] block rounded-[2px]"
              style={{
                left: `${p.sinistra}%`,
                width: `${p.larghezza}px`,
                height: `${p.altezza}px`,
                background: p.colore,
                transform: `rotate(${p.ruota}deg)`,
                animationDelay: `${p.ritardo}s`,
                animationDuration: `${p.durata}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-verde text-white shadow-[0_14px_30px_-10px_rgba(6,122,70,0.7)]">
          <Trophy className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-verde">
          Obiettivo completato
        </p>
        <h2 className="mt-2 font-display text-3xl leading-tight tracking-[-0.03em] text-verde-notte sm:text-4xl">
          Ce l&apos;hai fatta.
        </h2>
        {importoTesto && (
          <p className="mt-3 text-[1.05rem] leading-relaxed text-verde-notte/80">
            Hai recuperato{" "}
            <strong className="font-display text-verde">
              {importoTesto}
              {famiglia ? " a passeggero" : ""}
            </strong>
            . I soldi sono sul tuo conto: due clic tuoi, il resto l&apos;abbiamo fatto noi.
          </p>
        )}
        {!importoTesto && (
          <p className="mt-3 text-[1.05rem] leading-relaxed text-verde-notte/80">
            La compagnia ha pagato. Due clic tuoi, il resto l&apos;abbiamo fatto noi.
          </p>
        )}
      </div>
    </section>
  );
}
