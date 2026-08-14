/**
 * I tipi dello strato 2 (verifica fattuale, SPEC §4).
 *
 * Il fatto oggettivo (`FattoVolo`) è definito UNA volta sola, dentro il
 * motore delle regole: qui si riesporta e basta, così fornitori e regole
 * parlano per forza la stessa lingua.
 */

import type { FattoVolo } from "@/lib/regole/eu261";

export type { FattoVolo } from "@/lib/regole/eu261";

/**
 * Un fatto con attaccato il payload grezzo del fornitore.
 *
 * `payloadGrezzo` è la risposta dell'API così com'è arrivata: va archiviata
 * SEMPRE nella tabella `voli` (SPEC §4: è la prova se una compagnia contesta
 * fra 6 mesi). È opzionale perché un fatto ricostruito dalla cache non ce
 * l'ha appresso: sta già nel database.
 */
export type FattoConPayload = FattoVolo & { payloadGrezzo?: unknown };

/**
 * Quel poco che il primario sa già del volo e che può aiutare una seconda
 * fonte a cercarlo. Serve ai fornitori che NON cercano per numero di volo ma
 * per aeroporto (AviationEdge storico: interroga uno scalo in una data). I
 * fornitori che cercano per numero (aerodatabox, aviationstack, demo) lo
 * ignorano: è opzionale apposta, così l'interfaccia resta una sola.
 */
export type ContestoRicerca = {
  partenzaIata?: string | null;
  arrivoIata?: string | null;
};

/**
 * Un fornitore di dati volo. Tutti uguali visti da fuori, così si
 * scambiano senza toccare il resto: aerodatabox (primario), aviationstack e
 * aviationedge (riserve per l'incrocio), demo (solo quando manca la chiave
 * vera).
 *
 * Contratto di `cerca`:
 * - risolve con un fatto quando l'API ha risposto qualcosa di usabile,
 *   anche se lo stato è "sconosciuto";
 * - risolve con `null` quando il volo non esiste, la chiave manca o la
 *   rete è caduta. MAI un'eccezione: un errore di fornitore diventa un
 *   esito incerto a valle, non un 500 in faccia all'utente.
 * - `contesto` è facoltativo: lo passa solo chi lo ha (la seconda fonte, che
 *   riceve dal primario lo scalo d'arrivo) e lo usa solo chi ne ha bisogno.
 */
export type FornitoreVoli = {
  nome: string;
  cerca: (
    voloIata: string,
    dataLocale: string,
    contesto?: ContestoRicerca,
  ) => Promise<FattoConPayload | null>;
};

/** L'esito standard delle funzioni che possono fallire in modo pulito. */
export type Esito<T> = { ok: true; valore: T } | { ok: false; errore: string };
