/**
 * 🔴 IL VOLO NON SI PERDE ALLA CASSA.
 *
 * Trovato col collaudo del 13/08, percorrendo il giro da utente: uno
 * scrive il numero del volo, preme "Analizza", trova il muro, va alla
 * cassa, paga, e torna sulla landing **col modulo vuoto**. L'analisi non
 * riparte, il volo che aveva scritto non c'è più, e la cassa gli aveva
 * appena promesso "poi torni al check e l'analisi parte da sola".
 *
 * È il punto più caro dove si possa perdere una persona: ha appena
 * pagato. Chi torna e vede un modulo vuoto pensa di aver pagato per
 * niente, e la seconda volta il numero del volo non lo riscrive.
 *
 * ⚠️ NON È UN DIFETTO DELLA CASSA DI PROVA. Il venditore vero riporta
 * indietro allo stesso modo, cioè su un indirizzo nostro dopo essere
 * passato per un sito suo: senza questo appunto, il difetto nascerebbe
 * identico il giorno dell'incasso, quando costa davvero.
 *
 * Come funziona, e perché così:
 * - il volo si tiene in `sessionStorage`, che resta anche uscendo dal
 *   sito e tornando (stessa scheda), quindi regge anche il giro esterno
 *   dal venditore. Nell'indirizzo non ci finisce niente;
 * - a dire "sto tornando dalla cassa" è un segno nell'indirizzo
 *   (`?ripresa=1`), che si toglie appena letto: senza, un ricaricamento
 *   della pagina rilancerebbe l'analisi da solo;
 * - l'appunto scade dopo un'ora. Un volo scritto stamattina che riparte
 *   da solo stasera è peggio del modulo vuoto.
 */

const CHIAVE = "rivolio-check-sospeso";
const SEGNO = "ripresa";
const VALE_MS = 60 * 60 * 1000;

export type CheckSospeso = { volo: string; data: string };

/**
 * ⚠️ SI TORNA DOVE SI ERA, non sempre sulla landing (Valerio, 14/08:
 * «quando fai l'analisi dalla web app ti rimanda sempre al sito, alla
 * hero; e dopo aver pagato ti ritrovi tutto da zero»). Erano due facce
 * dello stesso difetto: la cassa riportava sempre su `/`, quindi chi
 * partiva dalla web app (`/app`) veniva sbattuto sul sito, e il volo che
 * aveva scritto spariva. Adesso l'origine si mette da parte insieme al
 * volo, e la cassa ci riporta lì. */
const ORIGINI_OK = new Set(["/", "/app"]);
const pulisciOrigine = (p: unknown): string =>
  typeof p === "string" && ORIGINI_OK.has(p) ? p : "/";

/** Fallback: se non sappiamo da dove veniva, torna sulla landing. */
export const RITORNO_DALLA_CASSA = `/?${SEGNO}=1#controllo`;

/**
 * Dove torna chi ha pagato l'analisi: l'origine messa da parte (la
 * landing o la web app), con l'ordine di riprendere. NON cancella
 * l'appunto: a cancellarlo è `riprendiCheck` una volta arrivati.
 */
export function ritornoDallaCassa(): string {
  try {
    const grezzo = sessionStorage.getItem(CHIAVE);
    if (!grezzo) return RITORNO_DALLA_CASSA;
    const d = JSON.parse(grezzo) as { origine?: unknown };
    return `${pulisciOrigine(d.origine)}?${SEGNO}=1#controllo`;
  } catch {
    return RITORNO_DALLA_CASSA;
  }
}

/**
 * Mette da parte il volo davanti al quale è comparso il muro, insieme al
 * modo (numero/tratta) e alla pagina da cui si partiva, così al ritorno
 * si ricompone tutto com'era.
 */
export function sospendiCheck(volo: string, data: string, modo?: string, origine?: string): void {
  try {
    sessionStorage.setItem(
      CHIAVE,
      JSON.stringify({ volo, data, modo, origine: pulisciOrigine(origine), quando: Date.now() }),
    );
  } catch {
    /* Navigazione privata o memoria piena: si perde la ripresa, non la
       pagina. Meglio un modulo da riempire di una schermata rotta. */
  }
}

/**
 * Riprende il volo messo da parte, e lo cancella.
 * Si cancella subito di proposito: un appunto che resta è un'analisi che
 * riparte quando non deve.
 */
export function riprendiCheck(): (CheckSospeso & { modo?: string }) | null {
  try {
    const grezzo = sessionStorage.getItem(CHIAVE);
    sessionStorage.removeItem(CHIAVE);
    if (!grezzo) return null;
    const d = JSON.parse(grezzo) as {
      volo?: unknown;
      data?: unknown;
      modo?: unknown;
      quando?: unknown;
    };
    if (typeof d.volo !== "string" || typeof d.data !== "string") return null;
    if (typeof d.quando !== "number" || Date.now() - d.quando > VALE_MS) return null;
    return { volo: d.volo, data: d.data, modo: typeof d.modo === "string" ? d.modo : undefined };
  } catch {
    return null;
  }
}

/**
 * Vero se si sta tornando dalla cassa. Toglie il segno dall'indirizzo,
 * così un ricaricamento non fa ripartire niente.
 */
export function tornatoDallaCassa(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(SEGNO) !== "1") return false;
    url.searchParams.delete(SEGNO);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    return true;
  } catch {
    return false;
  }
}
