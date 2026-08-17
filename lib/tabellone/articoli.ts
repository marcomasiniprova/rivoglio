import type { Articolo } from "./tipi";

import { ARTICOLO as ritardoFasce } from "./pezzi/volo-in-ritardo-250-400-600";
import { ARTICOLO as compagniaDiceNo } from "./pezzi/compagnia-dice-no-cosa-puoi-fare";
import { ARTICOLO as ryanair } from "./pezzi/reclamo-ryanair-14-giorni";
import { ARTICOLO as easyjet } from "./pezzi/reclamo-easyjet-28-giorni";
import { ARTICOLO as wizz } from "./pezzi/reclamo-wizz-air-da-solo";
import { ARTICOLO as prescrizione } from "./pezzi/quanto-tempo-hai-per-chiedere-il-rimborso";
import { ARTICOLO as sciopero } from "./pezzi/sciopero-aerei-cosa-fare-in-aeroporto";
import { ARTICOLO as cancellato } from "./pezzi/volo-cancellato-primi-60-minuti";
import { ARTICOLO as datiEuropa } from "./pezzi/dati-ritardi-europa-2025";
import { ARTICOLO as datiItalia } from "./pezzi/scali-italiani-ritardi-2026";
import { ARTICOLO as riforma } from "./pezzi/riforma-261-2027-cosa-cambia";
import { ARTICOLO as coincidenza } from "./pezzi/coincidenza-persa-cosa-ti-spetta";

/**
 * GLI ARTICOLI DEL TABELLONE.
 *
 * Uno per file, in `pezzi/`: un articolo lungo dentro un file condiviso
 * diventa illeggibile alla terza revisione. Qui si tiene solo l'elenco,
 * ed è l'unico posto dove si aggiunge o si toglie un pezzo.
 *
 * L'ORDINE CONTA quando due articoli hanno la stessa data, e all'apertura
 * del blog ce l'hanno tutti: sono usciti insieme il 9 agosto 2026, e
 * datarli all'indietro per far sembrare il blog più vecchio di quello che
 * è sarebbe un dato finto (regola 3). L'ordinamento per data è stabile,
 * quindi a parità di giorno vince questa sequenza: i due pilastri per
 * primi, poi i pezzi che convertono, poi i dati.
 */
export const ARTICOLI: Articolo[] = [
  coincidenza,
  riforma,
  ritardoFasce,
  compagniaDiceNo,
  ryanair,
  cancellato,
  sciopero,
  easyjet,
  wizz,
  prescrizione,
  datiEuropa,
  datiItalia,
];
