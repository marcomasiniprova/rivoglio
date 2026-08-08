/**
 * Le letture verso Supabase dell'app. Oggi una sola cosa: le pratiche.
 *
 * Il check non passa da qui: chiede il verdetto all'API del sito
 * (`lib/api.ts`), così le regole restano in un posto solo. Qui si legge
 * quello che l'utente ha già aperto, per seguirlo.
 *
 * Con EXPO_PUBLIC_DEMO=1 le funzioni rispondono con dati dimostrativi e
 * non toccano la rete: servono a provare le schermate senza un account.
 * Ogni riga demo porta `demo: true`, e l'interfaccia la marca.
 *
 * Gli errori verso l'utente sono sempre in italiano. Quello che non
 * riconosciamo diventa un messaggio generico e finisce su console.error.
 */
import { supabase } from "./supabase";

export const DEMO: boolean = process.env.EXPO_PUBLIC_DEMO === "1";

const giorniFa = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const oreFa = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

export type StatoPratica =
  | "creata"
  | "pagata"
  | "pronta"
  | "inviata"
  | "sollecito"
  | "enac"
  | "esito_pagata"
  | "esito_rifiutata"
  | "rimborsata";

export type Pratica = {
  id: string;
  stato: StatoPratica;
  /** Codice IATA del volo, es. "FR8321". Null se il volo non è agganciato. */
  volo_iata: string | null;
  /** Giorno del volo, "YYYY-MM-DD". Null senza volo agganciato. */
  data_locale: string | null;
  /** Importo della fascia CE 261/2004 per passeggero. Null se non fissato. */
  importo_fascia: number | null;
  creata_il: string;
  /** Vero SOLO sui dati dimostrativi: l'interfaccia mostra BadgeDemo. */
  demo?: boolean;
};

/**
 * Due pratiche dimostrative, marcate `demo: true` (l'interfaccia le segna).
 * Il volo FR8321 è l'esempio della SPEC; gli importi (250€, 400€) sono le
 * fasce vere del Regolamento CE 261/2004, non numeri inventati.
 */
function praticheDemo(): Pratica[] {
  return [
    {
      id: "demo-p1",
      stato: "pronta",
      volo_iata: "FR8321",
      data_locale: giorniFa(21).slice(0, 10),
      importo_fascia: 250,
      creata_il: oreFa(3),
      demo: true,
    },
    {
      id: "demo-p2",
      stato: "inviata",
      volo_iata: "AZ604",
      data_locale: giorniFa(40).slice(0, 10),
      importo_fascia: 400,
      creata_il: giorniFa(6),
      demo: true,
    },
  ];
}

type RigaPratica = {
  id: string;
  stato: StatoPratica;
  importo_fascia: number | null;
  creata_il: string;
  voli:
    | { volo_iata: string; data_locale: string }
    | { volo_iata: string; data_locale: string }[]
    | null;
};

/**
 * Le pratiche dell'utente, più recente prima. Torna `null` quando la lettura
 * fallisce: la schermata deve distinguere "nessuna pratica" (stato vuoto
 * onesto) da "non sono riuscito a leggere" (errore con riprova).
 */
export async function caricaPratiche(): Promise<Pratica[] | null> {
  if (DEMO) return praticheDemo();
  try {
    // La Row Level Security fa passare solo le pratiche dell'utente collegato.
    const { data, error } = await supabase
      .from("pratiche")
      .select("id, stato, importo_fascia, creata_il, voli(volo_iata, data_locale)")
      .order("creata_il", { ascending: false });
    if (error) {
      console.error("[dati] pratiche non lette:", error.message);
      return null;
    }
    const righe = (data ?? []) as unknown as RigaPratica[];
    return righe.map((r) => {
      // Senza tipi generati Supabase può dare il join come lista: si normalizza.
      const volo = Array.isArray(r.voli) ? (r.voli[0] ?? null) : r.voli;
      return {
        id: r.id,
        stato: r.stato,
        volo_iata: volo?.volo_iata ?? null,
        data_locale: volo?.data_locale ?? null,
        importo_fascia: r.importo_fascia,
        creata_il: r.creata_il,
      };
    });
  } catch (e) {
    console.error("[dati] pratiche non lette:", e);
    return null;
  }
}
