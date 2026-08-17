/**
 * INDEXNOW: «ehi Bing, guarda che c'è roba nuova» (GEO, 17/08).
 *
 * Perché è il pezzo che conta più di tutti. ChatGPT non naviga il web da
 * solo: per le sue risposte usa l'indice di Bing (circa l'87% delle
 * citazioni). Una pagina che Bing non ha visto, ChatGPT non la può citare.
 * Le nostre 79 pagine per compagnia, per quanto fatte bene, restano
 * invisibili finché Bing non le indicizza.
 *
 * IndexNow è il modo GRATIS e immediato di dirlo: si pubblica, si manda un
 * ping, e la pagina entra in coda in minuti invece che in settimane. Lo
 * usano Bing, Yandex e altri (Google no, per Google c'è la sitemap).
 *
 * ⚠️ LA CHIAVE NON È UN SEGRETO. Serve solo a provare che il sito è nostro:
 * la stessa chiave è pubblicata in chiaro su `/<chiave>.txt` (in `public/`).
 * IndexNow accetta i nostri URL solo se la chiave nel file combacia. Per
 * questo può stare scritta qui: chi la legge non ci fa niente.
 *
 * ⚠️ NON DEVE MAI ROMPERE NIENTE. È un di più: se IndexNow non risponde o
 * la rete cade, si scrive nel registro e si va avanti. Nessun deploy e
 * nessun check deve fermarsi perché un ping non è partito.
 */

/** La chiave IndexNow. Pubblica: combacia con `public/<chiave>.txt`. */
export const CHIAVE_INDEXNOW = "ed6d4a834262729218803a37398e4a3a";

/** L'host nudo di un indirizzo: `https://rivolio.it/x` → `rivolio.it`. */
function host(casa: string): string | null {
  try {
    return new URL(casa).host;
  } catch {
    return null;
  }
}

export type EsitoIndexNow = {
  ok: boolean;
  status?: number;
  quante: number;
  motivo?: string;
};

/**
 * Manda gli URL a IndexNow. Torna sempre, non lancia mai.
 *
 * ⚠️ Tutti gli URL devono stare sullo STESSO host della chiave, altrimenti
 * IndexNow rifiuta l'intero lotto (403/422). Qui si filtra: si tengono solo
 * gli indirizzi dell'host di `casa`, che è anche dov'è pubblicata la chiave.
 */
export async function inviaAIndexNow(casa: string, urls: string[]): Promise<EsitoIndexNow> {
  const h = host(casa);
  if (!h) return { ok: false, quante: 0, motivo: "indirizzo del sito non valido" };

  /* Solo gli indirizzi dello stesso host della chiave. Un URL di un altro
     dominio nel lotto fa rifiutare tutto. */
  const puliti = [...new Set(urls.filter((u) => host(u) === h))];
  if (puliti.length === 0) return { ok: false, quante: 0, motivo: "nessun URL da inviare" };

  /* IndexNow accetta fino a 10.000 URL per chiamata: noi ne abbiamo
     un centinaio, sta in una sola. */
  const corpo = {
    host: h,
    key: CHIAVE_INDEXNOW,
    keyLocation: `${casa.replace(/\/$/, "")}/${CHIAVE_INDEXNOW}.txt`,
    urlList: puliti.slice(0, 10_000),
  };

  try {
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(corpo),
    });
    /* IndexNow risponde 200 (accettato) o 202 (accettato, in coda). Gli
       altri codici li riportiamo per leggerli nel registro. */
    const ok = r.status === 200 || r.status === 202;
    return {
      ok,
      status: r.status,
      quante: puliti.length,
      motivo: ok ? undefined : await r.text().catch(() => `HTTP ${r.status}`),
    };
  } catch (e) {
    return { ok: false, quante: puliti.length, motivo: String(e) };
  }
}
