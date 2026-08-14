import { NOTA_TRASPARENZA, type Lettera } from "./genera";

/**
 * LA LETTERA DEL REGOLAMENTO (CE) 1107/2006, sui diritti di chi vola con
 * una disabilità o a mobilità ridotta.
 *
 * È uno strumento GRATUITO e aperto (scelta di Valerio, 14/08: pagina
 * dedicata, senza account e senza pagamento, per reputazione). Non è una
 * pratica che vendiamo: è una lettera pronta che chiunque può copiare e
 * mandare da sé. Per questo qui non c'è nessun motore di verifica e nessun
 * dato dal fornitore: i fatti li scrive la persona, la lettera li mette
 * nella forma giusta e cita l'articolo giusto.
 *
 * Come per le lettere del 261, il modello è RIGIDO e deterministico: stesso
 * input, stessa lettera. L'unica parte libera è la descrizione di cosa è
 * successo, che sono parole della persona e restano tali.
 *
 * Le fonti (ricerca web del 14/08, confermate su ENAC ed EUR-Lex):
 * - Reg. (CE) 1107/2006, art. 3: vietato rifiutare prenotazione o imbarco
 *   per la disabilità; art. 4: deroghe (sicurezza prevista dalla legge,
 *   impossibilità fisica per le dimensioni dell'aeromobile), coi motivi per
 *   iscritto entro 5 giorni e rimborso o volo alternativo;
 * - art. 7 e allegati I e II: assistenza gratuita, in aeroporto (a carico
 *   del gestore) e a bordo (a carico del vettore), su preavviso di 48 ore;
 * - art. 12: sedia a rotelle o altra attrezzatura per la mobilità persa o
 *   danneggiata → risarcimento secondo le norme internazionali, dell'Unione
 *   e nazionali (Convenzione di Montreal);
 * - artt. 14 e 15: ente nazionale di controllo (in Italia ENAC) e reclamo,
 *   prima al gestore o al vettore, poi all'ente.
 */

export type SituazioneMobilita = "assistenza" | "imbarco" | "attrezzatura";

export type DatiMobilita = {
  /** Il nome di chi scrive: chiude la lettera come firma. */
  nome: string;
  /** Numero del volo, come sul biglietto. Può mancare. */
  volo: string;
  /** La data del volo, già scritta per esteso ("6 agosto 2026"). */
  data: string;
  /** La compagnia aerea, come la conosce la persona. */
  compagnia: string;
  /** L'aeroporto dove è successo (partenza, scalo o arrivo). */
  aeroporto: string;
  /** Cosa è successo, con parole sue. È l'unica parte libera. */
  descrizione: string;
  /** Solo per l'attrezzatura: quale ausilio (sedia a rotelle, deambulatore...). */
  ausilio?: string;
  /** Solo per l'attrezzatura: l'IBAN dove ricevere il risarcimento. */
  iban?: string;
};

type SchedaSituazione = {
  /** L'etichetta breve del bottone di scelta. */
  scheda: string;
  /** Il titolo della situazione. */
  titolo: string;
  /** Una riga che spiega di cosa si tratta, senza gergo. */
  spiega: string;
  /** A chi va mandata la lettera, in chiaro. */
  aChi: string;
};

export const SITUAZIONI: Record<SituazioneMobilita, SchedaSituazione> = {
  assistenza: {
    scheda: "Non mi hanno dato l'assistenza",
    titolo: "Assistenza non fornita o inadeguata",
    spiega:
      "Avevi diritto a essere accompagnato dal banco fino al posto (e viceversa), ma l'aiuto non c'è stato, è arrivato tardi o è stato fatto male.",
    aChi: "Al gestore dell'aeroporto (per l'assistenza a terra) e alla compagnia aerea (per l'imbarco, lo sbarco e l'assistenza a bordo).",
  },
  imbarco: {
    scheda: "Mi hanno rifiutato l'imbarco",
    titolo: "Prenotazione o imbarco rifiutati per la disabilità",
    spiega:
      "Ti hanno negato la prenotazione o non ti hanno fatto salire a causa della disabilità o della mobilità ridotta. È vietato, salvo motivi di sicurezza previsti dalla legge.",
    aChi: "Alla compagnia aerea che ha rifiutato la prenotazione o l'imbarco.",
  },
  attrezzatura: {
    scheda: "Mi hanno rotto o perso l'ausilio",
    titolo: "Sedia a rotelle o ausilio perso o danneggiato",
    spiega:
      "La tua sedia a rotelle o un altro ausilio è stato perso o danneggiato durante il volo o la gestione in aeroporto. Ti spetta il risarcimento del danno.",
    aChi: "Alla compagnia aerea che ha operato il volo, dopo aver aperto il PIR all'ufficio bagagli in aeroporto.",
  },
};

