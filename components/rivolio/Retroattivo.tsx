import { Anima } from "@/components/Anima";
import CercaInPosta from "./CercaInPosta";
import FinestreScadenza from "./FinestreScadenza";
import { COPY } from "@/lib/copy";

/**
 * Il gancio dei 5 anni: un volo di anni fa può valere ancora una pratica.
 * Le finestre sono STIMATE e la sezione lo dice due volte (etichetta sulla
 * card e avvertenza sotto): la prescrizione dichiarata come certezza è
 * esattamente il tipo di promessa che Rivolio non fa (SPEC §4).
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

          {/* Il consiglio pratico, RECITATO invece che scritto: la
              casella si cerca da sola e la mail salta fuori con numero e
              data evidenziati (CercaInPosta). La frase da sola era giusta
              e nessuno la eseguiva. */}
          <div className="mt-7">
            <CercaInPosta />
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
          <FinestreScadenza />

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
