"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { COPY } from "@/lib/copy";
import { apreAParte } from "@/lib/link";

/**
 * IL MENU DEL TELEFONO E DEL TABLET.
 *
 * 🔴 Le voci della navbar (Come funziona, Garanzia, Prezzi, Domande, Il
 * Tabellone) comparivano SOLO sopra i 1280 punti (`xl:flex`), e sotto NON
 * c'era nessun modo di raggiungerle: sparivano e basta. Su ogni portatile
 * stretto, tablet e telefono il sito perdeva metà della sua mappa, e allo
 * zoom al 90% (che allarga la pagina oltre i 1280) ricomparivano, cosa che
 * faceva sembrare tutto rotto. Segnalato da Valerio, 14/08.
 *
 * Adesso sotto i 1280 c'è questo menu con le stesse voci del desktop, più
 * "Entra", raggiungibili ovunque. Sopra i 1280 sparisce (le voci tornano in
 * linea). Così la mappa del sito è IDENTICA su ogni dispositivo, che è la
 * regola che conta.
 */
export default function MenuMobile() {
  const [aperto, setAperto] = useState(false);
  const guscio = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aperto) return;
    const suTasto = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAperto(false);
    };
    const suClic = (e: MouseEvent) => {
      if (guscio.current && !guscio.current.contains(e.target as Node)) setAperto(false);
    };
    /* ⚠️ Le voci del menu sono ancore della stessa pagina (#prezzi, ...), e
       AncoreLisce le intercetta in fase di CATTURA con stopPropagation per
       scorrere senza sporcare l'indirizzo: così l'onClick della voce non
       parte mai e il menu resterebbe aperto. Ma ogni ancora fa scorrere la
       pagina, quindi chiudere sullo scorrimento copre il caso da mouse E da
       tastiera, senza dipendere dall'evento del clic. È anche il modo in cui
       le tendine si chiudono di solito. */
    const suScorrimento = () => setAperto(false);
    document.addEventListener("keydown", suTasto);
    document.addEventListener("mousedown", suClic);
    window.addEventListener("scroll", suScorrimento, { passive: true });
    return () => {
      document.removeEventListener("keydown", suTasto);
      document.removeEventListener("mousedown", suClic);
      window.removeEventListener("scroll", suScorrimento);
    };
  }, [aperto]);

  return (
    <div ref={guscio} className="relative xl:hidden">
      <button
        type="button"
        aria-label={aperto ? "Chiudi il menu" : "Apri il menu"}
        aria-expanded={aperto}
        aria-controls="menu-mobile"
        onClick={() => setAperto((v) => !v)}
        className="grid size-10 place-items-center rounded-bottone text-inchiostro transition-colors hover:bg-white/60"
      >
        {aperto ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {aperto && (
          <motion.nav
            id="menu-mobile"
            aria-label="Menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-bordo bg-white/95 p-1.5 shadow-[0_24px_48px_-20px_rgba(5,46,31,.34)] backdrop-blur-xl"
          >
            {COPY.nav.voci.map((v) => (
              <a
                key={v.ancora}
                href={v.ancora}
                {...apreAParte(v.ancora)}
                onClick={() => setAperto(false)}
                className="block rounded-xl px-4 py-2.5 text-[15px] text-inchiostro transition-colors hover:bg-menta-tenue"
              >
                {v.testo}
              </a>
            ))}
            <div className="my-1.5 h-px bg-bordo/70" />
            <a
              href="/entra"
              onClick={() => setAperto(false)}
              className="block rounded-xl px-4 py-2.5 text-[15px] font-medium text-inchiostro transition-colors hover:bg-menta-tenue"
            >
              {COPY.nav.entra}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
