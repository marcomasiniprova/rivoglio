"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Anima } from "@/components/Anima";
import SfondoColonne from "@/components/SfondoColonne";
import { COPY } from "@/lib/copy";

/**
 * L'hero di Rivoglio: il gancio e IL FORM volo+data, che è il prodotto.
 *
 * Il campo è il protagonista: un bordo che pulsa lo indica finché l'utente
 * non ci entra (al focus si ferma: ha già vinto, pulsare ancora è rumore).
 * Solo transform e opacity, come tutto il movimento del sito.
 *
 * Il TEATRO ONESTO (SPEC §3 e §8): durante l'attesa si mostrano i tre passi
 * VERI della verifica. Il primo è acceso mentre la richiesta è davvero in
 * volo verso /api/verifica; il secondo e il terzo si completano quando la
 * risposta è arrivata, cioè quando il confronto orari e il calcolo sono
 * DAVVERO stati fatti dal server. Niente barre finte che avanzano a caso.
 */

const HERO = COPY.hero;
const TEATRO = COPY.comeFunziona.verifica;
const CURVA = [0.16, 1, 0.3, 1] as const;

type Fase = "campo" | "teatro";

const attesa = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Spezza il titolo per dare il corsivo alla parte finale, senza duplicare il testo in COPY. */
function spezzaTitolo(titolo: string, taglio: string): [string, string] {
  const i = titolo.indexOf(taglio);
  if (i < 0) return [titolo, ""];
  return [titolo.slice(0, i).trimEnd(), titolo.slice(i)];
}

/**
 * La forma canonica del numero di volo, per costruire il link demo:
 * "zz 0250" → "ZZ250". Rispecchia lib/voli/normalizza.ts nel caso
 * semplice (codice a due caratteri + numero); per il resto schiaccia
 * spazi e trattini. Il giudizio vero resta comunque al server.
 */
function canonico(grezzo: string): string {
  const pezzi = grezzo.trim().match(/^([A-Za-z0-9]{2})[\s-]*0*([0-9]{1,4})\s*([A-Za-z])?$/);
  if (pezzi) return (pezzi[1] + pezzi[2] + (pezzi[3] ?? "")).toUpperCase();
  return grezzo.replace(/[\s-]+/g, "").toUpperCase();
}

/**
 * I confini del campo data rispecchiano quelli del server
 * (lib/voli/normalizza.ts): fino a domani, indietro di 6 anni.
 * Calcolati al caricamento del modulo: il giudizio vero resta al server,
 * qui servono solo a non far scegliere date assurde dal calendario.
 */
function confiniData(): { minData: string; maxData: string } {
  const giorno = 24 * 60 * 60 * 1000;
  const max = new Date(Date.now() + giorno).toISOString().slice(0, 10);
  const min = new Date();
  min.setUTCFullYear(min.getUTCFullYear() - 6);
  return { minData: min.toISOString().slice(0, 10), maxData: max };
}
const { minData, maxData } = confiniData();

