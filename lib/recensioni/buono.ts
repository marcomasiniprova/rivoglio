/**
 * IL BUONO ANALISI GRATIS: la ricevuta che apre il cancello del check una
 * volta, guadagnata lasciando una recensione.
 *
 * È fatto come il pass del pagamento (lib/check/pass.ts), e per la stessa
 * ragione: zero frizione. Il buono viaggia in un cookie FIRMATO che porta
 * solo il suo identificativo; la firma dimostra che l'abbiamo emesso noi.
 *
 * ⚠️ IL COOKIE NON È IL PERMESSO, È LA CONSEGNA. Un cookie si copia, quindi
 * da solo non basta: il conto vero lo tiene il database (`buoni_analisi`,
 * colonna `usato_il`). Il cookie serve a ritrovare QUALE buono, senza far
 * cercare niente all'utente e senza un account che magari non ha. La
 * validità (non ancora usato) la decide sempre il registro.
 *
 * Il segreto è quello del servizio, come per il pass e per i gettoni
 * delle email: se manca, in produzione NON si firma niente, perché un
 * buono che chiunque può fabbricarsi non è un buono, è una porta aperta.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const SEGRETO =
  process.env.SEGRETO_ISCRITTI ??
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";
const IN_PRODUZIONE = process.env.NODE_ENV === "production";
const SEGRETO_SVILUPPO = "rivolio-sviluppo-non-usare-in-produzione";

/** Il cookie che porta il buono. */
export const COOKIE_BUONO = "rivolio_buono";

/** Quanto vale il cookie, in giorni: un buono non scade in fretta. */
export const GIORNI_BUONO = 90;

function chiave(): string | null {
  if (SEGRETO) return SEGRETO;
  if (IN_PRODUZIONE) return null;
  return SEGRETO_SVILUPPO;
}

const firma = (corpo: string, k: string) =>
  createHmac("sha256", k).update(corpo).digest("base64url");

/** La ricevuta del buono: "id.firma". null se non si può firmare. */
export function creaBuonoCookie(id: string): string | null {
  const k = chiave();
  if (!k) {
    console.error("[buono] nessun segreto in produzione: buono non emesso");
    return null;
  }
  return `${id}.${firma(id, k)}`;
}

/** Rilegge il cookie e torna l'id del buono, o null se manca/è falso. */
export function leggiBuonoCookie(valore: string | null | undefined): string | null {
  const k = chiave();
  if (!k || !valore) return null;
  const punto = valore.lastIndexOf(".");
  if (punto <= 0) return null;
  const id = valore.slice(0, punto);
  const data = valore.slice(punto + 1);
  /* Confronto a tempo costante: come per il pass, su un confronto normale
     la firma si indovina un carattere alla volta misurando i tempi. */
  const atteso = Buffer.from(firma(id, k));
  const ricevuto = Buffer.from(data);
  if (atteso.length !== ricevuto.length || !timingSafeEqual(atteso, ricevuto)) return null;
  return id;
}
