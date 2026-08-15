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
import { generaCodice } from "./buono";

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
  | { ok: true; codice: string | null; giaFatta: false }
  /** L'evento era già recensito: nessun codice nuovo (uno per evento). */
  | { ok: true; codice: null; giaFatta: true }
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
 * emette il buono. Torna il CODICE (RIV-XXXXX): la rotta lo manda al
 * browser, che lo mostra alla persona da incollare al muro. Niente cookie.
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
    if (error.code === "23505") return { ok: true, codice: null, giaFatta: true };
    console.error("[recensioni] non salvata:", error.message);
    return { ok: false, errore: "Non sono riuscito a salvare la recensione. Riprova." };
  }

  /* Il buono: una sola analisi gratis, legata a questa recensione, con un
     CODICE usa e getta che la persona incolla al muro. Il codice è quasi
     sempre unico al primo colpo; se per sfortuna collide (indice unico), si
     riprova con uno nuovo, non oltre tre volte. */
  for (let tentativo = 0; tentativo < 3; tentativo++) {
    const codice = generaCodice();
    const { data: buono, error: erroreBuono } = await db
      .from("buoni_analisi")
      .insert({
        recensione_id: rec.id,
        utente_id: d.utenteId ?? null,
        email: d.email ?? null,
        codice,
      })
      .select("id")
      .single();

    if (!erroreBuono) return { ok: true, codice, giaFatta: false };

    /* 23505 sull'indice del codice = collisione: si riprova con un codice
       nuovo. 23505 su recensione_id = il buono per questa recensione c'è
       già (doppia submission): non se ne emette un altro. */
    if (erroreBuono.code === "23505" && /codice/.test(erroreBuono.message)) continue;
    if (erroreBuono.code === "23505") return { ok: true, codice: null, giaFatta: false };

    console.error("[recensioni] buono non emesso:", erroreBuono.message);
    return { ok: true, codice: null, giaFatta: false };
  }

  // Tre collisioni di fila: praticamente impossibile. La recensione resta.
  console.error("[recensioni] codice non generato: troppe collisioni");
  return { ok: true, codice: null, giaFatta: false };
}

/**
 * IL RISCATTO, dal cancello del check. Dato un codice, torna l'id del buono
 * SOLO se esiste ed è ancora libero (mai usato). È il registro a decidere,
 * come per il pass: un codice speso non apre più niente.
 */
export async function buonoIdDaCodice(codice: string): Promise<string | null> {
  if (!SERVIZIO_ATTIVO || !codice) return null;
  try {
    const { data } = await supabaseServizio()
      .from("buoni_analisi")
      .select("id")
      .eq("codice", codice)
      .is("usato_il", null)
      .maybeSingle<{ id: string }>();
    return data?.id ?? null;
  } catch {
    return null;
  }
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
 * Spende il buono: lo segna usato, una volta sola. Torna vero se è stato
 * QUESTA chiamata a spenderlo (grazie al filtro `usato_il is null`, due
 * chiamate in corsa non lo spendono due volte). L'id lo trova
 * `buonoIdDaCodice` partendo dal codice che la persona incolla.
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
