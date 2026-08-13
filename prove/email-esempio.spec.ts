import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { voloDimostrativo } from "@/lib/voli/fornitori/demo";

/**
 * 🔴 UN'EMAIL VERA CHE PROMETTE 250€ PER UN VOLO CHE NON ESISTE.
 *
 * Trovata col collaudo del 13/08 leggendo la posta arrivata davvero: per
 * il volo dimostrativo ZZ250 partiva un'email identica a quella di un
 * caso vero, «Il tuo volo vale 250€», senza nessun segno che fosse un
 * esempio. Sulla pagina il bollo c'è; nell'email no, e l'email è la cosa
 * che resta nella casella e che uno rilegge fra un mese.
 *
 * È la regola 3 del progetto: mai un dato finto che sembra vero.
 */

test("i voli dimostrativi si riconoscono dal prefisso, comunque scritti", () => {
  expect(voloDimostrativo("ZZ250")).toBe(true);
  expect(voloDimostrativo("zz250")).toBe(true);
  expect(voloDimostrativo(" ZZ404 ")).toBe(true);
  expect(voloDimostrativo("FR4001")).toBe(false);
  expect(voloDimostrativo("AZ204")).toBe(false);
  expect(voloDimostrativo(null)).toBe(false);
  /* ⚠️ Zanzibar (ZNZ) e Zurigo (ZRH) sono scali, non compagnie: qui si
     guarda il numero del VOLO, e una compagnia con prefisso ZZ non
     esiste. Ma se un giorno esistesse, questa prova la fa notare. */
  expect(voloDimostrativo("ZN123")).toBe(false);
});

test("l'email del verdetto porta il bollo quando il volo è un esempio", () => {
  const email = readFileSync("lib/email/verdetto.ts", "utf8");
  expect(email).toContain("Esempio dimostrativo");
  /* Il bollo deve stare in tutti e tre i posti che una persona vede: la
     riga dell'elenco della posta, il corpo, e la versione senza grafica
     (che è quella che leggono certi client e i lettori di schermo). */
  expect(email.match(/Esempio dimostrativo|ESEMPIO DIMOSTRATIVO/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
});

test("chi manda l'email dice se il volo è un esempio", () => {
  const rotta = readFileSync("app/api/verifica/email/route.ts", "utf8");
  expect(rotta).toContain("demo: voloDimostrativo(riga.volo_iata)");
});
