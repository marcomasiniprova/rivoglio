import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * Le domande, con la struttura di Faq.tsx (details/summary nativi: si
 * aprono anche senza JavaScript e i lettori di schermo li conoscono).
 * Le risposte vengono da COPY.faq e restano oneste anche quando non ci
 * convengono: la prima spiega come fare tutto da soli, gratis.
 */
const SEZIONE = COPY.faq;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const stacco = SEZIONE.titolo.indexOf(", ") + 1;
const titoloPrima = SEZIONE.titolo.slice(0, stacco);
const titoloCorsivo = SEZIONE.titolo.slice(stacco + 1);

export default function FaqRivoglio() {
  return (
    <section id="domande" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-20">
        <Anima>
          <h2 className="luce-testo text-[clamp(2rem,4.4vw,2.9rem)] leading-[1.06]">
            {titoloPrima}
            <br />
            <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
          </h2>
        </Anima>

        <AnimaLista className="divide-y divide-bordo border-y border-bordo" passo={0.05}>
          {SEZIONE.voci.map((q) => (
            <Figlio key={q.domanda}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[17px] font-medium leading-snug transition-colors marker:hidden hover:text-verde">
                  {q.domanda}
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-bordo text-fumo transition-all duration-300 group-open:rotate-45 group-open:border-verde group-open:bg-verde group-open:text-white">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                      <path
                        d="M6 1.5v9M1.5 6h9"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl pr-12 text-[15.5px] leading-relaxed text-fumo">
                  {q.risposta}
                </p>
              </details>
            </Figlio>
          ))}
        </AnimaLista>
      </div>
    </section>
  );
}
