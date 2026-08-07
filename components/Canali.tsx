import { Anima } from "./Anima";

const canali = [
  {
    t: "Telegram",
    d: "Il canale migliore. Arriva come una notifica di sistema, con suono, anche su iPhone.",
    forte: true,
  },
  { t: "Email", d: "Il canale di riserva: arriva sempre, senza installare nulla." },
  {
    t: "Notifica del browser",
    d: "Su Android basta un tocco. Su iPhone serve aggiungere il sito alla schermata Home.",
  },
];

const fonti = [
  { t: "MIMIT", d: "Prezzo medio dei carburanti, aggiornato ogni settimana" },
  { t: "ISTAT", d: "Elenco dei comuni italiani e relative coordinate" },
  { t: "OpenStreetMap", d: "Distanze e tempi di percorrenza reali su strada" },
];

export default function Canali() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-2 lg:gap-20">
        <Anima>
          <h2 className="luce-testo text-[clamp(1.9rem,4vw,2.7rem)]">Come ti <span className="corsivo text-verde-scuro">arriva</span></h2>
          <p className="mt-4 text-[16px] leading-relaxed text-fumo">
            Scegli tu il canale. Non c&apos;è nessuna app da scaricare: la notifica arriva
            dove sei già.
          </p>
          <div className="mt-7 space-y-3">
            {canali.map((c) => (
              <div
                key={c.t}
                className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                  c.forte
                    ? "border-verde/25 bg-menta-tenue"
                    : "border-bordo/70 bg-white hover:border-verde/25"
                }`}
              >
                <p className="flex items-center gap-2 text-[16px] font-medium">
                  {c.t}
                  {c.forte && (
                    <span className="rounded-pillola bg-verde px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white">
                      consigliato
                    </span>
                  )}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-fumo">{c.d}</p>
              </div>
            ))}
          </div>
        </Anima>

        <Anima ritardo={0.12}>
          <h2 className="luce-testo text-[clamp(1.9rem,4vw,2.7rem)]">Da dove arrivano <span className="corsivo text-verde-scuro">i dati</span></h2>
          <p className="mt-4 text-[16px] leading-relaxed text-fumo">
            Fonti pubbliche e verificabili. Nessun numero senza origine.
          </p>
          <div className="mt-7 space-y-3">
            {fonti.map((f) => (
              <div
                key={f.t}
                className="rounded-2xl border border-bordo/70 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-verde/25"
              >
                <p className="text-[16px] font-medium">{f.t}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-fumo">{f.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13.5px] leading-relaxed text-fumo-2">
            Il prezzo dell&apos;alloggio viene dalla struttura o dal portale che lo vende.
            Nel messaggio trovi sempre il link per verificarlo.
          </p>
        </Anima>
      </div>
    </section>
  );
}
