"use client";

import { useEffect } from "react";

/**
 * Dice al sito «è arrivato qualcuno», una volta per visita.
 *
 * ⚠️ UNA VOLTA PER VISITA, non per pagina. Se contasse ogni pagina, uno
 * che legge tre articoli diventerebbe tre persone e la percentuale di chi
 * poi fa un'analisi crollerebbe per finta. Il segno sta in
 * `sessionStorage`, che si svuota quando si chiude la scheda: è
 * esattamente la definizione di "una visita".
 *
 * ⚠️ NON RALLENTA NIENTE: parte dopo il primo disegno, e usa `sendBeacon`,
 * che è il mezzo fatto per questo (il browser lo spedisce da sé, anche se
 * la persona chiude la pagina nello stesso istante). Se non c'è, si
 * ripiega su una fetch e basta; se non funziona nemmeno quella, non
 * succede niente di visibile.
 */

const SEGNO = "rivolio.visita";

export default function Visita() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEGNO)) return;
      sessionStorage.setItem(SEGNO, "1");
    } catch {
      /* Navigazione privata con l'archivio bloccato: si conta e pazienza,
         meglio un numero un filo alto che nessun numero. */
    }

    /* L'etichetta esplicita del link (`?utm_source=chatgpt`): la mettiamo
       noi sui link che pubblichiamo (Reddit, newsletter) e i motori AI a
       volte la portano. Vince sul referer, che spesso i motori tolgono. */
    const utm = new URLSearchParams(location.search).get("utm_source");

    const corpo = JSON.stringify({
      da: document.referrer || null,
      pagina: location.pathname,
      utm: utm || null,
    });

    try {
      const tipo = { type: "application/json" };
      if (!navigator.sendBeacon?.("/api/eventi/visita", new Blob([corpo], tipo))) {
        void fetch("/api/eventi/visita", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: corpo,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* Un conteggio non deve poter rompere una pagina. */
    }
  }, []);

  return null;
}
