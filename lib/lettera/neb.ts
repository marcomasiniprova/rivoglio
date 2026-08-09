/**
 * GLI ORGANISMI NAZIONALI (NEB): a chi si fa reclamo se la compagnia tace.
 *
 * Perché esiste questo file. La lettera mandava TUTTI all'ENAC, ma l'art. 16
 * par. 1 del Regolamento assegna la competenza all'organismo dello Stato
 * dell'AEROPORTO DI PARTENZA. Per un Barcellona → Berlino l'ente non è
 * l'ENAC: è quello spagnolo. Chi seguiva la nostra lettera scriveva
 * all'ufficio sbagliato e perdeva settimane.
 *
 * ⚠️ COME È FATTA QUESTA TABELLA, detto onestamente. La pagina ufficiale
 * della Commissione con l'elenco completo, e i suoi PDF, non erano
 * raggiungibili dall'ambiente in cui è stato scritto questo file. Quindi:
 * ogni riga qui sotto ha il nome dell'ente e, dove c'era, l'indirizzo della
 * sua pagina reclami, presi da fonti trovate una per una. I paesi per cui
 * NON avevo una fonte solida NON sono in tabella: per quelli la lettera
 * rimanda all'elenco ufficiale della Commissione invece di inventarsi un
 * ufficio. Meglio una riga in meno che un destinatario sbagliato.
 *
 * Quando qualcuno potrà aprire la pagina ufficiale, si completano i
 * mancanti: Croazia, Slovenia, Slovacchia, Romania, Cipro, Estonia,
 * Lettonia, Lituania, Liechtenstein. È segnato in ARRETRATI.
 *
 * Le chiavi sono i nomi dei paesi COME LI SCRIVE `lib/dati/aeroporti.json`
 * (OpenFlights, inglese): così si aggancia direttamente allo scalo di
 * partenza senza tabelle di conversione in mezzo.
 */

export type Neb = {
  /** Il nome con cui l'ente si presenta, per esteso. */
  nome: string;
  /** Sigla d'uso comune, se ne ha una. */
  sigla?: string;
  /** La pagina dei reclami, quando l'ho verificata. */
  url?: string;
};

/** L'elenco ufficiale della Commissione: la riserva quando non sappiamo. */
export const ELENCO_UFFICIALE_NEB =
  "https://transport.ec.europa.eu/transport-themes/passenger-rights/national-enforcement-bodies-neb_en";

const NEB_PER_PAESE: Record<string, Neb> = {
  Italy: {
    nome: "Ente Nazionale per l'Aviazione Civile",
    sigla: "ENAC",
    url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
  },
  Spain: {
    nome: "Agencia Estatal de Seguridad Aérea",
    sigla: "AESA",
    url: "https://www.seguridadaerea.gob.es/en/ambitos/derechos-de-los-pasajeros/procedimiento-para-reclamar",
  },
  Germany: {
    nome: "Luftfahrt-Bundesamt",
    sigla: "LBA",
    url: "https://www.lba.de/EN/AirPassengersRights/Cancellation_Delay_Denied/Cancellation_Delay_Denied.html",
  },
  France: {
    nome: "Direction Générale de l'Aviation Civile",
    sigla: "DGAC",
  },
  Netherlands: {
    nome: "Inspectie Leefomgeving en Transport",
    sigla: "ILT",
  },
  Greece: {
    nome: "Hellenic Civil Aviation Authority",
    sigla: "HCAA",
    url: "https://hcaa.gov.gr/en/diadikasia-ypobolis-kataggelias",
  },
  Austria: {
    nome: "Agentur für Passagier- und Fahrgastrechte",
    sigla: "apf",
  },
  Hungary: {
    nome: "Nemzeti Közlekedési Hatóság (autorità ungherese per i diritti dei passeggeri)",
    sigla: "NKFH",
    url: "https://nkfh.gov.hu/en/useful/travel-passenger-rights/enforcement-of-air-passenger-rights",
  },
  "Czech Republic": {
    nome: "Civil Aviation Authority of the Czech Republic",
    sigla: "CAA",
    url: "https://www.caa.gov.cz/en/passengers/denied-boarding-delay-or-cancellation-of-flight/air-passenger-complaint-form/",
  },
  Bulgaria: {
    nome: "Directorate General Civil Aviation Administration",
    sigla: "DG CAA",
    url: "https://www.caa.bg/en/category/282/2799",
  },
  Poland: {
    nome: "Urząd Lotnictwa Cywilnego",
    sigla: "ULC",
  },
  Ireland: {
    nome: "Irish Aviation Authority",
    sigla: "IAA",
    url: "https://www.iaa.ie/consumer-protection/air-passenger-rights",
  },
  Portugal: {
    nome: "Autoridade Nacional da Aviação Civil",
    sigla: "ANAC",
    url: "https://www.anac.pt/vPT/Passageiros/DireitosPassageiro/comoapresentarumaqueixa/Paginas/Howtosubmitacomplaint.aspx",
  },
  Belgium: {
    nome: "SPF Mobilité et Transports, autorità dell'aviazione civile belga",
    sigla: "BCAA",
    url: "https://mobilit.belgium.be/en/aviation/passengers/passengers-right",
  },
  Luxembourg: {
    nome: "Direction de la protection des consommateurs",
    url: "https://mpc.gouvernement.lu/en/dossiers/2023/passenger-rights.html",
  },
  Finland: {
    nome: "Liikenne- ja viestintävirasto Traficom",
    sigla: "Traficom",
    url: "https://traficom.fi/en/air-passenger/instructions-flights/air-passenger-rights",
  },
  Sweden: {
    nome: "Konsumentverket / Konsumentombudsmannen",
    sigla: "KO",
  },
  Denmark: {
    nome: "Trafikstyrelsen (autorità danese dei trasporti)",
  },
  Norway: {
    nome: "Luftfartstilsynet (autorità norvegese dell'aviazione civile)",
  },
  Malta: {
    nome: "Malta Competition and Consumer Affairs Authority",
    sigla: "MCCAA",
  },
};

/**
 * L'ente competente per lo Stato da cui è PARTITO il volo.
 * `null` quando quel paese non è in tabella: chi scrive la lettera deve
 * dirlo apertamente e rimandare all'elenco ufficiale, mai indovinare.
 */
export function nebPerPaese(paese: string | null | undefined): Neb | null {
  if (!paese) return null;
  return NEB_PER_PAESE[paese.trim()] ?? null;
}

/** Come si nomina l'ente dentro una frase: "l'ENAC", "la DGAC"... */
export function nomeBreveNeb(neb: Neb): string {
  return neb.sigla ?? neb.nome;
}
