import type { FattoVolo, Verdetto } from "@/lib/regole/eu261";
import type { Passeggero, Pratica } from "@/lib/pratiche/pratiche";
import { type CanaleCompagnia, compagniaPerVettore } from "./compagnie";

/**
 * Il generatore di documenti (strato 5, SPEC §4). In v1 è un modello
 * RIGIDO e deterministico: stesso input, stessa lettera, per sempre.
 * Qui non entra nessun LLM, e non è un ripiego: una lettera legale non
 * può cambiare tono a seconda del giorno, e ogni parola deve essere
 * difendibile davanti alla compagnia.
 *
 * Regole del testo:
 * - formale ma umano: niente latinismi da azzeccagarbugli, niente
 *   minacce vuote. Si annuncia solo ciò che il prodotto fa davvero
 *   (sollecito, reclamo ENAC).
 * - ogni numero ha accanto il suo perché (ritardo, tratta, fascia).
 * - le coordinate di pagamento restano campi da compilare: i soldi
 *   passano dal passeggero, mai da noi.
 *
 * I riferimenti citati (verificati con ricerca web il 2026-08-07):
 * - Artt. 5 e 7 del Regolamento (CE) n. 261/2004.
 * - CGUE, sentenza 19 novembre 2009, cause riunite C-402/07 e C-432/07
 *   (Sturgeon): il ritardo all'arrivo di 3 ore o più dà diritto alla
 *   stessa compensazione della cancellazione, salvo circostanze
 *   eccezionali. La sentenza è pubblicata anche da ENAC
 *   (enac.gov.it/app/uploads/2024/04/sentenza_091119_ritardosopra3ore.pdf).
 */

export type Lettera = { oggetto: string; corpo: string };

/** Ciò che la lettera legge dalla pratica. Il resto non le serve. */
export type PraticaPerLettera = Pick<Pratica, "passeggeri" | "tipo">;

/** Gli allegati che l'utente mette nella SUA email. */
export const ALLEGATI = [
  "Carta d'imbarco, o email di conferma della prenotazione",
  "Documento d'identità dell'intestatario della pratica",
  "Ricevute delle spese causate dal disservizio, se ci sono (pasti, trasporti, una notte in albergo)",
] as const;

/* ------------------------------------------------ formattazione, fissa */

const dataLunga = (isoGiorno: string) =>
  new Date(`${isoGiorno}T12:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** "22:55 del 14 agosto 2026 (UTC)": orari in UTC, dichiarato. È il dato
 *  oggettivo delle fonti volo; il fuso locale qui non serve e ambiguerebbe. */
const oraUtc = (iso: string) => {
  const d = new Date(iso);
  const ora = d.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  const giorno = d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${ora} del ${giorno} (UTC)`;
};

const durata = (minuti: number) => {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  if (h === 0) return `${m} minuti`;
  if (m === 0) return `${h} ore`;
  return `${h} ore e ${m} minuti`;
};

const km = (n: number) => `${Math.round(n).toLocaleString("it-IT")} km`;

const euro = (n: number) => `${n.toLocaleString("it-IT")} euro`;

/** L'elenco passeggeri. Se la pratica non li ha ancora, campi da compilare. */
function elencoPasseggeri(passeggeri: Passeggero[], tipo: PraticaPerLettera["tipo"]): string[] {
  const compilati = passeggeri
    .filter((p) => p.nome.trim() || p.cognome.trim())
    .map((p) => `${p.nome.trim()} ${p.cognome.trim()}`.trim());
  if (compilati.length > 0) return compilati;
  return tipo === "famiglia"
    ? ["[Nome e cognome del primo passeggero]", "[Nome e cognome degli altri passeggeri]"]
    : ["[Nome e cognome]"];
}

/** Il destinatario in testa alla lettera: ragione sociale se la conosciamo. */
function intestazione(fatto: FattoVolo, compagnia: CanaleCompagnia | null): string {
  if (compagnia) return `Spett.le ${compagnia.nomeLegale}`;
  if (fatto.vettoreOperativo) return `Spett.le ${fatto.vettoreOperativo}`;
  return "Spett.le [compagnia aerea operativa]";
}

/** La spiegazione della fascia: il numero mostrato con il suo perché. */
function percheFascia(importo: number, ritardoMinuti: number, kmTratta: number | null): string {
  const tratta = kmTratta === null ? "la distanza della tratta" : `una tratta di ${km(kmTratta)}`;
  return `Per un ritardo all'arrivo di ${durata(ritardoMinuti)} su ${tratta}, l'articolo 7 del Regolamento fissa la compensazione in ${euro(importo)} a passeggero.`;
}

/* ----------------------------------------------------------- reclamo */

