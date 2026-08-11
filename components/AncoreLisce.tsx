"use client";

import { useEffect } from "react";

/**
 * NIENTE PIÙ CANCELLETTI NELL'INDIRIZZO (richiesta di Valerio, 11/08:
 * «togli sti fastidiosi asterischi, tipo #garanzia #prezzi»).
 *
 * Cosa faceva prima: cliccavi "Prezzi" e l'indirizzo diventava
 * `rivolio.netlify.app/#prezzi`. Non era rotto, ma è brutto da vedere e
 * peggio da leggere ad alta voce in un video: chi guarda si segna
 * l'indirizzo con dentro un pezzo che non gli serve.
 *
 * Cosa fa adesso: la pagina scorre fin lì e **l'indirizzo resta pulito**.
 * E il marchio, quando sei già sulla pagina a cui punta, riporta in cima
 * scorrendo invece di ricaricare tutto (richiesta sua nella stessa riga).
 *
 * ⚠️ UN PEZZO SOLO INVECE DI VENTI. Gli ancoraggi sono sparsi in una
 * ventina di componenti: cambiarli uno per uno vuol dire che il
 * ventunesimo nascerà col cancelletto. Qui si intercetta il clic una
 * volta sola, e vale anche per quello che scriveremo domani.
 *
 * ⚠️ NON ROMPE I LINK CHE GIRANO GIÀ. Chi arriva da fuori con
 * `/#prezzi` (un vecchio video, una email) ci finisce lo stesso: quel
 * lavoro lo fa il browser al caricamento e qui non lo tocchiamo. Si
 * intercetta solo il clic su un ancoraggio **della pagina in cui sei**.
 */

/** Quanto sta sotto la barra in alto: se no il titolo finisce coperto. */
const ARIA_SOPRA = 84;

export default function AncoreLisce() {
  useEffect(() => {
    function alClic(e: MouseEvent) {
      /* Clic col tasto destro, o con Ctrl/Cmd per aprire in una scheda
         nuova: sono richieste esplicite del browser, non si toccano. */
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;
      /* `target="_blank"` (i link al Tabellone dalla landing) e i
         download vanno lasciati fare al browser. */
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      let destinazione: URL;
      try {
        destinazione = new URL(link.href, location.href);
      } catch {
        return;
      }
      // Un altro sito, o un'altra pagina nostra: navigazione vera.
      if (destinazione.origin !== location.origin) return;
      if (destinazione.pathname !== location.pathname) return;

      const brusco = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const comportamento = brusco ? ("auto" as const) : ("smooth" as const);

      /* Senza cancelletto e stessa pagina = il marchio: si torna in cima
         scorrendo, invece di ricaricare la pagina che stai già guardando. */
      if (!destinazione.hash || destinazione.hash === "#") {
        fermaIlClic(e);
        window.scrollTo({ top: 0, behavior: comportamento });
        pulisciIndirizzo();
        return;
      }

      const meta = document.getElementById(decodeURIComponent(destinazione.hash.slice(1)));
      // Ancoraggio verso una sezione che non c'è: lascia fare al browser.
      if (!meta) return;

      fermaIlClic(e);
      window.scrollTo({
        top: Math.max(0, meta.getBoundingClientRect().top + window.scrollY - ARIA_SOPRA),
        behavior: comportamento,
      });
      /* ⚠️ L'indirizzo NON si tocca: è tutto il punto. La sezione si
         mette a fuoco per chi naviga da tastiera, ma senza far saltare
         la pagina una seconda volta. */
      meta.focus?.({ preventScroll: true });
      pulisciIndirizzo();
    }

    /**
     * ⚠️ SERVE `stopPropagation`, NON BASTA `preventDefault`.
     * Il marchio è un `Link` di Next, che ha un suo gestore del clic e
     * ricaricherebbe la pagina che stai già guardando. Noi ascoltiamo in
     * **fase di cattura**, cioè prima di React: qui si ferma il clic
     * proprio dove serve, e solo sui link che gestiamo noi. Fermarlo
     * sempre romperebbe i menu che si chiudono al clic.
     */
    function fermaIlClic(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
    }

    /* Se uno è arrivato da fuori con /#prezzi, quel pezzo resta scritto
       anche dopo che ha cliccato altrove, e a quel punto dice una cosa
       falsa. `replaceState` lo toglie senza aggiungere un passo alla
       cronologia, quindi il tasto indietro continua a fare la sua cosa. */
    function pulisciIndirizzo() {
      if (!location.hash) return;
      history.replaceState(null, "", location.pathname + location.search);
    }

    document.addEventListener("click", alClic, true);
    return () => document.removeEventListener("click", alClic, true);
  }, []);

  return null;
}
