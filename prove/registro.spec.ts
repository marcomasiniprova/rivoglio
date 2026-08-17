import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  paeseDi,
  provenienzaVisita,
  sorgenteAI,
  soloIlDominio,
} from "../lib/eventi/registra";

/**
 * LE PROMESSE DEL REGISTRO.
 *
 * Il registro degli eventi è l'unico posto del progetto dove scriviamo
 * qualcosa su chi passa dal sito. La privacy dichiara tre cose precise:
 * niente indirizzo IP, niente impronta del browser, e la provenienza
 * ridotta al solo dominio. Queste prove esistono perché quelle tre righe
 * restino vere anche fra sei mesi, quando servirà "solo un campo in più".
 */

test.describe("il registro non raccoglie persone", () => {
  test("la provenienza si riduce al dominio, il percorso sparisce", () => {
    expect(soloIlDominio("https://www.tiktok.com/@tizio/video/7412345678901234567")).toBe(
      "tiktok.com",
    );
    expect(soloIlDominio("https://www.instagram.com/p/ABC123/")).toBe("instagram.com");
    expect(soloIlDominio("https://www.google.com/search?q=rimborso+volo+ryanair")).toBe(
      "google.com",
    );
  });

  test("le anteprime di Netlify non sono 'gente che arriva da fuori'", () => {
    /* 🔴 Difetto vero, trovato facendo partire il primo riepilogo dal
       sito online (11/08): fra le provenienze comparivano tre indirizzi
       tipo `6a7b89e1...--rivolio.netlify.app`, che sono le copie che
       Netlify pubblica a ogni deploy. Era il sito che navigava sé
       stesso, contato come traffico in arrivo: il numero più inutile
       che si possa mettere in un cruscotto, perché si legge come
       pubblico e non lo è. */
    const prima = process.env.NEXT_PUBLIC_SITO;
    process.env.NEXT_PUBLIC_SITO = "https://rivolio.netlify.app";
    try {
      expect(soloIlDominio("https://rivolio.netlify.app/prezzi")).toBeNull();
      expect(soloIlDominio("https://6a7b89e169f331000899b69d--rivolio.netlify.app/")).toBeNull();
      expect(soloIlDominio("https://qualche-ramo--rivolio.netlify.app/tabellone")).toBeNull();
      // ma un sito che si chiama in modo simile NON è nostro
      expect(soloIlDominio("https://rivolio.netlify.app.finto.it/")).toBe("rivolio.netlify.app.finto.it");
      // e quello che arriva davvero da fuori resta contato
      expect(soloIlDominio("https://www.tiktok.com/@x/video/1")).toBe("tiktok.com");
    } finally {
      if (prima === undefined) delete process.env.NEXT_PUBLIC_SITO;
      else process.env.NEXT_PUBLIC_SITO = prima;
    }
  });

  test("senza provenienza non si inventa niente", () => {
    expect(soloIlDominio(null)).toBeNull();
    expect(soloIlDominio("")).toBeNull();
    expect(soloIlDominio("non-un-indirizzo")).toBeNull();
  });

  test("il paese si prende da Netlify, non si deduce", () => {
    const con = (h: Record<string, string>) => new Request("https://x.test", { headers: h });
    expect(paeseDi(con({ "x-nf-geo-country": "it" }))).toBe("IT");
    /* Un indirizzo IP non deve poter diventare un paese: se un domani
       qualcuno aggiungesse una tabella IP→paese, avremmo cominciato a
       trattare un dato che abbiamo promesso di non trattare. */
    expect(paeseDi(con({ "x-forwarded-for": "93.45.12.7" }))).toBeNull();
    expect(paeseDi(con({ "x-nf-geo-country": "Italia" }))).toBeNull();
  });

  test("nel registro non entra nessun campo che identifichi una persona", () => {
    const codice = readFileSync(join(process.cwd(), "lib/eventi/registra.ts"), "utf8");
    /* Si guardano i campi scritti nella tabella, non i commenti: il file
       la parola "ip" la nomina apposta per dire che NON la usa.
       ⚠️ E si cercano parole intere: "ip" sta dentro "tipo", quindi un
       controllo per pezzo di testo boccerebbe il codice giusto (è
       successo scrivendo questa prova). */
    const insert = codice.slice(codice.indexOf(".insert("), codice.indexOf("if (error"));
    for (const vietato of ["ip", "user_agent", "userAgent", "email", "impronta", "fingerprint"]) {
      expect(insert, `campo vietato nel registro: ${vietato}`).not.toMatch(
        new RegExp(`\\b${vietato}\\b`, "i"),
      );
    }
  });

  test("la privacy dichiara quello che il registro raccoglie davvero", () => {
    const privacy = readFileSync(join(process.cwd(), "app/privacy/page.tsx"), "utf8");
    /* Raccogliere provenienza e paese senza scriverlo nell'informativa
       sarebbe la cosa più facile da dimenticare e la più cara da
       spiegare dopo. */
    expect(privacy).toContain("Statistiche d&apos;uso");
    expect(privacy).toContain("tiktok.com");
    expect(privacy).toContain("indirizzo IP");
  });
});

