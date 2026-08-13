import type { EventoPratica, StatoPratica } from "./pratiche";
import { letteraSbloccata } from "./documenti";

/**
 * I PALETTI DELLA PRATICA: cosa è fatto, cosa si fa ADESSO, cosa viene dopo.
 *
 * 🔴 Valerio, 13/08, guardando una pratica vera: «quando invio la pratica
 * quindi clicco inviata rimane ancora il box per caricare i documenti di
 * imbarco? Sembra che il nostro prodotto non abbia paletti e step e next
 * step definiti, sembra che le cose si muovano come una lumaca: se fai
 * una cosa rimane tutto il resto vecchio».
 *
 * Aveva ragione e la causa era strutturale, non estetica: la pagina della
 * pratica mostrava OGNI riquadro in base a una lista di stati scritta a
 * mano accanto al riquadro stesso (`CONFERMABILE`, `CON_LETTERA`,
 * `DICHIARABILE`). Nessuno dei tre sapeva degli altri due, quindi
 * potevano essere accesi tutti insieme e dire cose in contraddizione: il
 * riquadro «PASSO 1 DI 2 · prima carica la carta d'imbarco» restava
 * acceso quando la lettera era GIÀ PARTITA, cioè quando quel passo non
 * poteva più servire a niente.
 *
 * 🔴 E lo stesso difetto spegneva la contro-risposta. Dichiarato il no
 * della compagnia, la pratica passa a `sollecito` e la replica è pronta;
 * ma «Apri la lettera» restava GRIGIO, perché il muro dei documenti era
 * ancora su. Da fuori si legge esattamente come l'ha letta Valerio:
 * «ho cliccato maltempo e non è successo niente».
 *
 * ⚠️ IL MURO DEI DOCUMENTI VALE PER LA PRIMA LETTERA E BASTA. Serve a
 * far partire un reclamo più solido. Dopo che il reclamo è partito, non
 * c'è più niente da rinforzare: tenere chiusa la replica di chi si è
 * appena preso un no significa trattenere il pezzo di prodotto che ha
 * pagato, nel momento in cui gli serve.
 *
 * Da qui in avanti la pagina non decide niente da sola: chiede a questo
 * file, e questo file garantisce che il passo attivo sia **uno solo**.
 */

/**
 * 🔴 E IL 13/08 IL MURO È STATO TOLTO DEL TUTTO (scelta di Valerio col
 * popup, dopo averlo provato da utente): «perché nella pagina appena pago
 * la pratica vengo rediretto dove il bottone è grigio? che senso ha
 * scusa?».
 *
 * Aveva ragione due volte. La prima: il riquadro sopra il bottone diceva
 * «apri la lettera, inviala dalla tua email» mentre il bottone non si
 * poteva premere. Una pagina che ti ordina una cosa e te la impedisce
 * nella stessa schermata è rotta, indipendentemente da quanto sia buona
 * la ragione. La seconda, più seria: quel muro arriva **un secondo dopo
 * il pagamento**, cioè nel punto in cui la fiducia è più fragile di tutto
 * il percorso.
 *
 * La carta d'imbarco resta, e resta utile: adesso è un rinforzo che si
 * propone DOPO, con scritto quanto pesa. Non è più una tappa, quindi non
 * è più nemmeno un pallino nella barra: le tappe sono le cose che
 * bisogna attraversare per forza.
 */

export type ChiavePasso =
  | "pagamento"
  | "documento"
  | "lettera"
  | "invio"
  | "attesa"
  | "risposta"
  | "replica"
  | "ente"
  | "chiusa";

export type StatoPasso = "fatto" | "adesso" | "dopo";

export type Passo = {
  chiave: ChiavePasso;
  /** Come si legge nella barra dei passi. Corto: ci sta su un telefono. */
  nome: string;
  stato: StatoPasso;
};