/**
 * Il reclamo formale. Solo per verdetti IDONEI: su tutto il resto questa
 * funzione torna `null`, e non è un limite ma il prodotto (SPEC §4: non
 * si vende, e non si scrive, sul giallo).
 */
export function generaReclamo(
  pratica: PraticaPerLettera,
  fatto: FattoVolo,
  verdetto: Verdetto,
): Lettera | null {
  if (verdetto.esito !== "idoneo") return null;
  if (!fatto.arrivoPrevistoUtc || !fatto.arrivoEffettivoUtc) return null;

  const compagnia = compagniaPerVettore(fatto.vettoreOperativo) ?? compagniaPerVettore(fatto.voloIata);
  const passeggeri = elencoPasseggeri(pratica.passeggeri, pratica.tipo);
  const n = passeggeri.length;
  const totale = verdetto.importo * n;
  const giornoVolo = dataLunga(fatto.dataLocale);

  const oggetto = `Richiesta di compensazione pecuniaria ex artt. 5 e 7 Reg. (CE) 261/2004, volo ${fatto.voloIata} del ${giornoVolo}`;

  const vettoreMarketing =
    fatto.vettoreMarketing &&
    fatto.vettoreOperativo &&
    fatto.vettoreMarketing.trim().toUpperCase() !== fatto.vettoreOperativo.trim().toUpperCase()
      ? `\nIl biglietto è stato venduto con il codice di ${fatto.vettoreMarketing}; la presente è indirizzata a voi in quanto vettore operativo effettivo, come previsto dall'articolo 3, paragrafo 5, del Regolamento.`
      : "";

  const corpo = `${intestazione(fatto, compagnia)},

${n === 1 ? "scrivo in qualità di passeggero" : "scrivo a nome dei passeggeri sotto elencati"} del volo ${fatto.voloIata} del ${giornoVolo}, operato dalla vostra compagnia.${vettoreMarketing}

I fatti, come risultano dai dati di volo (fonte: ${fatto.fonte}):
- arrivo previsto: ${oraUtc(fatto.arrivoPrevistoUtc)};
- arrivo effettivo: ${oraUtc(fatto.arrivoEffettivoUtc)};
- ritardo all'arrivo: ${durata(verdetto.ritardoMinuti)}${fatto.kmOrtodromica ? `;\n- distanza della tratta: ${km(fatto.kmOrtodromica)}` : ""}.

Ai sensi degli articoli 5 e 7 del Regolamento (CE) n. 261/2004, come interpretati dalla Corte di giustizia dell'Unione europea nella sentenza del 19 novembre 2009, cause riunite C-402/07 e C-432/07 (Sturgeon), un ritardo all'arrivo pari o superiore a tre ore dà diritto alla stessa compensazione pecuniaria prevista per la cancellazione del volo, salvo circostanze eccezionali che spetta al vettore provare.

${percheFascia(verdetto.importo, verdetto.ritardoMinuti, fatto.kmOrtodromica)}

${
  n === 1
    ? `Chiedo pertanto il pagamento di ${euro(verdetto.importo)} per il passeggero sotto indicato:`
    : `Chiedo pertanto il pagamento di ${euro(verdetto.importo)} per ciascuno dei seguenti ${n} passeggeri, per un totale di ${euro(totale)}:`
}
${passeggeri.map((p) => `- ${p}`).join("\n")}

Il pagamento può essere effettuato con bonifico su queste coordinate:
IBAN: [da compilare]
Intestato a: [da compilare]

Chiedo il pagamento, o una risposta scritta e motivata, entro 30 giorni dal ricevimento della presente. Se intendete invocare circostanze eccezionali, chiedo che siano indicate in modo specifico e documentate: l'onere della prova è a vostro carico.

In mancanza di riscontro nel termine indicato, presenterò reclamo all'ENAC, l'organismo nazionale responsabile dell'applicazione del Regolamento (CE) 261/2004, e valuterò ogni ulteriore tutela nelle sedi competenti.

In allegato: carta d'imbarco, documento d'identità e le eventuali ricevute delle spese sostenute.

Distinti saluti,

${passeggeri[0]}
[indirizzo email con cui è stata fatta la prenotazione]
[data di invio]`;

  return { oggetto, corpo };
}

/* --------------------------------------------------------- sollecito */

/**
 * Il sollecito: il secondo colpo, quello dove il 60% molla (SPEC §5).
 * Richiama la prima lettera, cita il silenzio, preannuncia l'ENAC.
 * `dataPrimoInvio` è il giorno ISO in cui l'utente ha inviato il reclamo;
 * se non è stato registrato resta un campo da compilare.
 */
