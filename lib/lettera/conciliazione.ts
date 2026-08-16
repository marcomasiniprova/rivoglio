/**
 * IL QUARTO COLPO: LA CONCILIAZIONE, CIOÈ QUELLA CHE PAGA.
 *
 * Perché esiste. Fino a ieri la pratica finiva con la segnalazione
 * all'ente nazionale, e su quella siamo sempre stati onesti: l'ente
 * accerta la violazione e può sanzionare la compagnia, ma NON liquida
 * la compensazione. Lo scrive la Commissione europea nel suo stesso
 * elenco degli organismi nazionali. Quindi il passeggero arrivava in
 * fondo ai nostri tre fogli e il bonifico non l'aveva ancora visto.
 *
 * La conciliazione è l'altro binario, quello che i soldi li muove
 * davvero: è gratis, si fa online, e la compagnia ci si siede perché
 * è un passaggio previsto prima della causa. In Italia la gestisce
 * l'Autorità di regolazione dei trasporti sulla piattaforma
 * ConciliaWeb, e i casi del Regolamento CE 261/2004 ci rientrano per
 * espressa previsione.
 *
 * ⚠️ QUELLO CHE QUESTO FILE NON FA. Non apre la procedura al posto
 * dell'utente e non lo rappresenta: la domanda la presenta lui, dal suo
 * SPID, con i documenti che ha già in mano. Noi diciamo che esiste,
 * quando si può usare e cosa serve. Rappresentare qualcuno sarebbe
 * consulenza, che non facciamo e che il nostro venditore vieta.
 *
 * FONTI (ricerca web 10/08/2026; da questo ambiente il sito ART non si
 * apre, l'egress lo blocca, quindi le righe qui sotto vengono dagli
 * estratti dei motori di ricerca e vanno rilette da Valerio sulla
 * pagina vera prima del primo cliente pagante: è in ARRETRATI):
 * - Autorità di regolazione dei trasporti, ConciliaWeb e relative FAQ
 *   ("Quali sono i tempi da rispettare per tentare la conciliazione");
 * - Vademecum ART per il servizio conciliazioni (PDF sul sito ART);
 * - centro assistenza Ryanair, "Risoluzione alternativa delle
 *   controversie: il tentativo obbligatorio di conciliazione", che è la
 *   prova che le compagnie il canale lo riconoscono e lo usano;
 * - Centro Europeo Consumatori Italia (ECC-Net) per le controversie
 *   transfrontaliere, assistenza gratuita.
 */

import { paeseDiScalo } from "@/lib/regole/territorio";

export type Conciliazione = {
  /** Come si chiama l'organismo, per esteso. */
  nome: string;
  sigla?: string;
  /** Dove si va, l'unico indirizzo che deve aprire l'utente. */
  url: string;
  /** L'etichetta del bottone: il nome che l'utente riconosce (la
   *  piattaforma vera), non la sigla dell'ente. «Apri ART» non lo capiva
   *  nessuno (Valerio, 16/08). */
  bottone: string;
  /** Il titolo del riquadro: parla del risultato, non dell'ente. */
  titolo: string;
  /** Due righe che dicono perché questo passo è diverso dagli altri. */
  premessa: string;
  passi: string[];
  /** Quanto costa. Se è gratis va detto forte: è metà del motivo. */
  costo: string;
  /** Entro quando si può fare. Mai una data inventata. */
  scadenza: string;
  /** Cosa NON promettiamo. Sempre presente, come sull'ente. */
  avvertenza: string;
  fonte: string;
};

/* --------------------------------------------------------------- Italia */

/**
 * La strada italiana. È il caso che copre quasi tutti i nostri utenti:
 * il pubblico di Rivolio parte dall'Italia.
 */
export function conciliazioneArt(): Conciliazione {
  return {
    nome: "Autorità di regolazione dei trasporti",
    sigla: "ART",
    url: "https://www.autorita-trasporti.it/conciliaweb/",
    bottone: "Vai su ConciliaWeb",
    titolo: "La conciliazione: gratis, online, e questa i soldi li muove",
    premessa:
      "La segnalazione all'ente serve a far accertare la violazione, ma il pagamento non lo dispone lui. La conciliazione è l'altra strada, ed è quella dove si tratta di soldi: la apri tu su una piattaforma pubblica, non costa niente e la compagnia si siede, perché è un passaggio previsto prima di una causa.",
    passi: [
      "Serve che tu abbia già scritto alla compagnia (la prima lettera) e che siano passati 30 giorni senza risposta, oppure che la risposta sia arrivata e non ti soddisfi. Se ti hanno già detto no, la condizione è soddisfatta subito.",
      "Entra su ConciliaWeb, la piattaforma dell'Autorità di regolazione dei trasporti. Si accede con SPID o CIE.",
      "Apri una domanda di conciliazione verso la compagnia e allega quello che hai già: numero e data del volo, il reclamo inviato, la loro risposta se c'è, la carta d'imbarco.",
      "Indica la cifra che chiedi. È la stessa della lettera: l'importo del Regolamento, per ogni passeggero.",
      "Segui l'incontro online quando ti convocano. Ci vai tu, non serve un avvocato.",
    ],
    costo: "Gratis. Il servizio dell'Autorità non ha costi per il passeggero.",
    scadenza:
      "La domanda va presentata entro un anno dal reclamo che hai mandato alla compagnia. È un termine più corto dei due anni per fare causa: se aspetti troppo, resta solo il giudice.",
    avvertenza:
      "Nessuno può garantirti l'esito: la conciliazione è un accordo, e un accordo si fa in due. Ma è gratuita, la fai da casa e non ti toglie niente: se non si chiude, la strada del giudice resta aperta.",
    fonte:
      "Autorità di regolazione dei trasporti, piattaforma ConciliaWeb e FAQ sui tempi; Vademecum ART per il servizio conciliazioni. I casi del Reg. CE 261/2004 rientrano espressamente fra quelli conciliabili.",
  };
}

