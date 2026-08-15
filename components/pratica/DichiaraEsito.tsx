"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * COM'È FINITA CON LA COMPAGNIA (Valerio, 15/08).
 *
 * Il traguardo che mancava: dopo aver mandato il reclamo, l'utente non
 * aveva nessun modo per dire «mi hanno pagato» e chiudere la pratica. Solo
 * lui sa se i soldi sono arrivati sul suo conto (la compagnia paga lui,
 * non noi), quindi è lui a dichiararlo.
 *
 * «Mi hanno pagato» chiude la pratica come vinta (ed entra in classifica,
 * se ha scelto un nome pubblico). «Non hanno pagato» apre la garanzia: gli
 * rimborsiamo i 14,90. La seconda chiede una conferma in più, perché
 * chiude comunque la pratica.
 */
export default function DichiaraEsito({ praticaId }: { praticaId: string }) {
  const router = useRouter();
  // La FASE decide quale schermata mostrare; `inCorso` se una richiesta è
  // in volo. Tenerle separate evita che l'invio faccia sparire la conferma.
  const [fase, setFase] = useState<"scelta" | "conferma_no">("scelta");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function dichiara(esito: "pagata" | "non_pagata") {
    if (inCorso) return;
    setInCorso(true);
    setErrore(null);
    try {
      const r = await fetch(`/api/pratiche/${praticaId}/esito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ esito }),
      });
      const corpo = (await r.json().catch(() => null)) as { errore?: string } | null;
      if (!r.ok) throw new Error(corpo?.errore ?? "Non sono riuscito a salvare. Riprova.");
      // Lo stato nuovo lo scrive il server: si ricarica invece di indovinarlo.
      router.refresh();
    } catch (e) {
      setInCorso(false);
      setErrore(e instanceof Error ? e.message : "Non sono riuscito a salvare. Riprova.");
    }
  }

  return (
    <section className="rounded-2xl border border-verde/30 bg-menta-tenue px-6 py-5">
      <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em] text-verde-notte">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        La compagnia ti ha pagato?
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-verde-notte/80">
        Il bonifico arriva sul tuo conto, non da noi: quando lo vedi, dimmelo qui e chiudiamo la
        pratica. Se invece non paga o rifiuta, entra la garanzia e ti rimborsiamo i 14,90.
      </p>

      {fase === "scelta" ? (
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={inCorso}
            onClick={() => void dichiara("pagata")}
          >
            {inCorso ? "Un attimo…" : "Sì, mi hanno pagato"}
          </Button>
          <Button
            type="button"
            variant="contorno"
            size="lg"
            className="flex-1"
            disabled={inCorso}
            onClick={() => {
              setErrore(null);
              setFase("conferma_no");
            }}
          >
            No, non hanno pagato
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5">
          <p className="text-[0.95rem] leading-relaxed text-inchiostro">
            Chiudo la pratica e faccio partire la garanzia: ti rimborsiamo i 14,90 che hai pagato.
            Confermi?
          </p>
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="button"
              variant="scuro"
              className="flex-1"
              disabled={inCorso}
              onClick={() => void dichiara("non_pagata")}
            >
              {inCorso ? "Un attimo…" : "Sì, chiudi e rimborsa"}
            </Button>
            <Button
              type="button"
              variant="contorno"
              className="flex-1"
              disabled={inCorso}
              onClick={() => setFase("scelta")}
            >
              Aspetta, torno indietro
            </Button>
          </div>
        </div>
      )}

      {errore && (
        <p role="alert" className="mt-3 rounded-xl bg-sole/15 px-3.5 py-2.5 text-sm leading-relaxed">
          {errore}
        </p>
      )}
    </section>
  );
}
