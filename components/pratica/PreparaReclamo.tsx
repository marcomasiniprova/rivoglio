"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PREPARA IL RECLAMO: i due passaggi facoltativi (carta d'imbarco, spese
 * art. 9) VENGONO PRIMA, e la lettera si mostra DOPO.
 *
 * Valerio, 15/08: «la lettera deve essere fatta DOPO questi due primi passi.
 * Se li fai o non li fai, poi la lettera viene scritta e sarà visibile, non
 * prima, sennò quei passi diventano inutili e hanno meno importanza».
 *
 * ⚠️ NON è il muro grigio del 12/08 (quello che lui stesso fece togliere il
 * 13/08: «appena pago vengo rediretto dove il bottone è grigio, che senso
 * ha?»). Qui non c'è niente di bloccato: i due passi restano FACOLTATIVI, e
 * il bottone «Il mio reclamo è pronto» PORTA AVANTI, non impedisce.
 *
 * 🔴 IL BUG DELLA MEMORIA (Valerio, 16/08): «premo "il mio reclamo è pronto",
 * apro la lettera, torno indietro e mi ritrovo al passo PRECEDENTE, quello
 * dove devo ancora caricare la carta d'imbarco e le spese. È grave».
 *
 * Aveva ragione, ed era esattamente questo componente: il «pronto» viveva
 * SOLO nel browser e si azzerava a ogni montaggio. Apri la lettera (che è
 * un'altra pagina), torni con «torna alla pratica», il componente rinasce da
 * capo e ti sbatte di nuovo sui due passi. Un vuoto di memoria.
 *
 * Adesso il «pronto» si RICORDA (sessionStorage, per pratica): una volta che
 * hai detto «sono pronto», al ritorno trovi la lettera, non i passi. I due
 * passi facoltativi restano comunque raggiungibili con «torna ai passi», per
 * chi cambia idea e vuole allegare qualcosa. Prima i passi, poi il reclamo,
 * senza più perdere il punto.
 */
export default function PreparaReclamo({
  praticaId,
  prep,
  lettera,
}: {
  /** Serve solo a ricordare il «pronto» per QUESTA pratica, non un'altra. */
  praticaId: string;
  /** I due passi facoltativi: carta d'imbarco e spese (art. 9). */
  prep: ReactNode;
  /** Il reclamo vero e proprio: si mostra dopo «pronto». */
  lettera: ReactNode;
}) {
  const [pronto, setPronto] = useState(false);
  const chiave = `reclamo-pronto:${praticaId}`;

  /* Al montaggio si guarda se «pronto» era già stato detto per questa
     pratica: se sì, si parte dritti dalla lettera. Sta in un effetto (non
     nell'inizializzatore) per non litigare con l'idratazione: il primo
     disegno combacia col server, poi eventualmente salta alla lettera. */
  useEffect(() => {
    let ricordato = false;
    try {
      ricordato = sessionStorage.getItem(chiave) === "1";
    } catch {
      /* sessionStorage negato (navigazione privata, permessi): pazienza,
         resta il comportamento di prima. Non si rompe niente. */
    }
    if (!ricordato) return;
    /* ⚠️ Lo stato non si tocca dentro il corpo dell'effetto (React lo vieta:
       secondo disegno a catena). Un rinvio di un giro basta, come fanno la
       ripresa del check e la festa del traguardo. */
    const t = setTimeout(() => setPronto(true), 0);
    return () => clearTimeout(t);
  }, [chiave]);

  function segnaPronto() {
    try {
      sessionStorage.setItem(chiave, "1");
    } catch {
      /* vedi sopra */
    }
    setPronto(true);
  }

  if (pronto) {
    return (
      <>
        {lettera}
        {/* Una via di ritorno ai passi, per chi vuole allegare qualcosa
            dopo aver visto la lettera. Discreta: non è un passo, è un
            ripensamento. */}
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.removeItem(chiave);
            } catch {
              /* vedi sopra */
            }
            setPronto(false);
          }}
          className="mt-4 block text-sm text-fumo underline decoration-bordo underline-offset-4 hover:text-inchiostro"
        >
          Torna ai passi facoltativi (carta d&apos;imbarco, spese)
        </button>
      </>
    );
  }

  return (
    <div className="mt-5 border-t border-bordo pt-5">
      <h2 className="flex items-center gap-2 font-display text-lg tracking-[-0.03em]">
        <ClipboardList className="size-4 shrink-0 text-verde" aria-hidden="true" />
        Prepara il reclamo
      </h2>
      <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fumo">
        Il reclamo lo abbiamo già scritto noi. Quello che metti tu sono due cose che alzano le tue
        probabilità: la carta d&apos;imbarco (la prova che c&apos;eri) e le spese che hai anticipato
        (pasti o hotel, te le fai rimborsare in più). Aggiungile qui sotto, poi vai al reclamo.
      </p>

      <div className="mt-4 space-y-4">{prep}</div>

      <Button type="button" variant="pieno" className="mt-6" onClick={segnaPronto}>
        Vai al reclamo
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
