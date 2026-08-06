import Link from "next/link";

/**
 * Il segno di Viaggio Anche Io.
 *
 * Vincolo: deve reggere a 24px, perché è lì che si vede quasi sempre
 * (favicon, avatar del bot Telegram, icona sulla schermata Home).
 * SOLO TRE FORME: sole, orizzonte, mezzeria. Un quarto elemento a 24px
 * diventa una macchia — provato con Playwright, non aggiungerlo.
 */
export function Marchio({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8.5" fill="var(--color-verde)" />
      <circle cx="16" cy="13.2" r="5.1" fill="var(--color-sole)" />
      <path
        d="M4.5 24.2C9 20.6 23 20.6 27.5 24.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* la mezzeria fa leggere "strada" invece di "collina".
          Provata a 24px: sotto strokeWidth 2 sparisce. Non ridurla. */}
      <path
        d="M12.4 21.9h3.1M18 22.3h3"
        stroke="var(--color-verde)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({ scuro = false }: { scuro?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5"
      aria-label="Viaggio Anche Io, la tua fuga al prezzo giusto"
    >
      <Marchio className="h-9 w-9 transition-transform duration-500 group-hover:-rotate-6" />
      <span
        className={`font-display text-[18px] font-medium leading-none tracking-[-0.03em] ${
          scuro ? "text-white" : "text-inchiostro"
        }`}
      >
        Viaggio Anche Io
      </span>
    </Link>
  );
}
