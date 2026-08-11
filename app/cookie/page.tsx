import type { Metadata } from "next";
import PaginaLegale from "@/components/legale/PaginaLegale";

import { seSiPaga } from "@/lib/check/ingresso";
export const metadata: Metadata = {
  title: "Cookie | Rivolio",
  description:
    "Rivolio usa solo cookie tecnici: niente profilazione, niente pubblicità, niente banner. Ecco quali e perché.",
};

/**
 * Cookie policy: PRIMA BOZZA operativa dell'8/08, allineata alle Linee
 * guida del Garante del 10 giugno 2021: con SOLI cookie tecnici il
 * banner non serve, basta l'informativa. Ed è il nostro caso.
 */
export default function PaginaCookie() {
  return (
    <PaginaLegale titolo="Cookie" aggiornata="8 agosto 2026">
      <p>
        La versione corta: <strong>Rivolio usa solo cookie tecnici</strong>. Niente
        profilazione, niente pubblicità, niente tracciamento fra siti. Per questo non vedi
        nessun banner: per i soli cookie tecnici le Linee guida del Garante per la protezione
        dei dati personali (10 giugno 2021) richiedono l&apos;informativa, non il consenso.
      </p>

      <h2>Cosa sono i cookie</h2>
      <p>
        I cookie sono piccoli file che il sito chiede al tuo browser di conservare. Quelli
        tecnici servono a far funzionare il sito: per esempio a ricordare che hai fatto
        l&apos;accesso.
      </p>

      <h2>I cookie che usiamo</h2>
      <ul>
        <li>
          <strong>Cookie di sessione dell&apos;accesso</strong> (Supabase Auth): vengono
          creati solo se entri nella tua area con l&apos;email e servono a tenerti collegato
          alla tua pratica. Durano il tempo della sessione e si rinnovano finché resti
          collegato. Senza questi, l&apos;area personale non può funzionare.
        </li>
      </ul>
      <p>
        {seSiPaga("L'analisi del volo", "Il check gratuito")}, la landing e l&apos;Osservatorio non impostano cookie di
        profilazione né cookie di terze parti a fini pubblicitari. Non usiamo strumenti di
        analisi che tracciano la tua identità.
      </p>

      <h2>Come li gestisci</h2>
      <p>
        Puoi cancellare o bloccare i cookie dalle impostazioni del tuo browser in qualsiasi
        momento. Se blocchi i cookie tecnici, il sito resta consultabile ma l&apos;accesso
        all&apos;area personale smette di funzionare.
      </p>

      <h2>Se qualcosa cambia</h2>
      <p>
        Se in futuro dovessimo introdurre cookie non tecnici (per esempio statistiche non
        anonimizzate), prima aggiorneremo questa pagina e ti chiederemo il consenso con un
        banner, come prevede la legge. La versione e la data in testa alla pagina ti dicono
        sempre cosa stai leggendo. Per domande:{" "}
        <a href="mailto:valerio@artecai.it">valerio@artecai.it</a>.
      </p>
    </PaginaLegale>
  );
}
