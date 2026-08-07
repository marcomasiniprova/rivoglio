"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { abbinaEInvia, raccogliLotto } from "@/lib/motore/esegui";

/**
 * Le azioni del pannello. OGNI azione ricontrolla da capo che chi chiama
 * sia admin: le server action sono endpoint pubblici con un altro vestito,
 * e fidarsi del fatto che "il bottone lo vede solo l'admin" è il modo
 * classico di farsi svuotare il database da una chiamata scritta a mano.
 */
async function soloAdmin(): Promise<string | null> {
  const utente = await utenteCollegato();
  if (!utente) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("profili").select("ruolo").eq("id", utente.id).single();
  return data?.ruolo === "admin" ? utente.id : null;
}

export type EsitoAdmin = { ok?: string; errore?: string; dettaglio?: string };

/** Promuove un'offerta da `demo` ad `attiva`: da adesso può generare destinazioni. */
export async function attivaOfferta(id: string): Promise<EsitoAdmin> {
  if (!(await soloAdmin())) return { errore: "Non sei autorizzato." };
  if (!SERVIZIO_ATTIVO) return { errore: "SUPABASE_SECRET_KEY assente." };

  const { error } = await supabaseServizio()
    .from("offerte")
    .update({ stato: "attiva", verificata_il: new Date().toISOString() })
    .eq("id", id)
    .eq("stato", "demo");

  if (error) return { errore: "Aggiornamento fallito." };
  revalidatePath("/admin");
  return { ok: "Attivata." };
}

/** Scarta un'offerta: link morto, prezzo sbagliato, spazzatura. */
export async function scartaOfferta(id: string): Promise<EsitoAdmin> {
  if (!(await soloAdmin())) return { errore: "Non sei autorizzato." };
  if (!SERVIZIO_ATTIVO) return { errore: "SUPABASE_SECRET_KEY assente." };

  const { error } = await supabaseServizio()
    .from("offerte")
    .update({ stato: "morta" })
    .eq("id", id);

  if (error) return { errore: "Aggiornamento fallito." };
  revalidatePath("/admin");
  return { ok: "Scartata." };
}

/** Un giro di raccolta, a mano. */
export async function lanciaRaccolta(): Promise<EsitoAdmin> {
  if (!(await soloAdmin())) return { errore: "Non sei autorizzato." };
  const r = await raccogliLotto();
  revalidatePath("/admin");
  return r.ok
    ? {
        ok: `Giro su ${r.comuni.join(", ")}: ${r.trovate} trovate, ${r.salvate} salvate, ${r.strutture} strutture in anagrafe.`,
      }
    : { errore: r.motivo };
}

/** Un giro di abbinamento e invio, a mano. */
export async function lanciaAbbinamento(): Promise<EsitoAdmin> {
  if (!(await soloAdmin())) return { errore: "Non sei autorizzato." };
  const r = await abbinaEInvia();
  revalidatePath("/admin");
  if (!r.ok) return { errore: r.motivo };
  const righe = r.esiti.map(
    (e) =>
      `${e.utente} → ${e.destinazione} (${e.totale}€): ${e.esito.ok ? `inviata via ${e.esito.canale}` : e.esito.motivo}`,
  );
  return {
    ok: `${r.ricercheAttive} ricerche, ${r.offerteAttive} offerte attive, ${r.esiti.length} invii tentati.`,
    dettaglio: righe.join("\n") || "Nessun abbinamento sopra il margine.",
  };
}
