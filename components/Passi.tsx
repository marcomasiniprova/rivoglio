import Link from "next/link";
import { Anima } from "./Anima";

const passi = [
  {
    n: "1",
    titolo: "Dici cosa ti serve",
    testo:
      "Da dove parti, quanto vuoi spendere, quante notti e quante ore di viaggio sei disposto a fare. Due minuti, una volta sola.",
  },
  {
    n: "2",
    titolo: "La ricerca va da sola",
    testo:
      "Ogni giorno vengono controllate le offerte e calcolato il costo reale per arrivarci. Se il totale supera la tua soglia, non ricevi niente.",
  },
  {
    n: "3",
    titolo: "Ricevi la notifica",
    testo:
      "Prezzo totale, tempo di viaggio e link per prenotare. Se non c'è niente che rispetta i tuoi limiti, non ti scriviamo.",
  },
];

export default function Passi() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20">
          <Anima>
            <h2 className="text-[clamp(2.1rem,5vw,3.3rem)]">
              Attiva in tre
              <br />
              minuti.
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-fumo">
              Nessuna app da installare, nessuna carta da lasciare. Le prime tre destinazioni sono
              gratuiti.
            </p>
            <Link
              href="/entra?modo=registrati"
              className="group mt-7 inline-flex items-center gap-2 rounded-pillola bg-verde px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(10,157,92,.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro hover:shadow-[0_16px_40px_-14px_rgba(10,157,92,.8)]"
            >
              Provalo gratis
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </Link>
          </Anima>

          <ol className="space-y-5">
            {passi.map((p, i) => (
              <li key={p.n}>
                <Anima ritardo={i * 0.11}>
                  <div className="group flex gap-5 rounded-[1.5rem] border border-bordo/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-verde/25 hover:shadow-[0_20px_45px_-24px_rgba(5,46,31,.3)]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-verde font-display text-[16px] font-medium text-white transition-transform duration-300 group-hover:scale-110">
                      {p.n}
                    </span>
                    <div>
                      <h3 className="text-[19px]">{p.titolo}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-fumo">
                        {p.testo}
                      </p>
                    </div>
                  </div>
                </Anima>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
