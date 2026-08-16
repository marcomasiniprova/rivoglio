"use client";

import { useState } from "react";
import { euro } from "./Pezzi";
import {
  CREATOR_PCT,
  INCASSO,
  PREZZO_FAMIGLIA,
  PREZZO_PRATICA,
  margineCompleto,
  type ModoIncasso,
} from "@/lib/admin/economia";

/**
 * IL SIMULATORE DEL MARGINE (richiesta di Valerio, 16/08).
 *
 * Le quattro leve che decidono se il business regge: come incassi, quanto
 * dai ai creator, quanti reclami falliscono, e se la garanzia è in credito o
 * in contanti. Il conto è tutto in `margineCompleto` (funzione pura): qui c'è
 * solo il pannello per muovere le leve e leggere il risultato dal vivo.
 *
 * La cosa che il simulatore rende ovvia: con la garanzia in CREDITO il
 * "quando vado in perdita" diventa "mai", a qualsiasi tasso di rimborso.
 */

const pct = (n: number) => `${Math.round(n * 100)}%`;

function Segmento<T extends string>({
  valore,
  opzioni,
  onCambia,
}: {
  valore: T;
  opzioni: { id: T; testo: string }[];
  onCambia: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-[10px] border border-bordo bg-nebbia-2 p-0.5">
      {opzioni.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onCambia(o.id)}
          className={`rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition ${
            valore === o.id ? "bg-white text-inchiostro shadow-sm" : "text-fumo hover:text-inchiostro"
          }`}
        >
          {o.testo}
        </button>
      ))}
    </div>
  );
}

function Leva({
  etichetta,
  valore,
  children,
}: {
  etichetta: string;
  valore: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-2 text-[13px] text-fumo">
        {etichetta}
        <span className="numeri font-semibold text-inchiostro">{valore}</span>
      </span>
      {children}
    </label>
  );
}

function Colonna({
  titolo,
  prezzo,
  m,
}: {
  titolo: string;
  prezzo: number;
  m: ReturnType<typeof margineCompleto>;
}) {
  const inPerdita = m.medioPerPratica < 0;
  return (
    <div className="rounded-[12px] border border-bordo bg-nebbia/40 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-medium uppercase tracking-wide text-fumo-2">{titolo}</span>
        <span className="numeri text-[13px] text-fumo">{euro(prezzo)}</span>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-[13px]">
        <Voce v="Tolta l'IVA" n={-m.iva} />
        <Voce v="Commissione incasso" n={-m.commissione} />
        <Voce v="Creator (subito)" n={-m.creator} />
        <Voce v="Ti resta se la vendita tiene" n={m.tieni} forte />
      </div>
      <div className="mt-3 border-t border-bordo pt-3">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="text-fumo">Su una vendita rimborsata</span>
          <span className={`numeri font-semibold ${m.nettoSuRimborso < 0 ? "text-red-600" : "text-verde"}`}>
            {m.nettoSuRimborso < 0 ? `−${euro(-m.nettoSuRimborso)}` : euro(m.nettoSuRimborso)}
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-inchiostro">Netto medio per pratica</span>
          <span className={`numeri text-[18px] font-bold ${inPerdita ? "text-red-600" : "text-verde"}`}>
            {m.medioPerPratica < 0 ? `−${euro(-m.medioPerPratica)}` : euro(m.medioPerPratica)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Voce({ v, n, forte }: { v: string; n: number; forte?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={forte ? "font-medium text-inchiostro" : "text-fumo"}>{v}</span>
      <span
        className={`numeri ${forte ? "font-semibold text-verde" : n < 0 ? "text-fumo" : "text-inchiostro"}`}
      >
        {n < 0 ? `−${euro(-n)}` : euro(n)}
      </span>
    </div>
  );
}

export default function SimulatoreMargine() {
  const [incasso, setIncasso] = useState<ModoIncasso>("mor");
  const [creatorPct, setCreatorPct] = useState(CREATOR_PCT);
  const [tassoRimborso, setTassoRimborso] = useState(0.15);
  const [garanziaCredito, setGaranziaCredito] = useState(true);

  const leve = { incasso, creatorPct, tassoRimborso, garanziaCredito };
  const singola = margineCompleto({ prezzo: PREZZO_PRATICA, ...leve });
  const famiglia = margineCompleto({ prezzo: PREZZO_FAMIGLIA, ...leve });
  const pareggio = singola.pareggioRimborso;

  return (
    <section className="rounded-[14px] border border-bordo bg-white p-4 shadow-[0_1px_2px_rgba(5,46,31,0.04)] sm:p-5">
      <div className="mb-4">
        <h2 className="font-display text-[15.5px] leading-tight tracking-[-0.02em]">
          Simulatore: quando resti positivo
        </h2>
        <p className="mt-1 text-[12.5px] leading-snug text-fumo">
          Muovi le leve e guarda il netto per pratica. Con la garanzia in credito non vai in
          perdita mai, a qualsiasi tasso di rimborso.
        </p>
      </div>

      {/* le leve */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-fumo">Come incassi</span>
            <Segmento
              valore={incasso}
              onCambia={setIncasso}
              opzioni={[
                { id: "mor", testo: "Merchant-of-record" },
                { id: "stripe", testo: "Stripe diretto" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-fumo">Garanzia</span>
            <Segmento
              valore={garanziaCredito ? "credito" : "contanti"}
              onCambia={(v) => setGaranziaCredito(v === "credito")}
              opzioni={[
                { id: "credito", testo: "In credito" },
                { id: "contanti", testo: "In contanti" },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Leva etichetta="Commissione ai creator" valore={pct(creatorPct)}>
            <input
              type="range"
              min={0}
              max={0.4}
              step={0.01}
              value={creatorPct}
              onChange={(e) => setCreatorPct(Number(e.target.value))}
              className="accent-verde"
            />
          </Leva>
          <Leva etichetta="Reclami che falliscono (rimborsi)" valore={pct(tassoRimborso)}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={tassoRimborso}
              onChange={(e) => setTassoRimborso(Number(e.target.value))}
              className="accent-verde"
            />
          </Leva>
        </div>
      </div>

      {/* il verdetto sul pareggio */}
      <div
        className={`mt-4 rounded-[10px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
          pareggio === null ? "bg-menta-tenue text-verde-scuro" : "bg-sole/20 text-inchiostro"
        }`}
      >
        {pareggio === null ? (
          <>
            <strong>Non vai in perdita mai.</strong> Col rimborso in credito non esce cassa: il
            creator è sempre coperto, a qualsiasi tasso di rimborso.
          </>
        ) : (
          <>
            Vai in perdita se ti chiede il rimborso più del <strong>{pct(pareggio)}</strong> dei
            clienti. Coi contanti e il creator pagato subito, il margine si assottiglia in fretta:
            passa al credito e il rischio sparisce.
          </>
        )}
      </div>

      {/* i due conti */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Colonna titolo="Pratica singola" prezzo={PREZZO_PRATICA} m={singola} />
        <Colonna titolo="Pratica famiglia" prezzo={PREZZO_FAMIGLIA} m={famiglia} />
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-fumo-2">
        Incasso {INCASSO[incasso].nome}: {INCASSO[incasso].nota} L&apos;IVA è al{" "}
        <span className="numeri">22%</span> e il prezzo la include. La commissione ai creator è
        sulla pratica, non sul check.
      </p>
    </section>
  );
}
