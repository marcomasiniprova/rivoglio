import { test, expect } from "@playwright/test";

/**
 * LA CLASSIFICA: l'interruttore prima di tutto.
 *
 * Scelta di Valerio (8/08): costruita completa, ma al lancio SPENTA
 * finché non ci sono 10 giorni di vincite vere. Quindi la prova che
 * conta è questa: senza CLASSIFICA_ATTIVA=1 la rotta risponde
 * {attiva:false} e l'app nasconde la sezione. Se questa prova fallisce,
 * la classifica è accesa per sbaglio.
 */

test("da spenta risponde attiva:false, senza voci e senza errori", async ({ request }) => {
  const r = await request.get("/api/classifica");
  expect(r.ok()).toBe(true);
  const corpo = await r.json();
  expect(corpo.ok).toBe(true);
  expect(corpo.attiva).toBe(false);
  expect(corpo.voci).toBeUndefined();
});

test("il CORS è chiuso alla nostra origine, non più aperto a chiunque", async ({ request }) => {
  /* Prima rispondeva "*": qualunque sito poteva leggerla dal browser di un
     suo visitatore. Il team di sicurezza l'ha segnalato (giro #36). Ora
     l'header c'è ma è la NOSTRA origine, non "*". L'app nativa non è un
     browser: il CORS non la riguarda e continua a leggere. */
  const r = await request.get("/api/classifica");
  const acao = r.headers()["access-control-allow-origin"];
  expect(acao).toBeTruthy();
  expect(acao).not.toBe("*");
});
