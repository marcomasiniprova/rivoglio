"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { PARTENZE } from "@/lib/costruttore";
import type { Tipo } from "@/lib/destinazioni";
import { ricercaAttiva } from "@/lib/email/messaggi";

export type EsitoApp = { errore?: string; ok?: string };

const TIPI_AMMESSI: Tipo[] = ["mare", "monte", "citta", "terme"];

/** Limiti dei campi. Stanno qui e non nel modulo: il browser si può falsificare. */
const LIMITI = {
  budget: { min: 30, max: 600 },
  ore: { min: 0.5, max: 8 },
  notti: { min: 1, max: 3 },
  persone: { min: 1, max: 8 },
} as const;

function dentro(n: number, l: { min: number; max: number }) {
  return Number.isFinite(n) && n >= l.min && n <= l.max;
}

/**
 * Imposta da dove parti.
 *
 * Le coordinate NON arrivano dal modulo: si prendono dalla nostra lista a
 * partire dal nome. Se le accettassi dal browser, chiunque potrebbe salvarsi
 * una partenza in mezzo all'oceano e mandare in vacca i calcoli.
 */
export async function salvaPartenza(_p: EsitoApp, dati: FormData): Promise<EsitoApp> {
  const utente = await utenteCollegato();
  if (!utente) return { errore: "Sessione scaduta. Rientra." };

  const nome = String(dati.get("comune") ?? "").trim();
  const comune = PARTENZE.find((p) => p.nome === nome);
  if (!comune) return { errore: "Scegli una città dalla lista." };

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("profili")
    .update({ comune: comune.nome, lat: comune.lat, lng: comune.lng })
    .eq("id", utente.id);

  if (error) return { errore: "Non sono riuscito a salvare. Riprova." };

  revalidatePath("/app");
  return { ok: `Parti da ${comune.nome}.` };
}

/** Crea una ricerca. È l'oggetto che il motore userà per avvisarti. */
export async function creaRicerca(_p: EsitoApp, dati: FormData): Promise<EsitoApp> {
  const utente = await utenteCollegato();
  if (!utente) return { errore: "Sessione scaduta. Rientra." };

  const budget = Number(dati.get("budget"));
  const ore = Number(dati.get("ore"));
  const notti_min = Number(dati.get("notti_min"));
  const notti_max = Number(dati.get("notti_max"));
  const persone = Number(dati.get("persone"));
  const tipi = dati.getAll("tipi").map(String).filter((t): t is Tipo => TIPI_AMMESSI.includes(t as Tipo));

  if (!dentro(budget, LIMITI.budget)) {
    return { errore: `Il budget deve stare fra ${LIMITI.budget.min}€ e ${LIMITI.budget.max}€ a persona.` };
  }
  if (!dentro(ore, LIMITI.ore)) return { errore: "Le ore di viaggio devono stare fra 0,5 e 8." };
  if (!dentro(notti_min, LIMITI.notti) || !dentro(notti_max, LIMITI.notti) || notti_min > notti_max) {
    return { errore: "Le notti non tornano: da 1 a 3, e il minimo non può superare il massimo." };
  }
  if (!dentro(persone, LIMITI.persone)) return { errore: "Le persone devono stare fra 1 e 8." };

  const supabase = await supabaseServer();

  // Senza partenza la ricerca non calcola niente: meglio dirlo subito.
  const { data: profilo } = await supabase
    .from("profili")
    .select("comune")
    .eq("id", utente.id)
    .single();
  if (!profilo?.comune) return { errore: "Prima dimmi da dove parti." };

  const { error } = await supabase.from("ricerche").insert({
    utente_id: utente.id,
    budget_max_persona: budget,
    ore_viaggio_max: ore,
    notti_min,
    notti_max,
    persone,
    tipi,
    attiva: true,
  });

  if (error) return { errore: "Non sono riuscito a salvare la ricerca. Riprova." };

  // Conferma per email della prima ricerca: non blocca il salvataggio.
  if (utente.email) {
    void ricercaAttiva(utente.email, {
      partenza: profilo.comune,
      budget,
      ore: `${Math.floor(ore)}h${ore % 1 ? String(Math.round((ore % 1) * 60)).padStart(2, "0") : ""}`,
      persone,
    }).then((e) => {
      if (!e.ok) console.warn("[creaRicerca] email non spedita:", e.motivo);
    });
  }

  revalidatePath("/app");
  return { ok: "Ricerca attiva. Ti avviso appena il conto torna." };
}

/**
 * Accende o spegne una ricerca.
 *
 * Non serve controllare che sia tua: la Row Level Security su `ricerche`
 * non fa passare le righe di altri. Il filtro `utente_id` qui sotto è una
 * seconda serratura, non l'unica.
 */
export async function cambiaStato(id: string, attiva: boolean): Promise<EsitoApp> {
  const utente = await utenteCollegato();
  if (!utente) return { errore: "Sessione scaduta. Rientra." };

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("ricerche")
    .update({ attiva })
    .eq("id", id)
    .eq("utente_id", utente.id);

  if (error) return { errore: "Non sono riuscito ad aggiornare." };
  revalidatePath("/app");
  return { ok: attiva ? "Riaccesa." : "Messa in pausa." };
}

/** Cancella una ricerca. */
export async function eliminaRicerca(id: string): Promise<EsitoApp> {
  const utente = await utenteCollegato();
  if (!utente) return { errore: "Sessione scaduta. Rientra." };

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("ricerche")
    .delete()
    .eq("id", id)
    .eq("utente_id", utente.id);

  if (error) return { errore: "Non sono riuscito a cancellare." };
  revalidatePath("/app");
  return { ok: "Cancellata." };
}
