import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { aeroportoPerIata } from "@/lib/voli/aeroporti";
import { normalizzaData } from "@/lib/voli/normalizza";
import { voliDiTratta } from "@/lib/voli/tratta";

/**
 * GET /api/voli-tratta?da=BGY&a=ACE&data=2026-08-06
 *
 * L'elenco dei voli di quel giorno fra i due scali, da cui l'utente
 * riconosce il suo. Serve a NON chiedere il numero di volo: è la
 * frizione più grossa del prodotto (l'utente medio non sa dove trovarlo).
 *
 * Non dà verdetti. Restituisce voli e orari; il verdetto arriva dopo, da
 * /api/verifica, sul volo che l'utente ha scelto.
 *
 * Ogni chiamata costa due richieste ad AeroDataBox (la finestra massima
 * del fornitore è di 12 ore), quindi il tetto per IP qui è stretto.
 */

const MASSIMO_AL_MINUTO = 10;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  if (oltreIlLimite("tratta", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe richieste di fila. Aspetta un minuto e riprova." },
      { status: 429, headers: CORS },
    );
  }

  const p = new URL(req.url).searchParams;
  const da = aeroportoPerIata(p.get("da") ?? "");
  const a = aeroportoPerIata(p.get("a") ?? "");
  if (!da || !a) {
    return NextResponse.json(
      { ok: false, errore: "Scegli l'aeroporto di partenza e quello di arrivo dall'elenco." },
      { status: 400, headers: CORS },
    );
  }
  if (da.iata === a.iata) {
    return NextResponse.json(
      { ok: false, errore: "Partenza e arrivo sono lo stesso aeroporto." },
      { status: 400, headers: CORS },
    );
  }

  const data = normalizzaData(p.get("data") ?? "");
  if (!data.ok) {
    return NextResponse.json({ ok: false, errore: data.errore }, { status: 400, headers: CORS });
  }

  const esito = await voliDiTratta(da.iata, a.iata, data.valore);
  return NextResponse.json(
    { ok: true, da, a, data: data.valore, voli: esito.voli, demo: esito.demo },
    { headers: CORS },
  );
}