test.describe("il traffico dai motori AI si riconosce (GEO)", () => {
  /**
   * Il marketing GEO ha senso solo se si può MISURARE. Queste prove
   * tengono ferme le due regole che lo rendono misurabile: i motori AI
   * si normalizzano a un'etichetta sola (chat.openai.com e chatgpt.com
   * sono lo stesso posto), e l'etichetta esplicita `utm_source` vince sul
   * referer, perché i motori spesso il referer lo tolgono.
   */
  test("chat.openai.com e chatgpt.com contano come 'chatgpt'", () => {
    expect(sorgenteAI("chatgpt.com")).toBe("chatgpt");
    expect(sorgenteAI("chat.openai.com")).toBe("chatgpt");
    expect(sorgenteAI("www.perplexity.ai")).toBe("perplexity");
    expect(sorgenteAI("gemini.google.com")).toBe("gemini");
  });

  test("chi non è un motore AI non viene scambiato per uno", () => {
    expect(sorgenteAI("tiktok.com")).toBeNull();
    expect(sorgenteAI("google.com")).toBeNull();
    expect(sorgenteAI(null)).toBeNull();
    expect(sorgenteAI("")).toBeNull();
  });

  test("l'etichetta utm_source vince sul referer", () => {
    /* Il caso che conta: il motore AI non manda referer (lo toglie per
       privacy), ma il link che ho messo io su Reddit è taggato. Senza la
       precedenza dell'utm, quella visita finirebbe "senza provenienza". */
    expect(provenienzaVisita(null, "chatgpt")).toBe("chatgpt");
    expect(provenienzaVisita("https://www.reddit.com/r/x", "newsletter")).toBe("newsletter");
    /* Senza utm si ripiega sul dominio del referer, come sempre. */
    expect(provenienzaVisita("https://www.tiktok.com/@x/video/1", null)).toBe("tiktok.com");
    expect(provenienzaVisita(null, null)).toBeNull();
  });
});

test.describe("il riepilogo della sera non confonde zero con non letto", () => {
  /**
   * 🔴 Il primo riepilogo vero diceva «Analisi lanciate: ?» mentre il
   * dato era letto e valeva zero (11/08). In questo progetto "?" e "non
   * letto" vogliono dire una cosa sola: non sono riuscito a leggerlo.
   * Usarli per dire "nessuno l'ha fatto" fa rincorrere un guasto che non
   * esiste, e il giorno del guasto vero non lo si distingue più.
   */
  test("un conteggio a zero si scrive 0, non un punto interrogativo", () => {
    const codice = readFileSync(join(process.cwd(), "app/api/motore/riepilogo/route.ts"), "utf8");
    const corpo = codice.slice(codice.indexOf("export async function scriviRiepilogo"));
    /* Il "?" resta ammesso su una cosa sola, l'incasso, perché quella
       lettura può davvero mancare. Su tutto il resto è vietato. */
    const righeCol = corpo.split("\n").filter((r) => r.includes('"?"'));
    for (const r of righeCol) {
      expect(r, `punto interrogativo fuori dall'incasso: ${r.trim()}`).toContain("incasso");
    }
    // e i conteggi passano dalla funzione che tratta il vuoto come zero
    expect(corpo).toContain("conta(o.visita)");
    expect(corpo).toContain("conta(o.check)");
  });
});

test.describe("il retrobottega è chiuso", () => {
  /**
   * ⚠️ IL PROXY NON BASTA. `proxy.ts` chiude `/admin` a chi non è
   * collegato, ma collegato lo è anche un cliente qualsiasi che ha
   * comprato una pratica: il controllo del RUOLO sta dentro le pagine.
   * Finché era scritto a mano in `app/admin/page.tsx`, le due pagine
   * nuove dell'11/08 sono nate senza, e un cliente avrebbe visto gli
   * incassi e da dove arriva il traffico. Questa prova esiste perché la
   * terza pagina non nasca allo stesso modo.
   */
  test("ogni pagina sotto /admin chiede il ruolo admin", () => {
    const cartella = join(process.cwd(), "app/admin");
    const pagine: string[] = [];
    const gira = (d: string) => {
      for (const v of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, v.name);
        if (v.isDirectory()) gira(p);
        else if (v.name === "page.tsx") pagine.push(p);
      }
    };
    gira(cartella);

    expect(pagine.length, "nessuna pagina admin trovata: prova da riscrivere").toBeGreaterThan(2);
    for (const f of pagine) {
      const codice = readFileSync(f, "utf8");
      expect(codice, `${f.replace(process.cwd(), "")} non chiama soloAdmin()`).toContain(
        "await soloAdmin()",
      );
    }
  });
});

test.describe("le notifiche non possono rompere niente", () => {
  test("il TIN dei soldi non parte senza le due variabili", async () => {
    const codice = readFileSync(join(process.cwd(), "lib/eventi/telegram.ts"), "utf8");
    expect(codice).toContain("if (!gettone || !chat) return false");
    /* Un errore di Telegram non deve mai diventare un errore del sito:
       ogni chiamata sta dentro un try, e il catch scrive e va avanti. */
    expect(codice).toContain("catch (e)");
    expect(codice).toContain("return false");
  });

  test("il TIN dei guasti ha un silenziatore: mille errori restano un messaggio", () => {
    const codice = readFileSync(join(process.cwd(), "lib/eventi/telegram.ts"), "utf8");
    expect(codice).toContain("SILENZIO_MS");
    expect(codice).toMatch(/adesso - prima < SILENZIO_MS/);
  });
});
