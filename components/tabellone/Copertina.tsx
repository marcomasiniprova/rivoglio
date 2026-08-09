import Image from "next/image";
import { COPERTINE } from "./Copertine";

/**
 * La copertina di un articolo, col telaio del riferimento: bordo sottile
 * verde notte e il blocco pieno che sbuca in basso a destra quando ci
 * passi sopra col puntatore.
 *
 * Se l'articolo dichiara `foto`, vince la foto: le illustrazioni sono un
 * ponte, non una scelta di stile definitiva.
 */
export default function Copertina({
  chiave,
  foto,
  alt,
  proporzioni = "aspect-[16/10]",
  priorita = false,
  dimensioni = "(max-width: 768px) 100vw, 33vw",
}: {
  chiave: string;
  foto?: string;
  alt: string;
  proporzioni?: string;
  priorita?: boolean;
  dimensioni?: string;
}) {
  const Disegno = COPERTINE[chiave] ?? COPERTINE["tabellone-partenze"];

  return (
    <div className={`cornice-sfalsata relative w-full overflow-hidden rounded-[5px] ${proporzioni}`}>
      <div className="absolute inset-0 overflow-hidden rounded-[5px] border border-verde-notte/25 bg-verde-notte">
        {foto ? (
          <Image
            src={foto}
            alt={alt}
            fill
            sizes={dimensioni}
            priority={priorita}
            className="object-cover"
          />
        ) : (
          <Disegno className="block h-full w-full object-cover" />
        )}
      </div>
    </div>
  );
}
