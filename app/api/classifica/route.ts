import { NextResponse } from "next/server";
import { CORS } from "@/lib/api/limite";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * GET /api/classifica
 *
 * La classifica di chi si è ripreso più soldi con Rivoglio. Costruita
 * completa e SPENTA al lancio (scelta di Valerio, 8/08): si accende con
 * CLASSIFICA_ATTIVA=1 su Netlify quando ci sono 10 giorni di vincite
 * vere da mostrare. Da spenta risponde {attiva:false} e l'app nasconde
 * la sezione: niente aggiornamento dell'app per accenderla.
 *
 * Cosa conta come "vinto": SOLO le pratiche in stato `esito_pagata`,
 * cioè quelle in cui la compagnia ha pagato davvero. L'importo è la
 * fascia del Regolamento per passeggero, moltiplicata per i passeggeri
 * della pratica: un numero che sappiamo, non una stima.
 *
 * Chi compare: SOLO chi ha scelto un nome pubblico e ha acceso
 * "partecipa alla classifica" (opt-in, mai automatico). Fuori dal
 * database non esce nient'altro: nome pubblico e totale, stop.
 *
 * Senza chiave del database la risposta è un esempio DICHIARATO
 * (demo:true): serve a vedere la schermata, mai a sembrare vera.
 */
export const dynamic = "force-dynamic";

const ATTIVA = process.env.CLASSIFICA_ATTIVA === "1";
const MASSIMO = 50;

/* La classifica cambia poco e la leggono in tanti: si tiene in memoria
   per 10 minuti. Vale quanto la memoria delle funzioni Netlify: a ogni
   cold start si ricalcola, ed è giusto così. */
const DIECI_MINUTI = 10 * 60 * 1000;
let cache: { voci: Voce[]; quando: number } | null = null;

type Voce = { posizione: number; nickname: string; totale: number };

type RigaPagata = {
  utente_id: string | null;
  importo_fascia: number | null;
  passeggeri: unknown[] | null;
};

function vociDemo(): Voce[] {
  /* Nomi chiaramente d'esempio e importi che sono multipli delle fasce
     vere del Regolamento (250/400/600): niente numeri inventati. */
  return [
    { posizione: 1, nickname: "esempio_giulia", totale: 1200 },
    { posizione: 2, nickname: "esempio_marco", totale: 800 },
    { posizione: 3, nickname: "esempio_sara", totale: 650 },
    { posizione: 4, nickname: "esempio_luca", totale: 400 },
    { posizione: 5, nickname: "esempio_anna", totale: 250 },
  ];
}

async function vociVere(): Promise<Voce[]> {
  if (cache && Date.now() - cache.quando < DIECI_MINUTI) return cache.voci;

  const db = supabaseServizio();
  const { data, error } = await db
    .from("pratiche")
    .select("utente_id, importo_fascia, passeggeri")
    .eq("stato", "esito_pagata")
    .limit(2000);
  if (error) throw new Error(error.message);

  // Somma per utente: fascia per passeggero × passeggeri della pratica.
  const totali = new Map<string, number>();
  for (const r of (data ?? []) as RigaPagata[]) {
    if (!r.utente_id || !r.importo_fascia) continue;
    const persone = Math.max(1, Array.isArray(r.passeggeri) ? r.passeggeri.length : 1);
    totali.set(r.utente_id, (totali.get(r.utente_id) ?? 0) + r.importo_fascia * persone);
  }
  if (totali.size === 0) {
    cache = { voci: [], quando: Date.now() };
    return [];
  }

  // Il nome pubblico, SOLO di chi ha aderito.
  const { data: profili, error: erroreProfili } = await db
    .from("profili")
    .select("id, nickname")
    .in("id", [...totali.keys()])
    .eq("classifica_optin", true)
    .not("nickname", "is", null);
  if (erroreProfili) throw new Error(erroreProfili.message);

  const voci = ((profili ?? []) as { id: string; nickname: string }[])
    .map((p) => ({ nickname: p.nickname, totale: totali.get(p.id) ?? 0 }))
    .filter((v) => v.totale > 0)
    .sort((a, b) => b.totale - a.totale)
    .slice(0, MASSIMO)
    .map((v, i) => ({ posizione: i + 1, ...v }));

  cache = { voci, quando: Date.now() };
  return voci;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  if (!ATTIVA) {
    return NextResponse.json({ ok: true, attiva: false }, { headers: CORS });
  }

  if (!SERVIZIO_ATTIVO) {
    return NextResponse.json(
      { ok: true, attiva: true, demo: true, voci: vociDemo() },
      { headers: CORS },
    );
  }

  try {
    const voci = await vociVere();
    return NextResponse.json({ ok: true, attiva: true, demo: false, voci }, { headers: CORS });
  } catch (e) {
    // Un guasto non spegne l'app: la classifica sparisce e basta.
    console.error("[classifica] lettura fallita:", e);
    return NextResponse.json({ ok: true, attiva: false }, { headers: CORS });
  }
}
