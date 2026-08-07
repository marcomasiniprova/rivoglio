import { Check } from "lucide-react";
import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * I prezzi (SPEC §5, chiusi): check gratis, pratica 14,90€, famiglia 24,90€.
 * Niente altri SKU, niente toggle mensile/annuale: i prezzi sono una tantum.
 *
 * Il layout replica il riferimento approvato da Valerio l'8/08: tre card
 * bianche col bordo sottile, la centrale evidenziata (bordo verde, nastro
 * pieno a tutta larghezza, sporge sopra e sotto le laterali). Il confronto
 * coi portali a percentuale resta, come striscia sottile SOTTO le card, e
 * ogni cifra si apre: la matematica è in COPY.prezzi.notaConfronto.
 *
 * I bottoni portano tutti al check (#controllo): sul sito non si compra
 * niente prima del verdetto, è il funnel (SPEC §3) e non si scavalca.
 * Quando i checkout Polar esisteranno, il flusso partirà comunque da lì.
 */
const SEZIONE = COPY.prezzi;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const stacco = SEZIONE.titolo.indexOf(". ") + 2;
const titoloPrima = SEZIONE.titolo.slice(0, stacco).trimEnd();
const titoloCorsivo = SEZIONE.titolo.slice(stacco);

const PIANI = [
  { ...SEZIONE.piani.check, evidenza: false, nastro: null, apriNota: null, nota: null },
  { ...SEZIONE.piani.pratica, evidenza: true, apriNota: null, nota: null },
  { ...SEZIONE.piani.famiglia, evidenza: false, nastro: null },
] as const;

export default function PrezziRivoglio() {
  return (
    <section id="prezzi" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <Anima className="mx-auto max-w-2xl text-center">
          {/* L'occhiello a pillola col puntino, come nel riferimento. */}
          <p className="inline-flex items-center gap-2 rounded-pillola border border-bordo/70 bg-white px-4 py-1.5 text-[13px] font-medium text-inchiostro shadow-[0_6px_18px_-10px_rgba(5,46,31,.25)]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verde" />
            {SEZIONE.occhiello}
          </p>
          <h2 className="luce-testo mt-5 text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.02]">
            {titoloPrima}
            <br />
            <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            {SEZIONE.sottotitolo}
          </p>
        </Anima>

        {/* Le tre card: la centrale sporge sopra e sotto (le laterali hanno
            il margine verticale), col nastro pieno in cima. */}
        <AnimaLista className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6" passo={0.1}>
          {PIANI.map((p) => (
            <Figlio key={p.nome} className="flex h-full">
              <div
                className={`flex flex-1 flex-col overflow-hidden rounded-3xl border bg-white transition-transform duration-300 ${
                  p.evidenza
                    ? "border-verde shadow-[0_32px_70px_-28px_rgba(10,157,92,.5)] hover:-translate-y-1.5"
                    : "border-bordo/70 shadow-[0_18px_44px_-32px_rgba(5,46,31,.3)] hover:-translate-y-1 md:my-7"
                }`}
              >
                {p.nastro && (
                  <p className="bg-verde py-2 text-center text-[13px] font-medium tracking-[0.04em] text-white">
                    {p.nastro}
                  </p>
                )}

                <div className="flex flex-1 flex-col p-7">
                  <p className="text-[15px] font-semibold text-inchiostro">{p.nome}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-fumo">
                    {p.descrizione}
                  </p>

                  {/* Il prezzo grande col suffisso piccolo: "una volta sola"
                      sta attaccato alla cifra, non è un asterisco a fondo pagina. */}
                  <p className="numeri mt-6 font-display text-[40px] font-medium leading-none tracking-[-0.04em] text-inchiostro">
                    {p.prezzo}
                    <span className="ml-2 font-sans text-[13px] font-normal tracking-normal text-fumo-2">
                      {p.periodo}
                    </span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-bordo/60 pt-6">
                    {p.punti.map((punto) => (
                      <li key={punto} className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-menta-tenue">
                          <Check
                            aria-hidden="true"
                            strokeWidth={2.8}
                            className="h-3 w-3 text-verde"
                          />
                        </span>
                        <span className="text-[13.5px] leading-relaxed text-fumo">
                          {punto}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Il "1.000€" della famiglia si apre: la trasparenza è il prodotto. */}
                  {p.nota && p.apriNota && (
                    <details className="group mt-4">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[12.5px] font-medium text-fumo underline decoration-dotted underline-offset-4 transition-colors marker:hidden hover:text-verde">
                        {p.apriNota}
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
                    className={`mt-7 block rounded-bottone py-3.5 text-center text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                      p.evidenza
                        ? "riflesso bg-verde shadow-[0_12px_28px_-12px_rgba(6,122,70,.75),0_2px_0_0_rgba(255,255,255,.22)_inset] hover:bg-verde-scuro"
                        : "bg-inchiostro hover:bg-inchiostro/85"
                    }`}
                  >
                    {p.bottone}
                  </a>
                </div>
              </div>
            </Figlio>
          ))}
        </AnimaLista>

        {/* Il confronto onesto coi portali a percentuale: striscia sottile
            sotto le card. Il "come nasce" apre la matematica dichiarata. */}
        <Anima ritardo={0.08} className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-2xl border border-bordo/70 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <p className="shrink-0 text-[12.5px] font-medium uppercase tracking-[0.14em] text-fumo-2 sm:max-w-[150px]">
                {SEZIONE.confronto.base}
              </p>
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                {SEZIONE.confronto.voci.map((v, i) => {
                  const nostro = i === SEZIONE.confronto.voci.length - 1;
                  return (
                    <div
                      key={v.nome}
                      className={`rounded-xl border px-4 py-3 ${
                        nostro ? "border-verde/30 bg-menta-tenue" : "border-bordo bg-nebbia"
                      }`}
                    >
                      <p className="text-[13.5px] font-medium">
                        {v.nome}{" "}
                        <span
                          className={`numeri font-display font-medium tracking-[-0.02em] ${
                            nostro ? "text-verde" : "text-inchiostro"
                          }`}
                        >
                          {v.costo}
                        </span>
                      </p>
                      <p className="mt-1 text-[12.5px] text-fumo">{v.resta}</p>
                    </div>
                  );
                })}
              </div>
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

        <Anima ritardo={0.1}>
          <p className="mt-9 text-center text-[14px] text-fumo">{SEZIONE.promemoria}</p>
        </Anima>
      </div>
    </section>
  );
}
