/**
 * LA FINESTRA FRA IL CODICE E LA MIGRAZIONE.
 *
 * Il codice arriva sul sito appena si fa il deploy; la migrazione la
 * applica una persona, quando può. In mezzo c'è una finestra in cui il
 * codice chiede una colonna che sul database vero non esiste ancora, e
 * Postgres non risponde "quella colonna è vuota": fa fallire TUTTA la
 * lettura (errore 42703). Una pagina intera si spegne per un campo
 * accessorio.
 *
 * Riconoscere quell'errore serve a riprovare senza il campo nuovo, che
 * è sempre meglio di non rispondere: il resto della pratica c'è tutto.
 */
export function colonnaMancante(messaggio: string | undefined): boolean {
  const m = (messaggio ?? "").toLowerCase();
  return m.includes("does not exist") || m.includes("could not find") || m.includes("schema cache");
}
