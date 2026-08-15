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

  test("il bottone della garanzia compare solo col rifiuto PROVATO da documento", () => {
    const c = senzaCommenti(leggi("components/pratica/DichiaraEsito.tsx"));
    /* Il ramo che mostra il bottone del rimborso guarda `rifiutoProvato`,
       non il solo `rifiutoRegistrato`. */
    expect(c).toContain("rifiutoProvato");
    const iBottone = c.indexOf('dichiara("non_pagata")');
    const iProvato = c.indexOf("rifiutoProvato ?");
    expect(iProvato, "il bottone non è più dietro rifiutoProvato").toBeGreaterThan(-1);
    expect(iProvato, "il gate del documento sta prima del bottone").toBeLessThan(iBottone);
  });
});
