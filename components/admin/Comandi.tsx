"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { giroFollowUp, type EsitoAdmin } from "@/app/admin/azioni";
import { Button } from "@/components/ui/button";

const VUOTO: EsitoAdmin = {};

/** Il bottone che fa girare i follow-up a mano, con l'esito sotto. */
export default function Comandi() {
  const [r, azione, giro] = useActionState(async () => giroFollowUp(), VUOTO);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <form action={azione} className="flex flex-col gap-3 rounded-2xl border border-bordo bg-white p-5">
        <p className="font-medium">Giro di follow-up</p>
        <p className="text-sm leading-relaxed text-fumo">
          Scorre le pratiche aperte e manda l&apos;email dovuta per il punto in cui
          sono (T+2, T+15, T+30, T+60). Al massimo una per pratica, mai due volte
          la stessa. In produzione lo farà un orologio una volta al giorno.
        </p>
        <Button type="submit" disabled={giro} className="self-start">
          {giro ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          Fai un giro adesso
        </Button>
        {r.ok && <p className="text-sm text-verde">{r.ok}</p>}
        {r.dettaglio && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-nebbia px-3 py-2 text-xs leading-relaxed text-fumo">
            {r.dettaglio}
          </pre>
        )}
        {r.errore && <p className="text-sm text-red-600">{r.errore}</p>}
      </form>
    </div>
  );
}
