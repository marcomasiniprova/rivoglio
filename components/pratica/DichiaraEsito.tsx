"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DichiaraRifiuto from "./DichiaraRifiuto";

/**
 * COME È ANDATA CON LA COMPAGNIA, un box solo (Valerio, 15/08).
 *
 * 🔴 Prima erano DUE riquadri per la stessa cosa: «ti ha pagato?» e «ti ha
 * risposto no?». Confondevano. Adesso sono uno: una domanda, due bottoni.
 *  - «Mi hanno pagato» → chiude la pratica come vinta (entra in classifica,
 *    se ha scelto un nome pubblico). Il bonifico arriva sul suo conto, non
 *    da noi, quindi è lui a dirlo.
 *  - «Mi hanno risposto no» → apre la strada del rifiuto (carica il loro no,
 *    gli preparo la replica).
 *
 * 🔴 SCHERMATA DEDICATA PER IL NO (Valerio, 18/08: «premo mi hanno detto no
 * e resta sopra il bottone mi hanno pagato, sembra tutto mischiato, non
 * capisco di essere nella fase di caricare la risposta»). Adesso, appena
 * premi «no», la sezione cambia TUTTA: un titolo che dice dove sei, e sotto
 * il solo compito di adesso (caricare la loro risposta). «Mi hanno pagato»
 * scende piccolo in fondo, per chi dopo la replica si è visto pagare.
 *
 * 🔴 LA GARANZIA NON SCATTA PIÙ SULLA PAROLA (Valerio, 15/08: «uno può
 * essere pagato e chiedere la garanzia lo stesso, come lo verifichiamo?»).
 * Non possiamo vedere il conto di nessuno. Quindi la garanzia (dal 17/08 un
 * CREDITO per la prossima pratica, non contanti) parte solo DOPO che c'è un
 * no SCRITTO della compagnia registrato, che leggiamo noi: chi è stato
 * pagato non ha un no da mostrare. Il server lo ricontrolla
 * (`/api/pratiche/[id]/esito`).
 */
export default function DichiaraEsito({
  praticaId,
  rifiutoRegistrato = false,
  rifiutoProvato = false,
  haCombattuto = false,
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
  /** Vero se l'utente ha già mandato almeno una replica: la garanzia è
   *  l'ultima spiaggia, si sblocca solo dopo aver combattuto (Valerio 16/08). */
  haCombattuto?: boolean;
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
      {!mostraNo ? (
        <>
          <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em] text-verde-notte">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            Come è andata con la compagnia?
          </h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-verde-notte/80">
            Quando sai com&apos;è finita, dimmelo qui e chiudiamo la pratica. Il bonifico arriva sul
            tuo conto, non da noi.
          </p>

          {/* ⚠️ BOTTONI ALTI 64px + ICONE (Valerio, 15/08 e 16/08). Su telefono
              `flex-1` in colonna collassa l'altezza al testo: qui `w-full` +
              `h-16` e `flex-1` solo da `sm` in su. */}
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="button"
              className="h-16 w-full gap-2 text-base font-semibold sm:w-auto sm:flex-1"
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
              className="h-16 w-full gap-2 text-base font-semibold sm:w-auto sm:flex-1"
              onClick={() => {
                setErrore(null);
                setMostraNo(true);
              }}
            >
              <X className="size-5 shrink-0" aria-hidden="true" />
              Mi hanno detto no
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em] text-verde-notte">
            <AlertTriangle className="size-5 shrink-0 text-sole" aria-hidden="true" />
            La compagnia ti ha detto no
          </h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-verde-notte/80">
            Succede alla maggior parte dei reclami validi, e quasi sempre è un no che non regge.
            Carica la loro risposta qui sotto: la leggo io e ti preparo la replica sui loro stessi
            fatti.
          </p>

          <div className="mt-4">
            {/* La strada del rifiuto, nuda: il titolo e l'intro li mette
                questo box qui sopra, così si capisce dove sei. */}
            <DichiaraRifiuto
              praticaId={praticaId}
              nudo
              giaDichiarato={giaDichiarato}
              etichettaScelta={etichettaScelta}
              nuovoGiro={nuovoGiro}
            />
          </div>

          {/* LA CHIUSURA CON GARANZIA È L'ULTIMA SPIAGGIA, a due condizioni
              (Valerio, 15 e 16/08): il no dev'essere un DOCUMENTO vero
              caricato (anti-frode), e devi aver già MANDATO la replica (la
              garanzia arriva dopo aver combattuto). La garanzia è un CREDITO,
              non contanti (Valerio, 17/08). Il server ricontrolla entrambe. */}
          {rifiutoProvato && haCombattuto ? (
            <div className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5">
              <p className="text-[0.95rem] leading-relaxed text-inchiostro">
                Hai mandato la replica e non hanno pagato lo stesso? Allora chiudo la pratica e
                faccio partire la garanzia: la tua prossima pratica è su di noi, te la offriamo
                gratis.
              </p>
              <Button
                type="button"
                variant="scuro"
                className="mt-3 h-auto w-full whitespace-normal py-3 leading-snug"
                disabled={inCorso}
                onClick={() => void dichiara("non_pagata")}
              >
                {inCorso ? "Un attimo…" : "Chiudi e prendi il credito (prossima pratica gratis)"}
              </Button>
            </div>
          ) : rifiutoProvato ? (
            <p className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5 text-[0.9rem] leading-relaxed text-fumo">
              La garanzia è l&apos;ultima spiaggia. Prima manda la replica qui sopra: spessissimo il
              loro no cade proprio lì. Se dopo la replica non pagano lo stesso, la garanzia scatta da
              sola e la tua prossima pratica è gratis.
            </p>
          ) : rifiutoRegistrato ? (
            <p className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5 text-[0.9rem] leading-relaxed text-fumo">
              Per far partire la garanzia (la prossima pratica gratis) serve la risposta VERA della
              compagnia: caricala qui sopra come foto o email («Carica lo screenshot»). Il testo
              scritto a mano prepara la replica, ma non basta per la garanzia.
            </p>
          ) : null}

          {/* «MI HANNO PAGATO» scende qui, piccolo e separato: per chi, dopo
              la replica, si è visto pagare lo stesso (Valerio, 18/08). */}
          <div className="mt-5 border-t border-verde/20 pt-4">
            <p className="text-sm leading-relaxed text-verde-notte/70">Alla fine ti hanno pagato lo stesso?</p>
            <button
              type="button"
              disabled={inCorso}
              onClick={() => void dichiara("pagata")}
              className="mt-1.5 text-sm font-medium text-verde-scuro underline decoration-bordo underline-offset-4 hover:text-verde disabled:opacity-60"
            >
              {inCorso ? "Un attimo…" : "Sì, mi hanno pagato: chiudi la pratica"}
            </button>
          </div>
        </>
      )}

      {errore && (
        <p role="alert" className="mt-3 rounded-xl bg-sole/15 px-3.5 py-2.5 text-sm leading-relaxed">
          {errore}
        </p>
      )}
    </section>
  );
}
