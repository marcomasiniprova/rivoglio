"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Car, Clock, Pause, Play, Trash2, Users, Wallet } from "lucide-react";
import { cambiaStato, eliminaRicerca } from "@/app/app/azioni";
import type { Esito } from "@/lib/costruttore";
import type { Tipo } from "@/lib/destinazioni";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const NOME_TIPO: Record<Tipo, string> = {
  mare: "Mare",
  monte: "Montagna",
  citta: "Città",
  terme: "Terme",
};

type Ricerca = {
  id: string;
  budget_max_persona: number;
  ore_viaggio_max: number;
  notti_min: number;
  notti_max: number;
  persone: number;
  tipi: Tipo[];
  attiva: boolean;
};

function oreLeggibili(ore: number) {
  const h = Math.floor(ore);
  const m = Math.round((ore - h) * 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export default function SchedaRicerca({
  ricerca,
  anteprima,
}: {
  ricerca: Ricerca;
  anteprima?: Esito;
}) {
  const [inCorso, avvia] = useTransition();
  const [confermaCancella, setConfermaCancella] = useState(false);

  const tipi = ricerca.tipi?.length
    ? ricerca.tipi.map((t) => NOME_TIPO[t]).join(" · ")
    : "Tutto";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className={cn("overflow-hidden", !ricerca.attiva && "opacity-60")}>
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  ricerca.attiva ? "bg-verde" : "bg-fumo-2",
                )}
                aria-hidden="true"
              />
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-fumo">
                {ricerca.attiva ? "In ascolto" : "In pausa"}
              </span>
            </div>

            <p className="mt-3 font-display text-2xl tracking-[-0.03em]">
              Fino a {Number(ricerca.budget_max_persona)}€ a testa
            </p>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fumo">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Viaggio massimo</dt>
                <dd>max {oreLeggibili(Number(ricerca.ore_viaggio_max))} di auto</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-4 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Persone</dt>
                <dd>
                  {ricerca.persone} {ricerca.persone === 1 ? "persona" : "persone"}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="size-4 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Notti</dt>
                <dd>
                  {ricerca.notti_min === ricerca.notti_max
                    ? `${ricerca.notti_max} ${ricerca.notti_max === 1 ? "notte" : "notti"}`
                    : `${ricerca.notti_min}-${ricerca.notti_max} notti`}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <Car className="size-4 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Tipo</dt>
                <dd>{tipi}</dd>
              </div>
            </dl>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="fantasma"
              size="icona"
              disabled={inCorso}
              title={ricerca.attiva ? "Metti in pausa" : "Riaccendi"}
              onClick={() => avvia(() => void cambiaStato(ricerca.id, !ricerca.attiva))}
            >
              {ricerca.attiva ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              <span className="sr-only">{ricerca.attiva ? "Metti in pausa" : "Riaccendi"}</span>
            </Button>

            <Button
              variant="fantasma"
              size="icona"
              disabled={inCorso}
              title="Cancella"
              onClick={() => {
                if (!confermaCancella) {
                  setConfermaCancella(true);
                  setTimeout(() => setConfermaCancella(false), 4000);
                  return;
                }
                avvia(() => void eliminaRicerca(ricerca.id));
              }}
              className={cn(confermaCancella && "bg-red-50 text-red-600")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="sr-only">Cancella</span>
            </Button>
          </div>
        </div>

        {confermaCancella && (
          <p role="status" className="border-t border-bordo bg-red-50 px-6 py-2.5 text-sm text-red-700">
            Premi di nuovo il cestino per cancellarla davvero.
          </p>
        )}

        {/* ---------- l'anteprima ----------
            Non è un alert e non consuma crediti. Dice dove arrivi ADESSO con
            questo budget, una volta pagata l'auto. Il prezzo del letto non
            c'è perché non abbiamo ancora un'offerta vera dietro, e un prezzo
            inventato sarebbe esattamente ciò che questo prodotto combatte. */}
        {anteprima && (
          <div className="border-t border-bordo bg-nebbia-2/40 px-6 py-5">
            {anteprima.ok ? (
              <>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-fumo-2">
                  Con questi limiti, oggi ci arrivi
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {anteprima.proposte.map((p) => (
                    <li
                      key={p.destinazione.nome}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl bg-white px-4 py-3"
                    >
                      <span className="font-medium">
                        {p.destinazione.nome}
                        <span className="ml-2 text-sm font-normal text-fumo-2">
                          {p.destinazione.regione}
                        </span>
                      </span>
                      <span className="text-sm text-fumo">
                        {p.ore} · auto {Math.round(p.conto.aPersona)}€ ·{" "}
                        <span className="font-medium text-verde">
                          restano {Math.round(p.restaPerDormire)}€ per dormire
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-fumo-2">
                  Stima del viaggio, non un&apos;offerta. L&apos;alert arriva quando esiste una
                  struttura vera che ci sta dentro.
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-fumo">{anteprima.motivo}</p>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
