import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { codiceAffiliatoValido } from "./codice";

/**
 * L'AFFILIATO (il creator), letto dal database. Solo server: la tabella si
 * legge con la chiave di servizio, mai dal browser.
 */

export type Affiliato = {
  id: string;
  codice: string;
  nome: string;
  /** Quanto prende il creator, in percentuale del prezzo pagato. */
  commissione_percento: number;
  /** Quanto sconto vede il cliente che arriva col suo codice. */
  sconto_percento: number;
};

/**
 * L'affiliato ATTIVO per un codice, o null.
 *
 * ⚠️ Non lancia mai e non blocca mai una vendita. Se il codice non è dei
 * nostri, o il database non risponde, ci si comporta come "nessun
 * affiliato": si vende a prezzo pieno. Un guasto nostro non deve né
 * regalare uno sconto a caso né fermare un pagamento.
 */
export async function affiliatoDaCodice(
  codiceGrezzo: string | null | undefined,
): Promise<Affiliato | null> {
  const codice = codiceAffiliatoValido(codiceGrezzo);
  if (!codice || !SERVIZIO_ATTIVO) return null;
  try {
    const db = supabaseServizio();
    const { data, error } = await db
      .from("affiliati")
      .select("id, codice, nome, commissione_percento, sconto_percento")
      .eq("codice", codice)
      .eq("attivo", true)
      .maybeSingle<Affiliato>();
    if (error) {
      console.error("[affiliati] lettura fallita:", error.message);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.error("[affiliati] lettura fallita:", e);
    return null;
  }
}

/** Il prezzo scontato dal creator, ai centesimi. Senza affiliato, invariato. */
export function scontoAffiliato(prezzo: number, aff: Affiliato | null): number {
  if (!aff || aff.sconto_percento <= 0) return prezzo;
  return Math.round(prezzo * (100 - aff.sconto_percento)) / 100;
}
