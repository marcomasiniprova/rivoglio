"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Camera, ClipboardPaste, Sparkles } from "lucide-react";

/**
 * «MI HANNO RISPOSTO NO»: incolla quello che ti hanno scritto, o
 * fotografalo. Al resto pensiamo noi.
 *
 * 🔴 Valerio, 13/08: «non si può fare la analisi bella figa con AI, tipo
 * carichi la foto della risposta, lo screenshot, o scrivi letteralmente
 * alla AI e ti dà la contro risposta? è tutto così rigido con domande
 * predefinite».
 *
 * ⚠️ LA LISTA NON SPARISCE, DIVENTA IL RIPIEGO. Non è prudenza
 * burocratica: la risposta della compagnia arriva per posta, e a volte
 * la persona non ce l'ha sottomano, o è una telefonata, o il modello non
 * capisce. In quei casi la scelta a lista funziona da sempre e porta a
 * casa la replica lo stesso. Un prodotto che ha una sola strada è un
 * prodotto che si ferma.
 *
 * ⚠️ QUI DENTRO NON C'È NESSUNA REGOLA E NESSUN TESTO DI LETTERA. Il
 * browser manda quello che l'utente ha scritto e riceve indietro un
 * riassunto; il paragrafo che finisce nella lettera resta sul server,
 * dove passa dal controllo che boccia le sentenze inventate.
 */

export type EsitoLettura = {
  etichetta: string | null;
  peso: "debole" | "dipende" | "solido" | null;
  riassunto: string;
  fattiLoro: string[];
  sicurezza: "alta" | "media" | "bassa";
  suMisura: boolean;
};

