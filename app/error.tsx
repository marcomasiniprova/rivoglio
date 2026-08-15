"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * LA RETE DI SICUREZZA DELLE PAGINE PUBBLICHE.
 *
 * 🔴 Trovato dall'audit di scalabilità del 14/08: fuori dal pannello non
 * c'era nessun confine d'errore. Se un Server Component lanciava durante il
 * render (una lettura Supabase che rigetta sotto carico, un dato in una forma
 * inattesa), Next mostrava la sua pagina bianca in inglese: "Application
 * error: a server-side exception has occurred", senza logo, senza uscita.
 * È esattamente il "500 in faccia" che Valerio ha chiesto di non far vedere
 * mai. Lo stesso buco era già chiuso in /admin, ma mai portato sul pubblico.
 *
 * A differenza dell'admin, qui NON si mostra il messaggio tecnico: sono
 * pagine pubbliche. Il guasto si legge nei log (con il digest per ritrovarlo),
 * l'utente vede una frase calma e due strade.
 */
export default function ErrorePubblico({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[pagina pubblica] errore:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-nebbia px-6 text-center">
      <div className="max-w-md">
        <p className="font-display text-[1.7rem] leading-tight tracking-[-0.03em] text-inchiostro">
          Qualcosa si è inceppato.
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-fumo">
          Non è colpa tua, e non hai perso niente. Riprova fra un momento: quasi sempre basta.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-bottone bg-verde px-5 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-verde-scuro"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="rounded-bottone border border-bordo bg-white px-5 py-3 text-[14.5px] font-medium text-inchiostro transition-colors hover:border-verde/40"
          >
            Torna alla home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-5 text-[12px] text-fumo-2">
            Codice del guasto: <span className="numeri">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  );
}