/** Quali riquadri la pagina accende. Nessun altro decide. */
export type Riquadri = {
  /**
   * Il caricamento della carta d'imbarco, sempre in versione di contorno:
   * un riquadro bianco fra gli altri, mai un muro.
   *
   * ⚠️ Prima esisteva anche `documentoPasso`, la versione "PASSO 1 DI 2"
   * che teneva chiusa la lettera. È sparita col muro: tenerne il campo
   * "spento per sicurezza" avrebbe lasciato in giro un interruttore che
   * qualcuno riaccende senza sapere cosa riaccende.
   */
  documentoExtra: boolean;
  /**
   * Il bottone che apre la lettera è premibile?
   *
   * Dal 13/08 la risposta è sempre sì da quando la pratica è pagata: la
   * lettera è la cosa che il cliente ha comprato, e non si trattiene.
   */
  letteraApribile: boolean;
  /** Si mostra il bottone che apre la lettera (anche spento)? */
  letteraVisibile: boolean;
  /** "Ho inviato il reclamo". */
  confermaInvio: boolean;
  /** "La compagnia ti ha risposto no?" */
  rifiuto: boolean;
  /** "Ho mandato la replica": chiude il giro e riapre l'attesa. */
  confermaReplica: boolean;
  /** Ente nazionale e conciliazione: dal secondo no in poi. */
  enteEConciliazione: boolean;
  /** Le istruzioni su come si manda. */
  istruzioni: boolean;
  /**
   * La scadenza per fare causa.
   *
   * ⚠️ Sparisce appena il reclamo è partito (richiesta di Valerio,
   * 12/08). Serviva a decidere di non rimandare; dopo l'invio la
   * decisione è presa, e resterebbe solo una data in più da leggere in
   * una pagina che deve dire una cosa sola: a che punto siamo.
   */
  scadenza: boolean;
};

export type Percorso = {
  passi: Passo[];
  attivo: ChiavePasso;
  /** La chiave con cui si scelgono i testi. Vedi `ChiaveTesto`. */
  chiaveTesto: ChiaveTesto;
  /** A che giro di «no» siamo, e se la replica di questo giro è partita. */
  giri: Giri;
  riquadri: Riquadri;
};

/**
 * DI CHI È LA PALLA.
 *
 * 🔴 Valerio, 13/08: «se ho 3 pratiche non si capisce lo stato di
 * ognuna, ognuna sembra uguale, ha sempre gli stessi box stessi colori
 * uguali, non si capisce nulla».
 *
 * La distinzione che serve davvero quando ne hai più di una non è lo
 * stato tecnico (pagata, inviata, sollecito: sono parole nostre), è
 * questa: **su quale devo fare qualcosa io, adesso?** Tre valori, tre
 * colori, e si legge da tre metri.
 */
export type DiChiELaPalla = "tua" | "loro" | "chiusa";

export function diChiELaPalla(attivo: ChiavePasso): DiChiELaPalla {
  if (attivo === "chiusa") return "chiusa";
  if (attivo === "attesa") return "loro";
  return "tua";
}

/** A che punto sei, in due numeri: «3 di 5». */
export function aChePunto(p: Percorso): { indice: number; totale: number; nome: string } {
  const i = p.passi.findIndex((x) => x.stato === "adesso");
  return {
    indice: i + 1,
    totale: p.passi.length,
    nome: p.passi[i]?.nome ?? "",
  };
}

/** L'ordine in cui si attraversano, e il nome che l'utente legge.
 *  ⚠️ "documento" NON c'è più: non è una tappa, è un rinforzo
 *  facoltativo, e mettere fra le tappe una cosa che si può saltare è il
 *  modo di far sembrare il percorso più lungo di quello che è. */
const NOMI: { chiave: ChiavePasso; nome: string }[] = [
  { chiave: "pagamento", nome: "Pratica aperta" },
  { chiave: "lettera", nome: "Reclamo pronto" },
  { chiave: "invio", nome: "Reclamo inviato" },
  { chiave: "attesa", nome: "Attesa risposta" },
  { chiave: "replica", nome: "Replica" },
  { chiave: "ente", nome: "Ente e conciliazione" },
  { chiave: "chiusa", nome: "Chiusa" },
];

/** Gli stati da cui in poi la prima lettera è già uscita di casa. */
const RECLAMO_PARTITO: StatoPratica[] = [
  "inviata",
  "sollecito",
  "enac",
  "esito_pagata",
  "esito_rifiutata",
  "rimborsata",
];

const CHIUSE: StatoPratica[] = ["esito_pagata", "esito_rifiutata", "rimborsata"];

