import { AnimaLista, Anima, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * I passi del funnel, nell'ordine vero (SPEC §3): il check gratis, il
 * verdetto col dato oggettivo, la pratica a prezzo fisso, l'invio fatto
 * dall'utente. Il quarto passo non è un dettaglio: che il reclamo parta
 * dalla SUA email è il modello legale pulito, e si dice.
 */
const SEZIONE = COPY.comeFunziona;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo:
   la prima frase resta dritta, la seconda cambia voce. */
const stacco = SEZIONE.titolo.indexOf(". ") + 2;
const titoloPrima = SEZIONE.titolo.slice(0, stacco).trimEnd();
const titoloCorsivo = SEZIONE.titolo.slice(stacco);

export default function ComeFunziona() {
  return (
    <section id="come-funziona" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1200px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <h2 className="luce-testo text-[clamp(2.25rem,5.2vw,3.5rem)] leading-[1.02]">
            {titoloPrima}
            <br />
            <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
          </h2>
        </Anima>

        <AnimaLista className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" passo={0.1}>
          {SEZIONE.passi.map((p, i) => (
            <Figlio key={p.nome} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white p-7 shadow-[0_1px_2px_rgba(5,46,31,.06),0_12px_28px_-20px_rgba(5,46,31,.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(5,46,31,.07),0_28px_56px_-26px_rgba(5,46,31,.4)]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full bg-menta/40 opacity-0 blur-[48px] transition-opacity duration-700 group-hover:opacity-100"
                />
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-verde font-display text-[16px] font-medium text-white transition-transform duration-300 group-hover:scale-110">
                  {i + 1}
                </span>
                <h3 className="relative mt-5 text-[19px]">{p.nome}</h3>
                <p className="relative mt-2 text-[14.5px] leading-relaxed text-fumo">
                  {p.testo}
                </p>
              </div>
            </Figlio>
          ))}
        </AnimaLista>
      </div>
    </section>
  );
}
