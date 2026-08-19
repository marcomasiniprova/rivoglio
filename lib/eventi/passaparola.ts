import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * I NUMERI DEL PASSAPAROLA (TIENITELI, scelta di Valerio 19/08).
 *
 * Su un prodotto una-tantum la crescita è il passaparola, non il
 * riacquisto: questi sono i numeri che dicono se il motore gira.
 *  - inviti condivisi: quante volte, dal momento d'oro, qualcuno ha premuto
 *    "invita un amico" (evento `invito`).
 *  - amici arrivati: quante visite portano l'etichetta dell'invito
 *    (utm_source=invito). È il numero che conta davvero: le persone nuove
 *    che il passaparola porta.
 *  - recensioni: quante lasciate, quante approvate (la prova che regge).
 *
 * ⚠️ RICAVI E LTV NON SONO QUI: senza una cassa che incassa sarebbero zeri
 * inventati. Si accendono con la cassa, come la riattivazione (i due
 * recuperi via email, spenti con RECUPERO_ATTIVO).
 *
 * ⚠️ Un numero che non si legge torna null, mai zero: uno zero inventato
 * qui direbbe "nessuno passa parola" quando magari il database ha solo
 * avuto un singhiozzo. È la stessa regola del cruscotto.
 */

export type Passaparola = {
  /** La finestra guardata, in giorni. */
  giorni: number;
  /** Quante volte è stato premuto "invita un amico". */
  invitiCondivisi: number | null;
  /** Quante visite sono arrivate dall'etichetta dell'invito. */
  amiciArrivati: number | null;
  /** Le recensioni: totali e quante approvate (senza finestra: si sommano). */
  recensioni: { totali: number; approvate: number } | null;
};

/** Conta le righe di `eventi` di un tipo, dentro la finestra. */
async function contaEventi(
  tipo: string,
  daIso: string,
  provenienza?: string,
): Promise<number | null> {
  try {
    let q = supabaseServizio()
      .from("eventi")
      .select("*", { count: "exact", head: true })
      .eq("tipo", tipo)
      .gte("creato_il", daIso);
    if (provenienza) q = q.eq("provenienza", provenienza);
    const { count, error } = await q;
    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export async function leggiPassaparola(giorni = 30): Promise<Passaparola> {
  const vuoto: Passaparola = {
    giorni,
    invitiCondivisi: null,
    amiciArrivati: null,
    recensioni: null,
  };
  if (!SERVIZIO_ATTIVO) return vuoto;

  const daIso = new Date(Date.now() - giorni * 86_400_000).toISOString();

  const recensioni = await (async () => {
    try {
      const db = supabaseServizio();
      const tot = await db.from("recensioni").select("*", { count: "exact", head: true });
      if (tot.error) return null;
      const appr = await db
        .from("recensioni")
        .select("*", { count: "exact", head: true })
        .eq("stato", "approvata");
      if (appr.error) return null;
      return { totali: tot.count ?? 0, approvate: appr.count ?? 0 };
    } catch {
      return null;
    }
  })();

  return {
    giorni,
    invitiCondivisi: await contaEventi("invito", daIso),
    amiciArrivati: await contaEventi("visita", daIso, "invito"),
    recensioni,
  };
}
