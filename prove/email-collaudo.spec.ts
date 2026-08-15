import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { componiConferma, componiBenvenuto } from "../lib/email/messaggi";
import { daRiprovare } from "../lib/email/posta";

/**
 * COLLAUDO DEL SISTEMA EMAIL (Valerio, 15/08).
 *
 * Le email vere le manda Resend, che qui in sandbox non è configurato:
 * questo collaudo guarda quello che si può provare senza spedire, cioè che
 * (1) le email si compongono bene e non perdono pezzi, (2) il ritentativo
 * riprova solo su ciò che può migliorare al secondo colpo, (3) ogni
 * percorso che manda un'email non fallisce in silenzio dove conta.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

/* Nessuna email deve contenere questi segni: sono i buchi tipici di un
   template (un valore non passato, un conto sbagliato, un oggetto stampato
   invece del testo). */
function pulita(html: string) {
  expect(html).toContain("<!doctype html>");
  expect(html).toContain('lang="it"');
  expect(html).not.toContain("undefined");
  expect(html).not.toContain("NaN");
  expect(html).not.toContain("[object Object]");
  expect(html).not.toMatch(/\$\{/); // un segnaposto non risolto
}

test.describe("Le email si compongono senza buchi", () => {
  test("la richiesta di conferma: link, testo, niente buchi", () => {
    const { html, testo, oggetto } = componiConferma("https://rivolio.it/api/iscriviti/conferma?g=x");
    pulita(html);
    expect(oggetto.length).toBeGreaterThan(3);
    expect(html).toContain("https://rivolio.it/api/iscriviti/conferma?g=x");
    // La versione solo testo non è mai vuota (se no finisci in spam).
    expect(testo.trim().length).toBeGreaterThan(20);
    expect(testo).toContain("https://rivolio.it/api/iscriviti/conferma?g=x");
  });

  test("il benvenuto dell'Osservatorio ha la disdetta (è newsletter)", () => {
    const { html, testo } = componiBenvenuto(
      [{ nome: "Roma Fiumicino", indice: 1.9, medianaMinuti: 33 }],
      "https://rivolio.it/api/iscriviti/disdetta?g=x",
    );
    pulita(html);
    // Una newsletter DEVE avere il modo di disdire, per legge e per non finire in spam.
    expect(html).toContain("https://rivolio.it/api/iscriviti/disdetta?g=x");
    expect(html).toContain("Non voglio più ricevere");
    expect(testo.trim().length).toBeGreaterThan(20);
  });

  test("il benvenuto regge anche senza scali (nessun dato quel giorno)", () => {
    // Se l'Osservatorio non ha dati, il benvenuto non deve rompersi.
    const { html } = componiBenvenuto([], null);
    pulita(html);
  });
});

test.describe("Il ritentativo riprova solo dove ha senso", () => {
  test("429 e 5xx si riprovano", () => {
    expect(daRiprovare(429)).toBe(true);
    expect(daRiprovare(500)).toBe(true);
    expect(daRiprovare(503)).toBe(true);
  });

  test("un 4xx (indirizzo sbagliato) NON si riprova", () => {
    expect(daRiprovare(400)).toBe(false);
    expect(daRiprovare(422)).toBe(false);
    expect(daRiprovare(undefined)).toBe(false);
  });
});

test.describe("Nessuna email critica si perde in silenzio", () => {
  test("l'iscrizione ASPETTA l'invio prima di rispondere", () => {
    /* La lezione dell'8/08: un invio lanciato senza await muore quando la
       funzione Netlify si congela, e la newsletter "funzionava" senza che
       arrivasse niente. */
    const r = leggi("app/api/iscriviti/route.ts");
    expect(r).toContain("await chiediConferma");
  });

  test("il benvenuto pagato (T+0) lo recupera il cron se non parte", () => {
    const r = leggi("app/api/motore/segui/route.ts");
    expect(r).toContain("recuperaBenvenuto");
    expect(r).toContain("praticaPronta");
  });

  test("il gancio email di Supabase risponde 500 se l'invio fallisce (così riprova)", () => {
    /* Se un'email di autenticazione non parte, l'utente resta chiuso fuori:
       il 500 dice a Supabase di riprovare. */
    const r = leggi("app/api/posta-auth/route.ts");
    expect(r).toContain("status: 500");
  });
});
