/**
 * GLI ORGANISMI NAZIONALI (NEB): a chi si fa reclamo se la compagnia tace.
 *
 * Perché esiste questo file. La lettera mandava TUTTI all'ENAC, ma l'art. 16
 * par. 1 del Regolamento assegna la competenza all'organismo dello Stato
 * dell'AEROPORTO DI PARTENZA. Per un Barcellona → Berlino l'ente non è
 * l'ENAC: è quello spagnolo. Chi seguiva la nostra lettera scriveva
 * all'ufficio sbagliato e perdeva settimane.
 *
 * ⚠️ DA DOVE VIENE QUESTA TABELLA. Le prime venti righe (giro #38) sono
 * state messe insieme una per una da fonti trovate a mano, perché la
 * pagina ufficiale della Commissione non era raggiungibile. Il 10/08
 * Valerio ha aperto il PDF ufficiale e me ne ha passato il testo, quindi
 * **da qui in avanti la fonte è una sola e ufficiale**: "National
 * Enforcement Bodies", Commissione europea, aggiornato al 13 luglio 2026.
 * Da lì vengono i nove paesi che mancavano e le correzioni sugli altri.
 *
 * Resta la regola: un paese che non è in tabella NON si inventa. Per
 * quelli la lettera rimanda all'elenco ufficiale, che è meglio di un
 * destinatario sbagliato.
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
/** Il PDF ufficiale da cui viene questa tabella, aggiornato al 13/07/2026. */
export const PDF_UFFICIALE_NEB =
  "https://transport.ec.europa.eu/document/download/d7b5dd33-4083-4faa-8132-b6dc8b3a1c07_en?filename=2004_261_national_enforcement_bodies.pdf";

export const ELENCO_UFFICIALE_NEB =
  "https://transport.ec.europa.eu/transport-themes/passenger-rights/national-enforcement-bodies-neb_en";

