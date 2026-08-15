"use client";

import { useEffect, useState } from "react";
import { Anima } from "@/components/Anima";
import type { RecensioneVetrina } from "@/lib/recensioni/recensioni";

/**
 * LA VETRINA DELLE RECENSIONI (Valerio, 15/08, con le immagini di
 * riferimento): un nastro di recensioni che scorre di lato, in loop,
 * coi nostri colori.
 *
 * ⚠️ MOSTRA SOLO RECENSIONI VERE E APPROVATE. Le prende dal server
 * (`GET /api/recensioni`, che risponde solo le approvate) QUANDO la pagina
 * è già aperta: così, appena approvi una recensione dal pannello, compare
 * in landing entro pochi minuti senza ricostruire il sito. Se non ce ne
 * sono ancora, la sezione non esiste proprio: niente recensioni finte
 * (regola 8 del progetto), niente sezione vuota.
 */

function Stelle({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} su 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.4l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z"
            fill={i <= n ? "var(--color-sole)" : "none"}
            stroke={i <= n ? "var(--color-sole)" : "var(--color-bordo)"}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function Carta({ v }: { v: RecensioneVetrina }) {
  const iniziale = (v.nome ?? "").trim().charAt(0).toUpperCase() || "★";
  return (
    <figure className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-bordo bg-white px-6 py-5 sm:w-[340px]">
      <Stelle n={v.stelle} />
      <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-inchiostro/85">
        “{v.motivo}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-menta-tenue text-[13px] font-semibold text-verde-notte">
          {iniziale}
        </span>
        <span className="text-[14px] font-medium text-inchiostro">
          {v.nome?.trim() || "Cliente Rivolio"}
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonial() {
  const [voci, setVoci] = useState<RecensioneVetrina[] | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/recensioni")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vivo && d?.ok && Array.isArray(d.voci)) setVoci(d.voci as RecensioneVetrina[]);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  // Niente recensioni (o non ancora caricate): la sezione non compare.
  if (!voci || voci.length === 0) return null;

  /* Il binario porta le carte due volte: l'animazione lo trascina di metà
     e riparte, così la giunzione non si vede. Con poche recensioni si
     ripete di più, ma non resta mai vuoto. Durata proporzionale al numero,
     così tante carte non sfrecciano e poche non strisciano. */
  const doppio = [...voci, ...voci];
  const durata = `${Math.max(24, voci.length * 6)}s`;

  return (
    <section id="recensioni" className="overflow-hidden bg-nebbia py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Anima>
          <span className="inline-flex items-center gap-1.5 rounded-pillola border border-bordo bg-white px-3 py-1 text-[12.5px] font-medium text-fumo">
            <span className="h-1.5 w-1.5 rounded-full bg-verde" aria-hidden="true" />
            Recensioni
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,5.5vw,2.7rem)] leading-[1.06] tracking-[-0.03em] text-inchiostro">
            Chi si è ripreso i suoi soldi
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[1rem] leading-relaxed text-fumo">
            Le parole di chi ha usato Rivolio davvero. Ogni recensione è vera e
            verificata a mano.
          </p>
        </Anima>
      </div>

      <Anima ritardo={0.1}>
        <div
          className="nastro-fermo mt-10"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="nastro gap-5 px-5" style={{ ["--durata" as string]: durata }}>
            {doppio.map((v, i) => (
              <Carta key={i} v={v} />
            ))}
          </div>
        </div>
      </Anima>
    </section>
  );
}
