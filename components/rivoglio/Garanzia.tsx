import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * La garanzia (SPEC §5, obbligatoria): se la compagnia non paga, non paghi
 * neanche tu. Sta su fondo scuro come il conto aperto di prima: è il punto
 * dove il sito si gioca la fiducia, e il verde notte gli dà il peso giusto.
 * La nota onesta spiega PERCHÉ possiamo permettercela: senza, sembrerebbe
 * la promessa di un venditore.
 */
const SEZIONE = COPY.garanzia;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const virgola = SEZIONE.titolo.indexOf(", ") + 1;
const titoloPrima = SEZIONE.titolo.slice(0, virgola);
const titoloCorsivo = SEZIONE.titolo.slice(virgola + 1);

export default function Garanzia() {
  return (
    <section id="garanzia" className="scroll-mt-24 px-5 py-10 sm:px-8 sm:py-14">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[2rem] bg-verde-notte px-6 py-16 text-white sm:px-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
          style={{ background: "var(--color-menta)" }}
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Anima>
            <span className="inline-block rounded-pillola bg-white/10 px-3.5 py-1.5 text-[12.5px] font-medium text-menta">
              {SEZIONE.occhiello}
            </span>
            <h2 className="luce-testo-chiaro mt-5 text-[clamp(2.25rem,5.2vw,3.5rem)] leading-[1.04]">
              {titoloPrima}
              <br />
              <span className="corsivo text-menta">{titoloCorsivo}</span>
            </h2>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-white/70">
              {SEZIONE.testo}
            </p>
            <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-white/45">
              {SEZIONE.notaOnesta}
            </p>
          </Anima>

          <AnimaLista className="space-y-4" passo={0.1}>
            {SEZIONE.punti.map((p) => (
              <Figlio key={p}>
                <div className="flex items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-sm transition-colors duration-300 hover:border-menta/30">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-menta/15">
                    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="m3.5 8.4 2.8 2.8 6-6.4"
                        fill="none"
                        stroke="var(--color-menta)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="text-[15.5px] font-medium text-white/90">{p}</p>
                </div>
              </Figlio>
            ))}
          </AnimaLista>
        </div>
      </div>
    </section>
  );
}
