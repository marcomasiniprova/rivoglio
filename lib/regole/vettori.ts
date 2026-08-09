/**
 * DI CHE PAESE È LA LICENZA DI QUESTA COMPAGNIA.
 *
 * Serve a una domanda sola, e solo in un caso: quando si parte da un
 * paese fuori dall'Europa e si arriva in Europa, il Regolamento si
 * applica soltanto se chi ha OPERATO il volo ha licenza europea
 * (art. 3, par. 1, lett. b). Se non sappiamo rispondere, il caso resta
 * incerto: e un incerto non si vende, ma soprattutto lascia l'utente
 * senza risposta.
 *
 * Prima di questa tabella, un New York → Roma con Delta usciva incerto:
 * non perché il caso sia dubbio (non è coperto, ed è pacifico), ma
 * perché il codice non sapeva che Delta è americana. Un "no" chiaro non
 * fa incassare niente, ma è la risposta giusta, e una risposta giusta
 * è quello che vendiamo.
 *
 * ⚠️ QUI DENTRO CI VANNO SOLO COMPAGNIE DI CUI SIAMO CERTI. Il rischio
 * non è simmetrico:
 *  - scrivere "non è europea" una compagnia che invece lo è = un volo
 *    coperto dichiarato non coperto (una risposta sbagliata e una
 *    vendita persa);
 *  - scrivere "è europea" una che non lo è = un falso positivo, cioè
 *    esattamente quello che la regola numero uno del progetto vieta.
 * Nel dubbio la compagnia NON si aggiunge: resta incerto, come prima.
 *
 * Il dato è il paese della sede legale della compagnia, cioè lo Stato
 * che le rilascia la licenza di esercizio: è pubblico, stabile, e non
 * cambia da un anno all'altro. Le compagnie europee non stanno qui:
 * quelle hanno già la loro scheda completa in `lib/lettera/compagnie.ts`,
 * con canale reclami e indirizzo verificati.
 */

/**
 * Codice IATA → nome e paese della licenza (ISO a due lettere).
 * Raggruppate per area, così si vede al volo cosa manca. Il nome serve
 * a farlo scegliere all'utente: nessuno sa che Delta si scrive "DL".
 */
