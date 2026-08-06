import TelefonoAlert from "./TelefonoAlert";
import { ESEMPIO, CONTO, euro } from "@/lib/esempio";

/** Le card che fluttuano intorno al telefono: ognuna è una promessa del prodotto. */
const cardFluttuanti = [
  {
    lato: "left-0 top-[64px]",
    rot: "-5deg",
    ritardo: "0s",
    corpo: (
      <>
        <p className="text-[11px] font-medium uppercase tracking-wider text-fumo-2">
          Il tuo budget
        </p>
        <p className="mt-1 font-display text-[26px] font-semibold leading-none">
          {euro(ESEMPIO.soglia)}
          <span className="ml-1 text-[12px] font-normal text-fumo">a persona</span>
        </p>
        <div className="mt-3 h-[7px] w-full overflow-hidden rounded-full bg-sabbia-3">
          <div
            className="h-full rounded-full bg-mare"
            style={{
              width: `${Math.round((CONTO.totalePersona / ESEMPIO.soglia) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-fumo">
          Trovata a {euro(CONTO.totalePersona)} · ti avanzano {euro(CONTO.avanzo)}
        </p>
      </>
    ),
  },
  {
    lato: "right-0 top-[26px]",
    rot: "4.5deg",
    ritardo: "1.1s",
    corpo: (
      <>
        <p className="text-[11px] font-medium uppercase tracking-wider text-fumo-2">
          Quanto lontano
        </p>
        <p className="mt-1 font-display text-[26px] font-semibold leading-none">
          2h30
          <span className="ml-1 text-[12px] font-normal text-fumo">al massimo</span>
        </p>
        <p className="mt-2.5 text-[11px] leading-relaxed text-fumo">
          In ore di viaggio, non in chilometri. Perché è quello che conta davvero.
        </p>
      </>
    ),
  },
  {
    lato: "right-2 bottom-[76px]",
    rot: "-3.5deg",
    ritardo: "2.2s",
    corpo: (
      <>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-mare">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="m21 4-9.5 8.5L3 9.6 21 4 17.4 20l-4.3-5"
                fill="none"
                stroke="var(--color-menta)"
                strokeWidth="1.9"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="text-[13px] font-semibold">Su Telegram</p>
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-fumo">
          Arriva come una notifica normale, con suono. Anche su iPhone.
        </p>
      </>
    ),
  },
];

export default function Hero() {
  return (
    <section className="grana relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      {/* alone verde dietro al telefono */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[330px] h-[620px] w-[min(1100px,120vw)] -translate-x-1/2 rounded-full opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-menta) 0%, rgba(182,242,210,.55) 38%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <p
          className="sali inline-flex items-center gap-2 rounded-pillola border border-sabbia-3 bg-white/70 px-4 py-1.5 text-[13px] text-fumo backdrop-blur"
          style={{ animationDelay: ".05s" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-terra" />
          40 milioni di italiani non partiranno ad agosto
        </p>

        <h1
          className="sali mt-7 font-display text-[clamp(3.1rem,10vw,6.4rem)] font-semibold leading-[0.92] tracking-[-0.035em]"
          style={{ animationDelay: ".14s" }}
        >
          Viaggio{" "}
          <br className="sm:hidden" />
          <span>anche io.</span>
        </h1>

        <p
          className="sali mx-auto mt-7 max-w-[34rem] text-[17.5px] leading-relaxed text-fumo sm:text-[19px]"
          style={{ animationDelay: ".24s" }}
        >
          Dimmi da dove parti e quanto vuoi spendere.{" "}
          <span className="text-inchiostro">Al resto ci penso io:</span> ti avviso
          quando esiste una fuga di 1–3 notti sotto la tua soglia. Prezzo totale —
          alloggio <em className="not-italic text-inchiostro">più</em> viaggio.
        </p>

        <div
          className="sali mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: ".34s" }}
        >
          <a
            href="#iscriviti"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-pillola bg-inchiostro px-7 py-4 text-[16px] font-semibold text-sabbia transition-all hover:bg-mare-scuro sm:w-auto"
          >
            Provalo con 3 alert gratis
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#come-funziona"
            className="inline-flex w-full items-center justify-center rounded-pillola border border-inchiostro/15 bg-white/60 px-7 py-4 text-[16px] font-semibold text-inchiostro backdrop-blur transition-all hover:border-inchiostro/30 hover:bg-white sm:w-auto"
          >
            Come funziona
          </a>
        </div>

        <p
          className="sali mt-4 text-[13.5px] text-fumo-2"
          style={{ animationDelay: ".42s" }}
        >
          Nessun abbonamento. Nessun rinnovo automatico. Paghi solo se vuoi continuare.
        </p>
      </div>

      {/* telefono + card che fluttuano */}
      <div className="relative mx-auto mt-16 max-w-[980px]">
        <div className="entra-scala" style={{ animationDelay: ".5s" }}>
          <TelefonoAlert />
        </div>

        {cardFluttuanti.map((c, i) => (
          <div
            key={i}
            className={`sali fluttua absolute hidden w-[218px] rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_45px_-18px_rgba(12,33,28,.35)] backdrop-blur-md lg:block ${c.lato}`}
            style={
              {
                "--rot": c.rot,
                animationDelay: `${0.75 + i * 0.13}s, ${c.ritardo}`,
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
