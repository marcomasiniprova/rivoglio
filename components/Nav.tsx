import Logo from "./Logo";

const voci = [
  { href: "#come-funziona", testo: "Come funziona" },
  { href: "#trasparenza", testo: "Il conto aperto" },
  { href: "#prezzi", testo: "Prezzi" },
  { href: "#domande", testo: "Domande" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-sabbia-3/60 bg-sabbia/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <ul className="hidden items-center gap-9 lg:flex">
          {voci.map((v) => (
            <li key={v.href}>
              <a
                href={v.href}
                className="text-[15px] text-fumo transition-colors hover:text-inchiostro"
              >
                {v.testo}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#iscriviti"
          className="rounded-pillola bg-menta px-5 py-2.5 text-[15px] font-semibold text-mare-scuro shadow-[0_1px_0_rgba(255,255,255,.6)_inset] transition-all hover:bg-menta-2 hover:shadow-lg hover:shadow-menta/40"
        >
          Provalo gratis
        </a>
      </nav>
    </header>
  );
}
