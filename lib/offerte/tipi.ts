import type { Tipo } from "../destinazioni";

/**
 * La forma unica di un'offerta, qualunque sia la sua provenienza.
 *
 * Tutto il resto del prodotto conosce SOLO questa forma. Il motore non sa se
 * un'offerta arriva da Firecrawl, da Exa, da un browser pilotato o dalle mani
 * di Valerio: vede righe nella tabella `offerte` e basta. È quello che ci
 * permette di cambiare raccoglitore senza riscrivere niente, e di tenerne
 * accesi più d'uno insieme.
 */
export type Offerta = {
  struttura: string;
  comune: string;
  lat: number;
  lng: number;
  checkIn: string; // "2026-08-14"
  checkOut: string;
  /** Prezzo TOTALE del soggiorno per l'intera camera, non a notte a testa. */
  prezzoAlloggio: number;
  link: string;
  tipo: Tipo;
  /** Chi l'ha trovata: "firecrawl", "exa", "manuale", … */
  fonte: string;
  /**
   * `demo`   = raccolta, non verificata. NON genera alert. Marcata anche
   *            nell'interfaccia (regola #3).
   * `attiva` = verificata: link vivo, prezzo confermato. Può generare alert.
   * `morta`  = era attiva, non lo è più.
   */
  stato: "demo" | "attiva" | "morta";
  scadeIl?: string | null;
};

/**
 * Un raccoglitore. Ne esiste uno per fonte.
 *
 * Deve rispettare tre cose, e non sono opinabili:
 * 1. `robots.txt` del sito che legge
 * 2. una richiesta al secondo per dominio, non di più
 * 3. dichiararsi con uno user-agent vero e un contatto
 *
 * Un raccoglitore che si maschera viene bloccato comunque, e intanto brucia
 * il dominio. La velocità la si prende in parallelo su domini diversi, mai
 * martellando lo stesso.
 */
export type Raccoglitore = {
  nome: string;
  /** Quanti secondi al massimo può girare. Netlify taglia a 10. */
  budgetSecondi: number;
  raccogli(ctx: {
    /** Comuni su cui vale la pena cercare, i più richiesti prima. */
    comuni: string[];
    /** Ferma tutto: il tempo è finito. */
    scaduto: () => boolean;
  }): Promise<Offerta[]>;
};

/** Le notti fra due date. Serve a normalizzare qualunque fonte. */
export function notti(checkIn: string, checkOut: string): number {
  const a = Date.parse(checkIn);
  const b = Date.parse(checkOut);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/**
 * Scarta quello che non possiamo usare, PRIMA di scriverlo nel database.
 *
 * Un raccoglitore automatico produce spazzatura: prezzi a zero, date al
 * contrario, coordinate a (0,0) che cadono nell'oceano al largo dell'Africa.
 * Se entra nel database, un giorno esce in un alert.
 */
export function accettabile(o: Partial<Offerta>): o is Offerta {
  if (!o.struttura?.trim() || !o.comune?.trim()) return false;
  if (typeof o.lat !== "number" || typeof o.lng !== "number") return false;
  // riquadro dell'Italia, isole comprese
  if (o.lat < 35.4 || o.lat > 47.1 || o.lng < 6.6 || o.lng > 18.6) return false;
  if (typeof o.prezzoAlloggio !== "number" || o.prezzoAlloggio <= 0) return false;
  // sopra i 3.000€ non è una micro-vacanza: è un errore di lettura
  if (o.prezzoAlloggio > 3000) return false;
  if (!o.link?.startsWith("http")) return false;
  if (!o.checkIn || !o.checkOut) return false;

  const n = notti(o.checkIn, o.checkOut);
  if (n < 1 || n > 3) return false; // micro-vacanza: 1-3 notti, per definizione

  return true;
}
