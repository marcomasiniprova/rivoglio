/**
 * Tutte le letture e scritture verso Supabase passano da qui.
 *
 * Con EXPO_PUBLIC_DEMO=1 ogni funzione risponde con dati dimostrativi e non
 * tocca la rete (la sandbox di sviluppo non raggiunge Supabase). I numeri
 * demo NON sono scritti a mano: li calcola il motore vero (`costruisci`),
 * e ogni destinazione porta `demo: true` così l'interfaccia la marca.
 *
 * Gli errori verso l'utente sono sempre in italiano. Quello che non
 * riconosciamo diventa un messaggio generico e finisce su console.error.
 */
import { costruisci, PARTENZE } from "../motore/costruttore";
import { supabase } from "./supabase";
import type { Destinazione, Profilo, Ricerca, Tipo } from "./tipi";

export const DEMO: boolean = process.env.EXPO_PUBLIC_DEMO === "1";

export type NuovaRicerca = {
  budget: number;
  ore: number;
  nottiMin: number;
  nottiMax: number;
  persone: number;
  tipi: Tipo[];
};

/**
 * Limiti dei campi, gli stessi del sito (app/app/azioni.ts). Validati qui
 * e non solo nella schermata: quello che arriva da un modulo si può forzare.
 */
const LIMITI = {
  budget: { min: 30, max: 600 },
  ore: { min: 0.5, max: 8 },
  notti: { min: 1, max: 3 },
  persone: { min: 1, max: 8 },
  /** Quante destinazioni a settimana accetti: al massimo una al giorno. */
  tetto: { min: 1, max: 7 },
} as const;

const TIPI_AMMESSI: Tipo[] = ["mare", "monte", "citta", "terme"];

const ERRORE_GENERICO = "Qualcosa non ha funzionato. Riprova fra un attimo.";
const ERRORE_SESSIONE = "Sessione scaduta. Rientra.";

function dentro(n: number, l: { min: number; max: number }): boolean {
  return Number.isFinite(n) && n >= l.min && n <= l.max;
}

function erroreCampi(r: NuovaRicerca): string | null {
  if (!dentro(r.budget, LIMITI.budget)) {
    return `Il budget deve stare fra ${LIMITI.budget.min}€ e ${LIMITI.budget.max}€ a persona.`;
  }
  if (!dentro(r.ore, LIMITI.ore)) return "Le ore di viaggio devono stare fra 0,5 e 8.";
  if (!dentro(r.nottiMin, LIMITI.notti) || !dentro(r.nottiMax, LIMITI.notti) || r.nottiMin > r.nottiMax) {
    return "Le notti non tornano: da 1 a 3, e il minimo non può superare il massimo.";
  }
  if (!dentro(r.persone, LIMITI.persone)) return "Le persone devono stare fra 1 e 8.";
  if (r.tipi.some((t) => !TIPI_AMMESSI.includes(t))) return "C'è un tipo di posto che non conosco. Riprova.";
  return null;
}

/* ────────────────────────────────────────────────────────────────────────
 * Dati dimostrativi. Partenza, budget e benzina sono l'INGRESSO del motore;
 * ore, km, costo dell'auto e prezzo dell'alloggio escono da `costruisci`.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Media nazionale self service, osservatorio MIMIT del 06/08/2026.
 * In produzione la legge il server dall'osservatorio, mai un valore fisso.
 */
const BENZINA_DEMO = 1.994;
const PARTENZA_DEMO = "Bologna";
const RICHIESTA_DEMO = { budget: 140, ore: 3, nottiMin: 1, nottiMax: 2, persone: 2 } as const;

type StatoDemo = {
  profilo: Profilo;
  ricerche: Ricerca[];
  destinazioni: Destinazione[];
  prossimoId: number;
};

let statoDemo: StatoDemo | null = null;

const giornoIso = (d: Date) => d.toISOString().slice(0, 10);
const giorniFa = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const oreFa = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

function prossimoVenerdi(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  return d;
}

function spostato(base: Date, giorni: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + giorni);
  return d;
}

