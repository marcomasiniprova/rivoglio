import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Polar, il Merchant of Record (DECISIONI 06/08: Valerio non ha partita IVA,
 * Polar vende a nome proprio e gestisce l'IVA UE).
 *
 * Due pezzi soli:
 * 1. `linkCheckout`  — costruisce l'URL del checkout link con la verifica
 *    agganciata e l'email precompilata.
 * 2. `verificaFirmaWebhook` — controlla che un webhook arrivi davvero da
 *    Polar, secondo lo standard "Standard Webhooks" che Polar segue.
 */

/* ------------------------------------------------------- checkout link */

/**
 * I due checkout link (pratica 14,90€ · famiglia 24,90€) si creano a mano
 * nel pannello Polar e si mettono qui come URL COMPLETI. Sono l'unico SKU
 * doppio del prodotto: niente altri (SPEC §5).
 */
const ENV_LINK: Record<"singola" | "famiglia", string | undefined> = {
  get singola() {
    return process.env.POLAR_CHECKOUT_PRATICA;
  },
  get famiglia() {
    return process.env.POLAR_CHECKOUT_FAMIGLIA;
  },
};

/**
 * L'URL del checkout per una verifica idonea.
 *
 * Forma documentata dei parametri (polar.sh/docs/features/checkout/links,
 * "Query parameters", letta il 07/08/2026):
 * - `customer_email` precompila l'email nel checkout;
 * - `reference_id` (come i parametri utm_*) viene salvato da Polar nei
 *   `metadata` della sessione di checkout e si propaga all'ordine.
 * Qui `reference_id` = id della verifica: è il filo che il webhook riavvolge
 * per sapere PER QUALE caso è arrivato il pagamento.
 *
 * Torna `null` se il link non è configurato o non è un URL: chi chiama
 * decide cosa mostrare, niente si rompe.
 */
export function linkCheckout(
  tipo: "singola" | "famiglia",
  verificaId: string,
  email?: string | null,
): string | null {
  const base = ENV_LINK[tipo];
  if (!base) {
    console.warn(
      `[polar] checkout link "${tipo}" assente: manca POLAR_CHECKOUT_${
        tipo === "famiglia" ? "FAMIGLIA" : "PRATICA"
      }.`,
    );
    return null;
  }
  try {
    const url = new URL(base);
    url.searchParams.set("reference_id", verificaId);
    if (email) url.searchParams.set("customer_email", email);
    return url.toString();
  } catch {
    console.error(`[polar] POLAR_CHECKOUT_${tipo.toUpperCase()} non è un URL valido.`);
    return null;
  }
}

/* ------------------------------------------------------ firma webhook */

export type EsitoFirma =
  | { ok: true; corpo: string }
  | { ok: false; motivo: string };

/** Finestra di validità del timestamp: 5 minuti, come raccomanda lo standard. */
const TOLLERANZA_SECONDI = 300;

/**
 * Verifica la firma di un webhook Polar e restituisce il corpo GREZZO.
 *
 * Polar segue lo standard "Standard Webhooks" (docs.polar.sh/developers/
 * webhooks + standardwebhooks.com, letti il 07/08/2026):
 * - intestazioni `webhook-id`, `webhook-timestamp`, `webhook-signature`;
 * - firma = "v1," + base64( HMAC-SHA256( segreto, `${id}.${timestamp}.${corpo}` ) );
 * - l'intestazione può portare PIÙ firme separate da spazio (rotazione del
 *   segreto): ne basta una che combacia.
 *
 * Il corpo va letto crudo PRIMA di qualunque parse: la firma è sui byte,
 * non sul JSON. Per questo la funzione legge lei la Request e riconsegna
 * il testo a chi chiama.
 *
 * SENZA SEGRETO NON SI PASSA MAI IN PRODUZIONE: un webhook di pagamento
 * non firmato è chiunque su internet che si inventa un ordine. In sviluppo,
 * senza segreto impostato, si passa con un avviso: serve a provare in locale
 * (stessa logica di `chiamataAutorizzata` del motore).
 */
export async function verificaFirmaWebhook(req: Request): Promise<EsitoFirma> {
  let corpo: string;
  try {
    corpo = await req.text();
  } catch {
    return { ok: false, motivo: "Corpo della richiesta illeggibile." };
  }

  const segreto = process.env.POLAR_WEBHOOK_SECRET ?? "";
  if (!segreto) {
    if (process.env.NODE_ENV === "production") {
      console.error("[polar] POLAR_WEBHOOK_SECRET assente: webhook RESPINTO.");
      return {
        ok: false,
        motivo: "POLAR_WEBHOOK_SECRET assente: in produzione la firma non si salta mai.",
      };
    }
    console.warn("[polar] POLAR_WEBHOOK_SECRET assente: firma NON verificata (solo sviluppo).");
    return { ok: true, corpo };
  }

  const id = req.headers.get("webhook-id");
  const ts = req.headers.get("webhook-timestamp");
  const firme = req.headers.get("webhook-signature");
  if (!id || !ts || !firme) {
    return { ok: false, motivo: "Intestazioni Standard Webhooks mancanti." };
  }

  const secondi = Number(ts);
  if (!Number.isFinite(secondi) || Math.abs(Date.now() / 1000 - secondi) > TOLLERANZA_SECONDI) {
    return { ok: false, motivo: "Timestamp fuori dalla finestra di 5 minuti." };
  }

  // Lo standard vuole il segreto in base64 col prefisso `whsec_`; il pannello
  // Polar accetta anche un segreto libero, che va usato com'è. Si coprono
  // entrambe le forme.
  const chiave = segreto.startsWith("whsec_")
    ? Buffer.from(segreto.slice("whsec_".length), "base64")
    : Buffer.from(segreto, "utf8");

  const attesa = createHmac("sha256", chiave).update(`${id}.${ts}.${corpo}`).digest();

  for (const pezzo of firme.split(" ")) {
    const virgola = pezzo.indexOf(",");
    if (virgola < 0) continue;
    if (pezzo.slice(0, virgola) !== "v1") continue;
    const ricevuta = Buffer.from(pezzo.slice(virgola + 1), "base64");
    // Confronto a tempo costante: un confronto normale lascia misurare
    // quanti byte combaciano, e la firma si indovina un byte alla volta.
    if (ricevuta.length === attesa.length && timingSafeEqual(ricevuta, attesa)) {
      return { ok: true, corpo };
    }
  }

  return { ok: false, motivo: "Firma non valida." };
}
