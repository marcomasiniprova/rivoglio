import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * Il gancio dei 5 anni: un volo di anni fa può valere ancora una pratica.
 * Le finestre sono STIMATE e la sezione lo dice due volte (etichetta sulla
 * card e avvertenza sotto): la prescrizione dichiarata come certezza è
 * esattamente il tipo di promessa che Rivoglio non fa (SPEC §4).
 */
const SEZIONE = COPY.retroattivo;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const stacco = SEZIONE.titolo.indexOf(" i voli");
const titoloPrima = stacco > 0 ? SEZIONE.titolo.slice(0, stacco) : SEZIONE.titolo;
const titoloCorsivo = stacco > 0 ? SEZIONE.titolo.slice(stacco + 1) : "";

export default function Retroattivo() {
  return (
    <section id="retroattivo" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20">
        <Anima>
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-verde">
            {SEZIONE.occhiello}
          </p>
          <h2 className="luce-testo mt-3 text-[clamp(2.25rem,5.2vw,3.5rem)] leading-[1.02]">
            {titoloPrima}
            {titoloCorsivo && (
              <>
                <br />
                <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
              </>
            )}
          </h2>
          <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            {SEZIONE.testo}
          </p>

          {/* Il consiglio pratico: come ritrovare numero e data. */}
          <div className="mt-7 flex gap-3.5 rounded-2xl border border-verde/20 bg-menta-tenue p-5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
                <rect
                  x="3"
                  y="5.5"
                  width="18"
                  height="13"
                  rx="2.5"
                  fill="none"
                  stroke="var(--color-verde)"
                  strokeWidth="1.8"
                />
                <path
                  d="m4 7 8 6 8-6"
                  fill="none"
                  stroke="var(--color-verde)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[14px] leading-relaxed text-inchiostro/80">
              {SEZIONE.suggerimento}
            </p>
          </div>

          {/* Centrato su telefono (fix 8/08); a sinistra col testo su desktop. */}
          <div className="mt-7 flex justify-center lg:justify-start">
            <a
              href="#controllo"
              className="riflesso group inline-flex items-center gap-2 rounded-bottone bg-verde px-7 py-4 text-[15.5px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(6,122,70,.75),0_2px_0_0_rgba(255,255,255,.22)_inset] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
            >
              {SEZIONE.cta}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
          </div>
        </Anima>

        <div>
          <AnimaLista className="space-y-4" passo={0.12}>
            {SEZIONE.finestre.map((f) => (
              <Figlio key={f.compagnie}>
                <div className="group flex items-center justify-between gap-6 rounded-[1.5rem] bg-white p-6 shadow-[0_1px_2px_rgba(5,46,31,.06),0_12px_28px_-20px_rgba(5,46,31,.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(5,46,31,.07),0_28px_56px_-26px_rgba(5,46,31,.4)] sm:p-7">
                  <div className="min-w-0">
                    <p className="text-[16px] font-medium leading-snug">{f.compagnie}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-fumo">{f.nota}</p>
                  </div>
                  <p className="numeri shrink-0 text-right font-display text-[clamp(1.7rem,3.4vw,2.3rem)] font-medium leading-none tracking-[-0.04em] text-verde">
                    {f.finestra}
                  </p>
                </div>
              </Figlio>
            ))}
          </AnimaLista>

          <Anima ritardo={0.2}>
            <p className="mt-5 flex gap-2.5 px-2 text-[13px] leading-relaxed text-fumo-2">
              <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 4.6v4.2M8 11.2v.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              {SEZIONE.avvertenza}
            </p>
          </Anima>
        </div>
      </div>
    </section>
  );
}
