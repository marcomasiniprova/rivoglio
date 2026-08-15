import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

/**
 * LA CODA DEGLI INCERTI (Valerio, 15/08): il verdetto incerto di un volo
 * fresco promette "se ci lasci l'email ti avvisiamo noi", ma finora nessuno
 * lo ricontrollava. Questa prova blinda le regole che rendono quella
 * promessa vera E onesta.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("La coda ricontrolla gli incerti", () => {
  test("la rotta esiste e ha il suo orologio", () => {
    expect(existsSync(join(RADICE, "app/api/motore/coda/route.ts"))).toBe(true);
    const svg = "netlify/functions/coda.mjs";
    expect(existsSync(join(RADICE, svg))).toBe(true);
    const testo = leggi(svg);
    expect(testo).toContain("/api/motore/coda");
    expect(testo).toMatch(/schedule:\s*"[^"]+"/);
  });

  test("guarda SOLO gli incerti con email ancora aperti", () => {
    const r = leggi("app/api/motore/coda/route.ts");
    expect(r).toContain('.eq("esito", "incerto")');
    expect(r).toContain('.not("email", "is", null)');
    expect(r).toContain('.is("coda_avvisata_il", null)');
    expect(r).toContain('.is("coda_chiusa_il", null)');
  });

  test("avvisa solo sull'idoneo, mai un'email di 'non lo so'", () => {
    /* La regola del prodotto: si scrive solo quando c'è qualcosa da fare.
       L'unica chiamata a verdettoIdoneo deve stare dentro il ramo idoneo,
       e il non idoneo si chiude in silenzio. */
    const r = leggi("app/api/motore/coda/route.ts");
    const idxIdoneo = r.indexOf('v.esito === "idoneo"');
    const idxEmail = r.indexOf("verdettoIdoneo(r.email");
    expect(idxIdoneo).toBeGreaterThan(0);
    expect(idxEmail).toBeGreaterThan(idxIdoneo); // l'email sta dopo, nel ramo idoneo
  });

  test("un incerto che resta incerto oltre 7 giorni si chiude", () => {
    const r = leggi("app/api/motore/coda/route.ts");
    expect(r).toContain("GIORNI_CODA");
    expect(r).toContain("coda_chiusa_il");
  });

  test("se le colonne della coda non ci sono ancora, non si rompe", () => {
    /* Fail-open come il resto: la migrazione potrebbe non essere ancora
       applicata, e un cron che va in errore ogni notte è rumore inutile. */
    const r = leggi("app/api/motore/coda/route.ts");
    expect(r).toContain("colonnaMancante");
  });

  test("la migrazione della coda esiste ed è idempotente", () => {
    const sql = leggi("supabase/2026-08-15-coda.sql");
    expect(sql).toContain("add column if not exists coda_avvisata_il");
    expect(sql).toContain("add column if not exists coda_chiusa_il");
    expect(sql).toContain("create index if not exists");
  });
});
