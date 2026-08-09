import CatturaEmail from "./CatturaEmail";
import Sigillo from "./Sigillo";

/**
 * L'apertura del Tabellone, elemento per elemento come nel riferimento:
 * occhiello piccolo, titolo grosso con la seconda parte in corsivo serif,
 * due righe di spiegazione, il campo email, e l'adesivo olografico che
 * sborda sulla destra.
 *
 * L'adesivo sparisce sotto i 1024px: nel riferimento è decorazione, e su
 * un telefono ruberebbe la riga al titolo.
 */
export default function HeroTabellone({
  occhiello = "Il blog di Rivolio",
  titolo = "Il Tabellone",
  corsivo = "di Rivolio",
  testo = "Ogni settimana una cosa sola, spiegata bene: cosa ti spetta quando un volo va storto, come si chiede, e quanto ci provano a non dartelo. Niente gergo, niente promesse.",
}: {
  occhiello?: string;
  titolo?: string;
  corsivo?: string;
  testo?: string;
}) {
  return (
    <section className="relative overflow-hidden px-5 pb-4 pt-16 sm:px-8 sm:pt-24">
      <div className="relative mx-auto max-w-[1216px]">
        {/* l'adesivo olografico */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-40px] top-2 hidden w-[210px] rotate-[9deg] lg:block xl:right-4 xl:w-[236px]"
        >
          <Sigillo className="h-auto w-full" />
        </div>

        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-[15px] font-semibold text-verde-scuro">{occhiello}</p>
          <h1 className="mt-3 font-display text-[clamp(2.6rem,7vw,4.3rem)] font-bold leading-[1.02] tracking-[-0.04em] text-verde-notte">
            {titolo}{" "}
            <span className="corsivo font-normal">{corsivo}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[620px] text-[17.5px] leading-relaxed text-verde-notte/70">
            {testo}
          </p>

          <div className="mt-8 flex justify-center">
            <CatturaEmail bottone="Iscrivimi" segnaposto="La tua email" />
          </div>
          <p className="mt-3 text-[13px] text-verde-notte/45">
            Una email a settimana. Si annulla con un clic.
          </p>
        </div>
      </div>
    </section>
  );
}
