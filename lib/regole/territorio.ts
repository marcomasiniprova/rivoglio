/**
 * IL CANCELLO TERRITORIALE: questo volo rientra o no nel CE 261/2004?
 *
 * Perché esiste. Il motore sapeva calcolare il ritardo e la fascia, ma non
 * si chiedeva MAI se il regolamento si applicasse. Un New York → Toronto
 * atterrato con quattro ore di ritardo usciva "idoneo, 600 euro": falso,
 * perché quel volo non è coperto da nessuna norma europea. È esattamente
 * il falso positivo che la regola numero uno del progetto vieta, e costa
 * caro: si vende una lettera per un diritto che non esiste, si rimborsa
 * con la garanzia e si incassa una recensione a una stella.
 *
 * La regola vera (art. 3, par. 1). Conta DA DOVE PARTE L'AEREO, non la
 * nazionalità del passeggero e non la sede della compagnia:
 *
 *   a) partenza da un aeroporto UE/SEE  → coperto SEMPRE, con qualsiasi
 *      compagnia del mondo (Roma → New York con Delta è coperto);
 *   b) partenza da un paese terzo con arrivo in UE/SEE → coperto SOLO se
 *      il vettore che ha OPERATO il volo ha licenza europea;
 *   c) paese terzo → paese terzo → mai coperto.
 *
 * Dove non siamo sicuri diciamo "incerto", mai "idoneo": sbagliare dalla
 * parte di chi non paga è la scelta di sempre.
 *
 * Regioni ultraperiferiche: Canarie, Madeira, Azzorre, Guadalupa, Martinica,
 * Guyana francese, Riunione e Mayotte SONO Unione Europea (art. 349 TFUE) e
 * il regolamento si applica. I paesi e territori d'oltremare invece NO:
 * Groenlandia, Fær Øer, Aruba e le altre Antille, Nuova Caledonia, Polinesia
 * francese, Wallis e Futuna, Saint-Pierre e Miquelon. Gibilterra è fuori
 * dopo la Brexit, come tutto il Regno Unito (che ha una sua norma, la UK261,
 * con importi in sterline: non è questa e non la copriamo).
 */
import aeroporti from "@/lib/dati/aeroporti.json";
import { compagniaPerVettore } from "@/lib/lettera/compagnie";

type Scalo = { paese: string };
const SCALI = aeroporti as Record<string, Scalo | undefined>;

/**
 * I paesi (codice ISO a due lettere, come in `compagnie.ts`) la cui licenza
 * di esercizio vale come "vettore comunitario" ai sensi dell'art. 2, lett. c.
 * Serve SOLO al ramo b) (si parte da fuori e si arriva in Europa).
 *
 * ⚠️ La Svizzera NON è qui, ed è una scelta prudente: applica il regolamento
 * per accordo bilaterale, non come Stato membro, e non ho una fonte
 * verificata sotto mano. Il risultato è che un volo svizzero in arrivo da un
 * paese terzo resta "incerto" invece che idoneo: sbagliamo dalla parte di
 * chi non paga, come sempre. È segnato in ARRETRATI.
 */
const LICENZA_UE = new Set<string>([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "NO", "LI",
]);

/**
 * Chi ha operato il volo ha licenza europea?
 * `null` quando la compagnia non è fra quelle che conosciamo: in quel caso
 * non si indovina, il caso resta incerto.
 */
export function vettoreConLicenzaUE(
  vettoreONumero: string | null | undefined,
): boolean | null {
  const c = compagniaPerVettore(vettoreONumero);
  /* Compagnia non in tabella, o in tabella ma senza paese: non si indovina. */
  if (!c?.paese) return null;
  return LICENZA_UE.has(c.paese);
}

/**
 * Gli Stati dove si applica il regolamento, scritti ESATTAMENTE come li
 * scrive `aeroporti.json` (fonte OpenFlights, nomi in inglese).
 * 27 Stati membri + i tre del SEE (Islanda, Norvegia, Liechtenstein) +
 * le regioni ultraperiferiche che nell'archivio hanno un nome loro.
 * Canarie, Madeira e Azzorre non sono in elenco perché l'archivio le
 * scrive già "Spain" e "Portugal": sono coperte da lì.
 */
