import type { Articolo } from "../tipi";

/**
 * ARTICOLO DI SITUAZIONE. Il negato imbarco (overbooking) è il caso in cui
 * i diritti sono più forti e meno conosciuti: la compensazione spetta
 * SUBITO, senza bisogno del ritardo di 3 ore, e la scusa delle circostanze
 * eccezionali qui non regge. Il nostro motore lo gestisce come caso
 * dichiarato; qui lo spieghiamo a chi lo cerca.
 *
 * Regola di scrittura: ogni numero deve tornare a una voce di `fonti`.
 */
export const ARTICOLO: Articolo = {
  slug: "overbooking-negato-imbarco-cosa-ti-spetta",
  titolo: "Overbooking e negato imbarco: ti hanno lasciato a terra, cosa ti spetta",
  titoloSeo: "Overbooking e negato imbarco: cosa ti spetta",
  descrizione:
    "Ti hanno lasciato a terra per overbooking contro la tua volontà? Ti spetta una compensazione subito, da 250 a 600€, più la scelta tra rimborso e volo nuovo.",
  estratto:
    "Se ti negano l'imbarco contro la tua volontà, la compensazione ti spetta subito e non serve nemmeno il ritardo di 3 ore. E qui la scusa del maltempo non vale.",
  data: "2026-08-17",
  tipo: "situazione",
  tag: ["diritti", "rimborsi"],
  copertina: "imbarco-negato",
  minuti: 6,
  correlati: [
    "volo-in-ritardo-250-400-600-euro",
    "compagnia-dice-no-cosa-puoi-fare",
    "coincidenza-persa-cosa-ti-spetta",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Se la compagnia ti nega l'imbarco contro la tua volontà perché il volo è sovraprenotato (overbooking), ti spetta una compensazione SUBITO, da 250 a 600€ a seconda della distanza, più la scelta tra il rimborso del biglietto e un volo alternativo, più pasti e hotel se resti a terra a lungo.** E qui c'è la parte importante: non serve arrivare a destinazione con 3 ore di ritardo, e la compensazione è dovuta anche se poi ti mettono su un altro volo. Il negato imbarco è un caso a sé, con diritti più forti del semplice ritardo.",
    },
    {
      tipo: "p",
      testo:
        "Il motivo è semplice: vendere più biglietti dei posti è una scelta commerciale della compagnia, non una sfortuna. Per questo la legge è severa e la compensazione scatta in automatico.",
    },

    { tipo: "h2", testo: "Volontario o involontario? Qui si decide tutto" },
    {
      tipo: "p",
      testo:
        "Quando un volo è pieno, la compagnia prima chiede se qualcuno rinuncia in cambio di un accordo (soldi, voucher, un volo dopo). Da lì nascono due strade completamente diverse:",
    },
    {
      tipo: "elenco",
      voci: [
        "**Ti offri volontario** e accetti l'accordo: prendi quello che hai concordato con loro (spesso un voucher e un volo più tardi), ma rinunci alla compensazione fissa. Hai fatto un patto, e va bene così se ti conviene.",
        "**Resti a terra tuo malgrado** (nessuno si è offerto, o non abbastanza): questo è negato imbarco involontario, e ti spetta la compensazione fissa PIÙ l'assistenza PIÙ la scelta tra rimborso e volo alternativo. Non è un favore, è un diritto.",
      ],
    },

    { tipo: "h2", testo: "Quanto ti spetta" },
    {
      tipo: "p",
      testo:
        "La cifra dipende dalla distanza del volo, con gli importi fissi del Regolamento CE 261/2004:",
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
        "Una sola cosa può ridurre la cifra della metà: se ti mettono su un volo alternativo che ti fa arrivare con poche ore di ritardo (le soglie cambiano con la distanza). In tutti gli altri casi la cifra è piena. Come si leggono le fasce lo abbiamo spiegato qui: [quanto ti spetta per un volo in ritardo](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },
    {
      tipo: "check",
    },

    { tipo: "h2", testo: "La scusa del maltempo, qui, non vale" },
    {
      tipo: "p",
      testo:
        "Sul ritardo la compagnia può a volte tirare fuori una circostanza eccezionale (meteo estremo, uno sciopero esterno) per non pagare. Sul negato imbarco per overbooking questa strada è chiusa: aver venduto troppi biglietti è una decisione loro, non un evento fuori dal loro controllo. Se provano a rimandarti indietro con la scusa del maltempo, stanno mischiando due cose diverse.",
    },

    { tipo: "h2", testo: "Come chiederlo, passo per passo" },
    {
      tipo: "passi",
      voci: [
        "Fatti dare per iscritto (o fotografa) il motivo per cui non sei salito, e conserva la carta d'imbarco e la prenotazione.",
        "Sul posto, chiedi subito l'assistenza dovuta (pasti, e hotel se devi dormire fuori) e decidi se vuoi il rimborso o un volo alternativo.",
        "Manda alla compagnia un reclamo scritto citando il Regolamento CE 261/2004 e il negato imbarco, e chiedi la compensazione della fascia giusta.",
        "Se non rispondono entro circa 6 settimane o dicono di no senza un motivo valido, vai gratis su ConciliaWeb (Autorità dei Trasporti) o segnala all'ente nazionale del paese di partenza.",
      ],
    },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Mi hanno rimesso su un volo poco dopo: ho comunque diritto alla compensazione?",
          risposta:
            "Sì. La compensazione per negato imbarco involontario spetta anche se poi ti riproteggono. Solo se il volo alternativo ti fa arrivare con poche ore di ritardo la cifra può essere dimezzata, ma non azzerata.",
        },
        {
          domanda: "Ho accettato il voucher che mi hanno offerto al gate: posso ancora chiedere i soldi?",
          risposta:
            "Se ti sei offerto volontario e hai accettato l'accordo, di norma no: hai scambiato la compensazione fissa con quello che hai concordato. Per questo, prima di accettare, conviene sapere quanto vale il tuo diritto.",
        },
        {
          domanda: "Vale anche se il biglietto era scontato o preso da un'agenzia?",
          risposta:
            "Sì, conta il volo, non quanto o dove hai pagato il biglietto. La compensazione la deve la compagnia che opera il volo.",
        },
        {
          domanda: "Quanto tempo ho per chiedere?",
          risposta:
            "In Italia il termine è di 2 anni dal volo per le compagnie italiane; per molte compagnie estere è più lungo. Meglio non aspettare troppo.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "Regolamento (CE) n. 261/2004, articoli 4, 7 e 8 (negato imbarco, compensazione, rimborso o riprotezione)",
      url: "https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0261",
    },
    {
      titolo: "ENAC, diritti del passeggero: negato imbarco e overbooking",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
    },
  ],
};
