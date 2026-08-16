"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PREPARA IL RECLAMO: i due passaggi facoltativi (carta d'imbarco, spese
 * art. 9) VENGONO PRIMA, e la lettera si mostra DOPO.
 *
 * Valerio, 15/08: «la lettera deve essere fatta DOPO questi due primi passi.
 * Se li fai o non li fai, poi la lettera viene scritta e sarà visibile, non
 * prima, sennò quei passi diventano inutili e hanno meno importanza».
 *
 * ⚠️ NON è il muro grigio del 12/08 (quello che lui stesso fece togliere il
 * 13/08: «appena pago vengo rediretto dove il bottone è grigio, che senso
 * ha?»). Qui non c'è niente di bloccato: i due passi restano FACOLTATIVI, e
 * il bottone «Il mio reclamo è pronto» PORTA AVANTI, non impedisce. La
 * differenza col muro è tutta qui: prima un bottone spento diceva «non ti do
 * quello che hai comprato», adesso un bottone acceso dice «quando vuoi,
 * eccolo».
 *
 * Il reveal vive solo nel browser: i due passi ricaricano la pagina quando
 * agisci (serve a rigenerare la lettera con le tue spese dentro), quindi al
 * ritorno si riparte dai passi, aggiornati, e si preme di nuovo «pronto».
 * È voluto: è esattamente «prima i passi, poi il reclamo», e nessun muro da
 * database che possa rompersi il giorno del dominio nuovo.
 */
export default function PreparaReclamo({
  prep,
  lettera,
}: {
  /** I due passi facoltativi: carta d'imbarco e spese (art. 9). */
  prep: ReactNode;
  /** Il reclamo vero e proprio: si mostra dopo «pronto». */
  lettera: ReactNode;
}) {
  const [pronto, setPronto] = useState(false);

  if (pronto) return <>{lettera}</>;

  return (
    <div className="mt-5 border-t border-bordo pt-5">
      <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
        <ClipboardList className="size-4 shrink-0 text-verde" aria-hidden="true" />
        Prepara il reclamo
      </h2>
      <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
        Due passaggi facoltativi che rendono la lettera più solida. Falli o saltali: appena sei
        pronto, apri il tuo reclamo qui sotto.
      </p>

      <div className="mt-4 space-y-4">{prep}</div>

      <Button type="button" variant="pieno" className="mt-6" onClick={() => setPronto(true)}>
        Il mio reclamo è pronto
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
