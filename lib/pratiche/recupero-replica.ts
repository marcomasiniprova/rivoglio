import { SERVIZIO_ATTIVO, supabaseServizio } from "../supabase/servizio";
import { EVENTO_REPLICA_INVIATA } from "./passi";

/**
 * IL RECUPERO DEL "NO NON REPLICATO" (TIENITELI, scelta di Valerio 19/08).
 *
 * Chi ha registrato il no della compagnia e non ha ancora mandato la
 * replica pronta è fermo nel punto morto più caro della pratica: un no
 * alla prima risposta è la norma, non l'eccezione, e spesso è proprio la
 * replica a sbloccare il pagamento. Il cron `segui` gli manda un
 * promemoria gentile qualche giorno dopo il no.
 *
 * Il segnale è lo stesso della pagina pratica (`giriDiNo` in passi.ts):
 * un evento `rifiuto` per ogni no, un evento `replica_inviata` per ogni
 * replica mandata. Se i no sono più delle repliche, c'è un no aperto.
 * Nessuna colonna nuova, nessuna migrazione: si conta sugli eventi.
 *
 * ⚠️ SPENTO finché non c'è la cassa (RECUPERO_ATTIVO): mandare gente verso
 * una pratica quando non c'è ancora un incasso è la scelta di Valerio, ed
 * è lo stesso interruttore del recupero del check.
 */

/** L'evento che marca il promemoria mandato. Prefisso `email_` come gli
    altri follow-up, così il cron lo riconosce come email già spedita. */
export const EVENTO_RECUPERO_REPLICA = "email_recupero_replica";

/** Quanti giorni si aspetta, dopo il no, prima del promemoria. Tre: il
    tempo di provarci da soli, non tanto da dimenticarsene. */
export const GIORNI_PRIMA_DEL_RECUPERO_REPLICA = 3;

/** Acceso solo con la cassa (scelta di Valerio), come il recupero del check. */
export const RECUPERO_ATTIVO = process.env.RECUPERO_ATTIVO === "1";

export type StatoReplica = {
  /** Quanti no dichiarati (eventi `rifiuto`). */
  no: number;
  /** Quante repliche mandate (eventi `replica_inviata`). */
  replicheMandate: number;
  /** Quanti promemoria di recupero già spediti per questa pratica. */
  promemoria: number;
  /** Quando è arrivato l'ultimo no (ISO), o null se non lo sappiamo. */
  ultimoNoIso: string | null;
};

/**
 * Va mandato il promemoria "manda la replica" adesso?
 *
 * Pura: nessun accesso alla rete, così la regola che tocca utenti veri si
 * blinda con una prova. Un promemoria per ogni no, mai due; solo dopo che
 * il no pende da qualche giorno; mai su un no a cui hai già replicato.
 */
export function deveRecuperareReplica(s: StatoReplica, adesso: Date = new Date()): boolean {
  // Serve un no ancora senza replica.
  if (s.no <= s.replicheMandate) return false;
  // Uno solo per ogni no: se ne abbiamo già mandato uno per questo giro, basta.
  if (s.promemoria >= s.no) return false;
  if (!s.ultimoNoIso) return false;
  const t = Date.parse(s.ultimoNoIso);
  if (!Number.isFinite(t)) return false;
  const giorni = (adesso.getTime() - t) / 86_400_000;
  return giorni >= GIORNI_PRIMA_DEL_RECUPERO_REPLICA;
}

/**
 * Per un gruppo di pratiche, i tre conti che servono a decidere: quanti
 * no, quante repliche mandate, quanti promemoria già spediti, e la data
 * dell'ultimo no. Una query sola.
 */
export async function statoRepliche(ids: string[]): Promise<Map<string, StatoReplica>> {
  const mappa = new Map<string, StatoReplica>();
  if (!SERVIZIO_ATTIVO || ids.length === 0) return mappa;
  try {
    const db = supabaseServizio();
    const { data, error } = await db
      .from("pratiche_eventi")
      .select("pratica_id, tipo, creato_il")
      .in("pratica_id", ids)
      .in("tipo", ["rifiuto", EVENTO_REPLICA_INVIATA, EVENTO_RECUPERO_REPLICA])
      .order("creato_il", { ascending: true });
    if (error) {
      console.error("[recupero-replica] eventi non letti:", error.message);
      return mappa;
    }
    for (const e of data ?? []) {
      const cur =
        mappa.get(e.pratica_id) ?? { no: 0, replicheMandate: 0, promemoria: 0, ultimoNoIso: null };
      if (e.tipo === "rifiuto") {
        cur.no++;
        cur.ultimoNoIso = e.creato_il;
      } else if (e.tipo === EVENTO_REPLICA_INVIATA) {
        cur.replicheMandate++;
      } else if (e.tipo === EVENTO_RECUPERO_REPLICA) {
        cur.promemoria++;
      }
      mappa.set(e.pratica_id, cur);
    }
    // Come giriDiNo: le repliche non possono superare i no.
    for (const v of mappa.values()) v.replicheMandate = Math.min(v.replicheMandate, v.no);
    return mappa;
  } catch (e) {
    console.error("[recupero-replica] eventi non letti:", e);
    return mappa;
  }
}
