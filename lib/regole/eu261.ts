/**
 * Il motore di eleggibilità CE 261/2004. IL CUORE DEL PRODOTTO.
 *
 * TRE REGOLE NON NEGOZIABILI (da SPEC.md §4):
 * 1. Qui non entra MAI l'AI. Il 261 è un albero di if: ritardo, distanza,
 *    stato. Un modello probabilistico direbbe "idoneo" a chi non lo è,
 *    quello pagherebbe 14,90€ per niente, e il prodotto sarebbe morto.
 * 2. TRE stati, mai due: idoneo (si vende) · incerto (NON si vende, si
 *    spiega) · non_idoneo (gratis, risposta chiara). Nel dubbio: incerto.
 * 3. Ogni verdetto porta la versione delle regole. Quando la riforma UE
 *    entra in vigore (~agosto 2027) si scrive la 2027.x e i casi vecchi
 *    restano valutati con le regole del loro tempo.
 *
 * La prova di questo file è `prove/eu261.spec.ts` (il golden set):
 * falsi positivi = 0 è la soglia che blocca. Se tocchi una riga qui,
 * i casi d'oro devono passare tutti.
 */

import { ambitoCE261, vettoreConLicenzaUE, zonaDiScalo } from "./territorio";

import { seSiPaga } from "@/lib/check/ingresso";
export const VERSIONE_REGOLE = "2026.08.8";

/** Soglia del ritardo all'ARRIVO (non alla partenza), in minuti. */
const SOGLIA_MINUTI = 180;
/** Sopra questa distanza, un ritardo di 3-4h vale il 50% (300€, non 600€). */
const SOGLIA_LUNGO_RAGGIO_KM = 3500;
const SOGLIA_CORTO_RAGGIO_KM = 1500;
/** Riduzione 50% lungo raggio: sotto le 4 ore di ritardo. */
const SOGLIA_RIDUZIONE_MINUTI = 240;

/**
 * Il fatto oggettivo, come esce dallo strato di verifica (lib/voli/).
 * Il motore giudica SOLO su questo: mai su testo libero, mai su stime.
 */
export type FattoVolo = {
  voloIata: string; //           "FR8321"
  dataLocale: string; //         "2026-08-14" (data di partenza, ora locale)
  /** Chi ha OPERATO il volo: il reclamo va a lui, non a chi ha venduto. */
  vettoreOperativo: string;
  vettoreMarketing?: string | null;
  /* LA TRATTA, in chiaro. Serve a parlare come una persona: nessuno
     ricorda "FR4001", tutti ricordano "Bergamo → Lanzarote" (regola
     dell'utente medio, Valerio 8/08). Null quando il fornitore non la dà. */
  partenzaIata?: string | null;
  partenzaCitta?: string | null;
  arrivoIata?: string | null;
  arrivoCitta?: string | null;
  /**
   * Il PAESE dei due scali in codice ISO a due lettere, e la sigla ICAO,
   * come li manda il fornitore insieme al volo. Servono al cancello
   * territoriale: il nostro archivio degli scali è fermo al 2017 e uno
   * scalo che non ha (Berlino Brandeburgo, per dirne uno) faceva uscire
   * "non riconosciamo l'aeroporto di partenza" su un volo chiarissimo.
   * Il paese arriva dalla stessa risposta del volo: non invecchia.
   */
  partenzaPaese?: string | null;
  arrivoPaese?: string | null;
  partenzaIcao?: string | null;
  arrivoIcao?: string | null;
  arrivoPrevistoUtc: string | null;
  arrivoEffettivoUtc: string | null;
  stato: "atterrato" | "cancellato" | "dirottato" | "sconosciuto";
  /** Distanza ortodromica della tratta. Decide la fascia. */
  kmOrtodromica: number | null;
  /** Vero se due fonti indipendenti discordano di più di 15 minuti. */
  fontiDiscordanti?: boolean;
  /**
   * Vero SOLO quando l'orario effettivo è certificato dal tracciamento del
   * fornitore (AeroDataBox: "Live" dentro arrival.quality). Qualunque altro
   * valore, undefined compreso, vale "non verificato": su un orario che può
   * essere una stima non si dà NESSUN verdetto (regola del 07/08, dal test
   * reale di Valerio: senza Live niente vendita).
   */
  orarioVerificato?: boolean;
  /**
   * Vero quando il numero è venduto in codeshare e il fornitore non sa dire
   * chi ha OPERATO il volo: il reclamo andrebbe alla compagnia sbagliata.
   */
  vettoreDaDeterminare?: boolean;
  /**
   * Vero se chi ha OPERATO il volo ha licenza europea. Serve solo quando si
   * parte da un paese terzo e si arriva in Europa (art. 3, par. 1, lett. b).
   * Se manca, il motore lo ricava dalla tabella delle compagnie; se non lo
   * sa nemmeno lì, il caso resta incerto.
   */
  vettoreUE?: boolean | null;
  /**
   * Vero quando la data del volo coincide con uno sciopero del trasporto
   * aereo noto (tabella `scioperi`, fonti pubbliche: CGS, MIT, ENAC).
   * Regola v1 di Valerio (8/08): sciopero noto = incerto, non si vende.
   * Distinguere personale di compagnia (non è circostanza straordinaria)
   * da ATC esterno (lo è) richiede la verifica umana: shadow mode.
   */
  scioperoNoto?: boolean;
  fonte: string;
};

