/**
 * LE RECENSIONI, lato server.
 *
 * Regole del prodotto (scelte di Valerio col popup, 15/08):
 *  - una recensione nasce NASCOSTA: la vede l'admin, e SOLO se lui la
 *    approva compare in landing;
 *  - chi la lascia sblocca UN'analisi gratis SUBITO (non dopo
 *    l'approvazione): l'approvazione decide la vetrina, non il premio;
 *  - una per ogni evento vero (check, verdetto, pratica): lo stesso
 *    evento non si recensisce due volte, quindi niente analisi a raffica.
 *
 * Tutto passa dalla chiave di servizio: la tabella ha la RLS accesa e
 * nessuna policy, quindi il browser non la tocca mai da solo.
 */
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

export type EventoRecensito = "check" | "verdetto" | "pratica";

export type Recensione = {
  id: string;
  stelle: number;
  motivo: string;
  nome: string | null;
  evento_tipo: EventoRecensito;
  evento_rif: string;
  stato: "in_attesa" | "approvata" | "nascosta";
  creata_il: string;
  approvata_il: string | null;
};

export type DatiNuovaRecensione = {
  stelle: number;
  motivo: string;
  nome?: string | null;
  eventoTipo: EventoRecensito;
  eventoRif: string;
  utenteId?: string | null;
  email?: string | null;
};

export type EsitoNuovaRecensione =
  | { ok: true; buonoId: string | null; giaFatta: false }
  /** L'evento era già recensito: nessun buono nuovo (uno per evento). */
  | { ok: true; buonoId: null; giaFatta: true }
  | { ok: false; errore: string };

/** 1-5 stelle, un motivo vero, un evento a cui agganciarla. */
function valida(d: DatiNuovaRecensione): string | null {
  if (!Number.isInteger(d.stelle) || d.stelle < 1 || d.stelle > 5) return "Scegli da 1 a 5 stelle.";
  const motivo = (d.motivo ?? "").trim();
  if (motivo.length < 3) return "Scrivi due parole sul perché.";
  if (motivo.length > 1500) return "La recensione è troppo lunga.";
  if (!["check", "verdetto", "pratica"].includes(d.eventoTipo)) return "Evento non valido.";
  if (!(d.eventoRif ?? "").trim()) return "Manca l'evento a cui legare la recensione.";
  return null;
}

/**
 * Crea la recensione (nascosta) e, se l'evento non era già recensito,
 * emette il buono. Torna l'id del buono: la rotta lo mette nel cookie.
 */
export async function creaRecensione(d: DatiNuovaRecensione): Promise<EsitoNuovaRecensione> {
  const errore = valida(d);
  if (errore) return { ok: false, errore };
  if (!SERVIZIO_ATTIVO) return { ok: false, errore: "Il salvataggio ora non è disponibile." };

  const db = supabaseServizio();
  const nome = (d.nome ?? "").trim() || null;

  const { data: rec, error } = await db
    .from("recensioni")
    .insert({
      stelle: d.stelle,
      motivo: d.motivo.trim(),
      nome,
      evento_tipo: d.eventoTipo,
      evento_rif: d.eventoRif.trim(),
      utente_id: d.utenteId ?? null,
      email: d.email ?? null,
    })
    .select("id")
    .single();

  if (error) {
    /* 23505 = quell'evento è già stato recensito. Non è un guasto: è la
       regola. Nessun buono nuovo, e lo diciamo alla rotta. */
    if (error.code === "23505") return { ok: true, buonoId: null, giaFatta: true };
    console.error("[recensioni] non salvata:", error.message);
    return { ok: false, errore: "Non sono riuscito a salvare la recensione. Riprova." };
  }

  // Il buono: una sola analisi gratis, legata a questa recensione.
  const { data: buono, error: erroreBuono } = await db
    .from("buoni_analisi")
    .insert({ recensione_id: rec.id, utente_id: d.utenteId ?? null, email: d.email ?? null })
    .select("id")
    .single();

  if (erroreBuono) {
    // La recensione c'è (conta per la vetrina); il buono no. Onesti: niente
    // buono finto. Un raro doppione di submission è coperto dall'unico su
    // recensione_id.
    console.error("[recensioni] buono non emesso:", erroreBuono.message);
    return { ok: true, buonoId: null, giaFatta: false };
  }

  return { ok: true, buonoId: buono.id, giaFatta: false };
}

