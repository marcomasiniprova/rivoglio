/**
 * L'INGRESSO DELL'ANTEPRIMA.
 *
 * Sul telefono vero questo file non fa niente: `window` non esiste e ogni
 * funzione qui dentro risponde "niente da fare". Serve solo alla lavagna
 * del sito (/anteprima-app), che deve poter aprire l'app già su una
 * schermata precisa e su un momento preciso.
 *
 * Perché un ingresso solo invece di tanti indirizzi: l'export web di Expo
 * è UNA pagina sola. Su Netlify /app-anteprima/verdetto come file non
 * esiste e risponde 404 (successo il 10/08, tutti i riquadri neri). Con
 * un ingresso solo l'indirizzo è sempre quello che funziona, e la rotta
 * viaggia come parametro: `?r=/verdetto&esito=idoneo&...`.
 *
 * `scena` è il secondo pezzo: molte schermate della tavola non sono
 * pagine ma MOMENTI dentro una pagina (il volo non trovato, la cassa che
 * si apre, il foglio a schermo pieno). Ogni schermata interessata guarda
 * `scena()` per decidere da dove partire. Nell'app vera è sempre vuoto.
 */

/** I parametri dell'indirizzo, o niente fuori dal browser. */
function parametri(): URLSearchParams | null {
  if (typeof window === "undefined" || !window.location) return null;
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return null;
  }
}

/**
 * La rotta chiesta dalla lavagna, coi suoi parametri.
 * Torna null se non c'è: l'app parte normalmente.
 */
export function aperturaChiesta(): {
  pathname: string;
  params: Record<string, string>;
} | null {
  const p = parametri();
  const rotta = p?.get("r");
  /* Solo percorsi interni: un indirizzo intero qui dentro non ha senso e
     sarebbe un modo per far aprire all'app cose che non sono nostre. */
  if (!rotta || !rotta.startsWith("/") || rotta.startsWith("//")) return null;

  const params: Record<string, string> = {};
  for (const [chiave, valore] of p!.entries()) {
    if (chiave !== "r") params[chiave] = valore;
  }
  return { pathname: rotta, params };
}

/**
 * Il momento da cui partire dentro la schermata (vuoto nell'app vera).
 * Ogni schermata riconosce i propri: vedi `SCENE` nella lavagna del sito.
 */
export function scena(): string {
  return parametri()?.get("scena") ?? "";
}

/** Comodo per leggere una scena passata già come parametro di rotta. */
export function scenaDa(valore: string | string[] | undefined): string {
  return typeof valore === "string" ? valore : "";
}
