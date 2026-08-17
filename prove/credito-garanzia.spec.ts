import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { creditoCopre } from "../lib/pratiche/credito";

/**
 * LA GARANZIA A CREDITO (Valerio, 17/08).
 *
 * La garanzia non rimborsa in contanti: dà un credito per la prossima
 * pratica. Due cose vanno blindate, e sono le stesse due di sempre:
 *  1. il credito si concede SOLO col cancello completo (no scritto +
 *     documento + replica): se no uno pagato dalla compagnia si prende un
 *     credito lo stesso;
 *  2. una pratica gratis si apre SOLO con un credito vero: se no la rotta
 *     diventa un modo per aprire pratiche senza pagare.
 * I due buchi si riaprono togliendo una riga, e una riga tolta non si vede
 * a occhio: per questo si guardano nel codice.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");
const senzaCommenti = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

test.describe("Il credito copre il tipo giusto", () => {
  test("una famiglia copre famiglia e singola; una singola solo singola", () => {
    // Una famiglia (29,90) vale di più: copre tutto.
    expect(creditoCopre("famiglia", "famiglia")).toBe(true);
    expect(creditoCopre("famiglia", "singola")).toBe(true);
    // Una singola (14,90) copre solo una singola, non una famiglia.
    expect(creditoCopre("singola", "singola")).toBe(true);
    expect(creditoCopre("singola", "famiglia")).toBe(false);
  });
});

test.describe("Il credito si concede solo col cancello completo", () => {
  test("l'esito route concede il credito DOPO il gate (documento + replica)", () => {
    const r = senzaCommenti(leggi("app/api/pratiche/[id]/esito/route.ts"));
    // Il credito parte solo nel ramo del "non pagata", dopo che i gate del
    // documento e della replica hanno già rifiutato chi non li supera.
    // `lastIndexOf`: la prima occorrenza di questi nomi è l'IMPORT in cima;
    // a noi serve l'uso vero, che viene dopo.
    expect(r).toContain("concediCredito");
    const iDoc = r.lastIndexOf("EVENTO_RIFIUTO_DOCUMENTO");
    const iReplica = r.lastIndexOf("EVENTO_REPLICA_INVIATA");
    const iCredito = r.lastIndexOf("concediCredito");
    expect(iDoc, "il gate del documento non c'è più").toBeGreaterThan(-1);
    expect(iReplica, "il gate della replica non c'è più").toBeGreaterThan(-1);
    expect(iCredito, "il credito non si concede più").toBeGreaterThan(-1);
    expect(iCredito, "il documento si controlla PRIMA del credito").toBeGreaterThan(iDoc);
    expect(iCredito, "la replica si controlla PRIMA del credito").toBeGreaterThan(iReplica);
  });
});

test.describe("Una pratica gratis si apre solo con un credito vero", () => {
  test("la rotta gratis controlla il credito PRIMA di creare la pratica", () => {
    const r = senzaCommenti(leggi("app/api/pratiche/gratis/route.ts"));
    expect(r).toContain("creditoDisponibile");
    // `lastIndexOf`: la prima occorrenza è l'import; serve la chiamata vera.
    const iCredito = r.lastIndexOf("creditoDisponibile");
    const iCrea = r.lastIndexOf("creaPratica");
    expect(iCredito, "il credito non si controlla più").toBeGreaterThan(-1);
    expect(iCrea, "la pratica non si crea").toBeGreaterThan(-1);
    expect(iCredito, "il credito si controlla PRIMA di creare la pratica").toBeLessThan(iCrea);
  });

  test("🔴 la rotta gratis è un POST, non un GET (niente prefetch che apre pratiche)", () => {
    const r = leggi("app/api/pratiche/gratis/route.ts");
    expect(r).toContain("export async function POST");
    // Un GET verrebbe seguito da un prefetch/una scheda riaperta: qui no.
    expect(r).not.toContain("export async function GET");
  });

  test("richiede la sessione: il credito è sull'account", () => {
    const r = senzaCommenti(leggi("app/api/pratiche/gratis/route.ts"));
    expect(r).toContain("utenteCollegato");
    // Senza utente collegato si esce con 401 prima di toccare qualsiasi cosa.
    expect(r).toMatch(/status:\s*401/);
  });
});

test.describe("Il credito non si spende due volte", () => {
  test("il consumo filtra usato_il is null, come i buoni (usa e getta)", () => {
    const c = senzaCommenti(leggi("lib/pratiche/credito.ts"));
    // L'update che spende il credito deve filtrare su usato_il null: due
    // chiamate in corsa non lo spendono due volte.
    const iConsuma = c.indexOf("export async function consumaCredito");
    const dopo = c.slice(iConsuma);
    expect(dopo).toContain(".is(\"usato_il\", null)");
    expect(dopo).toContain(".update(");
  });
});
