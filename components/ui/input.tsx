import * as React from "react";
import { cn } from "@/lib/utils";

/** Campo di testo. Struttura shadcn/ui, bordi e fuoco coi nostri colori. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-2xl border border-bordo bg-white px-4 text-[0.95rem] text-inchiostro",
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
