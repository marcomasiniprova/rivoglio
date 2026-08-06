"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Plus, Waves, Mountain, Building2, Droplets } from "lucide-react";
import { creaRicerca, type EsitoApp } from "@/app/app/azioni";
import type { Tipo } from "@/lib/destinazioni";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TIPI: { valore: Tipo; nome: string; Icona: typeof Waves }[] = [
  { valore: "mare", nome: "Mare", Icona: Waves },
  { valore: "monte", nome: "Montagna", Icona: Mountain },
  { valore: "citta", nome: "Città", Icona: Building2 },
  { valore: "terme", nome: "Terme", Icona: Droplets },
];

/** 2h30 invece di 2,5. Nessuno ragiona in ore decimali. */
function oreLeggibili(ore: number) {
  const h = Math.floor(ore);
  const m = Math.round((ore - h) * 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export default function NuovaRicerca({ prima }: { prima: boolean }) {
  const [aperto, setAperto] = useState(prima);
  const [budget, setBudget] = useState(120);
  const [ore, setOre] = useState(2.5);
  const [persone, setPersone] = useState(2);
  const [nottiMax, setNottiMax] = useState(2);
  const [tipi, setTipi] = useState<Tipo[]>([]);

  const [esito, invia, inCorso] = useActionState(creaRicerca, {} as EsitoApp);

  if (!aperto) {
    return (
      <Button variant="contorno" size="lg" onClick={() => setAperto(true)} className="self-start">
        <Plus className="size-4" aria-hidden="true" />
        Aggiungi una ricerca
      </Button>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-bordo bg-nebbia-2/50 px-6 py-4">
        <h2 className="font-display text-lg tracking-[-0.03em]">Cosa devo cercarti</h2>
        <p className="mt-1 text-sm text-fumo">
          Quando esiste una fuga che sta dentro questi limiti, ti scrivo. Una destinazione, un credito.
        </p>
      </div>

      <form action={invia} className="flex flex-col gap-7 p-6">
        {/* --- budget --- */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="budget">Quanto vuoi spendere, a testa, tutto compreso</Label>
            <span className="font-display text-2xl tracking-[-0.03em] text-verde">{budget}€</span>
          </div>
          <input
            id="budget"
            name="budget"
            type="range"
            min={30}
            max={600}
            step={5}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-pillola bg-bordo accent-verde"
          />
          <p className="text-xs text-fumo-2">
            Alloggio più benzina più pedaggi. Il totale vero, non il prezzo della camera.
          </p>
        </div>

        {/* --- ore --- */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="ore">Quanto sei disposto a guidare, sola andata</Label>
            <span className="font-display text-2xl tracking-[-0.03em] text-verde">
              {oreLeggibili(ore)}
            </span>
          </div>
          <input
            id="ore"
            name="ore"
            type="range"
            min={0.5}
            max={8}
            step={0.5}
            value={ore}
            onChange={(e) => setOre(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-pillola bg-bordo accent-verde"
          />
        </div>

        {/* --- contatori --- */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Contatore
            etichetta="In quanti partite"
            nome="persone"
            valore={persone}
            imposta={setPersone}
            min={1}
            max={8}
            nota="L'auto si divide: più siete, meno costa a testa."
          />
          <Contatore
            etichetta="Quante notti al massimo"
            nome="notti_max"
            valore={nottiMax}
            imposta={setNottiMax}
            min={1}
            max={3}
            nota="Micro-vacanza: da una a tre notti."
          />
        </div>
        <input type="hidden" name="notti_min" value={1} />

        {/* --- tipo --- */}
        <div className="flex flex-col gap-3">
          <Label>Che voglia hai</Label>
          <div className="flex flex-wrap gap-2">
            {TIPI.map(({ valore, nome, Icona }) => {
              const scelto = tipi.includes(valore);
              return (
                <button
                  key={valore}
                  type="button"
                  aria-pressed={scelto}
                  onClick={() =>
                    setTipi(scelto ? tipi.filter((t) => t !== valore) : [...tipi, valore])
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-pillola border px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    scelto
                      ? "border-verde bg-menta-tenue text-verde-notte"
                      : "border-bordo bg-white text-fumo hover:border-verde/40 hover:text-inchiostro",
                  )}
                >
                  <Icona className="size-4" aria-hidden="true" />
                  {nome}
                </button>
              );
            })}
          </div>
          {tipi.map((t) => (
            <input key={t} type="hidden" name="tipi" value={t} />
          ))}
          <p className="text-xs text-fumo-2">
            Non scegli niente? Ti guardo tutto. Più filtri metti, meno destinazioni riceverai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-bordo pt-5">
          <Button type="submit" size="lg" disabled={inCorso}>
            {inCorso ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Attiva la ricerca
          </Button>
          {!prima && (
            <Button type="button" variant="fantasma" onClick={() => setAperto(false)}>
              Annulla
            </Button>
          )}
        </div>

        <AnimatePresence>
          {esito.errore && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-600"
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
              className="flex items-center gap-1.5 text-sm text-verde"
            >
              <Check className="size-4" aria-hidden="true" />
              {esito.ok}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </Card>
  );
}

function Contatore({
  etichetta,
  nome,
  valore,
  imposta,
  min,
  max,
  nota,
}: {
  etichetta: string;
  nome: string;
  valore: number;
  imposta: (n: number) => void;
  min: number;
  max: number;
  nota: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* niente htmlFor: il campo vero è nascosto, l'etichetta descrive il
          gruppo di bottoni. Il valore lo leggono i lettori di schermo dai
          due bottoni, che hanno già aria-label. */}
      <Label asChild>
        <span>{etichetta}</span>
      </Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => imposta(Math.max(min, valore - 1))}
          disabled={valore <= min}
          aria-label={`Diminuisci ${etichetta.toLowerCase()}`}
          className="grid size-10 place-items-center rounded-full border border-bordo bg-white text-lg transition-colors hover:border-verde/40 disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-10 text-center font-display text-2xl tracking-[-0.03em]">
          {valore}
        </span>
        <button
          type="button"
          onClick={() => imposta(Math.min(max, valore + 1))}
          disabled={valore >= max}
          aria-label={`Aumenta ${etichetta.toLowerCase()}`}
          className="grid size-10 place-items-center rounded-full border border-bordo bg-white text-lg transition-colors hover:border-verde/40 disabled:opacity-40"
        >
          +
        </button>
      </div>
      <input type="hidden" name={nome} value={valore} />
      <p className="text-xs text-fumo-2">{nota}</p>
    </div>
  );
}
