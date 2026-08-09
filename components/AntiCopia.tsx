"use client";

import { useEffect } from "react";

/**
 * Lo strato "anti-copia", scelto da Valerio col popup (9/08).
 *
 * ONESTÀ, perché è giusto saperlo: su un sito web il codice della pagina è
 * SEMPRE raggiungibile (il menu "mostra sorgente" del browser, un proxy, la
 * cache di Google). Questo strato alza solo la soglia di fastidio per il
 * curioso occasionale; un tecnico vero lo aggira in un minuto. La difesa
 * VERA è altrove ed è già in piedi: le chiavi API e il motore dei verdetti
 * vivono sul server (il browser non li vede mai), il database ha le regole
 * di accesso (RLS), le rotte hanno tetto di richieste e CORS chiuso.
 *
 * Cosa NON facciamo, di proposito: NON blocchiamo la selezione del testo.
 * La lettera di reclamo è fatta per essere copiata e incollata nell'email:
 * spegnere la selezione romperebbe il prodotto. Il tasto destro resta
 * attivo dentro i campi di testo, così copia/incolla funziona dove serve.
 */
export default function AntiCopia() {
  useEffect(() => {
    const dentroUnCampo = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      !!t.closest("input, textarea, [contenteditable='true'], .copiabile");

    const bloccaMenu = (e: MouseEvent) => {
      if (!dentroUnCampo(e.target)) e.preventDefault();
    };
    const bloccaTasti = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const devtools =
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === "i" || k === "j" || k === "c")) ||
        ((e.ctrlKey || e.metaKey) && k === "u");
      if (devtools) e.preventDefault();
    };
    const bloccaTrascina = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault();
    };

    document.addEventListener("contextmenu", bloccaMenu);
    document.addEventListener("keydown", bloccaTasti);
    document.addEventListener("dragstart", bloccaTrascina);

    console.log("%cRivolio", "font:600 22px sans-serif;color:#0a9d5c");
    console.log(
      "%cQui non c'è niente da rubare che valga qualcosa: le chiavi e il motore dei verdetti stanno sul server, non in questa pagina.",
      "color:#6b7280;font:14px sans-serif",
    );

    return () => {
      document.removeEventListener("contextmenu", bloccaMenu);
      document.removeEventListener("keydown", bloccaTasti);
      document.removeEventListener("dragstart", bloccaTrascina);
    };
  }, []);

  return null;
}