export default function LeggiRisposta({
  praticaId,
  onFallita,
}: {
  praticaId: string;
  /** Chiamata quando conviene passare alla lista: il modello non ce l'ha fatta. */
  onFallita: (messaggio: string) => void;
}) {
  const [modo, setModo] = useState<"testo" | "foto">("testo");
  const [testo, setTesto] = useState("");
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto">("fermo");
  const [errore, setErrore] = useState("");
  const [esito, setEsito] = useState<EsitoLettura | null>(null);
  const campoFile = useRef<HTMLInputElement>(null);

  async function manda(corpo: Record<string, unknown>) {
    setStato("invio");
    setErrore("");
    try {
      const r = await fetch(`/api/pratiche/${praticaId}/risposta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const d = await r.json().catch(() => null);
      if (d?.ok) {
        setEsito({
          etichetta: d.etichetta ?? null,
          peso: d.peso ?? null,
          riassunto: typeof d.riassunto === "string" ? d.riassunto : "",
          fattiLoro: Array.isArray(d.fattiLoro) ? d.fattiLoro : [],
          sicurezza: d.sicurezza ?? "bassa",
          suMisura: Boolean(d.suMisura),
        });
        setStato("fatto");
        return;
      }
      /* Il server ha letto ma non ha capito: la loro risposta è comunque
         salvata nel fascicolo. Si passa alla lista invece di lasciare la
         persona ferma davanti a un errore. */
      if (d?.letto) {
        onFallita(typeof d.errore === "string" ? d.errore : "");
        return;
      }
      setStato("fermo");
      setErrore(typeof d?.errore === "string" ? d.errore : "Qualcosa non ha funzionato. Riprova.");
    } catch {
      setStato("fermo");
      setErrore("Qualcosa non ha funzionato. Riprova tra poco.");
    }
  }

  async function mandaFoto(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setErrore("Il file supera i 5MB: riprova con uno scatto più leggero.");
      return;
    }
    const base64 = await new Promise<string>((risolvi, boccia) => {
      const lettore = new FileReader();
      lettore.onload = () => risolvi(String(lettore.result).split(",")[1] ?? "");
      lettore.onerror = () => boccia(lettore.error);
      lettore.readAsDataURL(file);
    });
    await manda({ base64, tipoMime: file.type });
  }

  /* ------------------------------------------------------ è andata */
  if (stato === "fatto" && esito) {
    return (
      <div className="mt-4 rounded-2xl border border-verde/35 bg-menta-tenue px-5 py-4">
        <p className="flex items-start gap-2 text-[0.95rem] font-medium text-verde-notte">
          <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Ho letto la loro risposta.
        </p>
        {esito.riassunto && (
          <p className="mt-2 text-sm leading-relaxed text-verde-notte/85">{esito.riassunto}</p>
        )}
        {esito.fattiLoro.length > 0 && (
          <div className="mt-3">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-verde-notte/60">
              Cosa dichiarano
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {esito.fattiLoro.map((f) => (
                <li key={f} className="text-sm leading-relaxed text-verde-notte/85">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 border-t border-verde/20 pt-3 text-sm leading-relaxed text-verde-notte/85">
          {esito.suMisura
            ? "La replica è scritta sui fatti che hanno dichiarato loro, punto per punto, con i riferimenti di legge che smontano proprio quella risposta."
            : "La replica è pronta col testo verificato per questo tipo di risposta."}
          {/* ⚠️ Onestà anche qui: se non siamo sicuri di aver capito, lo
              si dice PRIMA che mandi la lettera, non dopo. */}
          {esito.sicurezza === "bassa" &&
            " La loro risposta però non era chiarissima: prima di mandarla, dai un'occhiata che il senso sia quello."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="riflesso mt-4 inline-flex h-11 items-center rounded-bottone bg-verde px-5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro"
        >
          Vedi la replica
        </button>
      </div>
    );
  }

  /* ------------------------------------------------- il modulo vero */
  return (
    <div className="mt-4">
      <div className="flex gap-2">
        {(
          [
            ["testo", ClipboardPaste, "Incolla il testo"],
            ["foto", Camera, "Carica lo screenshot"],
          ] as const
        ).map(([chiave, Icona, nome]) => (
          <button
            key={chiave}
            type="button"
            onClick={() => setModo(chiave)}
            aria-pressed={modo === chiave}
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-bottone border px-3 text-[13.5px] font-medium transition-colors ${
              modo === chiave
                ? "border-verde bg-menta-tenue text-verde-notte"
                : "border-bordo bg-white text-fumo hover:text-inchiostro"
            }`}
          >
            <Icona className="size-4" aria-hidden="true" />
            {nome}
          </button>
        ))}
      </div>

      {modo === "testo" ? (
        <>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            disabled={stato === "invio"}
            rows={6}
            placeholder="Incolla qui l'email che ti hanno mandato, tutta, anche le parti che sembrano inutili."
            /* ⚠️ 16px: sotto i 16 iOS ingrandisce la pagina da solo appena
               tocchi il campo, e da lì in poi resta storta. */
            className="mt-3 w-full rounded-2xl border border-bordo bg-white px-4 py-3 text-[16px] leading-relaxed placeholder:text-fumo-2 focus:border-verde focus:outline-none sm:text-[14.5px]"
          />
          <button
            type="button"
            disabled={stato === "invio" || testo.trim().length < 20}
            onClick={() => void manda({ testo })}
            className="riflesso mt-3 inline-flex h-11 items-center gap-2 rounded-bottone bg-verde px-5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-verde-scuro disabled:pointer-events-none disabled:opacity-50"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {stato === "invio" ? "Sto leggendo." : "Leggi e preparami la replica"}
          </button>
        </>
      ) : (
        <>
          <input
            ref={campoFile}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void mandaFoto(f);
            }}
          />
          <button
            type="button"
            disabled={stato === "invio"}
            onClick={() => campoFile.current?.click()}
            className="riflesso mt-3 inline-flex h-11 items-center gap-2 rounded-bottone border border-verde/50 bg-white px-5 text-[0.95rem] font-medium text-verde-scuro transition-all duration-300 hover:-translate-y-0.5 hover:bg-menta-tenue disabled:pointer-events-none disabled:opacity-55"
          >
            <Camera className="size-4" aria-hidden="true" />
            {stato === "invio" ? "Sto leggendo." : "Scegli la foto della risposta"}
          </button>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-fumo-2">
            Va bene anche uno screenshot storto. L&apos;immagine non viene salvata: la leggiamo,
            teniamo il testo e la scartiamo.
          </p>
        </>
      )}

      {errore && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-red-600">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errore}
        </p>
      )}
    </div>
  );
}