/* ------------------------------------------------------------- estero */

/**
 * Partenza da un altro paese. Qui NON nominiamo un organismo che non
 * abbiamo verificato per quel paese: si dice l'unica cosa vera e utile,
 * cioè che per una compagnia con sede all'estero l'assistenza gratuita
 * esiste ed è la rete dei centri europei consumatori.
 */
export function conciliazioneEstero(paese: string): Conciliazione {
  return {
    nome: "Centro Europeo Consumatori Italia",
    sigla: "ECC-Net",
    url: "https://ecc-netitalia.it/",
    bottone: "Vai al Centro Europeo Consumatori",
    titolo: "La strada gratuita quando la compagnia è all'estero",
    premessa: `Il tuo volo è partito da ${paese}, quindi la conciliazione italiana potrebbe non coprirlo. Quello che copre di sicuro una controversia con una compagnia di un altro paese dell'Unione è la rete dei centri europei consumatori: assistenza gratuita, e si occupano proprio di questo.`,
    passi: [
      "Prepara quello che hai già: numero e data del volo, il reclamo inviato alla compagnia, la sua risposta se è arrivata, la carta d'imbarco.",
      "Apri il sito del Centro Europeo Consumatori Italia e presenta il caso: il servizio è gratuito e ti seguono loro nei rapporti con la compagnia estera.",
      "Se il volo arrivava in Italia, prova anche la piattaforma ConciliaWeb dell'Autorità di regolazione dei trasporti: la domanda dice da sola se il tuo caso rientra, e provarci non costa niente.",
    ],
    costo: "Gratis. I centri europei consumatori non chiedono nulla al consumatore.",
    scadenza:
      "Prima si muove, meglio è: i termini per agire contro la compagnia continuano a correre, e in Italia sono due anni dal volo.",
    avvertenza:
      "Il centro europeo consumatori assiste e media, ma non è un giudice e non può obbligare la compagnia a pagare.",
    fonte:
      "Rete ECC-Net, Centro Europeo Consumatori Italia: assistenza gratuita ai consumatori per acquisti e servizi da imprese con sede in un altro Stato dell'Unione, Islanda e Norvegia.",
  };
}

/**
 * La strada giusta per questo volo, scelta sul paese di PARTENZA come
 * tutto il resto della pratica (art. 16 par. 1 per l'ente; qui la
 * ragione è pratica, non normativa: è il paese dove il volo è nato).
 * Scalo sconosciuto = Italia, che è la riserva sensata per il nostro
 * pubblico e non nomina niente di non verificato.
 */
export function conciliazionePerPartenza(partenzaIata?: string | null): Conciliazione {
  const paese = paeseDiScalo(partenzaIata);
  if (!paese || paese === "Italy") return conciliazioneArt();
  return conciliazioneEstero(paese);
}

/**
 * QUANDO SI PUÒ APRIRE, e non è il giorno che diciamo noi.
 *
 * La regola non è nostra: serve un reclamo già mandato alla compagnia e
 * poi o 30 giorni di silenzio, o una risposta che non soddisfa. Un no
 * dichiarato è una risposta che non soddisfa, quindi apre subito.
 *
 * ⚠️ Nota che questo è PRIMA del nostro sollecito, che parte al giorno
 * 42. Non è una contraddizione: il sollecito serve a farsi pagare senza
 * scomodare nessuno, la conciliazione serve quando quello non è
 * bastato. Ma il passeggero deve sapere che la porta è già aperta.
 */
export const GIORNI_PRIMA_DELLA_CONCILIAZIONE = 30;

export function prontoPerConciliazione(
  giorniDallInvio: number,
  rifiutoDichiarato: boolean,
): boolean {
  if (rifiutoDichiarato) return true;
  return giorniDallInvio >= GIORNI_PRIMA_DELLA_CONCILIAZIONE;
}
