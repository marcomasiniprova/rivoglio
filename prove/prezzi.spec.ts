import { test, expect } from "@playwright/test";
import { COOKIE_PREZZO, LISTINI, confronto, euro, listinoDi, varianteValida } from "../lib/prezzi";

/**
 * IL TEST DEI DUE PREZZI (9/08).
 *
 * La cosa che deve reggere sopra ogni altra: chi vede 24,90 sulla landing
 * deve trovare 24,90 anche alla cassa. Se il prezzo balla fra una pagina e
 * l'altra il test misura la nostra incoerenza invece del prezzo, e nel
 * frattempo perdiamo la vendita.
 */

test.describe("I due listini", () => {
  test("le cifre sono quelle decise, scritte in italiano", () => {
    expect(LISTINI.a.singolaTesto).toBe("14,90€");
    expect(LISTINI.a.famigliaTesto).toBe("24,90€");
    expect(LISTINI.b.singolaTesto).toBe("24,90€");
    expect(LISTINI.b.famigliaTesto).toBe("39,90€");
    // mai il punto decimale all'inglese
    expect(euro(14.9)).not.toContain(".");
  });

  test("un cookie sporco non rompe niente: si torna al listino di sempre", () => {
    expect(varianteValida("c")).toBeNull();
    expect(varianteValida(undefined)).toBeNull();
    expect(listinoDi(null).singolaTesto).toBe("14,90€");
    expect(listinoDi("b").singolaTesto).toBe("24,90€");
  });

  test("il confronto coi portali torna col prezzo giusto, in tutte e due le varianti", () => {
    const a = confronto(LISTINI.a);
    expect(a.trattenutoPortale).toBe(210);
    expect(a.restanoPortale).toBe(390);
    expect(a.restanoNostro).toBe(585.1);

    const b = confronto(LISTINI.b);
    expect(b.restanoNostro).toBe(575.1);
    // in tutte e due resta a te molto piu' che col portale: e' l'argomento
    expect(b.restanoNostro).toBeGreaterThan(b.restanoPortale);
  });
});

test.describe("La variante segue la persona", () => {
  test("il sito assegna un prezzo alla prima visita e non lo cambia piu'", async ({ page }) => {
    await page.goto("/");
    const cookie = (await page.context().cookies()).find((c) => c.name === COOKIE_PREZZO);
    expect(cookie, "il proxy deve assegnare la variante alla prima visita").toBeTruthy();
    const primo = cookie!.value;
    expect(["a", "b"]).toContain(primo);

    // seconda visita: stessa persona, stesso prezzo
    await page.goto("/#prezzi");
    const dopo = (await page.context().cookies()).find((c) => c.name === COOKIE_PREZZO);
    expect(dopo?.value).toBe(primo);
  });

  test("il prezzo mostrato nei piani e' quello della variante assegnata", async ({ page }) => {
    await page.context().addCookies([
      { name: COOKIE_PREZZO, value: "b", url: "http://localhost:3100" },
    ]);
    await page.goto("/#prezzi");
    const sezione = page.locator("#prezzi");
    await expect(sezione).toContainText("24,90€");
    await expect(sezione).toContainText("39,90€");
  });
});
