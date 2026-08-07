import { Anima, AnimaLista, CardViva } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * I numeri del PROBLEMA, ognuno con la fonte dichiarata (regola CLAUDE.md
 * #2; le fonti sono verificate in testa a lib/copy.ts). Non ci sono numeri
 * del prodotto perché non li abbiamo ancora, e inventarli costerebbe
 * l'unica cosa che vendiamo: la fiducia.
 *
 * I valori NON si animano col contatore: sono dati con una fonte sotto,
 * e vederli ballare su valori intermedi sbagliati contraddice la promessa
 * della sezione (stessa scelta di Numeri.tsx per il prezzo MIMIT).
 */
const SEZIONE = COPY.numeri;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const stacco = SEZIONE.titolo.indexOf(" sul fatto");
const titoloPrima = stacco > 0 ? SEZIONE.titolo.slice(0, stacco) : SEZIONE.titolo;
const titoloCorsivo = stacco > 0 ? SEZIONE.titolo.slice(stacco + 1) : "";

export default function NumeriMercato() {
  return (
    <section id="numeri" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <h2 className="luce-testo text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.04]">
            {titoloPrima}
            {titoloCorsivo && (
              <>
                <br />
                <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
              </>
            )}
          </h2>
        </Anima>

        <AnimaLista className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SEZIONE.voci.map((n) => (
            <CardViva
              key={n.fonte}
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white p-7 shadow-[0_1px_2px_rgba(5,46,31,.06),0_12px_28px_-20px_rgba(5,46,31,.28)] transition-shadow duration-500 hover:shadow-[0_2px_4px_rgba(5,46,31,.07),0_28px_56px_-26px_rgba(5,46,31,.4)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-10 -top-24 size-52 rounded-full bg-menta/45 opacity-0 blur-[54px] transition-opacity duration-700 group-hover:opacity-100"
              />
              <p className="numeri relative font-display text-[clamp(2rem,3.6vw,2.6rem)] font-medium leading-[0.95] tracking-[-0.045em] text-verde [text-shadow:0_1px_0_rgba(255,255,255,.9),0_10px_26px_rgba(10,157,92,.18)]">
                {n.valore}
              </p>
              <p className="relative mt-4 flex-1 text-[14.5px] leading-relaxed text-fumo">
                {n.testo}
              </p>
              <p className="relative mt-4 text-[12.5px] font-medium text-fumo-2">
                Fonte: {n.fonte}
              </p>
            </CardViva>
          ))}
        </AnimaLista>

        <Anima ritardo={0.12}>
          <p className="mx-auto mt-10 max-w-xl text-center text-[15.5px] leading-relaxed text-fumo">
            {SEZIONE.chiusa}{" "}
            <a
              href="#controllo"
              className="font-medium text-verde-scuro underline decoration-dotted underline-offset-4 transition-colors hover:text-verde"
            >
              {COPY.hero.form.bottone}
            </a>
          </p>
        </Anima>
      </div>
    </section>
  );
}
