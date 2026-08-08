"use client";

import SchedaCheck from "@/components/check/SchedaCheck";

/**
 * Il check dentro la web app: dall'8/08 è LA STESSA scheda della landing
 * (components/check/SchedaCheck), lo standard unico del prodotto: tratta
 * predefinita, numero, foto della carta d'imbarco e il teatro onesto.
 * Questo file resta solo come cornice bianca per il pannello.
 */
export default function CheckRapido() {
  return (
    <div className="rounded-3xl border border-bordo bg-white p-5 sm:p-7">
      <SchedaCheck />
    </div>
  );
}
