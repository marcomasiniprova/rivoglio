import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

/**
 * IL SISTEMA RECENSIONI (Valerio, 15/08): le regole del prodotto che non
 * devono cedere, lette dal sorgente perché la parte viva ha bisogno del
 * database (che in sandbox non si raggiunge).
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("Le regole delle recensioni", () => {
  test("un evento si recensisce una volta sola (anti analisi a raffica)", () => {
    const sql = leggi("supabase/2026-08-15-recensioni.sql");
    expect(sql).toContain("create unique index");
    expect(sql).toContain("recensioni (evento_tipo, evento_rif)");
    // Un buono per recensione: se la submission ritenta non ne nascono due.
    expect(sql).toContain("buoni_analisi (recensione_id)");
  });

  test("la recensione nasce nascosta: la vede solo l'admin", () => {
    const sql = leggi("supabase/2026-08-15-recensioni.sql");
    expect(sql).toContain("default 'in_attesa'");
  });

  test("la landing mostra SOLO le approvate, mai una recensione finta", () => {
    const lib = leggi("lib/recensioni/recensioni.ts");
    // La vetrina filtra sullo stato approvata.
    const i = lib.indexOf("export async function recensioniApprovate");
    expect(i).toBeGreaterThan(0);
    expect(lib.slice(i, i + 400)).toContain('.eq("stato", "approvata")');
    // La sezione sparisce quando è vuota: niente sezione senza recensioni vere.
    const comp = leggi("components/rivolio/Testimonial.tsx");
    expect(comp).toContain("length === 0) return null");
  });

  test("il buono lo decide il registro, non il cookie", () => {
    const lib = leggi("lib/recensioni/recensioni.ts");
    // consumaBuono spende solo se non è già usato (filtro usato_il null).
    const i = lib.indexOf("export async function consumaBuono");
    expect(i).toBeGreaterThan(0);
    expect(lib.slice(i, i + 500)).toContain('.is("usato_il", null)');
  });

  test("la recensione compare solo su una verifica VERA, non sui dimostrativi", () => {
    const r = leggi("components/verifica/Risultato.tsx");
    // Il guardiano: idVerifica presente E non demo.
    expect(r).toContain("dati.idVerifica && !dati.demo");
  });

  test("la moderazione è chiusa: la pagina admin chiede il ruolo", () => {
    const pag = leggi("app/admin/recensioni/page.tsx");
    expect(pag).toContain("await soloAdmin()");
  });
});
