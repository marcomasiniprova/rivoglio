"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * UN TESTO PRONTO, CON IL BOTTONE PER COPIARLO.
 *
 * Serve alla pagina Marketing: i testi da incollare su Reddit, Quora o
 * nella newsletter, e le domande da fare ogni mese ai motori AI. Il bottone
 * copia tutto in un gesto, così non si perde un pezzo selezionando a mano.
 *
 * ⚠️ Se gli appunti sono negati (permessi, connessione non sicura) lo dice,
 * invece di fingere che sia andata: il testo resta comunque visibile e si
 * seleziona a mano.
 */
export default function BloccoDaCopiare({
  testo,
  etichetta = "Copia",
}: {
  testo: string;
  etichetta?: string;
}) {
  const [fatto, setFatto] = useState(false);
  const [errore, setErrore] = useState(false);

  async function copia() {
    try {
      await navigator.clipboard.writeText(testo);
      setFatto(true);
      setErrore(false);
      setTimeout(() => setFatto(false), 2200);
    } catch {
      setErrore(true);
      setTimeout(() => setErrore(false), 3000);
    }
  }

  return (
    <div className="rounded-[12px] border border-bordo bg-nebbia/60">
      <div className="flex items-center justify-between gap-2 border-b border-bordo px-3 py-2">
        <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-fumo-2">
          Da incollare
        </span>
        <button
          type="button"
          onClick={() => void copia()}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-bordo bg-white px-2.5 py-1.5 text-[13px] font-medium text-inchiostro transition-colors hover:border-verde/45 hover:text-verde-scuro"
        >
          {fatto ? (
            <Check className="size-[15px] text-verde" aria-hidden="true" />
          ) : (
            <Copy className="size-[15px]" aria-hidden="true" />
          )}
          {fatto ? "Copiato" : etichetta}
        </button>
      </div>
      <pre className="max-h-none overflow-x-auto whitespace-pre-wrap px-3.5 py-3 text-[13.5px] leading-relaxed text-inchiostro">
        {testo}
      </pre>
      {errore && (
        <p role="status" className="px-3.5 pb-2.5 text-[12.5px] text-fumo">
          Non riesco a copiare da qui: seleziona il testo a mano.
        </p>
      )}
    </div>
  );
}
