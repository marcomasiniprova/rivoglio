/**
 * La SECONDA FONTE: i documenti del passeggero, letti da Mistral OCR.
 *
 * Decisione di Valerio (8/08): la seconda fonte non è un'altra API di
 * voli (AviationStack free è solo tempo reale e licenza personale), sono
 * i documenti di chi vola: carta d'imbarco, email della compagnia,
 * comunicazione di ritardo. In un reclamo valgono più di un secondo
 * database: sono prova diretta.
 *
 * DIVISIONE DEI RUOLI, scolpita:
 * - l'OCR (AI) fa UNA cosa: trasforma l'immagine in testo;
 * - l'ESTRAZIONE dei campi è a regex, deterministica;
 * - il CONFRONTO con i dati verificati è deterministico;
 * - il VERDETTO non cambia mai qui: se i documenti discordano, la
 *   pratica va in conferma umana (shadow mode). L'AI non decide MAI.
 */

const MODELLO_OCR = "mistral-ocr-latest";

export type EstrattoDocumento = {
  /** "FR4001" se trovato nel documento. */
  volo: string | null;
  /** "2026-08-06" se trovata. */
  data: string | null;
  /** Orari "HH:MM" trovati nel testo (max 6, in ordine di apparizione). */
  orari: string[];
  /** Le prime ~40 parole, per l'occhio umano in admin. */
  anteprima: string;
};

export type ConfrontoDocumento = {
  esito: "concorde" | "discorde" | "illeggibile";
  /** Cosa combacia e cosa no, per l'evento e per l'admin. */
  dettagli: string;
  estratto: EstrattoDocumento | null;
};

/** OCR via API Mistral: dentro base64, fuori il testo markdown. */
export async function testoDaDocumento(
  base64: string,
  tipoMime: string,
): Promise<string | null> {
  const chiave = process.env.MISTRAL_API_KEY;
  if (!chiave) return null;
  try {
    const r = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chiave}`,
      },
      body: JSON.stringify({
        model: MODELLO_OCR,
        document: tipoMime === "application/pdf"
          ? { type: "document_url", document_url: `data:${tipoMime};base64,${base64}` }
          : { type: "image_url", image_url: `data:${tipoMime};base64,${base64}` },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!r.ok) {
      console.warn("[ocr] Mistral ha risposto", r.status);
      return null;
    }
    const dati = (await r.json()) as { pages?: { markdown?: string }[] };
    const testo = (dati.pages ?? [])
      .map((p) => p.markdown ?? "")
      .join("\n")
      .trim();
    return testo || null;
  } catch (e) {
    console.warn("[ocr] chiamata fallita:", e);
    return null;
  }
}

/** Estrazione DETERMINISTICA dei campi dal testo OCR. Zero AI qui. */
export function estraiCampi(testo: string): EstrattoDocumento {
  // numero volo: 2 alfanumerici + 1-4 cifre (FR4001, U2 1234, AZ 610)
  const voloTrovato = testo.match(/\b([A-Z][A-Z0-9])\s?0*([0-9]{1,4})\b/);
  // date: 06/08/2026, 2026-08-06, 6 AGO 2026, 06AUG
  const dataIso = testo.match(/\b(20\d{2})-([01]\d)-([0-3]\d)\b/);
  const dataIt = testo.match(/\b([0-3]?\d)[/.]([01]?\d)[/.](20\d{2})\b/);
  let data: string | null = null;
  if (dataIso) data = `${dataIso[1]}-${dataIso[2]}-${dataIso[3]}`;
  else if (dataIt) {
    const g = dataIt[1].padStart(2, "0");
    const m = dataIt[2].padStart(2, "0");
    data = `${dataIt[3]}-${m}-${g}`;
  }
  const orari = [...testo.matchAll(/\b([0-2]\d):([0-5]\d)\b/g)]
    .map((m) => `${m[1]}:${m[2]}`)
    .slice(0, 6);
  return {
    volo: voloTrovato ? `${voloTrovato[1]}${voloTrovato[2]}`.toUpperCase() : null,
    data,
    orari,
    anteprima: testo.split(/\s+/).slice(0, 40).join(" "),
  };
}

/**
 * Il confronto coi dati verificati del volo. Deterministico:
 * - volo E data combaciano → concorde;
 * - uno dei due è diverso → discorde (conferma umana);
 * - non si legge niente di utile → illeggibile (non sporca il verdetto).
 */
export function confrontaConVerifica(
  estratto: EstrattoDocumento,
  voloVerificato: string,
  dataVerificata: string,
): ConfrontoDocumento {
  if (!estratto.volo && !estratto.data) {
    return {
      esito: "illeggibile",
      dettagli: "Dal documento non si leggono volo o data.",
      estratto,
    };
  }
  const voloOk = estratto.volo === null || estratto.volo === voloVerificato.toUpperCase();
  const dataOk = estratto.data === null || estratto.data === dataVerificata;
  if (voloOk && dataOk) {
    const visti = [
      estratto.volo ? `volo ${estratto.volo}` : null,
      estratto.data ? `data ${estratto.data}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    return {
      esito: "concorde",
      dettagli: `Il documento concorda coi dati verificati (${visti}).`,
      estratto,
    };
  }
  const problemi: string[] = [];
  if (!voloOk) problemi.push(`volo nel documento ${estratto.volo}, verificato ${voloVerificato}`);
  if (!dataOk) problemi.push(`data nel documento ${estratto.data}, verificata ${dataVerificata}`);
  return {
    esito: "discorde",
    dettagli: `Il documento NON concorda: ${problemi.join("; ")}. Serve la verifica umana.`,
    estratto,
  };
}
