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

export const VERSIONE_REGOLE = "2026.08.2";

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
  // Dati che non combaciano fra fonti: non si vende su un dato conteso.
  if (f.fontiDiscordanti) {
    return incerto(
      "Le due fonti dati non concordano sull'orario di arrivo. Non vendiamo su un dato incerto: riprova più tardi, il controllo resta gratuito.",
    );
  }

  if (f.stato === "sconosciuto") {
    return incerto(
      "Non abbiamo trovato dati affidabili su questo volo. Controlla numero e data; se sono giusti, riprova più tardi.",
    );
  }

  /* Cancellazione: l'eleggibilità dipende da QUANDO la compagnia ti ha
     avvisato (meno di 14 giorni prima), e questo un'API non può saperlo:
     lo sai solo tu. Finché non raccogliamo quel dato dall'utente (v1.1),
     un volo cancellato è per definizione incerto: MAI vendere sul giallo. */
  if (f.stato === "cancellato") {
    return incerto(
      "Questo volo risulta cancellato. La compensazione dipende da quando ti hanno avvisato: è il prossimo pezzo che costruiamo. Per ora non ti facciamo pagare niente.",
    );
  }

  if (f.stato === "dirottato") {
    return incerto(
      "Questo volo risulta dirottato su un altro aeroporto. È un caso da guardare a mano: non ti facciamo pagare niente.",
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
      "L'orario di arrivo di questo volo non è confermato dal tracciamento. Non diamo verdetti su dati non verificati: riprova più tardi, il controllo resta gratuito.",
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

  /* Le fasce del Regolamento: fino a 1500 km → 250€; fra 1500 e 3500 → 400€;
     oltre 3500 → 600€, MA ridotto del 50% (300€) se il ritardo è sotto le
     4 ore. La riduzione esiste solo sul lungo raggio. */
  const km = f.kmOrtodromica;
  const importo =
    km <= SOGLIA_CORTO_RAGGIO_KM
      ? (250 as const)
      : km <= SOGLIA_LUNGO_RAGGIO_KM
        ? (400 as const)
        : ritardo < SOGLIA_RIDUZIONE_MINUTI
          ? (300 as const)
          : (600 as const);

  return {
    esito: "idoneo",
    importo,
    ritardoMinuti: ritardo,
    motivo: `Arrivo con ${Math.floor(ritardo / 60)}h${String(ritardo % 60).padStart(2, "0")} di ritardo su una tratta di ${Math.round(km)} km: fascia da ${importo}€. Restano da verificare le circostanze straordinarie, che può invocare solo la compagnia.`,
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
