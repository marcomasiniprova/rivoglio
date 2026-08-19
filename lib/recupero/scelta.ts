import { giorniFra } from "@/lib/tempo";

/**
 * CHI, E QUANDO, riceve un promemoria di recupero.
 *
 * A cosa serve (framework CONVERTI, "recupera chi non ha comprato"): chi ha
 * fatto un check, ha lasciato l'email e NON ha aperto la pratica riceve fino
 * a DUE email. Poi basta. Questa funzione dice SE e QUALE passo mandare, in
 * modo deterministico: non scrive niente e non conosce nessuna cifra.
 *
 * Le regole, scelte da Valerio:
 * - solo idonei e incerti (un non idoneo non ha niente da recuperare);
 * - due passi, al giorno 1 e al giorno 4;
 * - mai a chi si è disiscritto, mai a chi ha già aperto la pratica;
 * - mai a un check più vecchio della finestra: un promemoria dopo settimane
 *   è spam, e alla PRIMA accensione questa finestra evita di scrivere di
 *   colpo a tutto lo storico.
 */

/** Oltre questi giorni, un check è troppo vecchio per un promemoria. */
export const FINESTRA_RECUPERO_GIORNI = 14;

/** Il ritardo minimo, in giorni, prima di ciascun passo. Indice 0 = primo
 *  passo (giorno 1), indice 1 = secondo passo (giorno 4). */
export const GIORNI_RECUPERO = [1, 4] as const;

export type StatoRecupero = {
  esito: string;
  email: string | null;
  /** `verifiche.creata_il`, ISO. */
  creataIl: string;
  /** Quanti passi già mandati: 0, 1 o 2. */
  recuperoPasso: number;
  /** Vero se la persona si è disiscritta dai promemoria. */
  recuperoStop: boolean;
  /** Vero se per questa verifica esiste già una pratica: allora niente. */
  haPratica: boolean;
};

/**
 * Il passo da mandare ORA (1 o 2), oppure null se nessuno. `adesso` si passa
 * nelle prove per fissare il tempo; in produzione è l'ora vera.
 */
export function passoDaMandare(v: StatoRecupero, adesso?: Date): 1 | 2 | null {
  if (v.recuperoStop || !v.email || v.haPratica) return null;
  if (v.esito !== "idoneo" && v.esito !== "incerto") return null;
  if (v.recuperoPasso >= 2) return null;

  const eta = giorniFra(v.creataIl, adesso);
  if (eta > FINESTRA_RECUPERO_GIORNI) return null;

  // recuperoPasso 0 → serve il giorno GIORNI_RECUPERO[0]; passo 1 → [1].
  const sogliaGiorni = GIORNI_RECUPERO[v.recuperoPasso];
  if (sogliaGiorni === undefined || eta < sogliaGiorni) return null;

  return (v.recuperoPasso + 1) as 1 | 2;
}
