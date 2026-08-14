import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * OVERBOOKING E COINCIDENZA APRONO LA PRATICA ANCHE SU UN VOLO VERO.
 *
 * 🔴 Il difetto (Valerio, 13/08, con gli screenshot): su un volo reale il
 * verdetto di negato imbarco / coincidenza persa usciva giusto, ma poi
 * «pagamento non attivo», niente pratica, niente bottone famiglia. Il
 * flusso completo partiva solo per i voli demo (ZZ) o con Polar
 * configurato; su un volo vero senza Polar restava murato.
 *
 * La cura: la cassa di prova (COLLAUDO_APERTO) vale anche sui voli veri,
 * e il client lo deve sapere. Queste prove guardano il codice, perché il
 * difetto si riapre togliendo una parola, e una parola tolta non si vede
 * a occhio.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

test.describe("Le altre casistiche hanno lo stesso flusso del ritardo", () => {
  test("i bottoni d'acquisto si accendono anche con la sola cassa di prova", () => {
    const risultato = leggi("components/verifica/Risultato.tsx");
    /* Senza `|| dati.cassaProva` un volo VERO senza Polar tornava a
       mostrare «pagamento non attivo». */
    expect(risultato).toMatch(/compraSingola\s*=\s*dati\.demo\s*\|\|\s*dati\.checkout\.singola\s*\|\|\s*dati\.cassaProva/);
    expect(risultato).toMatch(/compraFamiglia\s*=\s*dati\.demo\s*\|\|\s*dati\.checkout\.famiglia\s*\|\|\s*dati\.cassaProva/);
  });

  test("la pagina del verdetto dichiara se la cassa di prova è aperta", () => {
    const pagina = leggi("app/verifica/[id]/page.tsx");
    /* Deve arrivare dalla stessa funzione del cancello, non da un flag a
       mano: `cassaDiProvaAperta()`. Se un domani sparisce, il flusso si
       rimura sui voli veri. */
    expect(pagina).toContain("cassaProva: cassaDiProvaAperta()");
    expect(pagina).toContain('from "@/lib/check/cancello"');
  });

  test("la rotta dichiara riscrive esito e caso: da lì nasce la pratica", () => {
    /* La pratica di overbooking/coincidenza si apre perché la riga della
       verifica diventa idonea col caso dichiarato. Se la rotta smette di
       scriverli, il checkout non trova un idoneo su cui aprire. */
    const rotta = leggi("app/api/verifica/dichiara/route.ts");
    expect(rotta).toContain("caso_dichiarato");
    expect(rotta).toMatch(/esito:\s*verdetto\.esito/);
  });
});
