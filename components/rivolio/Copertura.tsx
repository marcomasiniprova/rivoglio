import Link from "next/link";
import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * Cosa copre Rivolio, in chiaro.
 *
 * Perché esiste (feedback esterno del 9/08): leggendo la landing si
 * capiva "solo ritardi", e chi aveva avuto un volo cancellato se ne
 * andava convinto che qui non ci fosse niente per lui. Le cancellazioni
 * il motore le riconosce da giorni: era il sito a non dirlo.
 *
 * Le tre colonne sono tre livelli di verità, e nessuna promette quello
 * che il motore non fa. Il segnale è il colore: verde pieno = risponde
 * da solo, giallo = serve un dato che ha solo l'utente, grigio = non
 * ancora. Dire "non ancora" costa un visitatore; non dirlo costa la
 * fiducia di quello dopo.
 */
const S = COPY.copertura;

const STILI = {
  pronto: {
    riquadro: "border-verde/35 bg-menta-tenue/60",
    pillola: "bg-verde text-white",
    segno: "M4 10.5 8 14.5 16 5.5",
  },
  quasi: {
    riquadro: "border-sole/45 bg-sole/10",
    pillola: "bg-sole text-inchiostro",
    segno: "M10 4.6v6.2M10 14.4v.2",
  },
  arrivo: {
    riquadro: "border-bordo bg-nebbia",
    pillola: "bg-fumo-2/25 text-fumo",
    segno: "M10 5.5v5l3.2 2",
  },
} as const;

export default function Copertura() {
  return (
    <section id="copertura" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1200px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-verde">
            {S.occhiello}
          </p>
          <h2 className="luce-testo mt-3 text-[clamp(2.25rem,5.2vw,3.5rem)] leading-[1.02]">
            {S.titolo}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed text-fumo">
            {S.testo}
          </p>
        </Anima>

        <AnimaLista className="mt-12 grid gap-5 lg:grid-cols-3" passo={0.1}>
          {S.gruppi.map((g) => {
            const stile = STILI[g.stato as keyof typeof STILI];
            return (
              <Figlio key={g.etichetta} className="flex">
                <div className={`flex flex-1 flex-col rounded-[1.5rem] border p-6 ${stile.riquadro}`}>
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-pillola px-3 py-1 text-[12px] font-semibold ${stile.pillola}`}
                  >
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
                      <path
                        d={stile.segno}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {g.etichetta}
                  </span>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-fumo">{g.spiegazione}</p>

                  <ul className="mt-5 flex-1 space-y-5 border-t border-inchiostro/8 pt-5">
                    {g.voci.map((v) => (
                      <li key={v.nome}>
                        <p className="text-[15.5px] font-semibold leading-snug text-inchiostro">
                          {v.nome}
                        </p>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-fumo">{v.testo}</p>
                        {"link" in v && v.link && (
                          <Link
                            href={v.link.dove}
                            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-verde underline decoration-dotted underline-offset-4 transition-colors hover:text-verde-scuro"
                          >
                            {v.link.testo}
                            <span aria-hidden="true">→</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Figlio>
            );
          })}
        </AnimaLista>
      </div>
    </section>
  );
}
