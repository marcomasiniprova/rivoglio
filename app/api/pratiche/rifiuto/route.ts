import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { RIFIUTI, schedaRifiuto } from "@/lib/pratiche/rifiuto";
import { registraEvento, transizionePratica } from "@/lib/pratiche/pratiche";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * GET  /api/pratiche/rifiuto            → l'elenco dei motivi, per la lista
 * POST /api/pratiche/rifiuto            → { praticaId, motivo }
 *
 * "La compagnia mi ha risposto no." Da qui parte il secondo colpo.
 *
 * Il motivo è a SCELTA CHIUSA e non a testo libero, perché decide cosa
 * scriveremo nel sollecito: a un guasto tecnico si replica in un modo, a
 * uno sciopero del personale in un altro. Un testo libero non lo
 * potremmo usare per decidere niente.
 *
 * La pratica deve essere di chi la sta dichiarando: qui si scrive sulla
 * riga di qualcuno, quindi il controllo di proprietà non è opzionale.
 */
const MASSIMO_AL_MINUTO = 20;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  /* Solo quello che serve alla lista: la replica vera resta sul server e
     non gira nel browser. */
  return NextResponse.json(
    {
      motivi: RIFIUTI.map((r) => ({
        motivo: r.motivo,
        etichetta: r.etichetta,
        aiuto: r.aiuto,
        peso: r.peso,
      })),
    },
    { headers: CORS },
  );
}

export async function POST(req: Request) {
  if (oltreIlLimite("rifiuto", ipDi(req), MASSIMO_AL_MINUTO)) {
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

  const { praticaId, motivo } = (corpo ?? {}) as Record<string, unknown>;
  if (typeof praticaId !== "string" || !praticaId) {
    return NextResponse.json(
      { ok: false, errore: "Manca la pratica." },
      { status: 400, headers: CORS },
    );
  }
  const scheda = schedaRifiuto(motivo);
  if (!scheda) {
    return NextResponse.json(
      { ok: false, errore: "Scegli un motivo dall'elenco." },
      { status: 400, headers: CORS },
    );
  }

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

  const sb = supabaseServizio();
  const { data: pratica } = await sb
    .from("pratiche")
    .select("id, utente_id, stato")
    .eq("id", praticaId)
    .maybeSingle<{ id: string; utente_id: string | null; stato: string }>();

  if (!pratica || pratica.utente_id !== utente.id) {
    return NextResponse.json(
      { ok: false, errore: "Pratica non trovata." },
      { status: 404, headers: CORS },
    );
  }
  /* Prima dell'invio non c'è niente da rifiutare: se qualcuno arriva qui
     è un errore suo o un tentativo, e in nessuno dei due casi si scrive. */
  if (pratica.stato === "creata" || pratica.stato === "pagata" || pratica.stato === "pronta") {
    return NextResponse.json(
      { ok: false, errore: "Il reclamo non risulta ancora inviato." },
      { status: 409, headers: CORS },
    );
  }

  const { error } = await sb
    .from("pratiche")
    .update({
      rifiuto_motivo: scheda.motivo,
      rifiuto_il: new Date().toISOString(),
      aggiornata_il: new Date().toISOString(),
    })
    .eq("id", praticaId);

  if (error) {
    console.error("[rifiuto] salvataggio fallito:", error.message);
    return NextResponse.json(
      { ok: false, errore: "Non sono riuscito a salvare. Riprova." },
      { status: 500, headers: CORS },
    );
  }

  await registraEvento(praticaId, "rifiuto", `La compagnia ha risposto no: ${scheda.etichetta}`);
  /* Il rifiuto salta l'attesa: la risposta c'è già, il sollecito parte
     subito. Se la pratica era più avanti (ente, esito) non si torna
     indietro: si registra e basta. */
  if (pratica.stato === "inviata") {
    await transizionePratica(praticaId, "sollecito", "Rifiuto dichiarato: sollecito disponibile.");
  }

  return NextResponse.json(
    {
      ok: true,
      motivo: scheda.motivo,
      etichetta: scheda.etichetta,
      peso: scheda.peso,
      spiegazione: scheda.spiegazione,
      riferimenti: scheda.riferimenti,
    },
    { headers: CORS },
  );
}
