"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { COPY } from "@/lib/copy";

/**
 * Il check dentro la web app, per chi arriva senza account: stesso
 * contratto dell'hero (POST /api/verifica), senza il teatro dei passi.
 * Valerio l'8/08: la web app deve essere usabile da chiunque, quante
 * analisi vuole, senza rimbalzi verso la home.
 */
const FORM = COPY.hero.form;

/** Come in HeroCheck: la forma canonica del volo per il link demo. */
function canonico(grezzo: string): string {
  const pezzi = grezzo.trim().match(/^([A-Za-z0-9]{2})[\s-]*0*([0-9]{1,4})\s*([A-Za-z])?$/);
  if (pezzi) return (pezzi[1] + pezzi[2] + (pezzi[3] ?? "")).toUpperCase();
  return grezzo.replace(/[\s-]+/g, "").toUpperCase();
}

/** Confini del campo data, come l'hero: fino a domani, indietro di 6 anni. */
function confiniData(): { minData: string; maxData: string } {
  const giorno = 24 * 60 * 60 * 1000;
  const max = new Date(Date.now() + giorno).toISOString().slice(0, 10);
  const min = new Date();
  min.setUTCFullYear(min.getUTCFullYear() - 6);
  return { minData: min.toISOString().slice(0, 10), maxData: max };
}
const { minData, maxData } = confiniData();

export default function CheckRapido() {
  const router = useRouter();
  const [volo, setVolo] = useState("");
  const [data, setData] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [invio, setInvio] = useState(false);
  const inCorso = useRef(false);

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inCorso.current) return;
    if (!volo.trim()) {
      setErrore(FORM.errori.voloMancante);
      return;
    }
    if (!data) {
      setErrore(FORM.errori.dataMancante);
      return;
    }
    inCorso.current = true;
    setInvio(true);
    setErrore(null);
    try {
      const r = await fetch("/api/verifica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volo: volo.trim(), data }),
      });
      const dati = await r.json().catch(() => null);
      if (!r.ok || !dati?.ok) {
        setErrore(typeof dati?.errore === "string" ? dati.errore : COPY.comune.erroreGenerico);
        return;
      }
      const destinazione = dati.id
        ? `/verifica/${dati.id}`
        : dati.demo === true
          ? `/verifica/demo-${canonico(volo)}-${data}`
          : null;
      if (!destinazione) {
        setErrore(typeof dati.motivo === "string" ? dati.motivo : COPY.comune.erroreGenerico);
        return;
      }
      /* il verdetto sa che la scansione c'è già stata qui */
      sessionStorage.setItem("rivoglio-scan-fatto", "1");
      router.push(destinazione);
    } catch {
      setErrore(COPY.comune.erroreGenerico);
    } finally {
      inCorso.current = false;
      setInvio(false);
    }
  }

  return (
    <form
      onSubmit={invia}
      noValidate
      className="rounded-3xl border border-bordo bg-white p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="app-volo" className="block text-[14px] font-medium text-inchiostro/75">
            {FORM.volo.etichetta}
          </label>
          <input
            id="app-volo"
            type="text"
            value={volo}
            onChange={(e) => setVolo(e.target.value)}
            placeholder={FORM.volo.segnaposto}
            autoComplete="off"
            className="mt-2 block h-13 w-full rounded-bottone border border-bordo bg-white px-4 text-[16px] outline-none transition-all duration-200 placeholder:text-fumo-2 focus:border-verde/60 focus:ring-4 focus:ring-verde/10"
          />
        </div>
        <div>
          <label htmlFor="app-data" className="block text-[14px] font-medium text-inchiostro/75">
            {FORM.data.etichetta}
          </label>
          <input
            id="app-data"
            type="date"
            value={data}
            min={minData}
            max={maxData}
            onChange={(e) => setData(e.target.value)}
            // Come nell'hero: il calendario si apre toccando tutto il campo.
            onClick={(e) => {
              try {
                e.currentTarget.showPicker();
              } catch {
                /* niente: il browser fa da sé */
              }
            }}
            className="mt-2 block h-13 w-full cursor-pointer appearance-none rounded-bottone border border-bordo bg-white px-4 text-[16px] outline-none transition-all duration-200 focus:border-verde/60 focus:ring-4 focus:ring-verde/10"
          />
        </div>
        <button
          type="submit"
          disabled={invio}
          className="riflesso h-13 shrink-0 rounded-bottone bg-verde px-7 text-[15.5px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(6,122,70,.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-55"
        >
          {invio ? COPY.comune.caricamento : FORM.bottone}
        </button>
      </div>
      {errore && (
        <p role="alert" className="mt-3 text-[14px] font-medium text-red-600">
          {errore}
        </p>
      )}
      <p className="mt-4 text-[14.5px] text-fumo">{FORM.rassicurazione}</p>
    </form>
  );
}
