const passi = [
  {
    n: "1",
    titolo: "Dici cosa ti serve",
    testo:
      "Da dove parti, quanto vuoi spendere, quante notti, quante ore di viaggio ti va di fare. Due minuti, una volta sola.",
  },
  {
    n: "2",
    titolo: "Cerco io. Tu no.",
    testo:
      "Ogni giorno controllo le offerte e calcolo quanto ti costa davvero arrivarci. Se non sta sotto la tua soglia, non ti scrivo.",
  },
  {
    n: "3",
    titolo: "Ti arriva quando c'è",
    testo:
      "Una notifica con il prezzo totale, quanto ci metti e il link per prenotare. Se non c'è niente di buono, non ti disturbo.",
  },
];

export default function Passi() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20">
          <div>
            <h2 className="text-[clamp(2.1rem,5vw,3.3rem)]">
              Parti in tre
              <br />
              minuti.
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-fumo">
              Nessuna app da installare, nessuna carta da lasciare. I primi tre alert te li
              regalo.
            </p>
            <a
              href="#iscriviti"
              className="group mt-7 inline-flex items-center gap-2 rounded-pillola bg-verde px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(10,157,92,.7)] transition-all hover:bg-verde-scuro"
            >
              Provalo gratis
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </div>

          <ol className="relative space-y-5">
            {passi.map((p) => (
              <li
                key={p.n}
                className="flex gap-5 rounded-[1.5rem] border border-bordo/70 bg-white p-6 transition-all hover:shadow-[0_18px_40px_-24px_rgba(5,46,31,.3)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-verde font-display text-[16px] font-medium text-white">
                  {p.n}
                </span>
                <div>
                  <h3 className="text-[19px]">{p.titolo}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-fumo">{p.testo}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
