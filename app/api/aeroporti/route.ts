import { NextResponse } from "next/server";
import { cercaAeroporti } from "@/lib/voli/aeroporti";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";

/**
 * GET /api/aeroporti?q=roma
 *
 * L'autocompletamento del campo "da dove sei partito". Legge un file
 * congelato nel repo (OpenFlights, 6.072 scali): nessuna API esterna,
 * nessun costo, nessun ritardo. Il tetto per IP è largo apposta: qui si
 * digita lettera per lettera.
 */

const MASSIMO_AL_MINUTO = 120;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  if (oltreIlLimite("aeroporti", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe richieste di fila. Aspetta un minuto e riprova." },
      { status: 429, headers: CORS },
    );
  }

  const q = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json({ ok: true, aeroporti: cercaAeroporti(q) }, { headers: CORS });
}
