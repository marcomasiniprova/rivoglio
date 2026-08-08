/**
 * I VOLI DELL'UTENTE, salvati sul telefono.
 *
 * Scelta di Valerio (8/08, popup): i voli li aggiunge la persona, una
 * volta sola, e restano. Niente casella email da collegare, niente
 * permessi strani: si scrive il volo, l'app se lo ricorda.
 *
 * Perché sul telefono e non sul server: il check non richiede account, e
 * un volo salvato non deve costringere a registrarsi. Quando l'utente
 * entrerà, questi voli si potranno portare sul suo profilo (è il pezzo
 * delle notifiche, che arriva dopo).
 *
 * Regola dura: qui dentro NON si decide niente. L'esito è quello che ha
 * detto il motore sul server, copiato com'è, con la data in cui l'ha
 * detto. Se un volo non è ancora atterrato, l'esito resta vuoto: meglio
 * un campo vuoto che un verdetto inventato.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHIAVE = "rivoglio.voli.v1";
const MASSIMO = 50;

export type EsitoSalvato = "idoneo" | "incerto" | "non_idoneo";

export type VoloSalvato = {
  /** "FR4001" */
  volo: string;
  /** "2026-08-06" */
  data: string;
  /** L'ultimo verdetto del motore. Null = non ancora controllato. */
  esito: EsitoSalvato | null;
  /** La frase del motore, come l'ha scritta lui. */
  motivo?: string;
  /** Fascia in euro, solo sugli idonei. */
  importo?: number;
  /** Minuti di ritardo all'arrivo, se il motore li ha dati. */
  ritardoMinuti?: number;
  /** Quando è stato controllato l'ultima volta (ISO). */
  controllatoIl?: string;
  /** Aggiunto il (ISO): serve solo a ordinare. */
  aggiuntoIl: string;
};

/** La chiave naturale di un volo: stesso numero, stesso giorno. */
const stesso = (a: { volo: string; data: string }, b: { volo: string; data: string }) =>
  a.volo.toUpperCase() === b.volo.toUpperCase() && a.data === b.data;

/** Tutti i voli salvati, il più recente per primo. Mai un'eccezione. */
export async function leggiVoli(): Promise<VoloSalvato[]> {
  try {
    const grezzo = await AsyncStorage.getItem(CHIAVE);
    if (!grezzo) return [];
    const lista = JSON.parse(grezzo) as VoloSalvato[];
    if (!Array.isArray(lista)) return [];
    return lista.filter((v) => typeof v?.volo === "string" && typeof v?.data === "string");
  } catch (e) {
    console.warn("[voli] non riesco a leggere i voli salvati:", e);
    return [];
  }
}

async function scrivi(lista: VoloSalvato[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHIAVE, JSON.stringify(lista.slice(0, MASSIMO)));
  } catch (e) {
    console.warn("[voli] non riesco a salvare i voli:", e);
  }
}

/**
 * Salva un volo (o aggiorna il suo esito se c'era già).
 * Torna la lista aggiornata, così la schermata la mostra senza rileggere.
 */
export async function salvaVolo(nuovo: VoloSalvato): Promise<VoloSalvato[]> {
  const lista = await leggiVoli();
  const senzaDoppione = lista.filter((v) => !stesso(v, nuovo));
  const aggiornata = [nuovo, ...senzaDoppione];
  await scrivi(aggiornata);
  return aggiornata;
}

/** Toglie un volo dalla lista. */
export async function togliVolo(volo: string, data: string): Promise<VoloSalvato[]> {
  const lista = await leggiVoli();
  const aggiornata = lista.filter((v) => !stesso(v, { volo, data }));
  await scrivi(aggiornata);
  return aggiornata;
}
