"use client";

import { motion } from "motion/react";

/**
 * LA CARTA D'IMBARCO SOTTO SCANSIONE: il pezzo di teatro condiviso fra
 * l'hero (durante il check) e la pagina del verdetto (arrivo diretto).
 *
 * Realismo da documento vero, onestà da Rivoglio:
 * - i soli dati stampati sono quelli veri (numero volo e data);
 * - tratta e orari NON si inventano: restano campi in lettura (barre)
 *   finché il server non ha davvero risposto;
 * - il codice a barre è iconografia del documento, non un dato;
 * - i passi si accendono con lo stato vero della richiesta (prop passo).
 *
 * passo: 0 = ricerca negli archivi · 1 = volo trovato · 2 = orari
 * confrontati · 3 = regolamento applicato (timbro).
 */

type Props = {
  volo: string;
  dataTesto: string;
  passo: number;
};

/** Le tacche del codice a barre: fisse, così il render non cambia mai. */
const BARRE = [3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 4, 1, 3, 1, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1];

function CampoLetto({
  etichetta,
  valore,
  letto,
  largo,
}: {
  etichetta: string;
  valore?: string;
  letto: boolean;
  largo: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-fumo-2">
        {etichetta}
      </p>
      {valore ? (
        <p className="numeri mt-0.5 truncate font-display text-[15px] font-medium tracking-[-0.01em] text-inchiostro">
          {valore}
        </p>
      ) : (
        <span
          className={`mt-1.5 block h-2 rounded-full transition-colors duration-500 ${largo} ${
            letto ? "bg-verde/40" : "scan-lettura bg-bordo"
          }`}
        />
      )}
    </div>
  );
}

export default function CartaImbarcoScan({ volo, dataTesto, passo }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-bordo bg-white shadow-[0_1px_2px_rgba(5,46,31,.08),0_24px_48px_-24px_rgba(5,46,31,.35)]">
      {/* la grana della carta: righe finissime, quasi invisibili */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(5,46,31,.022) 0 1px, transparent 1px 7px)",
        }}
      />

      {/* la fascia del documento */}
      <div className="relative flex items-center justify-between bg-verde-notte px-4 py-2 text-white">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-menta/80">
          Carta d&apos;imbarco
        </span>
        <span className="numeri text-[10px] uppercase tracking-[0.14em] text-white/55">
          Boarding pass
        </span>
      </div>

      {/* i campi del documento */}
      <div className="relative grid grid-cols-[1.2fr_1fr_1fr] gap-x-4 gap-y-3 px-4 pb-3 pt-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-fumo-2">Volo</p>
          <p className="numeri mt-0.5 flex items-center gap-1.5 font-display text-[19px] font-medium tracking-[-0.02em] text-inchiostro">
            {volo}
            {passo >= 1 && (
              <motion.svg
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 text-verde"
                aria-hidden="true"
              >
                <path
                  d="m3.5 8.4 2.8 2.8 6-6.4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </p>
        </div>
        <CampoLetto etichetta="Data" valore={dataTesto} letto={passo >= 1} largo="w-16" />
        <CampoLetto etichetta="Tratta" letto={passo >= 1} largo="w-14" />
        <CampoLetto etichetta="Arrivo previsto" letto={passo >= 2} largo="w-12" />
        <CampoLetto etichetta="Arrivo effettivo" letto={passo >= 2} largo="w-12" />
        <div className="relative min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-fumo-2">
            Verifica
          </p>
          {passo >= 3 ? (
            <motion.span
              initial={{ scale: 1.5, opacity: 0, rotate: -14 }}
              animate={{ scale: 1, opacity: 1, rotate: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 17 }}
              className="mt-1 inline-block rounded-[4px] border-2 border-verde px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-verde"
            >
              Reg. CE 261/2004
            </motion.span>
          ) : (
            <span className="scan-lettura mt-1.5 block h-2 w-16 rounded-full bg-bordo" />
          )}
        </div>
      </div>

      {/* il tagliando: strappo tratteggiato e codice a barre */}
      <div className="relative border-t border-dashed border-bordo/90 px-4 pb-3 pt-2.5 sm:px-5">
        <div className="flex items-end justify-between gap-4">
          <div
            aria-hidden="true"
            className="flex h-7 items-stretch gap-px opacity-80"
          >
            {BARRE.map((b, i) => (
              <span
                key={i}
                className="bg-inchiostro/85"
                style={{ width: b, marginRight: b % 2 ? 1 : 2 }}
              />
            ))}
          </div>
          <p className="numeri shrink-0 text-[9.5px] uppercase tracking-[0.2em] text-fumo-2">
            {volo} · {dataTesto}
          </p>
        </div>
      </div>

      {/* IL RAGGIO: un nucleo netto di luce col suo alone, come una
          testina di scansione vera. Fermo se il movimento è ridotto. */}
      <motion.div
        aria-hidden="true"
        className="scan-raggio pointer-events-none absolute inset-x-0 top-0 h-16"
        initial={{ y: "-100%" }}
        animate={{ y: ["-100%", "560%", "-100%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(10,157,92,.10) 38%, rgba(10,157,92,.26) 50%, rgba(10,157,92,.10) 62%, transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 top-1/2 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(127,232,174,.95) 18%, rgba(10,157,92,.95) 50%, rgba(127,232,174,.95) 82%, transparent)",
            boxShadow: "0 0 14px 2px rgba(10,157,92,.55)",
          }}
        />
      </motion.div>
    </div>
  );
}
