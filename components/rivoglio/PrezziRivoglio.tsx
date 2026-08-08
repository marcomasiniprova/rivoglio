import { Check } from "lucide-react";
import { Anima, AnimaLista, Figlio } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * I prezzi (SPEC §5, chiusi): check gratis, pratica 14,90€, famiglia 24,90€.
 * Niente altri SKU, niente toggle mensile/annuale: i prezzi sono una tantum.
 *
 * Il giro estetico dell'8/08 sera (scelta di Valerio col popup): i due
 * prodotti sono DUE CARTE D'IMBARCO affiancate, nello stesso linguaggio del
 * biglietto che il sito usa per lo scan (CartaImbarcoScan) e l'app per i
 * voli salvati: fascia scura in testa, strappo tratteggiato coi fori,
 * codice a barre nel tagliando. Il check gratis non è un terzo biglietto:
 * è la premessa, una striscia sopra le carte.
 *
 * Il confronto coi portali a percentuale resta sotto, e ogni cifra si
 * apre: la matematica è in COPY.prezzi.notaConfronto.
 *
 * I bottoni portano tutti al check (#controllo): sul sito non si compra
 * niente prima del verdetto, è il funnel (SPEC §3) e non si scavalca.
 * Quando i checkout Polar esisteranno, il flusso partirà comunque da lì.
 */
const SEZIONE = COPY.prezzi;
const CHECK = SEZIONE.piani.check;

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const stacco = SEZIONE.titolo.indexOf(". ") + 2;
const titoloPrima = SEZIONE.titolo.slice(0, stacco).trimEnd();
const titoloCorsivo = SEZIONE.titolo.slice(stacco);

const CARTE = [
  { ...SEZIONE.piani.pratica, evidenza: true, apriNota: null, nota: null },
  { ...SEZIONE.piani.famiglia, evidenza: false, nastro: null },
] as const;

/**
 * Le tacche del codice a barre, derivate dal nome del piano come su
 * CardVolo dell'app: deterministiche, stesso biglietto = stesso disegno.
 * Grafica da documento, non un dato che finge di essere vero.
 */
function tacche(seme: string): number[] {
  const larghezze: number[] = [];
  let x = 0;
  for (let i = 0; i < 30; i++) {
    x = (x * 31 + seme.charCodeAt(i % seme.length) + i) % 7;
    larghezze.push(1 + (x % 3));
  }
  return larghezze;
}

function Barre({ seme }: { seme: string }) {
  return (
    <div aria-hidden="true" className="flex h-6 items-stretch gap-px opacity-75">
      {tacche(seme).map((b, i) => (
        <span
          key={i}
          className="bg-inchiostro/85"
          style={{ width: b, marginRight: b % 2 ? 1 : 2 }}
        />
      ))}
    </div>
  );
}

/** Lo strappo del biglietto: tratteggio e due fori che escono dai bordi. */
function Strappo({ evidenza }: { evidenza: boolean }) {
  const bordo = evidenza ? "border-verde" : "border-bordo";
  return (
    <div aria-hidden="true" className="flex items-center">
      <span
        className={`-ml-[9px] h-[18px] w-[18px] shrink-0 rounded-full border bg-nebbia ${bordo}`}
      />
      <span className="mx-2 flex-1 border-t-[1.5px] border-dashed border-bordo/90" />
      <span
        className={`-mr-[9px] h-[18px] w-[18px] shrink-0 rounded-full border bg-nebbia ${bordo}`}
      />
    </div>
  );
}

export default function PrezziRivoglio() {
  return (
    <section id="prezzi" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1200px]">
        <Anima className="mx-auto max-w-2xl text-center">
          {/* L'occhiello a pillola col puntino, come nel riferimento. */}
          <p className="inline-flex items-center gap-2 rounded-pillola border border-bordo/70 bg-white px-4 py-1.5 text-[13px] font-medium text-inchiostro shadow-[0_6px_18px_-10px_rgba(5,46,31,.25)]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verde" />
            {SEZIONE.occhiello}
          </p>
          <h2 className="luce-testo mt-5 text-[clamp(2.25rem,5.2vw,3.5rem)] leading-[1.02]">
            {titoloPrima}
            <br />
            <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            {SEZIONE.sottotitolo}
          </p>
        </Anima>

        {/* La premessa: il check è gratis, il verdetto lo vedi PRIMA di
            pagare. Una striscia, non un terzo biglietto. */}
        <Anima ritardo={0.05} className="mx-auto mt-12 max-w-[880px]">
          <div className="rounded-2xl border border-bordo/70 bg-white p-5 shadow-[0_18px_44px_-32px_rgba(5,46,31,.3)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-inchiostro">
                  {CHECK.nome}{" "}
                  <span className="numeri font-display text-[19px] font-medium tracking-[-0.02em] text-verde-scuro">
                    {CHECK.prezzo}
                  </span>{" "}
                  <span className="text-[13px] font-normal text-fumo-2">{CHECK.periodo}</span>
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-fumo">{CHECK.descrizione}</p>
              </div>
              <a
                href="#controllo"
                className="block shrink-0 rounded-bottone bg-inchiostro px-6 py-3 text-center text-[14.5px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-inchiostro/85 active:scale-[0.98]"
              >
                {CHECK.bottone}
              </a>
            </div>
            <ul className="mt-4 hidden flex-wrap gap-x-5 gap-y-1.5 border-t border-bordo/60 pt-4 sm:flex">
              {CHECK.punti.map((punto) => (
                <li key={punto} className="flex items-center gap-2">
                  <Check aria-hidden="true" strokeWidth={2.8} className="h-3 w-3 text-verde" />
                  <span className="text-[12.5px] text-fumo">{punto}</span>
                </li>
              ))}
            </ul>
          </div>
        </Anima>

        {/* I due biglietti: la pratica e la famiglia, carte d'imbarco. */}
        <AnimaLista className="mx-auto mt-6 grid max-w-[880px] gap-6 md:grid-cols-2" passo={0.1}>
          {CARTE.map((p) => (
            <Figlio key={p.nome} className="flex">
              <div
                className={`flex flex-1 flex-col overflow-hidden rounded-3xl border bg-white ${
                  p.evidenza
                    ? "border-verde shadow-[0_32px_70px_-28px_rgba(10,157,92,.5)]"
                    : "border-bordo/70 shadow-[0_18px_44px_-32px_rgba(5,46,31,.3)]"
                }`}
              >
                {/* la fascia del documento, come sulla carta d'imbarco */}
                <div className="flex items-center justify-between gap-3 bg-verde-notte px-6 py-2.5">
                  <span className="truncate text-[11px] font-medium uppercase tracking-[0.22em] text-menta/80">
                    {p.nome}
                  </span>
                  {p.nastro ? (
                    <span className="shrink-0 rounded-pillola bg-verde px-2.5 py-0.5 text-[11px] font-medium text-white">
                      {p.nastro}
                    </span>
                  ) : (
                    <span className="numeri shrink-0 text-[10px] uppercase tracking-[0.14em] text-white/50">
                      Boarding pass
                    </span>
                  )}
                </div>

                {/* il corpo del biglietto */}
                <div className="flex flex-1 flex-col px-6 pb-5 pt-5 sm:px-7">
                  <p className="text-[14px] leading-relaxed text-fumo">{p.descrizione}</p>

                  {/* Il prezzo grande col suffisso attaccato: "una volta
                      sola" sta accanto alla cifra, non a fondo pagina. */}
                  <p className="numeri mt-5 font-display text-[40px] font-medium leading-none tracking-[-0.04em] text-inchiostro">
                    {p.prezzo}
                    <span className="ml-2 font-sans text-[13px] font-normal tracking-normal text-fumo-2">
                      {p.periodo}
                    </span>
                  </p>

                  <ul className="mt-5 flex-1 space-y-2.5 border-t border-bordo/60 pt-5">
                    {p.punti.map((punto) => (
                      <li key={punto} className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-menta-tenue">
                          <Check
                            aria-hidden="true"
                            strokeWidth={2.8}
                            className="h-3 w-3 text-verde"
                          />
                        </span>
                        <span className="text-[13.5px] leading-relaxed text-fumo">{punto}</span>
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
                </div>

                {/* lo strappo e il tagliando col codice a barre */}
                <Strappo evidenza={p.evidenza} />
                <div className="px-6 pb-6 pt-4 sm:px-7">
                  <a
                    href="#controllo"
                    className={`block rounded-bottone py-3.5 text-center text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                      p.evidenza
                        ? "riflesso bg-verde shadow-[0_12px_28px_-12px_rgba(6,122,70,.75),0_2px_0_0_rgba(255,255,255,.22)_inset] hover:bg-verde-scuro"
                        : "bg-inchiostro hover:bg-inchiostro/85"
                    }`}
                  >
                    {p.bottone}
                  </a>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <Barre seme={p.nome} />
                    <p className="numeri shrink-0 text-[9.5px] uppercase tracking-[0.2em] text-fumo-2">
                      Rivoglio · Reg. CE 261/2004
                    </p>
                  </div>
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
