"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";

export type EsitoApp = { errore?: string; ok?: string };

/** 3-20 caratteri: lettere, numeri e trattino basso. Come nel database. */
const NICKNAME_VALIDO = /^[A-Za-z0-9_]{3,20}$/;

/**
 * Dati personali della web app: nome pubblico e adesione alla classifica.
 * Stesse regole dell'app sul telefono (opt-in, formato controllato due
 * volte: qui e dal vincolo del database). La RLS lascia toccare solo la
 * propria riga.
 */
export async function salvaProfiloWeb(_p: EsitoApp, dati: FormData): Promise<EsitoApp> {
  const utente = await utenteCollegato();
  if (!utente) return { errore: "Sessione scaduta. Rientra." };

  const nickname = String(dati.get("nickname") ?? "").trim() || null;
  const optin = dati.get("classifica") === "on";

  if (optin && !nickname) {
    return { errore: "Per entrare in classifica scegli un nome pubblico." };
  }
  if (nickname && !NICKNAME_VALIDO.test(nickname)) {
    return {
      errore: "Il nome pubblico va da 3 a 20 caratteri: lettere, numeri e trattino basso.",
    };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("profili")
    .update({ nickname, classifica_optin: optin })
    .eq("id", utente.id);
  if (error) {
    if (error.code === "23505") return { errore: "Questo nome è già preso. Provane un altro." };
    console.error("[app] profilo non salvato:", error.message);
    return { errore: "Non sono riuscito a salvare. Riprova fra un attimo." };
  }

  revalidatePath("/app");
  return { ok: "Salvato." };
}
