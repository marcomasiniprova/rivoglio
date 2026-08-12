/**
 * I canali reclamo UFFICIALI delle compagnie che possono finire in una
 * pratica vera: **50 al 12/08**, cresciute in tre giri (20 → 39 → 50).
 * Strato 5 (generazione documenti): la lettera va spedita al
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
  /**
   * Altri codici IATA che portano allo STESSO ufficio reclami.
   *
   * Serve ai gruppi che volano con più licenze: un Bergamo → Catania può
   * avere un numero W4 (Wizz Air Malta) o W6 (Wizz Air Hungary), ed è lo
   * stesso modulo. Senza questo, metà dei voli Wizz e una fetta di quelli
   * Ryanair non trovavano il canale e finivano nel messaggio
   * "compagnia non in archivio".
   *
   * ⚠️ Qui va solo un codice di cui si è sicuri. Un alias sbagliato manda
   * il reclamo a una società che non ha operato il volo, ed è l'errore
   * numero uno per cui li respingono.
   */
  iataAlias?: string[];
  /**
   * Il gruppo a cui appartiene, quando ce n'è uno.
   *
   * Richiesta di Valerio (12/08): serve a mandare il reclamo alla
   * società giusta, che è l'errore numero uno per cui li respingono. Air
   * Dolomiti vola per Lufthansa ma è una società italiana con un suo
   * ufficio reclami: scrivere a Lufthansa non serve a niente.
   */
  gruppo?: string;
  /**
   * Entro quanti giorni la compagnia DICHIARA di rispondere, quando lo
   * dichiara.
   *
   * ⚠️ Non è un termine di legge ed è per questo che si tiene separato:
   * è una loro promessa, e serve a due cose. Nella lettera diventa il
   * termine che gli si concede citando la loro stessa parola, che è più
   * difficile da ignorare di un termine scelto da noi. E dice se il
   * nostro sollecito al giorno 42 arriva presto o tardi per quella
   * compagnia.
   */
  giorniRisposta?: number;
};

export const VERIFICATO_IL = "2026-08-08";

/**
 * Il secondo giro (12/08). Stesso metodo del primo, con una stretta in
 * più: ogni ricerca è stata fatta **filtrando sul dominio ufficiale**
 * della compagnia, quindi gli URL qui sotto non sono dedotti, sono
 * comparsi nell'indice su quel dominio e su nessun altro.
 *
 * ⚠️ Il segmento di lingua/paese cambia da compagnia a compagnia
 * (`/en-es/`, `/fr/en/`, `/us/en/`). Dove l'abbiamo trovato in italiano
 * si è preso quello; dove no, resta quello indicizzato, che funziona.
 */
