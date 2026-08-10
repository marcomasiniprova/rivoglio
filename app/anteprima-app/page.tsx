import { readdirSync } from "node:fs";
import { join } from "node:path";
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

/**
 * Il programma dell'app, letto dalla cartella al momento della build.
 * Serve a scaricarlo UNA volta sola: senza, ognuno dei trentatré
 * riquadri se lo chiede per conto suo e la lavagna ci mette mezzo
 * minuto ad accendersi. Il nome porta l'impronta del contenuto, quindi
 * cambia da solo a ogni ricostruzione e non va tenuto aggiornato a mano.
 */
function programmaApp(): string | null {
  try {
    const cartella = join(process.cwd(), "public", "app-anteprima", "_expo", "static", "js", "web");
    const file = readdirSync(cartella).find((n) => n.endsWith(".js"));
    return file ? `/app-anteprima/_expo/static/js/web/${file}` : null;
  } catch {
    /* anteprima non ancora generata: la lavagna lo dice da sé */
    return null;
  }
}

export default function PaginaAnteprimaApp() {
  const programma = programmaApp();
  return (
    <>
      {programma && <link rel="preload" as="script" href={programma} />}
      <LavagnaApp />
    </>
  );
}
