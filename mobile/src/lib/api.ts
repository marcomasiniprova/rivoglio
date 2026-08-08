/**
 * Il ponte verso il motore di Rivoglio.
 *
 * Regola di casa: le regole del Regolamento CE 261/2004 vivono in UN posto
 * solo, sul server (`lib/regole/eu261.ts` del sito). L'app non le duplica
 * e non le reinterpreta: chiede il verdetto alla stessa API che usa il
 * sito, così un volo dà lo stesso esito ovunque lo controlli.
 */

/**
 * Il sito di produzione. In sviluppo si può puntare al proprio server
 * (`EXPO_PUBLIC_SITO=http://localhost:3000 npx expo start`) per provare
 * il flusso senza toccare la produzione.
 */
export const SITO = process.env.EXPO_PUBLIC_SITO ?? "https://rivoglio.netlify.app";

export type EsitoCheck =
  | {
      ok: true;
      id: string | null;
      esito: "idoneo" | "incerto" | "non_idoneo";
      importo?: number;
      ritardoMinuti?: number;
      motivo: string;
      dato: {
        /** Le città della tratta: "Bergamo" e "Lanzarote". */
        da: string | null;
        a: string | null;
        previsto: string | null;
        effettivo: string | null;
        vettoreOperativo: string | null;
        km: number | null;
      };
      demo: boolean;
    }
  | { ok: false; errore: string };

/**
 * Chiede il verdetto al motore. Non decide niente qui dentro: se la rete
 * cade lo dice, non inventa un esito.
 */
export async function verificaVolo(volo: string, data: string): Promise<EsitoCheck> {
  try {
    const r = await fetch(`${SITO}/api/verifica`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volo: volo.trim(), data }),
    });
    const dati = await r.json().catch(() => null);
    if (!r.ok || !dati?.ok) {
      return {
        ok: false,
        errore:
          typeof dati?.errore === "string"
            ? dati.errore
            : "Non riesco a controllare il volo. Riprova fra un attimo.",
      };
    }
    return dati as EsitoCheck;
  } catch {
    return { ok: false, errore: "Sei offline? Controlla la connessione e riprova." };
  }
}

/* ─────────────────────────── LA RICERCA PER TRATTA ───────────────────────
   Il numero di volo è la frizione più grossa: l'utente medio non sa dove
   trovarlo. Qui si chiede quello che uno ricorda davvero (da dove sei
   partito, dove sei arrivato, che giorno) e si mette davanti l'elenco dei
   voli di quel giorno. Il verdetto arriva dopo, dal motore di sempre. */

export type AeroportoTrovato = {
  iata: string;
  citta: string;
  nome: string;
  paese: string;
};

export type VoloDiTratta = {
  volo: string;
  compagnia: string | null;
  partenzaOra: string;
  arrivoOra: string;
  cancellato: boolean;
};

/** Gli aeroporti che corrispondono a quello che l'utente sta scrivendo. */
export async function cercaAeroporti(q: string): Promise<AeroportoTrovato[]> {
  if (q.trim().length < 2) return [];
  try {
    const r = await fetch(`${SITO}/api/aeroporti?q=${encodeURIComponent(q.trim())}`);
    const dati = await r.json().catch(() => null);
    return dati?.ok && Array.isArray(dati.aeroporti) ? (dati.aeroporti as AeroportoTrovato[]) : [];
  } catch {
    // Un suggerimento mancato non è un errore da mostrare: si scrive il codice.
    return [];
  }
}

export type EsitoTratta =
  | { ok: true; voli: VoloDiTratta[]; demo: boolean }
  | { ok: false; errore: string };

/** I voli di quel giorno fra i due scali, in ordine di partenza. */
export async function voliDiTratta(
  da: string,
  a: string,
  dataIso: string,
): Promise<EsitoTratta> {
  try {
    const r = await fetch(
      `${SITO}/api/voli-tratta?da=${encodeURIComponent(da)}&a=${encodeURIComponent(a)}&data=${dataIso}`,
    );
    const dati = await r.json().catch(() => null);
    if (!r.ok || !dati?.ok) {
      return {
        ok: false,
        errore:
          typeof dati?.errore === "string"
            ? dati.errore
            : "Non riesco a cercare i voli. Riprova fra un attimo.",
      };
    }
    return { ok: true, voli: dati.voli as VoloDiTratta[], demo: Boolean(dati.demo) };
  } catch {
    return { ok: false, errore: "Sei offline? Controlla la connessione e riprova." };
  }
}
