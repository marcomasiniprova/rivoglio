"use client";

import { useState, type FormEvent } from "react";

type Stato = "fermo" | "invio" | "fatto" | "errore";

export default function Iscriviti() {
  const [email, setEmail] = useState("");
  const [comune, setComune] = useState("");
  const [stato, setStato] = useState<Stato>("fermo");
  const [messaggio, setMessaggio] = useState("");

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStato("invio");
    setMessaggio("");
    try {
      const r = await fetch("/api/iscriviti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, comune }),
      });
      const dati = await r.json();
      if (!r.ok) {
        setStato("errore");
        setMessaggio(dati?.errore ?? "Qualcosa è andato storto. Riprova.");
        return;
      }
      setStato("fatto");
    } catch {
      setStato("errore");
      setMessaggio("Non ho connessione. Riprova fra un attimo.");
    }
  }

  return (
    <section id="iscriviti" className="relative px-5 pb-28 pt-8 sm:px-8">
      <div className="grana relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-inchiostro px-6 py-14 text-center text-sabbia sm:px-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full opacity-30 blur-[90px]"
          style={{ background: "var(--color-menta)" }}
        />

        <div className="relative">
          <h2 className="font-display text-[clamp(2.1rem,5.5vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.03em]">
            Quest&apos;anno viaggi anche tu.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-sabbia/65">
            Lascia la tua email: ti avviso appena apro le iscrizioni, e i primi 3 alert
            te li regalo.
          </p>

          {stato === "fatto" ? (
            <div className="mx-auto mt-9 max-w-md rounded-2xl border border-menta/30 bg-menta/10 p-7">
              <p className="font-display text-[24px] font-semibold text-menta">
                Ci sei.
              </p>
              <p className="mt-2 text-[15.5px] leading-relaxed text-sabbia/70">
                Ti scrivo a <span className="text-sabbia">{email}</span> appena si parte.
                Nel frattempo non ti mando niente: te lo prometto.
              </p>
            </div>
          ) : (
            <form onSubmit={invia} className="mx-auto mt-9 max-w-lg">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="la-tua@email.it"
                  aria-label="La tua email"
                  className="min-w-0 flex-1 rounded-pillola border border-sabbia/20 bg-sabbia/10 px-5 py-4 text-[16px] text-sabbia placeholder:text-sabbia/35 outline-none transition-colors focus:border-menta/60 focus:bg-sabbia/15"
                />
                <input
                  type="text"
                  value={comune}
                  onChange={(e) => setComune(e.target.value)}
                  placeholder="Da dove parti?"
                  aria-label="Il tuo comune di partenza"
                  className="rounded-pillola border border-sabbia/20 bg-sabbia/10 px-5 py-4 text-[16px] text-sabbia placeholder:text-sabbia/35 outline-none transition-colors focus:border-menta/60 focus:bg-sabbia/15 sm:w-[172px]"
                />
              </div>

              <button
                type="submit"
                disabled={stato === "invio"}
                className="mt-2.5 w-full rounded-pillola bg-menta py-4 text-[16px] font-semibold text-mare-scuro transition-all hover:bg-menta-2 disabled:opacity-55"
              >
                {stato === "invio" ? "Un attimo…" : "Avvisami quando si parte"}
              </button>

              {stato === "errore" && (
                <p className="mt-3 text-[14px] text-sole">{messaggio}</p>
              )}

              <p className="mt-4 text-[13px] leading-relaxed text-sabbia/40">
                Il comune serve solo a capire in che zone servono più offerte. Niente
                spam, niente email inutili, cancellazione con un clic.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
