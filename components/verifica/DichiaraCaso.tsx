"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * "Ti hanno lasciato a terra o hai perso una coincidenza?"
 *
 * I due casi che gli archivi di volo NON possono vedere: il volo
 * controllato può risultare perfetto mentre tu sei rimasto al gate, o
 * hai perso la coincidenza a Monaco per colpa del primo ritardo. Si apre
 * da un invito discreto sotto il verdetto, si risponde a scelte chiuse,
 * e il verdetto lo dà il motore sul server: qui non c'è nessuna regola
 * da poter falsificare.
 *
 * La coincidenza chiede anche la DESTINAZIONE FINALE, perché la fascia
 * si calcola sull'intero viaggio: il campo cerca sugli stessi 6.072
 * scali del check per tratta (/api/aeroporti).
 */

const T = COPY.risultato.dichiara;
const CURVA = [0.16, 1, 0.3, 1] as const;

type Esito = { esito: "idoneo" | "incerto" | "non_idoneo"; motivo: string; importo?: number };
type Scalo = { iata: string; citta: string; nome: string };

function Scelte<V extends string>({
  domanda,
  aiuto,
  voci,
  scelta,
  scegli,
}: {
  domanda: string;
  aiuto?: string;
  voci: readonly { valore: V; testo: string }[];
  scelta: V | null;
  scegli: (v: V) => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="text-[15px] font-semibold text-inchiostro">{domanda}</legend>
      {aiuto && <p className="mt-1 text-[13px] leading-relaxed text-fumo">{aiuto}</p>}
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

/** La destinazione finale: si scrive la città, si sceglie lo scalo. */
function CampoDestinazione({
  scelto,
  scegli,
}: {
  scelto: Scalo | null;
  scegli: (s: Scalo | null) => void;
}) {
  const [testo, setTesto] = useState("");
  const [trovati, setTrovati] = useState<Scalo[]>([]);
  /* La tendina si mostra solo quando ha senso: svuotarla con un setState
     dentro l'effetto innescava un giro di render inutile. */
  const visibili = scelto || testo.trim().length < 2 ? [] : trovati;
  const vivo = useRef(true);
  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);

  useEffect(() => {
    if (scelto || testo.trim().length < 2) return;
    const id = setTimeout(() => {
      fetch(`/api/aeroporti?q=${encodeURIComponent(testo.trim())}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (vivo.current && Array.isArray(d?.aeroporti)) setTrovati(d.aeroporti.slice(0, 5));
        })
        .catch(() => {});
    }, 220);
    return () => clearTimeout(id);
  }, [testo, scelto]);

  return (
    <div>
      <p className="text-[15px] font-semibold text-inchiostro">{T.coincidenza.destinazione.domanda}</p>
      {scelto ? (
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-verde bg-menta-tenue px-4 py-2.5">
          <p className="text-[14px] font-medium text-inchiostro">
            {scelto.citta} <span className="numeri text-[12px] text-fumo">({scelto.iata})</span>
          </p>
          <button
            type="button"
            onClick={() => {
              scegli(null);
              setTesto("");
            }}
            className="text-[13px] font-medium text-verde-scuro underline decoration-dotted underline-offset-4"
          >
            {COPY.check.tratta.cambia}
          </button>
        </div>
      ) : (
        <div className="relative mt-2.5">
          <input
            type="text"
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder={T.coincidenza.destinazione.segnaposto}
            /* ⚠️ 16px sul telefono: sotto quella misura iOS ingrandisce la
               pagina da solo appena si tocca il campo, e da lì in poi il
               verdetto resta zoomato e storto. Stesso difetto già trovato
               sul login e sul pannello. */
            className="h-12 w-full rounded-xl border border-bordo bg-white px-4 text-[16px] outline-none transition-all duration-200 focus:border-verde/60 focus:ring-4 focus:ring-verde/10 sm:text-[15px]"
          />
          {visibili.length > 0 && (
            <ul className="absolute inset-x-0 top-[52px] z-20 overflow-hidden rounded-xl border border-bordo bg-white shadow-[0_18px_44px_-20px_rgba(5,46,31,.35)]">
              {visibili.map((s) => (
                <li key={s.iata}>
                  <button
                    type="button"
                    onClick={() => scegli(s)}
                    className="flex w-full items-baseline gap-2 px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-menta-tenue"
                  >
                    <span className="font-medium text-inchiostro">{s.citta}</span>
                    <span className="truncate text-[12.5px] text-fumo">{s.nome}</span>
                    <span className="numeri ml-auto text-[12px] text-fumo-2">{s.iata}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function DichiaraCaso({
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
  const [aperto, setAperto] = useState<"negato" | "coincidenza" | null>(null);
  const [presenza, setPresenza] = useState<string | null>(null);
  const [volonta, setVolonta] = useState<string | null>(null);
  const [unica, setUnica] = useState<string | null>(null);
  const [ritardoFinale, setRitardoFinale] = useState<string | null>(null);
  const [destinazione, setDestinazione] = useState<Scalo | null>(null);
  const [invio, setInvio] = useState(false);
  const [esito, setEsito] = useState<Esito | null>(null);
  const [errore, setErrore] = useState("");

  const pronto =
    aperto === "negato"
      ? presenza !== null && volonta !== null
      : unica !== null && ritardoFinale !== null && destinazione !== null;

  async function manda() {
    if (!aperto || !pronto || invio) return;
    setInvio(true);
    setErrore("");
    try {
      const corpo =
        aperto === "negato"
          ? { caso: "negato", presenza, volonta }
          : { caso: "coincidenza", unica, ritardoFinale, destinazioneFinale: destinazione?.iata };
      const r = await fetch("/api/verifica/dichiara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volo, data: dataVolo, verificaId: idVerifica, ...corpo }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        setErrore(typeof d?.errore === "string" ? d.errore : COPY.comune.erroreGenerico);
        return;
      }
      if (idVerifica && d.esito !== "incerto") {
        window.location.reload();
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

      {/* le due schede: negato imbarco / coincidenza persa */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(
          [
            ["negato", T.negato.scheda],
            ["coincidenza", T.coincidenza.scheda],
          ] as const
        ).map(([chiave, testo]) => (
          <button
            key={chiave}
            type="button"
            onClick={() => setAperto(aperto === chiave ? null : chiave)}
            aria-expanded={aperto === chiave}
            className={`rounded-xl border px-4 py-3 text-[14px] font-medium transition-all duration-200 ${
              aperto === chiave
                ? "border-verde bg-menta-tenue text-inchiostro"
                : "border-bordo bg-nebbia text-fumo hover:border-verde/50"
            }`}
          >
            {testo}
          </button>
        ))}
      </div>

      {aperto && (
        <motion.div
          key={aperto}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: CURVA }}
          className="mt-5 flex flex-col gap-5 border-t border-bordo/70 pt-5"
        >
          {aperto === "negato" ? (
            <>
              <Scelte
                domanda={T.negato.presenza.domanda}
                voci={T.negato.presenza.voci}
                scelta={presenza as never}
                scegli={setPresenza}
              />
              <Scelte
                domanda={T.negato.volonta.domanda}
                voci={T.negato.volonta.voci}
                scelta={volonta as never}
                scegli={setVolonta}
              />
            </>
          ) : (
            <>
              <Scelte
                domanda={T.coincidenza.unica.domanda}
                aiuto={T.coincidenza.unica.aiuto}
                voci={T.coincidenza.unica.voci}
                scelta={unica as never}
                scegli={setUnica}
              />
              <CampoDestinazione scelto={destinazione} scegli={setDestinazione} />
              <Scelte
                domanda={T.coincidenza.ritardo.domanda}
                voci={T.coincidenza.ritardo.voci}
                scelta={ritardoFinale as never}
                scegli={setRitardoFinale}
              />
            </>
          )}

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
