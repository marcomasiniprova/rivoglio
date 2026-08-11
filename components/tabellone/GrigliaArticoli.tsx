import CardArticolo from "./CardArticolo";
import Paginazione from "./Paginazione";
import type { Articolo } from "@/lib/tabellone/tipi";

/**
 * "Tutti gli articoli": tre per riga, con la paginazione sotto.
 * È il blocco dell'immagine 1 del riferimento.
 */
export default function GrigliaArticoli({
  titolo = "Tutti gli articoli",
  articoli,
  corrente,
  totalePagine,
  paginazione = true,
}: {
  titolo?: string;
  articoli: Articolo[];
  corrente?: number;
  totalePagine?: number;
  paginazione?: boolean;
}) {
  return (
    <section className="px-5 pb-8 pt-11 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-[1216px]">
        <h2 className="font-display text-[23px] font-semibold tracking-[-0.03em] text-verde-notte">
          {titolo}
        </h2>

        {articoli.length === 0 ? (
          <p className="mt-6 text-[16px] text-verde-notte/60">
            Qui non c&apos;è ancora niente. Il prossimo pezzo arriva a giorni.
          </p>
        ) : (
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {articoli.map((a) => (
              <CardArticolo key={a.slug} articolo={a} />
            ))}
          </div>
        )}

        {paginazione && corrente && totalePagine && (
          <Paginazione corrente={corrente} totale={totalePagine} />
        )}
      </div>
    </section>
  );
}
