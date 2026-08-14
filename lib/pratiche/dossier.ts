import type { EventoPratica, Pratica } from "./pratiche";
import { schedaRifiuto, type MotivoRifiuto } from "./rifiuto";
import { EVENTO_CARICATO, EVENTO_SALTATO } from "./documenti";

/**
 * IL FASCICOLO DEL CASO: tutto quello che sappiamo di QUESTA persona.
 *
 * 🔴 Valerio, 13/08: «ogni utente ha una situazione diversa e io voglio
 * offrire il meglio ai miei utenti. Adesso mi sa che per ogni utente non
 * viene salvato un dossier, uno storico preciso della sua situazione, di
 * conseguenza la contro-risposta non sarà personalizzata, non avrà
 * contesto».
 *
 * Aveva ragione a metà, ed è la metà che conta. I dati c'erano tutti
 * (verifica, volo, pratica, cronologia), ma erano sparsi in quattro
 * tabelle e nessuno li aveva mai messi insieme in una cosa sola. Quindi:
 * - chi scriveva la replica (finora un testo fisso per motivo) non
 *   sapeva niente del caso, se non il motivo del no;
 * - e l'utente non aveva nessun posto dove leggere il proprio caso per
 *   intero.
 *
 * Questo file monta il fascicolo. Da qui in avanti lo leggono due:
 * l'AI, PRIMA di scrivere qualsiasi cosa, e l'utente, in cima alla
 * pagina della pratica (scelta di Valerio col popup, 13/08: la
 * trasparenza che vendiamo, applicata al suo caso).
 *
 * ⚠️ È SOLO LETTURA E SOLO RIORGANIZZAZIONE. Qui dentro non si calcola
 * nessun verdetto e non si inventa nessun dato: quello che non sappiamo
 * resta `null` e si scrive «non lo sappiamo», mai zero e mai una stima
 * travestita da fatto. Un fascicolo che riempie i buchi è peggio di un
 * fascicolo con dei buchi, perché l'AI legge anche quelli.
 */

/** Una riga della storia, già scritta in italiano. */
export type VoceStoria = {
  quando: string;
  cosa: string;
  nota: string | null;
};

export type Dossier = {
  /* ---- il volo, come lo racconterebbe una persona */
  volo: {
    numero: string | null;
    data: string | null;
    tratta: string | null;
    compagnia: string | null;
    /** Minuti di ritardo all'arrivo, verificati. Null = non li abbiamo. */
    ritardoMinuti: number | null;
    /** Km in linea d'aria, se calcolati. */
    km: number | null;
    /** Da dove viene il dato: serve a dire quanto è solido. */
    fonte: string | null;
    arrivoPrevisto: string | null;
    arrivoEffettivo: string | null;
  };
  /* ---- cosa gli spetta e perché */
  diritto: {
    fascia: number | null;
    passeggeri: number;
    totale: number | null;
    /** La riga con cui il motore ha motivato il verdetto. */
    motivoMotore: string | null;
    versioneRegole: string | null;
  };
  /* ---- a che punto è */
  percorso: {
    stato: string;
    reclamoInviatoIl: string | null;
    documentoCaricato: boolean;
    documentoSaltato: boolean;
    /** L'esito del confronto fra i suoi documenti e gli orari archiviati. */
    documentoEsito: string | null;
  };
  /* ---- cosa ha risposto la compagnia */
  rifiuto: {
    motivo: MotivoRifiuto | null;
    etichetta: string | null;
    /** Quanto regge il loro no, dal nostro punto di vista. */
    peso: "debole" | "dipende" | "solido" | null;
    dichiaratoIl: string | null;
    /** La loro risposta, parola per parola, se ce l'ha data. */
    testoLoro: string | null;
  };
  storia: VoceStoria[];
};

/** L'evento con dentro la risposta della compagnia, parola per parola. */
export const EVENTO_TESTO_RIFIUTO = "rifiuto_testo";

/** L'evento con dentro l'analisi dell'AI sulla loro risposta (JSON). */
export const EVENTO_ANALISI_RIFIUTO = "rifiuto_analisi";

/**
 * L'ultima nota di un tipo di evento.
 *
 * ⚠️ L'ULTIMA, non la prima: se il cliente incolla una seconda risposta
 * (perché la compagnia ha scritto di nuovo) è quella che vale. Gli eventi
 * arrivano già in ordine crescente da `eventiPratica`.
 */
export function ultimaNota(
  /* Basta la forma minima: la scheda che serve all'app legge solo tipo,
     nota e data, e non deve essere costretta a chiedere colonne che non
     le servono per poter usare questa funzione. */
  eventi: { tipo: string; nota: string | null }[],
  tipo: string,
): string | null {
  for (let i = eventi.length - 1; i >= 0; i--) {
    if (eventi[i].tipo === tipo && eventi[i].nota) return eventi[i].nota;
  }
  return null;
}