export function generaSollecito(
  pratica: PraticaPerLettera,
  fatto: FattoVolo,
  verdetto: Verdetto,
  dataPrimoInvio: string | null,
): Lettera | null {
  if (verdetto.esito !== "idoneo") return null;

  const passeggeri = elencoPasseggeri(pratica.passeggeri, pratica.tipo);
  const n = passeggeri.length;
  const totale = verdetto.importo * n;
  const giornoVolo = dataLunga(fatto.dataLocale);
  const giornoInvio = dataPrimoInvio ? dataLunga(dataPrimoInvio) : "[data di invio del primo reclamo]";
  const compagnia = compagniaPerVettore(fatto.vettoreOperativo) ?? compagniaPerVettore(fatto.voloIata);

  const oggetto = `Sollecito: richiesta di compensazione volo ${fatto.voloIata} del ${giornoVolo}`;

  const corpo = `${intestazione(fatto, compagnia)},

in data ${giornoInvio} vi ho inviato una richiesta di compensazione pecuniaria ai sensi degli articoli 5 e 7 del Regolamento (CE) n. 261/2004, relativa al volo ${fatto.voloIata} del ${giornoVolo}, per ${
    n === 1
      ? `l'importo di ${euro(totale)}`
      : `un totale di ${euro(totale)} (${euro(verdetto.importo)} per ${n} passeggeri)`
  }.

A oggi non ho ricevuto alcun riscontro. Il silenzio non estingue il diritto: i presupposti della richiesta restano quelli documentati nella prima lettera, che si intende qui integralmente richiamata.

Vi chiedo il pagamento, o una risposta scritta e motivata, entro 14 giorni dal ricevimento del presente sollecito.

Decorso inutilmente questo termine, presenterò reclamo all'ENAC, l'organismo nazionale responsabile dell'applicazione del Regolamento (CE) 261/2004, che può accertare la violazione e applicare le sanzioni previste. Valuterò inoltre ogni ulteriore tutela nelle sedi competenti.

Distinti saluti,

${passeggeri[0]}
[indirizzo email con cui è stato inviato il primo reclamo]
[data di invio]`;

  return { oggetto, corpo };
}

/* ------------------------------------------------------------- ENAC */

export type IstruzioniEnac = {
  titolo: string;
  premessa: string;
  passi: string[];
  /** La pagina ENAC che spiega le modalità di reclamo. */
  urlModalita: string;
  /** Il portale dove si compila il modulo online. */
  urlPortale: string;
  avvertenza: string;
  fonte: string;
};

/**
 * La segnalazione all'ENAC, passo per passo. URL verificati con ricerca
 * web il 2026-08-07: entrambe le pagine risultano sul dominio ufficiale
 * enac.gov.it (la sandbox non apre il sito, l'esistenza degli URL viene
 * dall'indice di ricerca).
 */
export function testoEnac(): IstruzioniEnac {
  return {
    titolo: "Il reclamo all'ENAC, passo per passo",
    premessa:
      "L'ENAC è l'organismo italiano che vigila sul Regolamento (CE) 261/2004. Il reclamo è gratuito e lo presenti tu, senza avvocati e senza intermediari.",
    passi: [
      "Aspetta 6 settimane dall'invio del reclamo alla compagnia. Puoi rivolgerti all'ENAC prima solo se la compagnia ti ha già risposto in modo non conforme al Regolamento.",
      "Tieni a portata di mano: numero e data del volo, il reclamo che hai inviato alla compagnia, la sua eventuale risposta, la carta d'imbarco.",
      "Apri il portale ENAC dei diritti del passeggero e compila il modulo online nella sezione dedicata ai reclami. È l'unico canale: niente email, niente carta.",
      "Indica i fatti come stanno nella tua lettera: orari previsto ed effettivo, ritardo all'arrivo, richiesta già inviata alla compagnia.",
      "Invia e conserva la ricevuta della segnalazione insieme al resto della pratica.",
    ],
    urlModalita:
      "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/modalita-di-reclamo-per-negato-imbarco-cancellazione-ritardo/",
    urlPortale: "https://carta-diritti.enac.gov.it/",
    avvertenza:
      "L'ENAC accerta le violazioni e può sanzionare la compagnia, ma non liquida la compensazione al posto suo. Serve a farla rispondere: per il pagamento, la strada resta il reclamo diretto ed eventualmente il giudice.",
    fonte:
      "Ricerca web 2026-08-07: pagina 'Modalità di reclamo per negato imbarco, cancellazione e ritardo prolungato del volo' e portale carta-diritti.enac.gov.it, entrambi sul dominio ufficiale ENAC. Regola delle 6 settimane confermata dalla FAQ ENAC 'Cosa devo fare se la compagnia aerea non risponde al reclamo presentato'.",
  };
}
