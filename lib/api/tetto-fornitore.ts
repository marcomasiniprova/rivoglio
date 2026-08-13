import { supabaseServizio, SERVIZIO_ATTIVO } from "@/lib/supabase/servizio";
import { giornoDiRoma, oraDiRoma } from "@/lib/tempo";

/**
 * IL TETTO SUL PORTAFOGLIO: quante chiamate al fornitore dei dati di volo
 * si fanno in un'ora, in tutto il sito.
 *
 * 🔴 PERCHÉ NON BASTA IL FRENO PER IP. Quello conta le richieste di UN
 * indirizzo dentro UNA copia della funzione. Chi vuole farci male usa
 * cento indirizzi (costa pochi euro), e ognuno resta educatamente sotto
 * il suo tetto: il freno per IP non se ne accorge nemmeno, e intanto ogni
 * volo nuovo è una chiamata che paghiamo noi. Il freno condiviso su
 * Upstash chiuderebbe metà del problema, ma è spento finché non c'è
 * l'account, e comunque resta un tetto PER PERSONA.
 *
 * Questo invece è un tetto SULLA SPESA, e non gliene importa niente di
 * chi sta chiamando: sopra un certo numero di chiamate in un'ora si
 * smette, punto. È la differenza fra "questo signore esagera" e "oggi
 * abbiamo speso abbastanza".
 *
 * ⚠️ NON CONTA LE PERSONE, CONTA LE CHIAMATE. Nella riga non finisce
 * nessun indirizzo IP, nessun identificativo, niente: c'è l'ora e un
 * numero. È la stessa regola del registro (giro #56), e vale doppio qui,
 * perché un contatore per IP sul database sarebbe l'unico posto del sito
 * dove teniamo traccia di chi passa.
 *
 * ⚠️ SBAGLIA DALLA PARTE DI CHI PAGA. Se il conto non si riesce a fare
 * (database irraggiungibile, tabella non ancora creata) NON si blocca
 * nessuno. Un freno rotto che chiude il sito a tutti fa più danni del
 * freno assente: il primo ferma le vendite, il secondo costa qualche
 * euro di chiamate.
 *
 * ⚠️ IL CONTATORE VIVE UN'ORA. Le righe vecchie si potrebbero anche non
 * cancellare (sono minuscole), ma si cancellano lo stesso ogni tanto: un
 * database che cresce per sempre è un problema che arriva sempre nel
 * momento peggiore.
 */

/**
 * Quante chiamate al fornitore in un'ora prima di fermarsi.
 *
 * Da dove esce il numero: con la cache, un volo costa UNA chiamata anche
 * se lo controllano in duecento. Oggi il sito fa qualche decina di
 * analisi al giorno; mille voli DIVERSI in un'ora non è traffico, è
 * qualcuno che sta girando un elenco. Si alza con `TETTO_FORNITORE_ORA`
 * su Netlify il giorno che il traffico vero lo richiede.
 */
export const TETTO_ORA = (() => {
  const scritto = Number.parseInt(process.env.TETTO_FORNITORE_ORA ?? "", 10);
  return Number.isFinite(scritto) && scritto > 0 ? scritto : 1000;
})();

/**
 * L'ora corrente in Italia, "2026-08-13T21". È la chiave della riga.
 * Ora italiana e non UTC perché questo numero lo legge una persona nel
 * retrobottega, ed è la regola del progetto (`lib/tempo.ts`): le date che
 * vede qualcuno si scrivono nel fuso in cui vive.
 */
function chiaveOra(): string {
  return `${giornoDiRoma()}T${String(oraDiRoma()).padStart(2, "0")}`;
}

/** Vero quando la tabella del tetto non esiste ancora sul database. */
function tabellaMancante(messaggio: string): boolean {
  return /consumo_fornitore|does not exist|schema cache/i.test(messaggio);
}

export type EsitoTetto = {
  /** Vero quando si è già sopra il tetto: la chiamata non si fa. */
  chiuso: boolean;
  /** Quante chiamate risultano in questa ora. null = non si è potuto contare. */
  fatte: number | null;
};

/**
 * Segna una chiamata e dice se si può ancora chiamare.
 *
 * Un giro solo di database: la funzione `segna_chiamata_fornitore` fa
 * l'aumento e restituisce il totale. Farlo con due query (leggi, poi
 * scrivi) vorrebbe dire che due copie della funzione partite insieme
 * leggono lo stesso numero e scrivono lo stesso numero: il contatore
 * perderebbe colpi proprio quando servono, cioè sotto raffica.
 */
export async function segnaChiamataFornitore(): Promise<EsitoTetto> {
  if (!SERVIZIO_ATTIVO) return { chiuso: false, fatte: null };
  try {
    const { data, error } = await supabaseServizio().rpc("segna_chiamata_fornitore", {
      p_ora: chiaveOra(),
    });
    if (error) {
      if (!tabellaMancante(error.message)) {
        console.error("[tetto] conteggio non riuscito:", error.message);
      }
      return { chiuso: false, fatte: null };
    }
    const fatte = typeof data === "number" ? data : null;
    if (fatte === null) return { chiuso: false, fatte: null };
    return { chiuso: fatte > TETTO_ORA, fatte };
  } catch (e) {
    console.error("[tetto] conteggio non riuscito:", e);
    return { chiuso: false, fatte: null };
  }
}

/**
 * Quante chiamate si sono fatte nell'ora in corso, senza segnarne una.
 * Serve al retrobottega: guardare un numero non deve consumarlo.
 */
export async function chiamateDiQuestOra(): Promise<number | null> {
  if (!SERVIZIO_ATTIVO) return null;
  try {
    const { data, error } = await supabaseServizio()
      .from("consumo_fornitore")
      .select("chiamate")
      .eq("ora", chiaveOra())
      .maybeSingle();
    if (error) return null;
    return typeof data?.chiamate === "number" ? data.chiamate : 0;
  } catch {
    return null;
  }
}
