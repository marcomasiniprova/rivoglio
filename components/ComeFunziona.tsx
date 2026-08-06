const passi = [
  {
    n: "01",
    titolo: "Dici cosa ti serve. Una volta sola.",
    testo:
      "Da dove parti, quanto vuoi spendere a persona, quante notti, quante ore di viaggio ti va di fare. Mare, monte, città o terme. Ci metti due minuti.",
    dettaglio: ["Da Milano", "max 120€", "1–3 notti", "entro 2h30", "mare"],
  },
  {
    n: "02",
    titolo: "Cerco io. Tu no.",
    testo:
      "Ogni giorno controllo le offerte e calcolo quanto ti costa davvero arrivarci: alloggio più benzina più pedaggi, diviso per quanti siete. Se non sta sotto la tua soglia, non ti scrivo.",
    dettaglio: ["alloggio", "+ benzina", "+ pedaggi", "÷ persone"],
  },
  {
    n: "03",
    titolo: "Ti arriva quando c'è.",
    testo:
      "Una notifica su Telegram, o una mail se preferisci. Dentro c'è il prezzo totale, quanto ci metti ad arrivare e il link per prenotare. Se non c'è niente di buono, non ti disturbo.",
    dettaglio: ["Telegram", "email", "notifica"],
  },
];

export default function ComeFunziona() {
  return (
    <section id="come-funziona" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[.16em] text-mare">
            Come funziona
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            Tre minuti adesso.
            <br />
            Poi non cerchi più.
          </h2>
        </div>

        <ol className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-3">
          {passi.map((p) => (
            <li key={p.n} className="relative">
              <div className="flex items-center gap-3">
                <span className="font-display text-[15px] font-semibold text-mare">
                  {p.n}
                </span>
                <span className="h-px flex-1 bg-sabbia-3" />
              </div>

              <h3 className="mt-5 font-display text-[24px] font-semibold leading-snug tracking-tight">
                {p.titolo}
              </h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-fumo">{p.testo}</p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.dettaglio.map((d) => (
                  <span
                    key={d}
                    className="rounded-pillola border border-sabbia-3 bg-white/70 px-3 py-1.5 text-[12.5px] font-medium text-fumo"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
