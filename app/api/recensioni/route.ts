import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimiteCondiviso } from "@/lib/api/limite";
import { creaRecensione, type EventoRecensito } from "@/lib/recensioni/recensioni";
import { COOKIE_BUONO, GIORNI_BUONO, creaBuonoCookie } from "@/lib/recensioni/buono";
import { utenteCollegato } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";

/**
 * POST /api/recensioni  {stelle, motivo, nome?, eventoTipo, eventoRif}
 *
 * Lascia una recensione dopo un evento vero (check, verdetto, pratica).
 * La recensione nasce NASCOSTA (la approva l'admin); chi la lascia
 * sblocca SUBITO un'analisi gratis, e una sola, legata a quell'evento.
 *
 * Il buono viaggia in un cookie firmato (come il pass del pagamento): a
 * decidere se è ancora valido è il registro nel database, non il cookie.
 *
 * ⚠️ Un evento si recensisce una volta sola (indice unico sul database):
 * la seconda volta la recensione non nasce e NON esce un secondo buono.
 * È il muro contro le analisi gratis a raffica.
 */

const MASSIMO_AL_MINUTO = 10;

const BISCOTTO = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: GIORNI_BUONO * 24 * 60 * 60,
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  if (await oltreIlLimiteCondiviso("recensioni", ipDi(req), MASSIMO_AL_MINUTO)) {
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

  const { stelle, motivo, nome, eventoTipo, eventoRif } = (corpo ?? {}) as {
    stelle?: unknown;
    motivo?: unknown;
    nome?: unknown;
    eventoTipo?: unknown;
    eventoRif?: unknown;
  };

  // Chi la lascia: l'account se collegato (così il buono è "sull'account").
  const utente = SUPABASE_CONFIGURATO ? await utenteCollegato() : null;

  const esito = await creaRecensione({
    stelle: Number(stelle),
    motivo: typeof motivo === "string" ? motivo : "",
    nome: typeof nome === "string" ? nome : null,
    eventoTipo: eventoTipo as EventoRecensito,
    eventoRif: typeof eventoRif === "string" ? eventoRif : "",
    utenteId: utente?.id ?? null,
    email: utente?.email ?? null,
  });

  if (!esito.ok) {
    return NextResponse.json({ ok: false, errore: esito.errore }, { status: 400, headers: CORS });
  }

  if (esito.giaFatta) {
    /* L'evento era già stato recensito: nessun secondo buono. Non è un
       errore, è la regola: lo diciamo con gentilezza. */
    return NextResponse.json(
      { ok: true, giaFatta: true, sbloccata: false },
      { headers: CORS },
    );
  }

  const risposta = NextResponse.json(
    { ok: true, giaFatta: false, sbloccata: Boolean(esito.buonoId) },
    { headers: CORS },
  );

  // Il cookie del buono: la consegna. Il permesso vero lo tiene il database.
  if (esito.buonoId) {
    const cookie = creaBuonoCookie(esito.buonoId);
    if (cookie) risposta.cookies.set(COOKIE_BUONO, cookie, BISCOTTO);
  }

  return risposta;
}
