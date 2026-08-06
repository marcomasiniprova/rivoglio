import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Bottone: struttura shadcn/ui, vestito con i colori di Viaggio Anche Io.
 * Le varianti sono le nostre, non quelle di default: qui il verde è il marchio.
 */
const varianti = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pillola font-medium transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-verde/40 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        pieno:
          "bg-verde text-white shadow-[0_6px_20px_-6px_rgba(10,157,92,0.55)] hover:bg-verde-scuro hover:shadow-[0_10px_28px_-8px_rgba(10,157,92,0.6)] active:scale-[0.985]",
        scuro:
          "bg-inchiostro text-white hover:bg-inchiostro/85 active:scale-[0.985]",
        contorno:
          "border border-bordo bg-white text-inchiostro hover:border-verde/40 hover:bg-menta-tenue active:scale-[0.985]",
        fantasma: "text-fumo hover:bg-nebbia-2 hover:text-inchiostro",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[0.95rem]",
        lg: "h-13 px-8 text-base",
        icona: "size-10",
      },
    },
    defaultVariants: { variant: "pieno", size: "md" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof varianti> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(varianti({ variant, size }), className)} {...props} />;
}

export { Button, varianti as variantiBottone };
