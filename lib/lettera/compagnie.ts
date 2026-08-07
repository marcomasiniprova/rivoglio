/**
 * I canali reclamo UFFICIALI delle compagnie che operano di più in Italia.
 * Strato 5 (generazione documenti): la lettera va spedita al canale giusto
 * del vettore OPERATIVO, perché l'errore n.1 dei reclami respinti è
 * scriverla a chi ha venduto il biglietto invece che a chi ha volato.
 *
 * COME È STATO VERIFICATO (2026-08-07):
 * ogni voce nasce da una ricerca web fatta il 2026-08-07. La sandbox non
 * apre i siti delle compagnie (rete in uscita bloccata), quindi:
 * - `verificato: true`  = l'URL del canale reclami compare nell'indice di
 *   ricerca SUL DOMINIO UFFICIALE della compagnia. È un URL reale, non
 *   dedotto e non inventato.
 * - `verificato: false` = il canale è riportato solo da fonti secondarie,
 *   o è la pagina assistenza generica: prima dell'invio va ricontrollato
 *   sul sito della compagnia. L'interfaccia lo dice all'utente.
 * Regola dura: MAI un indirizzo inventato. Se non c'è certezza, si scrive
 * il canale generico e `verificato: false`.
 */

export type CanaleCompagnia = {
  /** Codice IATA del vettore ("FR"). */
  iata: string;
  /** Nome commerciale ("Ryanair"). */
  nome: string;
  /** Ragione sociale per l'intestazione della lettera. */
  nomeLegale: string;
  /** Il canale reclami, in una riga: cosa fare. */
  canale: string;
  /** Dove: URL del modulo o della pagina assistenza. */
  url: string;
  /** Email reclami pubblicata dalla compagnia, se trovata con certezza. */
  email: string | null;
  /** PEC pubblica, se trovata con certezza. */
  pec: string | null;
  /** true solo se l'URL del canale è sul dominio ufficiale (vedi sopra). */
  verificato: boolean;
  /** Giorno della verifica, formato ISO. */
  verificatoIl: string;
  /** Da dove viene il dato, per poterlo ricontrollare. */
  fonte: string;
  /** Stringhe (MAIUSCOLE) per agganciare `vettore_operativo` o il codice volo. */
  chiavi: string[];
};

export const VERIFICATO_IL = "2026-08-07";

