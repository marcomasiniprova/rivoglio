import { NextResponse, type NextRequest } from "next/server";
import { verificaFirmaWebhook } from "@/lib/polar";
import {
  creaPratica,
  praticaPerVerifica,
  registraEvento,
  transizionePratica,
} from "@/lib/pratiche/pratiche";
import { praticaPronta } from "@/lib/email/pratiche";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { casa } from "@/lib/email/posta";

/**
 * Il webhook di Polar: qui un pagamento diventa una pratica.
 *
 * pagamento → cancello anti-giallo → creaPratica → stato `pagata`
 * → email T+0 con link magico per entrare senza password.
 *
 * IL CANCELLO È LA PARTE CHE CONTA: se la verifica non è `idoneo`, o la
 * conferma shadow è ancora `in_attesa`, la pratica NON si crea e si logga
 * forte. Non si vende sul giallo, MAI (SPEC §4): un pagamento arrivato su
 * un caso non vendibile è un guasto da guardare a mano, non da sanare in
 * automatico.
 *
 * Risposte: 200 a tutto ciò che non ci riguarda o non può aggiustarsi da
 * solo (Polar altrimenti riprova all'infinito), 5xx solo quando un nuovo
 * tentativo può davvero riuscire (database giù per un attimo).
 */
export const dynamic = "force-dynamic";

/** L'ordine come arriva da Polar. Solo i campi che usiamo, tutti opzionali. */
type OrdinePolar = {
  id?: string;
  paid?: boolean;
  total_amount?: number;
  amount?: number;
  metadata?: Record<string, unknown>;
  customer?: { email?: string | null } | null;
  customer_email?: string | null;
  product?: { name?: string | null } | null;
};

type EventoPolar = { type?: string; data?: OrdinePolar };

const testo = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;

