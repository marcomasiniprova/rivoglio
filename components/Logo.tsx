import Image from "next/image";
import Link from "next/link";

/**
 * Il segno di Rivolio: la lente con l'aereo e le barre.
 * Definitivo, scelto da Valerio l'8/08. L'originale ad alta risoluzione
 * è `public/marchio.png` (solo segno, fondo trasparente); il lockup
 * completo con la scritta è `public/marchio-completo.png`.
 * L'interno bianco della lente lo fa reggere anche sui fondi scuri.
 */
export function Marchio({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Image
      src="/marchio.png"
      alt=""
      aria-hidden="true"
      width={96}
      height={97}
      className={`${className} shrink-0 object-contain`}
    />
  );
}

export default function Logo({ scuro = false }: { scuro?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5"
      aria-label="Rivolio, lo scanner dei rimborsi"
    >
      <Marchio className="h-9 w-9 shrink-0 transition-transform duration-500 group-hover:-rotate-6" />
      {/* Sotto i 420px il nome per esteso non ci sta accanto al bottone:
          resta il solo marchio, che è leggibile lo stesso. */}
      <span
        className={`hidden font-display text-[17px] font-medium leading-none tracking-[-0.03em] min-[420px]:inline sm:text-[18px] ${
          scuro ? "text-white" : "text-inchiostro"
        }`}
      >
        {/* due toni come nel lockup: Rivo scuro, glio verde */}
        Rivo
        <span className={scuro ? "text-menta" : "text-verde"}>glio</span>
      </span>
    </Link>
  );
}
