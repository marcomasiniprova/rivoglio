"use client";

import { useActionState, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  Check,
  Droplets,
  Loader2,
  MapPin,
  Mountain,
  Send,
  Waves,
} from "lucide-react";
import { concludi, type EsitoBenvenuto } from "@/app/benvenuto/azioni";
import { costruisci } from "@/lib/costruttore";
import type { Tipo } from "@/lib/destinazioni";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * L'onboarding: una domanda per schermata.
 *
 * Perché non un modulo unico con otto campi: un modulo lungo si guarda e si
 * chiude. Una domanda alla volta si risponde. È la differenza fra chiedere
 * "compila il tuo profilo" e chiedere "da dove parti?".
 *
 * L'ultimo passo NON chiede niente: mostra cosa troverebbe adesso con le
 * risposte date. È il momento in cui l'utente capisce cosa ha comprato,
 * e lo calcola il motore vero, non un'animazione finta.
 */

const TIPI: { valore: Tipo; nome: string; Icona: typeof Waves }[] = [
  { valore: "mare", nome: "Mare", Icona: Waves },
  { valore: "monte", nome: "Montagna", Icona: Mountain },
  { valore: "citta", nome: "Città d'arte", Icona: Building2 },
  { valore: "terme", nome: "Terme", Icona: Droplets },
];

const BENZINA = 1.994;