/**
 * Il paragrafo su misura dell'ultima analisi, se c'è ed è passato dal
 * controllo. Lo legge la lettera, che è l'unico posto dove serve.
 *
 * ⚠️ Torna `null` a ogni minimo dubbio, anche su un JSON malformato: la
 * lettera senza questo paragrafo è comunque completa e verificata, la
 * lettera con dentro spazzatura no.
 */
export function paragrafoSuMisura(eventi: { tipo: string; nota: string | null }[]): string | null {
  const grezzo = ultimaNota(eventi, EVENTO_ANALISI_RIFIUTO);
  if (!grezzo) return null;
  try {
    const a = JSON.parse(grezzo) as { paragrafo?: unknown };
    return typeof a.paragrafo === "string" && a.paragrafo.trim().length > 80
      ? a.paragrafo.trim()
      : null;
  } catch {
    return null;
  }
}

/** Cosa abbiamo capito della loro risposta, per mostrarlo all'utente. */
export type LetturaRisposta = {
  riassunto: string;
  fattiLoro: string[];
  sicurezza: "alta" | "media" | "bassa";
  suMisura: boolean;
};

export function letturaRisposta(
  eventi: { tipo: string; nota: string | null }[],
): LetturaRisposta | null {
  const grezzo = ultimaNota(eventi, EVENTO_ANALISI_RIFIUTO);
  if (!grezzo) return null;
  try {
    const a = JSON.parse(grezzo) as Record<string, unknown>;
    if (typeof a.riassunto !== "string") return null;
    return {
      riassunto: a.riassunto,
      fattiLoro: Array.isArray(a.fattiLoro)
        ? a.fattiLoro.filter((x): x is string => typeof x === "string")
        : [],
      sicurezza:
        a.sicurezza === "alta" || a.sicurezza === "media" || a.sicurezza === "bassa"
          ? a.sicurezza
          : "bassa",
      suMisura: typeof a.paragrafo === "string" && a.paragrafo.trim().length > 80,
    };
  } catch {
    return null;
  }
}

/** I fatti del volo che servono al fascicolo, già letti dal database. */
export type VoloDossier = {
  volo_iata?: string | null;
  data_locale?: string | null;
  vettore_operativo?: string | null;
  partenza_citta?: string | null;
  arrivo_citta?: string | null;
  km_ortodromica?: number | null;
  fonte?: string | null;
  arrivo_previsto_utc?: string | null;
  arrivo_effettivo_utc?: string | null;
};

export type VerificaDossier = {
  importo?: number | null;
  ritardo_minuti?: number | null;
  motivo?: string | null;
  versione_regole?: string | null;
};

/** Le etichette in italiano della cronologia, passate da chi ha il COPY. */
export type EtichetteEventi = Record<string, string>;

const oraIt = (iso: string | null | undefined): string | null =>
  iso
    ? new Date(iso).toLocaleString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Rome",
      })
    : null;

