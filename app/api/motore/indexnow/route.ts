import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata } from "@/lib/motore/autorizza";
import { inviaAIndexNow } from "@/lib/seo/indexnow";
import sitemap from "@/app/sitemap";

/**
 * «EHI BING, GUARDA CHE C'È ROBA NUOVA» (GEO, 17/08).
 *
 * Prende TUTTI gli indirizzi del sito dalla mappa (la stessa `sitemap.xml`,
 * così la fonte è una sola e non diverge) e li manda a IndexNow. Da lì Bing
 * li mette in coda, e siccome ChatGPT prende dall'indice di Bing l'87% delle
 * sue citazioni, è il gesto che rende le pagine VISIBILI alle AI.
 *
 * ⚠️ Perché una rotta e non un ping nel build: la mappa del sito la sa
 * costruire il sito (legge anche il database per le date degli scioperi).
 * Qui si riusa quella, invece di riscrivere l'elenco a mano e vederlo
 * divergere al primo articolo nuovo.
 *
 * Si lancia da sola una volta al giorno (netlify/functions/indexnow.mjs) e
 * a mano dal browser col segreto, per spingere subito dopo un deploy grosso.
 *
 * ⚠️ NON serve un account Bing per questo: IndexNow prova che il sito è
 * nostro col file della chiave in `public/`. Bing Webmaster Tools è un
 * di più (per la sitemap e per guardare i numeri), non un requisito.
 */
export const dynamic = "force-dynamic";

function casaDelSito(): string {
  return (
    process.env.NEXT_PUBLIC_SITO ??
    process.env.URL ??
    process.env.DEPLOY_PRIME_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function giro() {
  const casa = casaDelSito();
  let urls: string[] = [];
  try {
    const mappa = await sitemap();
    urls = mappa
      .map((v) => (typeof v.url === "string" ? v.url : ""))
      .filter((u): u is string => Boolean(u));
  } catch (e) {
    return { ok: false as const, quante: 0, motivo: `mappa del sito non letta: ${e}` };
  }
  const esito = await inviaAIndexNow(casa, urls);
  console.log(
    `[indexnow] ${esito.ok ? "ok" : "no"} status=${esito.status ?? "-"} quante=${esito.quante}` +
      (esito.motivo ? ` motivo=${esito.motivo}` : ""),
  );
  return esito;
}

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ ok: false, motivo: "non autorizzato" }, { status: 401 });
  }
  const esito = await giro();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 502 });
}

/** A mano dal browser: /api/motore/indexnow?segreto=... */
export async function GET(req: NextRequest) {
  const segreto = process.env.MOTORE_SEGRETO;
  const dato = req.nextUrl.searchParams.get("segreto");
  const puo = segreto ? dato === segreto : process.env.NODE_ENV !== "production";
  if (!puo) {
    return NextResponse.json({ ok: false, motivo: "non autorizzato" }, { status: 401 });
  }
  const esito = await giro();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 502 });
}
