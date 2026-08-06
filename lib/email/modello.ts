import { casa } from "./posta";

/**
 * Il vestito di ogni email che mandiamo.
 *
 * Regole delle email che nessuno ricorda finché non si rompe qualcosa:
 * - Tabelle, non flexbox: Outlook usa il motore di Word e ignora flex e grid.
 * - Stili in linea: Gmail butta via i <style> nel <head> su molte versioni.
 * - Larghezza fissa 600px: è la misura che tutti i client reggono.
 * - Niente immagini indispensabili: molti client le bloccano di default,
 *   e un'email che senza immagini non si capisce è un'email persa.
 * - Il bottone è una tabella con dentro un link, non un <button>: nelle
 *   email i bottoni veri non esistono.
 */

const C = {
  inchiostro: "#0a0a0a",
  fumo: "#6b7280",
  fumo2: "#9aa4b0",
  verde: "#0a9d5c",
  verdeNotte: "#052e1f",
  menta: "#e6faf0",
  nebbia: "#f6f8fa",
  bordo: "#e4e9ee",
} as const;

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function bottone(testo: string, href: string) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
    <tr><td style="background:${C.verde};border-radius:13px;">
      <a href="${href}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:13px;">${testo}</a>
    </td></tr>
  </table>`;
}

/** Una riga di conto: voce a sinistra, cifra a destra. */
export function riga(voce: string, cifra: string, forte = false) {
  return `
  <tr>
    <td style="padding:9px 0;font-family:${FONT};font-size:15px;color:${forte ? C.inchiostro : C.fumo};font-weight:${forte ? 600 : 400};border-top:1px solid ${C.bordo};">${voce}</td>
    <td align="right" style="padding:9px 0;font-family:${FONT};font-size:${forte ? 19 : 15}px;color:${forte ? C.verde : C.inchiostro};font-weight:600;border-top:1px solid ${C.bordo};">${cifra}</td>
  </tr>`;
}

/** Avvolge il corpo nel vestito completo. */
export function vestito({
  titolo,
  corpo,
  coda,
}: {
  titolo: string;
  corpo: string;
  coda?: string;
}) {
  const sito = casa();
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${titolo}</title></head>
<body style="margin:0;padding:0;background:${C.nebbia};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.nebbia};padding:32px 16px;">
<tr><td align="center">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">

    <tr><td style="padding-bottom:22px;">
      <a href="${sito}" style="text-decoration:none;font-family:${FONT};font-size:17px;font-weight:600;color:${C.inchiostro};">
        <span style="display:inline-block;width:26px;height:26px;background:${C.verde};border-radius:7px;vertical-align:middle;"></span>
        <span style="vertical-align:middle;margin-left:8px;">Viaggio Anche Io</span>
      </a>
    </td></tr>

    <tr><td style="background:#ffffff;border-radius:20px;padding:38px 36px;">
      ${corpo}
    </td></tr>

    <tr><td style="padding:24px 8px 0;">
      <p style="margin:0;font-family:${FONT};font-size:12.5px;line-height:1.6;color:${C.fumo2};">
        ${coda ?? "Ricevi questa email perché hai un account su Viaggio Anche Io."}
        <br>
        Segnaliamo offerte di terzi e non vendiamo viaggi: si prenota sul sito della struttura.
        I costi di viaggio sono stime calcolate, non prezzi garantiti.
      </p>
    </td></tr>

  </table>

</td></tr></table>
</body></html>`;
}

export { C as COLORI, FONT };
