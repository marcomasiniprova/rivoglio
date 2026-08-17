import { NextResponse, type NextRequest } from "next/server";
import {
  creaPratica,
  praticaPerVerifica,
  registraEvento,
  transizionePratica,
} from "@/lib/pratiche/pratiche";
import { creditoDisponibile, consumaCredito } from "@/lib/pratiche/credito";
import { ingressoDopoPagamento } from "@/lib/pratiche/ingresso";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { utenteCollegato } from "@/lib/supabase/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { traccia } from "@/lib/eventi/registra";
import { versoCasa } from "@/lib/sito";

/**
 * APRIRE UNA PRATICA COL CREDITO DELLA GARANZIA (Valerio, 17/08).
 *
 * Quando la garanzia scatta non rimborsiamo i soldi: diamo un CREDITO per la
 * prossima pratica (vedi `lib/pratiche/credito.ts`). Questa rotta è dove quel
 * credito si spende: al prossimo volo idoneo, invece di pagare, l'utente apre
 * la pratica gratis.
 *
 * ⚠️ IL CANCELLO QUI È IL CREDITO, e sta al posto del pagamento. Solo un
 * utente COLLEGATO che ha davvero un credito libero (che copre il tipo) può
 * aprire una pratica gratis. Il credito esiste solo se una garanzia è
 * scattata, e la garanzia passa dal suo cancello anti-frode (no scritto +
 * documento + replica): quindi da qui non si aprono pratiche gratis a chi non
 * se le è guadagnate. Il controllo è sul server, non nella UI.
 *
 * ⚠️ È UN POST, non un link: una rotta che crea una pratica e spende un
 * credito non deve poter partire da un prefetch o da una scheda riaperta.
 *
 * Fa la stessa cosa del webhook e della cassa di prova (crea la pratica,
 * la porta a "pagata"), ma con `prezzo_pagato` a ZERO (è gratis, non un
 * incasso) e l'evento che dice che è nata da un credito.
 */
export const dynamic = "force-dynamic";

const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  if (!SUPABASE_CONFIGURATO || !SERVIZIO_ATTIVO) {
    return NextResponse.json({ errore: "Database non configurato." }, { status: 503 });
  }

  // Il credito è sull'account: senza sessione non si va da nessuna parte.
  const collegato = await utenteCollegato();
  if (!collegato?.email) {
    return NextResponse.json(
      { errore: "Per usare il credito devi essere collegato." },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const verificaId = url.searchParams.get("verifica") ?? "";
  const tipo = url.searchParams.get("tipo") === "famiglia" ? "famiglia" : "singola";
  if (!UUID_OK.test(verificaId)) {
    return NextResponse.json({ errore: "Verifica non valida." }, { status: 400 });
  }

  const db = supabaseServizio();
  const { data: verifica, error } = await db
    .from("verifiche")
    .select("id, esito, volo_iata")
    .eq("id", verificaId)
    .maybeSingle<{ id: string; esito: string; volo_iata: string | null }>();
  if (error) return NextResponse.json({ errore: error.message }, { status: 500 });
  if (!verifica) return NextResponse.json({ errore: "Verifica inesistente." }, { status: 404 });
  // Una pratica si apre solo su un verdetto idoneo, credito o no.
  if (verifica.esito !== "idoneo") {
    return NextResponse.json(
      { errore: `Si apre una pratica solo su un verdetto idoneo (questo è "${verifica.esito}").` },
      { status: 400 },
    );
  }

  /* Idempotente: se una pratica per questa verifica esiste già, ci si va e
     basta, senza spendere un secondo credito. Chiude il doppio clic. */
  const esistente = await praticaPerVerifica(verificaId);
  if (esistente) {
    return redirezione(collegato.email, esistente.id, collegato.email, req);
  }

  /* IL CANCELLO: deve avere un credito libero che copre il tipo. Il server
     ricontrolla, non si fida della UI. */
  const credito = await creditoDisponibile(collegato.id);
  const copre = tipo === "famiglia" ? credito.famiglia : credito.singola;
  if (!copre) {
    return NextResponse.json(
      { errore: "Non hai un credito che copre questa pratica." },
      { status: 402 },
    );
  }

  // La pratica nasce sull'account collegato (quello che ha il credito).
  const creata = await creaPratica({ verificaId, email: collegato.email, tipo, passeggeri: [] });
  if (!creata.ok) {
    return NextResponse.json({ errore: creata.motivo ?? "Pratica non creata." }, { status: 500 });
  }
  const pratica = creata.pratica;

  await registraEvento(
    pratica.id,
    "pratica_da_credito",
    "Pratica aperta con un credito della garanzia: nessun pagamento, il credito copriva il prezzo.",
  );

  const passaggio = await transizionePratica(
    pratica.id,
    "pagata",
    "Aperta col credito della garanzia (prezzo coperto dal credito, nessun incasso).",
    // prezzo_pagato a ZERO: è gratis col credito, non deve entrare negli incassi.
    { prezzo_pagato: 0 },
  );
  if (!passaggio.ok) {
    return NextResponse.json({ errore: passaggio.motivo ?? "Transizione fallita." }, { status: 500 });
  }

  // Spende il credito, legandolo alla pratica nuova. Se per una corsa non
  // riesce, la pratica resta valida (il credito era suo): si logga.
  const speso = await consumaCredito(collegato.id, tipo, pratica.id);
  if (!speso.ok) {
    console.error(`[gratis] pratica ${pratica.id} aperta ma credito non speso (utente ${collegato.id}).`);
  }

  // Come la cassa di prova: "pratica aperta", NON "pagato" (i soldi a zero).
  traccia(req, { tipo: "pratica", volo: verifica.volo_iata, extra: { credito: true, tipo } });

  return redirezione(collegato.email, pratica.id, collegato.email, req);
}

/** Il rimando alla pratica: chi è già collegato non rifà il login (ingresso.ts). */
async function redirezione(
  email: string,
  praticaId: string,
  emailCollegato: string | null,
  req: NextRequest,
) {
  const ingresso = await ingressoDopoPagamento(email, `/pratica/${praticaId}`, emailCollegato);
  return NextResponse.redirect(
    ingresso.startsWith("http") ? ingresso : versoCasa(ingresso, req),
    { status: 303 },
  );
}
