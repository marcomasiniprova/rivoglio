import { test, expect } from "@playwright/test";
import { generaCodice, normalizzaCodice, formaCodiceValida } from "../lib/recensioni/buono";

/**
 * IL CODICE DELL'ANALISI GRATIS: usa e getta, guadagnato con una recensione.
 *
 * Non è più un cookie (era fragile e riusabile: un incerto non lo spendeva,
 * quindi restava vivo all'infinito, Valerio 15/08). Adesso è un CODICE che
 * il registro nel database segna bruciato al primo uso. Qui si prova solo la
 * FORMA e la pulizia dell'input; la validità (esiste, non ancora usato) la
 * decide il database, provata a parte contro il Supabase vero.
 */
test.describe("Il codice dell'analisi gratis", () => {
  test("un codice generato ha la forma RIV-XXXXX ed è accettato", () => {
    const c = generaCodice();
    expect(c).toMatch(/^RIV-[A-Z0-9]{5}$/);
    expect(formaCodiceValida(c)).toBe(true);
  });

  test("niente caratteri ambigui (0/O/1/I/L): un codice si detta a voce", () => {
    for (let i = 0; i < 300; i++) {
      const coda = generaCodice().slice(4); // dopo "RIV-"
      expect(coda).not.toMatch(/[O0I1L]/);
    }
  });

  test("due codici di fila non sono uguali", () => {
    expect(generaCodice()).not.toBe(generaCodice());
  });

  test("quello che l'utente incolla si ripulisce: maiuscolo, via gli spazi", () => {
    expect(normalizzaCodice("  riv-7k2p9 ")).toBe("RIV-7K2P9");
    expect(normalizzaCodice("RIV-7K2P9")).toBe("RIV-7K2P9");
  });

  test("una stringa a caso non ha la forma di un codice", () => {
    expect(formaCodiceValida("qualcosa")).toBe(false);
    expect(formaCodiceValida("")).toBe(false);
    expect(formaCodiceValida("RIV-ABCDEFG")).toBe(false); // troppo lungo
    expect(formaCodiceValida("RIV-abc12")).toBe(false); // minuscole: non normalizzato
    expect(formaCodiceValida("XXX-ABCDE")).toBe(false); // prefisso sbagliato
  });
});