/** Riga d'apertura comune: chi, quale volo, quale aeroporto. */
function apertura(dati: DatiMobilita): string {
  const volo = dati.volo.trim() ? ` numero ${dati.volo.trim()}` : "";
  const compagnia = dati.compagnia.trim() ? ` operato da ${dati.compagnia.trim()}` : "";
  return `Il giorno ${dati.data.trim()} ero passeggero del volo${volo}${compagnia}, presso l'aeroporto di ${dati.aeroporto.trim()}. Sono una persona con disabilità o a mobilità ridotta ai sensi del Regolamento (CE) 1107/2006.`;
}

/** La descrizione della persona, ripulita ma non riscritta. */
function racconto(dati: DatiMobilita): string {
  const t = dati.descrizione.trim();
  return t ? `Ecco cosa è successo: ${t}` : "";
}

/** Come si chiude ogni lettera: escalation all'ente e nota di trasparenza. */
function chiusura(nome: string): string {
  return [
    "Vi chiedo un riscontro scritto entro trenta giorni. In assenza di risposta, o se la risposta non è soddisfacente, presenterò reclamo all'ente nazionale di controllo competente (in Italia l'ENAC), come previsto dagli articoli 14 e 15 del Regolamento.",
    "",
    "In attesa di un vostro riscontro, distinti saluti.",
    "",
    nome.trim(),
    "",
    NOTA_TRASPARENZA,
  ].join("\n");
}

export function generaLetteraMobilita(
  situazione: SituazioneMobilita,
  dati: DatiMobilita,
): Lettera {
  const volo = dati.volo.trim() ? ` ${dati.volo.trim()}` : "";
  const oggetto = `Reclamo ai sensi del Regolamento (CE) 1107/2006 - volo${volo} del ${dati.data.trim()}`;

  const parti: string[] = ["Spett.le,", "", apertura(dati), ""];
  const r = racconto(dati);

  if (situazione === "assistenza") {
    parti.push(
      "Il Regolamento (CE) 1107/2006, all'articolo 7 e negli allegati I e II, mi riconosce il diritto all'assistenza gratuita necessaria a prendere il volo: dal banco di accettazione fino al posto a bordo, e viceversa allo sbarco. In aeroporto questa assistenza è a carico del gestore dell'aeroporto, a bordo e per l'imbarco e lo sbarco è a carico della compagnia aerea. In questa occasione l'assistenza non è stata fornita, oppure è stata inadeguata.",
    );
    if (r) parti.push("", r);
    parti.push(
      "",
      "Vi chiedo di riconoscere la violazione e di indicarmi le misure che adotterete perché non si ripeta, oltre al ristoro dei disagi e delle spese che ho dovuto sostenere.",
    );
  } else if (situazione === "imbarco") {
    parti.push(
      "Il Regolamento (CE) 1107/2006, all'articolo 3, vieta di rifiutare una prenotazione o l'imbarco a una persona a causa della sua disabilità o mobilità ridotta. Il rifiuto è ammesso solo per soddisfare requisiti di sicurezza previsti dalla legge, o quando le dimensioni dell'aeromobile o dei suoi portelloni rendono l'imbarco fisicamente impossibile (articolo 4). In questi casi la compagnia deve comunicare per iscritto i motivi entro cinque giorni e offrire il rimborso del biglietto o un volo alternativo.",
    );
    if (r) parti.push("", r);
    parti.push(
      "",
      "Vi chiedo di comunicarmi per iscritto il motivo esatto del rifiuto e, se non ricorre nessuna delle deroghe previste dall'articolo 4, il ristoro del danno subito insieme al rimborso o alla riprotezione su un volo alternativo.",
    );
  } else {
    const ausilio = dati.ausilio?.trim() ? dati.ausilio.trim() : "attrezzatura per la mobilità";
    parti.push(
      `Il Regolamento (CE) 1107/2006, all'articolo 12, prevede che quando una sedia a rotelle o altra attrezzatura per la mobilità viene persa o danneggiata durante la gestione in aeroporto o il trasporto a bordo, il passeggero venga risarcito secondo le norme internazionali, dell'Unione e nazionali applicabili. La mia ${ausilio} è stata persa o danneggiata in occasione di questo volo.`,
    );
    if (r) parti.push("", r);
    parti.push(
      "",
      "Vi chiedo il risarcimento del danno documentato, cioè il costo della riparazione o della sostituzione dell'ausilio con uno equivalente, allegando i giustificativi in mio possesso.",
    );
    if (dati.iban?.trim()) {
      parti.push("", `Il pagamento potrà essere effettuato sul seguente IBAN: ${dati.iban.trim()}.`);
    }
  }

  parti.push("", chiusura(dati.nome));
  return { oggetto, corpo: parti.join("\n") };
}
