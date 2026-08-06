"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PARTENZE, type Esito, type Proposta } from "@/lib/costruttore";
import type { Tipo } from "@/lib/destinazioni";

const TIPI: { v: Tipo; e: string }[] = [
  { v: "mare", e: "mare" },
  { v: "monte", e: "montagna" },
  { v: "citta", e: "città" },
  { v: "terme", e: "terme" },
];

const eur = (n: number) => `${Math.round(n)}€`;

export default function Costruttore() {
  const [partenza, setPartenza] = useState("Bologna");
  const [budget, setBudget] = useState(120);
  const [notti, setNotti] = useState(2);
  const [persone, setPersone] = useState(2);
  const [ore, setOre] = useState(2.5);
  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [carico, setCarico] = useState(false);
  const [esito, setEsito] = useState<Esito | null>(null);

  function commuta(t: Tipo) {
    setTipi((v) => (v.includes(t) ? v.filter((x) => x !== t) : [...v, t]));
  }

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarico(true);
    setEsito(null);
    try {
      const r = await fetch("/api/costruttore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partenza,
          budgetPersona: budget,
          notti,
          persone,
          oreMax: ore,
          tipi,
        }),
      });
      setEsito(await r.json());
    } catch {
      setEsito({ ok: false, motivo: "Non ho connessione. Riprova fra un attimo." });
    } finally {
      setCarico(false);
    }
  }

  return (
    <section id="costruttore" className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-pillola bg-menta-tenue px-3.5 py-1.5 text-[12.5px] font-medium text-verde-scuro">
            Provalo adesso, senza iscriverti
          </span>
          <h2 className="mt-5 text-[clamp(2.1rem,5vw,3.3rem)]">
            Dove arrivi
            <br />
            con quello che hai.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[16.5px] leading-relaxed text-fumo">
            Dimmi da dove parti e quanto puoi spendere. Ti dico dove ci arrivi davvero,
            quanto costa il viaggio e quanto ti resta per dormire.
          </p>
        </div>

        <form
          onSubmit={invia}
          className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-bordo/70 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(5,46,31,.35)] sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo etichetta="Da dove parti">
              <select
                value={partenza}
                onChange={(e) => setPartenza(e.target.value)}
                className="w-full rounded-xl border border-bordo bg-nebbia px-4 py-3 text-[15px] outline-none transition-colors focus:border-verde"
              >
                {PARTENZE.map((p) => (
                  <option key={p.nome} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo etichetta={`Budget: ${budget}€ a persona`}>
              <input
                type="range"
                min={40}
                max={400}
                step={10}
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                className="mt-3 w-full accent-[var(--color-verde)]"
                aria-label="Budget a persona"
              />
            </Campo>

            <Campo etichetta={`Quanto lontano: ${ore.toString().replace(".", ",")}h al massimo`}>
              <input
                type="range"
                min={1}
                max={6}
                step={0.5}
                value={ore}
                onChange={(e) => setOre(+e.target.value)}
                className="mt-3 w-full accent-[var(--color-verde)]"
                aria-label="Ore di viaggio massime"
              />
            </Campo>

            <div className="grid grid-cols-2 gap-4">
              <Campo etichetta="Notti">
                <Contatori valore={notti} imposta={setNotti} min={1} max={3} />
              </Campo>
              <Campo etichetta="In quanti">
                <Contatori valore={persone} imposta={setPersone} min={1} max={8} />
              </Campo>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-medium uppercase tracking-wider text-fumo-2">
              Che voglia hai
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {TIPI.map((t) => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => commuta(t.v)}
                  aria-pressed={tipi.includes(t.v)}
                  className={`rounded-pillola px-4 py-2 text-[14px] font-medium transition-all ${
                    tipi.includes(t.v)
                      ? "bg-verde text-white"
                      : "border border-bordo bg-white text-fumo hover:border-verde/40"
                  }`}
                >
                  {t.e}
                </button>
              ))}
              {!tipi.length && (
                <span className="self-center text-[13px] text-fumo-2">
                  nessun filtro: guardo tutto
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={carico}
            className="mt-7 w-full rounded-pillola bg-verde py-4 text-[16px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(10,157,92,.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:opacity-60"
          >
            {carico ? "Sto calcolando…" : "Dimmi dove posso andare"}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {esito && (
            <motion.div
              key={esito.ok ? "ok" : "no"}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-8 max-w-3xl"
            >
              {esito.ok ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {esito.proposte.map((p, i) => (
                      <Scheda key={p.destinazione.nome} p={p} notti={notti} ritardo={i * 0.09} />
                    ))}
                  </div>
                  <p className="mt-5 text-center text-[12.5px] leading-relaxed text-fumo-2">
                    Il costo dell&apos;auto è una stima: distanza su strada, benzina al
                    prezzo medio nazionale MIMIT e pedaggi autostradali indicativi.
                    L&apos;alloggio non è incluso perché non invento prezzi: quello te lo
                    segnalo quando esiste davvero.
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-sole/40 bg-sole/10 p-6 text-center">
                  <p className="text-[15.5px] leading-relaxed">{esito.motivo}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Campo({ etichetta, children }: { etichetta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium uppercase tracking-wider text-fumo-2">
        {etichetta}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Contatori({
  valore,
  imposta,
  min,
  max,
}: {
  valore: number;
  imposta: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Bottone segno="−" su={() => imposta(Math.max(min, valore - 1))} />
      <span className="min-w-[2ch] text-center font-display text-[20px] font-medium tabular-nums">
        {valore}
      </span>
      <Bottone segno="+" su={() => imposta(Math.min(max, valore + 1))} />
    </div>
  );
}

function Bottone({ segno, su }: { segno: string; su: () => void }) {
  return (
    <button
      type="button"
      onClick={su}
      aria-label={segno === "+" ? "aumenta" : "diminuisci"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-bordo bg-white text-[16px] text-fumo transition-colors hover:border-verde hover:text-verde"
    >
      {segno}
    </button>
  );
}

function Scheda({ p, notti, ritardo }: { p: Proposta; notti: number; ritardo: number }) {
  return (
    <motion.div
      data-scheda="proposta"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: ritardo, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col rounded-[1.5rem] border border-bordo/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-verde/25 hover:shadow-[0_20px_45px_-24px_rgba(5,46,31,.3)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[21px] leading-tight">{p.destinazione.nome}</h3>
          <p className="mt-1 text-[12.5px] text-fumo-2">{p.destinazione.regione}</p>
        </div>
        <span className="rounded-pillola bg-menta-tenue px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-verde-scuro">
          {p.destinazione.tipo === "citta" ? "città" : p.destinazione.tipo}
        </span>
      </div>

      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-fumo">
        {p.destinazione.cosa}
      </p>

      <dl className="mt-4 space-y-1.5 border-t border-dashed border-bordo pt-3.5 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-fumo">Viaggio</dt>
          <dd className="tabular-nums">
            {p.ore} · {Math.round(p.conto.kmSolaAndata)} km
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fumo">Auto a testa (A/R)</dt>
          <dd className="font-semibold tabular-nums">{eur(p.conto.aPersona)}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-xl bg-menta-tenue p-3.5">
        <p className="text-[11.5px] uppercase tracking-wider text-verde-scuro">
          Ti resta per dormire
        </p>
        <p className="mt-0.5 font-display text-[26px] font-medium leading-none text-verde">
          {eur(p.restaPerDormire)}
          <span className="ml-1.5 text-[12px] font-normal text-verde-scuro">
            a testa · {eur(p.restaPerNotte)} a notte
          </span>
        </p>
      </div>
      <p className="mt-2 text-[11px] text-fumo-2">per {notti} notti</p>
    </motion.div>
  );
}
