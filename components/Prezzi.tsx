import Link from "next/link";
import { Anima } from "./Anima";

const pacchetti = [
  { crediti: 5, prezzo: "3,99", perAlert: "0,80" },
  { crediti: 20, prezzo: "12,99", perAlert: "0,65", consigliato: true },
  { crediti: 50, prezzo: "24,99", perAlert: "0,50" },
];

const garanzie = [
  ["Nessun abbonamento", "Non c'è niente da disdire, perché non si rinnova niente."],
  ["I crediti non scadono", "Li usi ad agosto o a febbraio. Sono tuoi."],
  ["Il tetto lo decidi tu", "Imposti quanti alert vuoi al massimo a settimana. Sopra quello non parte niente, e non paghi niente."],
];

export default function Prezzi() {
  return (
    <section id="prezzi" className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(2.1rem,5vw,3.3rem)]">
            Paghi gli alert.
            <br />
            Non un abbonamento.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            Un credito vale un alert ricevuto. Quando trovi la vacanza smetti, e i crediti
            che restano valgono per la prossima volta.
          </p>
        </Anima>

        <Anima
          ritardo={0.08}
          className="mx-auto mt-11 flex max-w-xl items-center gap-4 rounded-2xl border border-verde/25 bg-menta-tenue p-5"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-verde font-display text-[19px] font-medium text-white">
            3
          </span>
          <p className="text-[15px] leading-relaxed">
            <span className="font-medium">I primi 3 alert sono gratuiti.</span>{" "}
            <span className="text-fumo">
              Alert reali, non una prova limitata. Se il servizio non ti è utile, non
              spendi nulla.
            </span>
          </p>
        </Anima>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {pacchetti.map((p, i) => (
            <Anima
              key={p.crediti}
              ritardo={i * 0.1}
              className={`relative rounded-[1.5rem] border p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                p.consigliato
                  ? "border-verde bg-verde text-white shadow-[0_28px_60px_-24px_rgba(10,157,92,.6)]"
                  : "border-bordo/70 bg-white"
              }`}
            >
              {p.consigliato && (
                <span className="absolute -top-3 left-7 rounded-pillola bg-menta px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-verde-notte">
                  Il più preso
                </span>
              )}

              <p
                className={`font-display text-[46px] font-medium leading-none tracking-[-0.04em] ${
                  p.consigliato ? "text-white" : "text-inchiostro"
                }`}
              >
                {p.crediti}
              </p>
              <p className={`mt-1.5 text-[14px] ${p.consigliato ? "text-white/70" : "text-fumo"}`}>
                crediti = {p.crediti} alert
              </p>

              <p
                className={`mt-6 font-display text-[30px] font-medium leading-none ${
                  p.consigliato ? "text-menta" : "text-inchiostro"
                }`}
              >
                {p.prezzo}€
              </p>
              <p className={`mt-1.5 text-[13px] ${p.consigliato ? "text-white/55" : "text-fumo-2"}`}>
                {p.perAlert}€ ad alert · una volta sola
              </p>

              <Link
                href="/entra?modo=registrati"
                className={`mt-7 block rounded-pillola py-3.5 text-center text-[15px] font-medium transition-all ${
                  p.consigliato
                    ? "bg-white text-verde hover:bg-menta hover:text-verde-notte"
                    : "bg-inchiostro text-white hover:bg-verde-notte"
                }`}
              >
                Inizia gratis
              </Link>
            </Anima>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-bordo pt-10 sm:grid-cols-3">
          {garanzie.map(([t, d]) => (
            <div key={t}>
              <p className="flex items-center gap-2 text-[15px] font-medium">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <circle cx="8" cy="8" r="7.2" fill="var(--color-menta)" />
                  <path
                    d="m5 8.2 2 2 4-4.2"
                    fill="none"
                    stroke="var(--color-verde-notte)"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t}
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fumo">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