export const COMPAGNIE: CanaleCompagnia[] = [
  {
    iata: "FR",
    nome: "Ryanair",
    nomeLegale: "Ryanair DAC",
    canale:
      "Modulo EU261 nel centro assistenza ufficiale (sezione Passenger Rights). Ryanair accetta solo reclami inviati direttamente dal passeggero.",
    url: "https://help.ryanair.com/hc/en-us/articles/360017825538-EU-261-Passenger-Rights",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: articolo 'EU-261 Passenger Rights' sul dominio ufficiale help.ryanair.com, con il modulo EU261 per ritardi oltre 3 ore e cancellazioni.",
    // Il gruppo Ryanair vola con numeri FR anche via Malta Air, Lauda e
    // Buzz: il canale reclami del gruppo è quello di Ryanair.
    chiavi: ["RYANAIR", "MALTA AIR", "LAUDA", "BUZZ"],
  },
  {
    iata: "U2",
    nome: "easyJet",
    nomeLegale: "easyJet Airline Company Limited (in UE opera easyJet Europe Airline GmbH)",
    canale:
      "Modulo assistenza sul sito ufficiale: sezione aiuto, pagina ritardi e cancellazioni, modulo di reclamo EC261.",
    url: "https://www.easyjet.com/en/help/boarding-and-flying/delays-and-cancellations",
    email: null,
    pec: null,
    verificato: false,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: la pagina ufficiale dei diritti (easyjet.com/en/terms-and-conditions/notice-of-rights-for-flight-delays-and-cancellations) rimanda a questa pagina di aiuto; l'URL esatto del modulo non è confermato sul dominio ufficiale, quindi va ricontrollato prima dell'invio.",
    chiavi: ["EASYJET"],
  },
  {
    iata: "W6",
    nome: "Wizz Air",
    nomeLegale: "Wizz Air Hungary Ltd.",
    canale:
      "Modulo reclami online nel centro assistenza ufficiale, sezione Claims and Compensation (regolamento EC261).",
    url: "https://www.wizzair.com/en-gb/help-centre/my-wizz-account/claims-and-compensation",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: pagina 'Claims and Compensation' e articolo 'EC261 regulation' sul dominio ufficiale wizzair.com.",
    chiavi: ["WIZZ"],
  },
  {
    iata: "AZ",
    nome: "ITA Airways",
    nomeLegale: "Italia Trasporto Aereo S.p.A.",
    canale: "Portale reclami ufficiale della compagnia (modulo online).",
    url: "https://www.complaint.ita-airways.com/s/complaint",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: portale sul sottodominio ufficiale complaint.ita-airways.com. Fonti secondarie riportano anche l'email reclami@ita-airways.com per i residenti in Italia, ma non è confermata sul sito ufficiale e quindi non la registriamo.",
    chiavi: ["ITA AIRWAYS", "ITALIA TRASPORTO AEREO"],
  },
  {
    iata: "VY",
    nome: "Vueling",
    nomeLegale: "Vueling Airlines S.A.",
    canale:
      "Modulo di reclamo e rimborso nel centro assistenza ufficiale (articoli 'Reclamación y reembolsos' e 'Poner una queja').",
    url: "https://help.vueling.com/hc/es/articles/19798807271441-Reclamaci%C3%B3n-y-reembolsos",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: articoli sul dominio ufficiale help.vueling.com (19798807271441 reclami e rimborsi, 19854095362449 presentare una queja).",
    chiavi: ["VUELING"],
  },
  {
    iata: "V7",
    nome: "Volotea",
    nomeLegale: "Volotea, S.L.",
    canale:
      "Modulo reclami sul sito ufficiale: è l'unico canale che Volotea garantisce di lavorare (non telefono, non social).",
    url: "https://www.volotea.com/en/complaints/",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: articolo ufficiale volotea.com/en/contact/article/12733227011997 ('For what reasons can I submit an official complaint?') che indica il modulo come unico canale. Ragione sociale e codice IATA V7 confermati dal registro LEI e dai profili di settore.",
    chiavi: ["VOLOTEA"],
  },
  {
    iata: "XZ",
    nome: "Aeroitalia",
    nomeLegale: "Aeroitalia S.r.l.",
    canale:
      "Modulo assistenza sul sito ufficiale (form di contatto: apre un ticket numerato).",
    url: "https://www.aeroitalia.com/en/contact_form",
    email: null,
    pec: null,
    verificato: false,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: form di contatto sul dominio ufficiale aeroitalia.com. Fonti secondarie riportano l'email customersupport@aeroitalia.com e nessuna PEC pubblica: non confermate sul sito ufficiale, quindi il canale resta da ricontrollare prima dell'invio.",
    chiavi: ["AEROITALIA"],
  },
  {
    iata: "LH",
    nome: "Lufthansa",
    nomeLegale: "Deutsche Lufthansa AG",
    canale:
      "Modulo ufficiale 'Compensation in the event of flight irregularities' (il prefisso paese/lingua nell'URL cambia in base al mercato).",
    url: "https://www.lufthansa.com/mk/en/compensation-in-the-event-of-flight-irregularities",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: pagina del modulo sul dominio ufficiale lufthansa.com; la pagina dei diritti del passeggero (lufthansa.com/us/en/passenger-rights) la richiama.",
    chiavi: ["LUFTHANSA"],
  },
  {
    iata: "AF",
    nome: "Air France",
    nomeLegale: "Société Air France S.A.",
    canale:
      "Pagina ufficiale 'Assistenza e indennizzo' (diritti dei passeggeri) con il modulo di reclamo per la compensazione EU261.",
    url: "https://wwws.airfrance.fr/en/information/legal/assistance-et-indemnisation",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: pagina 'assistance-et-indemnisation' sul dominio ufficiale wwws.airfrance.fr (esiste anche la variante wwws.airfrance.us; il mercato nell'URL cambia).",
    chiavi: ["AIR FRANCE"],
  },
  {
    iata: "KL",
    nome: "KLM",
    nomeLegale: "Koninklijke Luchtvaart Maatschappij N.V. (KLM Royal Dutch Airlines)",
    canale:
      "Pagina ufficiale 'Compensation and reimbursement for delay' nella sezione rimborsi e compensazioni, con il modulo di richiesta.",
    url: "https://www.klm.com/information/refund-compensation/compensation",
    email: null,
    pec: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-07: pagina sul dominio ufficiale klm.com (sezione information/refund-compensation), richiamata anche dalla pagina 'Passenger Rights' di klm.com.",
    chiavi: ["KLM", "ROYAL DUTCH"],
  },
];

/**
 * Trova la compagnia dal `vettore_operativo` della cache voli, o dal
 * numero del volo ("FR8321" ha il codice IATA nelle prime due lettere).
 *
 * Ordine: prima il confronto col codice IATA esatto, poi le chiavi di
 * nome. Le chiavi si confrontano dalla più lunga alla più corta, così
 * "ITA AIRWAYS" non viene mai mangiata da una sottostringa più generica.
 * Torna `null` se non c'è aggancio certo: meglio nessun destinatario che
 * il destinatario sbagliato.
 */
export function compagniaPerVettore(
  vettoreONumero: string | null | undefined,
): CanaleCompagnia | null {
  if (!vettoreONumero) return null;
  const testo = vettoreONumero.trim().toUpperCase();
  if (!testo) return null;

  // Codice IATA secco ("FR") o numero di volo ("FR8321").
  const codice = /^([A-Z0-9]{2})\d{1,4}[A-Z]?$/.exec(testo)?.[1] ?? testo;
  const perIata = COMPAGNIE.find((c) => c.iata === codice);
  if (perIata) return perIata;

  // Nome del vettore, per aggancio di sottostringa.
  const coppie = COMPAGNIE.flatMap((c) => c.chiavi.map((chiave) => ({ chiave, c })));
  coppie.sort((a, b) => b.chiave.length - a.chiave.length);
  for (const { chiave, c } of coppie) {
    if (testo.includes(chiave)) return c;
  }
  return null;
}
