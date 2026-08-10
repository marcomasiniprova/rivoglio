/**
 * QUANDO LA COMPAGNIA DICE NO.
 *
 * Perché questo file è il pezzo di prodotto più importante dopo il
 * motore. Oggi Rivolio si ferma alla lettera: il cliente la manda, si
 * prende un no e resta lì. Ma un no alla prima risposta è la norma, non
 * l'eccezione, e quasi sempre è un no che non regge: la compagnia scrive
 * "circostanza eccezionale" e spera che tu ti fermi.
 *
 * La replica giusta però dipende da COSA ti hanno risposto: a un guasto
 * tecnico si risponde in un modo, a uno sciopero del personale in un
 * altro, al silenzio in un terzo. Per questo il motivo si chiede a
 * scelta chiusa e non a testo libero: un testo libero non lo potremmo
 * usare per decidere niente, e la replica resterebbe generica.
 *
 * ⚠️ QUI NON C'È AI, come nel motore. La replica è un testo fisso per
 * ogni motivo, scritto una volta e uguale per tutti.
 *
 * ⚠️ LE SENTENZE CITATE VANNO RILETTE SULLA FONTE UFFICIALE prima del
 * primo cliente pagante. Da questo ambiente EUR-Lex non si apre, quindi
 * i riferimenti vengono dalla conoscenza consolidata e non da una
 * pagina letta oggi. È segnato in ARRETRATI come cosa che blocca la
 * vendita, non come rifinitura.
 */

/** I motivi che una compagnia mette per iscritto. Scelta chiusa. */
export type MotivoRifiuto =
  | "eccezionale_generico"
  | "meteo"
  | "guasto_tecnico"
  | "sciopero_compagnia"
  | "sciopero_esterno"
  | "ritardo_contestato"
  | "gia_risarcito"
  | "silenzio";

export type SchedaRifiuto = {
  motivo: MotivoRifiuto;
  /** Come lo legge l'utente, senza gergo: è quello che vede nella lista. */
  etichetta: string;
  /** Una riga che aiuta a riconoscerlo nella risposta ricevuta. */
  aiuto: string;
  /**
   * Quanto è solido il no, dal nostro punto di vista.
   * "debole" = di solito non regge · "dipende" = serve un fatto in più ·
   * "solido" = probabilmente hanno ragione, e va detto.
   */
  peso: "debole" | "dipende" | "solido";
  /** Il paragrafo che entra nel sollecito. Testo fisso, mai generato. */
  replica: string;
  /** Cosa diciamo all'utente sullo schermo, prima che mandi. */
  spiegazione: string;
  /** I riferimenti che la replica cita, per poterli controllare. */
  riferimenti: string[];
};

