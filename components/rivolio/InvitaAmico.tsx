"use client";

import { useState } from "react";
import { COPY } from "@/lib/copy";

/**
 * INVITA UN AMICO dal momento d'oro (TIENITELI, il passaparola).
 *
 * Puro passaparola: nessun premio, nessun codice (scelta di Valerio,
 * 19/08). Su un prodotto una-tantum il motore della crescita non è il
 * riacquisto, è questo. Il link porta l'etichetta `utm_source=invito`,
 * così gli amici che arrivano si contano nel registro (giro #83) senza
 * costruire un sistema di codici referral.
 *
 * La condivisione è la stessa del verdetto (CardCondivisione):
 * `navigator.share` dove c'è, appunti come ripiego. Mai un tocco senza
 * risposta.
 */
export default function InvitaAmico() {
  const t = COPY.invitaAmico;
  const [esito, setEsito] = useState<"fermo" | "copiato" | "errore">("fermo");

  async function invita() {
    // La home, col tag che fa contare l'arrivo come "amico invitato".
    const link = `${window.location.origin}/?utm_source=invito`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: t.messaggio, url: link });
      } catch {
        // condivisione annullata dall'utente: nessun errore da mostrare
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${t.messaggio} ${link}`);
      setEsito("copiato");
    } catch {
      setEsito("errore");
    }
    setTimeout(() => setEsito("fermo"), 3200);
  }

  return (
    <section className="rounded-2xl border border-bordo bg-white px-6 py-5">
      <h3 className="font-display text-[19px] font-medium leading-tight tracking-[-0.02em] text-inchiostro">
        {t.titolo}
      </h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-fumo">{t.testo}</p>

      <div className="mt-4 flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={invita}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-bottone border border-verde/40 bg-white px-6 text-[15px] font-semibold text-verde-scuro transition-all duration-300 hover:-translate-y-0.5 hover:border-verde hover:bg-menta-tenue/50 active:scale-[0.99]"
        >
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
        </button>
        {/* aria-live: chi usa lo screen reader sente l'esito della copia */}
        <p aria-live="polite" className="min-h-5 text-sm text-fumo">
          {esito === "copiato" && t.copiato}
          {esito === "errore" && t.nonRiuscita}
        </p>
      </div>
    </section>
  );
}
