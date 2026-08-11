"use client";

import { Check, Lock } from "lucide-react";
import { Anima } from "@/components/Anima";
import { Button } from "@/components/ui/button";

/**
 * IL MURO DEL CHECK.
 *
 * Compare quando il server risponde 402: l'analisi si sblocca pagando.
 *
 * Cosa si legge PER PRIMO, e non è un dettaglio (scelta di Valerio,
 * 11/08): **quanto vale un volo come il suo**. Il prezzo si legge
 * accanto a quella cifra, non da solo: 1,99 contro 600 è un confronto
 * che si fa in un secondo, 1,99 da solo è solo un costo. E i 600 non
 * sono un numero da pubblicità: sono la fascia massima dell'articolo 7
 * del Regolamento, la stessa che il motore userebbe su quel volo.
 *
 * Le tre cose che tengono il muro onesto:
 * - **non si promette un esito.** "I voli come il tuo valgono fino a" non
 *   è "ti spettano": il verdetto lo dà il motore dopo, e può essere no.
 * - **il prezzo che sale è un impegno, non un finto sconto.** Si scrive
 *   "adesso 1,99, poi 4,99" perché è una promessa sul futuro; il finto
 *   ribasso dal passato in Italia è vietato (direttiva Omnibus).
 * - **i posti rimasti si mostrano solo se sono contati.** Se il numero
 *   non si legge, la riga sparisce invece di inventarsi una scarsità.
 */

export type DatiMuro = {
  /** Dove si va a pagare. null = la cassa non c'è ancora. */
  cassa?: string | null;
  prezzoTesto: string;
  prezzoPienoTesto: string;
  inLancio: boolean;
  /** null quando non si è potuto contare: allora non si scrive. */
  postiRimasti: number | null;
};

/** La fascia più alta del Regolamento: il confronto che fa decidere. */
const FASCIA_MASSIMA = 600;

export default function MuroCheck({
  dati,
  onPaga,
  inCorso = false,
}: {
  dati: DatiMuro;
  onPaga: () => void;
  inCorso?: boolean;
}) {
  const { prezzoTesto, prezzoPienoTesto, inLancio, postiRimasti } = dati;

  return (
    <Anima className="rounded-3xl border border-bordo bg-white p-6 shadow-[0_18px_50px_-30px_rgba(5,46,31,.35)] sm:p-8">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-verde">
        L&apos;analisi del tuo volo
      </p>

      {/* La cifra grande è quella che vale il volo, non il prezzo. */}
      <p className="mt-3 font-display text-[clamp(2.2rem,7vw,3.2rem)] leading-[1] tracking-[-0.03em]">
        Voli come il tuo valgono
        <br />
        fino a <span className="text-verde">{FASCIA_MASSIMA}€</span>
      </p>
      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-fumo">
        Quanto spetta a te lo dice il ritardo certificato del tuo volo, e può
        anche essere zero. L&apos;analisi lo verifica sugli archivi ufficiali e
        ti dà il numero esatto.
      </p>

      {/* Il prezzo, letto subito dopo la cifra: è lì che si decide. */}
      <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-bordo pt-6">
        <span className="font-display text-[2.4rem] leading-none tracking-[-0.03em]">
          {prezzoTesto}
        </span>
        <span className="text-[0.95rem] text-fumo">
          una volta, per questo volo
        </span>
      </div>

      {inLancio && (
        <p className="mt-2 text-[13.5px] leading-relaxed text-fumo">
          Prezzo di lancio.{" "}
          {postiRimasti !== null ? (
            <>
              Ne restano{" "}
              <span className="font-medium text-inchiostro">
                {postiRimasti}
              </span>{" "}
              a questa cifra, poi passa a {prezzoPienoTesto}.
            </>
          ) : (
            <>Quando i posti di lancio finiscono passa a {prezzoPienoTesto}.</>
          )}
        </p>
      )}

      <ul className="mt-6 space-y-2.5">
        {[
          "Gli orari certificati di partenza e atterraggio, al minuto",
          "La prova archiviata, se un giorno la compagnia contesta",
          "Gli avvisi sul volo e la scadenza calcolata sul tuo caso",
          "Se apri la pratica, questi euro si scalano dal prezzo",
        ].map((v) => (
          <li
            key={v}
            className="flex gap-2.5 text-[14.5px] leading-relaxed text-fumo"
          >
            <Check
              className="mt-0.5 size-4 shrink-0 text-verde"
              aria-hidden="true"
            />
            {v}
          </li>
        ))}
      </ul>

      <Button
        onClick={onPaga}
        disabled={inCorso}
        className="mt-7 h-12 w-full rounded-bottone text-[15px] sm:h-13"
      >
        <Lock className="size-4" aria-hidden="true" />
        {inCorso ? "Un attimo." : `Sblocca l'analisi · ${prezzoTesto}`}
      </Button>

      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-fumo-2">
        Se il verdetto esce incerto non ti costa niente: il credito resta e lo
        usi su un altro volo.
      </p>
    </Anima>
  );
}
