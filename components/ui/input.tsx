import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Campo di testo. Struttura shadcn/ui, bordi e fuoco coi nostri colori.
 *
 * 🔴 IL TESTO NON PUÒ SCENDERE SOTTO I 16px, e non è una scelta di gusto.
 * Su iPhone, quando tocchi un campo con la scritta più piccola di 16px,
 * Safari **ingrandisce la pagina da solo** per farti leggere: la
 * schermata salta, esce dallo schermo di lato e resta zoomata anche dopo.
 * È il difetto che Valerio ha descritto il 12/08 («la vista si spappola,
 * si storta, esce dallo schermo, specialmente nella parte del login»).
 * Qui c'era `0.95rem`, cioè 15,2px: mancavano otto decimi di pixel.
 * Su schermo grande la differenza non si vede; sul telefono è la
 * differenza fra una pagina ferma e una pagina che scappa.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-2xl border border-bordo bg-white px-4 text-[16px] text-inchiostro",
        "placeholder:text-fumo-2 transition-colors duration-200",
        "focus:border-verde/50 focus:outline-none focus:ring-4 focus:ring-verde/10",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
