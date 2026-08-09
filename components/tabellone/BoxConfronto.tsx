import Link from "next/link";
import { confronto, euro, type Listino } from "@/lib/prezzi";

/**
 * IL DANNO, DISEGNATO.
 *
 * Il conto è sempre lo stesso della landing (`confronto()`), quindi non
 * può divergere: un portale a percentuale trattiene una quota della
 * compensazione, noi il prezzo della pratica una volta sola.
 *
 * Le barre sono in scala vera sulla compensazione: se non lo fossero
 * sarebbe un grafico che mente, e qui la trasparenza è il prodotto.
 */
export default function BoxConfronto({
  listino,
  compensazione = 600,
}: {
  listino: Listino;
  compensazione?: 250 | 400 | 600;
}) {
  const base = confronto(listino);
  const quota = base.trattenutoPortale / base.compensazione;
  const portaleTrattiene = Math.round(compensazione * quota);
  const portaleResta = compensazione - portaleTrattiene;
  const nostroResta = Math.round((compensazione - listino.singola) * 100) / 100;

  const righe = [
    {
      /* La percentuale è dichiarata come ESEMPIO, non come listino di
         qualcuno: i listini dei portali cambiano e nessuno di noi li ha
         riletti oggi. L'unico dato attribuito a una fonte sta nella nota
         qui sotto, ed è Ryanair che parla dei portali. */
      nome: "Con un portale che trattiene il 35%",
      trattenuto: portaleTrattiene,
      resta: portaleResta,
      colore: "bg-verde-notte/25",
    },
    {
      nome: "Con Rivolio",
      trattenuto: listino.singola,
      resta: nostroResta,
      colore: "bg-verde",
    },
  ];

  return (
    <aside className="not-prose my-10 rounded-[18px] border border-verde-notte/12 bg-white p-6 sm:p-8">
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-verde-scuro">
        Quanto ti resta in tasca
      </p>
      <h3 className="mt-1.5 font-display text-[21px] font-semibold leading-tight tracking-[-0.03em] text-verde-notte sm:text-[24px]">
        Su una compensazione da {euro(compensazione).replace(",00", "")}
      </h3>

      <div className="mt-7 flex flex-col gap-6">
        {righe.map((r) => (
          <div key={r.nome}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[15px] font-semibold text-verde-notte">{r.nome}</p>
              <p className="numeri text-[14px] text-verde-notte/60">
                trattiene {euro(r.trattenuto)}
              </p>
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-[22px] flex-1 overflow-hidden rounded-[5px] bg-carta-2">
                <div
                  className={`h-full ${r.colore}`}
                  style={{ width: `${(r.resta / compensazione) * 100}%` }}
                />
              </div>
              <p className="numeri w-[92px] shrink-0 text-right font-display text-[19px] font-bold text-verde-notte">
                {euro(r.resta)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[13.5px] leading-relaxed text-verde-notte/55">
        Il 35% è un esempio: ogni portale ha il suo listino e va letto sul suo sito.
        Per darti un ordine di grandezza,{" "}
        <a
          href="https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-verde-scuro underline underline-offset-2"
        >
          Ryanair scrive
        </a>{" "}
        che le società di gestione reclami trattengono oltre il 40% di un reclamo da 250
        euro. Il nostro è un prezzo fisso: si paga una volta e non dipende da quanto ti
        arriva.{" "}
        <Link href="/#prezzi" className="font-medium text-verde-scuro underline underline-offset-2">
          Come nasce questa cifra
        </Link>
      </p>
    </aside>
  );
}
