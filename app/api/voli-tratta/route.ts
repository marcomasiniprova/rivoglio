import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { passDi } from "@/lib/check/cancello";
import { CHECK_A_PAGAMENTO } from "@/lib/check/ingresso";
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

  /* ⚠️ L'ORARIO DI ATTERRAGGIO VERO NON ESCE DA QUI COL MURO ACCESO.
     "Doveva arrivare alle 09:55, atterrato alle 13:47" non è un dettaglio
     dell'elenco: è la cosa che vendiamo. Chi la legge qui ha già la
     risposta e non ha nessun motivo di pagare (visto l'11/08). Resta
     l'orario PREVISTO, che è quello stampato sul biglietto e serve solo a
     far riconoscere all'utente il proprio volo: senza, la lista di undici
     voli identici non si distingue e la ricerca per tratta smette di
     funzionare. */
  const voli =
    CHECK_A_PAGAMENTO && !passDi(req)
      ? esito.voli.map((v) => ({ ...v, arrivoEffettivoOra: "" }))
      : esito.voli;

  return NextResponse.json(
    { ok: true, da, a, data: data.valore, voli, demo: esito.demo },
    { headers: CORS },
  );
}
