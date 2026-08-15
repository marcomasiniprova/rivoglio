import type { Articolo } from "../tipi";

import { PREZZO_LANCIO, seSiPaga } from "@/lib/check/ingresso";
import { euro } from "@/lib/prezzi";
/**
 * EMERGENZA. Si legge in piedi, col trolley in mano e il 20% di batteria.
 * Forma: il primo passo nella prima riga, liste corte, niente premesse.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni
 * numero che compare nel testo deve poter tornare a una voce di `fonti`.
 * Qui c'è una regola in più: NESSUNA data di sciopero. Il calendario si
 * verifica sulle fonti primarie, e un articolo non è una fonte primaria.
 */
export const ARTICOLO: Articolo = {
  slug: "sciopero-aerei-cosa-fare-in-aeroporto",
  titolo: "Sciopero aerei: cosa fare mentre sei in aeroporto",
  titoloSeo: "Sciopero aerei: cosa fare mentre sei in aeroporto",
  descrizione:
    "Il primo passo da fare adesso, la differenza fra sciopero della compagnia e sciopero di aeroporto o controllori, e perché una scusa generica non regge.",
  estratto:
    "Chiedi subito un altro volo e fatti mettere per iscritto il motivo. Chi incrocia le braccia cambia il verdetto più di quanto pensi.",
  data: "2026-08-09",
  tipo: "emergenza",
  tag: ["scioperi", "emergenza", "cancellazione"],
  copertina: "giorno-sciopero",
  foto: "/assets/tabellone/sciopero-aerei.webp",
  minuti: 7,
  correlati: [
    "volo-cancellato-primi-60-minuti",
    "volo-in-ritardo-250-400-600-euro",
    "compagnia-dice-no-cosa-puoi-fare",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Vai al banco della tua compagnia adesso, chiedi il primo volo alternativo utile e fatti scrivere il motivo del disservizio.** Sono le due cose che nessuno ti darà se non le chiedi, e sono le due che contano dopo: il posto su un altro aereo lo assegnano in ordine di arrivo, e il motivo messo per iscritto è la prova che vale di più quando la compagnia, fra un mese, ti risponderà con una frase generica.",
    },
    {
      tipo: "p",
      testo:
        "Sotto trovi cosa fare nei primi minuti, come capire chi sta scioperando (cambia tutto), cosa ti spetta mentre aspetti e cosa succede ai soldi.",
    },

    { tipo: "h2", testo: "I primi dieci minuti, in ordine" },
    {
      tipo: "passi",
      voci: [
        "**Mettiti in fila al banco della compagnia**, non al banco dei servizi di terra. Mentre aspetti, apri l'app della compagnia: a volte il nuovo volo si fa da lì, e sei fuori dalla coda.",
        "**Chiedi di essere rimesso su un altro volo** e chiedi anche le alternative su altri aeroporti vicini. Se accetti la prima cosa che ti offrono senza chiedere, di solito è quella che conviene a loro.",
        "**Fatti dare per iscritto la causa**: un'email, un SMS, la schermata dell'app, un foglio timbrato. Vale anche una foto del tabellone con la dicitura.",
        "**Fotografa tutto**: tabellone, carta d'imbarco, coda al banco, ora sul telefono. Costa dieci secondi e ti risparmia una discussione.",
        "**Conserva gli scontrini** di quello che paghi di tasca tua: acqua, panino, taxi, albergo. Le spese si chiedono a parte, e si chiedono anche quando la somma fissa non spetta.",
      ],
    },
    {
      tipo: "p",
      testo:
        "Se il volo risulta cancellato e non solo in ritardo, i passi cambiano di poco ma il conto cambia molto: li abbiamo scritti tutti in [volo cancellato adesso, i primi 60 minuti](/tabellone/volo-cancellato-primi-60-minuti).",
    },

    { tipo: "h2", testo: "Chi sciopera cambia il verdetto" },
    {
      tipo: "p",
      testo:
        "Sul tabellone c'è scritto \"sciopero\" e basta. Ma per la compagnia non è la stessa cosa se a incrociare le braccia sono i suoi dipendenti oppure persone che non lavorano per lei.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Chi sciopera", "Cosa cambia per te"],
      righe: [
        [
          "**Il personale della compagnia** (piloti, assistenti di volo, suo personale di terra)",
          "È la posizione più forte per il passeggero: lo sciopero del personale della compagnia, in linea di principio, non è una circostanza eccezionale.",
        ],
        [
          "**I controllori di volo o il personale dell'aeroporto** (handling, sicurezza, rifornimento)",
          "Sono soggetti esterni alla compagnia, che di solito ci si appoggia per non pagare. Non è un automatismo: deve comunque dimostrare il legame con il tuo volo.",
        ],
        [
          "**Sciopero generale** o agitazione di categoria non legata al volo",
          "Vale la stessa regola: conta se ha inciso davvero sul tuo volo, non che quel giorno ci fosse un'agitazione.",
        ],
      ],
    },
    {
      tipo: "nota",
      titolo: "Una scusa generica non regge",
      testo:
        "Non basta che la compagnia dica \"c'era sciopero\". Deve provare il legame concreto fra l'agitazione e la cancellazione del **tuo singolo volo**, non del traffico di quel giorno. E l'onere della prova sta a lei: lo ha ribadito la Cassazione con l'ordinanza n. 17644 del 2025. Tu devi provare due cose sole: che avevi il biglietto e che il disservizio c'è stato.",
    },

    { tipo: "h2", testo: "Il tuo volo potrebbe partire lo stesso" },
    {
      tipo: "p",
      testo:
        "In Italia gli scioperi del trasporto aereo hanno delle fasce protette. L'ENAC garantisce i voli **dalle 7:00 alle 10:00 e dalle 18:00 alle 21:00**, e pubblica l'elenco dei voli garantiti per ogni agitazione.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Cerca il tuo numero di volo in quell'elenco** prima di dare per perso il viaggio: se c'è, parte, e la corsa al banco te la risparmi.",
        "**Non fidarti dei siti che elencano gli scioperi**, compreso questo articolo: le date cambiano, gli scioperi si revocano il giorno prima. L'unica lista che conta è quella ufficiale ENAC del giorno, insieme alla pagina della tua compagnia. Noi teniamo aggiornato il [calendario degli scioperi](/sciopero-aerei), che si rinnova da solo ogni giorno e porta il link alla proclamazione di ognuno.",
        "**Se il tuo volo è in fascia protetta ma parte tardissimo lo stesso**, il conto del ritardo va avanti come sempre: la fascia protegge la partenza, non ti toglie niente.",
      ],
    },

    {
      tipo: "check",
      titolo: "Il tuo volo di oggi: cosa risulta davvero",
      testo:
        seSiPaga(
          `Guardiamo il dato registrato del volo, non quello che ti hanno detto al banco: orario di arrivo effettivo, minuti di ritardo, fascia di importo. ${euro(PREZZO_LANCIO)}, senza account. Se il verdetto esce incerto, l'analisi non si consuma.`,
          "Guardiamo il dato registrato del volo, non quello che ti hanno detto al banco: orario di arrivo effettivo, minuti di ritardo, fascia di importo. Gratis, senza account. Se il caso non regge te lo diciamo subito e non paghi niente.",
        ),
    },

    { tipo: "h2", testo: "Cosa ti spetta mentre aspetti, sempre" },
    {
      tipo: "p",
      testo:
        "Questa parte non dipende dallo sciopero e non dipende da chi ha ragione. L'assistenza è dovuta anche se poi la somma fissa non spetterà: sono due cose diverse.",
    },
    {
      tipo: "elenco",
      voci: [
        "**Pasti e bevande**, in proporzione all'attesa, e la possibilità di comunicare. Sulle tratte fino a 1.500 km partono già da 2 ore di ritardo.",
        "**Albergo e trasferimento** da e per l'aeroporto se l'attesa passa la notte.",
        "**Se il volo è cancellato**, puoi scegliere fra il volo alternativo e il rimborso del biglietto, che è dovuto entro 7 giorni.",
        "**Se al banco non c'è nessuno**, paga tu il minimo indispensabile e tieni gli scontrini. È il modo in cui si recuperano quelle spese.",
      ],
    },

    { tipo: "h2", testo: "E i soldi? La regola resta quella di sempre" },
    {
      tipo: "p",
      testo:
        "La somma fissa del Regolamento CE 261/2004 (la compensazione pecuniaria) non è un rimborso del biglietto ed è la stessa per tutti: dipende dalla tratta, non da quanto hai pagato. La soglia sono **3 ore di ritardo all'arrivo**: sotto, non spetta niente, sciopero o no.",
    },
    {
      tipo: "tabella",
      intestazioni: ["La tua tratta", "Quanto ti spetta"],
      righe: [
        ["Fino a 1.500 km", "**250 €**"],
        [
          "Oltre 1.500 km, partenza e arrivo **dentro** l'Unione Europea",
          "**400 €**, per quanto lunga sia",
        ],
        ["Fra 1.500 e 3.500 km, con uno scalo fuori dall'Unione", "**400 €**"],
        [
          "Oltre 3.500 km, con uno scalo fuori dall'Unione",
          "**600 €**, che scendono a **300 €** se il ritardo resta sotto le 4 ore",
        ],
      ],
    },
    {
      tipo: "p",
      testo:
        "Conta anche da dove decolla l'aereo: se parti da un aeroporto europeo sei coperto sempre, con qualsiasi compagnia; se parti da un paese fuori dall'Unione lo sei solo se chi opera il volo è una compagnia europea. Le tre fasce e i casi in cui non spetta niente stanno tutte in [quando ti spettano 250, 400 o 600 euro](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },
    {
      tipo: "p",
      testo:
        "Un avviso pratico: nei giorni di sciopero i portali a percentuale comprano pubblicità sulla parola \"sciopero\" e ti chiedono i dati mentre sei ancora in coda. Trattengono una quota del rimborso, e la trattengono solo se vinci: sembra indolore proprio per questo. Ryanair scrive sul proprio sito che le società di gestione reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a fare la richiesta da soli.",
    },
    { tipo: "confronto", compensazione: 400 },

    { tipo: "h2", testo: "Quando torni a casa" },
    {
      tipo: "passi",
      voci: [
        "**Controlla il dato oggettivo del volo**: l'orario di arrivo effettivo registrato, non quello che ricordi tu.",
        "**Scrivi alla compagnia** dal suo canale reclami, tu, col tuo nome. Molte compagnie lavorano solo il reclamo mandato dal passeggero.",
        "**Nel reclamo cita quello che hai raccolto in aeroporto**: la causa scritta, l'ora, le foto. È qui che quei dieci secondi in coda si ripagano.",
        "**Aspetta la risposta.** L'ENAC indica sei settimane come tempo entro cui la compagnia deve rispondere.",
        "**Se dicono no senza un motivo valido, o non rispondono**, si passa all'organismo nazionale del paese da cui sei partito, che non è automaticamente l'ENAC. [Come funziona, passo per passo](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
      ],
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Con lo sciopero non spetta mai niente, giusto?",
          risposta:
            "No, è una semplificazione che conviene alle compagnie. Lo sciopero del personale della compagnia in linea di principio non è una circostanza eccezionale, e in ogni caso la compagnia deve dimostrare il legame concreto con il tuo volo. Una dicitura generica sul tabellone non è una dimostrazione.",
        },
        {
          domanda: "Mi hanno riprotetto su un volo il giorno dopo: cambia qualcosa?",
          risposta:
            "Cambia il conto delle ore, perché il ritardo si misura sull'arrivo a destinazione. Nel frattempo ti spettano l'assistenza e, se si passa la notte, l'albergo. La somma fissa dipende poi da quante ore hai accumulato all'arrivo e dal motivo della cancellazione.",
        },
        {
          domanda: "Il mio volo era in fascia di tutela e l'hanno cancellato lo stesso.",
          risposta:
            "Succede, e a maggior ragione conviene farsi mettere per iscritto il motivo. Le fasce garantite valgono 7:00-10:00 e 18:00-21:00 e l'elenco dei voli garantiti è pubblicato dall'ENAC: se il tuo era nell'elenco, salva quella pagina.",
        },
        {
          domanda: "Posso rifiutare il volo alternativo e tornare a casa?",
          risposta:
            "Se il volo è cancellato puoi scegliere il rimborso del biglietto al posto di un altro volo, ed è dovuto entro 7 giorni. Valuta bene: rinunciare al viaggio e farsi rimborsare sono due scelte diverse e la seconda non cancella l'eventuale somma fissa.",
        },
        {
          domanda: "Nessuno al banco mi ha dato niente da mangiare o da bere.",
          risposta:
            "Paga tu il minimo ragionevole e conserva gli scontrini. Quelle spese si chiedono nel reclamo, con le ricevute allegate, e la richiesta è indipendente dalla somma fissa: si fa anche quando la compensazione non spetta.",
        },
        {
          domanda: "Ho un volo fra qualche giorno e si parla di uno sciopero. Cosa guardo?",
          risposta:
            "La pagina ENAC sugli scioperi nel trasporto aereo, che pubblica le agitazioni e i voli garantiti, e la pagina della tua compagnia. Le date cambiano e gli scioperi si revocano: nessun articolo, questo compreso, è una fonte affidabile sul calendario.",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "ENAC, Scioperi nel trasporto aereo: fasce di tutela ed elenco dei voli garantiti",
      url: "https://www.enac.gov.it/trasporto-aereo/diritto-alla-mobilita/scioperi-nel-trasporto-aereo/",
    },
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione, soglia e assistenza",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "Brocardi, Lo sciopero indicato genericamente non esonera il vettore: lo sciopero del personale della compagnia non è circostanza eccezionale",
      url: "https://www.brocardi.it/notizie-giuridiche/voli-compagnia-negarti-rimborso-volo-annullato-solo-perche-sciopero/7131.html",
    },
    {
      titolo:
        "Avvocato Andreani, Il vettore deve provare l'incidenza dello sciopero sul singolo volo cancellato",
      url: "https://news.avvocatoandreani.it/articoli/sciopero-voli-cancellati-vettore-deve-provare-incidenza-sciopero-singolo-volo-cancellato-108749.html",
    },
    {
      titolo:
        "Cassazione, ordinanza n. 17644/2025: l'onere della prova della circostanza eccezionale è del vettore",
      url: "https://www.studiolegalebianucci.it/it/blog/4451-ritardo-aereo-e-risarcimento-la-cassazione-chiarisce-l-onere-della-prova-ordinanza-n-17644-2025",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: cosa fare se la compagnia non risponde (sei settimane)",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: a quale organismo nazionale rivolgersi",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
  ],
};
