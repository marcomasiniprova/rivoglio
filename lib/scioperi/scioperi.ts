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
 * IL MOTORE PIÙ FURBO SUGLI SCIOPERI (Valerio, 15/08).
 *
 * Fino a ieri OGNI sciopero nel giorno del volo rendeva il verdetto
 * incerto (non si vende). Ma la Corte di giustizia UE, causa C-28/20
 * (Airhelp c. SAS), dice che uno sciopero del PERSONALE DELLA COMPAGNIA
 * STESSA non è una circostanza straordinaria: è parte del normale rischio
 * d'impresa, quindi la compensazione spetta. Uno sciopero dei controllori
 * di volo (ENAV/ATC) o degli addetti a terra (handling) invece viene da
 * fuori: lì resta incerto, perché la compagnia potrebbe davvero esserne
 * esente e serve l'occhio umano.
 *
 * Torna:
 *  - "compagnia": lo sciopero che tocca questo volo è SOLO del personale
 *    della compagnia che ha operato (e nessun altro sciopero esterno lo
 *    stesso giorno) → il motore può dire idoneo.
 *  - "esterno": c'è (anche) uno sciopero ATC/handling/generale che
 *    riguarda il volo → incerto, verifica umana.
 *  - null: nessuno sciopero che riguarda questo volo.
 *
 * ⚠️ PRUDENZA, perché un falso positivo è vietato: se lo stesso giorno
 * c'è ANCHE uno sciopero esterno che riguarda il volo, la causa del
 * ritardo non è certa e si torna a "esterno" (incerto). "compagnia" esce
 * solo quando la colpa è chiaramente e soltanto della compagnia.
 */
export type ClasseSciopero = "compagnia" | "esterno" | null;

/** Una riga di sciopero ridotta a quello che serve per classificare. */
export type RigaSciopero = { compagnie: string[] | null; tipo: Sciopero["tipo"] };

/**
 * LA DECISIONE, PURA E PROVABILE (senza database).
 *
 * È il pezzo che, se sbagliato, apre un falso positivo (uno sciopero ATC
 * scambiato per uno della compagnia = idoneo dove non spetta). Sta qui da
 * solo apposta, così una prova lo può battere con righe finte senza
 * toccare Supabase.
 */
export function classeDaRighe(righe: RigaSciopero[], compagniaIata?: string | null): ClasseSciopero {
  const iata = (compagniaIata ?? "").toUpperCase();
  let compagnia = false;
  let esterno = false;
  for (const r of righe) {
    const compagnie = (r.compagnie ?? []).map((c) => c.toUpperCase());
    const generale = compagnie.length === 0;
    const riguardaIlVolo = generale || (iata !== "" && compagnie.includes(iata));
    if (!riguardaIlVolo) continue; // sciopero di un'altra compagnia: non tocca

    /* "compagnia" SOLO se: è del personale di compagnia, ed è agganciato
       proprio a questo vettore (mai su un generale senza compagnie). In
       ogni altro caso è "esterno" o comunque non certo → prudenza. */
    if (r.tipo === "personale_compagnia" && !generale && iata !== "" && compagnie.includes(iata)) {
      compagnia = true;
    } else {
      esterno = true;
    }
  }
  if (esterno) return "esterno"; // un esterno lo stesso giorno vince: incerto
  if (compagnia) return "compagnia";
  return null;
}

