"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * LO SCROLL PESANTE (richiesta di Valerio, 11/08).
 *
 * La rotellina non muove più la pagina: alimenta un OBIETTIVO, e la
 * pagina ci arriva con inerzia. Una scrollata violenta da 900 punti si
 * distende in circa un secondo e mezzo, come sui siti fatti bene.
 *
 * Perché non è un vezzo: il sito vende calma e precisione, e una pagina
 * che si posa invece di sbattere dice la stessa cosa senza scriverla.
 *
 * COSA RESTA NATIVO, e non è una rinuncia:
 * - **il dito.** Sul telefono il contenuto sta attaccato al polpastrello:
 *   frenarlo si sente come un difetto, non come un effetto. Il touch non
 *   viene toccato.
 * - **le aree che scorrono per conto loro** (la striscia degli argomenti,
 *   il tavolo della lavagna, un elenco dentro una scheda). Se l'evento
 *   nasce lì dentro, non lo intercettiamo: dentro un contenitore che
 *   scorre, l'inerzia della pagina è solo confusione.
 * - **la tastiera** (frecce, PagGiù, spazio) e i salti alle ancore: chi
 *   naviga così ha bisogno di arrivare, non di essere accompagnato.
 * - **Ctrl e rotellina**, che è lo zoom del browser.
 * - **chi ha chiesto meno animazioni** nel sistema operativo: per quelle
 *   persone il movimento non è bello, è un problema fisico.
 *
 * Fuori anche `/anteprima-app`: quella pagina è un tavolo che si trascina
 * e ha già la sua rotellina.
 */

/** Quanta strada si recupera a ogni fotogramma, a 60 al secondo.
 *  0.05 porta al 99% in circa 90 fotogrammi, cioè un secondo e mezzo. */
const RECUPERO = 0.05;

/** Sotto questa distanza si è arrivati: continuare sarebbe tremolio. */
const VICINO = 1;

/** LA CODA. Un recupero a percentuale non arriva mai davvero: gli ultimi
    quaranta punti si mangiavano un secondo in più e la pagina sembrava
    non fermarsi mai (misurato: 2,5 secondi invece di 1,5). Da lì in giù
    si procede a velocità fissa, due punti per fotogramma, che a occhio
    non è uno scatto ed è quello che chiude il movimento. */
const PASSO_MINIMO = 3.2;

/** Una tacca di rotellina "a righe" vale circa una riga di testo. */
const RIGA = 16;

export default function ScrollPesante() {
  const percorso = usePathname();

  useEffect(() => {
    if (percorso?.startsWith("/anteprima-app")) return;
    if (typeof window === "undefined") return;

    const menoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (menoMovimento.matches) return;

    let obiettivo = window.scrollY;
    let corrente = window.scrollY;
    let inCorso = false;
    let fotogramma = 0;
    let ultimoIstante = 0;

    const fondo = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const dentroIBordi = (v: number) => Math.min(fondo(), Math.max(0, v));

    /* L'evento è nato dentro qualcosa che scorre da sé? Allora è roba
       sua: la pagina non c'entra. */
    function scorreDaSe(partenza: EventTarget | null): boolean {
      let nodo = partenza instanceof Element ? partenza : null;
      while (nodo && nodo !== document.body && nodo !== document.documentElement) {
        const stile = getComputedStyle(nodo);
        const scorrevole = /(auto|scroll)/.test(stile.overflowY + stile.overflow);
        if (scorrevole && nodo.scrollHeight > nodo.clientHeight + 1) return true;
        nodo = nodo.parentElement;
      }
      return false;
    }

    function passo(istante: number) {
      const trascorso = ultimoIstante ? Math.min(64, istante - ultimoIstante) : 16.7;
      ultimoIstante = istante;

      /* Il recupero è calcolato sul tempo passato, non sul fotogramma:
         così a 120 immagini al secondo la pagina ci mette lo stesso
         tempo, non la metà. */
      const quota = 1 - Math.pow(1 - RECUPERO, trascorso / 16.6667);
      const distanza = obiettivo - corrente;
      const perFrame = distanza * quota;
      const minimo = Math.sign(distanza) * PASSO_MINIMO * (trascorso / 16.6667);
      corrente +=
        Math.abs(perFrame) < Math.abs(minimo) && Math.abs(distanza) > Math.abs(minimo)
          ? minimo
          : perFrame;

      if (Math.abs(obiettivo - corrente) < VICINO) {
        corrente = obiettivo;
        inCorso = false;
        window.scrollTo({ top: corrente, behavior: "instant" });
        return;
      }
      window.scrollTo({ top: corrente, behavior: "instant" });
      fotogramma = requestAnimationFrame(passo);
    }

    function suRotella(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) return; // lo zoom del browser
      if (e.deltaY === 0) return; // scroll laterale: non è affar nostro
      if (scorreDaSe(e.target)) return;

      const passoRotella =
        e.deltaMode === 1 ? e.deltaY * RIGA : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;

      e.preventDefault();

      /* Se non stiamo già scorrendo, si riparte da dove sta davvero la
         pagina: nel frattempo può averla mossa un'ancora o la tastiera. */
      if (!inCorso) {
        corrente = window.scrollY;
        obiettivo = corrente;
      }
      obiettivo = dentroIBordi(obiettivo + passoRotella);

      if (!inCorso) {
        inCorso = true;
        ultimoIstante = 0;
        fotogramma = requestAnimationFrame(passo);
      }
    }

    /* Quando la pagina si muove per altri motivi (un'ancora, la barra di
       scorrimento, la tastiera) l'obiettivo si riallinea, se no la
       rotellina successiva riporterebbe indietro di colpo. */
    function suScorrimento() {
      if (inCorso) return;
      corrente = window.scrollY;
      obiettivo = corrente;
    }

    /* Il dito ferma tutto e restituisce il comando al sistema. */
    function suTocco() {
      if (!inCorso) return;
      inCorso = false;
      cancelAnimationFrame(fotogramma);
      corrente = window.scrollY;
      obiettivo = corrente;
    }

    window.addEventListener("wheel", suRotella, { passive: false });
    window.addEventListener("scroll", suScorrimento, { passive: true });
    window.addEventListener("touchstart", suTocco, { passive: true });

    return () => {
      cancelAnimationFrame(fotogramma);
      window.removeEventListener("wheel", suRotella);
      window.removeEventListener("scroll", suScorrimento);
      window.removeEventListener("touchstart", suTocco);
    };
  }, [percorso]);

  return null;
}
