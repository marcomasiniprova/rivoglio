import type { EventoPratica } from "./pratiche";

/**
 * IL PASSO DEI DOCUMENTI, E PERCHÉ ADESSO VIENE PRIMA DELLA LETTERA.
 *
 * Scelta di Valerio col popup del 12/08: «lo rendo un passo
 * obbligatorio». Il motivo è buono e vale i soldi: se la carta d'imbarco
 * del passeggero concorda con gli orari archiviati del volo, la
 * compagnia ha un argomento in meno per rispondere no, e il no è il
 * punto dove si perdono i clienti.
 *
 * ⚠️ MA UNA COSA VA DETTA, PERCHÉ È UN RISCHIO VERO: a questo punto del
 * percorso il cliente HA GIÀ PAGATO. Tenergli la lettera dietro un muro
 * che non riesce a superare (la carta d'imbarco è in un'email di sei
 * mesi fa, sta su un altro telefono, l'ha buttata) vuol dire trattenere
 * un prodotto venduto: rimborso, recensione a una stella, e un cliente
 * che aveva ragione.
 *
 * Quindi il passo è obbligatorio ma **ha una porta di servizio**: chi
 * dichiara di non avere i documenti passa lo stesso, con un clic in più,
 * e la scelta resta scritta nella cronologia. Non è un modo di aggirare
 * la decisione: è la differenza fra "prima fai questo" e "senza questo
 * non ti do quello che hai comprato".
 *
 * I due eventi che aprono la porta:
 * - `documento_incrociato`: ha caricato qualcosa e l'abbiamo letto;
 * - `documento_saltato`: ha detto che adesso non ce l'ha.
 */

/** Il tipo dell'evento scritto quando il cliente dice di non averli. */
export const EVENTO_SALTATO = "documento_saltato";

/** Il tipo scritto dalla lettura del documento. */
export const EVENTO_CARICATO = "documento_incrociato";

/**
 * La lettera si può aprire? Vero se un documento è stato caricato,
 * oppure se il cliente ha dichiarato di non averlo.
 *
 * ⚠️ Si guarda la cronologia e non una colonna nuova: gli eventi ci sono
 * già, sono in ordine e non richiedono una migrazione da far applicare a
 * mano. Una colonna in più qui sarebbe un secondo posto dove la stessa
 * verità può divergere.
 */
export function letteraSbloccata(eventi: EventoPratica[]): boolean {
  return eventi.some((e) => e.tipo === EVENTO_CARICATO || e.tipo === EVENTO_SALTATO);
}
