import { test, expect } from "@playwright/test";

/** Solo abbinamento e invio. Strumento CATTURA. */
test("abbina e invia", async ({ request }) => {
  test.setTimeout(120_000);
  const r = await request.post("/api/motore/abbina");
  const esito = await r.json();
  console.log("\n=== ABBINAMENTO ===\n" + JSON.stringify(esito, null, 1));
  expect(esito.ok).toBe(true);
});
