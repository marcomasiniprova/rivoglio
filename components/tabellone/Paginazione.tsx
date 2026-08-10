import Link from "next/link";
import { RADICE } from "@/lib/tabellone/indice";

/**
 * La paginazione del riferimento: filo sopra, "Precedente" a sinistra,
 * i numeri in mezzo, "Successivo" a destra. Il numero della pagina in cui
 * sei è pieno, gli altri sono link.
 *
 * Sotto i 640px i numeri spariscono e resta "Pagina 2 di 4": su un telefono
 * dieci pallini schiacciati non li centra nessuno.
 */

function indirizzo(n: number): string {
  return n <= 1 ? RADICE : `${RADICE}/pagina/${n}`;
}

/** 1 … 4 5 6 … 12: al massimo sette caselle, sempre con la prima e l'ultima. */
function caselle(corrente: number, totale: number): (number | "salto")[] {
  if (totale <= 7) return Array.from({ length: totale }, (_, i) => i + 1);
  const vicini = new Set([1, totale, corrente, corrente - 1, corrente + 1]);
  if (corrente <= 3) [2, 3, 4].forEach((n) => vicini.add(n));
  if (corrente >= totale - 2) [totale - 3, totale - 2, totale - 1].forEach((n) => vicini.add(n));
  const numeri = [...vicini].filter((n) => n >= 1 && n <= totale).sort((a, b) => a - b);
  const fuori: (number | "salto")[] = [];
  numeri.forEach((n, i) => {
    if (i > 0 && n - numeri[i - 1] > 1) fuori.push("salto");
    fuori.push(n);
  });
  return fuori;
}

function Freccia({ verso }: { verso: "sinistra" | "destra" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={verso === "sinistra" ? "M16 10H4m0 0l5-5m-5 5l5 5" : "M4 10h12m0 0l-5-5m5 5l-5 5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Paginazione({
  corrente,
  totale,
}: {
  corrente: number;
  totale: number;
}) {
  if (totale <= 1) return null;

  const haPrima = corrente > 1;
  const haDopo = corrente < totale;
  const spento =
    "inline-flex items-center gap-2 text-[14.5px] font-semibold text-verde-notte/30 cursor-default";
  const acceso =
    "inline-flex items-center gap-2 text-[14.5px] font-semibold text-verde-notte transition-colors hover:text-verde-scuro";

  return (
    <nav
      aria-label="Pagine del Tabellone"
      className="mt-14 border-t border-verde-notte/12 pt-5"
    >
      {/* A 320 punti "Precedente · Pagina 1 di 2 · Successivo" non sta
          su una riga e spingeva la pagina fuori schermo: lì il conteggio
          va a capo, centrato sotto le due frecce. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {haPrima ? (
          <Link href={indirizzo(corrente - 1)} className={acceso} rel="prev">
            <Freccia verso="sinistra" />
            Precedente
          </Link>
        ) : (
          <span className={spento} aria-disabled="true">
            <Freccia verso="sinistra" />
            Precedente
          </span>
        )}

        <p className="text-[14.5px] font-medium text-verde-notte/60 max-[359px]:order-3 max-[359px]:w-full max-[359px]:text-center sm:hidden">
          Pagina {corrente} di {totale}
        </p>

        <ol className="hidden items-center gap-1 sm:flex">
          {caselle(corrente, totale).map((c, i) =>
            c === "salto" ? (
              <li
                key={`salto-${i}`}
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center text-[14.5px] text-verde-notte/40"
              >
                …
              </li>
            ) : (
              <li key={c}>
                <Link
                  href={indirizzo(c)}
                  aria-current={c === corrente ? "page" : undefined}
                  className={`grid h-10 w-10 place-items-center rounded-[8px] text-[14.5px] font-semibold transition-colors ${
                    c === corrente
                      ? "bg-verde-notte text-carta"
                      : "text-verde-notte/70 hover:bg-carta-2 hover:text-verde-notte"
                  }`}
                >
                  {c}
                </Link>
              </li>
            ),
          )}
        </ol>

        {haDopo ? (
          <Link href={indirizzo(corrente + 1)} className={acceso} rel="next">
            Successivo
            <Freccia verso="destra" />
          </Link>
        ) : (
          <span className={spento} aria-disabled="true">
            Successivo
            <Freccia verso="destra" />
          </span>
        )}
      </div>
    </nav>
  );
}
