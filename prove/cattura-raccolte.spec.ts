import { test } from "@playwright/test";

/** Solo raccolta, piu' giri di fila. Strumento CATTURA. */
test("tre giri di raccolta", async ({ request }) => {
  test.setTimeout(180_000);
  for (let i = 0; i < 3; i++) {
    const r = await request.post("/api/motore/raccogli");
    console.log(`GIRO ${i + 1}:`, JSON.stringify(await r.json()));
  }
});
