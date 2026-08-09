import { Anima } from "@/components/Anima";
import { COPY } from "@/lib/copy";

/**
 * Chi fa cosa: due colonne, e la seconda è molto più lunga della prima.
 *
 * Perché esiste (feedback esterno del 9/08): "il lavoro resta a carico
 * tuo". Il reclamo lo manda davvero l'utente, e non è un ripiego: le low
 * cost dichiarano per iscritto che lavorano solo i reclami inviati dal
 * passeggero, ed è lo stesso motivo per cui la compensazione arriva
 * intera senza passare da noi. Quello che si poteva togliere è la
 * fatica, non il gesto: qui si dice quanta ne resta, in numeri.
 *
 * Lo squilibrio fra le due colonne È il messaggio: tre righe da una
 * parte, quattro più lunghe dall'altra.
 */
const S = COPY.divisione;

function Colonna({
  titolo,
  tempo,
  voci,
  nostra,
}: {
  titolo: string;
  tempo: string;
  voci: readonly string[];
  nostra: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-6 sm:p-7 ${
        nostra ? "border-verde/30 bg-verde-notte text-white" : "border-bordo bg-white"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3
          className={`font-display text-[21px] font-medium tracking-[-0.02em] ${
            nostra ? "text-white" : "text-inchiostro"
          }`}
        >
          {titolo}
        </h3>
        <span
          className={`rounded-pillola px-2.5 py-0.5 text-[11.5px] font-medium ${
            nostra ? "bg-menta/15 text-menta" : "bg-menta-tenue text-verde-scuro"
          }`}
        >
          {tempo}
        </span>
      </div>

      <ol className="mt-5 space-y-3.5">
        {voci.map((v, i) => (
          <li key={v} className="flex gap-3">
            <span
              className={`mt-[1px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[11.5px] font-semibold ${
                nostra ? "bg-menta/15 text-menta" : "bg-menta-tenue text-verde-scuro"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-[14.5px] leading-relaxed ${nostra ? "text-white/75" : "text-fumo"}`}
            >
              {v}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ChiFaCosa() {
  return (
    <section id="chi-fa-cosa" className="scroll-mt-24 px-5 pb-16 sm:px-8 sm:pb-20">
      <div className="mx-auto max-w-[1000px]">
        <Anima className="text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-verde">
            {S.occhiello}
          </p>
          <h2 className="luce-testo mt-3 text-[clamp(1.9rem,4.4vw,2.8rem)] leading-[1.05]">
            {S.titolo}
          </h2>
        </Anima>

        <Anima ritardo={0.06} className="mt-9 grid gap-5 md:grid-cols-2">
          <Colonna
            titolo={S.tuo.titolo}
            tempo={S.tuo.tempo}
            voci={S.tuo.voci}
            nostra={false}
          />
          <Colonna
            titolo={S.nostro.titolo}
            tempo={S.nostro.tempo}
            voci={S.nostro.voci}
            nostra
          />
        </Anima>

        <Anima ritardo={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-[14px] leading-relaxed text-fumo">
            {S.perche}
          </p>
        </Anima>
      </div>
    </section>
  );
}
