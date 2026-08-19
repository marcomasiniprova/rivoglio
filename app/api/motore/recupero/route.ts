import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata } from "@/lib/motore/autorizza";
import { eseguiRecupero } from "@/lib/recupero/esegui";

/**
 * IL GIRO DI RECUPERO, dietro la porta del motore.
 *
 * Lo chiama la funzione programmata di Netlify una volta al giorno. Il
 * lavoro sta tutto in `lib/recupero/esegui.ts`; qui c'è solo la porta.
 *
 * Si può lanciare a mano dal browser col segreto in fondo all'indirizzo
 * (`?segreto=<MOTORE_SEGRETO>`), per vedere coi propri occhi che gira:
 * risponde quante righe ha guardato e quante email ha mandato (0 e 0 finché
 * `RECUPERO_ATTIVO` è spento).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function autorizzato(req: NextRequest): boolean {
  if (chiamataAutorizzata(req)) return true;
  const seg = new URL(req.url).searchParams.get("segreto");
  return Boolean(process.env.MOTORE_SEGRETO && seg === process.env.MOTORE_SEGRETO);
}

async function giro(req: NextRequest) {
  if (!autorizzato(req)) {
    return NextResponse.json({ ok: false, errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await eseguiRecupero();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 500 });
}

export async function POST(req: NextRequest) {
  return giro(req);
}

export async function GET(req: NextRequest) {
  return giro(req);
}
