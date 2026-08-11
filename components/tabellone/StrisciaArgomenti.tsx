import Link from "next/link";
import { RADICE, tagUsati } from "@/lib/tabellone/indice";

/**
 * La striscia degli argomenti, fra l'apertura e gli articoli.
 *
 * Serve a due cose insieme. Per chi legge dal telefono è l'unico modo di
 * navigare: lassù nella testata il menu "Argomenti" sparisce sotto i
 * 1024px, e senza questa riga il blog diventa un elenco da scorrere e
 * basta. Per Google è il collegamento fra l'indice e le dieci pagine
 * cluster, cioè quello che tiene insieme l'hub and spoke.
 *
 * Scorre in orizzontale quando non ci sta: mai mandare a capo una fila
 * di pillole, diventa un muro.
 */
export default function StrisciaArgomenti({ escluso }: { escluso?: string }) {
  const argomenti = tagUsati().filter((t) => t.chiave !== escluso);
  if (argomenti.length === 0) return null;

  return (
    <nav
      aria-label="Argomenti del Tabellone"
      /* `overflow-x-clip`: la striscia scorre da sé, ma su schermi molto
         stretti sporgeva oltre il bordo e faceva scorrere di lato tutta
         la pagina (a 320 punti, visto il 10/08). */
      className="overflow-x-clip px-5 pt-10 sm:px-8 sm:pt-11"
    >
      <div className="mx-auto max-w-[1216px]">
        <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {argomenti.map((t) => (
            <Link
              key={t.chiave}
              href={`${RADICE}/argomento/${t.chiave}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-pillola border border-verde-notte/18 bg-white px-4 py-2 text-[14.5px] font-medium text-verde-notte/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-verde/50 hover:text-verde-notte"
            >
              {t.nome}
              <span className="numeri text-[12.5px] text-verde-notte/35 transition-colors group-hover:text-verde">
                {t.quanti}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
