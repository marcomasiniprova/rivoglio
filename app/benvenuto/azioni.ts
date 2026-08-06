"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer, utenteCollegato } from "@/lib/supabase/server";
import { PARTENZE } from "@/lib/costruttore";
import type { Tipo } from "@/lib/destinazioni";
import { benvenuto } from "@/lib/email/messaggi";

const TIPI_AMMESSI: Tipo[] = ["mare", "monte", "citta", "terme"];

export type EsitoBenvenuto = { errore?: string };

/**
 * Chiude l'onboarding: salva il profilo e crea la prima ricerca, insieme.
 *
 * Insieme e non in due passaggi: se salvassi il profilo e poi fallisse la
 * ricerca, l'utente si troverebbe dentro l'app con metà onboarding fatto e
 * nessun modo di capire cosa manca. Meglio tutto o niente.
 *
 * I valori arrivano dal browser e quindi NON sono affidabili: le coordinate
 * si prendono dalla nostra lista partendo dal nome, e ogni numero viene
 * ricontrollato qui. Il modulo lato client è comodità, non sicurezza.
 */
export async function concludi(
  _p: EsitoBenvenuto,
  dati: FormData,
): Promise<EsitoBenvenuto> {
  const utente = await utenteCollegato();
  if (!utente) return { errore: "Sessione scaduta. Rientra." };

  const comune = PARTENZE.find((p) => p.nome === String(dati.get("comune") ?? ""));
  if (!comune) return { errore: "Scegli la città da cui parti." };

  const budget = Number(dati.get("budget"));
  const ore = Number(dati.get("ore"));
  const persone = Number(dati.get("persone"));
  const nottiMax = Number(dati.get("notti_max"));
  const tipi = dati
    .getAll("tipi")
    .map(String)
    .filter((t): t is Tipo => TIPI_AMMESSI.includes(t as Tipo));
  const telegram = String(dati.get("telegram") ?? "").trim() || null;

  if (!(budget >= 30 && budget <= 600)) return { errore: "Il budget deve stare fra 30€ e 600€." };
  if (!(ore >= 0.5 && ore <= 8)) return { errore: "Le ore devono stare fra 0,5 e 8." };
  if (!(persone >= 1 && persone <= 8)) return { errore: "Le persone devono stare fra 1 e 8." };
  if (!(nottiMax >= 1 && nottiMax <= 3)) return { errore: "Le notti devono stare fra 1 e 3." };

  const supabase = await supabaseServer();

  const { error: erroreProfilo } = await supabase
    .from("profili")
    .update({
      comune: comune.nome,
      lat: comune.lat,
      lng: comune.lng,
      tetto_settimanale: 3,
      ...(telegram ? { chat_telegram: telegram } : {}),
    })
    .eq("id", utente.id);

  if (erroreProfilo) return { errore: "Non sono riuscito a salvare. Riprova." };

  const { error: erroreRicerca } = await supabase.from("ricerche").insert({
    utente_id: utente.id,
    budget_max_persona: budget,
    ore_viaggio_max: ore,
    notti_min: 1,
    notti_max: nottiMax,
    persone,
    tipi,
    attiva: true,
  });

  if (erroreRicerca) return { errore: "Profilo salvato, ma la ricerca no. Riprova dall'app." };

  if (utente.email) {
    void benvenuto(utente.email).then((e) => {
      if (!e.ok) console.warn("[benvenuto] email non spedita:", e.motivo);
    });
  }

  revalidatePath("/app");
  redirect("/app?benvenuto=1");
}
