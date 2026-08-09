import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * I gettoni firmati dei link nelle email: conferma iscrizione e disdetta.
 *
 * Perché firmati e non un id a caso salvato nel database: un gettone
 * firmato non ha bisogno di essere cercato da nessuna parte. Il link
 * porta con sé l'indirizzo e la scadenza, la firma dimostra che l'abbiamo
 * scritto noi, e nessuno può fabbricarsi il link di disdetta di un altro
 * cambiando una lettera nell'indirizzo.
 *
 * Il segreto è quello del servizio: se manca, in sviluppo si usa una
 * stringa fissa e i link funzionano lo stesso; in produzione senza
 * segreto NON si firma niente, perché un gettone che chiunque può
 * rifare non è un gettone.
 */

const SEGRETO =
  process.env.SEGRETO_ISCRITTI ??
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";
const IN_PRODUZIONE = process.env.NODE_ENV === "production";
const SEGRETO_SVILUPPO = "rivolio-sviluppo-non-usare-in-produzione";

/** Quanto dura un link. Un mese: chi apre la posta tardi non resta fuori. */
const DURATA_MS = 30 * 24 * 60 * 60 * 1000;

export type Scopo = "conferma" | "disdetta";

function chiave(): string | null {
  if (SEGRETO) return SEGRETO;
  if (IN_PRODUZIONE) return null;
  return SEGRETO_SVILUPPO;
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const daB64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function firma(corpo: string, k: string): string {
  return createHmac("sha256", k).update(corpo).digest("base64url");
}

/** Il gettone per un indirizzo e uno scopo. null se non possiamo firmare. */
export function creaGettone(email: string, scopo: Scopo, adesso = Date.now()): string | null {
  const k = chiave();
  if (!k) {
    console.error("[gettone] nessun segreto in produzione: link non generato");
    return null;
  }
  const corpo = b64(JSON.stringify({ e: email.toLowerCase(), s: scopo, x: adesso + DURATA_MS }));
  return `${corpo}.${firma(corpo, k)}`;
}

export type Lettura =
  | { ok: true; email: string }
  | { ok: false; motivo: "malformato" | "firma" | "scaduto" | "scopo" | "segreto" };

/** Legge un gettone e restituisce l'indirizzo solo se tutto torna. */
export function leggiGettone(gettone: string, scopo: Scopo, adesso = Date.now()): Lettura {
  const k = chiave();
  if (!k) return { ok: false, motivo: "segreto" };

  const punto = (gettone ?? "").lastIndexOf(".");
  if (punto <= 0) return { ok: false, motivo: "malformato" };
  const corpo = gettone.slice(0, punto);
  const data = gettone.slice(punto + 1);

  /* Confronto a tempo costante: su un confronto normale si può indovinare
     la firma un carattere alla volta misurando i tempi di risposta. */
  const atteso = Buffer.from(firma(corpo, k));
  const ricevuto = Buffer.from(data);
  if (atteso.length !== ricevuto.length || !timingSafeEqual(atteso, ricevuto)) {
    return { ok: false, motivo: "firma" };
  }

  let letto: { e?: unknown; s?: unknown; x?: unknown };
  try {
    letto = JSON.parse(daB64(corpo));
  } catch {
    return { ok: false, motivo: "malformato" };
  }

  if (letto.s !== scopo) return { ok: false, motivo: "scopo" };
  if (typeof letto.x !== "number" || letto.x < adesso) return { ok: false, motivo: "scaduto" };
  if (typeof letto.e !== "string" || !letto.e) return { ok: false, motivo: "malformato" };

  return { ok: true, email: letto.e };
}

/** I due link pronti da mettere nell'email. */
export function linkConferma(sito: string, email: string): string | null {
  const g = creaGettone(email, "conferma");
  return g && `${sito}/api/iscriviti/conferma?g=${encodeURIComponent(g)}`;
}

export function linkDisdetta(sito: string, email: string): string | null {
  const g = creaGettone(email, "disdetta");
  return g && `${sito}/api/iscriviti/disdetta?g=${encodeURIComponent(g)}`;
}
