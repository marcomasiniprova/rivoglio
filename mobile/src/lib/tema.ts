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
  /* I due colori presi dalla tavola di Claude Design (RIFERIMENTO-DESIGN):
     il verde acceso serve dove il `verde` normale sparisce, cioè sopra il
     verde notte; l'ambra è l'unico giallo che resta leggibile come TESTO
     dentro un riquadro tinto di sole. */
  verdeAcceso: "#12C375",
  ambra: "#A9791A",
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

/**
 * I raggi. Sono più di prima, ed è una scelta presa dalla tavola di
 * riferimento: là ce ne sono dodici, e ogni elemento ha il suo, perché il
 * raggio segue la dimensione. Un raggio unico su ogni cosa è uno dei
 * difetti che la skill art-director vieta, e il nostro tema ci stava
 * scivolando dentro.
 */
export const RAGGIO = {
  /** Bottoni rettangolari, come da DECISIONI (9px sul web, 10 qui: tocco). */
  bottone: 10,
  /** Elementi piccoli: chip, badge quadrati, icone in cornice. */
  minimo: 11,
  campo: 12,
  /** Riquadri interni a una scheda: note, avvisi, righe elencate. */
  interno: 16,
  scheda: 20,
  grande: 24,
  massimo: 28,
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

/**
 * Le ombre, ritarate sui valori della tavola di riferimento.
 *
 * Perché sono cambiate: le sue card sembrano APPOGGIATE, le nostre
 * sembravano incollate. Il motivo sta nello spread negativo del suo CSS
 * (`0 14px 30px -26px`), che stringe l'ombra sotto l'elemento invece di
 * spanderla intorno. React Native lo spread non ce l'ha, quindi
 * l'approssimazione è: offset più basso, raggio più corto, opacità un
 * po' più alta. È una traduzione dichiarata, non una conversione esatta
 * (il perché è scritto in RIFERIMENTO-DESIGN.md).
 */
export const OMBRA = {
  scheda: {
    shadowColor: COLORI.verdeNotte,
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  /** Per i blocchi che devono galleggiare sopra il resto. */
  sollevata: {
    shadowColor: COLORI.verdeNotte,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
  },
  bottone: {
    shadowColor: COLORI.verdeScuro,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;
