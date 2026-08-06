import { Anima } from "./Anima";

const casi = [
  {
    t: "Chi ha solo il weekend",
    d: "Lavori tutta la settimana e ti restano due giorni. Trovi qualcosa a un paio d'ore da casa senza doverlo cercare.",
  },
  {
    t: "Coppie che vogliono staccare",
    d: "Due notti, prezzo chiaro, nessuna sorpresa al momento di pagare. Sapete quanto spendete prima di partire.",
  },
  {
    t: "Famiglie con bambini piccoli",
    d: "Filtri il tempo di viaggio, perché con i bambini tre ore in auto sono un'altra cosa. Il costo viene diviso per il numero di persone.",
  },
  {
    t: "Chi lavora da remoto",
    d: "Cambi aria a metà settimana, quando costa meno. Imposti tre notti infrasettimanali e aspetti la notifica.",
  },
  {
    t: "Chi decide all'ultimo",
    d: "Non pianifichi con mesi di anticipo. Ti serve sapere cosa c'è adesso, sotto il tuo budget, nei prossimi giorni.",
  },
  {
    t: "Chi ad agosto è rimasto a casa",
    d: "Il budget per la settimana al mare non c'era. Per due notti sotto i 120 euro forse sì.",
  },
];

export default function PerChi() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Anima className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(2.1rem,5vw,3.3rem)]">Per chi è fatto</h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            Non serve a chi programma le ferie a gennaio. Serve a chi vorrebbe partire
            adesso e non ha tempo di confrontare dieci siti.
          </p>
        </Anima>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {casi.map((c, i) => (
            <Anima key={c.t} ritardo={(i % 3) * 0.09} className="h-full">
              <div className="h-full rounded-[1.5rem] border border-bordo/70 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-verde/25 hover:shadow-[0_20px_45px_-24px_rgba(5,46,31,.3)]">
                <h3 className="text-[19px] leading-snug">{c.t}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-fumo">{c.d}</p>
              </div>
            </Anima>
          ))}
        </div>
      </div>
    </section>
  );
}
