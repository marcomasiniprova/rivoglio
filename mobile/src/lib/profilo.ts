/**
 * IL PROFILO: nickname e adesione alla classifica.
 *
 * Il nickname è il nome PUBBLICO: serve solo alla classifica, e la
 * classifica è opt-in (scelta di Valerio, 8/08): chi non sceglie un nome
 * non compare mai. Lettura e scrittura passano dalla Row Level Security
 * ("modifico solo il mio profilo"), quindi qui non c'è nessun controllo
 * di proprietà da fare: il database lascia toccare solo la propria riga.
 */
import { DEMO } from "./dati";
import { supabase } from "./supabase";

export type Profilo = {
  nickname: string | null;
  classificaOptin: boolean;
};

/** 3-20 caratteri: lettere, numeri e trattino basso. Come nel database. */
export const NICKNAME_VALIDO = /^[A-Za-z0-9_]{3,20}$/;

let profiloDemo: Profilo = { nickname: null, classificaOptin: false };

/** Il profilo di chi è entrato, o null se la lettura fallisce. */
export async function leggiProfilo(): Promise<Profilo | null> {
  if (DEMO) return { ...profiloDemo };
  try {
    const { data: sessione } = await supabase.auth.getSession();
    const id = sessione.session?.user.id;
    if (!id) return null;

    const { data, error } = await supabase
      .from("profili")
      .select("nickname, classifica_optin")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.warn("[profilo] non letto:", error.message);
      return null;
    }
    return {
      nickname: (data?.nickname as string | null) ?? null,
      classificaOptin: Boolean(data?.classifica_optin),
    };
  } catch (e) {
    console.warn("[profilo] non letto:", e);
    return null;
  }
}

/**
 * Salva nome pubblico e adesione. Gli errori parlano italiano e dicono
 * cosa fare, mai un codice.
 */
export async function salvaProfilo(
  nickname: string | null,
  classificaOptin: boolean,
): Promise<{ ok: true } | { ok: false; errore: string }> {
  const pulito = nickname?.trim() || null;

  if (classificaOptin && !pulito) {
    return { ok: false, errore: "Per entrare in classifica scegli un nome pubblico." };
  }
  if (pulito && !NICKNAME_VALIDO.test(pulito)) {
    return {
      ok: false,
      errore: "Il nome pubblico va da 3 a 20 caratteri: lettere, numeri e trattino basso.",
    };
  }

  if (DEMO) {
    profiloDemo = { nickname: pulito, classificaOptin };
    return { ok: true };
  }

  try {
    const { data: sessione } = await supabase.auth.getSession();
    const id = sessione.session?.user.id;
    if (!id) return { ok: false, errore: "Devi prima entrare con la tua email." };

    const { error } = await supabase
      .from("profili")
      .update({ nickname: pulito, classifica_optin: classificaOptin })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return { ok: false, errore: "Questo nome è già preso. Provane un altro." };
      }
      if (error.code === "23514") {
        return {
          ok: false,
          errore: "Il nome pubblico va da 3 a 20 caratteri: lettere, numeri e trattino basso.",
        };
      }
      console.warn("[profilo] non salvato:", error.message);
      return { ok: false, errore: "Non sono riuscito a salvare. Riprova fra un attimo." };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[profilo] non salvato:", e);
    return { ok: false, errore: "Sei offline? Controlla la connessione e riprova." };
  }
}
