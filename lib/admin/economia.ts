/**
 * IL CONTO ECONOMICO, end to end (richiesta di Valerio, 14/08:
 * «calcolami quanto faccio di soldi e quanto mi costa tutto, dal check alla
 * compensazione»).
 *
 * Regola 2 del progetto: niente numeri inventati. Ogni costo qui sotto ha la
 * sua fonte accanto; quelli che ancora non possiamo sapere (il tasso di
 * rimborso della garanzia: nessuna pratica è chiusa) sono marcati STIMA e si
 * cambiano da un posto solo quando arrivano i dati veri.
 *
 * La cosa che questo conto rende ovvia, ed è la più importante: l'infra-
 * struttura costa pochissimo. I due costi che contano davvero sono la
 * commissione di chi incassa (Polar) e la garanzia. Il resto (dati volo,
 * OCR, email, Supabase, Netlify) è spiccioli. Quindi la profittabilità NON
 * dipende dai costi tecnici: dipende da quanta gente arriva e da quanti
 * reclami vanno a buon fine.
 */

/* ─────────────────────────── RICAVI ─────────────────────────── */

/** Il prezzo della pratica (il check da 1,99 è un anticipo che si scala). */
export const PREZZO_PRATICA = 14.9;
export const PREZZO_FAMIGLIA = 29.9;

/* ──────────────────────── COSTI VARIABILI ───────────────────── */

/**
 * Polar, quando sarà attivo: 5% + 0,50 € a transazione (fonte: PAGAMENTI.md,
 * tariffa nuove organizzazioni). È il costo per pratica più alto di tutti.
 * Il giorno che l'incassatore cambia (Stripe, Paddle...) si aggiornano qui.
 */
export const POLAR_PERCENTO = 0.05;
export const POLAR_FISSO = 0.5;

/**
 * AeroDataBox: piano Premium 150 $/mese per 600.000 richieste, poi
 * 0,00025 $/richiesta (fonte: aerodatabox.com/pricing, verificato 14/08).
 * Con la CACHE un volo vale UNA chiamata anche con 180 passeggeri, e durante
 * un disservizio (quando tutti controllano gli stessi voli) la cache le
 * schiaccia ancora di più. Il costo marginale per check è quindi minuscolo.
 * ~0,00025 $ a richiesta × ~2 richieste (volo + a volte scalo) ≈ 0,0005 €.
 */
export const COSTO_DATI_CHECK = 0.0005; // € per check, stima prudente

/**
 * Mistral OCR: ~1 $ ogni 1000 pagine (stima, listino Mistral). Si usa solo
 * quando l'utente carica la foto della carta d'imbarco: nel check "da foto"
 * e, dopo il pagamento, dentro la pratica. La foto non si salva.
 */
export const COSTO_OCR = 0.001; // € a lettura, stima
/** Stima: quanti check usano la foto della carta (il modo predefinito è la tratta). */
export const QUOTA_CHECK_CON_OCR = 0.2;

/**
 * Resend: piano da 20 $/mese, ~0,0004 € a email. Una pratica manda circa 5
 * email nel tempo (T+0, T+2, T+42, T+56, T+90).
 */
export const COSTO_EMAIL = 0.0004; // € a email
export const EMAIL_PER_PRATICA = 5;

/**
 * ⚠️ LA GARANZIA È IL SECONDO COSTO PIÙ GROSSO, E NON LO SAPPIAMO ANCORA.
 * Scatta se la compagnia rifiuta senza un motivo valido o non risponde nei
 * termini: in quel caso si rimborsa la pratica. Nessuna pratica è ancora
 * chiusa, quindi il tasso vero non esiste. Qui c'è una STIMA prudente del
 * 15%. Nella pagina si mostra anche a 0%, 30% e 50%, così si vede quanto
 * pesa. Si cambia da qui il giorno che i dati veri arrivano.
 */
export const TASSO_RIMBORSO_GARANZIA = 0.15; // STIMA

/* ────────────────────── COSTI FISSI MENSILI ─────────────────── */

