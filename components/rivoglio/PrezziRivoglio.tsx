import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * I prezzi (SPEC §5, chiusi): check gratis, pratica 14,90€, famiglia 24,90€.
 * Niente altri SKU. La carta evidenziata è la pratica singola: è quella che
 * l'utente compra dal reveal.
 *
 * Il confronto con i portali a percentuale sta sopra le carte e ogni numero
 * si apre: le cifre vengono da COPY.prezzi.confronto e la matematica è
 * dichiarata in notaConfronto, dentro il dettaglio apribile.
 *
 * I bottoni portano tutti al check (#controllo): sul sito non si compra
 * niente prima del verdetto, è il funnel (SPEC §3) e non si scavalca.
 */
const SEZIONE = COPY.prezzi;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const stacco = SEZIONE.titolo.indexOf(". ") + 2;
const titoloPrima = SEZIONE.titolo.slice(0, stacco).trimEnd();
const titoloCorsivo = SEZIONE.titolo.slice(stacco);

const PIANI = [
  { ...SEZIONE.piani.check, evidenza: false, nota: null },
  { ...SEZIONE.piani.pratica, evidenza: true, nota: null },
  { ...SEZIONE.piani.famiglia, evidenza: false, nota: SEZIONE.piani.famiglia.nota },
] as const;

export default function PrezziRivoglio() {
  return (
    <section id="prezzi" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-verde">
            {SEZIONE.occhiello}
          </p>
          <h2 className="luce-testo mt-3 text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.02]">
            {titoloPrima}
            <br />
            <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            {SEZIONE.sottotitolo}
          </p>
        </Anima>

        {/* Il confronto, messo in colonna. Ogni cifra si apre qui sotto. */}
        <Anima ritardo={0.08} className="mx-auto mt-11 max-w-2xl">
          <div className="rounded-2xl border border-bordo/70 bg-white p-5 sm:p-6">
            <p className="text-[12.5px] font-medium uppercase tracking-[0.14em] text-fumo-2">
              {SEZIONE.confronto.base}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SEZIONE.confronto.voci.map((v, i) => {
                const nostro = i === SEZIONE.confronto.voci.length - 1;
                return (
                  <div
                    key={v.nome}
                    className={`rounded-xl border p-4 ${
                      nostro ? "border-verde/30 bg-menta-tenue" : "border-bordo bg-nebbia"
                    }`}
                  >
                    <p className="text-[13.5px] font-medium">{v.nome}</p>
                    <p
                      className={`numeri mt-1.5 font-display text-[22px] font-medium leading-none tracking-[-0.03em] ${
                        nostro ? "text-verde" : "text-inchiostro"
                      }`}
                    >
                      {v.costo}
                    </p>
                    <p className="mt-1.5 text-[13px] text-fumo">{v.resta}</p>
                  </div>
                );
              })}
            </div>
            <details className="group mt-4">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[13px] font-medium text-fumo underline decoration-dotted underline-offset-4 transition-colors marker:hidden hover:text-verde">
                {COPY.comune.apriIlConto}
                <span
                  aria-hidden="true"
                  className="text-[11px] transition-transform duration-300 group-open:rotate-90"
                >
                  ▸
                </span>
              </summary>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-fumo">
                {SEZIONE.notaConfronto}
              </p>
            </details>
          </div>
        </Anima>

        <AnimaLista className="mt-9 grid gap-5 md:grid-cols-3" passo={0.1}>
          {PIANI.map((p) => (
            <Figlio key={p.nome} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-[1.5rem] border p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                  p.evidenza
                    ? "border-verde bg-verde text-white shadow-[0_28px_60px_-24px_rgba(10,157,92,.6)]"
                    : "border-bordo/70 bg-white"
                }`}
              >
                <p
                  className={`text-[14px] font-medium ${
                    p.evidenza ? "text-white/80" : "text-fumo"
                  }`}
                >
                  {p.nome}
                </p>
                <p
                  className={`numeri mt-3 font-display text-[42px] font-medium leading-none tracking-[-0.04em] ${
                    p.evidenza ? "text-menta" : "text-inchiostro"
                  }`}
                >
                  {p.prezzo}
                </p>
                <p
                  className={`mt-1.5 text-[13px] ${p.evidenza ? "text-white/55" : "text-fumo-2"}`}
                >
                  {p.periodo}
                </p>
                <p
                  className={`mt-4 text-[14.5px] leading-relaxed ${
                    p.evidenza ? "text-white/85" : "text-inchiostro/85"
                  }`}
                >
                  {p.descrizione}
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.punti.map((punto) => (
                    <li key={punto} className="flex items-start gap-2.5">
                      <svg
                        viewBox="0 0 16 16"
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="7.2"
                          fill={p.evidenza ? "var(--color-menta)" : "var(--color-menta-tenue)"}
                        />
                        <path
                          d="m5 8.2 2 2 4-4.2"
                          fill="none"
                          stroke={p.evidenza ? "var(--color-verde-notte)" : "var(--color-verde)"}
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className={`text-[13.5px] leading-relaxed ${
                          p.evidenza ? "text-white/85" : "text-fumo"
                        }`}
                      >
                        {punto}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Il "1.000€" della famiglia si apre: la trasparenza è il prodotto. */}
                {p.nota && (
                  <details className="group mt-4">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[12.5px] font-medium text-fumo underline decoration-dotted underline-offset-4 transition-colors marker:hidden hover:text-verde">
                      {COPY.comune.apriIlConto}
                      <span
                        aria-hidden="true"
                        className="text-[10px] transition-transform duration-300 group-open:rotate-90"
                      >
                        ▸
                      </span>
                    </summary>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-fumo">{p.nota}</p>
                  </details>
                )}

                <a
                  href="#controllo"
                  className={`riflesso mt-6 block rounded-bottone py-3.5 text-center text-[15px] font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                    p.evidenza
                      ? "bg-white text-verde shadow-[0_14px_30px_-14px_rgba(0,0,0,.4)] hover:bg-menta hover:text-verde-notte"
                      : "bg-inchiostro text-white hover:bg-verde-notte"
                  }`}
                >
                  {p.bottone}
                </a>
              </div>
            </Figlio>
          ))}
        </AnimaLista>

        <Anima ritardo={0.1}>
          <p className="mt-9 text-center text-[14px] text-fumo">{SEZIONE.promemoria}</p>
        </Anima>
      </div>
    </section>
  );
}
