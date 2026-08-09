"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { COPY } from "@/lib/copy";

/**
 * LA DOMANDA CHE CHIUDE UN VOLO IN CODESHARE.
 *
 * Il codeshare è questo: il biglietto dice "Air France 1234", ma
 * sull'aereo c'era scritto un altro nome, perché quel volo lo fa
 * un'altra compagnia. Il Regolamento dice che il reclamo va a chi ha
 * fatto volare l'aereo: mandarlo all'altra significa prendersi un no.
 *
 * Quando il fornitore dati non sa dire chi ha operato, prima il check si
 * fermava. Ma quella risposta ce l'ha l'utente sotto gli occhi: sta
 * scritta sulla carta d'imbarco, alla voce "operato da". Quindi si
 * chiede, e si chiede senza usare la parola "codeshare", che non vuol
 * dire niente a nessuno.
 *
 * Il verdetto lo dà il server, come sempre: qui dentro non c'è una riga
 * di Regolamento.
 */

const T = COPY.risultato.operativo;
const CURVA = [0.16, 1, 0.3, 1] as const;

type Compagnia = { iata: string; nome: string; paese: string | null };
type Esito = { esito: "idoneo" | "incerto" | "non_idoneo"; motivo: string; importo?: number };

export default function ChiHaOperato({
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
  avvisa?: (esito: "idoneo" | "incerto" | "non_idoneo") => void;
}) {
  const [testo, setTesto] = useState("");
  const [elenco, setElenco] = useState<Compagnia[]>([]);
  const [scelta, setScelta] = useState<Compagnia | null>(null);
  const [invio, setInvio] = useState(false);
  const [esito, setEsito] = useState<Esito | null>(null);
  const [errore, setErrore] = useState("");
  const [rinuncia, setRinuncia] = useState(false);
  const ultima = useRef(0);

  /* La ricerca parte da due lettere e si annulla da sola se l'utente
     continua a scrivere: l'ultima richiesta partita è l'unica che vale. */
  useEffect(() => {
    if (scelta || testo.trim().length < 2) return;
    const mio = ++ultima.current;
    const attesa = setTimeout(() => {
      fetch(`/api/verifica/operativo?q=${encodeURIComponent(testo)}`)
        .then((r) => r.json())
        .then((d) => {
          if (mio === ultima.current) setElenco(d?.compagnie ?? []);
        })
        .catch(() => {
          if (mio === ultima.current) setElenco([]);
        });
    }, 180);
    return () => clearTimeout(attesa);
  }, [testo, scelta]);

  /* La lista si RICAVA, non si azzera a mano: svuotare lo stato dentro
     l'effetto costringerebbe React a un secondo giro di disegno a ogni
     lettera scritta. */
  const suggerimenti = scelta || testo.trim().length < 2 ? [] : elenco;
  const cercato = testo.trim().length >= 2;

  async function manda() {
    if (!scelta || invio) return;
    setInvio(true);
    setErrore("");
    try {
      const r = await fetch("/api/verifica/operativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volo,
          data: dataVolo,
          verificaId: idVerifica,
          vettore: scelta.iata,
        }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        setErrore(typeof d?.errore === "string" ? d.errore : COPY.comune.erroreGenerico);
        return;
      }
      /* Caso vero: il server ha già riscritto l'esito sulla riga, quindi
         si ricarica e la pagina si rifà col verdetto giusto e il bottone
         per aprire la pratica. La vendita passa sempre da lì. */
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
          {buono ? COPY.risultato.cancellato.esitoIdoneo : COPY.risultato.cancellato.esitoChiuso}
        </p>
        {buono && esito.importo && (
          <p className="numeri mt-2 font-display text-[44px] font-medium leading-none tracking-[-0.04em] text-verde">
            {esito.importo}€
          </p>
        )}
        <p className="mt-3 text-[15.5px] leading-relaxed text-inchiostro/85">{esito.motivo}</p>
        {buono && (
          <p className="mt-3 text-[14px] leading-relaxed text-fumo">
            {COPY.risultato.cancellato.dopoIdoneo}
          </p>
        )}
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

      {rinuncia ? (
        <p className="mt-5 rounded-xl border border-bordo bg-nebbia px-4 py-3 text-[14.5px] leading-relaxed text-fumo">
          {T.nonSoTesto}
        </p>
      ) : (
        <>
          <label
            htmlFor="chi-ha-operato"
            className="mt-6 block text-[15.5px] font-semibold text-inchiostro"
          >
            {T.etichetta}
          </label>
          <p className="mt-1 text-[13.5px] leading-relaxed text-fumo">{T.aiuto}</p>

          <div className="relative mt-3">
            <input
              id="chi-ha-operato"
              type="text"
              autoComplete="off"
              value={scelta ? scelta.nome : testo}
              onChange={(e) => {
                setScelta(null);
                setTesto(e.target.value);
              }}
              placeholder={T.segnaposto}
              className="h-13 w-full rounded-xl border border-bordo bg-white px-4 text-[15.5px] text-inchiostro outline-none transition-colors focus:border-verde"
            />

            {suggerimenti.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-bordo bg-white py-1 shadow-[0_18px_40px_-20px_rgba(4,32,22,.35)]">
                {suggerimenti.map((c) => (
                  <li key={c.iata}>
                    <button
                      type="button"
                      onClick={() => setScelta(c)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[14.5px] text-inchiostro hover:bg-nebbia"
                    >
                      <span>{c.nome}</span>
                      <span className="numeri text-[12.5px] text-fumo-2">{c.iata}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!scelta && cercato && suggerimenti.length === 0 && (
              <p className="mt-2 text-[13.5px] text-fumo">{T.nessuna}</p>
            )}
          </div>

          {errore && (
            <p role="alert" className="mt-4 text-[14px] text-red-600">
              {errore}
            </p>
          )}

          <button
            type="button"
            onClick={() => void manda()}
            disabled={!scelta || invio}
            className="riflesso mt-6 h-13 w-full rounded-bottone bg-verde px-7 text-[15.5px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(10,157,92,.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-50"
          >
            {invio ? COPY.comune.caricamento : T.bottone}
          </button>

          <button
            type="button"
            onClick={() => setRinuncia(true)}
            className="mt-3 w-full text-center text-[13.5px] text-fumo underline decoration-bordo underline-offset-4 hover:text-inchiostro"
          >
            {T.nonSo}
          </button>

          <p className="mt-3 text-center text-[13px] text-fumo-2">{demo ? T.notaDemo : T.nota}</p>
        </>
      )}
    </div>
  );
}
