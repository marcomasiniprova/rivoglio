import Link from "next/link";
import Logo from "./Logo";

const voci = [
  { href: "#funzioni", testo: "Come funziona" },
  { href: "#conto", testo: "Il conto aperto" },
  { href: "#dentro", testo: "Com'è dentro" },
  { href: "#prezzi", testo: "Prezzi" },
  { href: "#domande", testo: "Domande" },
];

/** Barra a pillola fluttuante, come Zentivo. */
export default function Nav() {
  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <header className="mx-auto flex h-[60px] max-w-[1120px] items-center justify-between gap-3 rounded-pillola border border-white/60 bg-white/60 pl-3 pr-2 shadow-[0_8px_28px_-14px_rgba(5,46,31,.28)] backdrop-blur-xl sm:h-[68px] sm:pl-6">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {voci.map((v) => (
            <a
              key={v.href}
              href={v.href}
              className="text-[15px] text-fumo transition-colors hover:text-inchiostro"
            >
              {v.testo}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Sotto i 420px sparisce: accanto al bottone verde non ci sta. */}
          <Link
            href="/entra"
            className="hidden whitespace-nowrap px-2 text-[13.5px] text-fumo transition-colors hover:text-inchiostro min-[420px]:inline sm:px-3 sm:text-[14.5px]"
          >
            Entra
          </Link>

          <Link
            href="/entra?modo=registrati"
            className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pillola bg-white px-4 py-2.5 text-[13.5px] font-medium text-inchiostro shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:py-3 sm:text-[14.5px]"
          >
            Provalo gratis
            <span className="text-verde transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </Link>
        </div>
      </header>
    </div>
  );
}
