import type { Metadata } from "next";
import Link from "next/link";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Iscrizione all'Osservatorio | Rivolio",
  description: "L'esito della tua iscrizione all'Osservatorio dei Disservizi di Rivolio.",
  robots: { index: false, follow: false },
};

/**
 * Dove atterra chi clicca un link dell'email: conferma o disdetta.
 *
 * È una pagina sola con cinque esiti perché sono cinque frasi, non
 * cinque pagine. Nessuna di queste dice "errore": dicono cosa è
 * successo e cosa può fare adesso chi sta leggendo.
 */
const E = COPY.iscrizione;

type Esito = keyof typeof E.esiti;

const VALIDI = new Set(Object.keys(E.esiti));

export default async function PaginaIscrizione({
  searchParams,
}: {
  searchParams: Promise<{ esito?: string }>;
}) {
  const { esito } = await searchParams;
  const chiave = (VALIDI.has(esito ?? "") ? esito : "guasto") as Esito;
  const testo = E.esiti[chiave];
  const buona = chiave === "fatto" || chiave === "disdetto";

  return (
    <main className="flex min-h-[78vh] items-center justify-center px-5 py-24 sm:px-8">
      <div className="w-full max-w-lg text-center">
        <span
          aria-hidden="true"
          className={`mx-auto grid size-14 place-items-center rounded-full ${
            buona ? "bg-menta-tenue text-verde-scuro" : "bg-nebbia text-fumo"
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-7" fill="none" strokeWidth="2.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {buona ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M12 8v5m0 3.5v.2M12 3l9 16H3Z" />}
          </svg>
        </span>

        <h1 className="luce-testo mt-7 text-[clamp(1.9rem,4.4vw,2.7rem)] leading-[1.08]">
          {testo.titolo}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[16.5px] leading-relaxed text-fumo">
          {testo.corpo}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={testo.azione.dove}
            className="riflesso inline-flex h-13 items-center gap-2 rounded-bottone bg-verde px-7 text-[15.5px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(10,157,92,.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
          >
            {testo.azione.testo}
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/"
            className="text-[15px] font-medium text-fumo transition-colors hover:text-verde-scuro"
          >
            {E.torna}
          </Link>
        </div>
      </div>
    </main>
  );
}
