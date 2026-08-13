"use client";

import { useEffect } from "react";

/**
 * 🔴 IL GETTONE DI ACCESSO NON RESTA SCRITTO NELLA BARRA DEGLI INDIRIZZI.
 *
 * Trovato col collaudo del 13/08: dopo il pagamento si atterrava su
 * `/pratica/<id>?token_hash=...&type=magiclink&poi=...`. Il gettone a
 * quel punto è già stato consumato, quindi non apre più niente, ma
 * quell'indirizzo è esattamente quello che una persona copia e manda a
 * qualcuno («guarda, è arrivata la pratica»), e resta nella cronologia
 * del browser. In più fa sembrare rotto un passaggio appena riuscito.
 *
 * ⚠️ Perché qui e non solo sul server. Sul server l'indirizzo di arrivo
 * viene già costruito pulito (`/auth/conferma` azzera la parte dopo il
 * punto interrogativo), e non basta: qualcosa lungo la catena dei
 * rimandi lo riattacca lo stesso. Questo è l'ultimo anello, quello che
 * il browser mostra davvero, ed è l'unico posto in cui si può essere
 * sicuri del risultato.
 *
 * Non è un rimando e non ricarica niente: riscrive solo la riga
 * dell'indirizzo, quindi il tasto "indietro" continua a funzionare.
 */
const DA_TOGLIERE = ["token_hash", "type", "poi", "access_token", "refresh_token", "code"];

export default function IndirizzoPulito() {
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      let tolto = false;
      for (const chiave of DA_TOGLIERE) {
        if (u.searchParams.has(chiave)) {
          u.searchParams.delete(chiave);
          tolto = true;
        }
      }
      if (tolto) window.history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch {
      /* Un indirizzo che non si sa leggere si lascia com'è: qui si
         rifinisce, non si rompe una pagina che funziona. */
    }
  }, []);
  return null;
}
