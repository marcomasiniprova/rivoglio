import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { fonti, passiDelCheck } from "../lib/admin/motore";
import { CASI_ORO } from "../lib/regole/casi-oro";
import { VERSIONE_REGOLE } from "../lib/regole/eu261";
import { VETTORI } from "../lib/regole/vettori";
import { COMPAGNIE } from "../lib/lettera/compagnie";
import { quantiNeb } from "../lib/lettera/neb";
import { quantiScali } from "../lib/voli/aeroporti";
import { SEZIONI } from "../lib/admin/sezioni";

/**
 * LA PAGINA CHE SPIEGA IL MOTORE NON PUÒ INVECCHIARE.
 *
 * 🔴 È già successo, e questo è il motivo per cui queste prove esistono:
 * la mappa del business dichiarava «58 casi» quando i casi erano 53,
 * perché il numero era stato copiato a mano dal diario di un giro
 * precedente. Nessuno se ne accorgeva, perché una schermata sbagliata non
 * fa fallire niente.
 *
 * Qui i numeri si contano dai file veri. Queste prove controllano che
 * continuino a contarsi, cioè che nessuno li riscriva a mano il giorno
 * che ha fretta.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("I numeri sono contati, non scritti", () => {
  test("le quantità delle fonti combaciano con i file veri", () => {
    const per = (nome: string) => fonti().find((f) => f.nome.includes(nome))?.quanto ?? "";

    expect(per("aeroporti")).toContain(quantiScali().toLocaleString("it-IT"));
    expect(per("regole del Regolamento")).toContain(VERSIONE_REGOLE);
    expect(per("regole del Regolamento")).toContain(String(CASI_ORO.length));
    expect(per("licenze")).toContain(String(Object.keys(VETTORI).length));
    expect(per("canali di reclamo")).toContain(String(COMPAGNIE.length));
    expect(per("canali di reclamo")).toContain(String(quantiNeb()));
  });

  test("nel file della spiegazione non ci sono quantità scritte a mano", () => {
    /* Il pericolo è uno solo e ha un nome: qualcuno che scrive "9.016
       scali" invece di chiamare la funzione che li conta. */
    const testo = leggi("lib/admin/motore.ts");
    const righeVive = testo
      .split("\n")
      .filter((r) => !r.trim().startsWith("*") && !r.trim().startsWith("//"));
    for (const riga of righeVive) {
      // Numeri con separatore delle migliaia dentro una stringa: sospetti.
      expect(riga, `numero scritto a mano: ${riga.trim()}`).not.toMatch(/"[^"]*\d\.\d{3}[^"]*"/);
    }
  });

  test("il conteggio degli scali non è più quello del 2017", () => {
    // In testa a lib/voli/aeroporti.ts c'era ancora "6.072": era il 2017,
    // e l'autopilot del lunedì da allora ne ha aggiunti quasi tremila.
    expect(quantiScali()).toBeGreaterThan(8000);
  });
});

test.describe("La spiegazione dice la verità sul prodotto", () => {
  test("le fonti nostre e quelle esterne sono dichiarate per quello che sono", () => {
    const elenco = fonti();
    const nostre = elenco.filter((f) => f.chi === "nostra").map((f) => f.nome);
    const esterne = elenco.filter((f) => f.chi === "esterna").map((f) => f.nome);
    // AeroDataBox e Mistral si pagano e possono chiudere: esterne.
    expect(esterne.some((n) => n.includes("AeroDataBox"))).toBe(true);
    expect(esterne.some((n) => n.includes("Mistral"))).toBe(true);
    // Le regole e l'archivio scali sono roba nostra: è il punto della domanda.
    expect(nostre.some((n) => n.includes("regole"))).toBe(true);
    expect(nostre.some((n) => n.includes("aeroporti"))).toBe(true);
    expect(nostre.length).toBeGreaterThanOrEqual(4);
  });

  test("ogni fonte dice cosa si rompe se sparisce", () => {
    for (const f of fonti()) {
      expect(f.seManca.length, f.nome).toBeGreaterThan(20);
      expect(f.costo.length, f.nome).toBeGreaterThan(3);
    }
  });

  test("il cancello territoriale è dichiarato PRIMA del calcolo del ritardo", () => {
    /* Non è pignoleria di ordine: finché quel passo non c'era, un New
       York → Toronto con quattro ore di ritardo usciva idoneo a 600 euro.
       Se la spiegazione lo mette dopo, spiega un motore diverso da
       quello che gira. */
    const passi = passiDelCheck();
    const territorio = passi.findIndex((p) => p.titolo.toLowerCase().includes("si applica"));
    const ritardo = passi.findIndex((p) => p.titolo.toLowerCase().includes("ritardo"));
    expect(territorio).toBeGreaterThan(0);
    expect(territorio).toBeLessThan(ritardo);
  });

  test("dice che l'AI non tocca il verdetto: è la regola che regge tutto", () => {
    const testo = passiDelCheck()
      .map((p) => `${p.cosa} ${p.nota ?? ""}`)
      .join(" ")
      .toLowerCase();
    expect(testo).toContain("intelligenza artificiale");
    expect(testo).toContain("incerto");
  });

  test("i passi sono numerati in ordine, senza buchi", () => {
    const numeri = passiDelCheck().map((p) => p.numero);
    expect(numeri).toEqual(numeri.map((_, i) => i + 1));
  });
});

test.describe("La pagina si raggiunge", () => {
  test("è una sezione della barra laterale, non un indirizzo da ricordare", () => {
    const s = SEZIONI.find((x) => x.chiave === "motore");
    expect(s?.href).toBe("/admin/motore");
  });

  test("dalla mappa si arriva al motore con un clic", () => {
    const mappa = leggi("lib/admin/mappa.ts");
    const i = mappa.indexOf('id: "motore"');
    expect(i).toBeGreaterThan(0);
    // Il `dove` del nodo motore deve puntare alla pagina nuova.
    expect(mappa.slice(i, i + 2600)).toContain('dove: "/admin/motore"');
  });

  test("chiede il ruolo admin come tutte le altre", () => {
    expect(leggi("app/admin/motore/page.tsx")).toContain("await soloAdmin()");
  });

  test("non stampa nessun valore di chiave", () => {
    /* Una pagina che spiega la configurazione è la più facile da
       fotografare per sbaglio. Qui si nominano le variabili, mai i loro
       valori. */
    const pagina = leggi("app/admin/motore/page.tsx");
    expect(pagina).not.toMatch(/process\.env\.[A-Z_]+(?!\s*(!==|===|\?))/);
  });
});
