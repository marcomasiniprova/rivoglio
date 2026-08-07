/**
 * Le righe di Supabase come le usa l'app. Le tabelle complete stanno in
 * SPEC.md sezione 8: qui c'è solo quello che le schermate leggono davvero.
 */
import type { Tipo } from "../motore/destinazioni";

export type { Tipo } from "../motore/destinazioni";

export type Profilo = {
  id: string;
  email: string;
  comune: string | null;
  lat: number | null;
  lng: number | null;
  crediti: number;
  tetto_settimanale: number;
};

export type Ricerca = {
  id: string;
  budget_max_persona: number;
  ore_viaggio_max: number;
  notti_min: number;
  notti_max: number;
  persone: number;
  tipi: Tipo[];
  attiva: boolean;
  creata_il: string;
};

/** Un invio con la sua offerta: quello che l'utente chiama "destinazione". */
export type Destinazione = {
  id: string;
  inviato_il: string;
  aperto_il: string | null;
  /** Vero SOLO sui dati dimostrativi: l'interfaccia mostra BadgeDemo. */
  demo?: boolean;
  offerta: {
    struttura: string;
    comune: string;
    check_in: string;
    check_out: string;
    prezzo_alloggio: number;
    link: string;
    tipo: Tipo;
    lat: number;
    lng: number;
  };
};