export const VERIFICATO_IL_2 = "2026-08-12";

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
    // Malta Air (AL) e Buzz (RR) volano rotte italiane con numeri propri.
    iataAlias: ["AL", "RR"],
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
    giorniRisposta: 28,
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
    giorniRisposta: 30,
    // Wizz Air Malta (W4) opera moltissime rotte italiane; Wizz Air UK
    // (W9) i collegamenti col Regno Unito. Stesso modulo reclami.
    iataAlias: ["W4", "W9"],
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
    gruppo: "IAG",
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

  /* =================================================================
     SECONDO GIRO (12/08). Diciannove compagnie in più.

     🔴 Perché: Valerio ha aperto una pratica e ha letto «non abbiamo in
     archivio il canale reclami di questa compagnia, cerca "reclami" sul
     sito ufficiale». Con venti compagnie in tabella quel messaggio
     usciva su un volo su tre. Un prodotto che vende "la lettera già
     pronta" e poi ti manda a cercare il destinatario ha finito di
     vendere lì.

     Il criterio di scelta è uno solo: **chi vola davvero da e per
     l'Italia.** Non c'è nessuna compagnia messa qui per fare numero.
     ================================================================= */

  /* ------------------------------------------------ Europa, linea */
  {
    iata: "EI",
    icao: "EIN",
    nome: "Aer Lingus",
    nomeLegale: "Aer Lingus Limited",
    paese: "IE",
    canale:
      "Modulo dedicato alla compensazione per volo interrotto (Flight Disruption Compensation Form). Va compilato col nome scritto esattamente come sulla prenotazione, se no lo respingono.",
    url: "https://www.aerlingus.com/app/support/forms/flight-disruption-compensation-form",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio aerlingus.com: 'Flight Disruption Compensation Claim Form' e la pagina legale 'EU Regulation 261/2004'.",
    chiavi: ["AER LINGUS"],
    gruppo: "IAG",
  },
  {
    iata: "EW",
    icao: "EWG",
    nome: "Eurowings",
    nomeLegale: "Eurowings GmbH",
    paese: "DE",
    canale:
      "Pagina ufficiale sui diritti del passeggero, con lo strumento online per verificare e chiedere la compensazione secondo il Regolamento 261/2004.",
    url: "https://www.eurowings.com/en/information/news-help/delays-cancellations-air-passenger-rights.html",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio eurowings.com: pagina 'Passenger rights' e FAQ 'Claims & compensation'.",
    chiavi: ["EUROWINGS"],
    gruppo: "Lufthansa Group",
  },
  {
    iata: "SN",
    icao: "BEL",
    nome: "Brussels Airlines",
    nomeLegale: "Brussels Airlines N.V./S.A.",
    paese: "BE",
    canale:
      "Modulo di segnalazione ufficiale, sezione ritardi e cancellazioni. Il segmento di paese nell'indirizzo cambia (/fr/, /at/, /be/): la pagina è la stessa.",
    url: "https://www.brusselsairlines.com/fr/en/contact/feedback/general/delays-and-cancellation",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio brusselsairlines.com: modulo 'Delays and cancellation' e pagina legale 'Your rights as a passenger'.",
    chiavi: ["BRUSSELS AIRLINES"],
    gruppo: "Lufthansa Group",
  },
  {
    iata: "TP",
    icao: "TAP",
    nome: "TAP Air Portugal",
    nomeLegale: "TAP - Transportes Aéreos Portugueses, S.A.",
    paese: "PT",
    canale:
      "Sezione reclami del sito ufficiale (Requests & complaints). Dichiarano di rispondere entro un mese dalla presentazione.",
    url: "https://www.flytap.com/en-es/help/requests-complaints/complaints",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio flytap.com: pagine 'Complaints' e 'Requests and complaints'.",
    chiavi: ["TAP AIR PORTUGAL", "TAP PORTUGAL"],
    giorniRisposta: 30,
  },
  {
    iata: "A3",
    icao: "AEE",
    nome: "Aegean Airlines",
    nomeLegale: "Aegean Airlines S.A.",
    paese: "GR",
    canale:
      "Modulo di contatto ufficiale: scegli la voce che riguarda il volo, non quella dei bagagli.",
    url: "https://en.aegeanair.com/contact/Form/",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    // Il modulo è quello generale: la pagina di un modulo dedicato ai soli
    // casi 261 non è comparsa. Si dichiara, e l'interfaccia lo dice.
    verificato: false,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio aegeanair.com: 'Help & Contact' (modulo) e 'Conditions & Notices'; policy reclami su about.aegeanair.com.",
    chiavi: ["AEGEAN"],
  },
  {
    iata: "LO",
    icao: "LOT",
    nome: "LOT Polish Airlines",
    nomeLegale: "Polskie Linie Lotnicze LOT S.A.",
    paese: "PL",
    canale:
      "Modulo ufficiale 'Claim after departure', cioè il reclamo dopo che il volo è avvenuto: è quello giusto per la compensazione.",
    url: "https://www.lot.com/us/en/help-center/contact/forms/form-claim-after-departure",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio lot.com: modulo 'Claim after departure' e pagina 'Passenger rights due to irregularities'.",
    chiavi: ["LOT POLISH", "POLSKIE LINIE"],
  },
  {
    iata: "SK",
    icao: "SAS",
    nome: "SAS",
    nomeLegale: "SAS AB",
    paese: "SE",
    canale:
      "Modulo dedicato proprio al Regolamento 261/2004 (claim-eu261). È fra i più diretti che esistano: si compila e basta.",
    url: "https://www.flysas.com/en/customer-service/contact/forms/claim-eu261",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio flysas.com: modulo 'claim-eu261' e pagina 'EU Passenger Rights'.",
    chiavi: ["SCANDINAVIAN AIRLINES", "SAS AB"],
  },
  {
    iata: "AY",
    icao: "FIN",
    nome: "Finnair",
    nomeLegale: "Finnair Oyj",
    paese: "FI",
    canale:
      "Modulo ufficiale 'Feedback and compensation'. ⚠️ Chiedono di presentare la richiesta entro due mesi dal volo: è un termine loro, non di legge, ma tanto vale rispettarlo.",
    url: "https://www.finnair.com/it-en/customer-care-and-contact-information/contact-and-request-forms/feedback-and-compensation",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio finnair.com: modulo 'Feedback and compensation', versione italiana (/it-en/) presente nell'indice.",
    chiavi: ["FINNAIR"],
  },
  {
    iata: "OU",
    icao: "CTN",
    nome: "Croatia Airlines",
    nomeLegale: "Croatia Airlines d.d.",
    paese: "HR",
    canale:
      "Modulo ufficiale delle richieste (Request type). Il reclamo va presentato per iscritto: il modulo lo è.",
    url: "https://www.croatiaairlines.com/en/customer/request-type",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio croatiaairlines.com: 'Request type' e pagina legale 'Passengers' rights'.",
    chiavi: ["CROATIA AIRLINES"],
  },
  {
    iata: "RO",
    icao: "ROT",
    nome: "TAROM",
    nomeLegale: "Compania Națională de Transporturi Aeriene Române TAROM S.A.",
    paese: "RO",
    canale: "Pagina ufficiale dei reclami sui voli, con la sezione dedicata alla compensazione.",
    url: "https://www.tarom.ro/en/complaints-related-flights/",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio tarom.ro: 'Complaints related to the flights' e 'Compensation for cancelled or delayed flights'.",
    chiavi: ["TAROM"],
  },
  {
    iata: "KM",
    icao: "KMM",
    nome: "KM Malta Airlines",
    nomeLegale: "KM Malta Airlines Ltd",
    paese: "MT",
    canale:
      "Sezione ufficiale dedicata a voli persi, in ritardo e cancellati, da cui parte la richiesta di compensazione.",
    url: "https://airmalta.com/en/customer-support/missed-delayed-cancelled-flights",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sui domini airmalta.com e maltairlines.com: 'Missed, Delayed & Cancelled Flights' e 'Customer Support' (il sito della compagnia resta su airmalta.com dopo il passaggio da Air Malta a KM Malta Airlines).",
    chiavi: ["MALTA AIRLINES", "AIR MALTA"],
  },

  /* ------------------------------------------- Italia, non di linea */
  {
    iata: "NO",
    icao: "NOS",
    nome: "Neos",
    nomeLegale: "Neos S.p.A.",
    paese: "IT",
    canale:
      "Area clienti del sito ufficiale: il reclamo si apre da lì, dopo essersi registrati, e lo stato si segue nella propria area. Dichiarano risposta entro 30 giorni dal ricevimento.",
    url: "https://www.neosair.it/it/dopo_il_volo/customer_service",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio neosair.it: pagina 'customer_service' e Carta dei Servizi ufficiale.",
    chiavi: ["NEOS"],
    giorniRisposta: 30,
  },

  /* ------------------------------------- fuori UE, ma volano in Italia */
  {
    iata: "PC",
    icao: "PGT",
    nome: "Pegasus Airlines",
    nomeLegale: "Pegasus Hava Taşımacılığı A.Ş.",
    paese: "TR",
    canale:
      "Centro assistenza ufficiale: arrivato lì, scegli la voce del volo (ritardo, cancellazione, diritti del passeggero).",
    url: "https://www.flypgs.com/en/help-center",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    // Il centro assistenza è ufficiale, ma un modulo dedicato ai soli casi
    // 261 non è comparso nell'indice: si dichiara.
    verificato: false,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio flypgs.com: 'Help Center' e 'Passenger Rights'.",
    chiavi: ["PEGASUS"],
  },
  {
    iata: "JU",
    icao: "ASL",
    nome: "Air Serbia",
    nomeLegale: "Air Serbia a.d. Beograd",
    paese: "RS",
    canale: "Pagina ufficiale dei reclami (Claims), da cui si presenta la richiesta scritta.",
    url: "https://www.airserbia.com/en/claims",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio airserbia.com: 'Claims' e pagina legale 'Passenger rights'.",
    chiavi: ["AIR SERBIA"],
    giorniRisposta: 60,
  },
  {
    iata: "TU",
    icao: "TAR",
    nome: "Tunisair",
    nomeLegale: "Société Tunisienne de l'Air - Tunisair",
    paese: "TN",
    canale:
      "Modulo reclami ufficiale. ⚠️ È personale: una richiesta per ogni passeggero. Dichiarano risposta entro due mesi.",
    url: "https://www.tunisair.com/en/reclamation?category_id=1",
    email: null,
    pec: null,
    indirizzoPostale:
      "Tunisair, Direction Relation Clientèle et Call Center, Charguia II, 2035 Tunis-Carthage, Tunisia",
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio tunisair.com: modulo 'reclamation' e pagine 'Relation clientèle'. L'indirizzo postale è quello indicato dalle stesse pagine.",
    chiavi: ["TUNISAIR"],
    giorniRisposta: 60,
  },
  {
    iata: "AT",
    icao: "RAM",
    nome: "Royal Air Maroc",
    nomeLegale: "Compagnie Nationale Royal Air Maroc S.A.",
    paese: "MA",
    canale:
      "Modulo reclami ufficiale (Service Claims): dopo l'invio arriva un'email con il numero della pratica. Il segmento di paese nell'indirizzo cambia.",
    url: "https://www.royalairmaroc.com/us-en/information/service-claims",
    email: null,
    pec: null,
    indirizzoPostale: null,
    // Scrivono espressamente che passare da un intermediario non accorcia
    // i tempi e consigliano il contatto diretto: per noi è una conferma.
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio royalairmaroc.com: 'Service Claims' e 'Customer Service Plan'.",
    chiavi: ["ROYAL AIR MAROC"],
    giorniRisposta: 60,
  },

  /* --------------------------- Stati Uniti: contano sui voli DALL'Europa.
     L'art. 3 par. 1 lett. a) copre qualsiasi compagnia che parta da uno
     scalo europeo, quindi un Roma → Atlanta con Delta rientra in pieno.
     Al ritorno no, e il motore lo sa già. */
  {
    iata: "DL",
    icao: "DAL",
    nome: "Delta Air Lines",
    nomeLegale: "Delta Air Lines, Inc.",
    paese: "US",
    canale:
      "Pagina dedicata alla richiesta di compensazione per i voli in partenza dall'Unione europea (EU Compensation Request).",
    url: "https://www.delta.com/us/en/change-cancel/exit-eu-compensation",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio delta.com: 'Exit European Union (EU) Compensation Request'.",
    chiavi: ["DELTA AIR"],
  },
  {
    iata: "UA",
    icao: "UAL",
    nome: "United Airlines",
    nomeLegale: "United Airlines, Inc.",
    paese: "US",
    canale:
      "Modulo Customer Care ufficiale: è il canale con cui United raccoglie i reclami, compresi quelli sui voli in partenza dall'Unione europea.",
    url: "https://www.united.com/en/us/customer-care",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio united.com: 'United Customer Care Form' e l'avviso ufficiale sui diritti per i voli in partenza dall'UE.",
    chiavi: ["UNITED AIRLINES"],
  },
  {
    iata: "AA",
    icao: "AAL",
    nome: "American Airlines",
    nomeLegale: "American Airlines, Inc.",
    paese: "US",
    canale:
      "Modulo Customer Relations ufficiale (argomento CR). Loro stessi dicono che il modulo online ha risposta più rapida della posta.",
    url: "https://www.aa.com/contact/forms?topic=CR",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio aa.com: modulo 'Contact American' con argomento Customer Relations e pagina 'Passenger Rights European Union'.",
    chiavi: ["AMERICAN AIRLINES"],
  },

  /* =================================================================
     TERZO GIRO (12/08 notte). Undici compagnie in più, prese dalla
     classifica che ha messo insieme Valerio.

     Il criterio resta quello: si aggiunge chi può finire in una pratica
     vera, cioè chi vola da o per l'Europa. Stesso metodo di sempre:
     ricerca filtrata sul dominio ufficiale, e se il canale non compare
     non si scrive niente.

     🔴 DUE ESCLUSIONI DICHIARATE, che valgono più di due righe in più:
     - **PLAY (OG)**: il suo stesso sito pubblica «Fly PLAY hf. ceases
       operations». Una compagnia che ha chiuso non paga nessun reclamo,
       e metterla in archivio venderebbe una lettera che finisce in una
       procedura fallimentare.
     - **EgyptAir (MS)**: sul dominio ufficiale non è comparso nessun
       canale reclami, solo le condizioni di trasporto. Senza canale non
       si inventa: resta fuori finché non lo troviamo.
     ================================================================= */

  /* ------------------------------------------------ Italia ed Europa */
  {
    iata: "EN",
    icao: "DLA",
    nome: "Air Dolomiti",
    nomeLegale: "Air Dolomiti S.p.A. Linee Aeree Regionali Europee",
    paese: "IT",
    canale:
      "Portale clienti ufficiale: il reclamo si apre da lì e la pratica si segue con un numero.",
    url: "https://hda_s_form.airdolomiti.it/customerportal_forms",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio airdolomiti.it: portale clienti e Carta dei Servizi ufficiale.",
    chiavi: ["AIR DOLOMITI"],
    /* ⚠️ Vola per Lufthansa con numeri LH in codeshare, ma è una società
       italiana con un suo ufficio reclami: scrivere a Lufthansa per un
       volo operato da lei è il modo più comune di farsi rispondere
       "vettore non competente". */
    gruppo: "Lufthansa Group",
  },
  {
    iata: "DE",
    icao: "CFG",
    nome: "Condor",
    nomeLegale: "Condor Flugdienst GmbH",
    paese: "DE",
    canale:
      "Modulo dedicato proprio al Regolamento 261/2004. Chiedono di allegare carta d'imbarco e conferma di prenotazione: senza, la pratica si ferma subito.",
    url: "https://www.condor.com/us/help-contact/contact/complaint-form-eu261.jsp",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio condor.com: modulo 'complaint-form-eu261' e pagina 'Passenger rights'.",
    chiavi: ["CONDOR"],
  },
  {
    iata: "LS",
    icao: "EXS",
    nome: "Jet2.com",
    nomeLegale: "Jet2.com Limited",
    paese: "GB",
    canale:
      "Modulo online per ritardi e cancellazioni. Dichiarano di rispondere entro un mese; se la risposta non soddisfa, in UK si passa al PACT della Civil Aviation Authority.",
    url: "https://www.jet2.com/en/delays-and-disruptions",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio jet2.com: 'Flight delay and cancellation claims' e il PDF ufficiale 'EU261 Customer info'.",
    chiavi: ["JET2"],
    giorniRisposta: 30,
  },
  {
    iata: "LG",
    icao: "LGL",
    nome: "Luxair",
    nomeLegale: "Luxair S.A. Société Luxembourgeoise de Navigation Aérienne",
    paese: "LU",
    canale: "Pagina ufficiale su come presentare un reclamo a Luxair e LuxairTours.",
    url: "https://www.luxair.lu/en/faq/filing-complaint-luxairtours-luxair/",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio luxair.lu: 'Filing a complaint with LuxairTours & Luxair?' e la pagina 'Passenger Rights'.",
    chiavi: ["LUXAIR"],
  },
  {
    iata: "BT",
    icao: "BTI",
    nome: "airBaltic",
    nomeLegale: "AS Air Baltic Corporation",
    paese: "LV",
    canale:
      "Modulo dedicato 'Submit a claim'. È fra i più diretti: si compila e basta, senza passare da un centro assistenza.",
    url: "https://www.airbaltic.com/en/submit-a-claim",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio airbaltic.com: 'Submit a claim' e la pagina sul Regolamento (CE) 261/2004.",
    chiavi: ["AIRBALTIC", "AIR BALTIC"],
  },
  {
    iata: "FI",
    icao: "ICE",
    nome: "Icelandair",
    nomeLegale: "Icelandair ehf.",
    paese: "IS",
    canale:
      "Pagina ufficiale dei disservizi, da cui parte la richiesta di compensazione. L'Islanda è nello Spazio economico europeo: il Regolamento si applica.",
    url: "https://www.icelandair.com/support/flight-disruptions/",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio icelandair.com: 'Submit your claim' e 'Customer care & passengers' rights'.",
    chiavi: ["ICELANDAIR"],
  },
  {
    iata: "QS",
    icao: "TVS",
    nome: "Smartwings",
    nomeLegale: "Smartwings, a.s.",
    paese: "CZ",
    canale:
      "Pagina ufficiale dei moduli: da lì si scarica e si presenta la richiesta di compensazione.",
    url: "https://www.smartwings.com/en/rules-and-forms/",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio smartwings.com: 'Important documents and forms' e il PDF ufficiale sui diritti del passeggero.",
    chiavi: ["SMARTWINGS", "TRAVEL SERVICE"],
  },
  {
    iata: "X3",
    icao: "TUI",
    nome: "TUI fly",
    nomeLegale: "TUIfly GmbH",
    paese: "DE",
    canale:
      "Modulo di reclamo per i voli TUI fly sul sito del gruppo. ⚠️ Se il volo faceva parte di un pacchetto, il reclamo va all'organizzatore del viaggio, non alla compagnia.",
    url: "https://www.tui.com/hilfe/flug/reklamationen/",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sui domini tui.com e tuifly.com: 'Reklamation zum TUI fly Flug' e le condizioni ufficiali TUI fly.",
    chiavi: ["TUI FLY", "TUIFLY"],
    gruppo: "TUI Group",
  },

  /* --------------------------------- fuori UE, ma partono dall'Europa */
  {
    iata: "XQ",
    icao: "SXS",
    nome: "SunExpress",
    nomeLegale: "Güneş Ekspres Havacılık A.Ş. (SunExpress)",
    paese: "TR",
    canale:
      "Pagina ufficiale sui diritti del passeggero, con il modulo di contatto da cui si presenta il reclamo.",
    url: "https://www.sunexpress.com/en-gb/information/passenger-info/passenger-rights/",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio sunexpress.com: 'Passenger Rights Guide', l'opuscolo ufficiale e 'Help Center'.",
    chiavi: ["SUNEXPRESS"],
  },
  {
    iata: "EY",
    icao: "ETD",
    nome: "Etihad Airways",
    nomeLegale: "Etihad Airways P.J.S.C.",
    paese: "AE",
    canale:
      "Modulo ufficiale per segnalazioni e richieste. Dichiarano che la compensazione dovuta viene pagata entro 45 giorni dalla richiesta scritta.",
    url: "https://www.etihad.com/en/help/share-feedback",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio etihad.com: 'Feedback on your journey' e 'Rules, notices, and your rights' (informativa per i voli in partenza dall'UE).",
    chiavi: ["ETIHAD"],
    giorniRisposta: 45,
  },
  {
    iata: "ET",
    icao: "ETH",
    nome: "Ethiopian Airlines",
    nomeLegale: "Ethiopian Airlines Group",
    paese: "ET",
    canale: "Pagina ufficiale di assistenza e segnalazioni, da cui si presenta il reclamo scritto.",
    url: "https://www.ethiopianairlines.com/uk/services/help-and-contact/support-and-feedback",
    email: null,
    pec: null,
    indirizzoPostale: null,
    accettaIntermediari: null,
    verificato: true,
    verificatoIl: VERIFICATO_IL_2,
    fonte:
      "Ricerca web 12/08/2026 con filtro sul dominio ethiopianairlines.com: 'Support and Feedback' e 'Ethiopian Customer Commitment'.",
    chiavi: ["ETHIOPIAN"],
  },
];

