"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DichiaraRifiuto from "./DichiaraRifiuto";

/**
 * COME È ANDATA CON LA COMPAGNIA — un box solo (Valerio, 15/08).
 *
 * 🔴 Prima erano DUE riquadri per la stessa cosa: «ti ha pagato?» e «ti ha
 * risposto no?». Confondevano. Adesso sono uno: una domanda, due bottoni.
 *  - «Mi hanno pagato» → chiude la pratica come vinta (entra in classifica,
 *    se ha scelto un nome pubblico). Il bonifico arriva sul suo conto, non
 *    da noi, quindi è lui a dirlo.
 *  - «Mi hanno risposto no» → apre, QUI DENTRO, la strada del rifiuto
 *    (carica il loro no, gli preparo la replica): è la stessa che prima
 *    stava in un box a parte.
 *
 * 🔴 LA GARANZIA NON SCATTA PIÙ SULLA PAROLA (Valerio, 15/08: «uno può
 * essere pagato e chiedere il rimborso lo stesso, come lo verifichiamo?»).
 * Non possiamo vedere il conto di nessuno. Quindi il rimborso dei 14,90
 * parte solo DOPO che c'è un no SCRITTO della compagnia registrato, che
 * leggiamo noi: chi è stato pagato non ha un no da mostrare. Il server lo
 * ricontrolla (`/api/pratiche/[id]/esito`).
 *
 * I due bottoni restano SEMPRE visibili: chi ha ricevuto un no e poi, dopo
 * la replica, si è visto pagare, deve poterlo dire.
 */
export default function DichiaraEsito({
  praticaId,
  rifiutoRegistrato = false,
  rifiutoProvato = false,
  giaDichiarato = null,
  etichettaScelta = null,
  nuovoGiro = false,
}: {
  praticaId: string;
  /** Vero se un no scritto della compagnia è già registrato sulla pratica. */
  rifiutoRegistrato?: boolean;
  /** Vero se il no è arrivato come DOCUMENTO vero (foto/email), non testo
   *  scritto a mano: è quello che fa scattare la garanzia (anti-frode). */
  rifiutoProvato?: boolean;
  giaDichiarato?: string | null;
  etichettaScelta?: string | null;
  nuovoGiro?: boolean;
}) {
  const router = useRouter();
  // Con un no già registrato la strada del rifiuto è aperta di suo.
  const [mostraNo, setMostraNo] = useState(rifiutoRegistrato);
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
        Come è andata con la compagnia?
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-verde-notte/80">
        Quando sai com&apos;è finita, dimmelo qui e chiudiamo la pratica. Il bonifico arriva sul
        tuo conto, non da noi.
      </p>

      {/* ⚠️ BOTTONI PIÙ CORPOSI + ICONE (Valerio, 15/08: «sono brutti e
          troppo magri, metti la spunta per pagato e la X per il no»).
          h-14 e font-semibold li ingrassano (Valerio, 15/08: «ancora
          sottilissimi, dagli più altezza»); la spunta sul verde, la X sul
          bordato. */}
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <Button
          type="button"
          size="lg"
          className="h-14 flex-1 gap-2 text-[15px] font-semibold"
          disabled={inCorso}
          onClick={() => void dichiara("pagata")}
        >
          {inCorso ? (
            "Un attimo…"
          ) : (
            <>
              <Check className="size-5 shrink-0" aria-hidden="true" />
              Mi hanno pagato
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="contorno"
          size="lg"
          className="h-14 flex-1 gap-2 text-[15px] font-semibold"
          aria-pressed={mostraNo}
          onClick={() => {
            setErrore(null);
            setMostraNo(true);
          }}
        >
          <X className="size-5 shrink-0" aria-hidden="true" />
          Mi hanno risposto no
        </Button>
      </div>

      {mostraNo && (
        <div className="mt-5 border-t border-verde/20 pt-5">
          {/* La strada del rifiuto, resa QUI DENTRO (nuda): carica il loro
              no e prepara la replica. È la stessa di prima, senza un box a
              parte. */}
          <DichiaraRifiuto
            praticaId={praticaId}
            nudo
            giaDichiarato={giaDichiarato}
            etichettaScelta={etichettaScelta}
            nuovoGiro={nuovoGiro}
          />

          {/* LA CHIUSURA CON GARANZIA compare SOLO se il no è un DOCUMENTO
              vero caricato (foto/email): è il paletto anti-frode. Un no
              scritto a mano prepara la replica ma NON fa scattare il
              rimborso (Valerio, 15/08: «metto testo semplice e mi dà il
              rimborso»). Il server lo ricontrolla comunque. */}
          {rifiutoProvato ? (
            <div className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5">
              <p className="text-[0.95rem] leading-relaxed text-inchiostro">
                Se dopo la replica e i solleciti non hai visto un euro, chiudo la pratica e faccio
                partire la garanzia: ti rimborsiamo i 14,90 che hai pagato.
              </p>
              {/* ⚠️ h-auto + whitespace-normal: prima il testo era su una
                  riga sola e si tagliava ai bordi sul telefono (Valerio,
                  15/08). Adesso va a capo e il bottone cresce. */}
              <Button
                type="button"
                variant="scuro"
                className="mt-3 h-auto w-full whitespace-normal py-3 leading-snug"
                disabled={inCorso}
                onClick={() => void dichiara("non_pagata")}
              >
                {inCorso ? "Un attimo…" : "Chiudi e chiedi il rimborso (14,90€)"}
              </Button>
            </div>
          ) : rifiutoRegistrato ? (
            <p className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5 text-[0.9rem] leading-relaxed text-fumo">
              Per far partire la garanzia dei 14,90€ serve la risposta VERA della compagnia:
              caricala qui sopra come foto o email («Carica lo screenshot»). Il testo scritto a
              mano prepara la replica, ma non basta per il rimborso.
            </p>
          ) : null}
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
