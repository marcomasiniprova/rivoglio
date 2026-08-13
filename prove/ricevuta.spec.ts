import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { consumaPass, creaPass, leggiPass } from "@/lib/check/pass";

/**
 * 🔴 «I 1,99 SI SCALANO DALLA PRATICA» NON SUCCEDEVA, DI NUOVO.
 *
 * Il 12/08 era stato costruito lo sconto perché la promessa esisteva in
 * quattro punti del sito e non la manteneva nessuno. Il collaudo del
 * 13/08 l'ha ripreso in flagrante sul sito vero: paghi 1,99 l'analisi,
 * arrivi al verdetto e leggi "Prepara la pratica a 14,90€". Totale
 * 16,89, cioè esattamente il difetto che si credeva chiuso.
 *
 * La causa non stava nel conto: stava nella ricevuta. Quel cookie dice
 * due cose, "hai pagato" e "ti resta del credito", e appena il credito
 * finiva veniva buttato via tutto, prova di pagamento compresa.
 *
 * ⚠️ La chiave di firma serve per emettere: senza, `creaPass` torna
 * null. Qui la si mette nell'ambiente prima di leggere il modulo.
 */

const RICEVUTA_VALE_MESI = 30 * 24 * 60 * 60 * 1000;

test("la ricevuta finita resta leggibile: è la prova che hai pagato", () => {
  const emessa = creaPass("ordine-prova", 1);
  test.skip(!emessa, "senza CHECK_PASS_SEGRETO non si emettono ricevute");
  const pass = leggiPass(emessa);
  expect(pass?.restano).toBe(1);

  const dopo = consumaPass(pass!);
  expect(dopo).not.toBeNull();

  const spesa = leggiPass(dopo);
  expect(spesa, "la ricevuta a zero deve restare leggibile").not.toBeNull();
  expect(spesa?.restano).toBe(0);
  expect(spesa?.ordine).toBe("ordine-prova");
});

test("una ricevuta scaduta invece non vale più", () => {
  const emessa = creaPass("ordine-vecchio", 1);
  test.skip(!emessa, "senza CHECK_PASS_SEGRETO non si emettono ricevute");
  const fraDueMesi = Date.now() + RICEVUTA_VALE_MESI + 86_400_000;
  expect(leggiPass(emessa, fraDueMesi)).toBeNull();
});

test("la rotta del check non cancella più la ricevuta", () => {
  /* È il punto esatto in cui il difetto è nato e l'unico da cui può
     tornare: cancellare il cookie qui vuol dire buttare la prova del
     pagamento insieme al credito. */
  const codice = readFileSync("app/api/verifica/route.ts", "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  expect(codice).not.toContain("cookies.delete");
});
