import TelefonoAlert from "./TelefonoAlert";
import { ESEMPIO, CONTO, euro } from "@/lib/esempio";

/** Le card che fluttuano ai lati del telefono, come in Zentivo. */
const cards = [
  {
    lato: "left-[54px] top-[118px]",
    rot: "-5deg",
    corpo: (
      <>
        <p className="text-[11px] font-medium uppercase tracking-wider text-fumo-2">
          Il tuo budget
        </p>
        <p className="mt-1.5 font-display text-[28px] font-medium leading-none">
          {euro(ESEMPIO.soglia)}
          <span className="ml-1.5 text-[12px] font-normal text-fumo">a persona</span>
        </p>
        <div className="mt-3 h-[7px] w-full overflow-hidden rounded-full bg-nebbia-2">
          <div
            className="h-full rounded-full bg-verde"
            style={{ width: `${Math.round((CONTO.totalePersona / ESEMPIO.soglia) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-fumo">
          Trovata a {euro(CONTO.totalePersona)} · ti avanzano {euro(CONTO.avanzo)}
        </p>
      </>
    ),
  },
  {
    lato: "right-[46px] top-[66px]",
    rot: "4.5deg",
    corpo: (
      <>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-menta-tenue">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="m21 4-9.5 8.5L3 9.6 21 4 17.4 20l-4.3-5"
                fill="none"
                stroke="var(--color-verde)"
                strokeWidth="1.9"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="text-[13.5px] font-medium">Arriva su Telegram</p>
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-fumo">
          Come una notifica normale, con suono. Anche su iPhone, senza installare niente.
        </p>
      </>
    ),
  },
  {
    lato: "right-[72px] bottom-[46px]",
    rot: "-3.5deg",
    corpo: (
      <>
        <p className="text-[11px] font-medium uppercase tracking-wider text-fumo-2">
          Quanto lontano
        </p>
        <p className="mt-1.5 font-display text-[28px] font-medium leading-none">
          2h30
          <span className="ml-1.5 text-[12px] font-normal text-fumo">al massimo</span>
        </p>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-fumo">
          In ore di viaggio, non in chilometri. È quello che conta davvero.
        </p>
      </>
    ),
  },
];

export default function Hero() {
  return (
    <section className="cielo relative -mt-[84px] overflow-hidden px-5 pb-24 pt-[150px] sm:px-8 sm:pt-[170px]">
      <div className="relative mx-auto max-w-3xl text-center">
        <p
          className="sali inline-flex items-center gap-2 rounded-pillola border border-white/70 bg-white/60 px-4 py-1.5 text-[13px] text-fumo backdrop-blur"
          style={{ animationDelay: ".05s" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-sole" />
          40 milioni di italiani non partiranno ad agosto
        </p>

        <h1
          className="sali mt-7 text-[clamp(2.9rem,7.4vw,4.6rem)]"
          style={{ animationDelay: ".14s" }}
        >
          La tua fuga.
          <br />
          Al prezzo giusto.
        </h1>

        <p
          className="sali mx-auto mt-6 max-w-[36rem] text-[17px] leading-relaxed text-fumo"
          style={{ animationDelay: ".24s" }}
        >
          Dimmi da dove parti e quanto vuoi spendere.{" "}
          <span className="text-inchiostro">Al resto ci penso io:</span> ti avviso quando
          esiste una fuga di 1–3 notti sotto la tua soglia. Prezzo totale, alloggio più
          viaggio.
        </p>

        <div
          className="sali mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: ".34s" }}
        >
          <a
            href="#iscriviti"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-pillola bg-verde px-7 py-4 text-[16px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(10,157,92,.65)] transition-all hover:bg-verde-scuro sm:w-auto"
          >
            Provalo con 3 alert gratis
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
          <a
            href="#funzioni"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-pillola bg-white px-7 py-4 text-[16px] font-medium text-inchiostro shadow-sm transition-all hover:shadow-md sm:w-auto"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-inchiostro text-[9px] text-white">
              ▶
            </span>
            Guarda com&apos;è fatto
          </a>
        </div>

        <p className="sali mt-4 text-[13.5px] text-fumo-2" style={{ animationDelay: ".42s" }}>
          Nessun abbonamento. Nessun rinnovo automatico.
        </p>
      </div>

      <div className="relative mx-auto mt-16 max-w-[1000px]">
        <div className="entra" style={{ animationDelay: ".5s" }}>
          <TelefonoAlert />
        </div>

        {cards.map((c, i) => (
          <div
            key={i}
            className={`sali fluttua absolute hidden w-[224px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_24px_50px_-20px_rgba(5,46,31,.3)] backdrop-blur-md lg:block ${c.lato}`}
            style={
              {
                "--rot": c.rot,
                animationDelay: `${0.75 + i * 0.13}s, ${i * 1.1}s`,
              } as React.CSSProperties
            }
          >
            {c.corpo}
          </div>
        ))}
      </div>
    </section>
  );
}
