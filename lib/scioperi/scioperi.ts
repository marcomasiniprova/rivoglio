/**
 * Gli scioperi del trasporto aereo, dal database.
 *
 * La tabella `scioperi` si popola A Mano dalle fonti pubbliche
 * (Commissione di Garanzia Scioperi cgsse.it, cruscotto MIT, ENAC):
 * non esiste un'API, ed è giusto così, la lista è corta e cambia piano.
 *
 * Uso nel motore (regola v1 di Valerio, 8/08): se il giorno del volo
 * coincide con uno sciopero aereo noto e il ritardo è sopra soglia,
 * il verdetto è INCERTO: chi scioperava (personale di compagnia contro
 * ATC esterno) decide l'esito, e lo decide un umano in admin.
 *
 * FAIL-OPEN dichiarato: se il database non risponde, il check non muore
 * e si procede SENZA il flag sciopero. Il rischio residuo (vendere in un
 * giorno di sciopero non rilevato) è coperto dallo shadow mode: ogni
 * verdetto passa comunque dalla conferma umana finché è acceso.
 */
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

export type Sciopero = {
  data: string;
  settore: string;
  descrizione: string;
  compagnie: string[];
  tipo: "personale_compagnia" | "atc_esterno" | "handling" | "generale" | "altro";
  fonteUrl: string;
};

/**
 * C'è uno sciopero del trasporto aereo nel giorno dato?
 * `compagnia` (IATA) restringe: uno sciopero di SOLO un'altra compagnia
 * non sporca il verdetto; uno generale o ATC vale per tutti.
 */
export async function scioperoInData(
  dataLocale: string,
  compagniaIata?: string | null,
): Promise<boolean> {
  if (!SERVIZIO_ATTIVO) return false;
  try {
    const { data, error } = await supabaseServizio()
      .from("scioperi")
      .select("compagnie, tipo")
      .eq("data", dataLocale);
    if (error || !data) return false;
    const iata = (compagniaIata ?? "").toUpperCase();
    return data.some((riga) => {
      const compagnie = (riga.compagnie ?? []) as string[];
      // sciopero generale, ATC o di settore: tocca tutti i voli del giorno
      if (compagnie.length === 0) return true;
      return iata !== "" && compagnie.map((c) => c.toUpperCase()).includes(iata);
    });
  } catch {
    return false;
  }
}
