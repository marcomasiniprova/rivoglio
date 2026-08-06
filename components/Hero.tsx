import Link from "next/link";
import TelefonoAlert from "./TelefonoAlert";
import Macchina from "./Macchina";
import { Anima } from "./Anima";
import { ESEMPIO, CONTO, euro } from "@/lib/esempio";

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
          Trovata a {euro(CONTO.totalePersona)}. Ti restano {euro(CONTO.avanzo)}.
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
          Notifica con suono, anche su iPhone. Nessuna app da installare.
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
          In ore di viaggio, non in chilometri.
        </p>
      </>
    ),
  },
];

export default function Hero() {
  return (
    <section className="cielo relative -mt-[72px] overflow-hidden px-5 pb-20 pt-[124px] sm:-mt-[84px] sm:pb-24 sm:px-8 sm:pt-[170px]">
      <div className="relative mx-auto max-w-3xl text-center">
        <Anima ritardo={0.05}>
          <p className="inline-flex items-center gap-2 rounded-pillola border border-white/70 bg-white/70 px-3.5 py-1.5 text-[12px] text-fumo backdrop-blur sm:px-4 sm:text-[13px]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sole" />
            40 milioni di italiani non partiranno ad agosto
          </p>
        </Anima>

        <Anima ritardo={0.14}>
          <h1 className="mt-6 text-[clamp(2.35rem,8.2vw,4.6rem)] sm:mt-7">
            La tua fuga.
            <br />
            Al prezzo giusto.
          </h1>
        </Anima>

        <Anima ritardo={0.2}>
          <p className="mt-5 text-[15px] text-fumo sm:text-[17px]">
            Cerchi{" "}
            <Macchina
              className="font-medium text-inchiostro"
              frasi={[
                "due notti al mare",
                "una fuga in montagna",
                "un weekend alle terme",
                "due giorni in una città d'arte",
              ]}
            />
          </p>
        </Anima>

        <Anima ritardo={0.28}>
          <p className="mx-auto mt-5 max-w-[36rem] text-[15.5px] leading-relaxed text-fumo sm:mt-6 sm:text-[17px]">
            Imposti da dove parti e quanto vuoi spendere. Ricevi una notifica quando esiste
            una micro-vacanza di 1-3 notti sotto la tua soglia, col prezzo totale già
            calcolato: alloggio e viaggio.
          </p>
        </Anima>

        <Anima ritardo={0.34}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/entra?modo=registrati"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-pillola bg-verde px-7 py-4 text-[16px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(10,157,92,.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro hover:shadow-[0_16px_40px_-12px_rgba(10,157,92,.75)] sm:w-auto"
            >
              Provalo con 3 alert gratis
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </Link>
            <a
              href="#funzioni"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-pillola bg-white px-7 py-4 text-[16px] font-medium text-inchiostro shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-inchiostro text-[9px] text-white">
                ▶
              </span>
              Guarda come funziona
            </a>
          </div>
        </Anima>

        <Anima ritardo={0.42}>
          <p className="mt-4 text-[13.5px] text-fumo-2">
            Nessun abbonamento. Nessun rinnovo automatico.
          </p>
        </Anima>
      </div>

      <div className="relative mx-auto mt-16 max-w-[1000px]">
        <Anima ritardo={0.5}>
          <TelefonoAlert />
        </Anima>

        {cards.map((c, i) => (
          <div
            key={i}
            className={`sali fluttua absolute hidden w-[224px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_24px_50px_-20px_rgba(5,46,31,.3)] backdrop-blur-md lg:block ${c.lato}`}
            style={
              {
                "--rot": c.rot,
                animationDelay: `${0.85 + i * 0.14}s, ${i * 1.1}s`,
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
