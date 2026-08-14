/**
 * LE PAGINE CHE SI APRONO DI FIANCO (decisione di Valerio, 11/08).
 *
 * Il problema visto da lui: dalla landing entri nel Tabellone (o in una
 * pagina sciopero, o in una guida) e da lì **non torni più indietro**.
 * Quelle pagine hanno una testata loro, non la barra del sito, quindi il
 * filo che riporta al check si spezza e il visitatore si perde.
 *
 * La soluzione che ha scelto: si aprono in una scheda nuova, così la
 * landing resta aperta dietro e ci si torna chiudendo la scheda.
 *
 * ⚠️ Il costo, dichiarato: su telefono le schede nuove danno fastidio a
 * parecchia gente, e chi non le conosce può accumularne dieci. Per
 * questo dentro quelle pagine c'è ANCHE il ritorno esplicito (vedi la
 * testata del Tabellone): la scheda nuova è la cintura, il bottone di
 * ritorno è la bretella.
 *
 * ⚠️ E vale SOLO per i link che partono dalla landing. Dentro il
 * Tabellone, un articolo che rimanda a un altro articolo resta nella
 * stessa scheda: se no leggere tre pezzi vorrebbe dire tre schede.
 */

/** Le sezioni con una testata propria, da cui non si torna da soli. */
const A_PARTE = [
  "/tabellone",
  "/sciopero-aerei",
  "/aeroporto",
  "/guida-bagagli",
  "/giudice-di-pace",
  "/mobilita-ridotta",
];

/**
 * Gli attributi da mettere su un link della landing.
 * Torna un oggetto vuoto per tutto il resto, così si può sempre spandere
 * (`{...apreAParte(href)}`) senza scrivere condizioni ovunque.
 *
 * `rel="noopener"` non è pignoleria: senza, la pagina che si apre può
 * toccare quella che l'ha aperta tramite `window.opener`.
 */
export function apreAParte(href: string): { target?: "_blank"; rel?: string } {
  if (!href.startsWith("/")) return {};
  const dove = href.split(/[?#]/)[0];
  const fuori = A_PARTE.some((p) => dove === p || dove.startsWith(p + "/"));
  return fuori ? { target: "_blank", rel: "noopener" } : {};
}

/** Solo per le prove: l'elenco, così non si duplica a mano. */
export const SEZIONI_A_PARTE = A_PARTE;