export type Verdetto =
  | {
      esito: "idoneo";
      importo: 250 | 300 | 400 | 600;
      ritardoMinuti: number;
      motivo: string;
      versioneRegole: string;
    }
  | { esito: "incerto"; motivo: string; versioneRegole: string }
  | {
      esito: "non_idoneo";
      ritardoMinuti: number | null;
      motivo: string;
      versioneRegole: string;
    };

const incerto = (motivo: string): Verdetto => ({
  esito: "incerto",
  motivo,
  versioneRegole: VERSIONE_REGOLE,
});

const nonIdoneo = (ritardoMinuti: number | null, motivo: string): Verdetto => ({
  esito: "non_idoneo",
  ritardoMinuti,
  motivo,
  versioneRegole: VERSIONE_REGOLE,
});

/**
 * Da minuti a parole: "3 h e 52 min". Prima era "3h52", e Valerio ha
 * ragione: appiccicato non si capisce. Un'ora tonda resta "3 h".
 */
export function formattaMinuti(min: number): string {
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h e ${m} min`;
}

/** Minuti fra previsto ed effettivo. Positivo = in ritardo. */
export function minutiRitardo(previstoUtc: string, effettivoUtc: string): number | null {
  const p = Date.parse(previstoUtc);
  const e = Date.parse(effettivoUtc);
  if (!Number.isFinite(p) || !Number.isFinite(e)) return null;
  return Math.round((e - p) / 60_000);
}

/**
 * La valutazione. Pura: stesso fatto, stesso verdetto, per sempre.
 */
export function valuta(f: FattoVolo): Verdetto {
  /* IL CANCELLO TERRITORIALE, PRIMA DI TUTTO IL RESTO (art. 3, par. 1).
     Se il regolamento non si applica a questo volo, il ritardo non conta
     niente: un New York → Toronto con quattro ore di ritardo non dà
     nessuna compensazione europea. Senza questo controllo il motore lo
     dichiarava idoneo a 600 euro, ed è il falso positivo che la regola
     numero uno vieta. Dove non siamo sicuri esce incerto, mai idoneo. */
  const partenza = {
    iata: f.partenzaIata,
    paese: f.partenzaPaese,
    icao: f.partenzaIcao,
  };
  const arrivo = { iata: f.arrivoIata, paese: f.arrivoPaese, icao: f.arrivoIcao };
  const ambito = ambitoCE261(
    partenza,
    arrivo,
    f.vettoreUE ?? vettoreConLicenzaUE(f.vettoreOperativo),
  );
  if (!ambito.dentro) {
    /* Il ritardo non si mostra: fuori ambito è irrilevante, e stamparlo
       farebbe credere che manchi poco per avere diritto a qualcosa. */
    return ambito.certo ? nonIdoneo(null, ambito.motivo) : incerto(ambito.motivo);
  }

  // Dati che non combaciano fra fonti: non si vende su un dato conteso.
  if (f.fontiDiscordanti) {
    return incerto(
      seSiPaga(
        "Le due fonti dati non concordano sull'orario di arrivo. Non diamo un verdetto su un dato conteso: riprova più tardi, questa analisi non si consuma e il credito resta.",
        "Le due fonti dati non concordano sull'orario di arrivo. Non vendiamo su un dato incerto: riprova più tardi, il controllo resta gratuito.",
      ),
    );
  }

  if (f.stato === "sconosciuto") {
    return incerto(
      "Non abbiamo trovato dati affidabili su questo volo. Controlla numero e data; se sono giusti, riprova più tardi.",
    );
  }

  /* Cancellazione: l'eleggibilità dipende da QUANDO la compagnia ti ha
     avvisato e da com'è andata la riprotezione (art. 5), e un'API non può
     saperlo: lo sai solo tu. Qui il verdetto resta incerto, ma NON è un
     vicolo cieco: la pagina del risultato fa le due domande e chiude il
     caso con `lib/regole/cancellato.ts`. La frase "risulta cancellato" è
     il segnale che quel componente cerca: non cambiarla alla leggera. */
  if (f.stato === "cancellato") {
    return incerto(
      "Questo volo risulta cancellato. La compensazione dipende da quando la compagnia ti ha avvisato e dal volo alternativo che ti ha proposto: due cose che negli archivi di volo non esistono, le sai solo tu. Rispondi alle due domande qui sotto e ti dico subito se ti spetta. Il rimborso del biglietto o un volo alternativo, invece, si chiedono comunque alla compagnia.",
    );
  }

  if (f.stato === "dirottato") {
    return incerto(
      "Questo volo risulta atterrato in un aeroporto diverso da quello previsto. Il ritardo si misura all'arrivo nella destinazione finale del biglietto, e il tracciamento qui non basta a certificarlo. Quindi il caso è incerto e non paghi niente.",
    );
  }

  if (!f.arrivoPrevistoUtc || !f.arrivoEffettivoUtc) {
    return incerto(
      "Manca l'orario di arrivo previsto o effettivo. Senza il dato oggettivo non diamo verdetti.",
    );
  }

  /* "Senza Live niente vendita": un orario non certificato dal tracciamento
     può essere una stima. Su una stima non si dà nessun verdetto, nemmeno
     un "no": 179 minuti stimati possono essere 185 veri. */
  if (f.orarioVerificato !== true) {
    return incerto(
      seSiPaga(
        "L'orario di arrivo di questo volo non è confermato dal tracciamento. Non diamo verdetti su dati non verificati: riprova più tardi, questa analisi non si consuma e il credito resta.",
        "L'orario di arrivo di questo volo non è confermato dal tracciamento. Non diamo verdetti su dati non verificati: riprova più tardi, il controllo resta gratuito.",
      ),
    );
  }

  const ritardo = minutiRitardo(f.arrivoPrevistoUtc, f.arrivoEffettivoUtc);
  if (ritardo === null) {
    return incerto("Gli orari di questo volo non sono leggibili. Non diamo verdetti su dati rotti.");
  }

  if (ritardo < SOGLIA_MINUTI) {
    const testo =
      ritardo <= 0
        ? `Questo volo è arrivato in orario${ritardo < 0 ? " (in anticipo)" : ""}.`
        : `Questo volo è arrivato con ${ritardo} minuti di ritardo: sotto la soglia delle 3 ore (180 minuti) non spetta la compensazione.`;
    return nonIdoneo(ritardo, testo);
  }

  /* Sopra soglia con sciopero noto quel giorno: l'esito dipende da CHI
     scioperava (personale di compagnia = si paga; ATC esterno = no).
     Distinzione da umano, non da regola: incerto, non si vende. Sotto
     soglia non si arriva qui: il no resta un no, sciopero o non sciopero. */
  if (f.scioperoNoto === true) {
    return incerto(
      "Il ritardo supera le 3 ore, ma nel giorno di questo volo risulta uno sciopero del trasporto aereo: l'esito dipende da chi scioperava e lo verifichiamo a mano. Non ti facciamo pagare niente finché non è chiaro.",
    );
  }

  /* Codeshare non risolto: il ritardo c'è, ma il reclamo deve andare al
     vettore OPERATIVO e il dato non dice chi è. Meglio un incerto onesto
     che una lettera alla compagnia sbagliata. Sotto soglia, invece, il
     "no" resta un no: lì il vettore non cambia niente. */
  if (f.vettoreDaDeterminare) {
    return incerto(
      "Il ritardo supera le 3 ore, ma questo numero di volo è venduto in codeshare: il reclamo deve andare alla compagnia che ha operato, e va determinata con certezza. Lo verifichiamo a mano, non ti facciamo pagare niente.",
    );
  }

  if (f.kmOrtodromica === null || !Number.isFinite(f.kmOrtodromica) || f.kmOrtodromica <= 0) {
    return incerto(
      "Il ritardo supera le 3 ore ma non conosciamo la distanza della tratta, che decide l'importo. Riprova più tardi.",
    );
  }

  /* Le fasce del Regolamento (art. 7 par. 1): fino a 1500 km → 250€;
     oltre 3500 → 600€, MA ridotto del 50% (300€) se il ritardo è sotto
     le 4 ore; in mezzo → 400€.

     ⚠️ L'ECCEZIONE CHE MANCAVA (trovata il 9/08 scrivendo la guida). La
     lettera b) dice "tutte le tratte INTRACOMUNITARIE superiori a 1500 km
     E tutte le altre tratte fra 1500 e 3500 km": quindi un volo che parte
     e arriva dentro lo spazio europeo resta a 400€ ANCHE se è lunghissimo.
     Parigi → Riunione fa 9.300 km ed è Francia-Francia: valgono 400 euro,
     non 600. Prima uscivano 600, cioè si prometteva al passeggero la metà
     in più di quanto la norma gli riconosce. È un falso positivo
     sull'IMPORTO, e la regola numero uno del progetto lo vieta come vieta
     quelli sull'esito. */
  const km = f.kmOrtodromica;
  const importo = fasciaArt7(km, dentroLoSpazioEuropeo(f), ritardo < SOGLIA_RIDUZIONE_MINUTI);

  return {
    esito: "idoneo",
    importo,
    ritardoMinuti: ritardo,
    motivo: `Arrivo con ${formattaMinuti(ritardo)} di ritardo su una tratta di ${Math.round(km)} km: fascia da ${importo}€. Restano da verificare le circostanze straordinarie, che può invocare solo la compagnia.`,
    versioneRegole: VERSIONE_REGOLE,
  };
}

/**
 * Prescrizione STIMATA, mai promessa (SPEC §4): dipende dal paese del
 * vettore e non è una regola sola. Italia: 2 anni. Vettori esteri comuni:
 * finestre più lunghe. Sempre mostrata come stima con avvertenza.
 */
export function scadenzaStimata(dataVolo: string, vettoreOperativo: string): {
  anni: number;
  dataStimata: string;
  avvertenza: string;
} {
  const v = vettoreOperativo.toUpperCase();
  // Vettori con sede in Italia: prescrizione biennale (art. 949 cod. nav.).
  const italiani = ["AZ", "ITA", "XZ", "AEROITALIA", "ITA AIRWAYS"];
  const anni = italiani.some((c) => v.includes(c)) ? 2 : 5;
  const d = new Date(dataVolo + "T12:00:00Z");
  d.setUTCFullYear(d.getUTCFullYear() + anni);
  return {
    anni,
    dataStimata: d.toISOString().slice(0, 10),
    avvertenza:
      "Stima prudente: i termini dipendono dal paese della compagnia e dal giudice competente. Non è un parere legale.",
  };
}

/**
 * LE FASCE DELL'ART. 7, IN UN POSTO SOLO.
 *
 * 🔴 QUESTA REGOLA ESISTEVA IN TRE COPIE, e due erano sbagliate.
 * Qui dentro l'eccezione della lettera b) c'era ed era provata; ma
 * `lib/regole/cancellato.ts` e `lib/regole/dichiarati.ts` avevano ognuno
 * la propria `fascia(km)` che guardava i soli chilometri. Risultato: lo
 * STESSO volo Parigi → Riunione (9.370 km, Francia con Francia) usciva
 * 400€ se in ritardo e 600€ se cancellato o con negato imbarco. Cioè al
 * passeggero si prometteva la metà in più di quanto la norma gli
 * riconosce, e la differenza la scopre la compagnia quando risponde no.
 * Trovato dall'ispezione del 12/08, tre difetti separati con la stessa
 * radice.
 *
 * Una regola scritta in tre punti diventa tre regole diverse al primo
 * cambio: da qui in avanti è una, e la chiamano tutti.
 *
 * @param km distanza della tratta (o dell'intero viaggio, sulla
 *   coincidenza persa: la compensazione si calcola sul viaggio).
 * @param intraUe partenza E arrivo dentro lo spazio europeo: allora
 *   l'art. 7 lett. b) tiene la fascia a 400 per quanto sia lunga.
 * @param riduzione l'art. 7 par. 2 dimezza la fascia quando il ritardo
 *   all'arrivo resta sotto le quattro ore. ⚠️ Vale SOLO sulla fascia da
 *   600: dimezzare una fascia già ridotta a 400 dalla lettera b) sarebbe
 *   applicare due volte lo stesso sconto.
 */
export function fasciaArt7(km: number, intraUe: boolean, riduzione = false): 250 | 300 | 400 | 600 {
  if (km <= SOGLIA_CORTO_RAGGIO_KM) return 250;
  if (intraUe || km <= SOGLIA_LUNGO_RAGGIO_KM) return 400;
  return riduzione ? 300 : 600;
}

/**
 * Il volo sta tutto dentro lo spazio europeo?
 *
 * Serve alla lettera b). Se di uno dei due scali non sappiamo dire la
 * zona, si risponde `false`: dire "no" qui alza la fascia da 400 a 600,
 * quindi la prudenza andrebbe nella direzione opposta... e infatti chi
 * chiama deve avere già passato il cancello territoriale, che senza
 * scali riconosciuti non lascia mai uscire un "idoneo".
 */
export function dentroLoSpazioEuropeo(f: FattoVolo): boolean {
  return (
    zonaDiScalo({ iata: f.partenzaIata, paese: f.partenzaPaese, icao: f.partenzaIcao }) === "ue" &&
    zonaDiScalo({ iata: f.arrivoIata, paese: f.arrivoPaese, icao: f.arrivoIcao }) === "ue"
  );
}