export async function POST(req: NextRequest) {
  const firma = await verificaFirmaWebhook(req);
  if (!firma.ok) {
    return NextResponse.json({ errore: firma.motivo }, { status: 403 });
  }

  let evento: EventoPolar;
  try {
    evento = JSON.parse(firma.corpo) as EventoPolar;
  } catch {
    return NextResponse.json({ errore: "Corpo non è JSON." }, { status: 400 });
  }

  // Ci interessa solo l'ordine pagato. Tutto il resto: 200 e avanti.
  const tipoEvento = evento.type ?? "";
  const ordine = evento.data ?? {};
  const pagato =
    tipoEvento === "order.paid" || (tipoEvento === "order.created" && ordine.paid === true);
  if (!pagato) {
    return NextResponse.json({ ok: true, ignorato: tipoEvento || "evento senza tipo" });
  }

  if (!SERVIZIO_ATTIVO) {
    console.error("[polar] ordine pagato ma SUPABASE_SECRET_KEY assente: riproverà.");
    return NextResponse.json({ errore: "Server non configurato." }, { status: 500 });
  }

  // ---- i dati dell'ordine
  const metadata = ordine.metadata ?? {};
  // `verifica_id` se un giorno lo passeremo esplicito; oggi i checkout link
  // salvano il nostro id dentro `reference_id` (v. lib/polar.ts).
  const verificaId = testo(metadata.verifica_id) ?? testo(metadata.reference_id);
  const email = testo(ordine.customer?.email) ?? testo(ordine.customer_email);
  const ordineId = testo(ordine.id);
  const nomeProdotto = testo(ordine.product?.name) ?? "";
  const centesimi =
    typeof ordine.total_amount === "number"
      ? ordine.total_amount
      : typeof ordine.amount === "number"
        ? ordine.amount
        : null;
  const prezzo = centesimi !== null ? Math.round(centesimi) / 100 : null;
  // Due soli prodotti (SPEC §5): si riconosce la famiglia dal nome, e come
  // riserva dal prezzo (24,90€ contro 14,90€).
  const tipo: "singola" | "famiglia" =
    /famiglia/i.test(nomeProdotto) || (prezzo !== null && prezzo >= 20)
      ? "famiglia"
      : "singola";

  if (!verificaId || !email) {
    console.error(
      `[polar] ORDINE ${ordineId ?? "?"} PAGATO MA SENZA verifica_id O EMAIL: da guardare a mano. metadata=${JSON.stringify(metadata)}`,
    );
    return NextResponse.json({ ok: true, gestito: false, motivo: "Dati mancanti, loggato." });
  }

  // ---- il cancello: non si vende sul giallo, mai
  let verifica: {
    id: string;
    esito: string;
    conferma: string;
    volo_iata: string;
    data_locale: string;
    importo: number | null;
  } | null = null;
  try {
    const db = supabaseServizio();
    const { data, error } = await db
      .from("verifiche")
      .select("id, esito, conferma, volo_iata, data_locale, importo")
      .eq("id", verificaId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    verifica = data;
  } catch (e) {
    console.error("[polar] verifica non leggibile, riproverà:", e);
    return NextResponse.json({ errore: "Database non raggiungibile." }, { status: 500 });
  }

  if (!verifica) {
    console.error(
      `[polar] ORDINE ${ordineId ?? "?"} PAGATO SU VERIFICA INESISTENTE ${verificaId}: da guardare a mano.`,
    );
    return NextResponse.json({ ok: true, gestito: false, motivo: "Verifica inesistente, loggato." });
  }

  if (verifica.esito !== "idoneo" || verifica.conferma === "in_attesa") {
    console.error(
      `[polar] PAGAMENTO SU CASO NON VENDIBILE: ordine ${ordineId ?? "?"}, verifica ${verificaId}, esito "${verifica.esito}", conferma "${verifica.conferma}". Pratica NON creata: serve un rimborso a mano.`,
    );
    return NextResponse.json({
      ok: true,
      gestito: false,
      motivo: "Caso non vendibile, pratica non creata, loggato.",
    });
  }

  // ---- idempotenza: Polar può recapitare lo stesso ordine più volte
  const esistente = await praticaPerVerifica(verificaId);
  let pratica = esistente;
  if (esistente && esistente.stato !== "creata") {
    return NextResponse.json({ ok: true, pratica: esistente.id, nota: "Già gestito." });
  }

  if (!pratica) {
    const creata = await creaPratica({ verificaId, email, tipo, passeggeri: [] });
    if (!creata.ok) {
      console.error("[polar] pratica non creata, riproverà:", creata.motivo);
      return NextResponse.json({ errore: "Pratica non creata." }, { status: 500 });
    }
    pratica = creata.pratica;
  }

  const passaggio = await transizionePratica(
    pratica.id,
    "pagata",
    `Pagamento ricevuto via Polar${ordineId ? ` (ordine ${ordineId})` : ""}.`,
    { prezzo_pagato: prezzo, polar_ordine: ordineId },
  );
  if (!passaggio.ok) {
    // La pratica esiste già: al prossimo recapito si riparte da qui.
    console.error("[polar] transizione a pagata fallita, riproverà:", passaggio.motivo);
    return NextResponse.json({ errore: "Transizione fallita." }, { status: 500 });
  }

  // ---- link magico: chi ha appena pagato entra senza password
  let link = `${casa()}/pratica/${pratica.id}`;
  try {
    const db = supabaseServizio();
    const { data, error } = await db.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: link },
    });
    if (!error && data.properties?.action_link) {
      link = data.properties.action_link;
    } else if (error) {
      console.error("[polar] link magico non generato, uso il link semplice:", error.message);
    }
  } catch (e) {
    console.error("[polar] link magico non generato, uso il link semplice:", e);
  }

  // ---- email T+0. Se non parte non si blocca niente: il cron non la
  // rimanda (il T+0 non è nella sequenza), ma l'utente ha comunque la
  // pagina della pratica e il pagamento è registrato.
  const spedita = await praticaPronta(email, {
    volo: verifica.volo_iata,
    dataVolo: verifica.data_locale,
    importo: verifica.importo ?? pratica.importo_fascia,
    tipo,
    prezzo,
    garanziaFinoAl: pratica.garanzia_fino_al,
    link,
  });
  if (spedita.ok) {
    await registraEvento(pratica.id, "email_t0", "Email di benvenuto pratica (T+0) inviata.");
  } else {
    console.error(`[polar] email T+0 non partita per ${pratica.id}: ${spedita.motivo}`);
  }

  return NextResponse.json({ ok: true, pratica: pratica.id });
}
