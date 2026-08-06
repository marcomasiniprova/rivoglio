import Link from "next/link";

/**
 * Il marchio va sempre scritto per esteso: "Viaggio Anche Io" (vedi CLAUDE.md).
 * Il segno è un varco: un arco aperto con l'orizzonte dentro.
 */
export default function Logo({ scuro = false }: { scuro?: boolean }) {
  const testo = scuro ? "text-sabbia" : "text-inchiostro";
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Viaggio Anche Io">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-mare transition-transform duration-500 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M5 20V11a7 7 0 0 1 14 0v9"
            fill="none"
            stroke="var(--color-menta)"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M8.5 20v-5.5"
            fill="none"
            stroke="var(--color-menta)"
            strokeWidth="2.1"
            strokeLinecap="round"
            opacity=".45"
          />
          <circle cx="12" cy="12.4" r="1.8" fill="var(--color-sole)" />
        </svg>
      </span>
      <span
        className={`font-display text-[19px] font-semibold leading-none tracking-tight ${testo}`}
      >
        Viaggio Anche Io
      </span>
    </Link>
  );
}
