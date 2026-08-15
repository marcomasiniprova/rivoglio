"use client";

import { useState } from "react";
import { Check, Lock, Ticket } from "lucide-react";
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
 * - **non si promette un esito.** ⚠️ E qui c'era scritto "Voli come il
 *   tuo VALGONO fino a 600€", che Valerio ha letto il 12/08 e ha
 *   bocciato: «stiamo truffando la gente, di' POSSONO valere». Aveva
 *   ragione. "Valgono" è un fatto dichiarato su quel volo lì; ma quel
 *   volo può benissimo valere zero, e lo sappiamo solo dopo l'analisi.
 *   L'indicativo prometteva un esito prima di averlo verificato, che è
 *   esattamente la cosa che questo prodotto dice di non fare.
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
  onRiscatta,
  erroreRiscatto = null,
  inCorso = false,
}: {
  dati: DatiMuro;
  onPaga: () => void;
  /** Riscatta il codice dell'analisi gratis (da recensione). */
  onRiscatta?: (codice: string) => void;
  /** Avviso dal server quando il codice riscattato non vale (finto/speso). */
  erroreRiscatto?: string | null;
  inCorso?: boolean;
}) {
  const { prezzoTesto, prezzoPienoTesto, inLancio } = dati;

  /* Il codice dell'analisi gratis: chi ha lasciato una recensione ne ha
     uno. Il campo sta chiuso di default (la maggior parte non ce l'ha) e si
     apre con un clic. La forma la controlliamo qui per dare un errore
     subito; se il codice è finto o già speso, lo dice il server. */
  /* Se il server ha appena bocciato un codice, il campo nasce già aperto
     con l'avviso: la persona ha appena provato, non deve ri-cercare dov'era. */
  const [apri, setApri] = useState(Boolean(erroreRiscatto));
  const [codice, setCodice] = useState("");
  const [erroreCodice, setErroreCodice] = useState("");

  function usaCodice() {
    const pulito = codice.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^RIV-[A-Z0-9]{5}$/.test(pulito)) {
      setErroreCodice("Il codice ha la forma RIV-XXXXX, come quello della recensione.");
      return;
    }
    setErroreCodice("");
    onRiscatta?.(pulito);
  }

  return (
    <Anima className="rounded-3xl border border-bordo bg-white p-6 shadow-[0_18px_50px_-30px_rgba(5,46,31,.35)] sm:p-8">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-verde">
        L&apos;analisi del tuo volo
      </p>

      {/* La cifra grande è quella che vale il volo, non il prezzo. */}
      <p className="mt-3 font-display text-[clamp(2.2rem,7vw,3.2rem)] leading-[1] tracking-[-0.03em]">
        Voli come il tuo possono
        <br />
        valere fino a <span className="text-verde">{FASCIA_MASSIMA}€</span>
      </p>
      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-fumo">
        Quanto spetta a te lo dice il ritardo certificato del tuo volo, e può
        anche essere zero. L&apos;analisi lo verifica sugli archivi ufficiali e
        ti dà il numero esatto.
      </p>

      {/* Il prezzo, letto subito dopo la cifra: è lì che si decide.
          ⚠️ DUE PREZZI AFFIANCATI, IL PIENO **NON BARRATO** (scelta di
          Valerio col popup, 12/08). Lui l'aveva chiesto barrato, come al
          supermercato; barrare 4,99 però significa dichiarare uno sconto
          da un prezzo che non abbiamo mai praticato, e l'art. 17-bis del
          Codice del Consumo (direttiva Omnibus) pretende che il prezzo
          barrato sia stato applicato davvero per almeno 30 giorni.
          Il colpo d'occhio è lo stesso: la cifra bassa è enorme e verde,
          quella piena sta accanto piccola e grigia. Quello che cambia è
          la frase, e dice la verità: non è sceso, deve salire. */}
      <div className="mt-7 border-t border-bordo pt-6">
        {inLancio && (
          <p className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-menta-tenue px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-verde-scuro">
            <span className="size-1.5 rounded-full bg-verde" aria-hidden="true" />
            Prezzo di lancio
          </p>
        )}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-[clamp(2.6rem,10vw,3.4rem)] leading-none tracking-[-0.03em] text-verde-scuro">
            {prezzoTesto}
          </span>
          {inLancio && (
            <span className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-fumo-2">
              {prezzoPienoTesto}
            </span>
          )}
          <span className="w-full text-[0.95rem] text-fumo sm:w-auto">
            una volta, per questo volo
          </span>
        </div>
      </div>

      {/* ⚠️ IL CONTATORE DEI POSTI RIMASTI È STATO TOLTO (Valerio,
          12/08: «quando dici 1,99 e mancano 500, togli quella roba»).
          Non è stato spostato altrove: "ne restano 487" è il tipo di
          scarsità che ogni sito mette e nessuno crede più, e su una
          pagina che vende trasparenza suona peggio che altrove. Resta il
          fatto, che è vero e verificabile: questo prezzo deve salire.
          ⚠️ `postiRimasti` continua ad arrivare nei dati dal server e
          adesso non lo guarda più nessuno. Resta nel tipo perché
          toglierlo vorrebbe dire toccare il calcolo, la rotta e l'app,
          cioè un refactoring che nessuno ha chiesto. */}
      {inLancio && (
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-fumo">
          Poi passa a{" "}
          <span className="font-medium text-inchiostro">{prezzoPienoTesto}</span>.
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

      {/* IL CODICE DELL'ANALISI GRATIS. Chi ha lasciato una recensione ne
          ha uno (RIV-XXXXX): lo incolla qui e sblocca UNA analisi, senza
          pagare. Sta chiuso di default: la maggior parte non ce l'ha. */}
      {onRiscatta && (
        <div className="mt-5 border-t border-bordo pt-4">
          {!apri ? (
            <button
              type="button"
              onClick={() => setApri(true)}
              className="flex items-center gap-2 text-[13.5px] font-medium text-verde-scuro underline decoration-bordo underline-offset-4 hover:text-verde"
            >
              <Ticket className="size-4" aria-hidden="true" />
              Hai un codice della recensione?
            </button>
          ) : (
            <div>
              <label htmlFor="codice-buono" className="text-[13px] font-medium text-inchiostro/70">
                Il codice della recensione
              </label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <input
                  id="codice-buono"
                  type="text"
                  value={codice}
                  onChange={(e) => setCodice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") usaCodice();
                  }}
                  placeholder="RIV-XXXXX"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 flex-1 rounded-bottone border border-bordo bg-white px-4 text-[16px] uppercase tracking-wide text-inchiostro outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-fumo-2 focus:border-verde/60 focus:ring-4 focus:ring-verde/12"
                />
                <Button
                  type="button"
                  onClick={usaCodice}
                  disabled={inCorso}
                  className="h-12 rounded-bottone px-6 text-[15px]"
                >
                  Usa il codice
                </Button>
              </div>
              {(erroreRiscatto || erroreCodice) && (
                <p role="alert" className="mt-2 text-[13px] text-amber-700">
                  {erroreRiscatto || erroreCodice}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Anima>
  );
}
