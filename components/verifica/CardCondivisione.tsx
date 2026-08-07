"use client";

import { useState } from "react";
import { Marchio } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";

/**
 * La card grafica del risultato idoneo: il canale virale (SPEC §8,
 * animazione 5: "screenshot loop"). Composizione solo CSS col design
 * system: verde notte come le sezioni scure, la cifra in menta con la
 * luce, il marchio in alto. Niente canvas, niente immagini generate:
 * quello che si condivide è il TESTO (navigator.share o appunti), la
 * card è la cosa bella da screenshottare.
 *
 * Onestà: se il dato è demo, il badge sta DENTRO la card, così viaggia
 * anche nello screenshot.
 */
export default function CardCondivisione({
  volo,
  ritardo,
  importo,
  demo,
}: {
  volo: string;
  /** Già in forma umana: "3h47". */
  ritardo: string;
  importo: number;
  demo: boolean;
}) {
  const t = COPY.condivisione;
  const [esito, setEsito] = useState<"fermo" | "copiato" | "errore">("fermo");

  const riempi = (modello: string) =>
    modello
      .replace("{volo}", volo)
      .replace("{ritardo}", ritardo)
      .replace("{importo}", `${importo}€`);

  async function condividi() {
    const testo = riempi(t.testoTemplate);
    // Il link è la home: chi riceve deve controllare il SUO volo,
    // non guardare il risultato di un altro.
    const link = window.location.origin;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: testo, url: link });
      } catch {
        // condivisione annullata dall'utente: nessun errore da mostrare
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${testo} ${link}`);
      setEsito("copiato");
    } catch {
      setEsito("errore");
    }
    setTimeout(() => setEsito("fermo"), 3200);
  }

  return (
    <section>
      <h2 className="font-display text-xl tracking-[-0.03em]">{t.titolo}</h2>
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-fumo">{t.didascalia}</p>

      {/* ------------------------------------------------ la card */}
      <div className="relative mt-4 overflow-hidden rounded-[1.5rem] bg-verde-notte px-7 py-7 text-white">
        {/* la stessa luce delle sezioni scure della landing */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-menta/15 blur-3xl"
        />
        <div className="relative flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Marchio className="h-7 w-7 shrink-0" />
            <span className="font-display text-[15px] font-medium tracking-[-0.03em]">
              {COPY.comune.marchio}
            </span>
          </span>
          {demo && (
            <span className="inline-flex items-center gap-1.5 rounded-pillola bg-sole/25 px-2.5 py-1 text-[11px] font-medium text-sole">
              <span className="h-1 w-1 shrink-0 rounded-full bg-sole" aria-hidden="true" />
              {COPY.comune.demo}
            </span>
          )}
        </div>

        <p className="luce-testo-chiaro numeri relative mt-6 font-display text-[clamp(2.4rem,9vw,3.4rem)] font-medium leading-none tracking-[-0.04em] text-menta">
          {riempi(t.card.titoloTemplate)}
        </p>
        <p className="relative mt-2.5 text-[0.95rem] leading-relaxed text-white/75">
          {riempi(t.card.sottotitoloTemplate)}
        </p>

        <p className="relative mt-6 border-t border-white/15 pt-4 text-sm font-medium text-menta">
          {t.card.piede}
        </p>
      </div>

      {/* ------------------------------------------- il bottone */}
      <div className="mt-4 flex flex-col items-start gap-2">
        <Button type="button" variant="vetro" size="lg" onClick={condividi}>
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
            <path
              d="M12 3v12m0-12L7.5 7.5M12 3l4.5 4.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.bottone}
        </Button>
        {/* aria-live: chi usa lo screen reader sente l'esito della copia */}
        <p aria-live="polite" className="min-h-5 text-sm text-fumo">
          {esito === "copiato" && t.copiato}
          {esito === "errore" && t.nonRiuscita}
        </p>
      </div>
    </section>
  );
}
