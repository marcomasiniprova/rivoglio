import { Anima } from "./Anima";
import { ESEMPIO, CONTO, euro } from "@/lib/esempio";

const num = (n: number, d = 2) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function ContoAperto() {
  const righe = [
    { et: `${ESEMPIO.kmAndata} km × 2 (andata e ritorno)`, v: `${CONTO.kmTotali} km` },
    { et: `${CONTO.kmTotali} km ÷ ${ESEMPIO.consumoKmL} km/l`, v: `${num(CONTO.litri, 1)} litri` },
    {
      et: `${num(CONTO.litri, 1)} litri × ${num(ESEMPIO.prezzoBenzina, 3)} €/l`,
      v: `${num(CONTO.benzina)} €`,
      nota: "prezzo medio nazionale, osservatorio MIMIT",
    },
    { et: "Pedaggi autostradali (A/R)", v: `${num(ESEMPIO.pedaggiAR)} €` },
    { et: `Totale auto ÷ ${ESEMPIO.persone} persone`, v: `${num(CONTO.autoPersona)} €`, forte: true },
  ];

  return (
    <section id="conto" className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[2rem] bg-verde-notte px-6 py-16 text-white sm:px-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Anima>
            <span className="inline-block rounded-pillola bg-white/10 px-3.5 py-1.5 text-[12.5px] font-medium text-menta">
              Il conto aperto
            </span>
            <h2 className="mt-5 text-[clamp(2.1rem,5vw,3.3rem)]">
              Ti faccio vedere
              <br />
              come l&apos;ho calcolato.
            </h2>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-white/65">
              Chiunque può scrivere «offerta imperdibile». Io ti mostro il conto riga per
              riga, così decidi tu se ti torna. Il prezzo dell&apos;alloggio è quello vero.
              Il costo dell&apos;auto è una stima, e{" "}
              <span className="text-white">te lo dico</span> che è una stima.
            </p>
            <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-white/45">
              Sul treno non ti do un prezzo: Trenitalia e Italo non pubblicano dati
              affidabili, e preferisco non dirti un numero piuttosto che dirtene uno
              sbagliato. Trovi il link per controllare in dieci secondi.
            </p>
          </Anima>

          <Anima
            ritardo={0.12}
            className="rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8"
          >
            <div className="flex items-baseline justify-between border-b border-dashed border-white/20 pb-4">
              <span className="font-display text-[22px] font-medium">
                {ESEMPIO.partenza} → {ESEMPIO.destinazione}
              </span>
              <span className="text-[13px] text-white/55">
                {ESEMPIO.durata} · in {ESEMPIO.persone}
              </span>
            </div>

            <dl className="mt-5 space-y-3.5">
              {righe.map((r) => (
                <div key={r.et}>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className={`text-[14px] ${r.forte ? "font-medium text-white" : "text-white/65"}`}>
                      {r.et}
                    </dt>
                    <dd
                      className={`shrink-0 tabular-nums ${
                        r.forte
                          ? "font-display text-[19px] font-medium text-menta"
                          : "text-[14px] text-white/85"
                      }`}
                    >
                      {r.v}
                    </dd>
                  </div>
                  {r.nota && <p className="mt-0.5 text-[11.5px] text-white/40">{r.nota}</p>}
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-2xl bg-white/10 p-5">
              <div className="flex items-baseline justify-between text-[14px] text-white/70">
                <span>Alloggio a persona</span>
                <span className="tabular-nums">{euro(ESEMPIO.alloggioPersona)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between text-[14px] text-white/70">
                <span>Auto a persona</span>
                <span className="tabular-nums">{num(CONTO.autoPersona)} €</span>
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-white/15 pt-4">
                <span className="text-[15px] font-medium">Totale a persona</span>
                <span className="font-display text-[34px] font-medium leading-none tabular-nums text-menta">
                  {euro(CONTO.totalePersona)}
                </span>
              </div>
              <p className="mt-2.5 text-[13px] text-menta/80">
                La tua soglia era {euro(ESEMPIO.soglia)}. Ti avanzano {euro(CONTO.avanzo)}{" "}
                per la cena.
              </p>
            </div>

            <p className="mt-4 text-[11.5px] leading-relaxed text-white/35">
              Esempio illustrativo. Consumo stimato {ESEMPIO.consumoKmL} km/l su
              un&apos;utilitaria a benzina; i pedaggi variano col percorso.
            </p>
          </Anima>
        </div>
      </div>
    </section>
  );
}
