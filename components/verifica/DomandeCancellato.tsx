"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { COPY } from "@/lib/copy";
import type { Alternativa, Preavviso } from "@/lib/regole/cancellato";

/**
 * LE DUE DOMANDE CHE CHIUDONO UN VOLO CANCELLATO.
 *
 * Il check si ferma su "incerto" perché l'articolo 5 del CE 261/2004 lega
 * la compensazione a due fatti che nessun archivio di volo conosce:
 * quanti giorni prima ti hanno avvisato, e com'è andata con il volo
 * alternativo. Sono le uniche due cose che possiamo chiedere solo a te.
 *
 * COME SONO SCRITTE, e non è un dettaglio: niente date da ricordare a
 * memoria, niente ore esatte. Si sceglie fra fasce ("più di due
 * settimane", "meno di una settimana") perché è così che la gente
 * ricorda le cose mesi dopo. Una domanda a cui si risponde male vale un
 * reclamo respinto.
 *
 * La decisione NON si prende qui: le risposte vanno al server, il motore
 * deterministico dà il verdetto e la riga della verifica se lo scrive.
 * Nel browser non c'è nessuna regola da poter falsificare.
 */

const T = COPY.risultato.cancellato;

type Esito = {
  esito: "idoneo" | "incerto" | "non_idoneo";
  motivo: string;
  importo?: number;
};

const CURVA = [0.16, 1, 0.3, 1] as const;

function Gruppo<V extends string>({
  titolo,
  aiuto,
  voci,
  scelta,
  scegli,
}: {
  titolo: string;
  aiuto?: string;
  voci: readonly { valore: V; testo: string }[];
  scelta: V | null;
  scegli: (v: V) => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="text-[15.5px] font-semibold text-inchiostro">{titolo}</legend>
      {aiuto && <p className="mt-1 text-[13.5px] leading-relaxed text-fumo">{aiuto}</p>}
      <div className="mt-3 flex flex-col gap-2">
        {voci.map((v) => {
          const attiva = scelta === v.valore;
          return (
            <button
              key={v.valore}
              type="button"
              onClick={() => scegli(v.valore)}
              aria-pressed={attiva}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] transition-all duration-200 ${
                attiva
                  ? "border-verde bg-menta-tenue font-medium text-inchiostro"
                  : "border-bordo bg-white text-fumo hover:border-verde/50 hover:bg-nebbia"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 ${
                  attiva ? "border-verde" : "border-bordo"
                }`}
              >
                {attiva && <span className="h-2 w-2 rounded-full bg-verde" />}
              </span>
              {v.testo}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function DomandeCancellato({
  volo,
  dataVolo,
  idVerifica,
  demo,
  avvisa,
}: {
  volo: string;
  dataVolo: string;
  idVerifica: string | null;
  demo: boolean;
  /** Dice alla pagina che il caso è chiuso: il titolo non deve più dire "ci fermiamo". */
  avvisa?: (esito: "idoneo" | "incerto" | "non_idoneo") => void;
}) {
  const [preavviso, setPreavviso] = useState<Preavviso | null>(null);
  const [alternativa, setAlternativa] = useState<Alternativa | null>(null);
  const [invio, setInvio] = useState(false);
  const [esito, setEsito] = useState<Esito | null>(null);
  const [errore, setErrore] = useState("");

  const pronto = preavviso !== null && alternativa !== null;

  async function manda() {
    if (!pronto || invio) return;
    setInvio(true);
    setErrore("");
    try {
      const r = await fetch("/api/verifica/cancellato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volo, data: dataVolo, verificaId: idVerifica, preavviso, alternativa }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        setErrore(typeof d?.errore === "string" ? d.errore : COPY.comune.erroreGenerico);
        return;
      }
      /* Caso VERO (c'è una riga di verifica): il server ha già riscritto
         l'esito, quindi si ricarica e la pagina si rifà da capo col
         verdetto giusto, il reveal e il bottone per aprire la pratica.
         Meglio ricaricare che ricostruire qui una seconda vendita.
         Caso demo: nessuna riga da rileggere, il verdetto si mostra qui. */
      if (idVerifica && d.esito !== "incerto") {
        window.location.reload();
        return;
      }
      setEsito({ esito: d.esito, motivo: d.motivo, importo: d.importo });
      avvisa?.(d.esito);
    } catch {
      setErrore(COPY.comune.erroreGenerico);
    } finally {
      setInvio(false);
    }
  }

  /* Dopo la risposta: il verdetto vero, con lo stesso linguaggio del
     resto del sito. Sull'idoneo si mostra la fascia, e il bottone per
     aprire la pratica sta nella pagina, non qui: la vendita passa
     sempre dallo stesso posto. */
  if (esito) {
    const buono = esito.esito === "idoneo";
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: CURVA }}
        className={`rounded-2xl border p-5 sm:p-6 ${
          buono ? "border-verde bg-menta-tenue" : "border-bordo bg-nebbia"
        }`}
      >
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-verde">
          {buono ? T.esitoIdoneo : T.esitoChiuso}
        </p>
        {buono && esito.importo && (
          <p className="numeri mt-2 font-display text-[44px] font-medium leading-none tracking-[-0.04em] text-verde">
            {esito.importo}€
          </p>
        )}
        <p className="mt-3 text-[15.5px] leading-relaxed text-inchiostro/85">{esito.motivo}</p>
        {buono && <p className="mt-3 text-[14px] leading-relaxed text-fumo">{T.dopoIdoneo}</p>}
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-verde/30 bg-white p-5 sm:p-6">
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-verde">
        {T.occhiello}
      </p>
      <h3 className="mt-2 font-display text-[21px] font-medium leading-tight tracking-[-0.02em] text-inchiostro">
        {T.titolo}
      </h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-fumo">{T.testo}</p>

      <div className="mt-6 flex flex-col gap-6">
        <Gruppo
          titolo={T.preavviso.domanda}
          aiuto={T.preavviso.aiuto}
          voci={T.preavviso.voci}
          scelta={preavviso}
          scegli={setPreavviso}
        />
        <Gruppo
          titolo={T.alternativa.domanda}
          aiuto={T.alternativa.aiuto}
          voci={T.alternativa.voci}
          scelta={alternativa}
          scegli={setAlternativa}
        />
      </div>

      {errore && (
        <p role="alert" className="mt-4 text-[14px] text-red-600">
          {errore}
        </p>
      )}

      <button
        type="button"
        onClick={() => void manda()}
        disabled={!pronto || invio}
        className="riflesso mt-6 h-13 w-full rounded-bottone bg-verde px-7 text-[15.5px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(10,157,92,.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-50"
      >
        {invio ? COPY.comune.caricamento : T.bottone}
      </button>
      <p className="mt-3 text-center text-[13px] text-fumo-2">
        {demo ? T.notaDemo : T.nota}
      </p>
    </div>
  );
}