export const VETTORI: Record<string, { nome: string; paese: string }> = {
  // ---- Stati Uniti
  DL: { nome: "Delta Air Lines", paese: "US" },
  UA: { nome: "United Airlines", paese: "US" },
  AA: { nome: "American Airlines", paese: "US" },
  B6: { nome: "JetBlue Airways", paese: "US" },
  AS: { nome: "Alaska Airlines", paese: "US" },
  WN: { nome: "Southwest Airlines", paese: "US" },
  // ---- Canada
  AC: { nome: "Air Canada", paese: "CA" },
  WS: { nome: "WestJet", paese: "CA" },
  // ---- Regno Unito: fuori dall'Unione dalla Brexit (ha la sua UK261)
  BA: { nome: "British Airways", paese: "GB" },
  VS: { nome: "Virgin Atlantic", paese: "GB" },
  LS: { nome: "Jet2", paese: "GB" },
  BY: { nome: "TUI Airways", paese: "GB" },
  // ---- Golfo e Medio Oriente
  EK: { nome: "Emirates", paese: "AE" },
  EY: { nome: "Etihad Airways", paese: "AE" },
  QR: { nome: "Qatar Airways", paese: "QA" },
  SV: { nome: "Saudia", paese: "SA" },
  GF: { nome: "Gulf Air", paese: "BH" },
  KU: { nome: "Kuwait Airways", paese: "KW" },
  WY: { nome: "Oman Air", paese: "OM" },
  RJ: { nome: "Royal Jordanian", paese: "JO" },
  ME: { nome: "Middle East Airlines", paese: "LB" },
  LY: { nome: "El Al", paese: "IL" },
  // ---- Turchia
  TK: { nome: "Turkish Airlines", paese: "TR" },
  PC: { nome: "Pegasus Airlines", paese: "TR" },
  // ---- Africa
  MS: { nome: "EgyptAir", paese: "EG" },
  ET: { nome: "Ethiopian Airlines", paese: "ET" },
  AT: { nome: "Royal Air Maroc", paese: "MA" },
  TU: { nome: "Tunisair", paese: "TN" },
  AH: { nome: "Air Algérie", paese: "DZ" },
  KQ: { nome: "Kenya Airways", paese: "KE" },
  SA: { nome: "South African Airways", paese: "ZA" },
  // ---- Asia
  SQ: { nome: "Singapore Airlines", paese: "SG" },
  CX: { nome: "Cathay Pacific", paese: "HK" },
  NH: { nome: "ANA", paese: "JP" },
  JL: { nome: "Japan Airlines", paese: "JP" },
  KE: { nome: "Korean Air", paese: "KR" },
  OZ: { nome: "Asiana Airlines", paese: "KR" },
  CA: { nome: "Air China", paese: "CN" },
  MU: { nome: "China Eastern", paese: "CN" },
  CZ: { nome: "China Southern", paese: "CN" },
  HU: { nome: "Hainan Airlines", paese: "CN" },
  TG: { nome: "Thai Airways", paese: "TH" },
  MH: { nome: "Malaysia Airlines", paese: "MY" },
  GA: { nome: "Garuda Indonesia", paese: "ID" },
  AI: { nome: "Air India", paese: "IN" },
  "6E": { nome: "IndiGo", paese: "IN" },
  UL: { nome: "SriLankan Airlines", paese: "LK" },
  PR: { nome: "Philippine Airlines", paese: "PH" },
  BR: { nome: "EVA Air", paese: "TW" },
  CI: { nome: "China Airlines", paese: "TW" },
  VN: { nome: "Vietnam Airlines", paese: "VN" },
  // ---- Oceania
  QF: { nome: "Qantas", paese: "AU" },
  NZ: { nome: "Air New Zealand", paese: "NZ" },
  // ---- America Latina
  LA: { nome: "LATAM Airlines", paese: "CL" },
  AV: { nome: "Avianca", paese: "CO" },
  AM: { nome: "Aeroméxico", paese: "MX" },
  CM: { nome: "Copa Airlines", paese: "PA" },
  AD: { nome: "Azul", paese: "BR" },
  G3: { nome: "GOL", paese: "BR" },
  AR: { nome: "Aerolíneas Argentinas", paese: "AR" },
  // ---- Europa non Unione
  SU: { nome: "Aeroflot", paese: "RU" },
  JU: { nome: "Air Serbia", paese: "RS" },
  /* La Svizzera è un caso a parte e resta INCERTO di proposito: applica
     il Regolamento per accordo bilaterale, non come Stato membro, e
     senza una fonte verificata non ci sbilanciamo. Il codice CH finisce
     nella lista dei paesi incerti dentro `territorio.ts`. */
  LX: { nome: "Swiss International Air Lines", paese: "CH" },
  WK: { nome: "Edelweiss Air", paese: "CH" },
  GM: { nome: "Chair Airlines", paese: "CH" },
};

/**
 * Il paese della licenza, dal codice IATA o dal numero di volo.
 * `null` quando la compagnia non è in tabella: non si indovina.
 */
export function paeseVettore(vettoreONumero: string | null | undefined): string | null {
  return vettoreExtra(vettoreONumero)?.paese ?? null;
}

/** La scheda breve, dal codice IATA o dal numero di volo. */
export function vettoreExtra(
  vettoreONumero: string | null | undefined,
): { iata: string; nome: string; paese: string } | null {
  const testo = (vettoreONumero ?? "").trim().toUpperCase();
  if (!testo) return null;
  /* Dal numero di volo si prende il prefisso: "DL 402" → "DL". I codici
     IATA delle compagnie sono di due caratteri e uno può essere una
     cifra (6E di IndiGo), per questo non basta cercare due lettere. */
  const codice = testo.replace(/\s+/g, "").slice(0, 2);
  const riga = VETTORI[codice];
  return riga ? { iata: codice, ...riga } : null;
}
