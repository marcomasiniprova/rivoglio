"use client";

import { useEffect } from "react";

/**
 * QUANDO UNA SEZIONE DEL PANNELLO SI ROMPE.
 *
 * 🔴 Prima non c'era nessuna rete: se una lettura andava storta, Next
 * mostrava la sua pagina d'errore generica, che ti butta fuori dal
 * pannello. Sparivano la barra laterale e il modo di andare da un'altra
 * parte: l'unica strada era il tasto indietro del browser, e il messaggio
 * era in inglese e parlava di cose che a Valerio non dicono niente.
 * Trovato dall'ispezione del 12/08.
 *
 * Adesso il guscio resta in piedi (questo confine sta DENTRO il layout),
 * la sezione rotta dice cosa è successo in italiano, e c'è un bottone che
 * riprova senza ricaricare tutto.
 *
 * ⚠️ Il messaggio tecnico si mostra: qui dentro c'è solo Valerio, e senza
 * quella riga un guasto non si può nemmeno raccontare a chi lo deve
 * chiudere. Non compare mai su una pagina pubblica.
 */
export default function ErroreAdmin({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[pannello] sezione in errore:", error);
  }, [error]);

  return (
    <div className="rounded-[14px] border border-red-200 bg-red-50 p-5">
      <p className="font-display text-[1.15rem] tracking-[-0.02em]">
        Questa sezione non si è aperta.
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-fumo">
        Il resto del pannello funziona: la barra a sinistra ti porta dove vuoi. Qui sotto c&apos;è
        quello che è andato storto, che serve per farlo chiudere.
      </p>
      <p className="mt-3 break-words rounded-[10px] border border-red-200 bg-white px-3 py-2 font-mono text-[12.5px] text-fumo">
        {error.message || "Errore senza messaggio."}
        {error.digest ? ` · ${error.digest}` : ""}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-[10px] bg-inchiostro px-4 py-2 text-[14px] font-medium text-bianco transition hover:opacity-90"
      >
        Riprova
      </button>
    </div>
  );
}
