import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { caricaPratica, registraEvento } from "@/lib/pratiche/pratiche";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * POST /api/pratiche/<id>/cura   { vuole: boolean }
 *
 * DIRITTO DI CURA (art. 9 CE 261/2004): dalle due ore di ritardo la
 * compagnia deve darti pasti, e un hotel se dormi fuori. Se non lo fa e
 * paghi di tasca tua, ti rimborsa con gli scontrini.
 *
 * ⚠️ NON È UNA PRATICA A SÉ (scelta di Valerio, 14/08). Di solito il
 * diritto di cura viaggia insieme a un ritardo o una cancellazione: sei
 * stato bloccato cinque ore E hai pagato la cena. Quindi si AGGANCIA alla
 * pratica che il cliente ha già, senza un secondo pagamento: qui si segna
 * solo che ha delle spese da farsi rimborsare, e la lettera del reclamo
 * guadagna il paragrafo dell'art. 9 (lib/lettera/genera.ts). L'importo non
 * lo decidiamo noi: le cifre le portano le sue ricevute, che allega lui, e
 * la compagnia le verifica una per una.
 */
export const dynamic = "force-dynamic";

const MASSIMO_AL_MINUTO = 20;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (oltreIlLimite("cura", ipDi(req), MASSIMO_AL_MINUTO)) {
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
  const vuole = (corpo as { vuole?: unknown })?.vuole === true;

  const utente = await utenteDaRichiesta(req);
  if (!utente) {
    return NextResponse.json(
      { ok: false, errore: "Devi entrare per aggiornare la pratica." },
      { status: 401, headers: CORS },
    );
  }
  if (!SERVIZIO_ATTIVO) {
    return NextResponse.json(
      { ok: false, errore: "Servizio non disponibile." },
      { status: 503, headers: CORS },
    );
  }

  const pratica = await caricaPratica(id);
  if (!pratica || pratica.utente_id !== utente.id) {
    return NextResponse.json(
      { ok: false, errore: "Pratica non trovata." },
      { status: 404, headers: CORS },
    );
  }

  const { error } = await supabaseServizio()
    .from("pratiche")
    .update({ cura_richiesta: vuole, aggiornata_il: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[cura] salvataggio fallito:", error.message);
    return NextResponse.json(
      { ok: false, errore: "Non sono riuscito a salvare. Riprova." },
      { status: 500, headers: CORS },
    );
  }

  await registraEvento(
    id,
    "cura",
    vuole
      ? "Spese di assistenza (art. 9) aggiunte al reclamo: il cliente allega gli scontrini."
      : "Spese di assistenza tolte dal reclamo.",
  );

  return NextResponse.json({ ok: true, vuole }, { headers: CORS });
}