/**
 * In euro (i listini sono in dollari, convertiti a ~0,92 €/$). Da aggiornare
 * quando cambiano i piani. Valerio oggi ha già Supabase Pro e Netlify Pro;
 * Resend e AeroDataBox Premium si comprano coi primi grandi volumi.
 */
export const FISSI_MENSILI: Record<string, { euro: number; nota: string }> = {
  supabasePro: { euro: 23, nota: "Supabase Pro, 25 $/mese (ce l'hai)" },
  netlifyPro: { euro: 17, nota: "Netlify Pro, 19 $/mese (ce l'hai)" },
  resend: { euro: 18, nota: "Resend, 20 $/mese (coi primi volumi)" },
  aerodataboxPremium: { euro: 138, nota: "AeroDataBox Premium, 150 $/mese, 600k richieste" },
};

export function fissiMensiliTotale(): number {
  return Object.values(FISSI_MENSILI).reduce((s, v) => s + v.euro, 0);
}

/* ────────────────────────── I CONTI ─────────────────────────── */

/** Il costo di UN check (dati volo + la quota che usa l'OCR). */
export function costoCheck(): number {
  return COSTO_DATI_CHECK + QUOTA_CHECK_CON_OCR * COSTO_OCR;
}

export type ContoPratica = {
  ricavo: number;
  polar: number;
  ocr: number;
  email: number;
  /** La perdita ATTESA per la garanzia, al tasso dato. */
  garanzia: number;
  /** Quel che resta in tasca, per pratica. */
  netto: number;
};

/**
 * Il conto di una singola pratica pagata, al tasso di rimborso dato.
 * Tutto quello che consuma una pratica dal pagamento alla compensazione.
 */
export function contoPratica(
  prezzo: number = PREZZO_PRATICA,
  tassoRimborso: number = TASSO_RIMBORSO_GARANZIA,
): ContoPratica {
  const polar = prezzo * POLAR_PERCENTO + POLAR_FISSO;
  const ocr = COSTO_OCR; // una lettura della carta dentro la pratica
  const email = EMAIL_PER_PRATICA * COSTO_EMAIL;
  const garanzia = prezzo * tassoRimborso;
  const netto = prezzo - polar - ocr - email - garanzia;
  return { ricavo: prezzo, polar, ocr, email, garanzia, netto };
}

export type Scenario = {
  /** La quota di check che diventa una pratica pagata. */
  conversione: number;
  checkAlGiorno: number;
  paganti: number;
  ricavo: number;
  costoDeiCheck: number;
  costiPratiche: number;
  /** Netto al giorno, PRIMA dei costi fissi mensili. */
  nettoGiorno: number;
};

/**
 * Uno scenario: dato quanti check al giorno e a che tasso convertono, quanto
 * si incassa e quanto resta. I costi fissi mensili NON sono qui dentro (sono
 * al giorno una briciola e si tolgono a parte): così si vede il margine vero
 * del meccanismo.
 */
export function scenario(
  checkAlGiorno: number,
  conversione: number,
  tassoRimborso: number = TASSO_RIMBORSO_GARANZIA,
): Scenario {
  const paganti = checkAlGiorno * conversione;
  const conto = contoPratica(PREZZO_PRATICA, tassoRimborso);
  const ricavo = paganti * conto.ricavo;
  const costoDeiCheck = checkAlGiorno * costoCheck();
  const costiPratiche = paganti * (conto.polar + conto.ocr + conto.email + conto.garanzia);
  const nettoGiorno = ricavo - costoDeiCheck - costiPratiche;
  return { conversione, checkAlGiorno, paganti, ricavo, costoDeiCheck, costiPratiche, nettoGiorno };
}

/**
 * Quanti check al giorno servono per arrivare al traguardo di Valerio: 1000
 * pratiche pagate al giorno, a un dato tasso di conversione.
 */
export function checkPerPaganti(pagantiVoluti: number, conversione: number): number {
  return conversione > 0 ? Math.round(pagantiVoluti / conversione) : 0;
}
