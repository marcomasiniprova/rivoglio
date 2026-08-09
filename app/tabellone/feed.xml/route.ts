import { NOME_BLOG, RADICE, tutti } from "@/lib/tabellone/indice";
import { CASA, indirizzoArticolo } from "@/lib/tabellone/seo";

/**
 * Il feed RSS del Tabellone.
 *
 * Serve a due cose concrete, nessuna delle quali è nostalgia: i lettori
 * di feed (Feedly e simili) sono ancora il modo in cui i giornalisti
 * seguono le fonti, e i servizi di rassegna stampa li leggono per primi.
 * Per un blog che vuole farsi citare vale i venti minuti che costa.
 */

export const dynamic = "force-static";

/** In XML questi cinque caratteri non possono restare come sono. */
function xml(testo: string): string {
  return testo
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS vuole la data in RFC 822, non ISO. */
function dataRss(iso: string): string {
  return new Date(`${iso}T09:00:00Z`).toUTCString();
}

export function GET() {
  const articoli = tutti();
  const aggiornato = articoli[0]?.data;

  const voci = articoli
    .map(
      (a) => `    <item>
      <title>${xml(a.titolo)}</title>
      <link>${indirizzoArticolo(a.slug)}</link>
      <guid isPermaLink="true">${indirizzoArticolo(a.slug)}</guid>
      <pubDate>${dataRss(a.data)}</pubDate>
      <description>${xml(a.descrizione)}</description>
    </item>`,
    )
    .join("\n");

  const corpo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(NOME_BLOG)} di Rivolio</title>
    <link>${CASA}${RADICE}</link>
    <atom:link href="${CASA}${RADICE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Ritardi, cancellazioni e rimborsi aerei spiegati senza gergo. Il blog di Rivolio.</description>
    <language>it-IT</language>${
      aggiornato ? `\n    <lastBuildDate>${dataRss(aggiornato)}</lastBuildDate>` : ""
    }
${voci}
  </channel>
</rss>`;

  return new Response(corpo, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