export function costruisciDossier({
  pratica,
  volo,
  verifica,
  eventi,
  etichette = {},
}: {
  pratica: Pratica;
  volo: VoloDossier | null;
  verifica: VerificaDossier | null;
  eventi: EventoPratica[];
  etichette?: EtichetteEventi;
}): Dossier {
  const scheda = schedaRifiuto(pratica.rifiuto_motivo ?? null);
  const passeggeri = Math.max(1, pratica.passeggeri?.length ?? 1);
  const fascia = pratica.importo_fascia ?? verifica?.importo ?? null;

  const tratta =
    volo?.partenza_citta && volo?.arrivo_citta
      ? `${volo.partenza_citta} → ${volo.arrivo_citta}`
      : null;

  /* L'esito del confronto documenti sta nella nota dell'evento: è già
     scritto in italiano da chi l'ha fatto, e riscriverlo qui vorrebbe
     dire tenerne due versioni. */
  const notaDocumento = ultimaNota(eventi, EVENTO_CARICATO);

  return {
    volo: {
      numero: volo?.volo_iata ?? null,
      data: volo?.data_locale ?? null,
      tratta,
      compagnia: volo?.vettore_operativo ?? null,
      ritardoMinuti: verifica?.ritardo_minuti ?? null,
      km: volo?.km_ortodromica ?? null,
      fonte: volo?.fonte ?? null,
      arrivoPrevisto: volo?.arrivo_previsto_utc ?? null,
      arrivoEffettivo: volo?.arrivo_effettivo_utc ?? null,
    },
    diritto: {
      fascia,
      passeggeri,
      totale: fascia === null ? null : fascia * passeggeri,
      motivoMotore: verifica?.motivo ?? null,
      versioneRegole: verifica?.versione_regole ?? null,
    },
    percorso: {
      stato: pratica.stato,
      reclamoInviatoIl: pratica.inviata_il ?? null,
      documentoCaricato: eventi.some((e) => e.tipo === EVENTO_CARICATO),
      documentoSaltato: eventi.some((e) => e.tipo === EVENTO_SALTATO),
      documentoEsito: notaDocumento,
    },
    rifiuto: (() => {
      const testoLoro = ultimaNota(eventi, EVENTO_TESTO_RIFIUTO);
      /* ⚠️ «silenzio» e una risposta incollata non convivono. Se una
         vecchia pratica porta la contraddizione (motivo «silenzio» ma il
         testo della loro risposta c'è), a valere è il TESTO, che è un
         fatto: il silenzio era una scelta, e sbagliata. Da qui il difetto
         non nasce più (lo blocca la rotta del rifiuto), ma il fascicolo
         non deve MAI dire «non hanno risposto» con la loro risposta lì
         sotto (Valerio, 14/08). */
      const incoerente = testoLoro !== null && pratica.rifiuto_motivo === "silenzio";
      const sch = incoerente ? null : scheda;
      return {
        motivo: incoerente ? null : ((pratica.rifiuto_motivo as MotivoRifiuto | null) ?? null),
        etichetta: sch?.etichetta ?? null,
        peso: sch?.peso ?? null,
        dichiaratoIl: pratica.rifiuto_il ?? null,
        testoLoro,
      };
    })(),
    storia: eventi.map((e) => ({
      quando: oraIt(e.creato_il) ?? e.creato_il,
      cosa: etichette[e.tipo] ?? e.tipo,
      nota: e.nota,
    })),
  };
}

/**
 * Il fascicolo in parole, per l'AI.
 *
 * ⚠️ NON È UN JSON BUTTATO DENTRO IL PROMPT. Un modello che riceve
 * `{"km_ortodromica": 6500}` deve indovinare cosa vuol dire; uno che
 * riceve «tratta di 6500 km in linea d'aria» no. E soprattutto: qui si
 * scrive «non lo sappiamo» dove non lo sappiamo, così il modello non ha
 * nessuna scusa per riempire il buco da solo.
 */
export function dossierInParole(d: Dossier): string {
  const righe: string[] = [];
  const dice = (etichetta: string, valore: string | number | null | undefined) =>
    righe.push(`${etichetta}: ${valore === null || valore === undefined ? "non lo sappiamo" : valore}`);

  righe.push("## Il volo");
  dice("Numero", d.volo.numero);
  dice("Data", d.volo.data);
  dice("Tratta", d.volo.tratta);
  dice("Compagnia che ha operato", d.volo.compagnia);
  dice(
    "Ritardo all'arrivo verificato",
    d.volo.ritardoMinuti === null ? null : `${d.volo.ritardoMinuti} minuti`,
  );
  dice("Distanza in linea d'aria", d.volo.km === null ? null : `${d.volo.km} km`);
  dice("Arrivo previsto (UTC)", d.volo.arrivoPrevisto);
  dice("Arrivo effettivo (UTC)", d.volo.arrivoEffettivo);
  dice("Fonte del dato", d.volo.fonte);

  righe.push("", "## Cosa gli spetta");
  dice("Fascia per passeggero", d.diritto.fascia === null ? null : `${d.diritto.fascia} euro`);
  dice("Passeggeri nella pratica", d.diritto.passeggeri);
  dice("Totale richiesto", d.diritto.totale === null ? null : `${d.diritto.totale} euro`);
  dice("Motivazione del motore", d.diritto.motivoMotore);

  righe.push("", "## A che punto è");
  dice("Stato della pratica", d.percorso.stato);
  dice("Reclamo inviato il", d.percorso.reclamoInviatoIl);
  dice(
    "Documenti del passeggero",
    d.percorso.documentoCaricato
      ? (d.percorso.documentoEsito ?? "caricati")
      : d.percorso.documentoSaltato
        ? "il passeggero ha dichiarato di non averli"
        : "non ancora caricati",
  );

  righe.push("", "## Cosa ha risposto la compagnia");
  dice("Motivo dichiarato dal passeggero", d.rifiuto.etichetta);
  dice("Quanto regge, secondo noi", d.rifiuto.peso);
  righe.push(
    `Testo della loro risposta: ${
      d.rifiuto.testoLoro ? `\n"""\n${d.rifiuto.testoLoro}\n"""` : "non ce l'ha data"
    }`,
  );

  return righe.join("\n");
}
