import { SOGLIA_MINUTI, type FattoVolo } from "@/lib/regole/eu261";

/**
 * L'INCROCIO DI DUE FONTI, per RIDURRE gli incerti senza aprire falsi
 * positivi (scelta di Valerio, 14/08: «aggiungi una seconda fonte, così non
 * perdiamo vendite vere ma non vendiamo false promesse»).
 *
 * Il problema: il primario (AeroDataBox) certifica l'orario di arrivo solo
 * quando il volo era tracciato "Live". Un volo vero e concluso, ma senza
 * quel bollo, oggi esce INCERTO e non si vende, anche quando l'orario c'è.
 *
 * L'idea: due fonti INDIPENDENTI che concordano sull'arrivo effettivo sono
 * un fatto solido quanto un tracciamento. Quando la seconda fonte conferma
 * l'orario del primario, l'orario diventa verificato e il volo si può
 * vendere. Quando le due NON concordano, il caso resta incerto (era già
 * così: è la rete che impedisce di vendere su un dato ballerino).
 *
 * ⚠️ LA REGOLA NUMERO UNO RESTA INTOCCABILE: mai un falso positivo. Per
 * questo la conferma NON scatta nella ZONA GRIGIA attorno alle 3 ore: lì un
 * errore di pochi minuti, magari condiviso da due fonti che leggono lo
 * stesso feed a monte, sposterebbe l'esito da «non spetta» a «spetta». In
 * quel margine, senza un tracciamento preciso, si resta incerti. Sopra la
 * zona grigia il volo è chiaramente idoneo; sotto è chiaramente non idoneo
 * (e lì non si vende comunque): confermare non rischia niente.
 */

/** Oltre questo scarto (minuti) le due fonti si contraddicono: incerto. */
export const SCARTO_DISCORDE_MIN = 15;
/** Entro questo scarto (minuti) le due fonti si confermano a vicenda. */
export const SCARTO_CONFERMA_MIN = 10;
/** La zona grigia sopra la soglia in cui NON si conferma per incrocio. */
export const MARGINE_INCROCIO_MIN = 20;

export type EsitoIncrocio = {
  /** Le due fonti non concordano sull'arrivo: il caso resta incerto. */
  discordanti: boolean;
  /** Due fonti d'accordo: l'orario è certo anche senza il "Live" del primario. */
  confermato: boolean;
};

const NIENTE: EsitoIncrocio = { discordanti: false, confermato: false };

/**
 * Confronta l'arrivo EFFETTIVO del primario con quello della seconda fonte.
 * `secondaEffettivoUtc` è l'unico dato che serve dalla seconda fonte: il suo
 * orario di arrivo effettivo (null se non l'ha o se il volo non è concluso).
 */
export function incrociaFonti(
  primario: FattoVolo,
  secondaEffettivoUtc: string | null | undefined,
): EsitoIncrocio {
  const a = primario.arrivoEffettivoUtc;
  const b = secondaEffettivoUtc ?? null;
  if (!a || !b) return NIENTE;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return NIENTE;

  const scarto = Math.abs(ta - tb) / 60_000;

  // Si contraddicono: non si vende (comportamento storico, invariato).
  if (scarto > SCARTO_DISCORDE_MIN) return { discordanti: true, confermato: false };

  // Concordano, ma non abbastanza stretto per promuovere un fatto a certo.
  if (scarto > SCARTO_CONFERMA_MIN) return NIENTE;

  // Il primario era già certo di suo: non c'è niente da confermare.
  if (primario.orarioVerificato === true) return NIENTE;

  // Serve l'orario previsto per sapere se siamo vicini alla soglia.
  const previsto = primario.arrivoPrevistoUtc ? Date.parse(primario.arrivoPrevistoUtc) : NaN;
  if (!Number.isFinite(previsto)) return NIENTE;
  const ritardo = (ta - previsto) / 60_000;

  /* La zona grigia: da 180 a 200 minuti. Qui un incrocio non basta, perché
     un errore di pochi minuti cambierebbe l'esito. Si resta incerti. */
  if (ritardo >= SOGLIA_MINUTI && ritardo < SOGLIA_MINUTI + MARGINE_INCROCIO_MIN) return NIENTE;

  return { discordanti: false, confermato: true };
}
