"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * "Hai rinunciato a partire per il forte ritardo?"
 *
 * Compare SOLO sul verdetto idoneo di un volo con almeno 5 ore di ritardo:
 * un aereo così in ritardo esce idoneo alla COMPENSAZIONE (per chi è
 * partito). Chi invece ha rinunciato non ha diritto alla compensazione ma
 * al RIMBORSO del biglietto (art. 6 → art. 8): lo dichiara da qui, il
 * prezzo lo mette lui, e il motore sul server decide. Il diritto al
 * rimborso non è escluso dalle circostanze eccezionali: è il punto forte.
 */

const T = COPY.risultato.rinuncia;
const CURVA = [0.16, 1, 0.3, 1] as const;

type Esito = { esito: "idoneo" | "incerto" | "non_idoneo"; motivo: string; importo?: number };

function Scelte<V extends string>({
  domanda,
  voci,
  scelta,
  scegli,
}: {
  domanda: string;
  voci: readonly { valore: V; testo: string }[];
  scelta: V | null;
  scegli: (v: V) => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="text-[15px] font-semibold text-inchiostro">{domanda}</legend>
      <div className="mt-2.5 flex flex-col gap-2">
        {voci.map((v) => {
          const attiva = scelta === v.valore;
          return (
            <button
              key={v.valore}
              type="button"
              onClick={() => scegli(v.valore)}
              aria-pressed={attiva}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[14px] transition-all duration-200 ${
                attiva
                  ? "border-verde bg-menta-tenue font-medium text-inchiostro"
                  : "border-bordo bg-white text-fumo hover:border-verde/50 hover:bg-nebbia"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border-2 ${
                  attiva ? "border-verde" : "border-bordo"
                }`}
              >
                {attiva && <span className="h-[7px] w-[7px] rounded-full bg-verde" />}
              </span>
              {v.testo}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function DichiaraRinuncia({
  volo,
  dataVolo,
  idVerifica,
  demo,
}: {
  volo: string;
  dataVolo: string;
  idVerifica: string | null;
  demo: boolean;
}) {
  const [aperto, setAperto] = useState(false);
  const [rinuncia, setRinuncia] = useState<string | null>(null);
  const [giaRimborsato, setGiaRimborsato] = useState<string | null>(null);
  const [prezzo, setPrezzo] = useState("");
  const [invio, setInvio] = useState(false);
  const [esito, setEsito] = useState<Esito | null>(null);
  const [errore, setErrore] = useState("");
  const router = useRouter();

  const prezzoNum = Number(prezzo.replace(/[^\d.,]/g, "").replace(",", "."));
  const prezzoOk = Number.isFinite(prezzoNum) && prezzoNum > 0;
  const pronto = rinuncia !== null && giaRimborsato !== null && prezzoOk;

  async function manda() {
    if (!pronto || invio) return;
    setInvio(true);
    setErrore("");
    try {
      const r = await fetch("/api/verifica/dichiara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volo,
          data: dataVolo,
          verificaId: idVerifica,
          caso: "ritardo_rinuncia",
          rinuncia,
          giaRimborsato: giaRimborsato === "si",
          prezzo: prezzoNum,
        }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        setErrore(typeof d?.errore === "string" ? d.errore : COPY.comune.erroreGenerico);
        return;
      }
      /* Idoneo su una verifica vera: il server ha riscritto il verdetto
         (ora è un rimborso), la pagina si aggiorna sul posto e mostra
         l'importo con la sua lettera. Incerto o esempio: riquadro qui. */
      if (idVerifica && d.esito === "idoneo") {
        router.refresh();
        return;
      }
      setEsito({ esito: d.esito, motivo: d.motivo, importo: d.importo });
    } catch {
      setErrore(COPY.comune.erroreGenerico);
    } finally {
      setInvio(false);
    }
  }

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
        {buono && esito.importo && (
          <p className="numeri font-display text-[44px] font-medium leading-none tracking-[-0.04em] text-verde">
            {esito.importo}€
          </p>
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-inchiostro/85">{esito.motivo}</p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-bordo bg-white p-5 sm:p-6">
      <p className="text-[15.5px] font-semibold text-inchiostro">{T.invito}</p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-fumo">{T.invitoSotto}</p>

      {!aperto ? (
        <button
          type="button"
          onClick={() => setAperto(true)}
          className="mt-4 rounded-xl border border-bordo bg-nebbia px-4 py-3 text-[14px] font-medium text-fumo transition-all duration-200 hover:border-verde/50"
        >
          {T.apri}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: CURVA }}
          className="mt-5 flex flex-col gap-5 border-t border-bordo/70 pt-5"
        >
          <Scelte
            domanda={T.rinuncia.domanda}
            voci={T.rinuncia.voci}
            scelta={rinuncia as never}
            scegli={setRinuncia}
          />
          <Scelte
            domanda={T.giaRimborsato.domanda}
            voci={T.giaRimborsato.voci}
            scelta={giaRimborsato as never}
            scegli={setGiaRimborsato}
          />
          <div>
            <label htmlFor="prezzo-rinuncia" className="text-[15px] font-semibold text-inchiostro">
              {T.prezzo.domanda}
            </label>
            <p className="mt-1 text-[13px] leading-relaxed text-fumo">{T.prezzo.aiuto}</p>
            <div className="relative mt-2.5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-fumo-2"
              >
                €
              </span>
              <input
                id="prezzo-rinuncia"
                type="text"
                inputMode="decimal"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
                placeholder={T.prezzo.segnaposto}
                className="h-12 w-full rounded-xl border border-bordo bg-white pl-9 pr-4 text-[16px] outline-none transition-all duration-200 focus:border-verde/60 focus:ring-4 focus:ring-verde/10 sm:text-[15px]"
              />
            </div>
          </div>

          {errore && (
            <p role="alert" className="text-[14px] text-red-600">
              {errore}
            </p>
          )}

          <div>
            <button
              type="button"
              onClick={() => void manda()}
              disabled={!pronto || invio}
              className="riflesso h-13 w-full rounded-bottone bg-verde px-7 text-[15.5px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(10,157,92,.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-50"
            >
              {invio ? COPY.comune.caricamento : T.bottone}
            </button>
            <p className="mt-2.5 text-center text-[12.5px] text-fumo-2">
              {demo ? T.notaDemo : T.nota}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
