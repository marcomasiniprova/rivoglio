import { describe, expect, test } from "@jest/globals";
import { contoViaggio, distanzaAria, kmStrada, oreLeggibili } from "../viaggio";

/**
 * Prove sul calcolo del viaggio, portate dal sito (prove/viaggio.spec.ts).
 * Qui un errore significa PREZZI SBAGLIATI mostrati agli utenti, quindi
 * queste prove non si cancellano e non si indeboliscono per farle passare.
 */

const MILANO = { lat: 45.464, lng: 9.19 };
const GENOVA = { lat: 44.407, lng: 8.934 };
const ROMA = { lat: 41.903, lng: 12.496 };

describe("calcolo del viaggio", () => {
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
