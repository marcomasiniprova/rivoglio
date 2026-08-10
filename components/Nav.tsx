import Logo from "./Logo";
import { COPY } from "@/lib/copy";

/**
 * Barra a pillola fluttuante, come Zentivo. Voci e CTA vengono da COPY.nav.
 * La CTA porta al form del check (#controllo): è l'unica azione del sito,
 * quindi è l'unico bottone pieno della barra.
 */
export default function Nav() {
  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <header className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-3 rounded-pillola border border-white/60 bg-white/60 pl-3 pr-2 shadow-[0_8px_28px_-14px_rgba(5,46,31,.28)] backdrop-blur-xl sm:h-[68px] sm:pl-6">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {COPY.nav.voci.map((v) => (
            <a
              key={v.ancora}
              href={v.ancora}
              className="text-[15px] text-fumo transition-colors hover:text-inchiostro"
            >
              {v.testo}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* la porta della web app: dall'8/08 è di nuovo linkata dal sito.
              Pillola di vetro, non testo nudo: ogni bottone è un bottone. */}
          <a
            /* Dritto al login (scelta di Valerio, 9/08): prima portava alla web
               app, dove c'era un ALTRO "Entra". Chi vuole entrare, entra. */
            href="/entra"
            className="vetro-bottone inline-flex items-center rounded-bottone px-4 py-2.5 text-[13.5px] font-medium text-inchiostro transition-all duration-300 hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-[14.5px]"
          >
            {COPY.nav.entra}
          </a>
          <a
            href="#controllo"
            className="riflesso group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-bottone bg-verde px-4 py-2.5 text-[13.5px] font-medium text-white shadow-[0_10px_24px_-10px_rgba(6,122,70,.7),0_1px_0_0_rgba(255,255,255,.22)_inset] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro sm:px-5 sm:py-3 sm:text-[14.5px]"
          >
            {/* Sotto i 360 punti il testo pieno non ci sta e spinge la
                pagina fuori schermo: a 320 (l'SE di prima generazione e
                lo zoom di iOS) il sito scorreva di lato di 26px. Lì il
                bottone dice solo "Controlla": sopra, resta per esteso. */}
            <span className="max-[359px]:hidden">{COPY.nav.cta}</span>
            <span className="hidden max-[359px]:inline">{COPY.nav.ctaCorta}</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        </div>
      </header>
    </div>
  );
}
