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
    <section id="prezzi" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[.16em] text-mare">
            Prezzi
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            Paghi gli alert.
            <br />
            Non un abbonamento.
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-fumo">
            Un credito vale un alert ricevuto. Quando hai trovato la tua vacanza,
            smetti — e i crediti che ti restano rimangono lì per la prossima volta.
          </p>
        </div>

        {/* i 3 gratis */}
        <div className="mx-auto mt-12 flex max-w-xl items-center gap-4 rounded-2xl border border-mare/20 bg-menta-2/40 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mare font-display text-[19px] font-semibold text-menta">
            3
          </span>
          <p className="text-[15px] leading-relaxed text-inchiostro">
            <span className="font-semibold">I primi 3 alert sono gratis.</span>{" "}
            <span className="text-fumo">
              Alert veri, non una prova finta. Se non ti servo, non spendi un euro.
            </span>
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pacchetti.map((p) => (
            <div
              key={p.crediti}
              className={`relative rounded-[1.6rem] border p-7 transition-all ${
                p.consigliato
                  ? "border-mare bg-mare text-sabbia shadow-[0_28px_60px_-24px_rgba(13,92,70,.6)]"
                  : "border-sabbia-3 bg-white/70 hover:border-inchiostro/20"
              }`}
            >
              {p.consigliato && (
                <span className="absolute -top-3 left-7 rounded-pillola bg-menta px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-mare-scuro">
                  Il più preso
                </span>
              )}

              <p
                className={`font-display text-[44px] font-semibold leading-none ${p.consigliato ? "text-menta" : "text-inchiostro"}`}
              >
                {p.crediti}
              </p>
              <p
                className={`mt-1.5 text-[14px] ${p.consigliato ? "text-sabbia/70" : "text-fumo"}`}
              >
                crediti = {p.crediti} alert
              </p>

              <p
                className={`mt-6 font-display text-[30px] font-semibold leading-none ${p.consigliato ? "text-sabbia" : "text-inchiostro"}`}
              >
                {p.prezzo}€
              </p>
              <p
                className={`mt-1.5 text-[13px] ${p.consigliato ? "text-sabbia/55" : "text-fumo-2"}`}
              >
                {p.perAlert}€ ad alert · una volta sola
              </p>

              <a
                href="#iscriviti"
                className={`mt-7 block rounded-pillola py-3.5 text-center text-[15px] font-semibold transition-all ${
                  p.consigliato
                    ? "bg-menta text-mare-scuro hover:bg-menta-2"
                    : "bg-inchiostro text-sabbia hover:bg-mare-scuro"
                }`}
              >
                Inizia gratis
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-sabbia-3 pt-10 sm:grid-cols-3">
          {garanzie.map(([titolo, testo]) => (
            <div key={titolo}>
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <circle cx="8" cy="8" r="7.2" fill="var(--color-menta)" />
                  <path
                    d="m5 8.2 2 2 4-4.2"
                    fill="none"
                    stroke="var(--color-mare-scuro)"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {titolo}
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fumo">{testo}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
