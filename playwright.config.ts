import { defineConfig, devices } from "@playwright/test";

/**
 * Prove sul browser vero. Servono a rispondere a una domanda sola:
 * "la pagina funziona davvero o me lo sto raccontando?"
 * Lancia:  npm run prove        (headless)
 *          npm run prove:occhi  (col browser visibile)
 */
export default defineConfig({
  testDir: "./prove",
  // Le catture sono strumenti per guardare, non prove: fuori dal giro normale.
  // Per lanciarle: CATTURA=1 npx playwright test prove/cattura-nostro.spec.ts
  testIgnore: process.env.CATTURA ? [] : ["**/cattura-*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  /* Il check racconta l'analisi per ~16 secondi prima di dare il verdetto
     (scelta di Valerio, 8/08): i 30 secondi di serie non bastano più. */
  timeout: 90_000,
  reporter: [["list"], ["html", { outputFolder: "prove/report", open: "never" }]],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "it-IT",
    timezoneId: "Europe/Rome",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "telefono", use: { ...devices["Pixel 7"] } },
  ],

  // Se BASE_URL e' gia' impostata, un server sta gia' girando: non ne avvio un altro.
  // (Next rifiuta un secondo `next dev` sulla stessa cartella.)
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 3100",
        url: "http://localhost:3100",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        /* Le prove girano SEMPRE in modalità demo: con le chiavi vere nei
           .env locali il fornitore reale si accenderebbe e l'esito
           dipenderebbe dalla rete (successo l'8/08: chiave salvata, demo
           spenta, prove rosse). Qui le chiavi si azzerano apposta. */
        env: {
          AERODATABOX_API_KEY: "",
          AVIATIONSTACK_API_KEY: "",
        },
      },
});
