import { describe, expect, test } from "@jest/globals";
import { costruisci, PARTENZE } from "../costruttore";

/**
 * Prove sul costruttore di micro-vacanze, portate dal sito
 * (prove/viaggio.spec.ts). La sostanza dei casi è la stessa: qui cambia
 * solo il corridore (jest invece di Playwright).
 */

describe("costruttore di micro-vacanze", () => {
  test("da Bologna con 120€ in 2 trova qualcosa", () => {
    const e = costruisci({
      partenza: "Bologna",
      budgetPersona: 120,
      notti: 2,
      persone: 2,
      tipi: [],
      oreMax: 2.5,
      prezzoBenzina: 1.994,
    });
    expect(e.ok).toBe(true);
    if (!e.ok) return;
    expect(e.proposte.length).toBeGreaterThan(0);
    expect(e.proposte.length).toBeLessThanOrEqual(3);
  });

  test("non propone MAI posti oltre le ore chieste", () => {
    const e = costruisci({
      partenza: "Milano",
      budgetPersona: 200,
      notti: 2,
      persone: 2,
      tipi: [],
      oreMax: 2,
      prezzoBenzina: 1.994,
    });
    if (!e.ok) return;
    for (const p of e.proposte) expect(p.conto.ore).toBeLessThanOrEqual(2);
  });

  test("non propone MAI posti che sforano il budget", () => {
    const budgetPersona = 80;
    const e = costruisci({
      partenza: "Bologna",
      budgetPersona,
      notti: 2,
      persone: 2,
      tipi: [],
      oreMax: 3,
      prezzoBenzina: 1.994,
    });
    if (!e.ok) return;
    for (const p of e.proposte) {
      expect(p.conto.aPersona).toBeLessThan(budgetPersona);
      expect(p.restaPerDormire).toBeGreaterThan(0);
    }
  });

  test("il filtro sul tipo viene rispettato", () => {
    const e = costruisci({
      partenza: "Bologna",
      budgetPersona: 200,
      notti: 2,
      persone: 2,
      tipi: ["terme"],
      oreMax: 4,
      prezzoBenzina: 1.994,
    });
    if (!e.ok) return;
    for (const p of e.proposte) expect(p.destinazione.tipo).toBe("terme");
  });

  test("non propone mai isole: in auto non ci arrivi", () => {
    const e = costruisci({
      partenza: "Napoli",
      budgetPersona: 400,
      notti: 3,
      persone: 2,
      tipi: [],
      oreMax: 10,
      prezzoBenzina: 1.994,
    });
    if (!e.ok) return;
    for (const p of e.proposte) expect(p.destinazione.isola).toBeFalsy();
  });

  test("chi parte da un'isola riceve una spiegazione, non un risultato falso", () => {
    const e = costruisci({
      partenza: "Palermo",
      budgetPersona: 200,
      notti: 2,
      persone: 2,
      tipi: [],
      oreMax: 4,
      prezzoBenzina: 1.994,
    });
    expect(e.ok).toBe(false);
    if (e.ok) return;
    expect(e.motivo).toContain("isola");
  });

  test("con un budget impossibile spiega perché, invece di non dire niente", () => {
    const e = costruisci({
      partenza: "Milano",
      budgetPersona: 31,
      notti: 3,
      persone: 1,
      tipi: [],
      oreMax: 1.5,
      prezzoBenzina: 1.994,
    });
    expect(e.ok).toBe(false);
    if (e.ok) return;
    expect(e.motivo.length).toBeGreaterThan(30);
  });

  test("ogni comune di partenza in elenco produce una risposta sensata", () => {
    for (const p of PARTENZE) {
      const e = costruisci({
        partenza: p.nome,
        budgetPersona: 250,
        notti: 2,
        persone: 2,
        tipi: [],
        oreMax: 4,
        prezzoBenzina: 1.994,
      });
      // jest non accetta il messaggio come secondo argomento di expect:
      // il nome del comune viaggia nel valore confrontato, così il
      // fallimento dice comunque quale partenza è andata storta.
      if (p.isola) expect({ nome: p.nome, ok: e.ok }).toEqual({ nome: p.nome, ok: false });
      else expect({ nome: p.nome, tipo: typeof e.ok }).toEqual({ nome: p.nome, tipo: "boolean" });
    }
  });
});
