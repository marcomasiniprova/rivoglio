import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import TestoRivelato from "@/components/TestoRivelato";
import { COPY } from "@/lib/copy";

/**
 * La sezione che mostra COSA vendiamo: il dato oggettivo, non una promessa.
 *
 * A destra c'è la vetrina di come appare un verdetto. È un caso COSTRUITO
 * e porta l'etichetta "Esempio dimostrativo" bene in vista (regola
 * CLAUDE.md #3): niente numero di volo, niente data, così non può essere
 * scambiato per una verifica vera. I conti però tornano davvero con le
 * regole di lib/regole/eu261.ts, perché un esempio sbagliato è peggio
 * di nessun esempio.
 */
const SEZIONE = COPY.datoOggettivo;
const ESEMPIO = SEZIONE.esempio;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const virgola = SEZIONE.titolo.indexOf(", ") + 1;
const titoloPrima = SEZIONE.titolo.slice(0, virgola);
const titoloCorsivo = SEZIONE.titolo.slice(virgola + 1);

export default function DatoOggettivo() {
  return (
    <section id="dato-oggettivo" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <Anima>
            <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-verde">
              {SEZIONE.occhiello}
            </p>
            <h2 className="luce-testo mt-3 text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.02]">
              {titoloPrima}
              <br />
              <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
            </h2>
          </Anima>

          <TestoRivelato
            testo={SEZIONE.testo}
            className="mt-6 max-w-lg text-[17px] leading-relaxed text-inchiostro sm:text-[18px]"
          />

          <AnimaLista className="mt-8 space-y-5" passo={0.09}>
            {SEZIONE.punti.map((p) => (
              <Figlio key={p.titolo}>
                <div className="flex gap-4">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-menta-tenue">
                    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="m3.5 8.4 2.8 2.8 6-6.4"
                        fill="none"
                        stroke="var(--color-verde)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-[16.5px] font-medium">{p.titolo}</h3>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-fumo">{p.testo}</p>
                  </div>
                </div>
              </Figlio>
            ))}
          </AnimaLista>

          <Anima ritardo={0.1}>
            <p className="mt-7 text-[13px] leading-relaxed text-fumo-2">{SEZIONE.nota}</p>
          </Anima>
        </div>

        {/* La vetrina del verdetto: marcata demo, sempre. */}
        <Anima ritardo={0.12}>
          <div className="relative">
            <p className="mb-3 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-fumo-2 lg:text-left">
              {ESEMPIO.etichetta}
            </p>
            <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_2px_4px_rgba(5,46,31,.06),0_28px_60px_-28px_rgba(5,46,31,.38)] sm:p-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 -top-20 size-56 rounded-full bg-menta/35 blur-[60px]"
              />

              <div className="relative flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium uppercase tracking-[0.14em] text-verde">
                  {ESEMPIO.occhiello}
                </p>
                {/* L'etichetta che non si tratta: questo caso è costruito. */}
                <span className="rounded-pillola border border-bordo bg-nebbia px-3 py-1 text-[11.5px] font-medium text-fumo">
                  {COPY.comune.demo}
                </span>
              </div>

              <h3 className="relative mt-4 text-[clamp(1.5rem,3vw,1.9rem)] leading-[1.05]">
                {ESEMPIO.titolo}
              </h3>
              <p className="relative mt-1.5 text-[13.5px] text-fumo">
                {ESEMPIO.volo} · {ESEMPIO.tratta}
              </p>

              <div className="relative mt-6 grid grid-cols-2 gap-3">
                {(
                  [
                    [ESEMPIO.previstoEtichetta, ESEMPIO.previsto, false],
                    [ESEMPIO.effettivoEtichetta, ESEMPIO.effettivo, true],
                  ] as const
                ).map(([etichetta, ora, tardi]) => (
                  <div
                    key={etichetta}
                    className={`rounded-2xl border p-4 ${
                      tardi ? "border-verde/25 bg-menta-tenue" : "border-bordo bg-nebbia"
                    }`}
                  >
                    <p className="text-[11.5px] font-medium uppercase tracking-wider text-fumo-2">
                      {etichetta}
                    </p>
                    <p className="numeri mt-1.5 font-display text-[30px] font-medium leading-none tracking-[-0.03em]">
                      {ora}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative mt-5 rounded-2xl bg-verde-notte p-5 text-white">
                <p className="numeri font-display text-[44px] font-medium leading-none tracking-[-0.04em] text-menta">
                  {ESEMPIO.fascia}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/80">
                  {ESEMPIO.fasciaTesto}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
                  {ESEMPIO.verifica}
                </p>
              </div>
            </div>
          </div>
        </Anima>
      </div>
    </section>
  );
}
