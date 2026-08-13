"use client";

import { useRef, useState } from "react";
import { COPY } from "@/lib/copy";

/**
 * La seconda fonte, in mano all'utente: carica la carta d'imbarco o
 * l'email della compagnia, Rivolio la incrocia coi dati verificati.
 * Concorde = riga verde. Discorde = onestà: verifica umana, ti scriviamo.
 */
const T = COPY.pratica.documenti;

type Esito = { esito: "concorde" | "discorde" | "illeggibile"; dettagli: string };

export default function CaricaDocumento({
  praticaId,
  /**
   * Vero quando la lettera è ancora chiusa dietro questo passo. Cambia
   * il tono del riquadro (diventa il passo 1, non un extra) e fa
   * comparire la porta di servizio per chi i documenti non ce li ha.
   */
  bloccante = false,
  /**
   * Vero quando il reclamo è già partito. Il riquadro resta (il documento
   * serve ancora per il sollecito) ma cambia parole: non può promettere di
   * rendere più solida una lettera già spedita.
   */
  dopoInvio = false,
}: {
  praticaId: string;
  bloccante?: boolean;
  dopoInvio?: boolean;
}) {
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "errore">("fermo");
  const [risposta, setRisposta] = useState<Esito | null>(null);
  const [errore, setErrore] = useState("");
  const [saltando, setSaltando] = useState(false);
  const campoFile = useRef<HTMLInputElement>(null);

  /**
   * «Non ce l'ho adesso». Sblocca la lettera e lascia scritto nella
   * cronologia che è stata una scelta.
   *
   * ⚠️ Esiste perché a questo punto il cliente HA GIÀ PAGATO: un muro
   * che non riesce a superare è un prodotto venduto e non consegnato.
   * Costa un clic in più, ed è giusto che costi: serve a far capire che
   * si sta scegliendo la strada più debole.
   */
  async function salta() {
    setSaltando(true);
    try {
      const r = await fetch(`/api/pratiche/${praticaId}/documento/salta`, { method: "POST" });
      if (!r.ok) throw new Error("non salvato");
      window.location.reload();
    } catch {
      setSaltando(false);
      setErrore(COPY.comune.erroreGenerico);
    }
  }

  async function carica(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setStato("errore");
      setErrore(T.troppoGrande);
      return;
    }
    setStato("invio");
    setErrore("");
    try {
      const base64 = await new Promise<string>((risolvi, boccia) => {
        const lettore = new FileReader();
        lettore.onload = () => risolvi(String(lettore.result).split(",")[1] ?? "");
        lettore.onerror = () => boccia(lettore.error);
        lettore.readAsDataURL(file);
      });
      const r = await fetch(`/api/pratiche/${praticaId}/documento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, tipoMime: file.type }),
      });
      const dati = await r.json().catch(() => null);
      if (!r.ok || !dati?.ok) {
        setStato("errore");
        setErrore(typeof dati?.errore === "string" ? dati.errore : COPY.comune.erroreGenerico);
        return;
      }
      setRisposta({ esito: dati.esito, dettagli: dati.dettagli });
      setStato("fatto");
    } catch {
      setStato("errore");
      setErrore(COPY.comune.erroreGenerico);
    }
  }

  return (
    <section
      className={`rounded-3xl border p-6 ${
        bloccante ? "border-verde/40 bg-menta-tenue" : "border-bordo bg-white"
      }`}
    >
      {bloccante && (
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-verde">
          {T.passo}
        </p>
      )}
      <h2 className={`font-display text-xl tracking-[-0.03em] ${bloccante ? "mt-2" : ""}`}>
        {bloccante ? T.titoloBloccante : dopoInvio ? T.titoloDopo : T.titolo}
      </h2>
      <p
        className={`mt-2 text-[14.5px] leading-relaxed ${
          bloccante ? "text-verde-notte/85" : "text-fumo"
        }`}
      >
        {bloccante ? T.testoBloccante : dopoInvio ? T.testoDopo : T.testo}
      </p>

      {stato === "fatto" && risposta ? (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-[14.5px] leading-relaxed ${
            risposta.esito === "concorde"
              ? "border-verde/40 bg-menta-tenue text-verde-notte"
              : "border-bordo bg-nebbia text-inchiostro"
          }`}
        >
          {risposta.esito === "concorde"
            ? T.concorde
            : risposta.esito === "discorde"
              ? T.discorde
              : T.illeggibile}
        </div>
      ) : (
        <>
          <input
            ref={campoFile}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void carica(f);
            }}
          />
          <button
            type="button"
            disabled={stato === "invio"}
            onClick={() => campoFile.current?.click()}
            className="riflesso mt-4 inline-flex h-11 items-center rounded-bottone border border-verde/50 bg-white px-5 text-[14.5px] font-medium text-verde-scuro transition-all duration-300 hover:-translate-y-0.5 hover:bg-menta-tenue disabled:pointer-events-none disabled:opacity-55"
          >
            {stato === "invio" ? COPY.comune.caricamento : T.bottone}
          </button>
          {stato === "errore" && (
            <p role="alert" className="mt-3 text-[14px] font-medium text-red-600">
              {errore}
            </p>
          )}
          <p className="mt-3 text-[13.5px] text-fumo">{T.privacy}</p>
          {bloccante && (
            <p className="mt-4 border-t border-verde/20 pt-3 text-[13.5px] leading-relaxed text-verde-notte/75">
              {T.saltaPremessa}{" "}
              <button
                type="button"
                disabled={saltando}
                onClick={() => void salta()}
                className="font-medium text-verde-scuro underline underline-offset-2 disabled:opacity-55"
              >
                {saltando ? COPY.comune.caricamento : T.salta}
              </button>
            </p>
          )}
        </>
      )}
    </section>
  );
}
