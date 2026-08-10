import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimite } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * POST /api/account/elimina  →  { conferma: "ELIMINA" }
 *
 * La cancellazione dell'account, dall'app o dal sito. È un obbligo di
 * privacy prima che una funzione: chi la chiede deve poterla fare da
 * solo, senza scrivere a nessuno.
 *
 * Cosa sparisce: le pratiche con la loro cronologia, i voli seguiti, il
 * profilo, l'account di accesso. Cosa resta: le righe di `verifiche`
 * SENZA più il legame con l'utente (utente_id a null): sono la memoria
 * dei check fatti sui voli, servono al golden set, e senza l'id non
 * dicono più niente su nessuno.
 *
 * La conferma è una parola scritta, non un secondo bottone: un tocco
 * sbagliato non deve poter cancellare un account.
 */
const MASSIMO_AL_MINUTO = 3;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  if (oltreIlLimite("elimina-account", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe richieste di fila. Aspetta un minuto." },
      { status: 429, headers: CORS },
    );
  }

  const utente = await utenteDaRichiesta(req);
  if (!utente) {
    return NextResponse.json(
      { ok: false, errore: "Devi essere collegato." },
      { status: 401, headers: CORS },
    );
  }
  if (!SERVIZIO_ATTIVO) {
    return NextResponse.json(
      { ok: false, errore: "Il server non è configurato." },
      { status: 503, headers: CORS },
    );
  }

  const corpo = (await req.json().catch(() => null)) as { conferma?: string } | null;
  if (corpo?.conferma !== "ELIMINA") {
    return NextResponse.json(
      { ok: false, errore: "Scrivi ELIMINA per confermare." },
      { status: 400, headers: CORS },
    );
  }

  const db = supabaseServizio();

  /* L'ordine rispetta i vincoli: prima i figli, poi i padri. Ogni passo
     è per utente_id, quindi non può toccare righe di altri. */
  const { data: pratiche } = await db.from("pratiche").select("id").eq("utente_id", utente.id);
  const idPratiche = (pratiche ?? []).map((p) => (p as { id: string }).id);
  if (idPratiche.length > 0) {
    await db.from("pratiche_eventi").delete().in("pratica_id", idPratiche);
  }
  await db.from("pratiche").delete().eq("utente_id", utente.id);
  await db.from("voli_seguiti").delete().eq("utente_id", utente.id);
  await db.from("profili").delete().eq("id", utente.id);
  await db.from("verifiche").update({ utente_id: null }).eq("utente_id", utente.id);

  const { error } = await db.auth.admin.deleteUser(utente.id);
  if (error) {
    console.error("[account] eliminazione fallita:", error.message);
    return NextResponse.json(
      { ok: false, errore: "Non sono riuscito a completare l'eliminazione. Riprova." },
      { status: 500, headers: CORS },
    );
  }

  return NextResponse.json({ ok: true }, { headers: CORS });
}
