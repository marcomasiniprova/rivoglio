import SchedaCheck from "@/components/check/SchedaCheck";

/**
 * IL GANCIO, dentro l'articolo.
 *
 * Non è un banner che rimanda alla home: è il check vero, lo stesso
 * componente dell'hero. Il motivo è di conversione: chi sta leggendo
 * "come si chiede il rimborso" ha appena capito quanti passaggi servono,
 * ed è l'istante in cui vale la pena provarci. Mandarlo su un'altra
 * pagina in quell'istante costa metà delle persone.
 *
 * Va messo a METÀ articolo, non solo in fondo.
 */
export default function BoxCheck({
  titolo = "Controlla il tuo volo, gratis",
  testo = "Non serve un account e non serve la carta. Ti dico cosa dicono i dati ufficiali del tuo volo e se il caso regge.",
}: {
  titolo?: string;
  testo?: string;
}) {
  return (
    <aside className="not-prose my-10 overflow-hidden rounded-[18px] border border-verde-notte/12 bg-white shadow-[0_24px_60px_-40px_rgba(5,46,31,.5)]">
      <div className="border-b border-verde-notte/10 bg-verde-notte px-6 py-5 sm:px-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-menta">
          Il check di Rivolio
        </p>
        <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[25px]">
          {titolo}
        </h3>
        <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-white/70">{testo}</p>
      </div>
      <div className="px-5 py-6 sm:px-8 sm:py-7">
        <SchedaCheck />
      </div>
    </aside>
  );
}
