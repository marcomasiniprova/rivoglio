import { euro, type Listino } from "@/lib/prezzi";
import { scontoAffiliato, type Affiliato } from "@/lib/affiliati/affiliati";

/**
 * IL PREZZO DELLA PRATICA CHE QUESTA PERSONA PAGA DAVVERO.
 *
 * Due sconti si possono sommare, ed è qui che si sommano UNA volta sola:
 * 1. lo sconto del creator (se è arrivata da un suo link/codice);
 * 2. l'anticipo del check (i 1,99 già pagati si scalano dalla pratica).
 *
 * ⚠️ PERCHÉ UN POSTO SOLO. Il prezzo lo mostra la pagina del risultato e lo
 * incassa la cassa: se i due lo calcolassero per conto loro, il giorno di un
 * cambio uno slitterebbe e il cliente vedrebbe un prezzo sul bottone e un
 * altro alla cassa. È esattamente il motivo per cui uno chiude la pagina.
 * Entrambi chiamano questa funzione con gli stessi ingredienti.
 *
 * L'ordine conta: prima la percentuale del creator sul listino, poi si toglie
 * l'anticipo in euro. Mai sotto zero.
 */
export function listinoScontato(
  base: Listino,
  opts: {
    affiliato: Affiliato | null;
    /** Quanto vale l'anticipo del check già pagato (0 se non c'è pass). */
    scalaCheck: number;
  },
): Listino {
  const applica = (n: number) => {
    const conCreator = scontoAffiliato(n, opts.affiliato);
    return Math.max(0, Math.round((conCreator - opts.scalaCheck) * 100) / 100);
  };
  const singola = applica(base.singola);
  const famiglia = applica(base.famiglia);
  return {
    singola,
    famiglia,
    singolaTesto: euro(singola),
    famigliaTesto: euro(famiglia),
  };
}
