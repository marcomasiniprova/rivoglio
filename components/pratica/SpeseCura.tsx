"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Utensils } from "lucide-react";

/**
 * DIRITTO DI CURA (art. 9): "Hai pagato pasti o hotel di tasca tua?"
 *
 * Si aggancia alla pratica che il cliente ha già (scelta di Valerio,
 * 14/08): niente secondo pagamento, niente pratica a sé. Se dice di sì, la
 * lettera del reclamo guadagna il paragrafo dell'art. 9 e lui allega gli
 * scontrini. L'importo non lo tocchiamo: lo portano le sue ricevute.
 *
 * Il testo della lettera cambia SUL SERVER, quindi dopo il salvataggio si
 * ricarica: da qui non si può indovinare come verrà scritta.
 */
export default function SpeseCura({
  praticaId,
  iniziale,
}: {
  praticaId: string;
  iniziale: boolean;
}) {
  const router = useRouter();
  const [vuole, setVuole] = useState(iniziale);
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState("");

  async function cambia(nuovo: boolean) {
    if (invio) return;
    setInvio(true);
    setErrore("");
    try {
      const r = await fetch(`/api/pratiche/${praticaId}/cura`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vuole: nuovo }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        setErrore(typeof d?.errore === "string" ? d.errore : "Non ha funzionato.");
        return;
      }
      setVuole(nuovo);
      /* Il paragrafo dell'art. 9 lo scrive il server dentro la lettera:
         aggiornamento morbido, così la pagina della pratica non sbianca e
         non salta in cima (era `window.location.reload()`). */
      router.refresh();
    } catch {
      setErrore("Non ha funzionato. Riprova tra poco.");
    } finally {
      setInvio(false);
    }
  }

  return (
    <section className="rounded-2xl border border-bordo bg-white px-6 py-5">
      <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
        <Utensils className="size-4 shrink-0 text-verde" aria-hidden="true" />
        Hai pagato pasti o hotel di tasca tua?
      </h2>
      <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
        Dalle due ore di ritardo la compagnia doveva offrirti da mangiare, e un hotel se hai dormito
        fuori. Se hai pagato tu, ti spetta il rimborso (articolo 9): lo aggiungo al tuo reclamo,
        senza costarti niente in più. Gli scontrini li alleghi tu quando mandi il reclamo.
      </p>

      {vuole ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="flex items-center gap-2 text-[0.95rem] font-medium text-verde-scuro">
            <Check className="size-4 shrink-0" aria-hidden="true" />
            Le tue spese sono nel reclamo. Ricordati di allegare gli scontrini.
          </p>
          <button
            type="button"
            onClick={() => void cambia(false)}
            disabled={invio}
            className="text-sm text-fumo underline decoration-bordo underline-offset-4 transition-colors hover:text-inchiostro disabled:opacity-50"
          >
            Toglile
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void cambia(true)}
          disabled={invio}
          className="riflesso mt-4 h-11 rounded-bottone bg-verde px-5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-50"
        >
          {invio ? "Un attimo." : "Sì, aggiungi le mie spese"}
        </button>
      )}

      {errore && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {errore}
        </p>
      )}
    </section>
  );
}
