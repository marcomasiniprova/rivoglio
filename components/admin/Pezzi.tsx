import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/**
 * I PEZZI RIPETUTI DEL PANNELLO: le card dei numeri, i bolli di stato,
 * i riquadri vuoti e i due modi di scrivere un numero.
 *
 * Stanno insieme perché sono la grammatica della schermata: se ogni
 * sezione se li ridisegnasse, dopo tre sezioni il pannello avrebbe tre
 * grigi diversi per la stessa cosa. Con un file solo, cambiare il
 * carattere delle etichette è una riga.
 *
 * ⚠️ IL ROSSO NON È UN TOKEN DEL MARCHIO, e qui va detto: in
 * `app/globals.css` non esiste nessun `--color-errore`, quindi le classi
 * `text-errore` che erano in giro per il pannello non coloravano niente
 * (trovato guardando il codice, non da una prova). Il marchio ha un oro
 * per gli avvisi ma nessun rosso; si usa quello di Tailwind, che è già
 * quello usato dal resto del retrobottega.
 */

export const ALLARME = {
  testo: "text-red-600",
  fondo: "bg-red-50",
  bordo: "border-red-200",
} as const;

/** Gli euro come li scrive un italiano. */
export const euro = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;

/** Il numero, oppure la verità: non si è potuto leggere. */
export const oNonLetto = (n: number | null | undefined, come = (v: number) => String(v)) =>
  n === null || n === undefined ? "non letto" : come(n);

export type Tono = "verde" | "grigio" | "rosso" | "attesa";

const TONI: Record<Tono, string> = {
  verde: "bg-menta-tenue text-verde-scuro",
  grigio: "bg-nebbia-2 text-fumo",
  rosso: "bg-red-50 text-red-700",
  attesa: "bg-sole/25 text-inchiostro",
};

export function Bollo({ tono = "grigio", children }: { tono?: Tono; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-pillola px-2.5 py-1 text-[11.5px] font-medium ${TONI[tono]}`}
    >
      {children}
    </span>
  );
}

/**
 * La card di un numero.
 *
 * ⚠️ LA VARIAZIONE IN PERCENTUALE SI MOSTRA SOLO SE ESISTE DAVVERO. Nel
 * riferimento ogni card porta un "+12% vs mese scorso": con un sito che
 * ha appena aperto, un numero del genere sarebbe inventato. Qui il
 * confronto si fa con la media dei giorni prima, e se non c'è ancora
 * storico la card lo dice invece di far finta.
 */
export function Kpi({
  etichetta,
  valore,
  nota,
  delta,
  forte = false,
  className = "",
}: {
  etichetta: string;
  valore: string;
  nota?: string;
  delta?: { pct: number; rispetto: string } | null;
  /** Il primo numero della fila: quello dei soldi si vede da lontano. */
  forte?: boolean;
  className?: string;
}) {
  const su = (delta?.pct ?? 0) > 0;
  const giu = (delta?.pct ?? 0) < 0;
  const Freccia = su ? ArrowUpRight : giu ? ArrowDownRight : Minus;

  return (
    <div
      className={`rounded-[14px] border border-bordo bg-white p-4 shadow-[0_1px_2px_rgba(5,46,31,0.04)] sm:p-5 ${className}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-fumo-2">{etichetta}</p>
      <p
        className={`numeri mt-2.5 font-display leading-none tracking-[-0.04em] ${
          forte ? "text-[30px] text-verde sm:text-[34px]" : "text-[28px] sm:text-[31px]"
        } ${valore === "non letto" ? "text-[19px] text-fumo-2 sm:text-[19px]" : ""}`}
      >
        {valore}
      </p>

      {delta ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
          <span
            className={`inline-flex items-center gap-0.5 rounded-pillola px-1.5 py-0.5 font-medium ${
              su ? "bg-menta-tenue text-verde-scuro" : giu ? "bg-red-50 text-red-700" : "bg-nebbia-2 text-fumo"
            }`}
          >
            <Freccia className="size-3" aria-hidden="true" />
            {su ? "+" : ""}
            {delta.pct}%
          </span>
          <span className="text-fumo-2">{delta.rispetto}</span>
        </p>
      ) : (
        nota && <p className="mt-3 text-[12px] text-fumo-2">{nota}</p>
      )}
      {delta && nota && <p className="mt-1.5 text-[12px] text-fumo-2">{nota}</p>}
    </div>
  );
}

/** Il riquadro che dice "qui non c'è niente", senza far pensare a un guasto. */
export function Vuoto({ titolo, spiega }: { titolo: string; spiega?: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-bordo bg-nebbia/60 px-5 py-10 text-center">
      <p className="text-[14px] font-medium text-fumo">{titolo}</p>
      {spiega && <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-fumo-2">{spiega}</p>}
    </div>
  );
}

/** L'avviso in cima a una sezione quando qualcosa non ha risposto. */
export function Avviso({
  titolo,
  children,
  tono = "attesa",
}: {
  titolo: string;
  children?: React.ReactNode;
  tono?: "attesa" | "rosso";
}) {
  const vestito =
    tono === "rosso" ? `${ALLARME.bordo} ${ALLARME.fondo}` : "border-sole bg-sole/20";
  return (
    <div className={`rounded-[14px] border p-4 sm:p-5 ${vestito}`}>
      <p className="font-medium text-inchiostro">{titolo}</p>
      {children && (
        <div className="mt-1 text-[13.5px] leading-relaxed text-fumo">{children}</div>
      )}
    </div>
  );
}
