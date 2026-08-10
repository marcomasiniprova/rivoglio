import type { Metadata } from "next";
import LavagnaApp from "@/components/rivolio/LavagnaApp";

/**
 * L'ANTEPRIMA DELL'APP, su una lavagna libera.
 *
 * Serve a Valerio: vedere l'app aggiornata scrivendo un indirizzo, senza
 * PowerShell e senza installare niente. Dal 10/08 non è più UN telefono
 * ma un tavolo con tutte le schermate insieme: si trascina, si zooma, e
 * il modello di telefono si cambia per tutte in una volta.
 *
 * La build web dell'app vive in /public/app-anteprima (la rigenera
 * `npm run anteprima` dentro mobile/ a ogni giro).
 *
 * Non è linkata da nessuna parte e non va sui motori: è un ferro di
 * lavoro, non una pagina del prodotto.
 */

export const metadata: Metadata = {
  title: "Anteprima app | Rivolio",
  robots: { index: false, follow: false },
};

export default function PaginaAnteprimaApp() {
  return <LavagnaApp />;
}
