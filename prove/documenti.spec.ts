import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { EVENTO_CARICATO, EVENTO_SALTATO, letteraSbloccata } from "../lib/pratiche/documenti";
import type { EventoPratica } from "../lib/pratiche/pratiche";

/**
 * LA CARTA D'IMBARCO È UN RINFORZO, NON UN MURO.
 *
 * Il 12/08 era stata resa obbligatoria: la lettera si apriva solo dopo
 * averla caricata. Il 13/08 Valerio l'ha provata da utente e il muro è
 * stato tolto (scelta sua col popup):
 *
 *   «Perché nella pagina appena pago la pratica vengo rediretto dove il
 *   bottone è grigio? Che senso ha scusa?»
 *
 * Aveva ragione due volte. La prima: il riquadro sopra il bottone diceva
 * «apri la lettera, inviala dalla tua email» mentre il bottone non si
 * poteva premere. Una pagina che ordina una cosa e la impedisce nella
 * stessa schermata è rotta, per quanto buona sia la ragione. La seconda,
 * più seria: quel muro arrivava **un secondo dopo il pagamento**, cioè
 * nel punto in cui la fiducia è più fragile di tutto il percorso.
 *
 * Queste prove tengono ferme le due cose che contano adesso: che la
 * lettera pagata non si possa più trattenere, e che il riquadro non
 * ridiventi un passo.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

const evento = (tipo: string): EventoPratica =>
  ({
    id: "x",
    pratica_id: "y",
    tipo,
    nota: null,
    creato_il: "2026-08-12T10:00:00Z",
  }) as EventoPratica;

test.describe("Il documento non blocca più niente", () => {
  test("`letteraSbloccata` resta, e dice solo se il documento c'è", () => {
    /* Non decide più l'accesso alla lettera: serve a sapere se
       riproporre l'invito. Le pratiche vecchie hanno già gli eventi
       scritti, e chi aveva usato la porta di servizio non deve vedersi
       richiedere niente. */
    expect(letteraSbloccata([])).toBe(false);
    expect(letteraSbloccata([evento(EVENTO_CARICATO)])).toBe(true);
    expect(letteraSbloccata([evento(EVENTO_SALTATO)])).toBe(true);
  });

  test("🔴 la parola «bloccante» non deve tornare nel riquadro", () => {
    /* Il riquadro aveva due facce e una porta di servizio. Sono sparite
       tutte e tre col muro: se una torna, torna anche il bottone grigio
       subito dopo il pagamento. */
    const c = leggi("components/pratica/CaricaDocumento.tsx");
    expect(c).not.toContain("bloccante");
    expect(c, "la porta di servizio non serve più: non c'è niente da sbloccare").not.toContain(
      "documento/salta",
    );
  });

  test("🔴 la rotta che sbloccava la lettera non esiste più", () => {
    /* Una porta che non serve a niente resta una porta: si toglie. */
    const cartella = join(RADICE, "app/api/pratiche/[id]/documento");
    const dentro = readdirSync(cartella).map((v) => v.toString());
    expect(dentro, "la rotta /salta va rimossa col muro").not.toContain("salta");
  });

  test("il percorso non conosce più un riquadro «passo»", () => {
    /* Si guardano i CAMPI, non il file e nemmeno i commenti: la
       spiegazione di perché quel campo è stato tolto contiene il suo
       nome, ed è giusto che lo contenga. Una prova che vieta di spiegare
       un difetto è una prova che spinge a cancellare la spiegazione. */
    const p = leggi("lib/pratiche/passi.ts");
    const senzaCommenti = p
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^\s*\/\/.*$/gm, " ");
    const tipo = senzaCommenti.slice(
      senzaCommenti.indexOf("export type Riquadri"),
      senzaCommenti.indexOf("export type Percorso"),
    );
    expect(tipo).not.toContain("documentoPasso");
    expect(tipo, "resta solo l'invito di contorno").toContain("documentoExtra");
  });
});

test.describe("Dopo l'invio si sa quando succede il prossimo passo", () => {
  test("la data del sollecito si conta dalla costante vera, non a mano", () => {
    /* Se il giorno fosse scritto a mano, al primo cambio della tappa la
       pagina prometterebbe a un cliente pagante una data che il motore
       non rispetta più. */
    const pagina = leggi("app/pratica/[id]/page.tsx");
    expect(pagina).toContain("GIORNI_PRIMA_DEL_SOLLECITO");
    expect(pagina, "il conto alla rovescia deve esistere").toContain("attesaDopoInvio");
    const i = pagina.indexOf("function attesaDopoInvio");
    expect(pagina.slice(i, i + 900)).not.toMatch(/\b(42|56|90)\b/);
  });

  test("l'email di conferma dell'invio esiste e non blocca l'invio", () => {
    const rotta = leggi("app/api/pratiche/conferma-invio/route.ts");
    expect(rotta).toContain("invioConfermato");
    /* `void`: non si aspetta. Se la posta è giù, l'invio resta
       registrato lo stesso, perché il dato che conta è già scritto. */
    expect(rotta, "l'email non deve mai bloccare la registrazione").toContain(
      "void confermaInvioPerEmail",
    );
  });
});