const NEB_PER_PAESE: Record<string, Neb> = {
  /* ---- I NOVE CHE MANCAVANO, dal PDF ufficiale del 13 luglio 2026.
     Nota per chi legge: in parecchi paesi l'ente NON è l'aviazione
     civile ma la tutela dei consumatori (Estonia, Lettonia, Romania,
     Slovacchia). Mandare quella gente all'autorità dell'aviazione
     sarebbe stato sbagliato in modo non ovvio. */
  Croatia: {
    nome: "Croatian Civil Aviation Agency",
    sigla: "CCAA",
    url: "https://www.ccaa.hr/",
  },
  Slovenia: {
    nome: "Javna agencija za civilno letalstvo Republike Slovenije",
    sigla: "CAA Slovenia",
    url: "https://www.caa.si/",
  },
  Slovakia: {
    nome: "Slovenská obchodná inšpekcia",
    sigla: "SOI",
    url: "https://www.soi.sk/",
  },
  Romania: {
    nome: "Autoritatea Naţională pentru Protecţia Consumatorilor",
    sigla: "ANPC",
    url: "https://anpc.ro/",
  },
  Cyprus: {
    nome: "Department of Civil Aviation",
    sigla: "DCA",
    url: "https://www.mcw.gov.cy/dca",
  },
  Estonia: {
    nome: "Tarbijakaitse ja Tehnilise Järelevalve Amet",
    sigla: "TTJA",
    url: "https://www.ttja.ee/",
  },
  Latvia: {
    nome: "Patērētāju tiesību aizsardzības centrs",
    sigla: "PTAC",
    url: "https://www.ptac.gov.lv/",
  },
  Lithuania: {
    nome: "Lietuvos transporto saugos administracija",
    sigla: "LTSA",
    url: "https://ltsa.lrv.lt/",
  },
  /* ⚠️ IL LIECHTENSTEIN NON C'È, e non è una dimenticanza: nel PDF
     ufficiale del 13 luglio 2026 non compare, né fra gli Stati membri né
     fra i paesi SEE elencati (ci sono solo Islanda e Norvegia). Non
     avendo un ente da nominare, resta fuori: la lettera rimanderà
     all'elenco ufficiale. */

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
    url: "https://droits-passagers-aeriens.aviation-civile.gouv.fr/",
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
  /* ⚠️ CORRETTA IL 10/08 sul PDF ufficiale. Prima qui c'era l'autorità
     ungherese dell'aviazione, ma il PDF avverte in modo esplicito che i
     reclami dei singoli passeggeri mandati lì NON vengono trattati: vanno
     all'ufficio consumatori del Governo di Budapest. Chi seguiva la
     nostra lettera scriveva a un ufficio che gli rispondeva di rivolgersi
     altrove, se rispondeva. */
  Hungary: {
    nome: "Budapest Főváros Kormányhivatala, Fogyasztóvédelmi Főosztály",
    sigla: "Ufficio consumatori del Governo di Budapest",
    url: "https://kormanyhivatalok.hu/kormanyhivatalok/budapest",
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
  /* Precisata il 10/08: nel PDF ufficiale i reclami dei passeggeri vanno
     al Difensore dei diritti dei passeggeri, che ha sede dentro l'ULC. */
  Poland: {
    nome: "Rzecznik Praw Pasażerów (Passengers' Rights Ombudsman)",
    sigla: "Rzecznik Praw Pasażerów",
    url: "https://pasazerlotniczy.ulc.gov.pl/",
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
  /* ⚠️ CORRETTA IL 10/08 sul PDF ufficiale. Traficom c'è, ma vigila sui
     NON consumatori (chi viaggia per lavoro) e non tratta i casi
     individuali. Il passeggero privato va al Consumer Disputes Board. */
  Finland: {
    nome: "Kuluttajariitalautakunta (Consumer Disputes Board)",
    sigla: "Consumer Disputes Board",
    url: "https://www.kuluttajariita.fi/en/index.html",
  },
  Sweden: {
    nome: "Konsumentverket / Konsumentombudsmannen",
    url: "https://www.hallakonsument.se/",
    sigla: "KO",
  },
  Denmark: {
    nome: "Trafikstyrelsen (autorità danese dei trasporti)",
    url: "https://www.en.flypassager.dk/",
  },
  /* ⚠️ CORRETTA IL 10/08 sul PDF ufficiale: i reclami dei passeggeri in
     Norvegia non vanno all'autorità dell'aviazione ma alla commissione
     per le controversie di viaggio. */
  Norway: {
    nome: "Transportklagenemnda (Norsk ReiselivsForum)",
    sigla: "Transportklagenemnda",
    url: "https://www.reiselivsforum.no/",
  },
  /* La Svizzera è nel PDF ufficiale, nella sezione dei paesi che
     applicano norme equivalenti: è la TERZA conferma indipendente di
     quello che il motore ha imparato nel giro #47. */
  Switzerland: {
    nome: "Bundesamt für Zivilluftfahrt (Ufficio federale dell'aviazione civile)",
    sigla: "UFAC / FOCA",
    url: "https://www.bazl.admin.ch/bazl/it/home/passeggeri/diritti-dei-passeggeri.html",
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
/**
 * Quanti paesi hanno l'ente nazionale verificato in tabella.
 *
 * ⚠️ Esiste per un motivo solo: la pagina che spiega il motore
 * (/admin/motore) deve dire un numero VERO. Scriverlo a mano lì vorrebbe
 * dire averne due, e il secondo invecchia in silenzio al primo paese
 * aggiunto. È la stessa lezione dei "58 casi" della mappa.
 */
export function quantiNeb(): number {
  return Object.keys(NEB_PER_PAESE).length;
}

export function nebPerPaese(paese: string | null | undefined): Neb | null {
  if (!paese) return null;
  return NEB_PER_PAESE[paese.trim()] ?? null;
}

/** Come si nomina l'ente dentro una frase: "l'ENAC", "la DGAC"... */
export function nomeBreveNeb(neb: Neb): string {
  return neb.sigla ?? neb.nome;
}
