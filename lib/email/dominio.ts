/**
 * IL DOMINIO RICEVE POSTA DAVVERO?
 *
 * Sta in un file suo, separato da `indirizzo.ts`, e non è pignoleria di
 * archiviazione: qui dentro c'è `node:dns`, che nel browser non esiste.
 * Tenendo le due cose nello stesso file, il bundle del client si sarebbe
 * portato dietro un modulo di Node e la build si sarebbe rotta. Così
 * `indirizzo.ts` resta usabile dai due lati e questo resta di casa sul
 * server.
 */

import { controllaFormato, dominioDi, type EsitoIndirizzo } from "./indirizzo";

/**
 * Vero se il dominio ha una destinazione per la posta, falso se il
 * dominio non esiste, **null se non si è riusciti a chiederlo**.
 *
 * ⚠️ I tre esiti sono tre, non due, e il terzo è quello che conta: un
 * timeout non è un "no". Vedi il commento in testa al file.
 */
export async function dominioRicevePosta(
  dominio: string,
  scadenzaMs = 2500,
): Promise<boolean | null> {
  // Il DNS esiste solo sul server: nel browser questa funzione non gira.
  if (typeof window !== "undefined") return null;
  try {
    const { promises: dns } = await import("node:dns");
    const risolutore = new dns.Resolver({ timeout: scadenzaMs, tries: 1 });

    const conScadenza = async <T>(p: Promise<T>): Promise<T | "scaduto"> => {
      let orologio: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          p,
          new Promise<"scaduto">((r) => {
            orologio = setTimeout(() => r("scaduto"), scadenzaMs);
          }),
        ]);
      } finally {
        if (orologio) clearTimeout(orologio);
      }
    };

    try {
      const mx = await conScadenza(risolutore.resolveMx(dominio));
      if (mx === "scaduto") return null;
      // Un MX vuoto o con host "." vuol dire "questo dominio non riceve
      // posta", ed è una dichiarazione esplicita (RFC 7505).
      const veri = mx.filter((r) => r.exchange && r.exchange !== ".");
      if (veri.length > 0) return true;
    } catch (e) {
      const codice = (e as NodeJS.ErrnoException).code ?? "";
      // NXDOMAIN: il dominio proprio non c'è. Risposta certa, non un guasto.
      if (codice === "ENOTFOUND" || codice === "NXDOMAIN") return false;
      // ENODATA: il dominio c'è ma senza MX. Si prova il ripiego qui sotto.
      if (codice !== "ENODATA") return null;
    }

    /* Ripiego RFC 5321 §5.1: senza MX, la posta va all'indirizzo del
       dominio. Sono pochi, ma esistono e sono caselle vere. */
    try {
      const a = await conScadenza(risolutore.resolve4(dominio));
      if (a === "scaduto") return null;
      return a.length > 0;
    } catch (e) {
      const codice = (e as NodeJS.ErrnoException).code ?? "";
      if (codice === "ENOTFOUND" || codice === "NXDOMAIN" || codice === "ENODATA") return false;
      return null;
    }
  } catch {
    // Niente modulo dns (runtime edge): non lo sappiamo, quindi si passa.
    return null;
  }
}

/**
 * Il controllo completo: le tre prove offline più la domanda al DNS.
 * È questo che va chiamato dal server, sempre, prima di scrivere un
 * indirizzo da qualche parte o di aprire un account con quello.
 */
export async function controllaIndirizzo(
  grezza: string,
  opzioni: { insisto?: boolean; dns?: boolean } = {},
): Promise<EsitoIndirizzo> {
  const primo = controllaFormato(grezza, opzioni);
  if (!primo.ok) return primo;
  if (opzioni.dns === false) return primo;

  const riceve = await dominioRicevePosta(dominioDi(primo.email));
  if (riceve === false) {
    return {
      ok: false,
      motivo: "dominio_morto",
      messaggio:
        "Questo indirizzo non esiste: il dominio dopo la chiocciola non riceve posta. Controlla come l'hai scritto.",
    };
  }
  return primo;
}
