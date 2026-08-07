import { describe, expect, test } from "@jest/globals";
import { LISCIATURA, PESI, ordina, preferenzeDaStorico, type Preferenze } from "../punteggio";
import { costruisci } from "../costruttore";
import type { Tipo } from "../destinazioni";

/**
 * Prove sul punteggio. Ogni numero atteso è DERIVATO qui dentro dalle
 * costanti dichiarate dal modulo (PESI, LISCIATURA), mai scritto a mano:
 * se un peso cambia, le prove seguono la formula, non un valore magico.
 */

type Voce = { tipo: Tipo; aperto: boolean; regione?: string };
const ripeti = (voce: Voce, volte: number): Voce[] =>
  Array.from({ length: volte }, () => voce);

/** La stessa formula di lisciatura dichiarata dal modulo. */
const pesoAtteso = (aperte: number, totali: number): number =>
  (aperte + LISCIATURA.aperte) / (totali + LISCIATURA.totali);

type Proposta = {
  destinazione: { nome: string; tipo: Tipo; regione: string };
  restaPerNotte: number;
};
const proposta = (
  nome: string,
  tipo: Tipo,
  regione: string,
  restaPerNotte: number,
): Proposta => ({ destinazione: { nome, tipo, regione }, restaPerNotte });

const nomi = (proposte: Proposta[]): string[] =>
  proposte.map((p) => p.destinazione.nome);

/** Lo stesso punteggio documentato in `ordina`, ricalcolato a mano. */
const punteggioAtteso = (p: Proposta, prefs: Preferenze, massimo: number): number => {
  const avanzo = massimo > 0 ? p.restaPerNotte / massimo : 0;
  const affinita = prefs.pesoTipi[p.destinazione.tipo] ?? PESI.neutro;
  const base = PESI.avanzo * avanzo + PESI.affinita * affinita;
  return prefs.regioniViste.includes(p.destinazione.regione)
    ? base - PESI.regioneVista
    : base;
};

describe("preferenzeDaStorico", () => {
  test("storico vuoto: nessun peso e nessuna regione", () => {
    const p = preferenzeDaStorico([]);
    expect(p.pesoTipi).toEqual({});
    expect(p.regioniViste).toEqual([]);
  });

  test("chi apre il mare e ignora la montagna pesa il mare di più", () => {
    const p = preferenzeDaStorico([
      ...ripeti({ tipo: "mare", aperto: true }, 3),
      { tipo: "mare", aperto: false },
      ...ripeti({ tipo: "monte", aperto: false }, 2),
    ]);
    expect(p.pesoTipi.mare).toBeCloseTo(pesoAtteso(3, 4), 10);
    expect(p.pesoTipi.monte).toBeCloseTo(pesoAtteso(0, 2), 10);
    expect(p.pesoTipi.mare!).toBeGreaterThan(p.pesoTipi.monte!);
  });

  test("la lisciatura tiene i pesi lontani dagli estremi, anche con tanto storico", () => {
    const ignorata = preferenzeDaStorico(ripeti({ tipo: "citta", aperto: false }, 50));
    expect(ignorata.pesoTipi.citta).toBeCloseTo(pesoAtteso(0, 50), 10);
    expect(ignorata.pesoTipi.citta!).toBeGreaterThan(0);

    const amata = preferenzeDaStorico(ripeti({ tipo: "terme", aperto: true }, 50));
    expect(amata.pesoTipi.terme).toBeCloseTo(pesoAtteso(50, 50), 10);
    expect(amata.pesoTipi.terme!).toBeLessThan(1);
  });

  test("un tipo mai visto non compare: parte neutro, e il neutro è la formula a zero osservazioni", () => {
    const p = preferenzeDaStorico([{ tipo: "mare", aperto: true }]);
    expect(p.pesoTipi.terme).toBeUndefined();
    expect(pesoAtteso(0, 0)).toBe(PESI.neutro);
  });

  test("raccoglie le regioni viste, senza doppioni, se il chiamante le allega", () => {
    // la firma del contratto porta solo tipo e aperto: la regione viaggia
    // come campo in più, quindi serve una variabile tipata, non un letterale
    const storico: Voce[] = [
      { tipo: "mare", aperto: true, regione: "Liguria" },
      { tipo: "monte", aperto: false, regione: "Liguria" },
      { tipo: "terme", aperto: false, regione: "Toscana" },
    ];
    const p = preferenzeDaStorico(storico);
    expect(p.regioniViste).toEqual(["Liguria", "Toscana"]);
  });
});

