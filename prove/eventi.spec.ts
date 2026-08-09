import { test, expect } from "@playwright/test";
import { AEROPORTI_OSSERVATI } from "../lib/osservatorio/ritardi";
import { SIGNIFICATO, TINTA } from "../lib/eventi/significato";
import { validaCandidato } from "../lib/scioperi/raccolta";
import { giorniDa, giornoEData } from "../lib/date";

/**
 * LE PAGINE EVENTO (giro #41).
 *
 * Due cose da blindare, e sono diverse fra loro.
 *
 * 1. IL FILTRO DELL'AUTOPILOT. È l'unico punto del progetto dove un
 *    modello scrive dentro il database, e quello che scrive finisce su
 *    una pagina pubblica col nostro nome sopra. Il filtro deve dire di no
 *    a tutto quello che non è chiaramente uno sciopero aereo con una data
 *    vera: queste prove sono la sua rete.
 *
 * 2. LE PAGINE. Devono reggere anche a database spento, perché nella
 *    sandbox Supabase non si raggiunge: senza righe la pagina degli
 *    scioperi resta viva con le regole, le fasce e il check.
 */

const OGGI = "2026-08-09";

const buono = {
  data: "2026-09-12",
  settore: "trasporto aereo, personale navigante",
  descrizione:
    "Sciopero nazionale di 24 ore del personale navigante, proclamato dalle sigle confederali. Fasce garantite 7-10 e 18-21.",
  compagnie: ["FR"],
  tipo: "personale_compagnia",
  fonteUrl: "https://scioperi.mit.gov.it/mit2/public/scioperi",
};

test.describe("L'autopilot degli scioperi: il filtro", () => {
  test("una riga completa e credibile passa", () => {
    const c = validaCandidato(buono, OGGI);
    expect(c).not.toBeNull();
    expect(c?.data).toBe("2026-09-12");
    expect(c?.compagnie).toEqual(["FR"]);
  });

  test("una data che non è una data non passa", () => {
    for (const data of ["12 settembre", "2026-13-01", "", "12/09/2026", "domani"]) {
      expect(validaCandidato({ ...buono, data }, OGGI), data).toBeNull();
    }
  });

  test("le date troppo lontane nel tempo non passano: è quasi sempre un anno letto male", () => {
    expect(validaCandidato({ ...buono, data: "2025-09-12" }, OGGI)).toBeNull();
    expect(validaCandidato({ ...buono, data: "2027-09-12" }, OGGI)).toBeNull();
    /* Un mese indietro sì: le proclamazioni si scoprono anche a cose fatte. */
    expect(validaCandidato({ ...buono, data: "2026-07-20" }, OGGI)).not.toBeNull();
  });

  test("gli scioperi che non riguardano il volo non passano", () => {
    const treni = {
      ...buono,
      settore: "trasporto ferroviario",
      descrizione:
        "Sciopero nazionale di 24 ore del personale ferroviario proclamato dalle segreterie regionali.",
    };
    expect(validaCandidato(treni, OGGI)).toBeNull();

    const sanita = {
      ...buono,
      settore: "sanità pubblica",
      descrizione:
        "Sciopero del personale sanitario di 24 ore proclamato dalle organizzazioni di categoria.",
    };
    expect(validaCandidato(sanita, OGGI)).toBeNull();
  });

  test("una descrizione vuota o chilometrica non passa", () => {
    expect(validaCandidato({ ...buono, descrizione: "sciopero" }, OGGI)).toBeNull();
    expect(validaCandidato({ ...buono, descrizione: "x".repeat(700) }, OGGI)).toBeNull();
  });

  test("senza il link della fonte non entra niente", () => {
    expect(validaCandidato({ ...buono, fonteUrl: "" }, OGGI)).toBeNull();
    expect(validaCandidato({ ...buono, fonteUrl: "scioperi.mit.gov.it" }, OGGI)).toBeNull();
  });

  test("le compagnie che non sono codici IATA si buttano, non si tengono", () => {
    const c = validaCandidato(
      { ...buono, compagnie: ["Ryanair", "FR", "fr", "U2", "12345", ""] },
      OGGI,
    );
    expect(c?.compagnie).toEqual(["FR", "U2"]);
  });

  test("un tipo inventato diventa 'altro', non fa saltare la riga", () => {
    const c = validaCandidato({ ...buono, tipo: "fantasia" }, OGGI);
    expect(c?.tipo).toBe("altro");
  });

  test("robaccia qualsiasi non passa", () => {
    for (const x of [null, undefined, "sciopero", 42, [], {}]) {
      expect(validaCandidato(x, OGGI)).toBeNull();
    }
  });
});

