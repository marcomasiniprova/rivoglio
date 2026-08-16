import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * LA GARANZIA NON SI TRUFFA COL TESTO SCRITTO A MANO.
 *
 * 🔴 Valerio, 15/08, con gli screenshot: «nel no per sbloccare il rimborso
 * posso truffare, metto testo semplice come "non sei idoneo non ti
 * pagheremo" e mi dà il rimborso».
 *
 * Aveva ragione. Il gate anti-frode c'era (serve un `rifiuto_motivo`
 * registrato), ma quel campo lo scrive l'AI leggendo QUALSIASI testo
 * incollato: bastava scrivere un finto no. Uno che è stato pagato dalla
 * compagnia poteva farsi rimborsare anche i 14,90.
 *
 * Adesso la garanzia parte solo se la risposta della compagnia è stata
 * caricata come DOCUMENTO vero (foto/email/PDF): l'evento
 * `rifiuto_documento`. Queste prove guardano il codice, perché il buco si
 * riapre togliendo una riga e una riga tolta non si vede a occhio.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");
const senzaCommenti = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

test.describe("La garanzia esige un documento vero, non testo scritto a mano", () => {
  test("il server rifiuta il rimborso senza l'evento del documento", () => {
    const r = senzaCommenti(leggi("app/api/pratiche/[id]/esito/route.ts"));
    /* Il ramo del rimborso (non_pagata → esito_rifiutata) deve controllare
       l'evento del documento PRIMA di concedere la transizione. */
    expect(r).toContain("EVENTO_RIFIUTO_DOCUMENTO");
    const iControllo = r.indexOf("EVENTO_RIFIUTO_DOCUMENTO");
    const iTransizione = r.indexOf('"esito_rifiutata"');
    expect(iControllo, "il gate del documento non c'è").toBeGreaterThan(-1);
    expect(iTransizione, "la transizione del rimborso non c'è").toBeGreaterThan(-1);
    expect(
      iControllo,
      "il documento si controlla PRIMA di concedere il rimborso",
    ).toBeLessThan(iTransizione);
  });

  test("l'evento del documento si registra SOLO quando arriva un'immagine", () => {
    const r = leggi("app/api/pratiche/[id]/risposta/route.ts");
    /* `daDocumento` è vero solo se il testo era vuoto ed è arrivato un
       base64: è quello che distingue un documento caricato dal testo
       scritto a mano. E l'evento si registra dietro quel `daDocumento`. */
    expect(r).toContain("const daDocumento =");
    const c = senzaCommenti(r);
    expect(c).toMatch(/if\s*\(\s*daDocumento\s*\)/);
    expect(c).toContain("EVENTO_RIFIUTO_DOCUMENTO");
  });

  test("il testo scritto a mano prepara la replica ma NON registra il documento", () => {
    /* Il testo incollato deve comunque salvare il motivo (per la replica):
       `rifiuto_motivo` si scrive sempre. È solo il rimborso che pretende
       il documento. Se un domani `daDocumento` diventasse sempre vero, la
       truffa tornerebbe: la si lega alla mancanza di testo. */
    const c = senzaCommenti(leggi("app/api/pratiche/[id]/risposta/route.ts"));
    const i = c.indexOf("const daDocumento =");
    const riga = c.slice(i, i + 160);
    expect(riga).toContain("rispostaLoro.length === 0");
    expect(riga).toContain("base64");
  });

  test("il bottone della garanzia compare solo con documento PROVATO e dopo aver combattuto", () => {
    const c = senzaCommenti(leggi("components/pratica/DichiaraEsito.tsx"));
    /* Il ramo che mostra il bottone del rimborso guarda `rifiutoProvato` E
       `haCombattuto`: documento vero, e replica già mandata. */
    expect(c).toContain("rifiutoProvato");
    expect(c).toContain("haCombattuto");
    const iBottone = c.indexOf('dichiara("non_pagata")');
    const iGate = c.indexOf("rifiutoProvato && haCombattuto");
    expect(iGate, "il bottone non è più dietro rifiutoProvato && haCombattuto").toBeGreaterThan(-1);
    expect(iGate, "il gate sta prima del bottone").toBeLessThan(iBottone);
  });

  test("🔴 il rimborso è l'ultima spiaggia: serve prima una replica mandata", () => {
    /* Valerio, 16/08: «se è il primo no rimborsiamo già? deve arrivare dopo
       aver combattuto». Il server pretende l'evento della replica inviata
       PRIMA di concedere il rimborso: se qualcuno toglie il gate, la suite
       si ferma. */
    const r = senzaCommenti(leggi("app/api/pratiche/[id]/esito/route.ts"));
    expect(r).toContain("ultima spiaggia");
    const iCheck = r.lastIndexOf("EVENTO_REPLICA_INVIATA");
    /* `lastIndexOf`: la stringa "esito_rifiutata" compare anche nell'array
       GIA_CHIUSA in cima al file (prima del gate). A noi serve l'ULTIMA
       occorrenza, cioè la transizione vera che concede il rimborso. */
    const iTransizione = r.lastIndexOf('"esito_rifiutata"');
    expect(iCheck, "il gate della replica non c'è").toBeGreaterThan(-1);
    expect(iCheck, "la replica si controlla PRIMA del rimborso").toBeLessThan(iTransizione);
  });
});