describe("ordina", () => {
  test("con storico vuoto comanda solo l'avanzo per notte", () => {
    const prefs = preferenzeDaStorico([]);
    const proposte = [
      proposta("Bormio", "monte", "Lombardia", 60),
      proposta("Saturnia", "terme", "Toscana", 95),
      proposta("Camogli", "mare", "Liguria", 80),
    ];
    const attese = nomi([...proposte].sort((a, b) => b.restaPerNotte - a.restaPerNotte));
    expect(nomi(ordina(proposte, prefs))).toEqual(attese);
  });

  test("chi apre solo mare vede il mare salire, a parità di avanzo", () => {
    const prefs = preferenzeDaStorico([
      ...ripeti({ tipo: "mare", aperto: true }, 4),
      ...ripeti({ tipo: "monte", aperto: false }, 4),
    ]);
    // avanzo identico: decide l'affinità, e il mare pesa di più
    expect(pesoAtteso(4, 4)).toBeGreaterThan(pesoAtteso(0, 4));

    const proposte = [
      proposta("Andalo", "monte", "Trentino-Alto Adige", 70),
      proposta("Camogli", "mare", "Liguria", 70),
    ];
    expect(nomi(ordina(proposte, prefs))).toEqual(["Camogli", "Andalo"]);
  });

  test("l'affinità ribalta un piccolo svantaggio di avanzo, non uno grande", () => {
    const prefs = preferenzeDaStorico([
      ...ripeti({ tipo: "mare", aperto: true }, 5),
      ...ripeti({ tipo: "monte", aperto: false }, 5),
    ]);

    // piccolo svantaggio: 85 contro 100. I punteggi derivati dicono mare prima.
    const poco = [
      proposta("Bormio", "monte", "Lombardia", 100),
      proposta("Rimini", "mare", "Emilia-Romagna", 85),
    ];
    const massimo = 100;
    expect(punteggioAtteso(poco[1], prefs, massimo)).toBeGreaterThan(
      punteggioAtteso(poco[0], prefs, massimo),
    );
    expect(nomi(ordina(poco, prefs))).toEqual(["Rimini", "Bormio"]);

    // grande svantaggio: 40 contro 100. L'avanzo resta il criterio principale.
    const tanto = [
      proposta("Bormio", "monte", "Lombardia", 100),
      proposta("Rimini", "mare", "Emilia-Romagna", 40),
    ];
    expect(punteggioAtteso(tanto[0], prefs, massimo)).toBeGreaterThan(
      punteggioAtteso(tanto[1], prefs, massimo),
    );
    expect(nomi(ordina(tanto, prefs))).toEqual(["Bormio", "Rimini"]);
  });

  test("a parità, una regione già vista scende per variare le proposte", () => {
    const prefs: Preferenze = { pesoTipi: {}, regioniViste: ["Liguria"] };
    const proposte = [
      proposta("Camogli", "mare", "Liguria", 70),
      proposta("Numana", "mare", "Marche", 70),
    ];
    expect(nomi(ordina(proposte, prefs))).toEqual(["Numana", "Camogli"]);

    // senza regioni viste la parità conserva l'ordine di arrivo
    const neutre: Preferenze = { pesoTipi: {}, regioniViste: [] };
    expect(nomi(ordina(proposte, neutre))).toEqual(["Camogli", "Numana"]);
  });

  test("la penalità di regione è leggera: non ribalta un vantaggio vero di avanzo", () => {
    const prefs: Preferenze = { pesoTipi: {}, regioniViste: ["Liguria"] };
    const proposte = [
      proposta("Camogli", "mare", "Liguria", 80),
      proposta("Numana", "mare", "Marche", 70),
    ];
    // il distacco di avanzo pesato supera la penalità: derivato, non a occhio
    const distacco = PESI.avanzo * (1 - 70 / 80);
    expect(distacco).toBeGreaterThan(PESI.regioneVista);
    expect(nomi(ordina(proposte, prefs))).toEqual(["Camogli", "Numana"]);
  });

  test("un tipo mai visto sta in mezzo: batte un tipo ignorato, perde da uno aperto", () => {
    const prefs = preferenzeDaStorico([
      { tipo: "mare", aperto: true },
      ...ripeti({ tipo: "monte", aperto: false }, 2),
    ]);
    expect(pesoAtteso(1, 1)).toBeGreaterThan(PESI.neutro);
    expect(pesoAtteso(0, 2)).toBeLessThan(PESI.neutro);

    const proposte = [
      proposta("Bormio", "monte", "Lombardia", 50),
      proposta("Saturnia", "terme", "Toscana", 50),
      proposta("Camogli", "mare", "Liguria", 50),
    ];
    expect(nomi(ordina(proposte, prefs))).toEqual(["Camogli", "Saturnia", "Bormio"]);
  });

  test("non tocca l'array ricevuto ed è deterministico", () => {
    const prefs = preferenzeDaStorico([{ tipo: "mare", aperto: true }]);
    const proposte = [
      proposta("Bormio", "monte", "Lombardia", 60),
      proposta("Camogli", "mare", "Liguria", 55),
    ];
    const ordineDiArrivo = nomi(proposte);

    const prima = ordina(proposte, prefs);
    const seconda = ordina(proposte, prefs);

    expect(nomi(proposte)).toEqual(ordineDiArrivo);
    expect(prima).not.toBe(proposte);
    expect(nomi(prima)).toEqual(nomi(seconda));
  });

  test("accetta le Proposte vere del costruttore e le tiene tutte", () => {
    const e = costruisci({
      partenza: "Bologna",
      budgetPersona: 150,
      notti: 2,
      persone: 2,
      tipi: [],
      oreMax: 3,
      prezzoBenzina: 1.994,
    });
    expect(e.ok).toBe(true);
    if (!e.ok) return;

    const ordinate = ordina(e.proposte, preferenzeDaStorico([]));
    expect(new Set(nomi(ordinate))).toEqual(new Set(nomi(e.proposte)));
    // con storico vuoto l'ordine è quello per avanzo, come già fa il costruttore
    const attese = nomi([...e.proposte].sort((a, b) => b.restaPerNotte - a.restaPerNotte));
    expect(nomi(ordinate)).toEqual(attese);
  });
});
