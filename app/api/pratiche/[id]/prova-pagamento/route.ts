import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimiteCondiviso } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { caricaPratica } from "@/lib/pratiche/pratiche";
import { salvaProvaPagamento } from "@/lib/pratiche/prova-pagamento";

/**
 * POST /api/pratiche/<id>/prova-pagamento
 *   { base64, tipoMime }  → la foto del bonifico/accredito
 *
 * FACOLTATIVA (Valerio, 16/08): compare solo sulla pratica VINTA, come aiuto
 * per un testimonial anonimo. A differenza di tutti gli altri upload del
 * prodotto, questa foto SI SALVA (vedi lib/pratiche/prova-pagamento.ts).
 *
 * Il paletto vero: si accetta solo su una pratica in stato `esito_pagata` e
 * solo dal suo proprietario. Una foto di pagamento su una pratica non ancora
 * chiusa non vuol dire niente, e su una pratica altrui non deve entrare.
 */
export const dynamic = "force-dynamic";

const MASSIMO_AL_MINUTO = 6;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (await oltreIlLimiteCondiviso("prova-pagamento", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe richieste di fila. Aspetta un minuto." },
      { status: 429, headers: CORS },
    );
  }

  const utente = await utenteDaRichiesta(req);
  if (!utente) {
    return NextResponse.json(
      { ok: false, errore: "Devi entrare per aggiornare la pratica." },
      { status: 401, headers: CORS },
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "Richiesta non leggibile." }, { status: 400, headers: CORS });
  }
  const { base64, tipoMime } = (corpo ?? {}) as Record<string, unknown>;
  if (typeof base64 !== "string" || typeof tipoMime !== "string" || !base64) {
    return NextResponse.json({ ok: false, errore: "Manca il file." }, { status: 400, headers: CORS });
  }

  const pratica = await caricaPratica(id);
  if (!pratica || pratica.utente_id !== utente.id) {
    return NextResponse.json({ ok: false, errore: "Pratica non trovata." }, { status: 404, headers: CORS });
  }
  if (pratica.stato !== "esito_pagata") {
    return NextResponse.json(
      { ok: false, errore: "La prova del pagamento si carica solo su una pratica già chiusa come pagata." },
      { status: 409, headers: CORS },
    );
  }

  const r = await salvaProvaPagamento(id, base64, tipoMime);
  if (!r.ok) {
    return NextResponse.json({ ok: false, errore: r.errore }, { status: r.codice, headers: CORS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS });
}
