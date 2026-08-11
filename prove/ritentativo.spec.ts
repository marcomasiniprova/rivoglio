import { test, expect } from "@playwright/test";
import { BUDGET_MS, TENTATIVI, chiamaConRitentativo } from "../lib/voli/fornitori/chiamata";

/**
 * LA CODA CON RITENTATIVO.
 *
 * Il tetto di AeroDataBox non è mensile, è al SECONDO: anche sul piano
 * più caro sono 3 richieste al secondo. Un video che va bene manda mille
 * persone in due minuti, e in quel minuto il fornitore comincia a
 * rispondere "troppe richieste". Prima si mollava al primo colpo e la
 * vendita diventava un incerto.
 *
 * Queste prove tengono ferme le tre cose che possono fare danno:
 * che si riprovi dove serve, che NON si riprovi dove sarebbe solo
 * spreco, e che non si sfondi mai il tetto dei 10 secondi delle
 * funzioni Netlify, perché oltre quello l'utente vede un errore vero
 * invece di un incerto onesto.
 */

/** Sostituisce fetch con una finta che risponde secondo un copione. */
function finge(copione: Array<number | "boom">, ritardoMs = 0) {
  const vero = globalThis.fetch;
  let chiamate = 0;
  globalThis.fetch = (async () => {
    const passo = copione[Math.min(chiamate, copione.length - 1)];
    chiamate++;
    if (ritardoMs) await new Promise((r) => setTimeout(r, ritardoMs));
    if (passo === "boom") throw new Error("rete giù");
    /* Un 204 vuol dire "nessun contenuto" e per le regole di HTTP non
       può AVERE un corpo: passargli una stringa vuota fa esplodere il
       costruttore. È lo stesso motivo per cui il 204 va trattato a
       parte anche nel codice vero. */
    const corpo = passo === 204 || passo === 304 ? null : passo === 200 ? "{}" : "";
    return new Response(corpo, { status: passo });
  }) as typeof fetch;
  return {
    quante: () => chiamate,
    basta: () => {
      globalThis.fetch = vero;
    },
  };
}

test.describe("Si riprova dove serve", () => {
  test('"troppe richieste" e poi ok: la risposta arriva', async () => {
    const f = finge([429, 200]);
    try {
      const esito = await chiamaConRitentativo("https://esempio/x", {}, "prova");
      expect(esito.ok, "il secondo tentativo doveva riuscire").toBe(true);
      expect(f.quante()).toBe(2);
    } finally {
      f.basta();
    }
  });

  test("un guasto del fornitore si riprova", async () => {
    const f = finge([503, 200]);
    try {
      expect((await chiamaConRitentativo("https://esempio/x", {}, "prova")).ok).toBe(true);
      expect(f.quante()).toBe(2);
    } finally {
      f.basta();
    }
  });

  test("la rete caduta si riprova", async () => {
    const f = finge(["boom", 200]);
    try {
      expect((await chiamaConRitentativo("https://esempio/x", {}, "prova")).ok).toBe(true);
      expect(f.quante()).toBe(2);
    } finally {
      f.basta();
    }
  });

  test("se non smette mai, si tenta il numero dichiarato e non di più", async () => {
    const f = finge([429]);
    try {
      const esito = await chiamaConRitentativo("https://esempio/x", {}, "prova");
      expect(esito.ok).toBe(false);
      expect(f.quante()).toBe(TENTATIVI);
    } finally {
      f.basta();
    }
  });
});

test.describe("NON si riprova dove sarebbe solo spreco", () => {
  for (const stato of [404, 204, 400, 401, 403]) {
    test(`${stato}: una volta e basta`, async () => {
      const f = finge([stato]);
      try {
        const esito = await chiamaConRitentativo("https://esempio/x", {}, "prova");
        expect(esito.ok).toBe(false);
        /* 404 vuol dire che quel volo su quella data non ce l'hanno:
           riprovare dieci volte darebbe dieci volte lo stesso 404,
           costando dieci volte. */
        expect(f.quante(), `su ${stato} non si riprova`).toBe(1);
      } finally {
        f.basta();
      }
    });
  }
});

test.describe("Il tetto dei 10 secondi non si sfonda mai", () => {
  test("il budget totale sta sotto il limite delle funzioni Netlify", () => {
    /* Le funzioni muoiono a 10 secondi. Se il budget arrivasse lì,
       l'utente vedrebbe un errore vero invece di un incerto onesto, che
       è molto peggio. */
    expect(BUDGET_MS).toBeLessThanOrEqual(8_500);
  });

  test("con un fornitore lentissimo si smette prima di far morire la funzione", async () => {
    const f = finge([429], 400);
    const partito = Date.now();
    try {
      await chiamaConRitentativo("https://esempio/x", {}, "prova", 2_000);
      const durata = Date.now() - partito;
      expect(durata, "ha sforato il budget che gli è stato dato").toBeLessThan(3_500);
    } finally {
      f.basta();
    }
  });

  test("con budget già finito non si chiama nemmeno una volta", async () => {
    const f = finge([200]);
    try {
      const esito = await chiamaConRitentativo("https://esempio/x", {}, "prova", 10);
      expect(esito.ok).toBe(false);
      expect(f.quante(), "chiamare col tempo scaduto fa morire la funzione").toBe(0);
    } finally {
      f.basta();
    }
  });
});

test.describe("Chi chiama il fornitore passa da qui", () => {
  test("il check e la ricerca per tratta usano il ritentativo", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    for (const f of ["lib/voli/fornitori/aerodatabox.ts", "lib/voli/tratta.ts"]) {
      const codice = readFileSync(join(process.cwd(), f), "utf8");
      expect(codice, `${f} chiama il fornitore senza ritentativo`).toContain(
        "chiamaConRitentativo",
      );
      /* E non deve restare in giro una fetch diretta al fornitore, che
         salterebbe la coda senza che nessuno se ne accorga. */
      expect(codice, `${f} ha ancora una fetch diretta`).not.toMatch(
        /await fetch\(url/,
      );
    }
  });
});
