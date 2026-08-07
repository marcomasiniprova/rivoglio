"use client";

import { useState, type FormEvent } from "react";
import { COPY } from "@/lib/copy";

/**
 * L'Osservatorio dei Disservizi: la newsletter settimanale generata dai
 * dati dei check (SPEC §7). È l'erede della lista d'attesa: stessa API
 * /api/iscriviti, stesso fondo scuro, ma qui si vende una cosa che esiste
 * già: i 10 voli più in ritardo della settimana.
 */
const SEZIONE = COPY.osservatorio;

type Stato = "fermo" | "invio" | "fatto" | "errore";

/* Il titolo viene da COPY; qui si decide solo dove cade il corsivo. */
const stacco = SEZIONE.titolo.indexOf(" dei ");
const titoloPrima = stacco > 0 ? SEZIONE.titolo.slice(0, stacco) : SEZIONE.titolo;
const titoloCorsivo = stacco > 0 ? SEZIONE.titolo.slice(stacco + 1) : "";

/* Anche la conferma viene da COPY: la prima frase fa da titolo. */
const punto = SEZIONE.conferma.indexOf(". ") + 1;
const confermaTitolo = SEZIONE.conferma.slice(0, punto);
const confermaTesto = SEZIONE.conferma.slice(punto + 1);

export default function Osservatorio() {
  const [email, setEmail] = useState("");
  const [stato, setStato] = useState<Stato>("fermo");
  const [messaggio, setMessaggio] = useState("");

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stato === "invio") return;
    setStato("invio");
    setMessaggio("");
    try {
      const r = await fetch("/api/iscriviti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const dati = await r.json().catch(() => null);
      if (!r.ok) {
        setStato("errore");
        setMessaggio(
          typeof dati?.errore === "string" ? dati.errore : COPY.comune.erroreGenerico,
        );
        return;
      }
      setStato("fatto");
    } catch {
      setStato("errore");
      setMessaggio(COPY.comune.erroreGenerico);
    }
  }

  return (
    <section id="osservatorio" className="scroll-mt-24 px-5 pb-24 pt-4 sm:px-8 sm:pb-28">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[2rem] bg-verde-notte px-6 py-16 text-center text-white sm:px-14 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
          style={{
            background: "var(--color-menta)",
            animation: "respiro 12s ease-in-out infinite",
          }}
        />

        <div className="relative">
          <span className="inline-block rounded-pillola bg-white/10 px-3.5 py-1.5 text-[12.5px] font-medium text-menta">
            {SEZIONE.occhiello}
          </span>
          <h2 className="luce-testo-chiaro mt-5 text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.04]">
            {titoloPrima}
            {titoloCorsivo && (
              <>
                <br />
                <span className="corsivo text-menta">{titoloCorsivo}</span>
              </>
            )}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-white/65">
            {SEZIONE.testo}
          </p>

          {stato === "fatto" ? (
            <div className="mx-auto mt-9 max-w-md rounded-2xl border border-menta/30 bg-menta/10 p-7">
              <p className="font-display text-[26px] font-medium text-menta">
                {confermaTitolo}
              </p>
              <p className="mt-2 text-[15.5px] leading-relaxed text-white/70">
                {confermaTesto}
              </p>
            </div>
          ) : (
            <form onSubmit={invia} className="mx-auto mt-9 max-w-md text-left">
              <label
                htmlFor="osservatorio-email"
                className="text-[13px] font-medium text-white/55"
              >
                {SEZIONE.campoEmail.etichetta}
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="osservatorio-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={SEZIONE.campoEmail.segnaposto}
                  className="h-13 w-full min-w-0 flex-1 rounded-bottone border border-white/15 bg-white/8 px-4 text-[16px] text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-menta/60 focus:bg-white/14 focus:ring-4 focus:ring-menta/12"
                />
                <button
                  type="submit"
                  disabled={stato === "invio"}
                  className="riflesso h-13 shrink-0 rounded-bottone bg-menta px-7 text-[15.5px] font-semibold text-verde-notte shadow-[0_14px_32px_-14px_rgba(127,232,174,.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-55"
                >
                  {stato === "invio" ? COPY.comune.caricamento : SEZIONE.bottone}
                </button>
              </div>

              {stato === "errore" && (
                <p role="alert" className="mt-3 text-[14px] text-sole">
                  {messaggio}
                </p>
              )}

              <p className="mt-4 text-center text-[13px] text-white/40">{SEZIONE.nota}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
