import type { Sciopero } from "@/lib/scioperi/scioperi";

/**
 * COSA VUOL DIRE, PER TE, QUEL TIPO DI SCIOPERO.
 *
 * ⚠️ Qui NON si dà un verdetto. Il verdetto lo dà il motore, e sui giorni
 * di sciopero il motore risponde "incerto" per costruzione: chi scioperava
 * decide l'esito, e quella distinzione la fa una persona in admin. Questo
 * file serve a spiegare al passeggero **come funziona la regola**, non a
 * dirgli come finirà il suo caso.
 *
 * La distinzione che conta (e che i portali saltano): lo sciopero del
 * personale DELLA COMPAGNIA in linea di principio non è una circostanza
 * eccezionale, perché fa parte della normale gestione dell'impresa. Uno
 * sciopero dei controllori del traffico aereo, o generale, viene dall'esterno
 * e di solito lo è. In tutti i casi resta a carico della compagnia provare
 * il legame fra l'agitazione e IL TUO volo: non basta dire che quel giorno
 * c'era uno sciopero.
 *
 * Fonti nel piede delle pagine evento.
 */

export type PesoCompensazione =
  /** La compensazione di solito spetta: tocca alla compagnia dimostrare il contrario. */
  | "di-solito-spetta"
  /** Di solito la compagnia se ne libera, ma deve provarlo caso per caso. */
  | "di-solito-non-spetta"
  /** Dipende da chi ha proclamato e da come ha inciso: si guarda il singolo volo. */
  | "dipende";

export type Significato = {
  /** Come si chiama in parole, non in gergo sindacale. */
  etichetta: string;
  /** Una riga: chi si è fermato. */
  chi: string;
  peso: PesoCompensazione;
  /** La spiegazione lunga, per il lettore. */
  spiegazione: string;
};

export const SIGNIFICATO: Record<Sciopero["tipo"], Significato> = {
  personale_compagnia: {
    etichetta: "Personale della compagnia",
    chi: "Piloti, assistenti di volo o personale di terra della compagnia stessa.",
    peso: "di-solito-spetta",
    spiegazione:
      "È lo sciopero interno all'azienda che ti ha venduto il volo. In linea di principio non è una circostanza eccezionale, perché rientra nella normale gestione dell'impresa: la compagnia sapeva della proclamazione e poteva organizzarsi. Se il tuo volo salta o arriva oltre le tre ore, la compensazione di solito spetta, e per non pagarla la compagnia deve dimostrare qualcosa di più che l'esistenza dell'agitazione.",
  },
  atc_esterno: {
    etichetta: "Controllori del traffico aereo",
    chi: "Il personale che gestisce lo spazio aereo, non dipendente dalla compagnia.",
    peso: "di-solito-non-spetta",
    spiegazione:
      "Qui l'agitazione arriva da fuori: la compagnia non ha voce in capitolo sui controllori. Di solito viene riconosciuta come circostanza eccezionale, e in quel caso la compensazione non spetta. Attenzione però: la compagnia deve comunque provare che quello sciopero ha inciso proprio sul tuo volo, e resta obbligata all'assistenza, al rimborso o al volo alternativo.",
  },
  handling: {
    etichetta: "Personale di terra dell'aeroporto",
    chi: "Chi carica i bagagli, spinge gli aerei e gestisce i banchi, per conto dell'aeroporto o di una società di servizi.",
    peso: "dipende",
    spiegazione:
      "È il caso più contestato: dipende da chi ha proclamato l'agitazione e da quanto quella società lavora per la compagnia. Non si decide leggendo il calendario, si decide guardando il singolo volo. Chiedila comunque: l'onere di dimostrare la circostanza eccezionale è della compagnia, non tuo.",
  },
  generale: {
    etichetta: "Sciopero generale",
    chi: "Tutte le categorie, trasporto aereo compreso.",
    peso: "dipende",
    spiegazione:
      "Uno sciopero generale tocca settori diversi e non tutti incidono allo stesso modo sul tuo volo. Di solito la compagnia lo invoca come circostanza eccezionale, ma deve dimostrare il legame concreto con la cancellazione o il ritardo del tuo volo, non con la giornata in generale.",
  },
  altro: {
    etichetta: "Altra agitazione",
    chi: "Un'agitazione che non rientra nelle categorie qui sopra.",
    peso: "dipende",
    spiegazione:
      "Va guardata caso per caso. La regola non cambia: la compagnia deve provare la circostanza eccezionale e il suo effetto sul tuo volo, e nel frattempo ti deve assistenza, rimborso o un volo alternativo.",
  },
};

/** Il colore del semaforo, per l'interfaccia. */
export const TINTA: Record<PesoCompensazione, { pillola: string; parola: string }> = {
  "di-solito-spetta": {
    pillola: "border-verde/40 bg-verde/10 text-verde-scuro",
    parola: "La compensazione di solito spetta",
  },
  "di-solito-non-spetta": {
    pillola: "border-verde-notte/20 bg-verde-notte/6 text-verde-notte/70",
    parola: "La compensazione di solito non spetta",
  },
  dipende: {
    pillola: "border-sole/60 bg-sole/15 text-verde-notte",
    parola: "Dipende dal singolo volo",
  },
};

/** Le fasce in cui i voli sono garantiti anche durante uno sciopero (ENAC). */
export const FASCE_GARANTITE = ["7:00 - 10:00", "18:00 - 21:00"] as const;

/** Le fonti che reggono tutte le pagine evento sugli scioperi. */
export const FONTI_SCIOPERO = [
  {
    titolo: "ENAC, Scioperi nel trasporto aereo: fasce di tutela e voli garantiti",
    url: "https://www.enac.gov.it/trasporto-aereo/diritto-alla-mobilita/scioperi-nel-trasporto-aereo/",
  },
  {
    titolo:
      "ENAC, Ritardo prolungato del volo: importi della compensazione, assistenza e rimborso",
    url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
  },
  {
    titolo:
      "Lo sciopero indicato genericamente non basta a esonerare il vettore",
    url: "https://www.brocardi.it/notizie-giuridiche/voli-compagnia-negarti-rimborso-volo-annullato-solo-perche-sciopero/7131.html",
  },
  {
    titolo:
      "Il vettore deve provare il nesso fra lo sciopero e la cancellazione del singolo volo",
    url: "https://news.avvocatoandreani.it/articoli/sciopero-voli-cancellati-vettore-deve-provare-incidenza-sciopero-singolo-volo-cancellato-108749.html",
  },
  {
    titolo:
      "Cassazione, ordinanza n. 17644/2025: l'onere della prova della circostanza eccezionale è del vettore",
    url: "https://www.studiolegalebianucci.it/it/blog/4451-ritardo-aereo-e-risarcimento-la-cassazione-chiarisce-l-onere-della-prova-ordinanza-n-17644-2025",
  },
] as const;
