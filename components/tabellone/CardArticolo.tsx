import Link from "next/link";
import Copertina from "./Copertina";
import { FIRMA, RADICE, dataCorta } from "@/lib/tabellone/indice";
import { TAG, type Articolo } from "@/lib/tabellone/tipi";

/**
 * La card di un articolo, nelle tre forme del riferimento:
 *  - `griglia`     tre per riga, copertina sopra e testo sotto
 *  - `grande`      il pezzo in evidenza, copertina alta e titolo grosso
 *  - `orizzontale` copertina a sinistra e testo a destra, per la colonna
 *
 * L'ordine dentro la card non cambia mai: firma e data, poi titolo con
 * la freccia, poi l'estratto, poi i tag. È l'ordine con cui si legge una
 * pagina di rivista, e cambiarlo per una variante la farebbe sembrare
 * un'altra cosa.
 */

export function PillolaTag({ testo }: { testo: string }) {
  return (
    <span className="inline-flex items-center rounded-pillola border border-verde-notte/20 bg-carta px-2.5 py-1 text-[12.5px] font-medium leading-none text-verde-notte/80">
      {testo}
    </span>
  );
}

function Freccia() {
  return (
    <span
      aria-hidden="true"
      className="mt-1 shrink-0 text-verde-notte transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M4.5 13.5L13.5 4.5M13.5 4.5H6M13.5 4.5V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Firma({ data }: { data: string }) {
  return (
    <p className="text-[14px] font-semibold text-verde-scuro">
      {FIRMA} <span className="text-verde-notte/45">•</span>{" "}
      <time dateTime={data}>{dataCorta(data)}</time>
    </p>
  );
}

function Tag({ articolo }: { articolo: Articolo }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {articolo.tag.slice(0, 3).map((t) => (
        <PillolaTag key={t} testo={TAG[t]} />
      ))}
    </div>
  );
}

export default function CardArticolo({
  articolo,
  forma = "griglia",
  priorita = false,
}: {
  articolo: Articolo;
  forma?: "griglia" | "grande" | "orizzontale";
  priorita?: boolean;
}) {
  const href = `${RADICE}/${articolo.slug}`;

  if (forma === "orizzontale") {
    return (
      <article>
        <Link href={href} className="group flex items-start gap-5">
          <div className="w-[38%] shrink-0 max-w-[220px]">
            <Copertina
              chiave={articolo.copertina}
              foto={articolo.foto}
              alt={articolo.titolo}
              proporzioni="aspect-[4/3]"
              dimensioni="(max-width: 1024px) 40vw, 220px"
            />
          </div>
          <div className="min-w-0 flex flex-col gap-2">
            <Firma data={articolo.data} />
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[19px] font-semibold leading-[1.25] tracking-[-0.025em] text-verde-notte decoration-2 underline-offset-[5px] group-hover:underline">
                {articolo.titolo}
              </h3>
              <Freccia />
            </div>
            <p className="line-clamp-3 text-[15px] leading-relaxed text-verde-notte/65">
              {articolo.estratto}
            </p>
            <Tag articolo={articolo} />
          </div>
        </Link>
      </article>
    );
  }

  const grande = forma === "grande";

  return (
    <article>
      <Link href={href} className="group flex flex-col gap-5">
        <Copertina
          chiave={articolo.copertina}
          foto={articolo.foto}
          alt={articolo.titolo}
          proporzioni={grande ? "aspect-[16/11]" : "aspect-[16/10]"}
          priorita={priorita}
          dimensioni={grande ? "(max-width: 1024px) 100vw, 55vw" : "(max-width: 768px) 100vw, 33vw"}
        />
        <div className="flex flex-col gap-3">
          <Firma data={articolo.data} />
          <div className="flex items-start justify-between gap-4">
            <h3
              className={`font-display font-semibold leading-[1.2] tracking-[-0.03em] text-verde-notte decoration-2 underline-offset-[6px] group-hover:underline ${
                grande ? "text-[26px] sm:text-[30px]" : "text-[21px]"
              }`}
            >
              {articolo.titolo}
            </h3>
            <Freccia />
          </div>
          <p
            className={`text-verde-notte/65 leading-relaxed ${
              grande ? "text-[16.5px]" : "line-clamp-2 text-[15.5px]"
            }`}
          >
            {articolo.estratto}
          </p>
          <Tag articolo={articolo} />
        </div>
      </Link>
    </article>
  );
}
