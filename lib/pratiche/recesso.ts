/**
 * La rinuncia al diritto di recesso (attività #21, il buco più costoso).
 *
 * Il quadro: la pratica è contenuto digitale consegnato subito. Per
 * l'art. 59, comma 1, lettera o) del Codice del Consumo il consumatore
 * perde il recesso dei 14 giorni SOLO se ha acconsentito espressamente
 * all'esecuzione immediata e ha accettato di perdere il diritto. Senza
 * quella spunta, chiunque può farsi rimborsare a lettera già consegnata.
 *
 * Il testo è VERSIONATO e si salva in `verifiche.rinuncia_recesso_testo`
 * insieme al momento della spunta: fra sei mesi sappiamo esattamente cosa
 * l'utente ha letto e quando lo ha accettato. Se cambi il testo, cambia
 * anche la versione. L'interfaccia (lib/copy.ts) mostra ESATTAMENTE
 * questo testo: unica fonte, mai due versioni in giro.
 */

export const VERSIONE_RINUNCIA = "2026.08.1";

export const TESTO_RINUNCIA =
  "Chiedo che la pratica sia preparata subito e acconsento all'esecuzione immediata. So che, una volta consegnati i documenti, perdo il diritto di recesso di 14 giorni, come previsto dall'articolo 59 del Codice del Consumo.";

/** Cosa finisce nel database: versione e testo, inseparabili. */
export const FIRMA_RINUNCIA = `${VERSIONE_RINUNCIA} · ${TESTO_RINUNCIA}`;
