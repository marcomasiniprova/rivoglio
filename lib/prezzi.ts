/**
 * IL TEST DEI DUE PREZZI (scelta di Valerio, 9/08).
 *
 * Perché si fa. Nessuno sa quanto vale davvero una pratica: 14,90 è il
 * prezzo più aggressivo del mercato, ma su un rimborso da 400 euro anche
 * 24,90 resta sedici volte meno del valore che consegni, e AirHelp per lo
 * stesso lavoro ne trattiene da 100 a 140. Alzare il prezzo taglia del 40%
 * il traffico necessario per lo stesso incasso, ed è la leva più veloce che
 * abbiamo. Ma è una domanda a cui risponde il mercato, non un'opinione:
 * quindi mezzo pubblico vede un prezzo, mezzo l'altro.
 *
 * COME SI LEGGE IL RISULTATO, senza tabelle nuove nel database. La divisione
 * è 50 e 50 e la fa una moneta, quindi quanti hanno VISTO i due prezzi è
 * lo stesso numero: basta contare le vendite. Se la variante B vende più
 * della metà di A, ha già vinto (a 24,90 ne bastano 60 per pareggiare 100
 * vendite da 14,90). Il prodotto Polar comprato dice da solo in che
 * variante era il cliente: nessuna migrazione, nessuna colonna in più.
 *
 * ⚠️ Serve una cosa a Valerio: su Polar vanno creati QUATTRO prodotti, non
 * due, e i loro quattro link vanno nelle variabili qui sotto. Senza i link
 * della variante B, il sito serve a tutti la variante A e il test non parte
 * (nessun errore: si degrada al prezzo di sempre).
 */

export type Variante = "a" | "b";

/** Il cookie che tiene la persona sullo stesso prezzo, sempre. */
export const COOKIE_PREZZO = "rivolio_prezzo";

export type Listino = {
  singola: number;
  famiglia: number;
  /** Le stesse cifre già scritte come le legge una persona. */
  singolaTesto: string;
  famigliaTesto: string;
};

const listino = (singola: number, famiglia: number): Listino => ({
  singola,
  famiglia,
  singolaTesto: euro(singola),
  famigliaTesto: euro(famiglia),
});

/** "14,90€". Mai il punto decimale: qui si scrive in italiano. */
export function euro(n: number): string {
  return `${n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
}

export const LISTINI: Record<Variante, Listino> = {
  a: listino(14.9, 24.9),
  b: listino(24.9, 39.9),
};

/** Il listino di sempre: quello che si usa dove la variante non arriva. */
export const LISTINO_BASE = LISTINI.a;

export function listinoDi(variante: Variante | null | undefined): Listino {
  return variante === "b" ? LISTINI.b : LISTINI.a;
}

/** Una variante valida, o `null` se il valore non è dei nostri. */
export function varianteValida(v: string | null | undefined): Variante | null {
  return v === "a" || v === "b" ? v : null;
}

/**
 * La moneta. Si tira UNA volta per visitatore e il risultato resta nel
 * cookie: chi vede 24,90 sulla landing deve trovare 24,90 anche alla cassa,
 * se no il test misura la nostra incoerenza invece del prezzo.
 */
export function tiraLaMoneta(): Variante {
  return Math.random() < 0.5 ? "a" : "b";
}

/**
 * Il conto del confronto coi portali, ricalcolato sul prezzo che quella
 * persona sta vedendo. Su una compensazione da 600 euro un portale al 35%
 * ne trattiene 210; noi tratteniamo il prezzo della pratica.
 */
export function confronto(listino: Listino) {
  const compensazione = 600;
  const quotaPortale = 0.35;
  const trattenutoPortale = Math.round(compensazione * quotaPortale);
  return {
    compensazione,
    trattenutoPortale,
    restanoPortale: compensazione - trattenutoPortale,
    trattenutoNostro: listino.singola,
    restanoNostro: Math.round((compensazione - listino.singola) * 100) / 100,
  };
}
