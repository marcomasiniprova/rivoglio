"use client";

import { useActionState } from "react";
import { Loader2, RefreshCw, Send } from "lucide-react";
import { lanciaAbbinamento, lanciaRaccolta, type EsitoAdmin } from "@/app/admin/azioni";
import { Button } from "@/components/ui/button";

const VUOTO: EsitoAdmin = {};

/** I due bottoni che fanno girare il motore a mano, con l'esito sotto. */
export default function Comandi() {
  const [r1, aRaccolta, raccolgo] = useActionState(async () => lanciaRaccolta(), VUOTO);
  const [r2, aAbbina, abbino] = useActionState(async () => lanciaAbbinamento(), VUOTO);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <form action={aRaccolta} className="flex flex-col gap-3 rounded-2xl border border-bordo bg-white p-5">
        <p className="font-medium">1 · Raccogli un lotto</p>
        <p className="text-sm leading-relaxed text-fumo">
          Scandaglia le prossime 3 mete e salva quello che trova come{" "}
          <span className="font-medium">demo</span>. Niente parte verso gli utenti.
        </p>
        <Button type="submit" variant="contorno" disabled={raccolgo} className="self-start">
          {raccolgo ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          Raccogli adesso
        </Button>
        {r1.ok && <p className="text-sm text-verde">{r1.ok}</p>}
        {r1.errore && <p className="text-sm text-red-600">{r1.errore}</p>}
      </form>

      <form action={aAbbina} className="flex flex-col gap-3 rounded-2xl border border-bordo bg-white p-5">
        <p className="font-medium">2 · Abbina e invia</p>
        <p className="text-sm leading-relaxed text-fumo">
          Confronta le offerte <span className="font-medium">attive</span> con le ricerche e
          manda le destinazioni. Ogni invio scala un credito vero.
        </p>
        <Button type="submit" disabled={abbino} className="self-start">
          {abbino ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          Abbina e invia
        </Button>
        {r2.ok && <p className="text-sm text-verde">{r2.ok}</p>}
        {r2.dettaglio && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-nebbia px-3 py-2 text-xs leading-relaxed text-fumo">
            {r2.dettaglio}
          </pre>
        )}
        {r2.errore && <p className="text-sm text-red-600">{r2.errore}</p>}
      </form>
    </div>
  );
}
