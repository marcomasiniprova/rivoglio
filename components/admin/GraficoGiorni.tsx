"use client";

import { useRef, useState } from "react";

/**
 * IL GRAFICO GIORNO PER GIORNO, INTERATTIVO (Valerio, 16/08: «nei grafici
 * fai che clicco/passo il cursore e c'è la striscia che mostra il numero,
 * vado avanti e il numero sale. Adesso sono troppo fissi e piatti»).
 *
 * Le colonne sono le stesse di prima; la novità è che passando il dito (o
 * il mouse) sopra il grafico compare una STRISCIA verticale sul giorno sotto
 * il cursore e un cartellino con i numeri di quel giorno. Niente libreria:
 * si misura dove sta il cursore e si sceglie il giorno più vicino.
 *
 * ⚠️ PERCHÉ I DATI ARRIVANO GIÀ PRONTI (numeri, non funzioni). Le colonne
 * di prima ricevevano una funzione `valore: (g) => ...`, e una funzione non
 * può attraversare il confine server→browser di React. Un componente
 * interattivo gira nel browser, quindi la pagina server risolve prima le
 * serie in liste di numeri e passa quelle.
 */

export type SerieGiorni = {
  nome: string;
  /** La classe del riempimento (fill-...) e quella del pallino (bg-...). */
  fill: string;
  punto: string;
  /** Un numero per giorno, nello stesso ordine di `giorni`. */
  valori: number[];
};

export type GiornoEtichetta = { etichetta: string; oggi: boolean };

const W = 1000;
const H = 300;

/** Un massimo tondo, così il righello non ha numeri storti. */
function cima(valori: number[]): number {
  const max = Math.max(1, ...valori);
  const scala = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / scala) * scala;
}

export default function GraficoGiorni({
  serie,
  giorni,
  altezza = 250,
}: {
  serie: SerieGiorni[] | null;
  giorni: GiornoEtichetta[] | null;
  altezza?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [sopra, setSopra] = useState<number | null>(null);

  const dati = giorni ?? [];
  const n = dati.length;
  const tutti = serie ? serie.flatMap((s) => s.valori) : [];
  const massimo = cima(tutti);
  const vuoto = serie === null || n === 0 || tutti.every((v) => v === 0);

  const passo = W / Math.max(1, n);
  const larghezzaGruppo = passo * 0.62;
  const larghezzaBarra = larghezzaGruppo / Math.max(1, serie?.length ?? 1);

  function muovi(clientX: number) {
    const el = box.current;
    if (!el || n === 0) return;
    const rect = el.getBoundingClientRect();
    const frazione = (clientX - rect.left) / rect.width;
    const i = Math.min(n - 1, Math.max(0, Math.floor(frazione * n)));
    setSopra(i);
  }

  return (
    <div>
      <div className="flex gap-2">
        {/* Il righello: due numeri bastano, il cartellino dice il resto. */}
        <div
          className="numeri flex w-8 shrink-0 flex-col justify-between py-0.5 text-right text-[10.5px] text-fumo-2 sm:w-9"
          style={{ height: altezza }}
          aria-hidden="true"
        >
          <span>{massimo}</span>
          <span>0</span>
        </div>

        <div
          ref={box}
          className="relative min-w-0 flex-1 touch-none"
          onMouseMove={(e) => muovi(e.clientX)}
          onMouseLeave={() => setSopra(null)}
          onTouchStart={(e) => muovi(e.touches[0]!.clientX)}
          onTouchMove={(e) => muovi(e.touches[0]!.clientX)}
          onTouchEnd={() => setSopra(null)}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{ height: altezza }}
            className="w-full"
            role="img"
            aria-label={`Colonne per giorno: ${serie?.map((s) => s.nome).join(", ") ?? "nessun dato"}`}
          >
            {/* la griglia */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={0}
                x2={W}
                y1={H * f}
                y2={H * f}
                className="stroke-bordo"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* la striscia del giorno sotto il cursore, dietro le colonne */}
            {sopra !== null && !vuoto && (
              <rect
                x={sopra * passo}
                y={0}
                width={passo}
                height={H}
                className="fill-verde/10"
              />
            )}

            {!vuoto &&
              dati.map((_, i) =>
                (serie ?? []).map((s, j) => {
                  const v = s.valori[i] ?? 0;
                  /* Altezza prima della posizione: una barra minima non deve
                     sfondare la base. Sotto una soglia il valore c'è ma non
                     si vede, quindi 9px minimi per i valori positivi. */
                  const h = Math.max(v > 0 ? 9 : 0, (v / massimo) * (H - 4));
                  const x = i * passo + (passo - larghezzaGruppo) / 2 + j * larghezzaBarra;
                  return (
                    <rect
                      key={`${i}-${s.nome}`}
                      x={x + larghezzaBarra * 0.08}
                      y={H - h}
                      width={larghezzaBarra * 0.84}
                      height={h}
                      rx={2}
                      className={s.fill}
                    />
                  );
                }),
              )}
          </svg>

          {vuoto && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-[12.5px] text-fumo-2">
              {serie === null ? "non letto" : "ancora nessun dato"}
            </div>
          )}

          {/* IL CARTELLINO: i numeri del giorno sotto il cursore. Segue il
              dito, e si tiene dentro i bordi (translate a seconda del lato). */}
          {sopra !== null && !vuoto && (
            <div
              className="pointer-events-none absolute top-1 z-10 w-max max-w-[60%] rounded-[10px] border border-bordo bg-white px-3 py-2 text-[12px] shadow-[0_8px_24px_-8px_rgba(6,45,30,0.25)]"
              style={{
                left: `${((sopra + 0.5) / n) * 100}%`,
                transform: `translateX(${sopra < n / 2 ? "8px" : "calc(-100% - 8px)"})`,
              }}
            >
              <p className="font-medium text-inchiostro">
                {dati[sopra]?.oggi ? "Oggi" : dati[sopra]?.etichetta}
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {(serie ?? []).map((s) => (
                  <li key={s.nome} className="flex items-center gap-1.5 whitespace-nowrap text-fumo">
                    <span className={`size-2 shrink-0 rounded-[3px] ${s.punto}`} aria-hidden="true" />
                    {s.nome}:{" "}
                    <span className="numeri font-medium text-inchiostro">{s.valori[sopra] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* I giorni, in HTML: leggibili anche a 390 punti. */}
      <div className="mt-2 flex gap-2">
        <div className="w-8 shrink-0 sm:w-9" />
        <div className="flex min-w-0 flex-1">
          {dati.map((g, i) => (
            <span
              key={`${g.etichetta}-${i}`}
              className={`min-w-0 flex-1 truncate text-center text-[10.5px] ${
                g.oggi ? "font-medium text-inchiostro" : "text-fumo-2"
              } ${sopra === i ? "!text-verde" : ""} ${
                i % 2 === 1 && n > 8 ? "hidden sm:inline" : ""
              }`}
            >
              {g.oggi ? "oggi" : g.etichetta}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