/** C'è già una recensione per questo evento? Serve alla UI per non riproporla. */
export async function eventoGiaRecensito(
  eventoTipo: EventoRecensito,
  eventoRif: string,
): Promise<boolean> {
  if (!SERVIZIO_ATTIVO) return false;
  try {
    const { data } = await supabaseServizio()
      .from("recensioni")
      .select("id")
      .eq("evento_tipo", eventoTipo)
      .eq("evento_rif", eventoRif)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

/* ─────────────────────────── il pannello ─────────────────────────── */

const CAMPI = "id, stelle, motivo, nome, evento_tipo, evento_rif, stato, creata_il, approvata_il";

/** La coda da moderare (in attesa) + le ultime decise: tutto in una schermata. */
export async function recensioniPerAdmin(limite = 200): Promise<Recensione[]> {
  if (!SERVIZIO_ATTIVO) return [];
  try {
    const { data, error } = await supabaseServizio()
      .from("recensioni")
      .select(CAMPI)
      .order("creata_il", { ascending: false })
      .limit(limite);
    if (error) throw new Error(error.message);
    return (data as Recensione[] | null) ?? [];
  } catch (e) {
    console.error("[recensioni] lista admin non letta:", e);
    return [];
  }
}

/** Approva o nasconde una recensione. Vero se ha cambiato qualcosa. */
export async function decidiRecensione(
  id: string,
  azione: "approva" | "nascondi",
): Promise<boolean> {
  if (!SERVIZIO_ATTIVO) return false;
  try {
    const patch =
      azione === "approva"
        ? { stato: "approvata" as const, approvata_il: new Date().toISOString() }
        : { stato: "nascosta" as const };
    const { error } = await supabaseServizio().from("recensioni").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    console.error("[recensioni] decisione non salvata:", e);
    return false;
  }
}

/* ─────────────────────────── la landing ──────────────────────────── */

export type RecensioneVetrina = {
  stelle: number;
  motivo: string;
  nome: string | null;
};

/** Solo le approvate, dalla più recente: è la vetrina della landing. */
export async function recensioniApprovate(limite = 24): Promise<RecensioneVetrina[]> {
  if (!SERVIZIO_ATTIVO) return [];
  try {
    const { data, error } = await supabaseServizio()
      .from("recensioni")
      .select("stelle, motivo, nome")
      .eq("stato", "approvata")
      .order("approvata_il", { ascending: false })
      .limit(limite);
    if (error) throw new Error(error.message);
    return (data as RecensioneVetrina[] | null) ?? [];
  } catch (e) {
    console.error("[recensioni] vetrina non letta:", e);
    return [];
  }
}

/* ───────────────────── il buono, dal cancello ────────────────────── */

/**
 * Il buono è valido? Vero SOLO se esiste nel registro e non è ancora
 * usato. È il registro a decidere, non il cookie: un cookie si copia.
 */
export async function buonoUsabile(id: string): Promise<boolean> {
  if (!SERVIZIO_ATTIVO) return false;
  try {
    const { data } = await supabaseServizio()
      .from("buoni_analisi")
      .select("id, usato_il")
      .eq("id", id)
      .is("usato_il", null)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Spende il buono: lo segna usato, una volta sola. Torna vero se è stato
 * QUESTA chiamata a spenderlo (grazie al filtro `usato_il is null`, due
 * chiamate in corsa non lo spendono due volte).
 */
export async function consumaBuono(id: string, verificaId: string | null): Promise<boolean> {
  if (!SERVIZIO_ATTIVO) return false;
  try {
    const { data, error } = await supabaseServizio()
      .from("buoni_analisi")
      .update({ usato_il: new Date().toISOString(), verifica_usata: verificaId })
      .eq("id", id)
      .is("usato_il", null)
      .select("id");
    if (error) throw new Error(error.message);
    return Boolean(data && data.length > 0);
  } catch (e) {
    console.error("[recensioni] buono non consumato:", e);
    return false;
  }
}
