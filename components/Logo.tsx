import Link from "next/link";

/**
 * Il segno di Viaggio Anche Io.
 *
 * Vincolo di progetto: deve reggere a 24px, perché è lì che si vedrà quasi
 * sempre (favicon, avatar del bot Telegram, icona sulla schermata Home).
 * Per questo ha SOLO TRE forme: il sole, l'orizzonte, la linea di mezzeria.
 * Se aggiungi un quarto elemento, a 24px diventa una macchia — non farlo.
 *
 * Il sole resta oro (dal logo disegnato da Valerio): è l'unico punto caldo
 * del marchio e serve a staccare sul verde.
 */
export function Marchio({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8.5" fill="var(--color-mare)" />
      {/* il sole */}
      <circle cx="16" cy="13.2" r="5.1" fill="var(--color-sole)" />
      {/* l'orizzonte / la strada che si perde */}
      <path
        d="M4.5 24.2C9 20.6 23 20.6 27.5 24.2"
        fill="none"
        stroke="var(--color-menta)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* la mezzeria: è questo che la fa leggere come strada, non come collina */}
      <path
        d="M13.6 22.1h1.9M17.6 22.4h2.1"
        stroke="var(--color-mare)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Marchio + nome + tagline. La tagline è di Valerio, si tiene. */
export default function Logo({
  scuro = false,
  tagline = false,
}: {
  scuro?: boolean;
  tagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5"
      aria-label="Viaggio Anche Io — la tua fuga, al prezzo giusto"
    >
      <Marchio className="h-9 w-9 shrink-0 transition-transform duration-500 group-hover:-rotate-6" />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[19px] font-semibold tracking-tight ${
            scuro ? "text-sabbia" : "text-inchiostro"
          }`}
        >
          Viaggio Anche Io
        </span>
        {tagline && (
          <span
            className={`mt-1 text-[11px] font-medium uppercase tracking-[.13em] ${
              scuro ? "text-sabbia/50" : "text-fumo-2"
            }`}
          >
            La tua fuga, al prezzo giusto
          </span>
        )}
      </span>
    </Link>
  );
}
