"use client";

import { useEffect, useState, type FormEvent } from "react";
import { COPY } from "@/lib/copy";
import { monumentoDi } from "./Monumenti";

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

/* ---- la striscia coi dati veri (#25): indice ritardi per aeroporto ---- */

type Ritardo = {
  iata: string;
  nome: string;
  indice: number | null;
  medianaMinuti: number | null;
  arrivi: number | null;
  cancellati: number | null;
  rilevatoIl: string;
};

const riempi = (modello: string, valori: Record<string, string>) =>
  modello.replace(/\{(\w+)\}/g, (tutto, chiave) => valori[chiave] ?? tutto);

/** L'indice AeroDataBox va da 0 a 5: sotto 1 è calmo, oltre 2.5 è brutto. */
const coloreIndice = (indice: number) =>
  indice < 1 ? "text-menta" : indice < 2.5 ? "text-sole" : "text-red-400";

/** Lo stesso semaforo, per l'alone dietro al monumento. */
const aloneIndice = (indice: number) =>
  indice < 1 ? "bg-menta/25" : indice < 2.5 ? "bg-sole/25" : "bg-red-400/25";

/** In parole: il numero da solo non dice se 2,2 è tanto o poco. */
const giudizio = (indice: number) =>
  indice < 1
    ? SEZIONE.ritardi.giudizi.calmo
    : indice < 2.5
      ? SEZIONE.ritardi.giudizi.qualcheRitardo
      : SEZIONE.ritardi.giudizi.giornataStorta;

/** "Roma Fiumicino" → città in grande, scalo sotto: così non si tronca. */
function spezzaNome(nome: string): [string, string] {
  const spazio = nome.indexOf(" ");
  return spazio < 0 ? [nome, ""] : [nome.slice(0, spazio), nome.slice(spazio + 1)];
}

function StrisciaRitardi() {
  const [righe, setRighe] = useState<Ritardo[]>([]);

  useEffect(() => {
    let vivo = true;
    fetch("/api/osservatorio")
      .then((r) => (r.ok ? r.json() : null))
      .then((dati) => {
        if (vivo && Array.isArray(dati?.aeroporti)) setRighe(dati.aeroporti);
      })
      .catch(() => {
        /* niente striscia: la sezione vive lo stesso */
      });
    return () => {
      vivo = false;
    };
  }, []);

  const conIndice = righe.filter((r) => r.indice !== null);
  if (conIndice.length === 0) return null;

  const rilevatoIl = new Date(conIndice[0].rilevatoIl).toLocaleString("it-IT", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <p className="text-center text-[12.5px] font-medium uppercase tracking-[0.18em] text-menta/70">
        {SEZIONE.ritardi.titolo}
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {conIndice.map((r) => {
          const indice = r.indice ?? 0;
          const Monumento = monumentoDi(r.iata);
          const [citta, scalo] = spezzaNome(r.nome);
          /* Le tacche piene: l'indice si legge senza leggere il numero. */
          const tacche = Math.max(1, Math.round(indice));
          return (
            <li
              key={r.iata}
              /* fondo pieno, non trasparente: sotto passa l'alone verde
                 della sezione e il testo chiaro ci spariva dentro */
              className="relative overflow-hidden rounded-[1.3rem] border border-white/12 bg-verde-notte/85 px-4 pb-4 pt-5 text-center backdrop-blur-sm"
            >
              {/* il monumento sul suo alone, del colore della giornata */}
              <div className="relative mx-auto grid h-[62px] w-[62px] place-items-center">
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-full blur-[14px] ${aloneIndice(indice)}`}
                />
                <Monumento className={`relative h-[54px] w-[54px] ${coloreIndice(indice)}`} />
              </div>

              <p className="mt-3 font-display text-[15px] font-medium leading-tight tracking-[-0.02em] text-white">
                {citta}
              </p>
              {scalo && <p className="text-[11.5px] leading-tight text-white/45">{scalo}</p>}

              <p
                className={`numeri mt-2.5 font-display text-[30px] font-medium leading-none tracking-[-0.03em] ${coloreIndice(indice)}`}
              >
                {indice.toLocaleString("it-IT", { maximumFractionDigits: 1 })}
                <span className="ml-1 align-middle font-sans text-[10.5px] font-medium uppercase tracking-[0.08em] text-white/40">
                  / 5
                </span>
              </p>

              <div aria-hidden="true" className="mt-2.5 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((t) => (
                  <span
                    key={t}
                    className={`h-1 w-[9px] rounded-full ${
                      t <= tacche ? `${coloreIndice(indice)} bg-current` : "bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <p className="mt-2.5 text-[11.5px] font-medium leading-tight text-white/70">
                {giudizio(indice)}
              </p>
              <p className="numeri mt-1 text-[11px] leading-tight text-white/45">
                {r.medianaMinuti !== null
                  ? riempi(SEZIONE.ritardi.medianaTemplate, { minuti: String(r.medianaMinuti) })
                  : SEZIONE.ritardi.indiceEtichetta}
                {r.cancellati !== null && r.cancellati > 0
                  ? ` · ${riempi(SEZIONE.ritardi.cancellatiTemplate, { n: String(r.cancellati) })}`
                  : ""}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-center text-[12px] leading-relaxed text-white/55">
        {SEZIONE.ritardi.nota} {riempi(SEZIONE.ritardi.rilevatoTemplate, { quando: rilevatoIl })}.
      </p>
    </div>
  );
}

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
          /* L'alone stava a opacità 25 e su telefono copriva la metà
             bassa della sezione: il testo chiaro ci diventava invisibile.
             Ora è tenue e non arriva alle card, che hanno comunque un
             fondo pieno per non dipendere da lui. */
          className="pointer-events-none absolute -bottom-72 left-1/2 h-[240px] w-[440px] -translate-x-1/2 rounded-full opacity-[0.10] blur-[120px] sm:h-[320px] sm:w-[640px]"
          style={{
            background: "var(--color-menta)",
            animation: "respiro 12s ease-in-out infinite",
          }}
        />

        <div className="relative">
          <span className="inline-block rounded-pillola bg-white/10 px-3.5 py-1.5 text-[12.5px] font-medium text-menta">
            {SEZIONE.occhiello}
          </span>
          <h2 className="luce-testo-chiaro mt-5 text-[clamp(2.1rem,4.8vw,3.35rem)] leading-[1.04]">
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
                  className="h-13 w-full min-w-0 sm:flex-1 rounded-bottone border border-white/15 bg-white/8 px-4 text-[16px] text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-menta/60 focus:bg-white/14 focus:ring-4 focus:ring-menta/12"
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

          {/* I dati veri sotto la promessa: l'indice ritardi di oggi (#25). */}
          <StrisciaRitardi />
        </div>
      </div>
    </section>
  );
}