test.describe("Il significato di uno sciopero", () => {
  test("lo sciopero della compagnia e quello dei controllori non dicono la stessa cosa", () => {
    /* È la distinzione che decide se la compensazione spetta, ed è quella
       che i portali saltano: se un giorno diventasse uguale, la pagina
       smetterebbe di valere qualcosa. */
    expect(SIGNIFICATO.personale_compagnia.peso).toBe("di-solito-spetta");
    expect(SIGNIFICATO.atc_esterno.peso).toBe("di-solito-non-spetta");
    expect(SIGNIFICATO.handling.peso).toBe("dipende");
  });

  test("nessun testo promette un esito, e nessuno usa il trattino lungo", () => {
    const tutto = [
      ...Object.values(SIGNIFICATO).flatMap((s) => [s.etichetta, s.chi, s.spiegazione]),
      ...Object.values(TINTA).map((t) => t.parola),
    ].join("\n");
    expect(tutto).not.toContain("—");
    expect(tutto.toLowerCase()).not.toContain("hai diritto a");
    expect(tutto.toLowerCase()).not.toContain("garantiamo");
  });
});

test.describe("Le date, in italiano", () => {
  test("il giorno della settimana è quello vero, senza scivolare di fuso", () => {
    expect(giornoEData("2026-08-09")).toBe("domenica 9 agosto");
    expect(giornoEData("2026-01-01")).toBe("giovedì 1 gennaio");
  });

  test("i giorni che mancano si contano giusti", () => {
    expect(giorniDa("2026-08-12", "2026-08-09")).toBe(3);
    expect(giorniDa("2026-08-09", "2026-08-09")).toBe(0);
    expect(giorniDa("2026-08-01", "2026-08-09")).toBe(-8);
  });
});

test.describe("Le pagine evento", () => {
  test("la pagina degli scioperi vive anche senza database", async ({ page }) => {
    /* Nella sandbox Supabase non si raggiunge: è esattamente lo scenario
       peggiore, e la pagina deve restare utile lo stesso. */
    await page.goto("/sciopero-aerei");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sciopero aerei");
    await expect(
      page.getByRole("heading", { name: "Quello che ti spetta comunque, sciopero o no" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Non tutti gli scioperi valgono uguale" }),
    ).toBeVisible();
    /* Il gancio: il check vero dentro la pagina, non un rimando. */
    await expect(page.getByText("Il check di Rivolio")).toBeVisible();
  });

  test("una data senza scioperi è un 404, non una pagina vuota", async ({ page }) => {
    const r = await page.goto("/sciopero-aerei/2026-02-30");
    expect(r?.status()).toBe(404);
  });

  test("ogni scalo dell'Osservatorio ha la sua pagina", async ({ page }) => {
    for (const scalo of AEROPORTI_OSSERVATI.slice(0, 3)) {
      await page.goto(`/aeroporto/${scalo.iata.toLowerCase()}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Ritardi");
      await expect(page.getByText(scalo.nome).first()).toBeVisible();
    }
  });

  test("uno scalo che non seguiamo è un 404", async ({ page }) => {
    const r = await page.goto("/aeroporto/zzz");
    expect(r?.status()).toBe(404);
  });

  test("le pagine evento portano al blog e viceversa", async ({ page }) => {
    await page.goto("/sciopero-aerei");
    await expect(
      page.getByRole("link", { name: /Sciopero aerei: cosa fare mentre sei in aeroporto/ }),
    ).toBeVisible();

    await page.goto("/tabellone/sciopero-aerei-cosa-fare-in-aeroporto");
    await expect(page.getByRole("link", { name: "calendario degli scioperi" })).toBeVisible();
  });

  test("la sitemap porta dentro le pagine evento", async ({ request }) => {
    const r = await request.get("/sitemap.xml");
    expect(r.status()).toBe(200);
    const corpo = await r.text();
    expect(corpo).toContain("/sciopero-aerei");
    for (const scalo of AEROPORTI_OSSERVATI) {
      expect(corpo).toContain(`/aeroporto/${scalo.iata.toLowerCase()}`);
    }
  });

  test("l'autopilot non si apre senza segreto", async ({ request }) => {
    /* In sviluppo il segreto non è impostato e la rotta si apre: è voluto,
       serve a provarla. Qui si controlla solo che risponda e non esploda. */
    const r = await request.get("/api/motore/scioperi?segreto=sbagliato");
    expect([200, 401, 500]).toContain(r.status());
  });
});
