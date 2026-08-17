import type { Articolo } from "../tipi";

/**
 * ARTICOLO DI SITUAZIONE. Il diritto meno conosciuto sulla cancellazione:
 * la SCELTA tra rimborso e volo alternativo è del passeggero, non della
 * compagnia, e il voucher non è mai obbligatorio. È distinto dall'articolo
 * "primi 60 minuti" (che è l'emergenza in aeroporto): qui si spiega la
 * scelta e la compensazione in più.
 *
 * Regola di scrittura: ogni numero deve tornare a una voce di `fonti`.
 */
export const ARTICOLO: Articolo = {
  slug: "volo-cancellato-rimborso-o-volo-alternativo",
  titolo: "Volo cancellato: rimborso o volo alternativo? La scelta è tua",
  titoloSeo: "Volo cancellato: rimborso o volo alternativo?",
  descrizione:
    "Se ti cancellano il volo, scegli tu: rimborso del biglietto entro 7 giorni o un volo alternativo. Non possono obbligarti a un voucher. E spesso c'è la compensazione.",
  estratto:
    "La compagnia non può decidere al posto tuo: tra rimborso del biglietto e volo alternativo scegli tu, e il voucher non sei obbligato ad accettarlo.",
  data: "2026-08-17",
  tipo: "situazione",
  tag: ["cancellazione", "rimborsi"],
  copertina: "gate-telefono",
  minuti: 6,
  correlati: [
    "volo-cancellato-primi-60-minuti",
    "volo-in-ritardo-250-400-600-euro",
    "compagnia-dice-no-cosa-puoi-fare",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Se ti cancellano il volo, la scelta è tua: puoi chiedere il rimborso completo del biglietto (che ti devono pagare entro 7 giorni) oppure un volo alternativo per arrivare a destinazione. Decidi tu, non la compagnia, e nessuno può obbligarti ad accettare un voucher al posto dei soldi.** E c'è spesso una seconda cosa che si aggiunge: se ti hanno avvisato con meno di 14 giorni, oltre al rimborso o al volo nuovo ti spetta anche una compensazione da 250 a 600€.",
    },
    {
      tipo: "p",
      testo:
        "È il punto su cui le compagnie contano che tu non sappia: molte propongono direttamente un voucher, che conviene a loro. Ma il voucher lo prendi solo se lo vuoi.",
    },

    { tipo: "h2", testo: "La scelta è tua, non della compagnia" },
    {
      tipo: "p",
      testo: "Quando un volo è cancellato, per legge puoi scegliere tra queste strade:",
    },
    {
      tipo: "elenco",
      voci: [
        "**Il rimborso del biglietto**, per intero e sulla parte non usata del viaggio, da pagare entro 7 giorni con lo stesso mezzo con cui hai pagato.",
        "**Un volo alternativo** verso la stessa destinazione, il prima possibile oppure in una data che scegli tu, senza costi aggiuntivi.",
        "In più, se resti bloccato: **pasti, bevande e l'hotel** se devi dormire fuori, a carico della compagnia.",
      ],
    },

    { tipo: "h2", testo: "Il voucher non sei obbligato ad accettarlo" },
    {
      tipo: "p",
      testo:
        "Se al telefono o via email ti offrono un buono da spendere con loro, puoi dire di no e chiedere i soldi. Accettare il voucher è una tua libera scelta, non un obbligo, e in genere conviene solo se hai in programma di rivolare presto con quella compagnia.",
    },
    {
      tipo: "nota",
      titolo: "Occhio a cosa clicchi nell'email di cancellazione",
      testo:
        "Spesso il pulsante più grande e comodo nell'email è quello del voucher o del rimborso in crediti. Se vuoi i soldi veri sul conto, cerca l'opzione del rimborso sul mezzo di pagamento, e se non la trovi chiedila per iscritto.",
    },

    { tipo: "h2", testo: "Oltre al rimborso, spesso c'è la compensazione" },
    {
      tipo: "p",
      testo:
        "Rimborso e compensazione sono due cose diverse che si sommano. La compensazione fissa ti spetta se ti hanno avvisato con meno di 14 giorni e non c'è una circostanza davvero eccezionale a giustificarli. Gli importi sono questi:",
    },
    {
      tipo: "tabella",
      intestazioni: ["Distanza del volo", "Importo a persona"],
      righe: [
        ["Fino a 1.500 km", "250€"],
        ["Da 1.500 a 3.500 km", "400€"],
        ["Oltre 3.500 km", "600€"],
      ],
    },
    {
      tipo: "p",
      testo:
        "Se t'interessa il dettaglio delle fasce e come si calcolano, lo abbiamo spiegato qui: [quanto ti spetta per un volo in ritardo](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },
    {
      tipo: "check",
    },

    { tipo: "h2", testo: "Come chiederlo, passo per passo" },
    {
      tipo: "passi",
      voci: [
        "Scegli cosa vuoi: rimborso del biglietto o volo alternativo. Se scegli il rimborso, chiedilo sul mezzo di pagamento, non in voucher.",
        "Conserva l'email di cancellazione, la prenotazione e le ricevute delle spese che hai anticipato (pasti, hotel, trasporti).",
        "Se ti hanno avvisato con meno di 14 giorni, manda anche un reclamo scritto per la compensazione, citando il Regolamento CE 261/2004.",
        "Se non rispondono entro circa 6 settimane o dicono di no senza un motivo valido, vai gratis su ConciliaWeb (Autorità dei Trasporti) o segnala all'ente nazionale.",
      ],
    },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Mi hanno dato un voucher, ma volevo i soldi: posso ancora cambiarli?",
          risposta:
            "Se non hai accettato liberamente il voucher, puoi chiedere per iscritto il rimborso in denaro: la scelta è tua per legge. Se l'hai già usato è più difficile, quindi meglio non usarlo finché la questione non è chiara.",
        },
        {
          domanda: "Il rimborso e la compensazione si sommano davvero?",
          risposta:
            "Sì. Il rimborso è la restituzione del prezzo del volo che non hai fatto; la compensazione è una somma fissa in più prevista per la cancellazione. Sono due diritti diversi che stanno insieme.",
        },
        {
          domanda: "Mi hanno avvisato tre settimane prima: mi spetta la compensazione?",
          risposta:
            "Con un preavviso di 14 giorni o più la compensazione fissa non spetta, ma restano il diritto al rimborso o al volo alternativo. Sotto i 14 giorni, invece, di solito spetta anche la compensazione.",
        },
        {
          domanda: "Hanno detto che era colpa del maltempo: è vero che non mi devono niente?",
          risposta:
            "Il maltempo estremo può escludere la compensazione fissa, ma deve dimostrarlo la compagnia, e comunque il rimborso o il volo alternativo e l'assistenza restano dovuti a prescindere.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "Regolamento (CE) n. 261/2004, articoli 5, 7, 8 e 9 (cancellazione, compensazione, rimborso o riprotezione, assistenza)",
      url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0261",
    },
    {
      titolo: "ENAC, diritti del passeggero: volo cancellato, rimborso e assistenza",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
    },
  ],
};