function demo(): StatoDemo {
  if (statoDemo) return statoDemo;

  const partenza = PARTENZE.find((p) => p.nome === PARTENZA_DEMO) ?? PARTENZE[0];
  const esito = costruisci({
    partenza: partenza.nome,
    budgetPersona: RICHIESTA_DEMO.budget,
    notti: RICHIESTA_DEMO.nottiMax,
    persone: RICHIESTA_DEMO.persone,
    tipi: [],
    oreMax: RICHIESTA_DEMO.ore,
    prezzoBenzina: BENZINA_DEMO,
  });
  const proposte = esito.ok ? esito.proposte : [];
  const venerdi = prossimoVenerdi();

  const destinazioni: Destinazione[] = proposte.slice(0, 2).map((p, i) => {
    // L'offerta demo costa l'80% di quel che resta dopo l'auto: sotto la
    // soglia per costruzione, arrotondata ai 5€ come i listini veri.
    const prezzoCamera = Math.round((0.8 * p.restaPerDormire * RICHIESTA_DEMO.persone) / 5) * 5;
    const notti = i === 0 ? 2 : 1;
    const arrivo = i === 0 ? venerdi : spostato(venerdi, 1);
    return {
      id: `demo-d${i + 1}`,
      inviato_il: i === 0 ? oreFa(2) : giorniFa(1),
      aperto_il: i === 0 ? null : oreFa(20),
      demo: true,
      offerta: {
        struttura: "Struttura di esempio",
        comune: p.destinazione.nome,
        check_in: giornoIso(arrivo),
        check_out: giornoIso(spostato(arrivo, notti)),
        prezzo_alloggio: prezzoCamera,
        link: "https://example.com/offerta-demo",
        tipo: p.destinazione.tipo,
        lat: p.destinazione.lat,
        lng: p.destinazione.lng,
      },
    };
  });

  statoDemo = {
    profilo: {
      id: "demo",
      email: "demo@rivoglio.it",
      comune: partenza.nome,
      lat: partenza.lat,
      lng: partenza.lng,
      // 3 crediti gratis meno le destinazioni già ricevute: il conto torna.
      crediti: 3 - destinazioni.length,
      tetto_settimanale: 3,
    },
    ricerche: [
      {
        id: "demo-r1",
        budget_max_persona: RICHIESTA_DEMO.budget,
        ore_viaggio_max: RICHIESTA_DEMO.ore,
        notti_min: RICHIESTA_DEMO.nottiMin,
        notti_max: RICHIESTA_DEMO.nottiMax,
        persone: RICHIESTA_DEMO.persone,
        tipi: [],
        attiva: true,
        creata_il: giorniFa(3),
      },
      {
        id: "demo-r2",
        budget_max_persona: 90,
        ore_viaggio_max: 2,
        notti_min: 1,
        notti_max: 1,
        persone: 4,
        tipi: ["monte"],
        attiva: false,
        creata_il: giorniFa(10),
      },
    ],
    destinazioni,
    prossimoId: 3,
  };
  return statoDemo;
}

const copiaDestinazione = (d: Destinazione): Destinazione => ({ ...d, offerta: { ...d.offerta } });

/* ────────────────────────────────────────────────────────────────────────
 * Letture
 * ──────────────────────────────────────────────────────────────────────── */

async function idUtente(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[dati] sessione non letta:", error.message);
    return null;
  }
  return data.session?.user.id ?? null;
}

export async function caricaProfilo(): Promise<Profilo | null> {
  if (DEMO) return { ...demo().profilo };
  try {
    const id = await idUtente();
    if (!id) return null;
    const { data, error } = await supabase
      .from("profili")
      .select("id, email, comune, lat, lng, crediti, tetto_settimanale")
      .eq("id", id)
      .single();
    if (error) {
      console.error("[dati] profilo non letto:", error.message);
      return null;
    }
    return data as Profilo;
  } catch (e) {
    console.error("[dati] profilo non letto:", e);
    return null;
  }
}

