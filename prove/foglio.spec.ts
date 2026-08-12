import { test, expect } from "@playwright/test";
import { inBlocchi } from "../components/pratica/Foglio";
import { NOTA_TRASPARENZA, generaReclamo, generaSegnalazioneEnte, generaSollecito } from "../lib/lettera/genera";
import type { FattoVolo, Verdetto } from "../lib/regole/eu261";

/**
 * IL FOGLIO È UN VESTITO, E UN VESTITO NON PUÒ MANGIARSI IL CORPO.
 *
 * `components/pratica/Foglio.tsx` prende il testo della lettera e lo
 * dispone: intestazione, oggetto, paragrafi numerati, campi del bonifico,
 * firma. Il rischio di un pezzo così è uno solo, e non è estetico: che
 * impaginando **perda una riga**. La lettera è il prodotto, e una riga
 * persa lì è una frase che il passeggero credeva di aver mandato alla
 * compagnia e che non c'era.
 *
 * Qui si controlla la scomposizione contro le tre lettere vere: ogni
 * parola del testo deve ricomparire nei blocchi, sempre.
 */

const fatto: FattoVolo = {
  voloIata: "ZZ250",
  dataLocale: "2026-08-06",
  vettoreOperativo: "FR",
  vettoreMarketing: null,
  partenzaIata: "BGY",
  arrivoIata: "ACE",
  arrivoPrevistoUtc: "2026-08-06T09:55:00Z",
  arrivoEffettivoUtc: "2026-08-06T13:47:00Z",
  stato: "atterrato",
  kmOrtodromica: 2841,
  fontiDiscordanti: false,
  fonte: "AeroDataBox",
};

const verdetto: Verdetto = {
  esito: "idoneo",
  importo: 400,
  ritardoMinuti: 232,
  motivo: "",
  versioneRegole: "2026.08.8",
};

const pratica = { passeggeri: [], tipo: "singola" as const };

const LETTERE = [
  ["reclamo", generaReclamo(pratica, fatto, verdetto, {})],
  ["sollecito", generaSollecito(pratica, fatto, verdetto, "2026-08-07", "guasto_tecnico")],
  [
    "segnalazione",
    generaSegnalazioneEnte(pratica, fatto, verdetto, "2026-08-07", null, "guasto_tecnico"),
  ],
] as const;

test.describe("Il foglio della pratica", () => {
  for (const [nome, lettera] of LETTERE) {
    test(`${nome}: la nota di trasparenza è staccata e non sparisce`, () => {
      expect(lettera, `la ${nome} deve esistere`).toBeTruthy();
      const corpo = lettera!.corpo;
      /* Il foglio stacca il piede su questo separatore. Se un domani il
         testo lo perde, la nota "non costituisce parere legale" finirebbe
         in fondo come un paragrafo qualsiasi: nessuno se ne accorgerebbe
         guardando, e sarebbe la riga che ci tiene fuori dall'esercizio
         abusivo della professione. */
      /* ⚠️ Fino all'11/08 il taglio era una riga di tre trattini. È
         sparita il 12/08 perché finiva anche nell'email che il
         passeggero manda alla compagnia, e lì si legge come "generato da
         un programma". Adesso il piede si riconosce dalla nota stessa,
         che resta l'ULTIMA cosa del testo: se un domani qualcuno la
         sposta o la toglie, questa prova si ferma. */
      expect(corpo, "la nota deve chiudere il testo").toContain(NOTA_TRASPARENZA);
      expect(corpo.trimEnd().endsWith(NOTA_TRASPARENZA)).toBe(true);
      expect(corpo, "il separatore a trattini non deve tornare").not.toContain("\n---\n");
    });

    test(`${nome}: impaginando non si perde una parola`, () => {
      const corpo = lettera!.corpo.split(NOTA_TRASPARENZA)[0];
      /* La scomposizione taglia solo righe vuote, trattini d'elenco e i
         punti e virgola in coda alle voci. Tutto il resto deve tornare. */
      const parole = (t: string) =>
        t
          .replace(/^[-\s]+/gm, " ")
          .replace(/[^\p{L}\p{N}]+/gu, " ")
          .trim()
          .split(" ")
          .filter(Boolean);
      const prima = parole(corpo);
      /* Il foglio non riscrive: la somma dei blocchi È il testo. Si
         rimettono insieme i blocchi e si confronta parola per parola. */
      const dopo = parole(
        inBlocchi(lettera!.corpo)
          .map((b) => {
            switch (b.tipo) {
              case "saluto":
                return b.testo;
              case "paragrafo":
                return b.testo;
              case "elenco":
                return b.voci.join(" ");
              case "campi":
                return b.righe.map((r) => `${r.etichetta} ${r.valore}`).join(" ");
              case "firma":
                return b.righe.join(" ");
            }
          })
          .join(" "),
      );
      expect(dopo).toEqual(prima);
      expect(prima.length).toBeGreaterThan(80);
    });
  }

  test("il reclamo porta le coordinate del bonifico su righe loro", () => {
    const corpo = generaReclamo(pratica, fatto, verdetto, {})!.corpo;
    /* È il blocco che il foglio disegna staccato, in un riquadro. Se il
       testo smettesse di scriverle su due righe con "Etichetta: valore",
       tornerebbero dentro un paragrafo giustificato: la riga dove
       finiscono i soldi, scritta come una nota di passaggio. */
    expect(corpo).toMatch(/^IBAN: .+$/m);
    expect(corpo).toMatch(/^Intestato a: .+$/m);
  });
});