export default function HeroCheck() {
  const router = useRouter();
  const [volo, setVolo] = useState("");
  const [data, setData] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  /** Verdetto arrivato ma non salvato (id nullo): si mostra qui, con onestà. */
  const [avviso, setAvviso] = useState<{ testo: string; demo: boolean } | null>(null);
  const [fase, setFase] = useState<Fase>("campo");
  const [passo, setPasso] = useState(0);
  const inCorso = useRef(false);

  const [titoloPrima, titoloCorsivo] = spezzaTitolo(HERO.titolo, "negli ultimi");
  const [notaAperta, setNotaAperta] = useState<"importo" | "finestra" | null>(null);

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inCorso.current) return;

    // Validazione locale: i casi banali non meritano un giro di rete.
    if (!volo.trim()) {
      setErrore(HERO.form.errori.voloMancante);
      return;
    }
    if (!data) {
      setErrore(HERO.form.errori.dataMancante);
      return;
    }

    inCorso.current = true;
    setErrore(null);
    setAvviso(null);
    setFase("teatro");
    setPasso(0); // passo 1 acceso: la richiesta è DAVVERO in volo

    try {
      const r = await fetch("/api/verifica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volo: volo.trim(), data }),
      });
      const dati = await r.json().catch(() => null);

      if (!r.ok || !dati?.ok) {
        setFase("campo");
        setErrore(
          typeof dati?.errore === "string" ? dati.errore : COPY.comune.erroreGenerico,
        );
        inCorso.current = false;
        return;
      }

      /* Verdetto arrivato ma senza id salvato (l'archivio non c'era):
         se il dato è dimostrativo la pagina risultato sa ricalcolarlo da
         sola con l'id "demo-VOLO-DATA", senza database. Se invece era un
         dato vero, non c'è una pagina da aprire: il verdetto si mostra
         qui, con onestà, invece di un errore finto. */
      const destinazione = dati.id
        ? `/verifica/${dati.id}`
        : dati.demo === true
          ? `/verifica/demo-${canonico(volo)}-${data}`
          : null;

      if (!destinazione) {
        setFase("campo");
        setAvviso({
          testo: typeof dati.motivo === "string" ? dati.motivo : COPY.comune.erroreGenerico,
          demo: dati.demo === true,
        });
        inCorso.current = false;
        return;
      }

      /* La risposta c'è: confronto orari e calcolo sono stati fatti davvero.
         Si mostrano completati in sequenza, il tempo di leggerli, poi si va
         al risultato. Nessun passo si accende prima del lavoro che racconta. */
      await attesa(700);
      setPasso(1);
      await attesa(700);
      setPasso(2);
      await attesa(700);
      router.push(destinazione);
    } catch {
      setFase("campo");
      setErrore(COPY.comune.erroreGenerico);
      inCorso.current = false;
    }
  }

  return (
    <section
      id="controllo"
      className="cielo relative -mt-[72px] overflow-hidden px-5 pb-16 pt-[124px] sm:-mt-[84px] sm:px-8 sm:pb-20 sm:pt-[164px]"
    >
      {/* Il bordo che pulsa: definito qui perché vive solo in questo campo.
          Solo opacity e transform, si ferma al focus e con reduced-motion. */}
      <style>{`
        .hc-pulsa { position: relative; }
        .hc-pulsa::before {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 1.9rem;
          border: 2px solid var(--color-verde);
          opacity: 0;
          pointer-events: none;
          animation: hc-pulsa 2.6s cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }
        .hc-pulsa:focus-within::before { animation: none; opacity: 0; }
        @keyframes hc-pulsa {
          0% { opacity: 0.55; transform: scale(0.995); }
          70% { opacity: 0; transform: scale(1.012); }
          100% { opacity: 0; transform: scale(1.012); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hc-pulsa::before { animation: none; opacity: 0.35; transform: none; }
        }
      `}</style>

      <SfondoColonne />
      <span className="alone" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl text-center">
        <Anima ritardo={0.04}>
          <span className="vetro inline-flex items-center gap-2 rounded-pillola px-4 py-1.5 text-[13px] font-medium text-inchiostro">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-verde" />
            {HERO.occhiello}
          </span>
        </Anima>

        <Anima ritardo={0.12}>
          <h1 className="luce-testo mt-6 text-[clamp(2.35rem,7.6vw,4.6rem)] leading-[0.98]">
            {titoloPrima}
            {titoloCorsivo && (
              <>
                <br />
                <span className="corsivo text-verde-scuro">{titoloCorsivo}</span>
              </>
            )}
          </h1>
        </Anima>

        <Anima ritardo={0.2}>
          <p className="mx-auto mt-6 max-w-[32rem] text-[16px] leading-relaxed text-fumo sm:text-[17.5px]">
            {HERO.sottotitolo}
          </p>
          {/* Ogni numero è apribile: il 600€ e i 5 anni si spiegano qui. */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[13px]">
            {(
              [
                ["importo", HERO.apriImporto],
                ["finestra", HERO.apriFinestra],
              ] as const
            ).map(([chiave, testo]) => (
              <button
                key={chiave}
                type="button"
                aria-expanded={notaAperta === chiave}
                onClick={() => setNotaAperta(notaAperta === chiave ? null : chiave)}
                className={`rounded-pillola px-2 py-0.5 font-medium underline decoration-dotted underline-offset-4 transition-colors ${
                  notaAperta === chiave ? "text-verde-scuro" : "text-fumo hover:text-verde-scuro"
                }`}
              >
                {testo}
              </button>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {notaAperta && (
              <motion.div
                key={notaAperta}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: CURVA }}
                className="mx-auto mt-3 max-w-lg"
              >
                <p className="vetro rounded-2xl px-5 py-4 text-left text-[13.5px] leading-relaxed text-inchiostro/80">
                  {notaAperta === "importo" ? HERO.notaImporto : HERO.notaFinestra}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Anima>

        {/* IL FORM: il protagonista della pagina. */}
        <Anima ritardo={0.3}>
          <div className="hc-pulsa mx-auto mt-9 max-w-2xl">
            <div className="vetro rounded-[1.75rem] p-5 text-left sm:p-7">
              {fase === "campo" ? (
                <form onSubmit={invia} noValidate>
                  <div className="grid gap-4 sm:grid-cols-[1.15fr_1fr]">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="hc-volo"
                        className="text-[13px] font-medium text-inchiostro/70"
                      >
                        {HERO.form.volo.etichetta}
                      </label>
                      <input
                        id="hc-volo"
                        name="volo"
                        type="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        value={volo}
                        onChange={(e) => setVolo(e.target.value)}
                        placeholder={HERO.form.volo.segnaposto}
                        className="h-14 w-full min-w-0 rounded-bottone border border-bordo bg-white px-4 font-display text-[19px] font-medium tracking-[-0.01em] text-inchiostro outline-none transition-all duration-200 placeholder:font-sans placeholder:text-[16px] placeholder:font-normal placeholder:text-fumo-2 focus:border-verde/60 focus:ring-4 focus:ring-verde/12"
                      />
                      <p className="text-[12px] leading-snug text-fumo">
                        {HERO.form.volo.aiuto}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="hc-data"
                        className="text-[13px] font-medium text-inchiostro/70"
                      >
                        {HERO.form.data.etichetta}
                      </label>
                      <input
                        id="hc-data"
                        name="data"
                        type="date"
                        min={minData}
                        max={maxData}
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="h-14 w-full min-w-0 rounded-bottone border border-bordo bg-white px-4 text-[16px] text-inchiostro outline-none transition-all duration-200 focus:border-verde/60 focus:ring-4 focus:ring-verde/12"
                      />
                      <p className="text-[12px] leading-snug text-fumo">
                        {HERO.form.data.aiuto}
                      </p>
                    </div>
                  </div>

                  {errore && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-[14px] font-medium text-red-600"
                    >
                      {errore}
                    </motion.p>
                  )}

                  {avviso && (
                    <motion.div
                      role="status"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-xl border border-bordo bg-nebbia p-4"
                    >
                      {avviso.demo && (
                        <span className="mb-2 inline-block rounded-pillola border border-bordo bg-white px-2.5 py-0.5 text-[11px] font-medium text-fumo">
                          {COPY.comune.demo}
                        </span>
                      )}
                      <p className="text-[13.5px] leading-relaxed text-inchiostro/85">
                        {avviso.testo}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="riflesso mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-bottone bg-verde text-[16.5px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(6,122,70,.75),0_2px_0_0_rgba(255,255,255,.22)_inset] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro hover:shadow-[0_18px_40px_-14px_rgba(6,122,70,.85),0_2px_0_0_rgba(255,255,255,.22)_inset]"
                  >
                    {HERO.form.bottone}
                    <span aria-hidden="true">→</span>
                  </button>

                  <p className="mt-3 text-center text-[13px] text-fumo">
                    {HERO.form.rassicurazione}
                  </p>
                </form>
              ) : (
                /* IL TEATRO ONESTO: tre passi legati allo stato vero. */
                <div aria-live="polite" className="py-1">
                  <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-fumo-2">
                    {TEATRO.titolo}
                  </p>
                  <ol className="mt-4 space-y-3.5">
                    {TEATRO.passi.map((testo, i) => {
                      const fatto = i < passo;
                      const attivo = i === passo;
                      return (
                        <li key={testo} className="flex items-center gap-3.5">
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                              fatto
                                ? "border-verde bg-verde text-white"
                                : attivo
                                  ? "border-verde/50 bg-white text-verde"
                                  : "border-bordo bg-white text-fumo-2"
                            }`}
                          >
                            {fatto ? (
                              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                                <path
                                  d="m3.5 8.4 2.8 2.8 6-6.4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : attivo ? (
                              <motion.span
                                className="h-2.5 w-2.5 rounded-full bg-verde"
                                animate={{ opacity: [1, 0.25, 1], scale: [1, 0.8, 1] }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                              />
                            ) : (
                              <span className="h-2.5 w-2.5 rounded-full bg-bordo" />
                            )}
                          </span>
                          <span
                            className={`text-[15.5px] transition-colors duration-300 ${
                              fatto || attivo ? "font-medium text-inchiostro" : "text-fumo-2"
                            }`}
                          >
                            {testo}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="mt-4 border-t border-bordo/70 pt-3 text-[12.5px] leading-relaxed text-fumo">
                    {TEATRO.nota}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Anima>

        <Anima ritardo={0.4}>
          <ul className="mx-auto mt-7 flex max-w-2xl flex-col items-center justify-center gap-x-7 gap-y-2 text-[13.5px] text-fumo sm:flex-row">
            {HERO.puntiFiducia.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <circle cx="8" cy="8" r="7.2" fill="var(--color-menta)" />
                  <path
                    d="m5 8.2 2 2 4-4.2"
                    fill="none"
                    stroke="var(--color-verde-notte)"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </Anima>
      </div>
    </section>
  );
}