export async function caricaRicerche(): Promise<Ricerca[]> {
  if (DEMO) return demo().ricerche.map((r) => ({ ...r, tipi: [...r.tipi] }));
  try {
    // La Row Level Security fa passare solo le righe dell'utente collegato.
    const { data, error } = await supabase
      .from("ricerche")
      .select("id, budget_max_persona, ore_viaggio_max, notti_min, notti_max, persone, tipi, attiva, creata_il")
      .order("creata_il", { ascending: false });
    if (error) {
      console.error("[dati] ricerche non lette:", error.message);
      return [];
    }
    return (data ?? []) as Ricerca[];
  } catch (e) {
    console.error("[dati] ricerche non lette:", e);
    return [];
  }
}

type OffertaInviata = Destinazione["offerta"];
type RigaInvio = {
  id: string;
  inviato_il: string;
  aperto_il: string | null;
  offerta: OffertaInviata | OffertaInviata[] | null;
};

export async function caricaDestinazioni(): Promise<Destinazione[]> {
  if (DEMO) return demo().destinazioni.map(copiaDestinazione);
  try {
    const { data, error } = await supabase
      .from("invii")
      .select(
        "id, inviato_il, aperto_il, offerta:offerte(struttura, comune, check_in, check_out, prezzo_alloggio, link, tipo, lat, lng)"
      )
      .order("inviato_il", { ascending: false });
    if (error) {
      console.error("[dati] destinazioni non lette:", error.message);
      return [];
    }
    const righe = (data ?? []) as unknown as RigaInvio[];
    return righe.flatMap((r) => {
      // Senza tipi generati Supabase può dare il join come lista: si normalizza.
      const offerta = Array.isArray(r.offerta) ? r.offerta[0] : r.offerta;
      if (!offerta) return []; // invio senza offerta collegata: niente da mostrare
      return [{ id: r.id, inviato_il: r.inviato_il, aperto_il: r.aperto_il, offerta }];
    });
  } catch (e) {
    console.error("[dati] destinazioni non lette:", e);
    return [];
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * Scritture
 * ──────────────────────────────────────────────────────────────────────── */

export async function segnaAperta(id: string): Promise<void> {
  if (DEMO) {
    const d = demo().destinazioni.find((x) => x.id === id);
    if (d && !d.aperto_il) d.aperto_il = new Date().toISOString();
    return;
  }
  try {
    // Conta solo la PRIMA apertura: la data non si sovrascrive.
    const { error } = await supabase
      .from("invii")
      .update({ aperto_il: new Date().toISOString() })
      .eq("id", id)
      .is("aperto_il", null);
    if (error) console.error("[dati] apertura non registrata:", error.message);
  } catch (e) {
    console.error("[dati] apertura non registrata:", e);
  }
}

export async function creaRicerca(r: NuovaRicerca): Promise<{ errore?: string }> {
  const campi = erroreCampi(r);
  if (campi) return { errore: campi };

  if (DEMO) {
    const s = demo();
    s.ricerche.unshift({
      id: `demo-r${s.prossimoId++}`,
      budget_max_persona: r.budget,
      ore_viaggio_max: r.ore,
      notti_min: r.nottiMin,
      notti_max: r.nottiMax,
      persone: r.persone,
      tipi: [...r.tipi],
      attiva: true,
      creata_il: new Date().toISOString(),
    });
    return {};
  }

  try {
    const id = await idUtente();
    if (!id) return { errore: ERRORE_SESSIONE };

    // Senza partenza la ricerca non calcola niente: meglio dirlo subito.
    const { data: profilo } = await supabase.from("profili").select("comune").eq("id", id).single();
    if (!profilo?.comune) return { errore: "Prima dimmi da dove parti." };

    const { error } = await supabase.from("ricerche").insert({
      utente_id: id,
      budget_max_persona: r.budget,
      ore_viaggio_max: r.ore,
      notti_min: r.nottiMin,
      notti_max: r.nottiMax,
      persone: r.persone,
      tipi: r.tipi,
      attiva: true,
    });
    if (error) {
      console.error("[dati] ricerca non salvata:", error.message);
      return { errore: "Non sono riuscito a salvare la ricerca. Riprova." };
    }
    return {};
  } catch (e) {
    console.error("[dati] ricerca non salvata:", e);
    return { errore: ERRORE_GENERICO };
  }
}

export async function cambiaStatoRicerca(id: string, attiva: boolean): Promise<{ errore?: string }> {
  if (DEMO) {
    const r = demo().ricerche.find((x) => x.id === id);
    if (r) r.attiva = attiva;
    return {};
  }
  try {
    const utente = await idUtente();
    if (!utente) return { errore: ERRORE_SESSIONE };
    // La Row Level Security ferma già le righe altrui: il filtro qui sotto
    // è una seconda serratura, non l'unica.
    const { error } = await supabase.from("ricerche").update({ attiva }).eq("id", id).eq("utente_id", utente);
    if (error) {
      console.error("[dati] stato non aggiornato:", error.message);
      return { errore: "Non sono riuscito ad aggiornare." };
    }
    return {};
  } catch (e) {
    console.error("[dati] stato non aggiornato:", e);
    return { errore: ERRORE_GENERICO };
  }
}

export async function eliminaRicerca(id: string): Promise<{ errore?: string }> {
  if (DEMO) {
    const s = demo();
    s.ricerche = s.ricerche.filter((x) => x.id !== id);
    return {};
  }
  try {
    const utente = await idUtente();
    if (!utente) return { errore: ERRORE_SESSIONE };
    const { error } = await supabase.from("ricerche").delete().eq("id", id).eq("utente_id", utente);
    if (error) {
      console.error("[dati] ricerca non cancellata:", error.message);
      return { errore: "Non sono riuscito a cancellare." };
    }
    return {};
  } catch (e) {
    console.error("[dati] ricerca non cancellata:", e);
    return { errore: ERRORE_GENERICO };
  }
}

export async function salvaPartenza(nomeComune: string): Promise<{ errore?: string }> {
  // Le coordinate NON arrivano dal client: si prendono da PARTENZE a partire
  // dal nome. Accettarle da fuori vuol dire calcoli falsabili.
  const comune = PARTENZE.find((p) => p.nome === nomeComune.trim());
  if (!comune) return { errore: "Scegli una città dalla lista." };

  if (DEMO) {
    const p = demo().profilo;
    p.comune = comune.nome;
    p.lat = comune.lat;
    p.lng = comune.lng;
    return {};
  }

  try {
    const id = await idUtente();
    if (!id) return { errore: ERRORE_SESSIONE };
    const { error } = await supabase
      .from("profili")
      .update({ comune: comune.nome, lat: comune.lat, lng: comune.lng })
      .eq("id", id);
    if (error) {
      console.error("[dati] partenza non salvata:", error.message);
      return { errore: "Non sono riuscito a salvare. Riprova." };
    }
    return {};
  } catch (e) {
    console.error("[dati] partenza non salvata:", e);
    return { errore: ERRORE_GENERICO };
  }
}

export async function salvaTetto(tetto: number): Promise<{ errore?: string }> {
  if (!Number.isInteger(tetto) || !dentro(tetto, LIMITI.tetto)) {
    return { errore: `Il tetto deve stare fra ${LIMITI.tetto.min} e ${LIMITI.tetto.max} destinazioni a settimana.` };
  }

  if (DEMO) {
    demo().profilo.tetto_settimanale = tetto;
    return {};
  }

  try {
    const id = await idUtente();
    if (!id) return { errore: ERRORE_SESSIONE };
    const { error } = await supabase.from("profili").update({ tetto_settimanale: tetto }).eq("id", id);
    if (error) {
      console.error("[dati] tetto non salvato:", error.message);
      return { errore: "Non sono riuscito a salvare. Riprova." };
    }
    return {};
  } catch (e) {
    console.error("[dati] tetto non salvato:", e);
    return { errore: ERRORE_GENERICO };
  }
}
