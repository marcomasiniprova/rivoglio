/**
 * I canali reclamo UFFICIALI delle 20 compagnie che operano di più in
 * Italia. Strato 5 (generazione documenti): la lettera va spedita al
 * canale giusto del vettore OPERATIVO, perché l'errore n.1 dei reclami
 * respinti è scriverla a chi ha venduto il biglietto invece che a chi
 * ha volato.
 *
 * COME È STATO VERIFICATO (2026-08-08, squadra di ricerca web):
 * la sandbox non apre i siti delle compagnie (rete in uscita bloccata),
 * quindi:
 * - `verificato: true`  = l'URL del canale reclami compare nell'indice
 *   di ricerca SUL DOMINIO UFFICIALE della compagnia. È un URL reale,
 *   non dedotto e non inventato.
 * - `verificato: false` = il canale è riportato solo da fonti secondarie
 *   o è la pagina assistenza generica: prima dell'invio va ricontrollato
 *   sul sito della compagnia. L'interfaccia lo dice all'utente.
 * Regola dura: MAI un indirizzo inventato. Email solo se vista su pagine
 * del dominio ufficiale; PEC solo se dal registro imprese. Se non c'è
 * certezza, il campo resta null e lo si dice nella fonte.
 *
 * `accettaIntermediari: false` è un dato STRATEGICO: quelle compagnie
 * (Ryanair, easyJet, Wizz Air, Volotea, Norwegian) dichiarano nelle
 * condizioni che lavorano solo il reclamo inviato direttamente dal
 * passeggero. È esattamente il modello di Rivolio: la lettera la invii
 * tu, e per quelle compagnie è anche l'unico modo.
 */

export type CanaleCompagnia = {
  /** Codice IATA del vettore ("FR"). */
  iata: string;
  /** Codice ICAO ("RYR"), utile a riconoscere il callsign. */
  icao: string | null;
  /** Nome commerciale ("Ryanair"). */
  nome: string;
  /** Ragione sociale per l'intestazione della lettera. */
  nomeLegale: string;
  /** Paese della sede legale, ISO 3166-1 alpha-2 ("IE"). */
  paese: string | null;
  /** Il canale reclami, in una riga: cosa fare. */
  canale: string;
  /** Dove: URL del modulo o della pagina assistenza. */
  url: string;
  /** Email reclami pubblicata su pagine del dominio ufficiale, se trovata. */
  email: string | null;
  /** PEC dal registro imprese (solo compagnie italiane), se trovata. */
  pec: string | null;
  /** Indirizzo postale pubblicato per i reclami o la sede legale. */
  indirizzoPostale: string | null;
  /**
   * false = la compagnia dichiara per iscritto di lavorare solo i reclami
   * inviati direttamente dal passeggero. null = nessuna policy trovata.
   */
  accettaIntermediari: boolean | null;
  /** true solo se l'URL del canale è sul dominio ufficiale (vedi sopra). */
  verificato: boolean;
  /** Giorno della verifica, formato ISO. */
  verificatoIl: string;
  /** Da dove viene il dato, per poterlo ricontrollare. */
  fonte: string;
  /** Stringhe (MAIUSCOLE) per agganciare `vettore_operativo` o il codice volo. */
  chiavi: string[];
};

export const VERIFICATO_IL = "2026-08-08";

