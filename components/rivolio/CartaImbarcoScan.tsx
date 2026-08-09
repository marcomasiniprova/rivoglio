"use client";

import { motion } from "motion/react";

/**
 * LA CARTA D'IMBARCO SOTTO SCANSIONE: il pezzo di teatro condiviso fra
 * l'hero (durante il check) e la pagina del verdetto (arrivo diretto).
 *
 * Realismo da documento vero, onestà da Rivolio:
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
  /* I dati VERI del server, quando arrivano: il biglietto si compila
     campo per campo man mano che l'analisi avanza. Mai inventati: se il
     server non li ha dati, il campo resta una barra in lettura. */
  tratta?: string | null;
  arrivoPrevisto?: string | null;
  arrivoEffettivo?: string | null;
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
  valore?: string | null;
  letto: boolean;
  largo: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-fumo-2">
        {etichetta}
      </p>
      {valore ? (
        /* Il valore appena scritto entra con un piccolo assestamento e un
           lampo di evidenziatore: si vede CHE COSA lo scan ha appena letto. */
        <motion.p
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="numeri relative mt-0.5 truncate font-display text-[15px] font-medium tracking-[-0.01em] text-inchiostro"
        >
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, delay: 0.15 }}
            className="absolute -inset-x-1 -inset-y-0.5 rounded bg-menta/40"
          />
          <span className="relative">{valore}</span>
        </motion.p>
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

export default function CartaImbarcoScan({
  volo,
  dataTesto,
  passo,
  tratta,
  arrivoPrevisto,
  arrivoEffettivo,
}: Props) {
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
        {/* I campi si compilano AL PASSO GIUSTO, coi dati veri del server:
            la tratta quando il volo è trovato, gli orari quando vengono
            confrontati. Se il dato non c'è ancora, la barra resta. */}
        <CampoLetto
          etichetta="Tratta"
          valore={passo >= 1 ? tratta : null}
          letto={passo >= 1}
          largo="w-14"
        />
        <CampoLetto
          etichetta="Arrivo previsto"
          valore={passo >= 2 ? arrivoPrevisto : null}
          letto={passo >= 2}
          largo="w-12"
        />
        <CampoLetto
          etichetta="Arrivo effettivo"
          valore={passo >= 2 ? arrivoEffettivo : null}
          letto={passo >= 2}
          largo="w-12"
        />
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

      {/* LA LUCE: una fascia larga e morbida che scorre lenta, come la
          testina di uno scanner da ufficio. Niente linea dura: solo un
          gradiente di luce con un velo più chiaro al centro. Scende in
          3,4 secondi, riposa mezzo secondo, riparte dall'alto. */}
      <motion.div
        aria-hidden="true"
        className="scan-raggio pointer-events-none absolute inset-x-0 top-0 h-28"
        initial={{ y: "-110%", opacity: 0 }}
        animate={{ y: ["-110%", "400%"], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "linear",
          opacity: { times: [0, 0.12, 0.85, 1], duration: 3.4, repeat: Infinity, repeatDelay: 0.5 },
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(10,157,92,.05) 28%, rgba(10,157,92,.13) 46%, rgba(127,232,174,.20) 52%, rgba(10,157,92,.11) 58%, rgba(10,157,92,.04) 74%, transparent)",
          }}
        />
      </motion.div>
    </div>
  );
}
