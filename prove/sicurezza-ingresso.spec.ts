import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

/**
 * 🔴 IL BUCO DELL'ACCOUNT (Valerio, 16/08): «uno paga l'analisi, mette
 * l'email di un altro al verdetto, e a quel punto entra nell'account
 * dell'altro». Era vero, ed era un furto d'account: il gettone d'accesso
 * veniva costruito e il BROWSER di chi paga ci veniva rimandato dentro, così
 * si entrava come quell'email senza possederla (e con la cassa di prova
 * aperta a tutti bastava un pagamento finto).
 *
 * La cura, scelta col popup: il link d'ingresso va nella POSTA di
 * quell'indirizzo, mai al browser. Entra solo chi apre quella casella.
 * Queste prove leggono il sorgente e impediscono che il buco torni: se
 * qualcuno rimettesse il gettone nel browser, la suite si ferma.
 */
test.describe("Sicurezza: l'ingresso dopo il pagamento non apre l'account altrui", () => {
  const src = readFileSync(join(process.cwd(), "lib/pratiche/ingresso.ts"), "utf8");
  const funzione = src.slice(src.indexOf("export async function ingressoDopoPagamento"));

  test("chi non è già collegato riceve il link nella POSTA, non nel browser", () => {
    // Il link si manda per email a quell'indirizzo.
    expect(funzione).toMatch(/linkPerEntrare\(/);
    // E il browser va su una pagina "controlla la posta", non su /auth/conferma.
    expect(funzione).toMatch(/\/entra\?pratica=1/);
  });

  test("il gettone d'accesso NON si restituisce più al browser di chi paga", () => {
    // 🔴 Il buco era esattamente `return linkDiIngresso(...)`: quell'indirizzo
    // porta il token_hash e il browser lo consuma. Vietato per sempre qui.
    expect(funzione).not.toMatch(/return\s+linkDiIngresso\(/);
  });

  test("solo chi è GIÀ collegato con quell'email entra dritto (sessione vera)", () => {
    // La scorciatoia sicura resta: se la sessione è già quell'email, si va
    // alla pratica. È l'unico caso in cui il browser ha dimostrato di essere
    // quell'utente.
    expect(funzione).toMatch(/emailCollegata[\s\S]{0,120}toLowerCase\(\)\s*===\s*emailPratica\.toLowerCase\(\)/);
    expect(funzione).toMatch(/return percorso;/);
  });
});