const SPAZIO_UE = new Set<string>([
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden",
  // Spazio economico europeo: il regolamento è stato recepito anche lì.
  "Iceland", "Norway", "Liechtenstein",
  // Regioni ultraperiferiche con nome proprio nell'archivio (art. 349 TFUE).
  "Guadeloupe", "Martinique", "French Guiana", "Reunion", "Mayotte",
]);

export type ZonaScalo = "ue" | "terzo" | "sconosciuto";

/** In che zona sta uno scalo, dal suo codice IATA. */
export function zonaDiScalo(iata: string | null | undefined): ZonaScalo {
  if (!iata) return "sconosciuto";
  const scalo = SCALI[iata.trim().toUpperCase()];
  if (!scalo?.paese) return "sconosciuto";
  return SPAZIO_UE.has(scalo.paese) ? "ue" : "terzo";
}

/** Il paese di uno scalo, come lo scrive l'archivio. Serve alla lettera. */
export function paeseDiScalo(iata: string | null | undefined): string | null {
  if (!iata) return null;
  return SCALI[iata.trim().toUpperCase()]?.paese ?? null;
}

export type EsitoAmbito =
  /** Il regolamento si applica: si può procedere col merito. */
  | { dentro: true }
  /** Fuori ambito con certezza: è un "no" definitivo, non un forse. */
  | { dentro: false; certo: true; motivo: string }
  /** Non abbiamo abbastanza per decidere: diventa incerto, non si vende. */
  | { dentro: false; certo: false; motivo: string };

/**
 * Il cancello. Va chiamato PRIMA di guardare ritardo e distanza: se il
 * regolamento non si applica, il ritardo non conta niente.
 *
 * `vettoreUE` è vero solo quando sappiamo con certezza che chi ha operato
 * il volo ha licenza europea. Se non lo sappiamo, sul ramo b) si resta
 * incerti: meglio una vendita persa che una lettera inutile.
 */
export function ambitoCE261(
  partenzaIata: string | null | undefined,
  arrivoIata: string | null | undefined,
  vettoreUE: boolean | null | undefined,
): EsitoAmbito {
  const partenza = zonaDiScalo(partenzaIata);
  const arrivo = zonaDiScalo(arrivoIata);

  // a) si parte dall'Europa: coperto sempre, con qualsiasi compagnia.
  if (partenza === "ue") return { dentro: true };

  if (partenza === "sconosciuto") {
    return {
      dentro: false,
      certo: false,
      motivo:
        "Non riconosciamo l'aeroporto di partenza, quindi non possiamo dire con certezza se il volo rientra nel Regolamento europeo. Il caso resta incerto e non paghi niente.",
    };
  }

  // Da qui in giù la partenza è fuori dall'Europa.

  // c) paese terzo → paese terzo: fuori ambito, e lo si può dire chiaro.
  if (arrivo === "terzo") {
    return {
      dentro: false,
      certo: true,
      motivo:
        "Questo volo parte e arriva fuori dall'Unione Europea, quindi il Regolamento CE 261/2004 non si applica: non c'è una compensazione europea da chiedere. Le regole del paese di partenza possono essere diverse.",
    };
  }

  if (arrivo === "sconosciuto") {
    return {
      dentro: false,
      certo: false,
      motivo:
        "Non riconosciamo l'aeroporto di arrivo, quindi non possiamo dire con certezza se il volo rientra nel Regolamento europeo. Il caso resta incerto e non paghi niente.",
    };
  }

  // b) paese terzo → Europa: dipende dalla licenza del vettore operativo.
  if (vettoreUE === true) return { dentro: true };

  if (vettoreUE === false) {
    return {
      dentro: false,
      certo: true,
      motivo:
        "Questo volo parte da fuori dall'Unione Europea ed è operato da una compagnia non europea: in questo caso il Regolamento CE 261/2004 non si applica, e si applicano invece le regole del paese di partenza.",
    };
  }

  return {
    dentro: false,
    certo: false,
    motivo:
      "Questo volo parte da fuori dall'Unione Europea: la compensazione europea spetta solo se chi ha operato il volo è una compagnia europea, e su questo volo non ce lo sappiamo dire con certezza. Il caso resta incerto e non paghi niente.",
  };
}
