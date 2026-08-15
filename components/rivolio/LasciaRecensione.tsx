"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { seSiPaga } from "@/lib/check/ingresso";
import { CHIAVE_BUONO_LOCALE } from "@/lib/check/chiave-buono";
import type { EventoRecensito } from "@/lib/recensioni/recensioni";

/**
 * LASCIA UNA RECENSIONE, senza frizione (Valerio, 15/08).
 *
 * Compare dopo un evento vero (un check, un verdetto, una pratica). Chiede
 * il minimo: le stelle e due parole sul perché, più il nome che vuoi far
 * vedere (facoltativo). Appena la mandi sblocchi un'analisi gratis, e una
 * sola: lo stesso evento non si recensisce due volte.
 *
 * La recensione NON compare subito da nessuna parte: la vede solo l'admin,
 * e finisce in landing solo se lui la approva. Qui dentro non c'è nessuna
 * regola da falsificare: stelle e testo vanno al server, che decide.
 */

const CURVA = [0.16, 1, 0.3, 1] as const;

/* La ricompensa segue l'interruttore del muro (seSiPaga): col muro spento
   i controlli sono già tutti gratis, quindi non si promette niente come
   una novità, si ringrazia e basta. Col muro acceso il buono vale davvero
   e lo si dice. Onesti in tutti e due i casi. */
const GRAZIE = seSiPaga(
  "Grazie. Hai sbloccato un'analisi gratis: il tuo prossimo controllo è offerto.",
  "Grazie. La tua recensione ci aiuta a farci conoscere.",
);

/* Vero se il muro è acceso: serve per non promettere l'analisi gratis nel
   raro caso in cui il server non sia riuscito a emettere il buono. */
const MURO_ACCESO = seSiPaga(true, false);

function Stella({ piena, ...props }: { piena: boolean } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="tocco-comodo -m-0.5 p-0.5 transition-transform hover:scale-110 active:scale-95"
      {...props}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
        <path
          d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.4l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z"
          fill={piena ? "var(--color-sole)" : "none"}
          stroke={piena ? "var(--color-sole)" : "var(--color-bordo)"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function LasciaRecensione({
  eventoTipo,
  eventoRif,
  titolo = "Com'è andata? Lascia una recensione",
  sottotitolo = seSiPaga(
    "Due parole e le stelle. In cambio sblocchi un'analisi gratis.",
    "Due parole e le stelle. Ci aiuti a farci conoscere.",
  ),
}: {
  eventoTipo: EventoRecensito;
  eventoRif: string;
  titolo?: string;
  sottotitolo?: string;
}) {
  const [stelle, setStelle] = useState(0);
  const [sopra, setSopra] = useState(0); // per l'effetto passaggio del dito
  const [motivo, setMotivo] = useState("");
  const [nome, setNome] = useState("");
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "gia" | "errore">("fermo");
  const [sbloccato, setSbloccato] = useState(false);
  const [errore, setErrore] = useState("");

  const pronto = stelle >= 1 && motivo.trim().length >= 3;

  async function invia(e: FormEvent) {
    e.preventDefault();
    if (!pronto || stato === "invio") return;
    setStato("invio");
    setErrore("");
    try {
      const r = await fetch("/api/recensioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stelle, motivo, nome: nome.trim() || null, eventoTipo, eventoRif }),
      });
      const d = (await r.json().catch(() => null)) as {
        ok?: boolean;
        errore?: string;
        giaFatta?: boolean;
        sbloccata?: boolean;
        buonoId?: string | null;
      } | null;
      if (!r.ok || !d?.ok) {
        setErrore(d?.errore ?? "Non sono riuscito a salvare. Riprova.");
        setStato("errore");
        return;
      }
      /* Il buono DI RISERVA nel browser: se il cookie non arriverà al
         check, l'id parte da qui e l'analisi gratis vale lo stesso. */
      if (!d.giaFatta && d.buonoId && typeof window !== "undefined") {
        try {
          localStorage.setItem(CHIAVE_BUONO_LOCALE, d.buonoId);
        } catch {
          // localStorage negato (navigazione privata stretta): resta il cookie.
        }
      }
      setSbloccato(Boolean(d.sbloccata));
      setStato(d.giaFatta ? "gia" : "fatto");
    } catch {
      setErrore("Non sono riuscito a salvare. Riprova.");
      setStato("errore");
    }
  }

  if (stato === "fatto" || stato === "gia") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: CURVA }}
        className="rounded-2xl border border-verde/30 bg-menta-tenue px-6 py-5"
      >
        <p className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-verde-notte">
          <span
            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verde"
            aria-hidden="true"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3">
              <path
                d="M2.5 6.2 5 8.6l4.5-5.2"
                fill="none"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {stato === "gia"
            ? seSiPaga(
                "Questa l'avevi già recensita: l'analisi gratis è già tua, non se ne aggiunge un'altra.",
                "Questa l'avevi già recensita: grazie di nuovo.",
              )
            : MURO_ACCESO && !sbloccato
              ? "Grazie, la tua recensione è salvata. L'analisi gratis non è partita: riprova più tardi."
              : GRAZIE}
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={invia}
      className="rounded-2xl border border-bordo bg-white px-6 py-6"
      aria-label="Lascia una recensione"
    >
      <h3 className="font-display text-[19px] font-medium leading-tight tracking-[-0.02em] text-inchiostro">
        {titolo}
      </h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-fumo">{sottotitolo}</p>

      <div
        className="mt-4 flex gap-1"
        onMouseLeave={() => setSopra(0)}
        role="radiogroup"
        aria-label="Stelle"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Stella
            key={n}
            piena={n <= (sopra || stelle)}
            aria-label={`${n} stelle`}
            aria-checked={n === stelle}
            role="radio"
            onMouseEnter={() => setSopra(n)}
            onClick={() => setStelle(n)}
          />
        ))}
      </div>

      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        rows={3}
        maxLength={1500}
        placeholder="Cosa ti è piaciuto? Racconta in due righe."
        className="mt-4 w-full resize-none rounded-xl border border-bordo bg-nebbia px-3.5 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-fumo-2 focus:border-verde/45 focus:bg-white"
      />

      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        maxLength={40}
        placeholder="Il tuo nome (facoltativo, per mostrarlo)"
        /* 16px: sotto quella misura iOS ingrandisce la pagina da solo. */
        className="mt-3 h-11 w-full rounded-xl border border-bordo bg-nebbia px-3.5 text-[16px] outline-none transition-colors placeholder:text-fumo-2 focus:border-verde/45 focus:bg-white"
      />

      {stato === "errore" && (
        <p role="alert" className="mt-3 text-[14px] text-red-600">
          {errore}
        </p>
      )}

      <button
        type="submit"
        disabled={!pronto || stato === "invio"}
        className="riflesso mt-5 h-12 w-full rounded-bottone bg-verde px-6 text-[15px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(10,157,92,.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-50"
      >
        {stato === "invio"
          ? "Un attimo…"
          : seSiPaga("Manda e sblocca l'analisi gratis", "Manda la recensione")}
      </button>
    </form>
  );
}
