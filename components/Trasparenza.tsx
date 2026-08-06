import { ESEMPIO, CONTO, euro } from "@/lib/esempio";

/** Formatta con la virgola decimale italiana. */
const num = (n: number, d = 2) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function Trasparenza() {
  const righe = [
    {
      etichetta: `${ESEMPIO.kmAndata} km × 2 (andata e ritorno)`,
      valore: `${CONTO.kmTotali} km`,
    },
    {
      etichetta: `${CONTO.kmTotali} km ÷ ${ESEMPIO.consumoKmL} km/l`,
      valore: `${num(CONTO.litri, 1)} litri`,
    },
    {
      etichetta: `${num(CONTO.litri, 1)} litri × ${num(ESEMPIO.prezzoBenzina, 3)} €/l`,
      valore: `${num(CONTO.benzina)} €`,
      nota: "prezzo medio nazionale, osservatorio MIMIT",
    },
    { etichetta: "Pedaggi autostradali (A/R)", valore: `${num(ESEMPIO.pedaggiAR)} €` },
    {
      etichetta: `Totale auto ÷ ${ESEMPIO.persone} persone`,
      valore: `${num(CONTO.autoPersona)} €`,
      forte: true,
    },
  ];

  return (
    <section
      id="trasparenza"
      className="grana relative overflow-hidden bg-mare-scuro px-5 py-24 text-sabbia sm:px-8 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-25 blur-[100px]"
        style={{ background: "var(--color-menta)" }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[.16em] text-menta">
            Il conto aperto
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            Ti faccio vedere
            <br />
            come l&apos;ho calcolato.
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-sabbia/70">
            Chiunque può scrivere «offerta imperdibile». Io ti mostro il conto riga per
            riga, così decidi tu se ti torna. Il prezzo dell&apos;alloggio è quello vero.
            Il costo dell&apos;auto è una stima, e{" "}
            <span className="text-sabbia">te lo dico</span> che è una stima.
          </p>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-sabbia/50">
            Sul treno non ti do un prezzo: Trenitalia e Italo non pubblicano dati
            affidabili, e preferisco non dirti un numero piuttosto che dirtene uno
            sbagliato. Ti metto il link e controlli in dieci secondi.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-sabbia/15 bg-sabbia/[0.06] p-6 backdrop-blur-sm sm:p-8">
          <div className="flex items-baseline justify-between border-b border-dashed border-sabbia/20 pb-4">
            <span className="font-display text-[22px] font-semibold">
              {ESEMPIO.partenza} → {ESEMPIO.destinazione}
            </span>
            <span className="text-[13px] text-sabbia/55">
              {ESEMPIO.durata} · in {ESEMPIO.persone}
            </span>
          </div>

          <dl className="mt-5 space-y-3.5">
            {righe.map((r) => (
              <div key={r.etichetta}>
                <div className="flex items-baseline justify-between gap-4">
                  <dt
                    className={`text-[14px] ${r.forte ? "font-semibold text-sabbia" : "text-sabbia/65"}`}
                  >
                    {r.etichetta}
                  </dt>
                  <dd
                    className={`shrink-0 tabular-nums ${
                      r.forte
                        ? "font-display text-[19px] font-semibold text-menta"
                        : "text-[14px] text-sabbia/85"
                    }`}
                  >
                    {r.valore}
                  </dd>
                </div>
                {r.nota && (
                  <p className="mt-0.5 text-[11.5px] text-sabbia/40">{r.nota}</p>
                )}
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-2xl bg-sabbia/10 p-5">
            <div className="flex items-baseline justify-between text-[14px] text-sabbia/70">
              <span>Alloggio a persona</span>
              <span className="tabular-nums">{euro(ESEMPIO.alloggioPersona)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between text-[14px] text-sabbia/70">
              <span>Auto a persona</span>
              <span className="tabular-nums">{num(CONTO.autoPersona)} €</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-sabbia/15 pt-4">
              <span className="text-[15px] font-semibold">Totale a persona</span>
              <span className="font-display text-[34px] font-semibold leading-none tabular-nums text-menta">
                {euro(CONTO.totalePersona)}
              </span>
            </div>
            <p className="mt-2.5 text-[13px] text-menta/80">
              La tua soglia era {euro(ESEMPIO.soglia)}. Ti avanzano{" "}
              {euro(CONTO.avanzo)} per la cena.
            </p>
          </div>

          <p className="mt-4 text-[11.5px] leading-relaxed text-sabbia/35">
            Esempio illustrativo. Consumo stimato {ESEMPIO.consumoKmL} km/l su
            un&apos;utilitaria a benzina; i pedaggi variano col percorso. Il prezzo del
            carburante è quello medio nazionale del giorno, non quello del tuo
            distributore.
          </p>
        </div>
      </div>
    </section>
  );
}
