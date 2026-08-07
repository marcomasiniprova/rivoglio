/**
 * Il tema dell'app. UNICA fonte di verità per colori, raggi, spazi e caratteri.
 *
 * Gli stessi valori di `app/globals.css` del sito (BRAND.md li spiega):
 * se un colore cambia, cambia prima lì e poi qui. Niente valori sparsi
 * nelle schermate: se un numero di stile non viene da qui, è un errore.
 */

export const COLORI = {
  verde: "#0A9D5C",
  verdeScuro: "#067A46",
  verdeNotte: "#052E1F",
  menta: "#7FE8AE",
  mentaTenue: "#E6FAF0",
  nebbia: "#F6F8FA",
  nebbia2: "#EEF2F5",
  bordo: "#E4E9EE",
  inchiostro: "#0A0A0A",
  fumo: "#6B7280",
  fumo2: "#9AA4B0",
  sole: "#F5C451",
  bianco: "#FFFFFF",
  /** Solo per i messaggi di errore. */
  errore: "#C2410C",
  erroreTenue: "#FEF2ED",
} as const;

/** Sfondi delle card destinazione, per tipo. Niente foto finte: colore e tipografia. */
export const TINTE_TIPO = {
  mare: { fondo: "#DCF1F7", testo: "#0B5D74", nome: "Mare" },
  monte: { fondo: "#E3F2E1", testo: "#2F5D2A", nome: "Montagna" },
  citta: { fondo: "#F3EBDD", testo: "#7A5A1E", nome: "Città" },
  terme: { fondo: "#EFE7F6", testo: "#5B3E82", nome: "Terme" },
} as const;

export const RAGGIO = {
  /** Bottoni rettangolari, come da DECISIONI (9px sul web, 10 qui: tocco). */
  bottone: 10,
  campo: 12,
  scheda: 20,
  grande: 28,
  pillola: 999,
} as const;

export const SPAZIO = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  schermata: 20,
} as const;

/**
 * I caratteri del marchio. Si caricano nel layout radice con
 * `useFonts` (vedi PROGETTO.md); questi sono i nomi da usare negli stili.
 */
export const FONT = {
  /** Titoli. Peso 500, mai grassetto pieno (BRAND.md). */
  display: "Geist_500Medium",
  testo: "Poppins_400Regular",
  testoMedio: "Poppins_500Medium",
  testoSemi: "Poppins_600SemiBold",
  /** La parola in corsivo dentro i titoli. */
  corsivo: "InstrumentSerif_400Regular_Italic",
} as const;

export const OMBRA = {
  scheda: {
    shadowColor: COLORI.verdeNotte,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  bottone: {
    shadowColor: COLORI.verdeScuro,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;
