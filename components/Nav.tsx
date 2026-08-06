import Logo from "./Logo";

const voci = [
  { href: "#funzioni", testo: "Come funziona" },
  { href: "#conto", testo: "Il conto aperto" },
  { href: "#prezzi", testo: "Prezzi" },
  { href: "#domande", testo: "Domande" },
];

/** Barra a pillola fluttuante, come Zentivo. */
export default function Nav() {
  return (
    <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <header className="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between rounded-pillola border border-white/60 bg-white/55 pl-5 pr-2 shadow-[0_8px_28px_-14px_rgba(5,46,31,.28)] backdrop-blur-xl sm:pl-6">
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

        <a
          href="#iscriviti"
          className="group inline-flex items-center gap-1.5 rounded-pillola bg-white px-5 py-3 text-[14.5px] font-medium text-inchiostro shadow-sm transition-all hover:shadow-md"
        >
          Provalo gratis
          <span className="text-verde transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </header>
    </div>
  );
}
