import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * LA FOTO DELLA PROVA DI PAGAMENTO: SALVATA, MA PROTETTA (Valerio, 16/08).
 *
 * È l'unica immagine che il prodotto TIENE (tutte le altre si leggono e si
 * scartano), e mostra un bonifico: IBAN e nome. Queste prove guardano il
 * codice, perché il buco si riapre togliendo una riga e non si vede a occhio.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");
const senzaCommenti = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

test.describe("La prova di pagamento", () => {
  test("il bucket è privato e nell'admin si usano URL firmati", () => {
    const sql = leggi("supabase/2026-08-16-prove-pagamento.sql");
    // public = false: la foto non è leggibile da fuori.
    expect(sql).toMatch(/'prove-pagamento',\s*'prove-pagamento',\s*false/);
    const lib = senzaCommenti(leggi("lib/pratiche/prova-pagamento.ts"));
    // L'admin la mostra con un URL FIRMATO che scade, mai con un URL pubblico.
    expect(lib).toContain("createSignedUrls");
    expect(lib).not.toContain("getPublicUrl");
  });

  test("si carica solo dal proprietario e solo su pratica vinta", () => {
    const r = senzaCommenti(leggi("app/api/pratiche/[id]/prova-pagamento/route.ts"));
    expect(r).toContain("utente_id !== utente.id");
    expect(r).toContain('pratica.stato !== "esito_pagata"');
  });

  test("la foto vive in un evento, non in una colonna nuova", () => {
    /* Una colonna mancante fa fallire tutta la lettura della pratica finché
       non si applica la migrazione (è già successo il 10/08): il riferimento
       alla foto sta negli eventi, come il resto. */
    const lib = senzaCommenti(leggi("lib/pratiche/prova-pagamento.ts"));
    expect(lib).toContain("EVENTO_PROVA_PAGAMENTO");
    expect(lib).toContain("registraEvento");
  });
});
