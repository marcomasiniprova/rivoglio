import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { cancelloDelSeguito } from "@/lib/check/cancello";
import { cercaVettore, valutaOperativo, vettoreValido } from "@/lib/regole/operativo";
import { verificaVolo } from "@/lib/voli/verifica";
import { inItaliano } from "@/lib/voli/aeroporti";
import { scadenzaStimata } from "@/lib/regole/eu261";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * GET  /api/verifica/operativo?q=delta   → l'elenco per il campo di ricerca
 * POST /api/verifica/operativo           → { volo, data, verificaId?, vettore }
 *
 * Il secondo tempo del check quando il numero di volo è venduto in
 * codeshare e il fornitore non sa dire chi ha operato davvero.
 *
 * Prima il caso si fermava. Ma quel dato l'utente ce l'ha sotto gli
 * occhi (c'è scritto sulla carta d'imbarco e c'era scritto sull'aereo):
 * chiederglielo costa una domanda, non chiederglielo costa la vendita.
 *
 * La scelta è chiusa: si può indicare solo una compagnia che
 * conosciamo. Il verdetto resta del motore, come sempre.
 */
const MASSIMO_AL_MINUTO = 40;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json({ compagnie: cercaVettore(q) }, { headers: CORS });
}

export async function POST(req: Request) {
  if (oltreIlLimite("operativo", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe richieste di fila. Aspetta un minuto." },
      { status: 429, headers: CORS },
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, errore: "Richiesta non leggibile." },
      { status: 400, headers: CORS },
    );
  }

  const { volo, data, verificaId, vettore } = (corpo ?? {}) as Record<string, unknown>;
  if (typeof volo !== "string" || typeof data !== "string") {
    return NextResponse.json(
      { ok: false, errore: "Manca il volo o la data." },
      { status: 400, headers: CORS },
    );
  }
  const scelto = vettoreValido(vettore);
  if (!scelto) {
    return NextResponse.json(
      { ok: false, errore: "Scegli una compagnia dall'elenco." },
      { status: 400, headers: CORS },
    );
  }

  /* IL CANCELLO: vedi lib/check/cancello.ts. Questa rotta richiude un
     verdetto, e col muro acceso il verdetto si paga. */
  const chiuso = await cancelloDelSeguito(req, verificaId);
  if (chiuso) return chiuso;

  /* Si ripassa dal verificatore invece di fidarsi del browser: gli orari
     e la distanza devono venire dai nostri dati. L'utente aggiunge una
     informazione sola, e solo quella. */
  const esito = await verificaVolo(volo, data);
  if (!esito.ok) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 404, headers: CORS });
  }

  const verdetto = valutaOperativo(esito.fatto, scelto.iata);
  if (!verdetto) {
    return NextResponse.json(
      { ok: false, errore: "Scegli una compagnia dall'elenco." },
      { status: 400, headers: CORS },
    );
  }

  /* La memoria: chi l'utente ha dichiarato, e quando. Se un domani la
     compagnia contesta, la dichiarazione deve esistere per iscritto.
     Le colonne sono quelle della migrazione 2026-08-14. */
  let salvato = false;
  const id = typeof verificaId === "string" && verificaId ? verificaId : esito.verificaId;
  if (id && SERVIZIO_ATTIVO) {
    try {
      const { error } = await supabaseServizio()
        .from("verifiche")
        .update({
          esito: verdetto.esito,
          importo: verdetto.esito === "idoneo" ? verdetto.importo : null,
          motivo: verdetto.motivo,
          operativo_dichiarato: scelto.iata,
          operativo_dichiarato_il: new Date().toISOString(),
        })
        .eq("id", id);
      salvato = !error;
      if (error) console.error("[operativo] salvataggio fallito:", error.message);
    } catch (e) {
      console.error("[operativo] salvataggio fallito:", e);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      salvato,
      esito: verdetto.esito,
      motivo: verdetto.motivo,
      ...(verdetto.esito === "idoneo" ? { importo: verdetto.importo } : {}),
      compagnia: scelto,
      dato: {
        da: inItaliano(esito.fatto.partenzaCitta) ?? esito.fatto.partenzaIata ?? null,
        a: inItaliano(esito.fatto.arrivoCitta) ?? esito.fatto.arrivoIata ?? null,
        km: esito.fatto.kmOrtodromica,
        vettoreOperativo: scelto.iata,
      },
      scadenza:
        verdetto.esito === "idoneo" ? scadenzaStimata(esito.fatto.dataLocale, scelto.iata) : null,
      demo: esito.demo,
    },
    { headers: CORS },
  );
}
