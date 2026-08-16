import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { registraEvento } from "@/lib/pratiche/pratiche";

/**
 * LA FOTO DELLA PROVA DI PAGAMENTO (Valerio, 16/08).
 *
 * «Quando dichiara pagato, dagli la possibilità FACOLTATIVA di caricare la
 * foto della prova del bonifico. Va salvata, e mi deve apparire nel pannello
 * admin: la userò come testimonial anonimo delle recensioni.»
 *
 * ⚠️ QUI SI ROMPE, DI PROPOSITO, LA REGOLA "le immagini non si salvano".
 * Ovunque nel prodotto (carta d'imbarco, risposta della compagnia) l'immagine
 * si legge e si scarta: contiene dati personali. Questa NO: è l'unico posto
 * dove la teniamo, ed è una scelta esplicita di Valerio. Per questo:
 *  - il bucket è PRIVATO: si legge solo dal server con la chiave di servizio,
 *    e nel pannello admin si mostra con un URL firmato che scade;
 *  - all'utente diciamo di coprire l'IBAN e il nome prima di caricare: per un
 *    testimonial servono l'importo e la data, non i suoi dati bancari;
 *  - il testimonial resta ANONIMO e lo monta Valerio a mano dal pannello, non
 *    esce da solo da nessuna parte.
 *
 * Niente spunta di consenso (scelta di Valerio): il caricamento è
 * facoltativo, quindi caricare È il consenso. Chi non vuole, non carica.
 *
 * Il riferimento alla foto sta in un EVENTO della pratica (come il resto),
 * non in una colonna nuova: una colonna mancante fa fallire tutta la lettura
 * della pratica finché non si applica la migrazione (è già successo il 10/08).
 */

export const EVENTO_PROVA_PAGAMENTO = "prova_pagamento";

/** Il bucket privato su Supabase Storage. Da creare una volta (vedi
 *  supabase/DA-APPLICARE.sql): `insert into storage.buckets`. */
export const BUCKET_PROVE = "prove-pagamento";

const MAX_BYTE = 5 * 1024 * 1024;

/** MIME accettati → estensione del file salvato. */
const ESTENSIONE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export type EsitoSalvataggio =
  | { ok: true }
  | { ok: false; errore: string; codice: number };

/**
 * Salva la foto: decodifica il base64, la carica nel bucket privato e
 * scrive l'evento con il percorso. Un solo file per pratica (upsert): se
 * l'utente ricarica, sostituisce.
 */
export async function salvaProvaPagamento(
  praticaId: string,
  base64: string,
  mime: string,
): Promise<EsitoSalvataggio> {
  if (!SERVIZIO_ATTIVO) {
    return { ok: false, errore: "Il server non è configurato.", codice: 503 };
  }
  const ext = ESTENSIONE[mime];
  if (!ext) {
    return {
      ok: false,
      errore: "Formato non supportato: usa una foto (JPG, PNG, WebP) o un PDF.",
      codice: 400,
    };
  }

  let dati: Buffer;
  try {
    dati = Buffer.from(base64, "base64");
  } catch {
    return { ok: false, errore: "File non leggibile.", codice: 400 };
  }
  if (dati.length < 100) {
    return { ok: false, errore: "Il file sembra vuoto: riprova.", codice: 400 };
  }
  if (dati.length > MAX_BYTE) {
    return { ok: false, errore: "Il file supera i 5MB: riprova con una foto più leggera.", codice: 400 };
  }

  const percorso = `${praticaId}.${ext}`;
  try {
    const db = supabaseServizio();
    const { error } = await db.storage
      .from(BUCKET_PROVE)
      .upload(percorso, dati, { contentType: mime, upsert: true });
    if (error) {
      console.error("[prova-pagamento] upload fallito:", error.message);
      return { ok: false, errore: "Non sono riuscito a salvare la foto. Riprova.", codice: 500 };
    }
  } catch (e) {
    console.error("[prova-pagamento] upload, errore inatteso:", e);
    return { ok: false, errore: "Non sono riuscito a salvare la foto. Riprova.", codice: 500 };
  }

  // L'evento porta il percorso: da lì l'admin ricostruisce l'URL firmato.
  await registraEvento(praticaId, EVENTO_PROVA_PAGAMENTO, percorso);
  return { ok: true };
}

export type ProvaPagamento = {
  praticaId: string;
  percorso: string;
  quando: string;
  /** URL firmato (scade in un'ora): null se il bucket non c'è ancora. */
  url: string | null;
};

/**
 * Per il pannello admin: le foto caricate, dalla più recente, con l'URL
 * firmato per vederle. Se il bucket non esiste ancora (migrazione non
 * applicata) torna la lista senza URL, non un errore.
 */
export async function proveDiPagamento(limite = 100): Promise<ProvaPagamento[]> {
  if (!SERVIZIO_ATTIVO) return [];
  try {
    const db = supabaseServizio();
    const { data, error } = await db
      .from("pratiche_eventi")
      .select("pratica_id, nota, creato_il")
      .eq("tipo", EVENTO_PROVA_PAGAMENTO)
      .order("creato_il", { ascending: false })
      .limit(limite);
    if (error || !data) return [];

    const righe = data as { pratica_id: string; nota: string | null; creato_il: string }[];
    const percorsi = righe.map((r) => r.nota).filter((p): p is string => Boolean(p));
    if (percorsi.length === 0) return [];

    // URL firmati in un colpo solo, invece di una chiamata per foto.
    const firme = new Map<string, string>();
    const { data: firmate } = await db.storage
      .from(BUCKET_PROVE)
      .createSignedUrls(percorsi, 3600);
    for (const f of firmate ?? []) {
      if (f.path && f.signedUrl && !f.error) firme.set(f.path, f.signedUrl);
    }

    return righe
      .filter((r) => r.nota)
      .map((r) => ({
        praticaId: r.pratica_id,
        percorso: r.nota as string,
        quando: r.creato_il,
        url: firme.get(r.nota as string) ?? null,
      }));
  } catch (e) {
    console.error("[prova-pagamento] elenco admin fallito:", e);
    return [];
  }
}