/** Il passo attivo, cioè l'unica cosa che l'utente deve guardare adesso. */
function passoAttivo(stato: StatoPratica, giri: Giri): ChiavePasso {
  if (CHIUSE.includes(stato)) return "chiusa";
  if (stato === "creata") return "pagamento";
  /* Pagata = la lettera è pronta e si apre. Niente in mezzo. */
  if (stato === "pagata" || stato === "pronta") return "lettera";
  if (stato === "enac") return "ente";
  /* 🔴 IL CUORE DEL FLUSSO, e prima non c'era: un no in più della
     replica mandata vuol dire che la palla è tua. Pari e maggiori di
     zero vuol dire che hai risposto e stai aspettando loro. Zero no vuol
     dire che stai ancora aspettando la prima risposta. */
  if (giri.no > giri.replicheMandate) return "replica";
  return "attesa";
}

/**
 * LA CHIAVE DEI TESTI, E PERCHÉ NON È LO STATO DEL DATABASE.
 *
 * 🔴 Valerio, 13/08: ha dichiarato il no della compagnia CINQUE MINUTI
 * dopo aver mandato il reclamo, e la pagina gli ha risposto: «Sollecito.
 * Sei settimane, nessuna risposta: il sollecito è pronto». Una frase
 * falsa in tre punti su tre, scritta con sicurezza a un cliente pagante.
 *
 * La causa non è un refuso: lo stato `sollecito` sul database vuol dire
 * due cose diverse. Ci si arriva **per silenzio** (sono passate sei
 * settimane e nessuno ha risposto) oppure **per risposta** (hanno detto
 * no, e allora il calendario non c'entra niente). Un nome solo per due
 * fatti diversi produce, per forza, un testo sbagliato su uno dei due.
 *
 * Da qui in avanti i testi si scelgono con questa chiave, che guarda
 * cosa è SUCCESSO. Lo stato del database resta quello che è: serve alle
 * transizioni e ai cron, e non deve reggere anche il peso di raccontare.
 */
export type ChiaveTesto =
  | "creata"
  | "pagata"
  | "pronta"
  | "inviata"
  | "risposta_no"
  | "attesa_replica"
  | "sollecito"
  | "enac"
  | "esito_pagata"
  | "esito_rifiutata"
  | "rimborsata";

function chiaveTesto(stato: StatoPratica, giri: Giri): ChiaveTesto {
  if (stato !== "inviata" && stato !== "sollecito") return stato as ChiaveTesto;
  /* Il no dichiarato vince su tutto quello che dice il calendario: è un
     fatto avvenuto, non una scadenza scattata. */
  if (giri.no > giri.replicheMandate) return "risposta_no";
  /* Hai risposto al loro no e adesso aspetti di nuovo: non è né "il
     silenzio del primo giro" né "hanno risposto". È un terzo momento, e
     senza un nome suo la pagina raccontava ancora il no che avevi già
     chiuso. */
  if (giri.no > 0) return "attesa_replica";
  return stato as ChiaveTesto;
}

/** Dove si trova questo passo rispetto a quello attivo. */
function confronta(indice: number, indiceAttivo: number): StatoPasso {
  if (indice < indiceAttivo) return "fatto";
  if (indice === indiceAttivo) return "adesso";
  return "dopo";
}

/**
 * Il percorso completo di una pratica.
 *
 * ⚠️ Prende gli EVENTI, non una colonna: il passo dei documenti è già
 * scritto lì (vedi documenti.ts) e una colonna in più sarebbe un secondo
 * posto dove la stessa verità può divergere.
 */
/**
 * QUANTI GIRI DI «NO» SONO STATI FATTI, E A CHE PUNTO È L'ULTIMO.
 *
 * 🔴 Valerio, 13/08: «stranamente gli ultimi passi ti blocchi al passo 4,
 * perché dici solo il primo no e poi basta: non c'è possibilità dopo la
 * prima controproposta di un altro no».
 *
 * Aveva ragione, ed era un vicolo cieco vero: la pratica sapeva che la
 * compagnia aveva detto no UNA volta (una colonna, `rifiuto_motivo`) e
 * non aveva nessun posto dove mettere il secondo. Ma nella realtà il
 * secondo no è normalissimo: si risponde alla replica con un'altra
 * lettera di diniego, e il passeggero resta lì a guardare una pagina che
 * non gli offre più niente.
 *
 * Il conto si tiene sugli EVENTI, che sono in ordine e non richiedono
 * nessuna colonna nuova:
 * - un evento `rifiuto` per ogni no dichiarato;
 * - un evento `replica_inviata` per ogni replica che il passeggero dice
 *   di aver mandato.
 * Se i no sono più delle repliche mandate, tocca a lui. Se sono pari e
 * maggiori di zero, tocca a loro e si aspetta.
 */
