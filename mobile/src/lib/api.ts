/**
 * Il ponte verso il motore di Rivolio.
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

/* ─────────────────────────── LA SCHEDA DELLA PRATICA ─────────────────────
   La pratica si SEGUE dentro l'app (scelta di Valerio, 8/08): timeline,
   lettera e "l'ho inviata" vivono qui. L'unica cosa che apre il sito è il
   pagamento. L'app si presenta col token della sua sessione Supabase. */

export type EventoScheda = { tipo: string; nota: string | null; creato_il: string };

export type LetteraScheda = {
  oggetto: string;
  corpo: string;
  allegati: string[];
  compagnia: {
    nome: string;
    canale: string;
    url: string;
    email: string | null;
    indirizzoPostale: string | null;
  } | null;
};

export type SchedaPratica = {
  pratica: {
    id: string;
    stato: string;
    tipo: "singola" | "famiglia";
    importo: number | null;
    passeggeri: number;
    garanziaFinoAl: string | null;
    inviataIl: string | null;
    creataIl: string;
    volo: { iata: string; data: string; da: string | null; a: string | null } | null;
  };
  eventi: EventoScheda[];
  lettera: LetteraScheda | null;
};

export type EsitoScheda = { ok: true; scheda: SchedaPratica } | { ok: false; errore: string };

/** La scheda completa di una pratica, dal server. */
export async function schedaPratica(id: string, token: string): Promise<EsitoScheda> {
  try {
    const r = await fetch(`${SITO}/api/pratiche/${encodeURIComponent(id)}/scheda`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dati = await r.json().catch(() => null);
    if (!r.ok || !dati?.ok) {
      return {
        ok: false,
        errore:
          typeof dati?.errore === "string"
            ? dati.errore
            : "Non riesco a leggere la pratica. Riprova fra un attimo.",
      };
    }
    return { ok: true, scheda: dati as SchedaPratica };
  } catch {
    return { ok: false, errore: "Sei offline? Controlla la connessione e riprova." };
  }
}

/** "L'ho inviata": la conferma d'invio del reclamo, registrata sul server. */
export async function confermaInvio(
  id: string,
  token: string,
): Promise<{ ok: true } | { ok: false; errore: string }> {
  try {
    const r = await fetch(`${SITO}/api/pratiche/conferma-invio`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pratica_id: id }),
    });
    const dati = await r.json().catch(() => null);
    if (!r.ok || !dati?.ok) {
      return {
        ok: false,
        errore:
          typeof dati?.errore === "string" ? dati.errore : "Non sono riuscito a salvare. Riprova.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, errore: "Sei offline? Controlla la connessione e riprova." };
  }
}

/* ─────────────────────────── LA CLASSIFICA ───────────────────────────────
   Chi si è ripreso più soldi. Il server decide se è accesa: al lancio è
   SPENTA finché non ci sono vincite vere (scelta di Valerio, 8/08), e
   l'app la nasconde da sola. In classifica c'è solo chi ha scelto un
   nome pubblico e ha detto sì. */

export type VoceClassifica = { posizione: number; nickname: string; totale: number };

export type EsitoClassifica =
  | { attiva: false }
  | { attiva: true; demo: boolean; voci: VoceClassifica[] };

/** La classifica dal server. Un errore = spenta: mai un guasto in faccia. */
export async function classifica(): Promise<EsitoClassifica> {
  // In demo la classifica si vede senza rete, dichiarata come esempio.
  if (process.env.EXPO_PUBLIC_DEMO === "1") {
    return {
      attiva: true,
      demo: true,
      voci: [
        { posizione: 1, nickname: "esempio_giulia", totale: 1200 },
        { posizione: 2, nickname: "esempio_marco", totale: 800 },
        { posizione: 3, nickname: "esempio_sara", totale: 650 },
        { posizione: 4, nickname: "esempio_luca", totale: 400 },
        { posizione: 5, nickname: "esempio_anna", totale: 250 },
      ],
    };
  }
  try {
    const r = await fetch(`${SITO}/api/classifica`);
    const dati = await r.json().catch(() => null);
    if (!r.ok || !dati?.ok || !dati.attiva) return { attiva: false };
    return {
      attiva: true,
      demo: Boolean(dati.demo),
      voci: Array.isArray(dati.voci) ? (dati.voci as VoceClassifica[]) : [],
    };
  } catch {
    return { attiva: false };
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

/* ───────────── I CASI CHE GLI ARCHIVI NON VEDONO ─────────────────────────
   Volo cancellato, negato imbarco, coincidenza persa: il motore da solo
   non può chiuderli, perché dipendono da fatti che sa solo il passeggero
   (quando ti hanno avvisato, se sei salito, se il biglietto era unico).
   Fino a oggi sull'app questi casi erano un vicolo cieco: usciva "incerto"
   e finiva lì, mentre sul sito si chiudevano con due domande.
   Il verdetto resta SEMPRE del server: qui si spediscono solo le risposte. */

export type EsitoDomande =
  | {
      ok: true;
      esito: "idoneo" | "incerto" | "non_idoneo";
      motivo: string;
      importo?: number;
    }
  | { ok: false; errore: string };

async function mandaRisposte(rotta: string, corpo: unknown): Promise<EsitoDomande> {
  try {
    const r = await fetch(`${SITO}${rotta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const dati = await r.json().catch(() => null);
    if (!r.ok || !dati?.ok) {
      return {
        ok: false,
        errore:
          typeof dati?.errore === "string"
            ? dati.errore
            : "Non riesco a chiudere il verdetto. Riprova fra un attimo.",
      };
    }
    return {
      ok: true,
      esito: dati.esito,
      motivo: dati.motivo,
      importo: typeof dati.importo === "number" ? dati.importo : undefined,
    };
  } catch {
    return { ok: false, errore: "Sei offline? Controlla la connessione e riprova." };
  }
}

/** Volo cancellato: preavviso e volo alternativo (art. 5). */
export function chiudiCancellato(d: {
  volo: string;
  data: string;
  verificaId: string | null;
  preavviso: string;
  alternativa: string;
}): Promise<EsitoDomande> {
  return mandaRisposte("/api/verifica/cancellato", d);
}

/** Negato imbarco (art. 4) o coincidenza persa (sentenza Folkerts). */
export function chiudiDichiarato(
  d:
    | {
        volo: string;
        data: string;
        verificaId: string | null;
        caso: "negato";
        presenza: string;
        volonta: string;
      }
    | {
        volo: string;
        data: string;
        verificaId: string | null;
        caso: "coincidenza";
        unica: string;
        ritardoFinale: string;
        destinazioneFinale: string;
      },
): Promise<EsitoDomande> {
  return mandaRisposte("/api/verifica/dichiara", d);
}
