import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { ingressoDopoPagamento } from "../lib/pratiche/ingresso";

/**
 * CHI È COLLEGATO NON DEVE USCIRE DALLA WEB APP.
 *
 * 🔴 Valerio, 13/08: «quando rifai un'altra analisi loggato nella web app
 * e paghi, vieni fatto uscire dalla web app e fatto ritornare nel sito».
 *
 * Le cause erano due, in due punti lontani:
 * 1. la pagina del verdetto aveva una sola uscita, `/`, cioè la landing
 *    di vendita: chi ha già un account finiva sulla pagina che serve a
 *    convincere gli estranei;
 * 2. dopo il pagamento si passava SEMPRE dal link di accesso, che esce
 *    su supabase.co e rientra da `/auth/conferma`. Per chi la sessione
 *    ce l'aveva già era un giro fuori casa per rientrare in casa, e per
 *    chi era collegato con un altro indirizzo era pure un cambio di
 *    account fatto di nascosto.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("Dopo il pagamento", () => {
  test("con la sessione giusta si va dritti alla pratica, senza uscire dal sito", async () => {
    const dove = await ingressoDopoPagamento(
      "trec.tun@gmail.com",
      "/pratica/abc",
      "trec.tun@gmail.com",
    );
    expect(dove).toBe("/pratica/abc");
    expect(dove.startsWith("http")).toBe(false);
  });

  test("le maiuscole non contano: è la stessa persona", async () => {
    const dove = await ingressoDopoPagamento("Mario@Gmail.com", "/pratica/abc", "mario@gmail.com");
    expect(dove).toBe("/pratica/abc");
  });

  test("senza sessione si passa dal link di accesso, come prima", async () => {
    /* Senza chiavi Supabase il link non si genera e si ripiega
       sull'indirizzo pieno: quello che conta è che NON sia il percorso
       nudo, cioè che la strada del link resti quella. */
    const dove = await ingressoDopoPagamento("chi@esempio.it", "/pratica/abc", null);
    expect(dove).not.toBe("/pratica/abc");
    expect(dove.startsWith("http")).toBe(true);
  });

  test("🔴 collegato con un ALTRO indirizzo: non si scambia l'account di nascosto", async () => {
    const dove = await ingressoDopoPagamento(
      "moglie@gmail.com",
      "/pratica/abc",
      "marito@gmail.com",
    );
    // Non è la sua sessione: deve passare dall'accesso vero.
    expect(dove).not.toBe("/pratica/abc");
  });
});

test.describe("La pagina del verdetto sa chi sta guardando", () => {
  test("l'uscita in alto porta alla web app se sei collegato, alla landing se no", () => {
    // Dal 14/08 il cuore della pagina è in contenuto.tsx (indirizzo pulito):
    // /verifica/[id] è un guscio che lo richiama. Il comportamento è lì.
    const testo = leggi("app/verifica/contenuto.tsx");
    expect(testo).toContain('href={collegato ? "/app" : "/"}');
  });

  test("il collegamento si legge dalla sessione, non da un parametro nell'indirizzo", () => {
    /* Un `?da=app` si perde al primo rimbalzo e si falsifica a mano.
       Chi sta guardando lo dice la sessione. */
    // Dal 14/08 il cuore della pagina è in contenuto.tsx (indirizzo pulito):
    // /verifica/[id] è un guscio che lo richiama. Il comportamento è lì.
    const testo = leggi("app/verifica/contenuto.tsx");
    expect(testo).toContain("await utenteCollegato()");
  });
});

test.describe("La cassa di prova usa la stessa porta", () => {
  test("non chiama più il link di accesso a scatola chiusa", () => {
    const testo = leggi("app/api/pratiche/prova/route.ts");
    expect(testo).toContain("ingressoDopoPagamento");
    expect(testo).not.toContain("await linkDiIngresso(");
  });
});
