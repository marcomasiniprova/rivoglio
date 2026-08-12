import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Mappa from "@/components/admin/Mappa";
import { soloAdmin } from "@/lib/admin/guardia";

/**
 * LA MAPPA A SCHERMO PIENO (richiesta di Valerio, 12/08: «è troppo
 * piccola la vista e faccio fatica a usarla, vorrei vista completa
 * dedicata, tipo apri in un'altra scheda»).
 *
 * ⚠️ PERCHÉ È UNA PAGINA SUA E NON UN BOTTONE "INGRANDISCI". Dentro il
 * pannello la barra laterale si prende 240 punti di larghezza e la
 * testata un'altra sessantina di altezza: su un portatile da 1280
 * restano meno di 1040 punti per una tela che ne vuole più di 2300, e la
 * mappa esce al 25%. Qui non c'è né barra né testata: la tela parte dal
 * bordo e arriva al bordo.
 *
 * Il guardiano resta: `soloAdmin()` come ogni altra pagina del
 * retrobottega. Essere fuori dal guscio non vuol dire essere fuori dalla
 * porta.
 */
export const metadata: Metadata = {
  title: "La mappa | Rivolio",
  robots: { index: false, follow: false },
};

export default async function MappaPiena() {
  await soloAdmin();
  return (
    <div className="flex h-dvh flex-col bg-nebbia p-3 sm:p-4">
      <div className="mb-2.5 flex items-center gap-3">
        <Link
          href="/admin/mappa"
          className="inline-flex items-center gap-1.5 rounded-[9px] border border-bordo bg-white px-3 py-1.5 text-[13px] font-medium text-fumo transition-colors hover:text-inchiostro"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Torna al pannello
        </Link>
        <p className="font-display text-[17px] tracking-[-0.02em]">La mappa di Rivolio</p>
      </div>
      {/* `piena` toglie l'altezza calcolata sul guscio e prende quella che
          resta nella finestra: è tutta la differenza fra le due viste. */}
      <Mappa piena />
    </div>
  );
}
