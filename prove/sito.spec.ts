import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * NESSUN RIMANDO PUÒ PORTARE FUORI DAL SITO VERO.
 *
 * Il difetto che ha fatto nascere questo file (12/08): aprendo la pratica
 * dalla cassa di collaudo, il browser finiva su
 * `6a7cba1f...--rivolio.netlify.app/pratica/...` invece che su
 * `rivolio.it/pratica/...`.
 *
 * Dietro il proxy di Netlify `req.url` è l'indirizzo della macchina che
 * sta servendo la richiesta, non quello che ha digitato la persona. In
 * locale i due coincidono, quindi il difetto è invisibile finché non si
 * prova online: è esattamente il tipo di cosa che una prova deve
 * ricordare al posto nostro.
 *
 * ⚠️ E non era solo brutto: cambiare dominio vuol dire perdere i cookie,
 * quindi la ricevuta dell'analisi restava sull'altro indirizzo e l'utente
 * si ritrovava sconosciuto su una copia del sito, subito dopo avergli
 * chiesto dei soldi.
 */

const RADICE = join(__dirname, "..");

function tuttiIFile(cartella: string, dentro: string[] = []): string[] {
  for (const voce of readdirSync(cartella)) {
    const percorso = join(cartella, voce);
    if (statSync(percorso).isDirectory()) tuttiIFile(percorso, dentro);
    else if (percorso.endsWith(".ts") || percorso.endsWith(".tsx")) dentro.push(percorso);
  }
  return dentro;
}

test.describe("L'indirizzo di casa", () => {
  test("nessuna rotta costruisce un rimando dall'indirizzo della richiesta", () => {
    const colpevoli: string[] = [];
    for (const file of tuttiIFile(join(RADICE, "app", "api"))) {
      const righe = readFileSync(file, "utf8").split("\n");
      righe.forEach((riga, i) => {
        /* Il segno del difetto: si costruisce un URL usando come base
           l'origine della richiesta. Va bene leggere `req.url` per i
           parametri; non va bene usarne l'origine per mandare qualcuno
           da qualche parte. */
        const rimando = /NextResponse\.redirect|Location/.test(riga);
        const daRichiesta = /url\.origin|new URL\([^)]*req(uest)?\.url\)\.origin/.test(riga);
        if (rimando && daRichiesta) {
          colpevoli.push(`${file.replace(RADICE + "/", "")}:${i + 1}  ${riga.trim()}`);
        }
      });
    }
    expect(
      colpevoli,
      `questi rimandi userebbero l'indirizzo interno del deploy invece di rivolio.it.\nUsa versoCasa() di lib/sito.ts:\n${colpevoli.join("\n")}`,
    ).toEqual([]);
  });

  test("l'indirizzo di casa sta scritto in un posto solo", () => {
    /* `casa()` esisteva dentro lib/email/posta.ts: importarla da una
       rotta tirava dentro tutto il pacchetto di Resend, quindi le rotte
       si riscrivevano l'indirizzo a mano. Due copie dello stesso valore
       finiscono sempre per dire due cose diverse. */
    const posta = readFileSync(join(RADICE, "lib", "email", "posta.ts"), "utf8");
    expect(posta, "posta.ts deve ri-esportare casa da lib/sito, non ridefinirla").toContain(
      'export { casa } from "@/lib/sito"',
    );
    const sito = readFileSync(join(RADICE, "lib", "sito.ts"), "utf8");
    expect(sito).toContain("export function casa()");
    expect(sito).toContain("export function versoCasa(");
    /* ⚠️ MAI dall'intestazione Host: la scrive chi manda la richiesta, e
       un rimando costruito su un valore altrui porta la gente dove vuole
       lui. */
    expect(sito, "l'indirizzo non si legge mai dall'intestazione Host").not.toMatch(
      /headers\.get\(["']host["']\)/i,
    );
  });
});
