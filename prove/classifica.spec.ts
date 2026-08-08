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

test("risponde anche a chi chiama da un'altra origine (l'app)", async ({ request }) => {
  const r = await request.get("/api/classifica");
  expect(r.headers()["access-control-allow-origin"]).toBe("*");
});