export async function classificaSciopero(
  dataLocale: string,
  compagniaIata?: string | null,
): Promise<ClasseSciopero> {
  if (!SERVIZIO_ATTIVO) return null;
  try {
    const { data, error } = await supabaseServizio()
      .from("scioperi")
      .select("compagnie, tipo")
      .eq("data", dataLocale);
    if (error || !data) return null;
    return classeDaRighe(data as RigaSciopero[], compagniaIata);
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────
   LE PAGINE EVENTO (giro #41).

   Le stesse righe che servono al motore servono anche a farsi
   trovare: il giorno di uno sciopero la gente cerca "sciopero aerei
   oggi", non "reclamo Ryanair", e un blog non può avere un articolo
   per ogni giorno dell'anno. Queste funzioni alimentano
   /sciopero-aerei e /sciopero-aerei/<data>.

   FAIL-OPEN come sopra: senza database le pagine mostrano quello che
   sanno da sole (le regole, le fasce, il check) e non muoiono.
   ──────────────────────────────────────────────────────────────── */

/** Una riga della tabella, con l'identificativo: serve alle pagine. */
export type ScioperoPubblico = Sciopero & { id: string };

const CAMPI = "id, data, settore, descrizione, compagnie, tipo, fonte_url";

function riga(r: Record<string, unknown>): ScioperoPubblico {
  return {
    id: String(r.id),
    data: String(r.data),
    settore: String(r.settore ?? ""),
    descrizione: String(r.descrizione ?? ""),
    compagnie: (r.compagnie as string[] | null) ?? [],
    tipo: r.tipo as Sciopero["tipo"],
    fonteUrl: String(r.fonte_url ?? ""),
  };
}

/** Oggi in Italia, come lo scrive la tabella (AAAA-MM-GG). */
export function oggiInItalia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * ⚠️ `null` NON è la stessa cosa di lista vuota, ed è il motivo per cui
 * queste due funzioni non tornano un array e basta.
 *
 * Lista vuota = abbiamo letto il calendario e non c'è niente: possiamo
 * scrivere "oggi non risultano scioperi", ed è vero.
 * `null` = il calendario non si è aperto: NON possiamo scrivere niente
 * sul fatto che ci siano o non ci siano agitazioni, perché non lo
 * sappiamo. Dire "oggi non ci sono scioperi" quando il database è giù
 * è esattamente il tipo di certezza inventata che questo progetto vieta.
 */
export async function scioperiInArrivo(limite = 12): Promise<ScioperoPubblico[] | null> {
  if (!SERVIZIO_ATTIVO) return null;
  try {
    const { data, error } = await supabaseServizio()
      .from("scioperi")
      .select(CAMPI)
      .gte("data", oggiInItalia())
      .order("data", { ascending: true })
      .limit(limite);
    if (error || !data) return null;
    return data.map(riga);
  } catch {
    return null;
  }
}

/** Quelli già passati, dal più recente: servono all'archivio. */
export async function scioperiPassati(limite = 12): Promise<ScioperoPubblico[] | null> {
  if (!SERVIZIO_ATTIVO) return null;
  try {
    const { data, error } = await supabaseServizio()
      .from("scioperi")
      .select(CAMPI)
      .lt("data", oggiInItalia())
      .order("data", { ascending: false })
      .limit(limite);
    if (error || !data) return null;
    return data.map(riga);
  } catch {
    return null;
  }
}

/** Tutte le agitazioni di un giorno preciso. Vuoto = quel giorno non c'è. */
export async function scioperiDelGiorno(data: string): Promise<ScioperoPubblico[]> {
  if (!SERVIZIO_ATTIVO) return [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return [];
  try {
    const { data: righe, error } = await supabaseServizio()
      .from("scioperi")
      .select(CAMPI)
      .eq("data", data)
      .order("settore", { ascending: true });
    if (error || !righe) return [];
    return righe.map(riga);
  } catch {
    return [];
  }
}

/** Le date che hanno una pagina. Serve alla sitemap. */
export async function dateConSciopero(limite = 200): Promise<string[]> {
  if (!SERVIZIO_ATTIVO) return [];
  try {
    const { data, error } = await supabaseServizio()
      .from("scioperi")
      .select("data")
      .order("data", { ascending: false })
      .limit(limite);
    if (error || !data) return [];
    return [...new Set(data.map((r) => String(r.data)))];
  } catch {
    return [];
  }
}
