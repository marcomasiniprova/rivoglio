"use client";

import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, MapPin, Pencil } from "lucide-react";
import { salvaPartenza, type EsitoApp } from "@/app/app/azioni";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function BaseDiPartenza({
  attuale,
  citta,
}: {
  attuale: string | null;
  citta: string[];
}) {
  const [aperto, setAperto] = useState(!attuale);
  const [esito, invia, inCorso] = useActionState(salvaPartenza, {} as EsitoApp);

  // Salvato: il pannello si richiude da solo dopo un attimo, così fai in
  // tempo a leggere la conferma.
  useEffect(() => {
    if (!esito.ok) return;
    const t = setTimeout(() => setAperto(false), 900);
    return () => clearTimeout(t);
  }, [esito.ok]);

  if (attuale && !aperto) {
    return (
      <Card className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-menta-tenue">
            <MapPin className="size-4 text-verde" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-fumo-2">Parti da</p>
            <p className="truncate font-medium">{attuale}</p>
          </div>
        </div>
        <Button variant="fantasma" size="sm" onClick={() => setAperto(true)}>
          <Pencil className="size-3.5" aria-hidden="true" />
          Cambia
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form action={invia} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="comune">Da dove parti</Label>
          <select
            id="comune"
            name="comune"
            defaultValue={attuale ?? ""}
            required
            className="h-12 w-full appearance-none rounded-2xl border border-bordo bg-white px-4 text-[0.95rem] transition-colors focus:border-verde/50 focus:outline-none focus:ring-4 focus:ring-verde/10"
          >
            <option value="" disabled>
              Scegli la tua città
            </option>
            {citta.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="text-xs text-fumo-2">
            Serve per calcolare chilometri, benzina e pedaggi. Non la diamo a nessuno.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={inCorso} className="sm:mb-6">
          {inCorso ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Salva
        </Button>
      </form>

      <AnimatePresence>
        {esito.errore && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-red-600"
          >
            {esito.errore}
          </motion.p>
        )}
        {esito.ok && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-1.5 text-sm text-verde"
          >
            <Check className="size-4" aria-hidden="true" />
            {esito.ok}
          </motion.p>
        )}
      </AnimatePresence>
    </Card>
  );
}
