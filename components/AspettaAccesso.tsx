"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * LA PAGINA D'ATTESA CHE SI FA ENTRARE DA SOLA.
 *
 * Sta sotto il messaggio "ti ho mandato il link". Ogni pochi secondi chiede
 * al server «sono entrato adesso?» (vedi app/api/sessione-attiva). Appena la
 * risposta è sì — perché il link, aperto in un'altra scheda, ha messo il
 * cookie valido per tutto il sito — questa pagina si porta dentro da sola,
 * senza che tu debba tornarci sopra.
 *
 * Perché una navigazione piena (`assign`) e non un router.push: la sessione
 * vive in un cookie che legge il SERVER, quindi la pagina di destinazione va
 * ricostruita dal server con quel cookie in mano. Un cambio di rotta solo
 * lato browser non lo garantisce.
 *
 * Prudenze:
 * - controlla SUBITO all'apertura e ogni volta che torni su questa scheda
 *   (`visibilitychange`/`focus`): così appena riguardi la pagina è già pronta.
 * - si ferma da sola dopo qualche minuto: se il link non lo apri, non ha
 *   senso continuare a chiedere per sempre.
 */
export default function AspettaAccesso({ poi = "/app" }: { poi?: string }) {
  const [entrato, setEntrato] = useState(false);
  const fermo = useRef(false);

  useEffect(() => {
    const partenza = Date.now();
    const LIMITE = 6 * 60 * 1000; // dopo sei minuti smette di chiedere
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function guarda() {
      if (fermo.current) return;
      if (Date.now() - partenza > LIMITE) return; // basta, il link non è stato aperto
      try {
        const r = await fetch("/api/sessione-attiva", { cache: "no-store" });
        if (r.ok) {
          const d: { dentro?: boolean } = await r.json();
          if (d.dentro && !fermo.current) {
            fermo.current = true;
            setEntrato(true);
            window.location.assign(poi);
            return;
          }
        }
      } catch {
        // rete ballerina: non è un errore da mostrare, si riprova al giro dopo
      }
      timer = setTimeout(guarda, 3000);
    }

    function subito() {
      if (document.visibilityState === "visible") void guarda();
    }

    void guarda();
    document.addEventListener("visibilitychange", subito);
    window.addEventListener("focus", subito);

    return () => {
      fermo.current = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", subito);
      window.removeEventListener("focus", subito);
    };
  }, [poi]);

  return (
    <p className="mt-3 flex items-center justify-center gap-2 text-[13px] text-fumo-2">
      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      {entrato ? "Sei dentro, ti porto alla tua pagina…" : "Appena apri il link, questa pagina ti fa entrare da sola."}
    </p>
  );
}
