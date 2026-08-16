"use client";

import { useRef, useState } from "react";
import { Camera, Check } from "lucide-react";

/**
 * FACOLTATIVO: carica la foto del pagamento (Valerio, 16/08).
 *
 * Compare solo sulla pratica vinta, sotto la festa. Serve a noi (un
 * testimonial anonimo), non all'utente: quindi è un invito gentile, mai un
 * passo obbligato. Chi non carica non perde niente.
 *
 * ⚠️ La nota sulla privacy non è cortesia: la foto SI SALVA (a differenza di
 * tutte le altre del prodotto), e un bonifico mostra IBAN e nome. Diciamo di
 * coprirli: per un testimonial bastano l'importo e la data.
 *
 * Niente spunta di consenso, per scelta di Valerio: caricare è già la scelta.
 */
export default function ProvaPagamento({ praticaId }: { praticaId: string }) {
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "errore">("fermo");
  const [errore, setErrore] = useState("");
  const campo = useRef<HTMLInputElement>(null);

  async function carica(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setStato("errore");
      setErrore("Il file supera i 5MB: riprova con una foto più leggera.");
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
      const r = await fetch(`/api/pratiche/${praticaId}/prova-pagamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, tipoMime: file.type }),
      });
      const dati = (await r.json().catch(() => null)) as { ok?: boolean; errore?: string } | null;
      if (!r.ok || !dati?.ok) {
        setStato("errore");
        setErrore(typeof dati?.errore === "string" ? dati.errore : "Non è andata. Riprova.");
        return;
      }
      setStato("fatto");
    } catch {
      setStato("errore");
      setErrore("Non è andata. Riprova.");
    }
  }

  if (stato === "fatto") {
    return (
      <section className="rounded-2xl border border-verde/30 bg-menta-tenue px-6 py-5">
        <p className="flex items-center gap-2 text-[0.95rem] font-medium text-verde-notte">
          <Check className="size-5 shrink-0 text-verde" aria-hidden="true" />
          Grazie. Ci aiuta a far fidare chi arriva dopo di te.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-bordo bg-white px-6 py-5">
      <h2 className="font-display text-lg tracking-[-0.03em] text-inchiostro">
        Ci dai una mano? (facoltativo)
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-fumo">
        Se ti va, carica la foto dell&apos;accredito. La usiamo come prova anonima che il metodo
        funziona: aiuta chi arriva dopo di te a fidarsi. Non sei obbligato a niente.
      </p>
      <p className="mt-2 rounded-xl bg-nebbia px-3.5 py-2.5 text-[0.85rem] leading-relaxed text-fumo-2">
        Copri l&apos;IBAN e il tuo nome prima di fare la foto: a noi servono solo l&apos;importo e la
        data. La foto resta privata, la vediamo solo noi.
      </p>

      <input
        ref={campo}
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
        onClick={() => campo.current?.click()}
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-bottone border border-verde/50 bg-white px-5 text-[0.95rem] font-medium text-verde-scuro transition-all duration-300 hover:-translate-y-0.5 hover:bg-menta-tenue disabled:pointer-events-none disabled:opacity-55"
      >
        <Camera className="size-4.5 shrink-0" aria-hidden="true" />
        {stato === "invio" ? "Un attimo…" : "Carica la foto"}
      </button>
      {stato === "errore" && (
        <p role="alert" className="mt-3 text-[0.85rem] font-medium text-red-600">
          {errore}
        </p>
      )}
    </section>
  );
}
