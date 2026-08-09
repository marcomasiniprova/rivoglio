import CardArticolo from "./CardArticolo";
import type { Articolo } from "@/lib/tabellone/tipi";

/**
 * "Gli ultimi articoli": il pezzo in evidenza grande a sinistra e due
 * più piccoli in colonna a destra, come nel riferimento.
 *
 * Sotto i 1024px diventa una colonna sola e i due laterali restano
 * orizzontali: su un telefono una card con l'immagine a sinistra si legge
 * meglio di tre copertine gigantesche una sopra l'altra.
 */
export default function SezioneUltimi({ articoli }: { articoli: Articolo[] }) {
  if (articoli.length === 0) return null;
  const [primo, ...resto] = articoli;

  return (
    <section className="px-5 pb-6 pt-12 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-[1216px]">
        <h2 className="font-display text-[23px] font-semibold tracking-[-0.03em] text-verde-notte">
          Gli ultimi articoli
        </h2>

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <CardArticolo articolo={primo} forma="grande" priorita />
          <div className="flex flex-col gap-9">
            {resto.map((a) => (
              <CardArticolo key={a.slug} articolo={a} forma="orizzontale" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
