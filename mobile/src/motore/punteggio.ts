import type { Tipo } from "./destinazioni";

/**
 * Il seme dell'intelligenza di Viaggio Anche Io.
 *
 * Cosa fa DAVVERO: un punteggio deterministico su preferenze osservate.
 * Conta quali tipi di destinazione apri e quali ignori, ne ricava un peso
 * per tipo, e riordina le proposte combinando l'avanzo per notte (il
 * criterio storico del motore) con l'affinità verso i tipi che apri.
 * Stessi input, stesso ordine: ogni posizione si può rifare a mano con le
 * costanti dichiarate qui sotto.
 *
 * Cosa NON è ancora: non è un modello addestrato, non impara dagli altri
 * utenti, non prevede il futuro, non tocca la rete e non usa casualità.
 * È statistica elementare sul tuo storico. Chiamarla "AI" oggi sarebbe
 * fumo: è la base trasparente su cui il profilo che impara potrà crescere.
 */

export type Preferenze = {
  pesoTipi: Partial<Record<Tipo, number>>;
  regioniViste: string[];
};

/** I pesi del punteggio: dichiarati e documentati, mai nascosti nel codice. */
export const PESI = {
  /** L'avanzo per notte resta il criterio principale, come nel costruttore. */
  avanzo: 0.7,
  /** L'affinità col tipo, osservata su cosa l'utente apre davvero. */
  affinita: 0.3,
  /**
   * Peso di un tipo mai visto: né premiato né punito. È lo stesso valore
   * che la lisciatura qui sotto dà a zero osservazioni (1/2).
   */
  neutro: 0.5,
  /**
   * Tolta al punteggio di una regione già vista: piccola apposta, decide
   * le parità per variare le proposte senza ribaltare un vantaggio vero.
   */
  regioneVista: 0.02,
} as const;

/**
 * Lisciatura di Laplace: a ogni tipo osservato si aggiungono un'apertura
 * e un'ignorata fittizie. Così un tipo sempre ignorato non scende mai a
 * zero assoluto e uno sempre aperto non arriva mai a uno: poche osservazioni
 * non bastano a condannare o incoronare un tipo per sempre.
 */
export const LISCIATURA = { aperte: 1, totali: 2 } as const;

/**
 * Dallo storico di invii (aperti o ignorati) ricava le preferenze.
 *
 * Il peso di un tipo è (aperte + 1) / (totali + 2), sempre fra 0 e 1
 * esclusi. Un tipo mai comparso nello storico resta fuori da `pesoTipi`
 * e `ordina` lo tratta come neutro (0.5).
 *
 * Vincolo di contratto (PROGETTO.md): la firma porta solo tipo e aperto.
 * Se il chiamante allega anche `regione` come campo in più, la raccogliamo
 * in `regioniViste`; altrimenti l'elenco resta vuoto e nessuno viene
 * penalizzato.
 */
export function preferenzeDaStorico(aperture: { tipo: Tipo; aperto: boolean }[]): Preferenze {
  const conteggi = new Map<Tipo, { aperte: number; totali: number }>();
  const regioni = new Set<string>();

  for (const voce of aperture) {
    const c = conteggi.get(voce.tipo) ?? { aperte: 0, totali: 0 };
    c.totali += 1;
    if (voce.aperto) c.aperte += 1;
    conteggi.set(voce.tipo, c);

    const regione = (voce as { regione?: unknown }).regione;
    if (typeof regione === "string" && regione.length > 0) regioni.add(regione);
  }

  const pesoTipi: Partial<Record<Tipo, number>> = {};
  for (const [tipo, c] of conteggi) {
    pesoTipi[tipo] = (c.aperte + LISCIATURA.aperte) / (c.totali + LISCIATURA.totali);
  }

  return { pesoTipi, regioniViste: [...regioni] };
}

/**
 * Ordina le proposte per punteggio, dalla migliore alla peggiore.
 *
 * punteggio = PESI.avanzo * (avanzo / massimo del lotto)
 *           + PESI.affinita * (peso del tipo, 0.5 se mai visto)
 *           - PESI.regioneVista se la regione è già stata vista
 *
 * Non tocca l'array ricevuto: ne restituisce una copia ordinata. A parità
 * di punteggio l'ordine di arrivo si conserva (ordinamento stabile).
 */
export function ordina<
  T extends { destinazione: { tipo: Tipo; regione: string }; restaPerNotte: number },
>(proposte: T[], preferenze: Preferenze): T[] {
  if (proposte.length === 0) return [];

  const massimo = Math.max(...proposte.map((p) => p.restaPerNotte));
  const viste = new Set(preferenze.regioniViste);

  const punteggio = (p: T): number => {
    const avanzo = massimo > 0 ? Math.max(0, p.restaPerNotte) / massimo : 0;
    const affinita = preferenze.pesoTipi[p.destinazione.tipo] ?? PESI.neutro;
    const base = PESI.avanzo * avanzo + PESI.affinita * affinita;
    return viste.has(p.destinazione.regione) ? base - PESI.regioneVista : base;
  };

  return proposte
    .map((p) => ({ p, punti: punteggio(p) }))
    .sort((a, b) => b.punti - a.punti)
    .map((x) => x.p);
}
