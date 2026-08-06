import { test, expect } from "@playwright/test";
import { contoViaggio, distanzaAria, kmStrada, oreLeggibili } from "../lib/viaggio";
import { costruisci, PARTENZE } from "../lib/costruttore";

/**
 * Prove sul calcolo del viaggio e sul costruttore.
 * Qui un errore significa PREZZI SBAGLIATI mostrati agli utenti, quindi
 * queste prove non si cancellano e non si indeboliscono per farle passare.
 */

const MILANO = { lat: 45.464, lng: 9.19 };
const GENOVA = { lat: 44.407, lng: 8.934 };
const ROMA = { lat: 41.903, lng: 12.496 };

test.describe("calcolo del viaggio", () => {
  test("la distanza in linea d'aria Milano-Genova è quella vera (~118 km)", () => {
    const km = distanzaAria(MILANO, GENOVA);
    expect(km).toBeGreaterThan(110);
    expect(km).toBeLessThan(126);
  });

  test("i km di strada sono più della linea d'aria, mai meno", () => {
    expect(kmStrada(MILANO, GENOVA)).toBeGreaterThan(distanzaAria(MILANO, GENOVA));
    expect(kmStrada(MILANO, ROMA)).toBeGreaterThan(distanzaAria(MILANO, ROMA));
  });

  test("la stima Milano-Genova cade vicino ai 145 km reali via A7", () => {
    const km = kmStrada(MILANO, GENOVA);
    expect(km).toBeGreaterThan(130);
    expect(km).toBeLessThan(165);
  });

  test("il costo si divide davvero per le persone", () => {
    const base = { da: MILANO, a: GENOVA, prezzoBenzina: 1.994 };
    const uno = contoViaggio({ ...base, persone: 1 });
    const quattro = contoViaggio({ ...base, persone: 4 });
    expect(uno.totale).toBeCloseTo(quattro.totale, 5);
    expect(quattro.aPersona).toBeCloseTo(uno.aPersona / 4, 5);
  });

  test("più lontano costa di più, sempre", () => {
    const vicino = contoViaggio({ da: MILANO, a: GENOVA, persone: 2, prezzoBenzina: 1.994 });
    const lontano = contoViaggio({ da: MILANO, a: ROMA, persone: 2, prezzoBenzina: 1.994 });
    expect(lontano.totale).toBeGreaterThan(vicino.totale);
    expect(lontano.ore).toBeGreaterThan(vicino.ore);
  });

  test("il conto torna: benzina + pedaggi = totale", () => {
    const c = contoViaggio({ da: MILANO, a: ROMA, persone: 2, prezzoBenzina: 1.994 });
    expect(c.benzina + c.pedaggi).toBeCloseTo(c.totale, 6);
    expect(c.litri).toBeCloseTo(c.kmTotali / 15, 6);
    expect(c.kmTotali).toBeCloseTo(c.kmSolaAndata * 2, 6);
  });

  test("input impossibili vengono rifiutati invece di dare numeri assurdi", () => {
    expect(() => contoViaggio({ da: MILANO, a: ROMA, persone: 0, prezzoBenzina: 1.9 })).toThrow();
    expect(() => contoViaggio({ da: MILANO, a: ROMA, persone: 2, prezzoBenzina: 0 })).toThrow();
  });

  test("le ore si scrivono come le legge una persona", () => {
    expect(oreLeggibili(2)).toBe("2h00");
    expect(oreLeggibili(2.5)).toBe("2h30");
    expect(oreLeggibili(1.833)).toBe("1h50");
  });
});

test.describe("costruttore di micro-vacanze", () => {
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
      if (p.isola) expect(e.ok, `${p.nome} è un'isola`).toBe(false);
      else expect(typeof e.ok, p.nome).toBe("boolean");
    }
  });
});
