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
  importoRimborso,
  rifiutoRegistrato = false,
  rifiutoProvato = false,
  haCombattuto = false,
  giaDichiarato = null,
  etichettaScelta = null,
  nuovoGiro = false,
}: {
  praticaId: string;
  /** Quanto rimborsa la garanzia: quello che ha pagato DAVVERO per questa
   *  pratica (14,90 singola, 29,90 famiglia), calcolato dal chiamante sul
   *  tipo. Prima era "14,90" fisso qui dentro, e alla famiglia (che ne paga
   *  29,90) prometteva meno del versato. */
  importoRimborso: string;
  /** Vero se un no scritto della compagnia è già registrato sulla pratica. */
  rifiutoRegistrato?: boolean;
  /** Vero se il no è arrivato come DOCUMENTO vero (foto/email), non testo
   *  scritto a mano: è quello che fa scattare la garanzia (anti-frode). */
  rifiutoProvato?: boolean;
  /** Vero se l'utente ha già mandato almeno una replica: il rimborso è
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
      <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em] text-verde-notte">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        Come è andata con la compagnia?
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-verde-notte/80">
        Quando sai com&apos;è finita, dimmelo qui e chiudiamo la pratica. Il bonifico arriva sul
        tuo conto, non da noi.
      </p>

      {/* ⚠️ BOTTONI ALTI 64px + ICONE (Valerio, 15/08 e 16/08: «sono brutti e
          troppo magri», e TRE volte «ancora sottilissimi»).
          🔴 PERCHÉ NON SI ALZAVANO, e l'ho scoperto misurandoli davvero nel
          browser (24px su telefono, non 64): il colpevole era `flex-1`
          dentro un contenitore `flex-col`. In una colonna, `flex-1` governa
          la dimensione VERTICALE e vince sull'altezza: senza un'altezza
          fissa sul contenitore, i bottoni collassavano al testo. `h-13`,
          `h-14`, `h-16` non contavano niente. Su desktop (`flex-row`)
          andavano bene, ma Valerio guarda dal telefono.
          Fix: `flex-1` SOLO da `sm` in su; su telefono `w-full` + `h-16`,
          e l'altezza torna a comandare. Misurato: 64px veri sul telefono.
          La spunta sul verde, la X sul bordato. */}
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
        {/* 🔴 «IL BOTTONE MI HANNO RISPOSTO NO A VOLTE NON FUNZIONA, CONTINUO
            A PREMERE MA NON VA» (Valerio, 16/08). Non era rotto: una volta
            aperta la strada del no (qui sotto), premerlo di nuovo non faceva
            niente, perché la strada era già aperta. Un bottone che resta lì
            e non risponde SEMBRA rotto. Adesso, appena la strada è aperta, il
            bottone sparisce: quello che serve (carica il no, scegli il
            motivo) è già lì sotto, e «Mi hanno pagato» resta per chi, dopo la
            replica, si è visto pagare. */}
        {!mostraNo && (
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
            Mi hanno risposto no
          </Button>
        )}
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

          {/* LA CHIUSURA CON GARANZIA È L'ULTIMA SPIAGGIA, e compare a due
              condizioni (Valerio, 15 e 16/08):
              1. il no è un DOCUMENTO vero caricato (foto/email), non testo
                 scritto a mano: è il paletto anti-frode;
              2. hai già MANDATO la replica al loro no: il rimborso arriva
                 DOPO aver combattuto, non al primo no (spesso il no cade
                 proprio alla replica). Il server ricontrolla entrambe. */}
          {rifiutoProvato && haCombattuto ? (
            <div className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5">
              <p className="text-[0.95rem] leading-relaxed text-inchiostro">
                Hai mandato la replica e non hanno pagato lo stesso? Allora chiudo la pratica e
                faccio partire la garanzia: ti rimborsiamo i {importoRimborso} che hai pagato.
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
                {inCorso ? "Un attimo…" : `Chiudi e chiedi il rimborso (${importoRimborso})`}
              </Button>
            </div>
          ) : rifiutoProvato ? (
            /* Ha caricato il no ma non ha ancora combattuto: la strada è la
               replica, non il rimborso. */
            <p className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5 text-[0.9rem] leading-relaxed text-fumo">
              Il rimborso è l&apos;ultima spiaggia. Prima manda la replica qui sopra: spessissimo il
              loro no cade proprio lì. Se dopo la replica non pagano lo stesso, la garanzia dei{" "}
              {importoRimborso} scatta da sola.
            </p>
          ) : rifiutoRegistrato ? (
            <p className="mt-4 rounded-xl border border-bordo bg-white px-4 py-3.5 text-[0.9rem] leading-relaxed text-fumo">
              Per far partire la garanzia dei {importoRimborso} serve la risposta VERA della
              compagnia: caricala qui sopra come foto o email («Carica lo screenshot»). Il testo
              scritto a mano prepara la replica, ma non basta per il rimborso.
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
