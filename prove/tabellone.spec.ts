import { existsSync, readdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { COPERTINE } from "../components/tabellone/Copertine";
import { NOME_BLOG, PER_PAGINA, quantePagine, tutti } from "../lib/tabellone/indice";
import { TAG, type Blocco } from "../lib/tabellone/tipi";

/**
 * IL TABELLONE (il blog, giro #40).
 *
 * Due famiglie di prove, e servono a cose diverse.
 *
 * 1. Le prove SUI DATI girano senza browser e sono quelle che contano di
 *    più: un blog vive di articoli, e un articolo con un link rotto, una
 *    copertina inesistente o un numero senza fonte è un danno che resta
 *    online per anni. Qui si blindano le regole di redazione, non il CSS.
 *
 * 2. Le prove SULLA PAGINA controllano che le tre sezioni del riferimento
 *    ci siano davvero e che il campo email risponda.
 */

const ARTICOLI = tutti();
const SLUG = new Set(ARTICOLI.map((a) => a.slug));

/** Tutto il testo che un lettore vede in un articolo, in una stringa sola. */
function testoVisibile(blocchi: Blocco[]): string {
  const pezzi: string[] = [];
  for (const b of blocchi) {
    switch (b.tipo) {
      case "p":
      case "h2":
      case "h3":
        pezzi.push(b.testo);
        break;
      case "elenco":
      case "passi":
        pezzi.push(...b.voci);
        break;
      case "citazione":
        pezzi.push(b.testo, b.fonte ?? "");
        break;
      case "tabella":
        pezzi.push(...b.intestazioni, ...b.righe.flat());
        break;
      case "nota":
        pezzi.push(b.titolo, b.testo);
        break;
      case "check":
        pezzi.push(b.titolo ?? "", b.testo ?? "");
        break;
      case "faq":
        pezzi.push(...b.voci.flatMap((v) => [v.domanda, v.risposta]));
        break;
      default:
        break;
    }
  }
  return pezzi.join("\n");
}

test.describe("Il Tabellone: la redazione", () => {
  test("in `public/` non restano immagini sparse", () => {
    /* Le copertine stanno tutte in `public/assets/tabellone/`. Il 9/08 due
       file `image-<numero>.webp` erano finiti nella radice di `public/`:
       erano le schermate del blog di riferimento, e da lì il sito le
       avrebbe servite pubblicamente sotto il nostro dominio. Questa prova
       esiste perché è successo. */
    const sparse = readdirSync("public").filter((f) => /^image-\d+\./.test(f));
    expect(sparse, `immagini sparse in public/: ${sparse.join(", ")}`).toEqual([]);
  });

  test("ci sono quindici articoli, con slug e titoli unici", () => {
    /* Undici dal 10/08 (giro #48, riforma 2027); dal 17/08 (giro GEO)
       quattro nuovi: coincidenza persa, overbooking, ITA Airways e la
       scelta rimborso/volo alternativo sul cancellato. */
    expect(ARTICOLI.length).toBe(15);
    expect(SLUG.size).toBe(ARTICOLI.length);
    expect(new Set(ARTICOLI.map((a) => a.titolo)).size).toBe(ARTICOLI.length);
  });

  test("il mix è quello deciso: 2 pilastri, 2 di emergenza, 2 sui dati, 9 verticali", () => {
    const conto = (t: string) => ARTICOLI.filter((a) => a.tipo === t).length;
    expect(conto("pilastro")).toBe(2);
    expect(conto("emergenza")).toBe(2);
    expect(conto("dati")).toBe(2);
    /* I verticali sono i pezzi che intercettano una ricerca sola: quattro
       per compagnia (Ryanair, easyJet, Wizz, ITA) e cinque per situazione
       (prescrizione, riforma, coincidenza, overbooking, cancellato-scelta). */
    expect(conto("compagnia") + conto("situazione")).toBe(9);
  });

  for (const a of ARTICOLI) {
    test.describe(`«${a.titolo}»`, () => {
      test("rispetta le regole di scrittura del progetto", () => {
        const testo = [a.titolo, a.descrizione, a.estratto, testoVisibile(a.corpo)].join("\n");
        /* Il trattino lungo è il segno più riconoscibile del testo scritto
           da un'AI: vietato ovunque lo veda un lettore. */
        expect(testo, "trattino lungo").not.toContain("—");
        /* "hai diritto a" è una promessa, e noi non promettiamo esiti. */
        expect(testo.toLowerCase()).not.toContain("hai diritto a");
        expect(testo.toLowerCase()).not.toContain("ha diritto a");
        expect(testo.toLowerCase()).not.toContain("hanno diritto a");
      });

      test("i metadati stanno nelle misure che Google mostra", () => {
        expect(a.titoloSeo.length, "titolo SEO oltre i 60 caratteri").toBeLessThanOrEqual(60);
        expect(a.descrizione.length).toBeGreaterThanOrEqual(110);
        expect(a.descrizione.length).toBeLessThanOrEqual(170);
        expect(a.estratto.length).toBeLessThanOrEqual(185);
        expect(a.slug).toMatch(/^[a-z0-9-]+$/);
        expect(a.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(a.minuti).toBeGreaterThan(0);
      });

      test("ha una copertina che esiste e tag validi", () => {
        expect(Object.keys(COPERTINE), `copertina ${a.copertina}`).toContain(a.copertina);
        /* La foto vince sul disegno, quindi se il file non c'è la card resta
           vuota e nessuno se ne accorge finché non lo vede un lettore. */
        if (a.foto) {
          expect(a.foto).toMatch(/^\/assets\/tabellone\/[a-z0-9-]+\.webp$/);
          expect(
            existsSync(`public${a.foto}`),
            `la foto dichiarata non esiste: public${a.foto}`,
          ).toBe(true);
        }
        expect(a.tag.length).toBeGreaterThanOrEqual(2);
        for (const t of a.tag) expect(Object.keys(TAG)).toContain(t);
      });

      test("ha il gancio del check e la struttura minima", () => {
        const quanti = (t: string) => a.corpo.filter((b) => b.tipo === t).length;
        expect(quanti("check"), "il check va messo una volta sola").toBe(1);
        expect(quanti("confronto")).toBeLessThanOrEqual(1);
        expect(quanti("osservatorio")).toBeLessThanOrEqual(1);
        expect(quanti("h2"), "servono almeno quattro sezioni").toBeGreaterThanOrEqual(4);

        const domande = a.corpo.find((b) => b.tipo === "faq");
        expect(domande, "ogni articolo chiude con le domande").toBeTruthy();
        if (domande?.tipo === "faq") expect(domande.voci.length).toBeGreaterThanOrEqual(4);
      });

      test("ogni fonte è un indirizzo vero, e ce n'è almeno una", () => {
        expect(a.fonti.length).toBeGreaterThan(0);
        for (const f of a.fonti) {
          expect(f.url, `fonte non http: ${f.url}`).toMatch(/^https?:\/\//);
          expect(f.titolo.length).toBeGreaterThan(8);
        }
        expect(new Set(a.fonti.map((f) => f.url)).size).toBe(a.fonti.length);
      });

      test("i link interni portano a pagine che esistono", () => {
        const testo = testoVisibile(a.corpo);
        const interni = [...testo.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
        for (const dove of interni) {
          if (dove.startsWith("/tabellone/")) {
            const slug = dove.replace("/tabellone/", "").split("#")[0];
            expect(SLUG, `link interno rotto: ${dove}`).toContain(slug);
            expect(slug, "un articolo non linka se stesso").not.toBe(a.slug);
          } else {
            /* Le altre destinazioni interne ammesse sono le pagine del sito
               che esistono davvero. Un refuso qui manda il lettore su un 404
               proprio nel momento in cui stava per convertire. */
            expect(
              [
                "/",
                "/app",
                "/entra",
                "/guida-bagagli",
                "/privacy",
                "/condizioni",
                "/cookie",
                "/sciopero-aerei",
                "/aeroporto",
                "/giudice-di-pace",
              ].some(
                (p) => dove === p || dove.startsWith(`${p}#`) || dove.startsWith("/#"),
              ),
              `link interno sconosciuto: ${dove}`,
            ).toBe(true);
          }
        }
        expect(interni.length, "almeno un link interno per articolo").toBeGreaterThan(0);
      });

      test("i correlati dichiarati esistono", () => {
        for (const s of a.correlati ?? []) {
          expect(SLUG, `correlato inesistente: ${s}`).toContain(s);
          expect(s).not.toBe(a.slug);
        }
      });
    });
  }

  test("i due pilastri sono raggiungibili da tutti gli altri articoli", () => {
    const pilastri = ARTICOLI.filter((a) => a.tipo === "pilastro").map((a) => a.slug);
    for (const a of ARTICOLI) {
      if (a.tipo === "pilastro") continue;
      const testo = testoVisibile(a.corpo) + (a.correlati ?? []).join(" ");
      expect(
        pilastri.some((p) => testo.includes(p)),
        `«${a.titolo}» non rimanda a nessun pilastro: il cluster si spezza`,
      ).toBe(true);
    }
  });

  test("la paginazione copre tutti gli articoli e non ne perde nessuno", () => {
    const pagine = quantePagine();
    expect(pagine).toBe(Math.ceil(ARTICOLI.length / PER_PAGINA));
    const raccolti = new Set<string>();
    for (let n = 1; n <= pagine; n++) {
      for (const a of ARTICOLI.slice((n - 1) * PER_PAGINA, n * PER_PAGINA)) raccolti.add(a.slug);
    }
    expect(raccolti.size).toBe(ARTICOLI.length);
  });
});

test.describe("Il Tabellone: le pagine", () => {
  test("la home ha le tre sezioni del riferimento", async ({ page }) => {
    await page.goto("/tabellone");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(NOME_BLOG);
    await expect(page.getByRole("heading", { name: "Gli ultimi articoli" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tutti gli articoli" })).toBeVisible();

    /* La griglia mostra sei card per pagina, come nel riferimento. */
    const griglia = page.locator("article");
    expect(await griglia.count()).toBeGreaterThanOrEqual(PER_PAGINA);

    /* La paginazione esiste e la pagina 1 è quella corrente. */
    await expect(page.getByRole("navigation", { name: "Pagine del Tabellone" })).toBeVisible();
    /* `exact` obbligatorio: senza, "Successivo" pesca anche le card il cui
       testo contiene la parola, e il locator diventa ambiguo. */
    await expect(page.getByRole("link", { name: "Successivo", exact: true })).toBeVisible();
  });

  test("il campo email c'è in cima e in fondo, e chiede l'email", async ({ page }) => {
    await page.goto("/tabellone");
    const campi = page.getByPlaceholder("La tua email");
    expect(await campi.count()).toBeGreaterThanOrEqual(2);
    await expect(campi.first()).toHaveAttribute("type", "email");
    await expect(page.getByRole("heading", { name: /Osservatorio/ })).toBeVisible();
  });

  test("da una card si arriva all'articolo, e l'articolo ha le sue fonti", async ({ page }) => {
    const primo = ARTICOLI[0];
    await page.goto(`/tabellone/${primo.slug}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(primo.titolo);
    await expect(page.getByRole("heading", { name: "Da dove vengono i numeri" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Da leggere dopo" })).toBeVisible();

    /* Il gancio: dentro l'articolo c'è il check vero, non un rimando. */
    await expect(page.getByText("Il check di Rivolio")).toBeVisible();

    /* I dati strutturati devono dichiarare un BlogPosting. */
    const dati = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(dati.join(" ")).toContain("BlogPosting");
  });

  test("la seconda pagina esiste e la prima non è duplicata", async ({ page }) => {
    await page.goto("/tabellone/pagina/2");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("archivio");

    const risposta = await page.goto("/tabellone/pagina/1");
    expect(risposta?.status(), "pagina 1 duplicherebbe la home").toBe(404);
  });

  test("le pagine argomento raccolgono gli articoli del cluster", async ({ page }) => {
    await page.goto("/tabellone/argomento/compagnie");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Compagnie");
    expect(await page.locator("article").count()).toBeGreaterThan(0);
  });

  test("il feed RSS è servito e contiene gli articoli", async ({ request }) => {
    const r = await request.get("/tabellone/feed.xml");
    expect(r.status()).toBe(200);
    const corpo = await r.text();
    expect(corpo).toContain("<rss");
    for (const a of ARTICOLI) expect(corpo).toContain(`/tabellone/${a.slug}`);
  });

  test("la sitemap porta il blog dentro", async ({ request }) => {
    const r = await request.get("/sitemap.xml");
    expect(r.status()).toBe(200);
    const corpo = await r.text();
    expect(corpo).toContain("/tabellone");
    for (const a of ARTICOLI) expect(corpo).toContain(`/tabellone/${a.slug}`);
  });
});