function oreLeggibili(ore: number) {
  const h = Math.floor(ore);
  const m = Math.round((ore - h) * 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export default function Onboarding({ citta }: { citta: string[] }) {
  const [passo, setPasso] = useState(0);
  const [comune, setComune] = useState("");
  const [persone, setPersone] = useState(2);
  const [nottiMax, setNottiMax] = useState(2);
  const [budget, setBudget] = useState(120);
  const [ore, setOre] = useState(2.5);
  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [telegram, setTelegram] = useState("");

  const [esito, invia, inCorso] = useActionState(concludi, {} as EsitoBenvenuto);

  /* L'anteprima dell'ultimo passo. Calcolata nel browser con lo stesso
     motore del server: è codice puro, non ha bisogno di rete. */
  const anteprima = useMemo(() => {
    if (!comune) return null;
    return costruisci({
      partenza: comune,
      budgetPersona: budget,
      notti: nottiMax,
      persone,
      tipi,
      oreMax: ore,
      prezzoBenzina: BENZINA,
    });
  }, [comune, budget, nottiMax, persone, tipi, ore]);

  const passi = [
    {
      titolo: "Da dove parti?",
      sotto: "Serve a calcolare chilometri, benzina e pedaggi. Non la diamo a nessuno.",
      avanti: Boolean(comune),
      contenuto: (
        <div className="flex flex-col gap-2">
          <Label htmlFor="comune">La tua città</Label>
          <select
            id="comune"
            value={comune}
            onChange={(e) => setComune(e.target.value)}
            className="h-14 w-full appearance-none rounded-bottone border border-bordo bg-white px-4 text-[17px] transition-all focus:border-verde/50 focus:outline-none focus:ring-4 focus:ring-verde/10"
          >
            <option value="" disabled>
              Scegli
            </option>
            {citta.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      titolo: "In quanti partite?",
      sotto: "L'auto si divide: più siete, meno costa a testa. È il pezzo che nessuno calcola.",
      avanti: true,
      contenuto: (
        <div className="grid gap-8 sm:grid-cols-2">
          <Contatore etichetta="Persone" valore={persone} imposta={setPersone} min={1} max={8} />
          <Contatore etichetta="Notti al massimo" valore={nottiMax} imposta={setNottiMax} min={1} max={3} />
        </div>
      ),
    },
    {
      titolo: "Quanto vuoi spendere?",
      sotto: "A testa, tutto compreso: alloggio più benzina più pedaggi. Non il prezzo della camera.",
      avanti: true,
      contenuto: (
        <div className="flex flex-col gap-4">
          <p className="numeri font-display text-[3.6rem] leading-none tracking-[-0.045em] text-verde">
            {budget}€
          </p>
          <input
            type="range"
            min={30}
            max={600}
            step={5}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Budget a persona"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-pillola bg-bordo accent-verde"
          />
          <div className="flex justify-between text-xs text-fumo-2">
            <span>30€</span>
            <span>600€</span>
          </div>
        </div>
      ),
    },
    {
      titolo: "Quanto sei disposto a guidare?",
      sotto: "Sola andata. Ragioniamo in ore, non in chilometri: è così che decide la gente.",
      avanti: true,
      contenuto: (
        <div className="flex flex-col gap-4">
          <p className="numeri font-display text-[3.6rem] leading-none tracking-[-0.045em] text-verde">
            {oreLeggibili(ore)}
          </p>
          <input
            type="range"
            min={0.5}
            max={8}
            step={0.5}
            value={ore}
            onChange={(e) => setOre(Number(e.target.value))}
            aria-label="Ore di viaggio massime"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-pillola bg-bordo accent-verde"
          />
          <div className="flex justify-between text-xs text-fumo-2">
            <span>30 minuti</span>
            <span>8 ore</span>
          </div>
        </div>
      ),
    },
    {
      titolo: "Che voglia hai?",
      sotto: "Puoi sceglierne più di una, o nessuna. Più filtri metti, meno destinazioni riceverai.",
      avanti: true,
      contenuto: (
        <div className="grid grid-cols-2 gap-3">
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
                  "flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200",
                  scelto
                    ? "border-verde bg-menta-tenue text-verde-notte shadow-[0_10px_24px_-14px_rgba(10,157,92,.6)]"
                    : "border-bordo bg-white text-fumo hover:border-verde/40 hover:text-inchiostro",
                )}
              >
                <Icona className={cn("size-6", scelto ? "text-verde" : "text-fumo-2")} aria-hidden="true" />
                <span className="font-medium">{nome}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      titolo: "Dove ti avviso?",
      sotto:
        "L'email ce l'hai già. Telegram è meglio: arriva col suono anche su iPhone, e non finisce nello spam.",
      avanti: true,
      contenuto: (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-2xl bg-menta-tenue p-4">
            <Check className="mt-0.5 size-4 shrink-0 text-verde" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-verde-notte">
              Email: attiva. Ti scrivo lì di sicuro.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="telegram">
              Telegram <span className="font-normal text-fumo-2">(puoi metterlo dopo)</span>
            </Label>
            <Input
              id="telegram"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@iltuonome"
              className="h-14 text-[17px]"
            />
            <p className="text-xs leading-relaxed text-fumo-2">
              Scrivi al bot <span className="font-medium text-fumo">@rivoglio_bot</span> e
              lui ti dà il codice da incollare qui. Se salti questo passo ricevi tutto per email.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const ultimo = passo === passi.length;
  const totale = passi.length + 1;
  const attuale = passi[passo];

  return (
    <div className="flex flex-1 flex-col px-5 py-8 sm:px-8">
      {/* avanzamento */}
      <div className="mx-auto w-full max-w-xl">
        <div className="flex items-center gap-3">
          {passo > 0 && (
            <button
              type="button"
              onClick={() => setPasso(passo - 1)}
              className="grid size-9 place-items-center rounded-full border border-bordo bg-white text-fumo transition-colors hover:text-inchiostro"
              aria-label="Torna indietro"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
          )}
          <div className="h-1.5 flex-1 overflow-hidden rounded-pillola bg-bordo">
            <motion.div
              className="h-full rounded-pillola bg-verde"
              initial={false}
              animate={{ width: `${((passo + 1) / totale) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="numeri text-xs text-fumo-2">
            {passo + 1}/{totale}
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={passo}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            {!ultimo ? (
              <>
                <h1 className="text-[clamp(1.9rem,5.4vw,2.7rem)] leading-[1.05]">
                  {attuale.titolo}
                </h1>
                <p className="mt-4 text-[15.5px] leading-relaxed text-fumo">{attuale.sotto}</p>
                <div className="mt-10">{attuale.contenuto}</div>

                <Button
                  size="lg"
                  className="mt-10 w-full"
                  disabled={!attuale.avanti}
                  onClick={() => setPasso(passo + 1)}
                >
                  {attuale.avanti ? "Avanti" : "Scegli per continuare"}
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-[clamp(1.9rem,5.4vw,2.7rem)] leading-[1.05]">
                  Ecco cosa ti trovo.
                  <br />
                  <span className="corsivo text-verde-scuro">Adesso, non un giorno.</span>
                </h1>
                <p className="mt-4 text-[15.5px] leading-relaxed text-fumo">
                  Con {budget}€ a testa, {oreLeggibili(ore)} di auto da {comune}, in {persone}.
                  Calcolato dal motore vero mentre leggi.
                </p>

                <div className="mt-8 rounded-3xl border border-bordo bg-white p-5 sm:p-6">
                  {anteprima?.ok ? (
                    <ul className="flex flex-col gap-2">
                      {anteprima.proposte.map((p) => (
                        <li
                          key={p.destinazione.nome}
                          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl bg-nebbia px-4 py-3"
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <MapPin className="size-4 shrink-0 text-verde" aria-hidden="true" />
                            {p.destinazione.nome}
                            <span className="text-sm font-normal text-fumo-2">
                              {p.destinazione.regione}
                            </span>
                          </span>
                          <span className="numeri text-sm text-fumo">
                            {p.ore} · auto {Math.round(p.conto.aPersona)}€ ·{" "}
                            <span className="font-medium text-verde">
                              restano {Math.round(p.restaPerDormire)}€
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-relaxed text-fumo">
                      {anteprima?.motivo ?? "Torna indietro e completa le risposte."}
                    </p>
                  )}
                  <p className="mt-4 text-xs leading-relaxed text-fumo-2">
                    Stima del viaggio, non un&apos;offerta. Ti segnalo la destinazione quando esiste una
                    struttura vera che ci sta dentro, e allora ci sarà anche il prezzo del letto.
                  </p>
                </div>

                <form action={invia} className="mt-8">
                  <input type="hidden" name="comune" value={comune} />
                  <input type="hidden" name="budget" value={budget} />
                  <input type="hidden" name="ore" value={ore} />
                  <input type="hidden" name="persone" value={persone} />
                  <input type="hidden" name="notti_max" value={nottiMax} />
                  <input type="hidden" name="telegram" value={telegram} />
                  {tipi.map((t) => (
                    <input key={t} type="hidden" name="tipi" value={t} />
                  ))}

                  <Button type="submit" size="lg" className="w-full" disabled={inCorso}>
                    {inCorso ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Attivo la ricerca
                      </>
                    ) : (
                      <>
                        <Send className="size-4" aria-hidden="true" />
                        Attiva e avvisami
                      </>
                    )}
                  </Button>

                  {esito.errore && (
                    <p role="alert" className="mt-4 text-sm text-red-600">
                      {esito.errore}
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Contatore({
  etichetta,
  valore,
  imposta,
  min,
  max,
}: {
  etichetta: string;
  valore: number;
  imposta: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Label asChild>
        <span>{etichetta}</span>
      </Label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => imposta(Math.max(min, valore - 1))}
          disabled={valore <= min}
          aria-label={`Diminuisci ${etichetta.toLowerCase()}`}
          className="grid size-12 place-items-center rounded-full border border-bordo bg-white text-xl transition-colors hover:border-verde/40 disabled:opacity-40"
        >
          −
        </button>
        <span className="numeri min-w-12 text-center font-display text-[2.6rem] leading-none tracking-[-0.04em]">
          {valore}
        </span>
        <button
          type="button"
          onClick={() => imposta(Math.min(max, valore + 1))}
          disabled={valore >= max}
          aria-label={`Aumenta ${etichetta.toLowerCase()}`}
          className="grid size-12 place-items-center rounded-full border border-bordo bg-white text-xl transition-colors hover:border-verde/40 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