export const RIFIUTI: SchedaRifiuto[] = [
  {
    motivo: "eccezionale_generico",
    etichetta: "Hanno scritto \"circostanza eccezionale\" senza dire quale",
    aiuto: "La risposta parla di circostanze eccezionali ma non spiega cos'è successo.",
    peso: "debole",
    replica: `La vostra risposta invoca una circostanza eccezionale senza indicarne la natura né allegarne la prova. L'articolo 5, paragrafo 3, del Regolamento pone a carico del vettore l'onere di dimostrare sia il verificarsi della circostanza, sia il nesso con il ritardo del volo in questione, sia l'adozione di tutte le misure ragionevoli per evitarne le conseguenze. Un'affermazione generica non assolve nessuno di questi tre oneri e non costituisce una risposta motivata.

Vi invito pertanto a indicare per iscritto quale evento specifico avrebbe interessato questo volo, con la relativa documentazione.`,
    spiegazione:
      "È il no più comune e il più debole. La legge non chiede a te di dimostrare che non era eccezionale: chiede a loro di dimostrare che lo era, che riguardava proprio il tuo volo e che hanno fatto il possibile. Se non lo scrivono, non hanno risposto.",
    riferimenti: ["Reg. CE 261/2004, art. 5 par. 3"],
  },
  {
    motivo: "guasto_tecnico",
    etichetta: "Un guasto o un problema tecnico all'aereo",
    aiuto: "La risposta parla di manutenzione, avaria, problema tecnico o guasto.",
    peso: "debole",
    replica: `La vostra risposta riconduce il ritardo a un problema tecnico. Un problema tecnico emerso nel corso della manutenzione o derivante da una carenza di manutenzione è inerente al normale esercizio dell'attività di trasporto aereo e non integra, di per sé, una circostanza eccezionale ai sensi dell'articolo 5, paragrafo 3, del Regolamento. Lo stesso vale per un guasto improvviso non causato da eventi esterni all'attività del vettore.

Se ritenete che il guasto sia stato causato da un evento estraneo al normale esercizio dell'attività, vi invito a indicarlo specificamente e a documentarlo.`,
    spiegazione:
      "È il secondo no più comune, e in genere non regge. Il principio è semplice: gli aerei si rompono, fa parte del mestiere di chi li fa volare. Perché il guasto conti come eccezionale deve venire da fuori, tipo un uccello nel motore o un sabotaggio, e devono dirlo e provarlo.",
    riferimenti: [
      "Reg. CE 261/2004, art. 5 par. 3",
      "Corte di giustizia UE, Wallentin-Hermann, causa C-549/07",
      "Corte di giustizia UE, van der Lans, causa C-257/14",
    ],
  },
  {
    motivo: "sciopero_compagnia",
    etichetta: "Uno sciopero del personale della compagnia",
    aiuto: "La risposta parla di sciopero dei piloti, degli assistenti di volo o del personale di terra della compagnia.",
    peso: "debole",
    replica: `La vostra risposta riconduce il ritardo a uno sciopero del vostro personale. Uno sciopero indetto dalle organizzazioni sindacali dei dipendenti del vettore, nell'ambito della normale gestione dei rapporti di lavoro, rientra nel normale esercizio dell'attività del vettore e non costituisce, in linea di principio, una circostanza eccezionale ai sensi dell'articolo 5, paragrafo 3, del Regolamento.

Vi chiedo pertanto di indicare quali circostanze rendessero questo sciopero estraneo alla vostra sfera di controllo, e quali misure ragionevoli abbiate adottato per limitarne le conseguenze sui passeggeri.`,
    spiegazione:
      "Questa è la distinzione che vale i soldi, e i portali di solito non te la dicono. Se scioperava il PERSONALE DELLA COMPAGNIA, in linea di principio la compensazione spetta lo stesso: i rapporti coi propri dipendenti sono affari loro. È diverso dallo sciopero dei controllori di volo, che viene da fuori.",
    riferimenti: [
      "Reg. CE 261/2004, art. 5 par. 3",
      "Corte di giustizia UE, Airhelp contro SAS, causa C-28/20",
    ],
  },
  {
    motivo: "sciopero_esterno",
    etichetta: "Uno sciopero dei controllori di volo o dell'aeroporto",
    aiuto: "La risposta parla di sciopero del controllo del traffico aereo, degli handler o del personale aeroportuale.",
    peso: "dipende",
    replica: `La vostra risposta riconduce il ritardo a uno sciopero esterno alla vostra organizzazione. Anche quando la circostanza è estranea al vettore, l'esonero previsto dall'articolo 5, paragrafo 3, opera soltanto se il vettore dimostra di aver adottato tutte le misure ragionevoli per evitare il ritardo, e che il ritardo non poteva comunque essere evitato.

Vi chiedo pertanto di documentare l'incidenza dello sciopero su questo specifico volo e le misure adottate, ivi compresa la riprotezione su voli alternativi, anche di altri vettori.`,
    spiegazione:
      "Qui è più dura, ed è giusto dirtelo: uno sciopero dei controllori viene da fuori e di solito conta come circostanza eccezionale. Resta però un punto: devono dimostrare che riguardava proprio il tuo volo e che hanno fatto il possibile, per esempio metterti su un altro aereo. Non sempre ce l'hanno, quella prova.",
    riferimenti: ["Reg. CE 261/2004, art. 5 par. 3"],
  },
  {
    motivo: "meteo",
    etichetta: "Il maltempo",
    aiuto: "La risposta parla di condizioni meteo, neve, nebbia, temporali o vento.",
    peso: "dipende",
    replica: `La vostra risposta riconduce il ritardo alle condizioni meteorologiche. Perché operi l'esonero previsto dall'articolo 5, paragrafo 3, non è sufficiente che quel giorno vi fossero condizioni avverse: occorre che esse abbiano inciso su questo specifico volo e che il vettore dimostri di aver adottato tutte le misure ragionevoli.

Vi chiedo di indicare l'orario e la natura del fenomeno, la sua incidenza sulla rotazione dell'aeromobile assegnato a questo volo e le misure adottate. Rilevo inoltre che gli altri voli operati nello stesso scalo e nella stessa fascia oraria costituiscono elemento di riscontro.`,
    spiegazione:
      "Il maltempo può contare, quindi non ti prometto niente. Ma va guardato bene: spesso citano il maltempo del mattino per un volo della sera, oppure quel giorno tutti gli altri aerei sono partiti regolarmente. Se l'aeroporto lavorava, il maltempo da solo non basta.",
    riferimenti: ["Reg. CE 261/2004, art. 5 par. 3"],
  },
  {
    motivo: "ritardo_contestato",
    etichetta: "Dicono che il volo non era in ritardo, o non così tanto",
    aiuto: "La risposta nega il ritardo, o indica un ritardo sotto le tre ore.",
    peso: "debole",
    replica: `La vostra risposta contesta l'entità del ritardo. Il ritardo rilevante ai fini degli articoli 5 e 7 del Regolamento, come interpretati dalla Corte di giustizia, è quello all'ARRIVO, e si misura sul momento in cui almeno una porta dell'aeromobile è aperta e ai passeggeri è consentito lasciarlo, non sul momento dell'atterraggio né sull'orario di partenza.

L'orario di arrivo effettivo su cui si fonda la mia richiesta è tratto dal tracciamento del volo. Vi chiedo di indicare per iscritto l'orario di arrivo effettivo che ritenete corretto e la fonte da cui lo traete.`,
    spiegazione:
      "Capita spesso, e quasi sempre stanno misurando un'altra cosa: il ritardo alla partenza invece che all'arrivo, o il momento in cui le ruote toccano terra invece di quando aprono la porta. Il dato che ti abbiamo dato viene dal tracciamento del volo, non da una stima.",
    riferimenti: [
      "Reg. CE 261/2004, artt. 5 e 7",
      "Corte di giustizia UE, Sturgeon e altri, cause riunite C-402/07 e C-432/07",
    ],
  },
  {
    motivo: "gia_risarcito",
    etichetta: "Dicono di aver già dato un voucher o rimborsato il biglietto",
    aiuto: "La risposta parla di buono, voucher, miglia o rimborso del prezzo del biglietto.",
    peso: "debole",
    replica: `La vostra risposta richiama un rimborso del prezzo del biglietto o l'attribuzione di un buono. La compensazione pecuniaria prevista dall'articolo 7 del Regolamento ha natura e presupposti distinti dal rimborso del biglietto e dall'assistenza previsti dagli articoli 8 e 9, e si aggiunge a essi.

Il buono può sostituire il pagamento in denaro soltanto in presenza del mio accordo scritto e specificamente riferito alla compensazione dovuta ai sensi dell'articolo 7, accordo che non ho prestato. Vi chiedo pertanto il pagamento della compensazione.`,
    spiegazione:
      "Sono due cose diverse e le stanno mescolando. Il rimborso del biglietto ti restituisce quello che avevi pagato; la compensazione è un'altra somma, che spetta per il disagio. Un voucher può sostituire la compensazione solo se lo hai accettato per iscritto sapendo che era quello.",
    riferimenti: ["Reg. CE 261/2004, artt. 7, 8 e 9"],
  },
  {
    motivo: "silenzio",
    etichetta: "Non hanno risposto proprio",
    aiuto: "Sono passate settimane e non è arrivato niente.",
    peso: "debole",
    replica: `A oggi non ho ricevuto alcun riscontro alla mia richiesta. Il silenzio non estingue il diritto alla compensazione: i presupposti restano quelli documentati nella prima lettera, che si intende qui integralmente richiamata.`,
    spiegazione:
      "Il silenzio non è un no e non cancella niente. Serve però a una cosa: mettere agli atti che sono passate settimane senza risposta, perché è quello che guarda l'ente nazionale quando gli scrivi.",
    riferimenti: ["Reg. CE 261/2004, art. 5 par. 3"],
  },
];

