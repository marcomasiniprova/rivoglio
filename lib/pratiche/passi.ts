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
  /** Il caricamento come PASSO ATTIVO: titolo grande, verde, con la porta di servizio. */
  documentoPasso: boolean;
  /** Lo stesso caricamento in versione di contorno: bianco, niente "passo 1 di 2". */
  documentoExtra: boolean;
  /** Il bottone che apre la lettera è premibile? */
  letteraApribile: boolean;
  /** Si mostra il bottone che apre la lettera (anche spento)? */
  letteraVisibile: boolean;
  /** "Ho inviato il reclamo". */
  confermaInvio: boolean;
  /** "La compagnia ti ha risposto no?" */
  rifiuto: boolean;
  /** Le istruzioni su come si manda. */
  istruzioni: boolean;
};

export type Percorso = {
  passi: Passo[];
  attivo: ChiavePasso;
  riquadri: Riquadri;
};

/** L'ordine in cui si attraversano, e il nome che l'utente legge. */
const NOMI: { chiave: ChiavePasso; nome: string }[] = [
  { chiave: "pagamento", nome: "Pratica aperta" },
  { chiave: "documento", nome: "Carta d'imbarco" },
  { chiave: "lettera", nome: "Reclamo pronto" },
  { chiave: "invio", nome: "Reclamo inviato" },
  { chiave: "attesa", nome: "Attesa risposta" },
  { chiave: "replica", nome: "Replica" },
  { chiave: "ente", nome: "Ente e conciliazione" },
  { chiave: "chiusa", nome: "Chiusa" },
];

/**
 * Gli stati da cui in poi la prima lettera è già uscita di casa. Da qui il
 * muro dei documenti non ha più senso, e non deve più bloccare niente.
 */
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
function passoAttivo(
  stato: StatoPratica,
  documentiFatti: boolean,
  rifiutoDichiarato: boolean,
): ChiavePasso {
  if (CHIUSE.includes(stato)) return "chiusa";
  if (stato === "creata") return "pagamento";
  if (stato === "pagata" || stato === "pronta") {
    return documentiFatti ? "lettera" : "documento";
  }
  if (stato === "inviata") {
    /* Chi ha già dichiarato il no non sta più aspettando: la replica è
       pronta e il calendario non c'entra più niente. */
    return rifiutoDichiarato ? "replica" : "attesa";
  }
  if (stato === "sollecito") return "replica";
  return "ente";
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
export function percorsoPratica(
  stato: StatoPratica,
  eventi: EventoPratica[],
  rifiutoMotivo: string | null | undefined,
): Percorso {
  const documentiFatti = letteraSbloccata(eventi);
  const rifiutoDichiarato = Boolean(rifiutoMotivo);
  const reclamoPartito = RECLAMO_PARTITO.includes(stato);
  const chiusa = CHIUSE.includes(stato);
  const attivo = passoAttivo(stato, documentiFatti, rifiutoDichiarato);

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

  /* LA LETTERA. Il muro dei documenti vale solo prima che il reclamo
     parta: dopo, aprirla è un diritto già pagato. */
  const letteraVisibile = stato !== "creata";
  const letteraApribile = letteraVisibile && (documentiFatti || reclamoPartito);

  return {
    passi,
    attivo,
    riquadri: {
      documentoPasso: attivo === "documento",
      /* Dopo l'invio si può ancora caricare, e serve: la carta d'imbarco
         rafforza anche il sollecito. Ma diventa un riquadro bianco fra
         gli altri, non "PASSO 1 DI 2" sopra una lettera già spedita. */
      documentoExtra: !documentiFatti && reclamoPartito && !chiusa,
      letteraApribile,
      letteraVisibile,
      /* ⚠️ NON SI DICHIARA DI AVER MANDATO UNA LETTERA CHE NON SI È
         POTUTA APRIRE. Prima il bottone c'era comunque: si poteva
         confermare l'invio di un foglio ancora chiuso dietro il muro dei
         documenti, e la pratica avanzava su un fatto non avvenuto. */
      confermaInvio: (stato === "pagata" || stato === "pronta") && letteraApribile,
      rifiuto: stato === "inviata" || stato === "sollecito" || stato === "enac",
      istruzioni: (stato === "pagata" || stato === "pronta") && letteraApribile,
    },
  };
}
