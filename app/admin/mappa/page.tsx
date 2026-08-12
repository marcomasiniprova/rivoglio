import type { Metadata } from "next";
import { Maximize2 } from "lucide-react";
import Mappa from "@/components/admin/Mappa";
import { soloAdmin } from "@/lib/admin/guardia";
import { conto } from "@/lib/admin/mappa";

/**
 * LA LAVAGNA DEL BUSINESS.
 *
 * ⚠️ Perché non ci sono numeri qui dentro: scelta di Valerio (12/08),
 * «i numeri li dà il pannello, la whiteboard è la MACROVISTA di tutto
 * Rivolio». Questa pagina risponde a «come funziona», il cruscotto
 * risponde a «come sta andando». Tenerle separate vuol dire che nessuna
 * delle due invecchia per colpa dell'altra.
 */
export const metadata: Metadata = {
  title: "La mappa | Rivolio",
  robots: { index: false, follow: false },
};

export default async function PaginaMappa() {
  await soloAdmin();
  const c = conto();

  return (
    <div>
      <p className="mb-4 text-[14px] leading-relaxed text-fumo">
        Tutto Rivolio in una schermata: da dove arriva la gente, cosa compra, dove
        entrano i soldi e cosa succede dopo.{" "}
        <strong className="text-inchiostro">
          {c.fatto} pezzi funzionano, {c.spento} sono costruiti ma spenti, {c.manca} non
          ci sono ancora.
        </strong>{" "}
        Le strade tratteggiate sono quelle che oggi si interrompono.
      </p>
      <div className="mb-3">
        <a
          href="/admin/mappa/piena"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-[10px] border border-verde/35 bg-menta-tenue px-4 py-2 text-[13.5px] font-medium text-verde-scuro transition-colors hover:border-verde"
        >
          <Maximize2 className="size-4" aria-hidden="true" />
          Apri a schermo intero
          <span className="text-[12px] text-verde-scuro/70">in una scheda nuova</span>
        </a>
      </div>
      <Mappa />
    </div>
  );
}
