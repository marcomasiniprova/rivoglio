import { Anima } from "./Anima";

const funzioni = [
  {
    titolo: "La soglia la scegli tu",
    testo: "Dici quanto vuoi spendere a persona. Sopra quella cifra non ti mostro niente.",
    icona: "M12 2v20M17 5.5H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6",
  },
  {
    titolo: "Conto il viaggio, non solo il letto",
    testo: "Benzina ai prezzi medi del giorno, pedaggi, diviso per quanti siete. Il totale vero.",
    icona: "M5 17h14M6.5 17V9.5l1.8-4h7.4l1.8 4V17M8 20v-3M16 20v-3M9 13h6",
  },
  {
    titolo: "Ore, non chilometri",
    testo: "Filtri per quanto ci metti ad arrivarci. Duecento km in Liguria non sono duecento km in pianura.",
    icona: "M12 7v5l3.2 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z",
  },
  {
    titolo: "Ti scrivo solo se vale",
    testo: "Imposti quante destinazioni vuoi al massimo a settimana. Sopra il tetto non parte niente, e non paghi niente.",
    icona: "M18 9A6 6 0 1 0 6 9c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9ZM13.7 20a2 2 0 0 1-3.4 0",
  },
];

function TelefonoRicerca() {
  const campi = [
    ["Da dove parti", "Bologna"],
    ["Quanto vuoi spendere", "max 120€ a persona"],
    ["Quante notti", "1 – 3"],
    ["Quanto lontano", "entro 2h30"],
  ];
  return (
    <div className="relative mx-auto w-[236px] rounded-[2.2rem] bg-[#111] p-2 shadow-[0_36px_70px_-28px_rgba(5,46,31,.45)]">
      <div className="overflow-hidden rounded-[1.8rem] bg-white px-3.5 pb-5 pt-4">
        <p className="font-display text-[17px] font-medium leading-tight">
          Imposta la tua
          <br />
          ricerca
        </p>
        <p className="mt-1 text-[10.5px] text-fumo">Ci metti due minuti. Una volta sola.</p>

        <div className="mt-3.5 space-y-2">
          {campi.map(([et, v]) => (
            <div key={et} className="rounded-xl border border-bordo bg-nebbia px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-fumo-2">{et}</p>
              <p className="mt-0.5 text-[12px] font-medium">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1">
          {["mare", "monte", "città", "terme"].map((t, i) => (
            <span
              key={t}
              className={`rounded-pillola px-2 py-1 text-[9.5px] font-medium ${
                i < 2
                  ? "bg-menta-tenue text-verde-scuro"
                  : "border border-bordo text-fumo-2"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3 rounded-pillola bg-verde py-2.5 text-center text-[11.5px] font-semibold text-white">
          Attiva la ricerca
        </div>
      </div>
    </div>
  );
}

export default function Funzioni() {
  return (
    <section id="funzioni" className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <h2 className="luce-testo text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.02]">
            Una ricerca sola.
            <br />
            <span className="corsivo text-verde-scuro">Poi non cerchi più.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            Imposti i tuoi criteri una volta. Da quel momento la ricerca è automatica e
            ricevi una notifica solo quando esiste qualcosa che rispetta i tuoi limiti.
          </p>
        </Anima>

        {/* la griglia di Zentivo: due card, telefono al centro, due card */}
        <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <div className="grid gap-5">
            {funzioni.slice(0, 2).map((f, i) => (
              <Card key={f.titolo} {...f} ritardo={i * 0.1} />
            ))}
          </div>

          <Anima
            ritardo={0.1}
            className="grid place-items-center rounded-[1.75rem] bg-gradient-to-b from-menta-tenue to-white px-6 py-10"
          >
            <TelefonoRicerca />
          </Anima>

          <div className="grid gap-5">
            {funzioni.slice(2).map((f, i) => (
              <Card key={f.titolo} {...f} ritardo={0.2 + i * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  titolo,
  testo,
  icona,
  ritardo,
}: {
  titolo: string;
  testo: string;
  icona: string;
  ritardo: number;
}) {
  return (
    <Anima ritardo={ritardo} className="h-full">
      <div className="group h-full rounded-[1.5rem] border border-bordo/70 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-verde/25 hover:shadow-[0_20px_45px_-24px_rgba(5,46,31,.35)]">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-menta-tenue transition-transform duration-300 group-hover:scale-110">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d={icona}
              fill="none"
              stroke="var(--color-verde)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="mt-5 text-[20px]">{titolo}</h3>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-fumo">{testo}</p>
      </div>
    </Anima>
  );
}
