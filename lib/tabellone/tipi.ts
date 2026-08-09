/**
 * IL TABELLONE — il modello dei contenuti del blog (giro #40).
 *
 * Gli articoli sono dati tipizzati, non file Markdown. Il motivo è lo
 * stesso per cui il verdetto non lo scrive l'AI: un articolo che passa
 * dal compilatore non può contenere un tag rotto, un link vuoto o una
 * fonte mancante. E le prove possono guardarci dentro.
 *
 * I blocchi speciali (`check`, `confronto`, `osservatorio`) sono i
 * ganci di conversione: si mettono a METÀ articolo, dove il lettore ha
 * appena capito quanto è complicato farselo da solo.
 *
 * Formato inline nei testi, volutamente minimo:
 *   **grassetto**            → <strong>
 *   [testo](https://...)     → <a> esterno (rel nofollow non serve: sono fonti)
 *   [testo](/percorso)       → <a> interno
 */

/** Un blocco del corpo dell'articolo. */
export type Blocco =
  | { tipo: "p"; testo: string }
  | { tipo: "h2"; testo: string }
  | { tipo: "h3"; testo: string }
  | { tipo: "elenco"; voci: string[] }
  | { tipo: "passi"; voci: string[] }
  | { tipo: "citazione"; testo: string; fonte?: string }
  | { tipo: "tabella"; intestazioni: string[]; righe: string[][] }
  | { tipo: "nota"; titolo: string; testo: string }
  /** Il gancio: la scheda "controlla il tuo volo", dentro il testo. */
  | { tipo: "check"; titolo?: string; testo?: string }
  /** Il danno visivo: quanto ti trattiene un portale a percentuale. */
  | { tipo: "confronto"; compensazione?: 250 | 400 | 600 }
  /** L'invito all'Osservatorio: il blog che alimenta la newsletter. */
  | { tipo: "osservatorio" }
  | { tipo: "faq"; voci: { domanda: string; risposta: string }[] };

/** I tag sono un insieme chiuso: sono le pagine cluster, non etichette libere. */
export const TAG = {
  diritti: "Diritti",
  ritardo: "Ritardo",
  cancellazione: "Cancellazione",
  compagnie: "Compagnie",
  scioperi: "Scioperi",
  rimborsi: "Rimborsi",
  aeroporti: "Aeroporti",
  dati: "Dati",
  guida: "Guida",
  emergenza: "In aeroporto",
} as const;

export type ChiaveTag = keyof typeof TAG;

/**
 * Il tipo dice a cosa SERVE l'articolo, non di cosa parla:
 *  pilastro   la guida lunga su cui si appoggiano gli altri
 *  compagnia  il pezzo verticale su una compagnia
 *  situazione il pezzo verticale su un caso (prescrizione, coincidenza...)
 *  emergenza  si legge in piedi, in aeroporto, dal telefono
 *  dati       i numeri, con le fonti aperte: e' il materiale per la stampa
 */
export type TipoArticolo =
  | "pilastro"
  | "compagnia"
  | "situazione"
  | "emergenza"
  | "dati";

export type Fonte = { titolo: string; url: string };

export type Articolo = {
  /** L'indirizzo: /tabellone/<slug>. Non si cambia mai dopo la pubblicazione. */
  slug: string;
  /** L'H1 della pagina. Può essere più lungo del titolo SEO. */
  titolo: string;
  /** Il <title> del browser e di Google: sotto i 60 caratteri. */
  titoloSeo: string;
  /** La meta description: fra 120 e 160 caratteri. */
  descrizione: string;
  /** Le due righe sotto il titolo nelle card. */
  estratto: string;
  /** Data di pubblicazione, ISO (AAAA-MM-GG). */
  data: string;
  /** Data dell'ultima revisione, se diversa. Google la mostra. */
  aggiornato?: string;
  tipo: TipoArticolo;
  tag: ChiaveTag[];
  /** La chiave della copertina disegnata (components/tabellone/Copertine). */
  copertina: string;
  /**
   * Il percorso di una FOTO vera, quando ci sarà: `/assets/tabellone/x.webp`.
   * Se c'è, vince sulla copertina disegnata. È l'unico campo da toccare
   * il giorno in cui Valerio genera le immagini coi prompt consegnati.
   */
  foto?: string;
  /** Minuti di lettura, dichiarati a mano: un conto automatico mente. */
  minuti: number;
  corpo: Blocco[];
  /** Ogni numero dell'articolo deve poter tornare a una di queste. */
  fonti: Fonte[];
  /** Gli altri articoli del cluster: è il collante SEO dell'hub and spoke. */
  correlati?: string[];
  /** In evidenza: il primo entra nel riquadro grande della home. */
  inEvidenza?: boolean;
};
