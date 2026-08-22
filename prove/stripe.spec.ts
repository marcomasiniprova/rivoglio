import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inCentesimi } from "../lib/stripe";

/**
 * LA CASSA VERA (Stripe). Prove che difendono i due punti dove si perde o si
 * ruba: la firma del webhook e il filo che lega il pagamento alla verifica.
 * Sono per lo più prove sul sorgente, come quelle di vendita/campione: la
 * cassa vera non si può cliccare da qui, ma queste regole non devono
 * sparire togliendo una riga.
 */

const RADICE = join(__dirname, "..");
const leggi = (f: string) => readFileSync(join(RADICE, f), "utf8");

test.describe("La cassa Stripe", () => {
  test("gli euro diventano centesimi interi", () => {
    expect(inCentesimi(16.9)).toBe(1690);
    expect(inCentesimi(29.9)).toBe(2990);
    expect(inCentesimi(1.99)).toBe(199);
  });

  test("il webhook non apre una pratica senza firma verificata", () => {
    const w = leggi("app/api/stripe/webhook/route.ts");
    // La firma si verifica sui byte crudi, prima di ogni parse.
    expect(w).toContain("await req.text()");
    expect(w).toContain("constructEventAsync");
    // In produzione senza segreto NON si passa: un webhook non firmato è
    // chiunque su internet che si inventa un ordine.
    expect(w).toContain('process.env.NODE_ENV === "production"');
    expect(w).toContain("STRIPE_WEBHOOK_SECRET");
    // Tutta l'evasione (cancello anti-giallo compreso) passa dalla funzione
    // condivisa: il webhook non deve avere una sua strada per creare pratiche.
    expect(w).toContain("evadiPagamentoPratica");
  });

  test("test o live lo decide la chiave, e nessun segreto è scritto nel codice", () => {
    const s = leggi("lib/stripe.ts");
    expect(s).toContain("sk_live_");
    expect(s).toContain("sk_test_");
    expect(s).toContain("process.env.STRIPE_SECRET_KEY");
    // Solo i prefissi di controllo, mai una chiave vera incollata.
    expect(s, "una chiave Stripe vera non deve mai finire nel repo").not.toMatch(
      /sk_(live|test)_[A-Za-z0-9]{6,}/,
    );
  });

  test("il checkout aggancia la verifica al pagamento", () => {
    const r = leggi("app/api/pratiche/checkout/route.ts");
    expect(r).toContain("stripeAttivo()");
    expect(r).toContain("creaSessioneCheckout");
    // Il filo che il webhook riavvolge: senza, un pagamento è orfano e la
    // pratica non nasce mai.
    expect(r).toContain("verifica_id: verifica.id");
  });

  test("chi arriva dopo il pagamento non viene collegato dal browser", () => {
    /* Il buco chiuso il 16/08: il check non ha account, uno può pagare con
       l'email di un altro. La pagina di arrivo NON deve generare un accesso:
       l'ingresso arriva solo nella posta di quell'indirizzo (email T+0). */
    const p = leggi("app/pratica/pronta/page.tsx");
    expect(p).not.toContain("linkDiIngresso");
    expect(p).not.toContain("ingressoDopoPagamento");
  });
});
