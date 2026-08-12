"use client";

import { useId, useState, type FormEvent } from "react";
import { COPY } from "@/lib/copy";

/**
 * Il campo email del Tabellone: input e bottone dentro un telaio solo,
 * come nel riferimento.
 *
 * Non è una lista nuova: chiama la stessa `/api/iscriviti` dell'Osservatorio,
 * quindi parte il doppio opt-in di sempre (email di conferma, poi il
 * benvenuto). Una seconda lista sarebbe una seconda cosa da tenere pulita
 * e un secondo posto da cui disiscriversi.
 */

type Stato = "fermo" | "invio" | "fatto" | "errore";

export default function CatturaEmail({
  tono = "chiaro",
  bottone = "Iscrivimi",
  segnaposto = "La tua email",
  larghezza = "max-w-[440px]",
}: {
  tono?: "chiaro" | "scuro";
  bottone?: string;
  segnaposto?: string;
  larghezza?: string;
}) {
  const [email, setEmail] = useState("");
  const [stato, setStato] = useState<Stato>("fermo");
  const [messaggio, setMessaggio] = useState("");
  const id = useId();

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

  const scuro = tono === "scuro";

  if (stato === "fatto") {
    return (
      <div
        role="status"
        className={`${larghezza} rounded-[10px] border px-5 py-4 text-left ${
          scuro ? "border-menta/35 bg-menta/10" : "border-verde/30 bg-verde/6"
        }`}
      >
        <p className={`font-display text-[17px] font-semibold ${scuro ? "text-menta" : "text-verde-scuro"}`}>
          Controlla la posta.
        </p>
        <p className={`mt-1 text-[14.5px] leading-relaxed ${scuro ? "text-white/70" : "text-verde-notte/70"}`}>
          Ti ho mandato un&apos;email con un link da cliccare: è quel clic che ti iscrive,
          così nessuno può iscrivere l&apos;indirizzo di un altro.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={invia} className={`${larghezza} w-full`}>
      <label htmlFor={id} className="sr-only">
        La tua email
      </label>
      {/* 🔴 PERCHÉ ERA "SCHIACCIATO MINUSCOLO" (Valerio, 12/08), e non
          era il padding: il campo dichiarava `h-12` (48 punti) e ne
          misurava **27**. Colpa di `flex-1`, cioè `flex: 1 1 0%`: serve
          da 640 punti in su, dove campo e bottone stanno affiancati e il
          campo deve prendersi la larghezza che avanza. Ma sotto quella
          soglia il telaio diventa una COLONNA, l'asse principale gira in
          verticale, e quel `0%` smette di essere una larghezza di
          partenza e diventa un'ALTEZZA di partenza: schiaccia il campo e
          vince su `h-12`. Adesso `flex-1` esiste solo da `sm` in su.
          ⚠️ Trovato misurando l'altezza vera nel browser, non leggendo
          le classi: nel codice `h-12` c'era, e sembrava tutto giusto.
          Più aria intorno, già che c'ero: p-1.5 → p-2. */}
      <div
        className={`flex flex-col gap-2 rounded-[12px] p-2 sm:flex-row sm:gap-0 ${
          scuro ? "bg-white/10" : "border border-verde-notte/20 bg-white"
        }`}
      >
        <input
          id={id}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={segnaposto}
          autoComplete="email"
          /* 🔴 16px, mai meno: sotto quella soglia iPhone ingrandisce la
             pagina da solo appena tocchi il campo. Qui erano 15,5.
             ⚠️ E SOLO SU TELEFONO il campo prende un contorno suo. Su
             schermo largo campo e bottone stanno affiancati dentro un
             telaio unico e si capisce; impilati invece il campo
             trasparente dentro il telaio bianco spariva, e "La tua
             email" sembrava una scritta sullo sfondo invece di un posto
             dove si scrive. */
          className={`h-12 w-full min-w-0 rounded-[8px] px-3.5 text-[16px] outline-none sm:flex-1 sm:border-0 sm:bg-transparent ${
            scuro
              ? "border border-white/15 bg-white/5 text-white placeholder:text-white/40"
              : "border border-verde-notte/15 bg-carta/60 text-verde-notte placeholder:text-verde-notte/45 sm:bg-transparent"
          }`}
        />
        <button
          type="submit"
          disabled={stato === "invio"}
          className={`riflesso h-12 shrink-0 rounded-[8px] px-5 text-[15px] font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-55 ${
            scuro
              ? "bg-menta text-verde-notte hover:bg-white"
              : "bg-verde-notte text-carta hover:bg-verde-scuro"
          }`}
        >
          {stato === "invio" ? COPY.comune.caricamento : bottone}
        </button>
      </div>

      {stato === "errore" && (
        <p role="alert" className={`mt-2 text-[13.5px] ${scuro ? "text-sole" : "text-red-700"}`}>
          {messaggio}
        </p>
      )}
    </form>
  );
}
