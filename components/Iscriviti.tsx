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
    <section id="iscriviti" className="px-5 pb-28 pt-4 sm:px-8">
      <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-[2rem] bg-verde-notte px-6 py-16 text-center text-white sm:px-14 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
          style={{ background: "var(--color-menta)" }}
        />

        <div className="relative">
          <h2 className="text-[clamp(2.1rem,5vw,3.4rem)]">
            Quest&apos;anno viaggi anche tu.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[16.5px] leading-relaxed text-white/65">
            Lascia la tua email: ti avviso appena apro le iscrizioni, e i primi 3 alert te
            li regalo.
          </p>

          {stato === "fatto" ? (
            <div className="mx-auto mt-9 max-w-md rounded-2xl border border-menta/30 bg-menta/10 p-7">
              <p className="font-display text-[26px] font-medium text-menta">Ci sei.</p>
              <p className="mt-2 text-[15.5px] leading-relaxed text-white/70">
                Ti scrivo a <span className="text-white">{email}</span> appena si parte. Nel
                frattempo non ti mando niente: te lo prometto.
              </p>
            </div>
          ) : (
            /* I campi hanno la loro etichetta sopra e stanno su due righe
               vere. Prima erano schiacciati uno accanto all'altro dentro
               una riga sola: sul telefono diventavano illeggibili e su
               desktop il secondo campo si stringeva a fisarmonica. */
            <form onSubmit={invia} className="mx-auto mt-10 max-w-lg text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="iscriviti-email"
                    className="text-[13px] font-medium text-white/55"
                  >
                    La tua email
                  </label>
                  <input
                    id="iscriviti-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="la-tua@email.it"
                    className="h-13 w-full min-w-0 rounded-bottone border border-white/15 bg-white/8 px-4 text-[16px] text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-menta/60 focus:bg-white/14 focus:ring-4 focus:ring-menta/12"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="iscriviti-comune"
                    className="text-[13px] font-medium text-white/55"
                  >
                    {/* "Da dove parti" collide col costruttore più su nella
                        pagina: due campi con la stessa etichetta confondono
                        i lettori di schermo prima ancora delle prove. */}
                    Il tuo comune di partenza
                  </label>
                  <input
                    id="iscriviti-comune"
                    type="text"
                    value={comune}
                    onChange={(e) => setComune(e.target.value)}
                    placeholder="Bologna"
                    className="h-13 w-full min-w-0 rounded-bottone border border-white/15 bg-white/8 px-4 text-[16px] text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-menta/60 focus:bg-white/14 focus:ring-4 focus:ring-menta/12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={stato === "invio"}
                className="riflesso mt-5 h-13 w-full rounded-bottone bg-menta text-[16px] font-semibold text-verde-notte shadow-[0_14px_32px_-14px_rgba(127,232,174,.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white disabled:pointer-events-none disabled:opacity-55"
              >
                {stato === "invio" ? "Un attimo…" : "Avvisami quando si parte"}
              </button>

              {stato === "errore" && (
                <p role="alert" className="mt-3 text-[14px] text-sole">
                  {messaggio}
                </p>
              )}

              <p className="mt-5 text-center text-[13px] leading-relaxed text-white/40">
                Il comune serve solo a capire in che zone servono più offerte. Niente spam,
                niente email inutili, cancellazione con un clic.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
