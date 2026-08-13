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

/**
 * ⚠️ QUESTO RIQUADRO NON BLOCCA PIÙ NIENTE, dal 13/08.
 *
 * Aveva due facce ("passo 1 di 2" col muro, e la versione di contorno) e
 * una porta di servizio per chi la carta d'imbarco non ce l'aveva. Sono
 * sparite tutte e tre insieme al muro: la lettera si apre appena la
 * pratica è pagata, quindi non c'è più niente da sbloccare e non c'è più
 * niente da saltare. Vedi lib/pratiche/passi.ts.
 *
 * Resta una cosa sola: un invito a rinforzare il reclamo, con scritto
 * quanto pesa. Chi lo ignora non perde niente.
 */
export default function CaricaDocumento({ praticaId }: { praticaId: string }) {
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "errore">("fermo");
  const [risposta, setRisposta] = useState<Esito | null>(null);
  const [errore, setErrore] = useState("");
  const campoFile = useRef<HTMLInputElement>(null);

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
    <section className="rounded-3xl border border-bordo bg-white p-6">
      <h2 className="font-display text-xl tracking-[-0.03em]">{T.titolo}</h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-fumo">{T.testo}</p>

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
        </>
      )}
    </section>
  );
}
