import { compagniaPerVettore } from "./compagnie";
import type { FattoVolo, Verdetto } from "@/lib/regole/eu261";

/**
 * LE LETTERE DEI CASI DICHIARATI: negato imbarco e coincidenza persa.
 *
 * 🔴 PERCHÉ ESISTONO, ed è il difetto più grave trovato finora (11/08,
 * segnalato da Valerio con uno screenshot).
 *
 * Fino a oggi ogni lettera passava dalla stessa funzione, quella del
 * RITARDO. Il risultato, per un caso dichiarato, era una lettera che si
 * contraddiceva da sola:
 *
 *   «ritardo all'arrivo: 2 h e 35 min»
 *   «...un ritardo pari o superiore a TRE ORE dà diritto alla
 *     compensazione (Sturgeon)»
 *   «Chiedo pertanto il pagamento di 400€»
 *
 * Cioè: si chiedevano 400 euro citando la regola che dice che con quel
 * ritardo non spettano. Una compagnia la rifiuta con una riga, e il
 * cliente ci ha pagato 14,90 per farsi rispondere male. È esattamente il
 * falso positivo che la regola numero uno vieta, solo che invece di
 * stare nel verdetto stava nel documento.
 *
 * Il motivo tecnico: `/api/verifica/dichiara` aggiornava esito, importo
 * e motivo sulla riga della verifica, ma NON il ritardo, e la pagina
 * della lettera ricostruiva il verdetto da quella riga. Numero vecchio,
 * importo nuovo, base giuridica di un terzo caso.
 *
 * Qui ogni caso ha la SUA lettera, con la SUA norma:
 * - negato imbarco → art. 4 par. 3 e art. 7. Nessun ritardo, nessuna
 *   Sturgeon: la compensazione è dovuta subito.
 * - coincidenza persa → art. 7 letto dalla Corte in Folkerts (C-11/11):
 *   conta il ritardo alla DESTINAZIONE FINALE, e la fascia sta sulla
 *   distanza dell'intero viaggio.
 *
 * ⚠️ Il ritardo finale il passeggero lo dichiara a fasce ("fra 3 e 4
 * ore", "oltre 4"), non al minuto. Nella lettera si scrive la fascia,
 * mai un numero preciso: un minutaggio inventato è la cosa che fa
 * cadere una richiesta per intero.
 */

export type CasoDichiarato = "negato" | "coincidenza";

export type DatiDichiarazione = {
  caso: CasoDichiarato;
  /** Solo coincidenza: "fra3e4" o "oltre4". */
  ritardoFinale?: string | null;
  /** Solo coincidenza: lo scalo finale dichiarato. */
  destinazioneFinale?: string | null;
};

/** "fra3e4" → la frase che va in una lettera. Mai un numero inventato. */
export function ritardoFinaleInParole(fascia: string | null | undefined): string {
  if (fascia === "oltre4") return "oltre quattro ore";
  if (fascia === "fra3e4") return "fra tre e quattro ore";
  /* Le altre risposte non arrivano mai qui: sotto le 3 ore il verdetto è
     non idoneo, e "non ricordo" resta incerto. Se ci arrivassero, si
     dice il minimo che regge invece di inventare. */
  return "almeno tre ore";
}

/** L'oggetto della lettera, diverso per ogni caso. */
export function oggettoDichiarato(
  caso: CasoDichiarato,
  voloIata: string,
  giornoVolo: string,
): string {
  return caso === "negato"
    ? `Richiesta di compensazione pecuniaria ex artt. 4 e 7 Reg. (CE) 261/2004, negato imbarco, volo ${voloIata} del ${giornoVolo}`
    : `Richiesta di compensazione pecuniaria ex art. 7 Reg. (CE) 261/2004, coincidenza persa, volo ${voloIata} del ${giornoVolo}`;
}

/**
 * Il cuore della lettera: i fatti e la norma, per il caso dichiarato.
 * Torna solo la parte centrale; intestazione, elenco passeggeri, IBAN e
 * chiusura restano quelli di sempre (sono uguali per tutti i casi).
 */
export function corpoDichiarato(
  caso: CasoDichiarato,
  fatto: FattoVolo,
  verdetto: Extract<Verdetto, { esito: "idoneo" }>,
  dati: DatiDichiarazione,
  km: (n: number) => string,
  euro: (n: number) => string,
): string {
  if (caso === "negato") {
    /* I fatti in prosa, non in elenco puntato: una lettera formale
       italiana si scrive così, e i trattini a inizio riga sono la cosa
       che Valerio ha riconosciuto come "automatismo" il 12/08. */
    return `Mi sono presentato all'imbarco entro l'orario indicato, con prenotazione confermata, e l'imbarco mi è stato negato contro la mia volontà, senza che io abbia accettato alcun beneficio in cambio della rinuncia al posto.${
      fatto.kmOrtodromica ? ` La tratta misura ${km(fatto.kmOrtodromica)}.` : ""
    }

Ai sensi dell'articolo 4, paragrafo 3, del Regolamento (CE) n. 261/2004, il vettore che nega l'imbarco a un passeggero contro la sua volontà è tenuto a corrispondere immediatamente la compensazione pecuniaria prevista dall'articolo 7. La compensazione non è subordinata ad alcuna condizione sul ritardo all'arrivo: è dovuta per il fatto stesso del negato imbarco.

Sulla base della distanza della tratta, l'articolo 7 fissa la compensazione in ${euro(verdetto.importo)} a passeggero.`;
  }

  const dove = dati.destinazioneFinale ? ` (${dati.destinazioneFinale})` : "";
  return `Il volo indicato faceva parte di un'unica prenotazione con il volo successivo, e il suo ritardo mi ha fatto perdere la coincidenza. Sono giunto alla destinazione finale${dove} con un ritardo di ${ritardoFinaleInParole(dati.ritardoFinale)} rispetto all'orario originariamente previsto.

Ai sensi dell'articolo 7 del Regolamento (CE) n. 261/2004, come interpretato dalla Corte di giustizia dell'Unione europea nella causa C-11/11 (Folkerts), il passeggero che, a causa del ritardo di un volo con coincidenza compreso in un'unica prenotazione, giunge alla destinazione finale con un ritardo pari o superiore a tre ore ha diritto alla compensazione pecuniaria, salvo circostanze eccezionali che spetta al vettore provare.

La fascia si determina sulla distanza dell'intero viaggio, dal luogo di partenza alla destinazione finale, e non su quella del singolo segmento: l'articolo 7 fissa pertanto la compensazione in ${euro(verdetto.importo)} a passeggero.`;
}

/** La compagnia a cui va indirizzata: la stessa logica del ritardo. */
export function compagniaDi(fatto: FattoVolo) {
  return compagniaPerVettore(fatto.vettoreOperativo) ?? compagniaPerVettore(fatto.voloIata);
}
