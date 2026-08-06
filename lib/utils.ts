import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Unisce classi Tailwind risolvendo i conflitti. È la funzione base di shadcn/ui. */
export function cn(...classi: ClassValue[]) {
  return twMerge(clsx(classi));
}
