import { test, expect } from "@playwright/test";
import { percorsoPratica } from "../lib/pratiche/passi";
import { EVENTO_CARICATO, EVENTO_SALTATO } from "../lib/pratiche/documenti";
import type { EventoPratica, StatoPratica } from "../lib/pratiche/pratiche";

/**
 * I PALETTI DELLA PRATICA.
 *
 * 🔴 Valerio, 13/08: «se fai una cosa rimane tutto il resto vecchio»,
 * e «ho cliccato per maltempo e non è successo niente». Erano due facce
 * dello stesso difetto: ogni riquadro decideva da solo se accendersi, e
 * nessuno sapeva degli altri.
 *
 * Queste prove tengono ferme tre promesse:
 * 1. il passo attivo è UNO;
 * 2. il muro dei documenti non blocca niente dopo che la lettera è
 *    partita, perché a quel punto non può più servire a nulla;
 * 3. non si può dichiarare di aver mandato una lettera che non si è
 *    potuta aprire.
 */

const evento = (tipo: string): EventoPratica =>
  ({
    id: `e-${tipo}`,
    pratica_id: "p",
    tipo,
    nota: null,
    creato_il: "2026-08-12T10:00:00Z",
  }) as EventoPratica;

const TUTTI: StatoPratica[] = [
  "creata",
  "pagata",
  "pronta",
  "inviata",
  "sollecito",
  "enac",
  "esito_pagata",
  "esito_rifiutata",
  "rimborsata",
];

test.describe("Un passo attivo alla volta", () => {
  test("in ogni stato possibile c'è esattamente un passo 'adesso'", () => {
    for (const stato of TUTTI) {
      for (const eventi of [[], [evento(EVENTO_CARICATO)]]) {
        for (const rifiuto of [null, "meteo"]) {
          const p = percorsoPratica(stato, eventi, rifiuto);
          const adesso = p.passi.filter((x) => x.stato === "adesso");
          expect(adesso.length, `${stato} / rifiuto=${rifiuto}`).toBe(1);
        }
      }
    }
  });

  test("i passi fatti stanno prima, quelli dopo stanno dopo: mai mescolati", () => {
    for (const stato of TUTTI) {
      const p = percorsoPratica(stato, [evento(EVENTO_CARICATO)], null);
      const ordine = p.passi.map((x) => x.stato);
      const primoNonFatto = ordine.findIndex((s) => s !== "fatto");
      // Dopo il primo non-fatto non può ricomparire un "fatto".
      expect(ordine.slice(primoNonFatto).includes("fatto"), stato).toBe(false);
    }
  });
});

test.describe("Il muro dei documenti sta al suo posto", () => {
  test("prima dell'invio blocca davvero", () => {
    const p = percorsoPratica("pagata", [], null);
    expect(p.attivo).toBe("documento");
    expect(p.riquadri.documentoPasso).toBe(true);
    expect(p.riquadri.letteraApribile).toBe(false);
  });

  test("la porta di servizio apre la lettera senza documento", () => {
    const p = percorsoPratica("pagata", [evento(EVENTO_SALTATO)], null);
    expect(p.attivo).toBe("lettera");
    expect(p.riquadri.letteraApribile).toBe(true);
  });

  test("🔴 dopo l'invio NON blocca più niente, nemmeno senza documento", () => {
    /* È il difetto della schermata 5 del 13/08: dichiarato il no, la
       replica c'era ma il bottone restava grigio. */
    for (const stato of ["inviata", "sollecito", "enac"] as StatoPratica[]) {
      const p = percorsoPratica(stato, [], null);
      expect(p.riquadri.letteraApribile, stato).toBe(true);
      expect(p.riquadri.documentoPasso, stato).toBe(false);
    }
  });

  test("🔴 dopo l'invio il riquadro non è più 'passo 1 di 2'", () => {
    // La schermata 2: lettera già spedita e sopra "prima carica la carta".
    const p = percorsoPratica("inviata", [], null);
    expect(p.riquadri.documentoPasso).toBe(false);
    expect(p.riquadri.documentoExtra).toBe(true);
  });

  test("chi il documento l'ha già dato non se lo vede più chiedere", () => {
    const p = percorsoPratica("inviata", [evento(EVENTO_CARICATO)], null);
    expect(p.riquadri.documentoPasso).toBe(false);
    expect(p.riquadri.documentoExtra).toBe(false);
  });

  test("su una pratica chiusa non si chiede più niente", () => {
    for (const stato of ["esito_pagata", "esito_rifiutata", "rimborsata"] as StatoPratica[]) {
      const p = percorsoPratica(stato, [], null);
      expect(p.riquadri.documentoPasso, stato).toBe(false);
      expect(p.riquadri.documentoExtra, stato).toBe(false);
      expect(p.riquadri.rifiuto, stato).toBe(false);
      expect(p.attivo, stato).toBe("chiusa");
    }
  });
});

test.describe("Non si dichiara un fatto non avvenuto", () => {
  test("«Ho inviato il reclamo» non compare se la lettera è ancora chiusa", () => {
    const p = percorsoPratica("pagata", [], null);
    expect(p.riquadri.letteraApribile).toBe(false);
    expect(p.riquadri.confermaInvio).toBe(false);
    expect(p.riquadri.istruzioni).toBe(false);
  });

  test("appena la lettera si apre, il bottone c'è", () => {
    const p = percorsoPratica("pagata", [evento(EVENTO_SALTATO)], null);
    expect(p.riquadri.confermaInvio).toBe(true);
    expect(p.riquadri.istruzioni).toBe(true);
  });

  test("dopo l'invio il bottone sparisce: non si invia due volte", () => {
    const p = percorsoPratica("inviata", [evento(EVENTO_CARICATO)], null);
    expect(p.riquadri.confermaInvio).toBe(false);
  });
});

test.describe("Il no della compagnia sposta il percorso", () => {
  test("dichiarare il no porta il passo attivo sulla replica, senza aspettare", () => {
    /* Il rifiuto scavalca il calendario: la risposta è arrivata, aspettare
       altre cinque settimane sarebbe assurdo. */
    const senza = percorsoPratica("inviata", [], null);
    const con = percorsoPratica("inviata", [], "meteo");
    expect(senza.attivo).toBe("attesa");
    expect(con.attivo).toBe("replica");
  });

  test("il riquadro del no c'è solo quando ha senso", () => {
    expect(percorsoPratica("pagata", [], null).riquadri.rifiuto).toBe(false);
    expect(percorsoPratica("inviata", [], null).riquadri.rifiuto).toBe(true);
    expect(percorsoPratica("sollecito", [], null).riquadri.rifiuto).toBe(true);
    expect(percorsoPratica("esito_pagata", [], null).riquadri.rifiuto).toBe(false);
  });
});
