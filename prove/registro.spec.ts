import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { paeseDi, soloIlDominio } from "../lib/eventi/registra";

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
