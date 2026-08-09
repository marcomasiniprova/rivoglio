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

/**
 * Una riga di scalo per l'email: nome a sinistra, indice e mediana a
 * destra. Nelle email non esistono griglie: è una tabella, e basta.
 */
export function rigaScalo(nome: string, indice: string, sotto: string) {
  return `
  <tr>
    <td style="padding:11px 0;border-top:1px solid ${C.bordo};font-family:${FONT};font-size:15px;color:${C.inchiostro};font-weight:600;">${nome}
      <span style="display:block;font-size:12.5px;color:${C.fumo2};font-weight:400;margin-top:2px;">${sotto}</span>
    </td>
    <td align="right" style="padding:11px 0;border-top:1px solid ${C.bordo};font-family:${FONT};font-size:19px;color:${C.inchiostro};font-weight:700;white-space:nowrap;">${indice}<span style="font-size:12px;color:${C.fumo2};font-weight:400;"> / 5</span></td>
  </tr>`;
}

/** Avvolge il corpo nel vestito completo. */
export function vestito({
  titolo,
  corpo,
  coda,
  disdetta,
}: {
  titolo: string;
  corpo: string;
  coda?: string;
  /** Il link per disdire: obbligatorio su tutto ciò che è newsletter. */
  disdetta?: string | null;
}) {
  const sito = casa();
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${titolo}</title></head>
<body style="margin:0;padding:0;background:${C.nebbia};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.nebbia};padding:32px 16px;">
<tr><td align="center">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">

    <tr><td style="padding:0 4px 20px;">
      <a href="${sito}" style="text-decoration:none;font-family:${FONT};font-size:19px;font-weight:700;letter-spacing:-0.4px;color:${C.inchiostro};">Rivo<span style="color:${C.verde};">lio</span></a>
      <span style="font-family:${FONT};font-size:13px;color:${C.fumo2};margin-left:10px;">Lo scanner dei rimborsi</span>
    </td></tr>

    <tr><td style="background:#ffffff;border-radius:20px;padding:38px 36px;">
      ${corpo}
    </td></tr>

    <tr><td style="padding:22px 12px 0;">
      <p style="margin:0 0 10px;font-family:${FONT};font-size:12.5px;line-height:1.65;color:${C.fumo2};">
        ${coda ?? "Ricevi questa email perché hai un account su Rivolio."}
      </p>
      <p style="margin:0;font-family:${FONT};font-size:12.5px;line-height:1.65;color:${C.fumo2};">
        Rivolio prepara i documenti: il reclamo lo invii tu, dalla tua email, e la compensazione arriva a te. Non siamo un intermediario e non diamo consulenza legale.
        ${disdetta ? `<br><a href="${disdetta}" style="color:${C.fumo2};text-decoration:underline;">Non voglio più ricevere queste email</a>` : ""}
      </p>
    </td></tr>

  </table>

</td></tr></table>
</body></html>`;
}

export { C as COLORI, FONT };
