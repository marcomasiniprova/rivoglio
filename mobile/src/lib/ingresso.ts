/**
 * IL PREZZO DEL CHECK, lato app.
 *
 * ⚠️ L'app NON decide se il check si paga: quel cancello sta sul server,
 * dentro `/api/verifica`, e l'app lo scopre ricevendo un 402 col muro
 * (vedi `MuroCheck`). Qui si decidono soltanto le PAROLE.
 *
 * Perché serve una variabile a parte e non basta quella del sito: sono
 * due programmi diversi, costruiti in due momenti diversi, e Expo legge
 * solo le variabili che cominciano per `EXPO_PUBLIC_`. Senza questa,
 * l'app continuerebbe a promettere "il check è gratis, sempre" mentre il
 * sito fa pagare, ed è esattamente il difetto trovato l'11/08 sulla
 * landing (le variabili senza prefisso non arrivano nel browser).
 *
 * ⚠️ VA TENUTA ALLINEATA A `NEXT_PUBLIC_CHECK_PREZZO_ATTIVO` del sito.
 * Se il muro è acceso di là e questa è spenta, l'app promette gratis e
 * poi mostra il muro: la promessa rotta si vede in due schermate.
 */
export const CHECK_A_PAGAMENTO = process.env.EXPO_PUBLIC_CHECK_PREZZO_ATTIVO === "1";

/** Quanto costa un'analisi durante il lancio. Uguale al sito. */
export const PREZZO_LANCIO = "1,99€";

/** Sceglie le parole: `seSiPaga(pagando, gratis)`. */
export const seSiPaga = <T,>(pagando: T, gratis: T): T =>
  CHECK_A_PAGAMENTO ? pagando : gratis;