/* ------------------------------------------------------ come si manda */

/**
 * COME SI SPEDISCE QUESTA LETTERA, in una risposta sola.
 *
 * 🔴 Valerio, 12/08: «il destinatario non c'è perché? Il destinatario
 * dobbiamo sempre averlo, dobbiamo sempre fornirlo». Ha ragione sul
 * risultato, e la causa vale la pena scriverla perché non è pigrizia
 * nostra: **Ryanair, easyJet e Wizz Air un indirizzo email per i reclami
 * non lo pubblicano.** Obbligano al modulo sul loro sito, e nelle
 * condizioni di trasporto scrivono nero su bianco che lavorano solo il
 * reclamo che arriva dal passeggero. Metterci un'email pescata in giro
 * sarebbe la cosa peggiore: la lettera parte, non risponde nessuno, e il
 * cliente scopre due mesi dopo di aver scritto a un indirizzo morto.
 *
 * Quindi il destinatario c'è sempre, ma non è sempre un'email: per
 * quelle compagnie è il loro modulo, ed è l'unico canale che paga.
 * L'interfaccia non deve MAI dire "cercatelo": deve portarcelo.
 *
 * Ordine di scelta, e il perché di ognuno:
 * 1. `email` → `mailto:`. Un gesto solo, il testo viaggia intero.
 * 2. `url` → il modulo. Si copia la lettera e si apre il modulo: due
 *    gesti, ma è il canale dichiarato dalla compagnia.
 * 3. niente → si dice cosa fare, non si manda a cercare.
 *
 * ⚠️ LA PEC NON È MAI LA PRIMA SCELTA, e non è una svista. Una casella
 * PEC di solito **rifiuta la posta che non arriva da un'altra PEC**:
 * mandarci un messaggio da Gmail significa vederselo respingere. Vale
 * per chi la PEC ce l'ha, quindi si mostra a parte, come possibilità in
 * più per chi sa cos'è.
 */
export type ModoInvio =
  | { tipo: "email"; a: string; pec: string | null }
  | { tipo: "modulo"; url: string; nome: string; pec: string | null }
  | { tipo: "ignoto" };

export function modoInvio(c: CanaleCompagnia | null): ModoInvio {
  if (!c) return { tipo: "ignoto" };
  if (c.email) return { tipo: "email", a: c.email, pec: c.pec };
  if (c.url) return { tipo: "modulo", url: c.url, nome: c.nome, pec: c.pec };
  return { tipo: "ignoto" };
}

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
  const perIata = COMPAGNIE.find(
    (c) => c.iata === codice || c.iataAlias?.includes(codice),
  );
  if (perIata) return perIata;

  // Nome del vettore, per aggancio di sottostringa.
  const coppie = COMPAGNIE.flatMap((c) => c.chiavi.map((chiave) => ({ chiave, c })));
  coppie.sort((a, b) => b.chiave.length - a.chiave.length);
  for (const { chiave, c } of coppie) {
    if (testo.includes(chiave)) return c;
  }
  return null;
}