/** La scheda di un motivo, o null se il motivo non è fra quelli previsti. */
export function schedaRifiuto(motivo: unknown): SchedaRifiuto | null {
  if (typeof motivo !== "string") return null;
  return RIFIUTI.find((r) => r.motivo === motivo) ?? null;
}

/**
 * QUANTI GIORNI ASPETTARE PRIMA DEL SOLLECITO.
 *
 * Sei settimane, e non è un numero scelto a caso: è il termine che
 * l'ENAC stesso indica prima di poter presentare reclamo all'ente
 * (salvo che la compagnia abbia già risposto in modo non conforme).
 * Sollecitare prima non serve a niente: le compagnie rispondono in
 * 8-14 settimane, e un sollecito mandato al giorno 15 arriva quando
 * nessuno ha ancora guardato la pratica.
 *
 * Se invece un rifiuto è già arrivato, non si aspetta niente: la
 * risposta c'è, e la replica parte subito.
 */
export const GIORNI_PRIMA_DEL_SOLLECITO = 42;

/** Giorni da aspettare dopo il sollecito prima di andare all'ente. */
export const GIORNI_PRIMA_DELL_ENTE = 14;

/**
 * Il caso è pronto per il sollecito?
 * `rifiuto` è il motivo già dichiarato dall'utente, se c'è.
 */
export function prontoPerSollecito(
  giorniDallInvio: number,
  rifiuto: MotivoRifiuto | null,
): boolean {
  if (rifiuto && rifiuto !== "silenzio") return true;
  return giorniDallInvio >= GIORNI_PRIMA_DEL_SOLLECITO;
}