export type Giri = { no: number; replicheMandate: number };

export const EVENTO_REPLICA_INVIATA = "replica_inviata";

export function giriDiNo(eventi: EventoPratica[]): Giri {
  let no = 0;
  let replicheMandate = 0;
  for (const e of eventi) {
    if (e.tipo === "rifiuto") no++;
    else if (e.tipo === EVENTO_REPLICA_INVIATA) replicheMandate++;
  }
  /* Le repliche non possono superare i no: se succede (una pratica
     vecchia, un doppio clic andato a segno) si tronca, se no il conto
     direbbe che c'è una replica da mandare che non esiste. */
  return { no, replicheMandate: Math.min(replicheMandate, no) };
}

/**
 * Dal SECONDO no in poi si apre anche la strada dell'ente e della
 * conciliazione, e non al posto della replica: insieme.
 *
 * Il motivo è pratico. Al primo no la trattativa diretta ha ancora senso
 * (spesso stanno solo misurando il ritardo alla partenza invece che
 * all'arrivo). Al secondo no stanno tenendo la posizione, e continuare a
 * scriversi da soli serve a poco: la conciliazione è gratuita, si fa da
 * casa, e a quel punto è la strada che muove i soldi.
 */
export const NO_PRIMA_DELL_ENTE = 2;

export function percorsoPratica(
  stato: StatoPratica,
  eventi: EventoPratica[],
  rifiutoMotivo: string | null | undefined,
): Percorso {
  const documentiFatti = letteraSbloccata(eventi);
  const reclamoPartito = RECLAMO_PARTITO.includes(stato);
  const chiusa = CHIUSE.includes(stato);
  const giri = giriDiNo(eventi);
  /* ⚠️ Una pratica aperta prima del 13/08 ha la colonna `rifiuto_motivo`
     piena ma può non avere l'evento: si conta come un giro, se no il suo
     percorso tornerebbe indietro da solo. */
  if (giri.no === 0 && rifiutoMotivo) giri.no = 1;
  const attivo = passoAttivo(stato, giri);

  /* La barra non mostra "invio" e "risposta" come tappe a sé: sono azioni
     dentro le tappe accanto, e una barra da nove pallini su un telefono
     non la legge nessuno. */
  const visibili = NOMI.filter((n) => n.chiave !== "invio" && n.chiave !== "risposta");
  const indiceAttivo = visibili.findIndex(
    (n) => n.chiave === (attivo === "invio" ? "lettera" : attivo === "risposta" ? "attesa" : attivo),
  );
  const passi: Passo[] = visibili.map((n, i) => ({
    chiave: n.chiave,
    nome: n.nome,
    stato: confronta(i, indiceAttivo),
  }));

  /* LA LETTERA. Pagata = apribile, punto. Il muro è stato tolto il
     13/08: vedi il commento in cima. */
  const letteraVisibile = stato !== "creata";

  return {
    passi,
    attivo,
    /* La chiave con cui la pagina sceglie i testi. NON è lo stato del
       database: vedi `chiaveTesto` qui sotto. */
    chiaveTesto: chiaveTesto(stato, giri),
    giri,
    riquadri: {
      /* Si può caricare la carta d'imbarco finché la pratica è viva, e
         serve anche dopo l'invio: rinforza il sollecito allo stesso modo.
         Ma è sempre un riquadro bianco fra gli altri, mai un passo. */
      documentoExtra: !documentiFatti && !chiusa && stato !== "creata",
      letteraApribile: letteraVisibile,
      letteraVisibile,
      confermaInvio: stato === "pagata" || stato === "pronta",
      /* «Hanno risposto no?» si chiede solo quando ha senso: dopo che il
         reclamo è partito, e solo se non c'è già un no in attesa di
         replica. Chiederlo due volte di fila fa dichiarare lo stesso no
         due volte. */
      rifiuto: reclamoPartito && !chiusa && giri.no === giri.replicheMandate,
      /* «Ho mandato la replica»: l'azione che chiudeva il vicolo cieco. */
      confermaReplica: giri.no > giri.replicheMandate,
      /* Ente e conciliazione: dal secondo no in poi, INSIEME alla
         replica, non al posto suo. */
      enteEConciliazione: stato === "enac" || giri.no >= NO_PRIMA_DELL_ENTE,
      istruzioni: stato === "pagata" || stato === "pronta",
      scadenza: !reclamoPartito,
    },
  };
}