export const COMPAGNIE: CanaleCompagnia[] = [
  /* ------------------------------------------------ le low cost del mercato Italia */
  {
    iata: "FR",
    icao: "RYR",
    nome: "Ryanair",
    nomeLegale: "Ryanair DAC",
    paese: "IE",
    canale:
      "Modulo EU261 nel centro assistenza ufficiale (sezione Passenger Rights). Ryanair lavora solo i reclami inviati direttamente dal passeggero: un reclamo di terzi senza il tuo reclamo diretto non viene processato (condizioni, art. 15.2.2).",
    url: "https://help.ryanair.com/hc/en-us/articles/360017825538-EU-261-Passenger-Rights",
    email: null,
    pec: null,
    indirizzoPostale: "Ryanair DAC, Airside Business Park, Swords, Co. Dublin, Irlanda",
    accettaIntermediari: false,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: articoli 'EU-261 Passenger Rights' e 'Applying for Compensation' su help.ryanair.com; modulo diretto onlineform.ryanair.com/ee/en/eu-261 (il segmento paese/lingua cambia). Policy anti-intermediari dalle T&C ufficiali, art. 15.2.2: 14 giorni alla compagnia prima di incaricare terzi, pagamento solo al passeggero.",
    // Il gruppo Ryanair vola con numeri FR anche via Malta Air, Lauda e
    // Buzz: il canale reclami del gruppo è quello di Ryanair.
    chiavi: ["RYANAIR", "MALTA AIR", "LAUDA", "BUZZ"],
  },
  {
    iata: "U2",
    icao: "EZY",
    nome: "easyJet",
    nomeLegale: "easyJet Airline Company Limited (in UE opera easyJet Europe Airline GmbH)",
    paese: "GB",
    canale:
      "Modulo EU261 dedicato sul sito ufficiale (per le spese c'è il modulo welfare separato). easyJet chiede il reclamo diretto del passeggero, con 28 giorni per rispondere prima di incaricare terzi.",
    url: "https://www.easyjet.com/en/claim/EU261",
    email: null,
    pec: null,
    indirizzoPostale:
      "easyJet Airline Company Limited, Hangar 89, London Luton Airport, Luton, Bedfordshire LU2 9PF, Regno Unito",
    accettaIntermediari: false,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: form easyjet.com/en/claim/EU261 e claim/welfare sul dominio ufficiale; T&C: reclami di terzi senza previo reclamo diretto non processati. Sede da Companies House n. 03034606.",
    chiavi: ["EASYJET"],
  },
  {
    iata: "W6",
    icao: "WZZ",
    nome: "Wizz Air",
    nomeLegale: "Wizz Air Hungary Zrt.",
    paese: "HU",
    canale:
      "Modulo reclami online con accesso all'account WIZZ (sezione Claims and Compensation; stato in 'Your Claims', risposta dichiarata entro 30 giorni). Molte rotte italiane sono operate da Wizz Air Malta: stesso canale.",
    url: "https://www.wizzair.com/en-gb/information-and-services/compliments-and-complaints",
    email: null,
    pec: null,
    indirizzoPostale: "Wizz Air Hungary Zrt., Kőér utca 2/A, 1103 Budapest, Ungheria",
    accettaIntermediari: false,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagina reclami e articolo 'EC261 regulation' sul dominio ufficiale wizzair.com. GCC art. 14.7.8/17.4.9: reclamo di terzi solo dopo reclamo diretto e con delega; portale separato per le claim companies (claim.wizzair.com).",
    chiavi: ["WIZZ"],
  },
  {
    iata: "AZ",
    icao: "ITY",
    nome: "ITA Airways",
    nomeLegale: "Italia Trasporto Aereo S.p.A.",
    paese: "IT",
    canale: "Portale reclami ufficiale della compagnia (modulo online, anche in italiano).",
    url: "https://www.complaint.ita-airways.com/s/complaint",
    email: null,
    pec: "italiatrasportoaereo@legalmail.it",
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: portale sul sottodominio ufficiale complaint.ita-airways.com; pagina disservizi ita-airways.com/it/it/support/flight-disruptions. PEC dal registro imprese (P.IVA 15907661001). Fonti terze riportano anche reclami@ita-airways.com, non confermata sul dominio ufficiale: non la registriamo.",
    chiavi: ["ITA AIRWAYS", "ITALIA TRASPORTO AEREO"],
  },
  {
    iata: "XZ",
    icao: "AEZ",
    nome: "Aeroitalia",
    nomeLegale: "Aeroitalia S.p.A.",
    paese: "IT",
    canale:
      "Form di contatto sul sito ufficiale, motivo 'Reclami' (apre un ticket numerato; non esiste una pagina EU261 dedicata).",
    url: "https://www.aeroitalia.com/en/contact_form",
    email: null,
    pec: "aeroitalia@pec.it",
    indirizzoPostale: "Aeroitalia S.p.A., Via Andrea Mantegna 8, 00054 Fiumicino (RM)",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: form di contatto e help.aeroitalia.com sul dominio ufficiale. PEC e sede dal registro camerale (oggi S.p.A., P.IVA 16340701008). Fonti terze riportano customersupport@aeroitalia.com, non confermata sul dominio ufficiale: non la registriamo.",
    chiavi: ["AEROITALIA"],
  },
  {
    iata: "VY",
    icao: "VLG",
    nome: "Vueling",
    nomeLegale: "Vueling Airlines, S.A.",
    paese: "ES",
    canale:
      "Assistente 'Compensation' sul sito ufficiale per il reclamo EU261; guida nel centro assistenza (articolo 'Claim and refunds').",
    url: "https://www.vueling.com/en/customer-services/assistants/compensation",
    email: null,
    pec: null,
    indirizzoPostale:
      "Vueling Airlines, S.A. (Departamento Legal), Parque Empresarial Mas Blau II, Plaza Pla de l'Estany 5, 08820 El Prat de Llobregat (Barcellona), Spagna",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: assistente compensation su vueling.com e articolo 19798807271441 su help.vueling.com; indirizzo del Departamento Legal dalle condizioni di trasporto ufficiali.",
    chiavi: ["VUELING"],
  },
  {
    iata: "V7",
    icao: "VOE",
    nome: "Volotea",
    nomeLegale: "Volotea, S.L.",
    paese: "ES",
    canale:
      "Modulo reclami sul sito ufficiale: le condizioni di trasporto lo dichiarano UNICO canale, e ogni passeggero deve compilare il proprio modulo.",
    url: "https://www.volotea.com/en/complaints/",
    email: null,
    pec: null,
    indirizzoPostale:
      "Volotea, S.L., Aeropuerto de Asturias, Santiago del Monte, 33459 Castrillón (Asturias), Spagna",
    accettaIntermediari: false,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: condizioni di trasporto ufficiali: 'The form is the only means by which a claim may be submitted to Volotea', ogni passeggero il proprio modulo; reclami fuori dal form possono non essere lavorati.",
    chiavi: ["VOLOTEA"],
  },

  /* ------------------------------------------------ i grandi gruppi europei */
  {
    iata: "LH",
    icao: "DLH",
    nome: "Lufthansa",
    nomeLegale: "Deutsche Lufthansa AG",
    paese: "DE",
    canale:
      "Modulo di feedback e contatto sul sito italiano (copre compensazioni e rimborsi per irregolarità di volo); esiste anche la pagina dedicata 'Compensation in the event of flight irregularities'.",
    url: "https://www.lufthansa.com/it/it/feedback",
    email: null,
    pec: null,
    indirizzoPostale: "Deutsche Lufthansa AG, Venloer Str. 151-153, 50672 Colonia, Germania",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: modulo feedback sul dominio ufficiale lufthansa.com/it/it e pagina compensation (variante /mk/en). L'email customer.relations@lufthansa.com risulta solo da fonti terze: non la registriamo.",
    chiavi: ["LUFTHANSA"],
  },
  {
    iata: "AF",
    icao: "AFR",
    nome: "Air France",
    nomeLegale: "Société Air France, S.A.",
    paese: "FR",
    canale:
      "Modulo di reclamo sul dominio italiano ('Fare un reclamo', con tracciamento della pratica su /claim/track-a-claim).",
    url: "https://wwws.airfrance.it/claim",
    email: null,
    pec: null,
    indirizzoPostale:
      "Société Air France, 45 rue de Paris, 93290 Tremblay-en-France, Francia (sede legale)",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: form wwws.airfrance.it/claim, pagina 'Reclami' e pagina 'Assistenza e indennizzo' (EU261) sul dominio ufficiale italiano.",
    chiavi: ["AIR FRANCE"],
  },
  {
    iata: "KL",
    icao: "KLM",
    nome: "KLM",
    nomeLegale: "Koninklijke Luchtvaart Maatschappij N.V. (KLM Royal Dutch Airlines)",
    paese: "NL",
    canale:
      "Pagina ufficiale 'Compensation and reimbursement for delay' sul dominio italiano, con il flusso di richiesta EU261.",
    url: "https://www.klm.it/en/information/refund-compensation/compensation",
    email: null,
    pec: null,
    indirizzoPostale:
      "Koninklijke Luchtvaart Maatschappij N.V., Amsterdamseweg 55, 1182 GP Amstelveen, Paesi Bassi (sede legale)",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagina compensation sul dominio ufficiale klm.it, richiamata dalla pagina 'Passenger Rights' di klm.com. Sede dal registro KvK Amsterdam 33014286.",
    chiavi: ["KLM", "ROYAL DUTCH"],
  },
  {
    iata: "BA",
    icao: "BAW",
    nome: "British Airways",
    nomeLegale: "British Airways Plc",
    paese: "GB",
    canale:
      "Form Customer Relations dalla pagina ufficiale 'Expenses and compensation'; in alternativa il canale postale dedicato ai reclami EU.",
    url: "https://www.britishairways.com/content/information/delayed-or-cancelled-flights/compensation",
    email: null,
    pec: null,
    indirizzoPostale:
      "British Airways Customer Relations, EU Compensation Claims, PO Box 1126, Uxbridge UB8 9XS, Regno Unito",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagina compensation e pagina legale 'Flight cancellation compensation' sul dominio ufficiale britishairways.com; PO Box reclami EU citato dalle pagine ufficiali. Companies House n. 01777777.",
    chiavi: ["BRITISH AIRWAYS"],
  },
  {
    iata: "IB",
    icao: "IBE",
    nome: "Iberia",
    nomeLegale: "Iberia Líneas Aéreas de España, S.A. Operadora, Sociedad Unipersonal",
    paese: "ES",
    canale:
      "Reclami EU261 solo via modulo online sulla pagina 'Claims and receipts' (prima risposta dichiarata entro 10 giorni; l'URL cambia prefisso in base al mercato).",
    url: "https://www.iberia.com/us/claims-receipts/",
    email: null,
    pec: null,
    indirizzoPostale:
      "Iberia L.A.E., S.A. Operadora, Calle Martínez Villergas 49, 28027 Madrid, Spagna (sede legale)",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagina claims-receipts e pagine diritti dei passeggeri sul dominio ufficiale iberia.com. CIF A85850394.",
    // Iberia Express (I2) è un'altra società con canali propri: niente
    // chiavi di nome, l'aggancio avviene solo per codice volo IB.
    chiavi: [],
  },
  {
    iata: "DY",
    icao: "NAX",
    nome: "Norwegian Air Shuttle",
    nomeLegale: "Norwegian Air Shuttle ASA",
    paese: "NO",
    canale:
      "Reclamo online dalle pagine Help and contact / Delayed flights del sito ufficiale (la Norvegia è nel SEE: il Reg. 261/2004 si applica). Norwegian chiede il reclamo diretto del passeggero, con 28 giorni per rispondere prima di incaricare terzi.",
    url: "https://www.norwegian.com/en/help-contact/",
    email: null,
    pec: null,
    indirizzoPostale: "Norwegian Air Shuttle ASA, PO Box 115, NO-1330 Fornebu, Norvegia",
    accettaIntermediari: false,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagine help-contact, delayed-flights e 'EU regulation 261/2004' sul dominio ufficiale norwegian.com. Condizioni: reclami di terzi non processati senza previo reclamo diretto.",
    // Norwegian Air Sweden (D8) è un'altra società del gruppo: chiave
    // specifica, così non se la prende per errore.
    chiavi: ["NORWEGIAN AIR SHUTTLE"],
  },
  {
    iata: "LX",
    icao: "SWR",
    nome: "SWISS",
    nomeLegale: "Swiss International Air Lines AG",
    paese: "CH",
    canale:
      "Modulo ufficiale 'Application for compensation in the event of flight irregularities' (il prefisso mercato nell'URL cambia); SWISS accetta richieste anche per posta.",
    url: "https://www.swiss.com/ch/en/customer-support/contact-us/application-for-compensation-in-the-event-of-flight-irregularities",
    email: null,
    pec: null,
    indirizzoPostale: "SWISS Customer Service, P.O. Box, CH-4002 Basilea, Svizzera",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: modulo compensation sul dominio ufficiale swiss.com (visto su più mercati) e indirizzo postale dalla pagina Customer Relations. Form NEB svizzero: bazl.admin.ch/en/pax-online-form.",
    chiavi: ["SWISS"],
  },
  {
    iata: "OS",
    icao: "AUA",
    nome: "Austrian Airlines",
    nomeLegale: "Austrian Airlines AG",
    paese: "AT",
    canale:
      "Pagina ufficiale dei diritti dei passeggeri con invio dai moduli di Help and Contact; reclami anche per posta al Feedback Management.",
    url: "https://www.austrian.com/at/en/legal/passenger-rights",
    email: null,
    pec: null,
    indirizzoPostale:
      "Austrian Airlines Feedback Management, P.O. Box 33, A-1300 Vienna Airport, Austria",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagina passenger-rights, moduli help-and-contact e form rimborsi sul dominio ufficiale austrian.com; indirizzo postale dalla pagina ufficiale.",
    chiavi: ["AUSTRIAN"],
  },

  /* ------------------------------------------------ extra UE con base passeggeri in Italia */
  {
    iata: "TK",
    icao: "THY",
    nome: "Turkish Airlines",
    nomeLegale: "Türk Hava Yolları A.O.",
    paese: "TR",
    canale:
      "Form feedback ufficiale (disponibile anche in italiano): è il canale unico, la compagnia non pubblica email reclami. Per i voli in partenza dalla UE vale la CE261.",
    url: "https://www.turkishairlines.com/it-int/any-questions/customer-relations/feedback/",
    email: null,
    pec: null,
    indirizzoPostale:
      "Turkish Airlines General Management Building, Istanbul Airport, Yeşilköy 34149, Bakırköy, Istanbul, Turchia",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: form feedback sul dominio ufficiale turkishairlines.com (anche it-int) e portale feedback.turkishairlines.com; secondo livello solo via form SHGM.",
    chiavi: ["TURKISH"],
  },
  {
    iata: "EK",
    icao: "UAE",
    nome: "Emirates",
    nomeLegale: "Emirates (corporation di Dubai, Decreto n. 2 del 1985)",
    paese: "AE",
    canale:
      "Form 'Feedback and complaints' sul sito ufficiale (presa in carico dichiarata entro 30 giorni, risposta nel merito entro 60). Il form accetta solo biglietti che iniziano con 176: altrimenti il reclamo va al vettore operativo.",
    url: "https://www.emirates.com/us/english/help/forms/complaint/",
    email: null,
    pec: null,
    indirizzoPostale: "Customer Affairs Department, Emirates, P.O. Box 686, Dubai, Emirati Arabi Uniti",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: form complaint e FAQ dedicate sul dominio ufficiale emirates.com; indirizzo postale dei reclami scritti dalle pagine ufficiali. L'email customer.affairs@emirates.com circola solo su fonti terze: non la registriamo.",
    chiavi: ["EMIRATES"],
  },
  {
    iata: "QR",
    icao: "QTR",
    nome: "Qatar Airways",
    nomeLegale: "Qatar Airways Group Q.C.S.C.",
    paese: "QA",
    canale:
      "Sezione feedback dell'help center ufficiale, indicata dalla pagina della compagnia sui diritti EU261 per i voli in partenza dalla UE.",
    url: "https://www.qatarairways.com/en/help.html#feedback",
    email: null,
    pec: null,
    indirizzoPostale: "Qatar Airways Tower, P.O. Box 22550, Doha, Qatar",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagina ufficiale 'EU air passenger rights' su qatarairways.com che indirizza i reclami alla sezione feedback dell'help center; la stessa pagina rimanda ai NEB per i voli dalla UE.",
    chiavi: ["QATAR AIRWAYS"],
  },
  {
    iata: "UX",
    icao: "AEA",
    nome: "Air Europa",
    nomeLegale: "Air Europa Líneas Aéreas, S.A.U.",
    paese: "ES",
    canale:
      "Pagina ufficiale 'Claims, complaints and suggestions' col form reclami sul portale customerservice.aireuropa.com (risposta dichiarata fino a 28 giorni).",
    url: "https://www.aireuropa.com/en/flights/customer-service/complaints-compliments",
    email: "relacionesconclientes@air-europa.com",
    pec: null,
    indirizzoPostale:
      "Air Europa Líneas Aéreas, S.A.U., Ctra. Arenal-Llucmajor Km 21,5, 07620 Llucmajor, Baleari, Spagna (sede legale)",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: pagina reclami e form sul portale ufficiale customerservice.aireuropa.com; email da pagine del dominio ufficiale aireuropa.com trovate via ricerca. CIF A07129430.",
    chiavi: ["AIR EUROPA"],
  },
  {
    iata: "HV",
    icao: "TRA",
    nome: "Transavia",
    nomeLegale: "Transavia Airlines C.V.",
    paese: "NL",
    canale:
      "Form reclami dell'help center ufficiale (categoria Flight disruptions; pagina gemella 'Submitting a claim'; risposta dichiarata in 2-4 settimane).",
    url: "https://www.transavia.com/help/en-eu/contact-complaints/contact/complaint",
    email: null,
    pec: null,
    indirizzoPostale: "Transavia Airlines C.V., Postbus 7777, 1118 ZM Schiphol Airport, Paesi Bassi",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL,
    fonte:
      "Ricerca web 2026-08-08: form complaint e submit-claim sul dominio ufficiale transavia.com; KvK Amsterdam 34069081.",
    // Transavia France (TO) è un'altra società (NEB: DGAC): niente chiavi
    // di nome, l'aggancio avviene solo per codice volo HV.
    chiavi: [],
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
 * il destinatario sbagliato (per questo Iberia e Transavia non hanno
 * chiavi di nome: le sorelle Iberia Express e Transavia France sono
 * società diverse e non devono agganciarsi qui).
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
