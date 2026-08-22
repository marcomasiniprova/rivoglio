import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * LE LETTURE PER IL PANNELLO: i creator con quanto hanno portato e quanto
 * gli devi. Solo server.
 *
 * L'aggregazione la fa qui il codice, non una GROUP BY: al lancio i creator
 * sono una manciata e le righe poche, quindi è più semplice leggere tutto e
 * sommare che mantenere una vista SQL. Se un giorno diventano migliaia si
 * sposta in una funzione del database.
 */

export type RigaAffiliato = {
  id: string;
  codice: string;
  nome: string;
  sconto_percento: number;
  commissione_percento: number;
  attivo: boolean;
  creato_il: string;
  venditeCheck: number;
  venditePratica: number;
  /** Tutte le commissioni maturate, pagate o no. */
  maturato: number;
  /** Quello che devi ancora versare. */
  daPagare: number;
};

type RigaCommissione = {
  affiliato_id: string;
  tipo: "check" | "pratica";
  commissione: number | string;
  pagata_il: string | null;
};

export async function leggiAffiliati(): Promise<RigaAffiliato[] | null> {
  if (!SERVIZIO_ATTIVO) return null;
  try {
    const db = supabaseServizio();
    const [aff, comm] = await Promise.all([
      db
        .from("affiliati")
        .select("id, codice, nome, sconto_percento, commissione_percento, attivo, creato_il")
        .order("creato_il", { ascending: false }),
      db.from("commissioni").select("affiliato_id, tipo, commissione, pagata_il"),
    ]);
    if (aff.error) throw new Error(aff.error.message);
    if (comm.error) throw new Error(comm.error.message);

    const righe = (comm.data ?? []) as RigaCommissione[];
    return (aff.data ?? []).map((a) => {
      const sue = righe.filter((r) => r.affiliato_id === a.id);
      const somma = (f: (r: RigaCommissione) => boolean) =>
        Math.round(sue.filter(f).reduce((t, r) => t + Number(r.commissione), 0) * 100) / 100;
      return {
        ...a,
        venditeCheck: sue.filter((r) => r.tipo === "check").length,
        venditePratica: sue.filter((r) => r.tipo === "pratica").length,
        maturato: somma(() => true),
        daPagare: somma((r) => r.pagata_il === null),
      };
    });
  } catch (e) {
    console.error("[affiliati] lettura pannello fallita:", e);
    return null;
  }
}
