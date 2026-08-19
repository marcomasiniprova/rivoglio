"use client";

import { useState } from "react";
import { Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 🔴 «I DUE PULSANTI NON FUNZIONANO MINIMAMENTE, HO PROVATO A CLICCARLI
 * MA NULLA» (Valerio, 13/08, con lo screenshot).
 *
 * Aveva ragione, e la causa è precisa: «Copia l'oggetto» e «Stampa o
 * salva in PDF» erano collegati da uno `<script>` messo dentro il JSX con
 * `dangerouslySetInnerHTML`. Un tag `<script>` inserito così **non viene
 * mai eseguito**: né quando React lo attacca al DOM, né quando si arriva
 * alla pagina navigando da dentro il sito (che è il caso normale: ci si
 * arriva dalla pratica). Quindi nessun ascoltatore veniva mai agganciato,
 * e i due bottoni erano decorazioni.
 *
 * Adesso sono un componente vero, coi gesti di React. Costa qualche riga
 * di JavaScript in più nel browser e vale il prezzo: un bottone che non
 * fa niente è peggio di un bottone che non c'è.
 */
export default function AzioniFoglio({
  oggetto,
  /** Etichetta del primo bottone: cambia col documento del momento. */
  etichettaCopia = "Copia l'oggetto",
}: {
  oggetto: string;
  etichettaCopia?: string;
}) {
  const [detto, setDetto] = useState<string | null>(null);

  async function copia(testo: string, conferma: string) {
    try {
      await navigator.clipboard.writeText(testo);
      setDetto(conferma);
    } catch {
      /* Appunti negati (permessi, connessione non sicura): si dice invece
         di fingere che sia andata bene. Il testo resta visibile nel
         foglio qui sotto, quindi si copia a mano. */
      setDetto("Non riesco a copiare: seleziona il testo qui sotto");
    }
    setTimeout(() => setDetto(null), 2400);
  }

  return (
    <div className="no-stampa flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* 🔴 «DUE BOTTONI UGUALI CHE FANNO LA STESSA COSA, COPIA IL TESTO»
            (Valerio, 18/08). Il "Copia il testo" stava sia qui sia in cima,
            accanto a "Apri l'email". Tolto QUI (scelta col popup): in cima
            resta il gesto principale, qui restano l'oggetto e la stampa. */}
        <Button type="button" variant="contorno" onClick={() => void copia(oggetto, "Oggetto copiato.")}>
          <Copy className="size-4" aria-hidden="true" />
          {etichettaCopia}
        </Button>
        <Button type="button" variant="contorno" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden="true" />
          Stampa o salva in PDF
        </Button>
      </div>
      {detto && (
        <p role="status" className="text-sm text-verde">
          {detto}
        </p>
      )}
    </div>
  );
}
