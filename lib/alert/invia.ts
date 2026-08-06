import { supabaseServizio } from "../supabase/servizio";
import { mandaTelegram, messaggioAlert, TELEGRAM_ATTIVO } from "../telegram";
import { alert as emailAlert, creditiFiniti } from "../email/messaggi";
import type { Abbinamento } from "../offerte/motore";

/**
 * Manda un alert e scala il credito.
 *
 * L'ORDINE DELLE OPERAZIONI È LA COSA IMPORTANTE DI QUESTO FILE.
 *
 * 1. si prenota il credito (scalo atomico in database)
 * 2. si manda il messaggio
 * 3. se il messaggio non parte, il credito TORNA INDIETRO
 *
 * Perché non "mando prima e scalo dopo": fra i due passaggi il processo può
 * morire, e l'utente riceve alert gratis all'infinito.
 * Perché non "scalo e amen": far pagare un alert che non è mai arrivato è
 * l'unica cosa da cui questo prodotto non si riprende. Il rimborso costa una
 * riga e chiude il buco.
 */

export type EsitoInvio =
  | { ok: true; canale: "telegram" | "email"; creditiRimasti: number }
  | { ok: false; motivo: string; senzaCrediti?: boolean };

type Destinatario = {
  utenteId: string;
  email: string;
  chatTelegram: string | null;
};

/** Scala un credito. Torna i rimasti, oppure -1 se non ce n'erano. */
async function prenotaCredito(utenteId: string): Promise<number> {
  const db = supabaseServizio();
  const { data, error } = await db.rpc("consuma_credito", { p_utente: utenteId });
  if (error) throw new Error(`scalo credito fallito: ${error.message}`);
  return typeof data === "number" ? data : -1;
}

/** Rimette il credito. Si chiama SOLO se l'invio è fallito. */
async function restituisciCredito(utenteId: string, rimasti: number): Promise<void> {
  const db = supabaseServizio();
  const { error } = await db
    .from("profili")
    .update({ crediti: rimasti + 1 })
    .eq("id", utenteId);
  if (error) {
    // Non si rilancia: l'utente ha già il suo problema (alert non arrivato).
    // Ma questo DEVE finire nei log, perché è un credito sparito.
    console.error(`[alert] RIMBORSO FALLITO per ${utenteId}: ${error.message}`);
  }
}

export async function inviaAlert(
  a: Abbinamento,
  chi: Destinatario,
  soglia: number,
): Promise<EsitoInvio> {
  // ---- 1. prenota
  let rimasti: number;
  try {
    rimasti = await prenotaCredito(chi.utenteId);
  } catch (e) {
    return { ok: false, motivo: String(e) };
  }

  if (rimasti < 0) {
    // Niente crediti: si avvisa una volta e ci si ferma. Non è un errore.
    void creditiFiniti(chi.email);
    return { ok: false, motivo: "Crediti esauriti.", senzaCrediti: true };
  }

  // ---- 2. manda
  const o = a.offerta;
  const canale: "telegram" | "email" =
    chi.chatTelegram && TELEGRAM_ATTIVO ? "telegram" : "email";

  let riuscito = false;
  let motivo = "";

  if (canale === "telegram") {
    const r = await mandaTelegram(
      chi.chatTelegram!,
      messaggioAlert({
        destinazione: o.comune,
        struttura: o.struttura,
        notti: a.notti,
        persone: Math.round(o.prezzoAlloggio / a.alloggioPersona),
        alloggioPersona: a.alloggioPersona,
        autoPersona: a.autoPersona,
        totalePersona: a.totalePersona,
        soglia,
        km: a.km,
        ore: a.ore,
        link: o.link,
        creditiRimasti: rimasti,
      }),
    );
    riuscito = r.ok;
    if (!r.ok) motivo = r.motivo;
  } else {
    const r = await emailAlert(chi.email, {
      destinazione: o.comune,
      struttura: o.struttura,
      notti: a.notti,
      persone: Math.round(o.prezzoAlloggio / a.alloggioPersona),
      alloggio: a.alloggioPersona,
      auto: a.autoPersona,
      totale: a.totalePersona,
      soglia,
      km: a.km,
      ore: a.ore,
      link: o.link,
    });
    riuscito = r.ok;
    if (!r.ok) motivo = r.motivo;
  }

  // ---- 3. rimborsa se non è partito
  if (!riuscito) {
    await restituisciCredito(chi.utenteId, rimasti);
    return { ok: false, motivo: motivo || "Invio fallito." };
  }

  // ---- 4. registra, così non lo rimandiamo mai due volte
  try {
    const db = supabaseServizio();
    await db.from("invii").insert({
      utente_id: chi.utenteId,
      ricerca_id: a.ricercaId,
      offerta_id: (o as { id?: string }).id ?? null,
      canale,
      credito_consumato: true,
    });
  } catch (e) {
    // L'alert è arrivato e il credito è giusto: il registro è secondario.
    console.error("[alert] registrazione invio fallita:", e);
  }

  return { ok: true, canale, creditiRimasti: rimasti };
}
