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
