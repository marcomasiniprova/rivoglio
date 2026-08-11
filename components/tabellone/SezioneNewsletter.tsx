import CatturaEmail from "./CatturaEmail";
import Sigillo from "./Sigillo";

/**
 * LA SEZIONE NEWSLETTER.
 *
 * È lo stesso blocco dell'apertura, elemento per elemento: occhiello,
 * titolo con la seconda parte in corsivo, due righe, campo email, adesivo
 * olografico. Cambiano solo il fondo (verde notte invece che carta) e le
 * parole. Richiesta esplicita di Valerio, ed è anche la scelta giusta:
 * un lettore che scorre fino in fondo ha già letto tutto, e ritrovare la
 * stessa forma gli dice che è la stessa cosa, non un'altra offerta.
 *
 * Sotto, la promessa di cosa arriva davvero: l'Osservatorio dei
 * Disservizi, che esiste già e non è una lista da riempire un giorno.
 */
export default function SezioneNewsletter({
  compatta = false,
}: {
  /** Dentro un articolo il blocco è più basso e senza adesivo. */
  compatta?: boolean;
}) {
  return (
    <section
      id="newsletter"
      className={compatta ? "scroll-mt-24" : "scroll-mt-24 px-5 pb-[4.75rem] pt-8 sm:px-8"}
    >
      <div
        className={`relative mx-auto overflow-hidden bg-verde-notte text-white ${
          compatta
            ? "rounded-[16px] px-6 py-10 sm:px-9"
            : "max-w-[1216px] rounded-[24px] px-6 py-[3.25rem] sm:px-14 sm:py-16"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/2 h-[320px] w-[620px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[110px]"
          style={{ background: "var(--color-menta)" }}
        />

        {!compatta && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-30px] top-8 hidden w-[190px] rotate-[-8deg] lg:block xl:right-10"
          >
            <Sigillo className="h-auto w-full" />
          </div>
        )}

        <div className={compatta ? "relative" : "relative mx-auto max-w-[680px] text-center"}>
          <p className="text-[14.5px] font-semibold text-menta">La newsletter</p>
          <h2
            className={`mt-2.5 font-display font-bold leading-[1.05] tracking-[-0.035em] text-white ${
              compatta ? "text-[clamp(1.6rem,4.6vw,2.1rem)]" : "text-[clamp(2.1rem,5vw,3.2rem)]"
            }`}
          >
            L&apos;Osservatorio{" "}
            <span className="corsivo font-normal text-menta">dei Disservizi</span>
          </h2>
          <p
            className={`mt-4 text-[16.5px] leading-relaxed text-white/70 ${
              compatta ? "" : "mx-auto max-w-[560px]"
            }`}
          >
            Ogni settimana i 10 voli più in ritardo sui cieli italiani, presi dai dati
            che verifichiamo per i check. Chi ha volato peggio, da quale scalo, e quanto.
          </p>

          <div className={compatta ? "mt-6" : "mt-8 flex justify-center"}>
            <CatturaEmail
              tono="scuro"
              bottone="Iscrivimi"
              segnaposto="La tua email"
              larghezza={compatta ? "max-w-[420px]" : "max-w-[440px]"}
            />
          </div>
          <p className="mt-3 text-[13px] text-white/45">
            Solo l&apos;Osservatorio, niente promozioni. Si annulla con un clic.
          </p>
        </div>
      </div>
    </section>
  );
}
