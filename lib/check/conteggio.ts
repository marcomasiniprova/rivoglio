/**
 * IL CONTEGGIO: quanti check si sono fatti, e quanti si sono pagati.
 *
 * Serve a due cose diverse, e tutte e due contano:
 * 1. **i posti di lancio.** "1,99 per i primi 500" si può scrivere solo
 *    se i 500 si contano davvero. Un contatore inventato è esattamente
 *    ciò che distingue una scarsità onesta da un trucco, e qui si vende
 *    trasparenza: se il numero non si legge, non si mostra.
 * 2. **sapere quanto traffico c'è.** Prima di discutere di prezzi serve
 *    sapere quante persone arrivano: ogni conto fatto senza quel numero
 *    è un'opinione travestita da calcolo.
 *
 * Da dove arrivano i numeri: dalla tabella `verifiche`, che esiste dal
 * primo giorno e registra ogni check. Nessuna tabella nuova, nessuna
 * migrazione: i check pagati si riconoscono perché portano l'ordine che
 * li ha pagati.
 */
import { colonnaMancante } from "@/lib/supabase/colonne";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

export type Conteggio = {
  /** Quanti check in tutto. null = non si è riusciti a leggere. */
  totali: number | null;
  /** Quanti negli ultimi sette giorni. */
  settimana: number | null;
  /** Quanti sono stati pagati: è il numero che decide il prezzo. */
  pagati: number | null;
};

const VUOTO: Conteggio = { totali: null, settimana: null, pagati: null };

/**
 * I tre numeri. Non lancia mai: un guasto del database diventa `null`, e
 * chi legge decide cosa fare (di solito: non mostrare niente).
 */
export async function conteggioCheck(): Promise<Conteggio> {
  if (!SERVIZIO_ATTIVO) return VUOTO;
  const db = supabaseServizio();
  const settimanaFa = new Date(Date.now() - 7 * 86_400_000).toISOString();

  async function quanti(filtro: (q: ReturnType<typeof base>) => unknown): Promise<number | null> {
    try {
      const { count, error } = (await filtro(base())) as {
        count: number | null;
        error: { message: string } | null;
      };
      if (error) {
        /* La colonna dell'ordine arriva con la migrazione del check a
           pagamento: finché non è applicata, quel numero non esiste e si
           risponde null invece di far fallire tutto il resto. */
        if (!colonnaMancante(error.message)) {
          console.error("[conteggio] lettura fallita:", error.message);
        }
        return null;
      }
      return count ?? 0;
    } catch (e) {
      console.error("[conteggio] lettura fallita:", e);
      return null;
    }
  }

  const base = () => db.from("verifiche").select("id", { count: "exact", head: true });

  const [totali, settimana, pagati] = await Promise.all([
    quanti((q) => q),
    quanti((q) => q.gte("creata_il", settimanaFa)),
    quanti((q) => q.not("ordine_check", "is", null)),
  ]);

  return { totali, settimana, pagati };
}
