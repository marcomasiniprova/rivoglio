import Link from "next/link";
import type { ReactNode } from "react";
import BoxCheck from "./BoxCheck";
import BoxConfronto from "./BoxConfronto";
import SezioneNewsletter from "./SezioneNewsletter";
import type { Blocco } from "@/lib/tabellone/tipi";
import type { Listino } from "@/lib/prezzi";

/**
 * Il corpo di un articolo: dai blocchi tipizzati all'HTML.
 *
 * Il formato inline è volutamente povero, due sole cose:
 *   **grassetto**  e  [testo](indirizzo)
 * Un articolo non ha bisogno di altro, e ogni sintassi in più è un modo
 * nuovo di rompere la pagina.
 */

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/** Trasforma il testo di un blocco in nodi React. */
export function inline(testo: string): ReactNode[] {
  return testo.split(INLINE).filter(Boolean).map((pezzo, i) => {
    if (pezzo.startsWith("**") && pezzo.endsWith("**")) {
      return <strong key={i}>{pezzo.slice(2, -2)}</strong>;
    }
    const link = pezzo.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, etichetta, dove] = link;
      if (dove.startsWith("/") || dove.startsWith("#")) {
        return (
          <Link key={i} href={dove}>
            {etichetta}
          </Link>
        );
      }
      return (
        <a key={i} href={dove} target="_blank" rel="noopener noreferrer">
          {etichetta}
        </a>
      );
    }
    return <span key={i}>{pezzo}</span>;
  });
}

/** "Come si chiede il rimborso" → "come-si-chiede-il-rimborso", per l'indice. */
export function ancora(testo: string): string {
  return testo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function Nota({ titolo, testo }: { titolo: string; testo: string }) {
  return (
    <aside className="not-prose my-8 rounded-[14px] border-l-[3px] border-sole bg-sole/10 px-5 py-4">
      <p className="font-display text-[16px] font-semibold text-verde-notte">{titolo}</p>
      <p className="mt-1.5 text-[15.5px] leading-relaxed text-verde-notte/75">
        {inline(testo)}
      </p>
    </aside>
  );
}

export default function Corpo({
  blocchi,
  listino,
}: {
  blocchi: Blocco[];
  listino: Listino;
}) {
  return (
    <div className="articolo">
      {blocchi.map((b, i) => {
        switch (b.tipo) {
          case "p":
            return <p key={i}>{inline(b.testo)}</p>;

          case "h2":
            return (
              <h2 key={i} id={ancora(b.testo)}>
                {b.testo}
              </h2>
            );

          case "h3":
            return <h3 key={i}>{b.testo}</h3>;

          case "elenco":
            return (
              <ul key={i}>
                {b.voci.map((v, j) => (
                  <li key={j}>{inline(v)}</li>
                ))}
              </ul>
            );

          case "passi":
            return (
              <ol key={i}>
                {b.voci.map((v, j) => (
                  <li key={j}>{inline(v)}</li>
                ))}
              </ol>
            );

          case "citazione":
            return (
              <figure key={i} className="not-prose my-8">
                <blockquote className="border-l-[3px] border-verde pl-5 font-corsivo text-[19px] italic leading-[1.5] text-verde-notte">
                  {inline(b.testo)}
                </blockquote>
                {b.fonte && (
                  <figcaption className="mt-2 pl-5 text-[13.5px] text-verde-notte/55">
                    {inline(b.fonte)}
                  </figcaption>
                )}
              </figure>
            );

          case "tabella":
            return (
              <div key={i} className="tabella-scorrevole my-8">
                <table>
                  <thead>
                    <tr>
                      {b.intestazioni.map((t, j) => (
                        <th key={j}>{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.righe.map((riga, j) => (
                      <tr key={j}>
                        {riga.map((cella, k) => (
                          <td key={k}>{inline(cella)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "nota":
            return <Nota key={i} titolo={b.titolo} testo={b.testo} />;

          case "check":
            return <BoxCheck key={i} titolo={b.titolo} testo={b.testo} />;

          case "confronto":
            return <BoxConfronto key={i} listino={listino} compensazione={b.compensazione} />;

          case "osservatorio":
            return (
              <div key={i} className="not-prose my-10">
                <SezioneNewsletter compatta />
              </div>
            );

          case "faq":
            return (
              <div key={i} className="not-prose my-8 flex flex-col gap-3">
                {b.voci.map((v, j) => (
                  <details
                    key={j}
                    className="group rounded-[12px] border border-verde-notte/12 bg-white px-5 py-4"
                  >
                    <summary className="cursor-pointer list-none font-display text-[16.5px] font-semibold text-verde-notte marker:hidden">
                      <span className="flex items-start justify-between gap-4">
                        {v.domanda}
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-verde transition-transform duration-300 group-open:rotate-45"
                        >
                          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M7 2v10M2 7h10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      </span>
                    </summary>
                    <p className="mt-2.5 text-[15.5px] leading-relaxed text-verde-notte/75">
                      {inline(v.risposta)}
                    </p>
                  </details>
                ))}
              </div>
            );

          default: {
            /* Un blocco nuovo non deve poter sparire in silenzio: il
               compilatore si ferma qui se qualcuno aggiunge un tipo e
               dimentica di disegnarlo. */
            const mai: never = b;
            return mai;
          }
        }
      })}
    </div>
  );
}
