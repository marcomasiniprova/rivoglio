"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { giroFollowUp, type EsitoAdmin } from "@/app/admin/azioni";
import { Button } from "@/components/ui/button";

const VUOTO: EsitoAdmin = {};

/**
 * Il bottone che fa girare i follow-up a mano, con l'esito sotto.
 *
 * Sta nella sezione Pratiche e non sulla Panoramica: manda le email
 * dovute alle pratiche aperte, quindi è un comando di quella sezione. Su
 * una schermata di riepilogo un bottone che SPEDISCE roba è fuori posto,
 * e prima o poi qualcuno lo preme per sbaglio credendo di aggiornare.
 */
export default function Comandi() {
  const [r, azione, giro] = useActionState(async () => giroFollowUp(), VUOTO);

  return (
    <form
      action={azione}
      className="flex flex-col gap-3 rounded-[14px] border border-bordo bg-white p-4 shadow-[0_1px_2px_rgba(5,46,31,0.04)] sm:p-5"
    >
      <div>
        <h2 className="font-display text-[15.5px] leading-tight tracking-[-0.02em]">
          Giro di follow-up
        </h2>
        {/* ⚠️ I giorni erano rimasti a "T+2, T+15, T+30, T+60", cioè al
            calendario di prima del giro #45: dal 10/08 il sollecito parte
            al 42 e la segnalazione all'ente al 56. Un pannello che
            dichiara tempi che il motore non usa più fa dubitare di tutto
            il resto. I numeri veri stanno in lib/pratiche/rifiuto.ts e in
            app/api/motore/segui. */}
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-fumo">
          Scorre le pratiche aperte e manda l&apos;email dovuta per il punto in cui sono: T+2
          dal pagamento se la lettera non risulta inviata, poi T+42 (sollecito), T+56
          (segnalazione all&apos;ente) e T+90 (com&apos;è andata) dall&apos;invio. Al massimo
          una per pratica, mai due volte la stessa. In produzione lo farà un orologio una
          volta al giorno.
        </p>
      </div>
      <Button type="submit" disabled={giro} size="sm" className="self-start">
        {giro ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        Fai un giro adesso
      </Button>
      {r.ok && <p className="text-[13px] font-medium text-verde">{r.ok}</p>}
      {r.dettaglio && (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-[10px] bg-nebbia px-3 py-2 text-[12px] leading-relaxed text-fumo">
          {r.dettaglio}
        </pre>
      )}
      {r.errore && <p className="text-[13px] text-red-600">{r.errore}</p>}
    </form>
  );
}
