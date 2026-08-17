/**
 * IL CREDITO DELLA GARANZIA, lato server (Valerio, 17/08).
 *
 * La garanzia non rimborsa in contanti: regala la PROSSIMA PRATICA. Quando la
 * compagnia rifiuta senza un motivo valido (e l'utente ha già combattuto con
 * la replica), nasce un credito legato al suo account, del TIPO della pratica
 * fallita. Al prossimo volo idoneo lo usa per aprire una pratica senza pagare.
 *
 * Regole del prodotto (scelte di Valerio, 17/08):
 *  - il valore è quello che aveva pagato: una famiglia fallita → una famiglia
 *    gratis (che copre anche una singola); una singola → una singola;
 *  - non scade: è suo finché non lo usa;
 *  - è automatico: nasce da solo quando la garanzia scatta, nessun passo a mano.
 *
 * Tutto passa dalla chiave di servizio: la tabella ha la RLS accesa e nessuna
 * policy, quindi il browser non la tocca mai da solo. Stesso impianto usa e
 * getta dei buoni analisi: `usato_il` nel database, non un cookie che si copia.
 */
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import type { TipoPratica } from "./pratiche";

/** Cosa può aprire gratis chi guarda: per tipo di pratica. */
export type CreditoDisponibile = {
  /** Vero se ha un credito che copre una pratica singola (qualsiasi credito). */
  singola: boolean;
  /** Vero se ha un credito famiglia (l'unico che copre una famiglia). */
  famiglia: boolean;
};

const NESSUNO: CreditoDisponibile = { singola: false, famiglia: false };

/**
 * Concede il credito quando la garanzia scatta. Idempotente: l'indice unico
 * su `pratica_origine` impedisce che un doppio clic (o un webhook doppio) ne
 * faccia nascere due per la stessa pratica fallita.
 */
export async function concediCredito(
  utenteId: string,
  tipo: TipoPratica,
  praticaOrigine: string,
): Promise<{ ok: boolean }> {
  if (!SERVIZIO_ATTIVO) return { ok: false };
  try {
    const { error } = await supabaseServizio()
      .from("crediti_pratica")
      .insert({ utente_id: utenteId, tipo, pratica_origine: praticaOrigine });
    // 23505 = credito già dato per questa pratica: non è un errore, è la regola.
    if (error && error.code !== "23505") {
      console.error("[credito] non concesso:", error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[credito] non concesso:", e);
    return { ok: false };
  }
}

/**
 * Cosa può aprire gratis un utente adesso. Una famiglia copre sia una famiglia
 * sia una singola; una singola copre solo una singola.
 */
export async function creditoDisponibile(utenteId: string): Promise<CreditoDisponibile> {
  if (!SERVIZIO_ATTIVO || !utenteId) return NESSUNO;
  try {
    const { data } = await supabaseServizio()
      .from("crediti_pratica")
      .select("tipo")
      .eq("utente_id", utenteId)
      .is("usato_il", null);
    const tipi = (data as { tipo: TipoPratica }[] | null) ?? [];
    if (tipi.length === 0) return NESSUNO;
    const haFamiglia = tipi.some((c) => c.tipo === "famiglia");
    // Qualsiasi credito copre una singola; solo un famiglia copre una famiglia.
    return { singola: true, famiglia: haFamiglia };
  } catch {
    return NESSUNO;
  }
}

/**
 * Spende un credito per aprire la pratica `praticaUsata` di tipo `tipoRichiesto`.
 * Torna vero se è stato QUESTA chiamata a spenderlo. Sceglie il credito più
 * economico che copre il tipo (per non sprecare un famiglia su una singola), e
 * lo segna usato con un update che filtra `usato_il is null`: due chiamate in
 * corsa non lo spendono due volte (stesso schema di `consumaBuono`).
 */
export async function consumaCredito(
  utenteId: string,
  tipoRichiesto: TipoPratica,
  praticaUsata: string,
): Promise<{ ok: boolean }> {
  if (!SERVIZIO_ATTIVO) return { ok: false };
  try {
    const db = supabaseServizio();
    const { data: liberi } = await db
      .from("crediti_pratica")
      .select("id, tipo")
      .eq("utente_id", utenteId)
      .is("usato_il", null)
      .order("creato_il", { ascending: true });

    const candidati = (liberi as { id: string; tipo: TipoPratica }[] | null) ?? [];
    // Una famiglia serve un credito famiglia; una singola preferisce un credito
    // singola, e ripiega su un famiglia solo se non ce ne sono di singoli.
    const coprono =
      tipoRichiesto === "famiglia"
        ? candidati.filter((c) => c.tipo === "famiglia")
        : [...candidati.filter((c) => c.tipo === "singola"), ...candidati.filter((c) => c.tipo === "famiglia")];
    if (coprono.length === 0) return { ok: false };

    // Prova a claimare i candidati in ordine: il primo che riusciamo a segnare
    // usato (grazie al filtro usato_il is null) è nostro.
    for (const c of coprono) {
      const { data, error } = await db
        .from("crediti_pratica")
        .update({ usato_il: new Date().toISOString(), pratica_usata: praticaUsata })
        .eq("id", c.id)
        .is("usato_il", null)
        .select("id");
      if (error) {
        console.error("[credito] consumo fallito:", error.message);
        return { ok: false };
      }
      if (data && data.length > 0) return { ok: true };
      // usato_il non era più null: qualcun altro l'ha preso, provo il prossimo.
    }
    return { ok: false };
  } catch (e) {
    console.error("[credito] consumo fallito:", e);
    return { ok: false };
  }
}
