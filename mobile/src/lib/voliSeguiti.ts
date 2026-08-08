/**
 * I VOLI CHE IL SERVER RICONTROLLA PER AVVISARTI.
 *
 * Scelta di Valerio (popup dell'8/08): l'avviso arriva dal server, non dal
 * telefono. Il telefono può essere spento, senza rete, in aereo; il server
 * no. Per farlo serve sapere di chi è il volo, quindi gli avvisi chiedono
 * di entrare con l'email. Il check invece resta libero per tutti: chi non
 * vuole un account continua a usare l'app come prima, solo senza avvisi.
 *
 * Cosa viaggia: il numero di volo e il giorno. Nient'altro. La riga sta in
 * `voli_seguiti`, protetta dalla Row Level Security ("ognuno vede i suoi").
 *
 * Non lancia mai: un avviso mancato non deve rompere il check.
 */
import { DEMO } from "./dati";
import { supabase } from "./supabase";
import type { VoloSalvato } from "./voliSalvati";

/** L'id di chi è entrato, o null. */
async function chiSono(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Porta sul server i voli salvati sul telefono.
 *
 * Si scrive con upsert sulla coppia (volo, giorno): rimandare lo stesso
 * volo due volte non crea doppioni e non azzera un avviso già partito.
 * Torna quanti voli sono seguiti adesso.
 */
export async function seguiVoli(voli: VoloSalvato[]): Promise<number> {
  if (DEMO || voli.length === 0) return 0;
  const utente = await chiSono();
  if (!utente) return 0;

  const righe = voli.map((v) => ({
    utente_id: utente,
    volo_iata: v.volo.toUpperCase(),
    data_locale: v.data,
  }));

  try {
    const { error } = await supabase
      .from("voli_seguiti")
      .upsert(righe, { onConflict: "utente_id,volo_iata,data_locale", ignoreDuplicates: true });
    if (error) {
      console.warn("[seguiti] non salvati:", error.message);
      return 0;
    }
    return righe.length;
  } catch (e) {
    console.warn("[seguiti] non salvati:", e);
    return 0;
  }
}

/** Toglie un volo dai seguiti: se l'utente lo cancella, sparisce anche di là. */
export async function smettiDiSeguire(volo: string, data: string): Promise<void> {
  if (DEMO) return;
  const utente = await chiSono();
  if (!utente) return;

  try {
    const { error } = await supabase
      .from("voli_seguiti")
      .delete()
      .eq("utente_id", utente)
      .eq("volo_iata", volo.toUpperCase())
      .eq("data_locale", data);
    if (error) console.warn("[seguiti] non tolto:", error.message);
  } catch (e) {
    console.warn("[seguiti] non tolto:", e);
  }
}
