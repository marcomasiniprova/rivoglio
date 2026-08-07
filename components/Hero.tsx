import TelefonoAlert from "./TelefonoAlert";
import Macchina from "./Macchina";
import SfondoColonne from "./SfondoColonne";
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
        <p className="numeri mt-1.5 font-display text-[28px] font-medium leading-none">
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
          <p className="text-[13.5px] font-medium">Arriva come notifica</p>
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-fumo">
          Con suono, su iPhone e Android. Apri e il conto è già fatto.
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
        <p className="numeri mt-1.5 font-display text-[28px] font-medium leading-none">
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
    <section className="cielo relative -mt-[72px] overflow-hidden px-5 pb-20 pt-[124px] sm:-mt-[84px] sm:px-8 sm:pb-24 sm:pt-[170px]">
      <SfondoColonne />
      <span className="alone" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl text-center">
        <Anima ritardo={0.06}>
          {/* Il titolo cambia carattere a metà: la seconda riga è un serif
              corsivo. È un cambio di voce, non di colore: si legge come
              scritto a mano invece che generato. */}
          <h1 className="luce-testo text-[clamp(2.45rem,8.4vw,4.9rem)] leading-[0.98]">
            La tua fuga.
            <br />
            <span className="corsivo text-verde-scuro">Al prezzo giusto.</span>
          </h1>
        </Anima>

        <Anima ritardo={0.16}>
          <p className="mt-6 text-[15px] text-fumo sm:text-[17px]">
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

        <Anima ritardo={0.24}>
          <p className="mx-auto mt-5 max-w-[34rem] text-[15.5px] leading-relaxed text-fumo sm:mt-6 sm:text-[17px]">
            Imposti da dove parti e quanto vuoi spendere. Ti segnalo una destinazione quando esiste
            una micro-vacanza di 1-3 notti sotto la tua soglia, col prezzo totale già
            calcolato: alloggio e viaggio.
          </p>
        </Anima>

        <Anima ritardo={0.32}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#iscriviti"
              className="riflesso group inline-flex w-full items-center justify-center gap-2 rounded-bottone bg-verde px-7 py-4 text-[16px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(6,122,70,.75),0_2px_0_0_rgba(255,255,255,.22)_inset] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro hover:shadow-[0_18px_40px_-14px_rgba(6,122,70,.85),0_2px_0_0_rgba(255,255,255,.22)_inset] sm:w-auto"
            >
              Mettiti in lista: 3 destinazioni gratis
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
            <a
              href="#dentro"
              className="vetro-bottone inline-flex w-full items-center justify-center gap-2.5 rounded-bottone px-7 py-4 text-[16px] font-medium text-inchiostro transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-inchiostro text-[9px] text-white">
                ▶
              </span>
              Guarda com&apos;è dentro
            </a>
          </div>
        </Anima>

        <Anima ritardo={0.4}>
          {/* Il gancio sta QUI e non sopra il titolo: sopra sarebbe
              un'etichetta, qui è la ragione per cui ti fermi a leggere. */}
          <div className="mt-7 flex flex-col items-center gap-2.5 text-[13.5px] text-fumo sm:flex-row sm:justify-center sm:gap-5">
            <span className="vetro inline-flex items-center gap-2 rounded-pillola px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sole" />
              40 milioni di italiani non partiranno ad agosto
            </span>
            <span className="text-fumo-2">
              Nessun abbonamento. Nessun rinnovo automatico.
            </span>
          </div>
        </Anima>
      </div>

      <div className="relative mx-auto mt-16 max-w-[1000px]">
        <Anima ritardo={0.48}>
          <TelefonoAlert />
        </Anima>

        {cards.map((c, i) => (
          <div
            key={i}
            className={`sali fluttua vetro absolute hidden w-[224px] rounded-2xl p-4 lg:block ${c.lato}`}
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
