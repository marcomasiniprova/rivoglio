import type { Articolo } from "../tipi";

import { PREZZO_LANCIO, seSiPaga } from "@/lib/check/ingresso";
import { euro } from "@/lib/prezzi";
/**
 * DATI. È il pezzo che aggancia il blog all'Osservatorio: i report annuali
 * dei concorrenti raccontano l'anno scorso, noi misuriamo la giornata di
 * oggi su otto scali italiani.
 *
 * Regola di scrittura di questo file (vale per tutti i pezzi): ogni numero
 * che compare nel testo deve poter tornare a una voce di `fonti`. Se un
 * numero non ha la sua fonte, il numero si toglie. I numeri di parte
 * (AirAdvisor) vanno attribuiti dentro il testo, non solo in fondo.
 */
export const ARTICOLO: Articolo = {
  slug: "scali-italiani-ritardi-2026",
  titolo: "Ritardi e cancellazioni: gli scali italiani nel 2026",
  titoloSeo: "Ritardi e cancellazioni: gli scali italiani 2026",
  descrizione:
    "Quanti passeggeri passano dagli aeroporti italiani, cosa dicono i numeri sui disagi e perché nessuna classifica annuale decide il tuo caso.",
  estratto:
    "Il traffico cresce, i disagi si notano di più. Ma il verdetto sul tuo volo non dipende dallo scalo: dipende dalle ore di ritardo all'arrivo.",
  data: "2026-08-09",
  tipo: "dati",
  tag: ["dati", "aeroporti", "ritardo"],
  copertina: "mappa-ritardi",
  foto: "/assets/tabellone/scali-italiani.webp",
  minuti: 7,
  correlati: [
    "dati-ritardi-europa-2025",
    "volo-in-ritardo-250-400-600-euro",
    "volo-cancellato-primi-60-minuti",
  ],
  corpo: [
    {
      tipo: "p",
      testo:
        "**Gli aeroporti italiani nel 2026 muovono più passeggeri che mai, e i disagi si vedono di conseguenza: nel primo semestre sono transitati 111,9 milioni di passeggeri, il 4,9% in più dello stesso periodo del 2025.** Le rilevazioni di parte parlano di ritardi e cancellazioni in crescita su Malpensa, Fiumicino e Napoli. Nessuno di questi numeri, però, decide il tuo caso: la compensazione dipende dalle ore di ritardo all'arrivo del tuo volo, non dalla media del tuo scalo.",
    },
    {
      tipo: "p",
      testo:
        "Qui sotto trovi i dati di traffico ufficiali, i numeri sui disagi con l'avvertenza su chi li pubblica, cosa misura ogni giorno l'Osservatorio di Rivolio e cosa fare quando lo scalo da cui parti è in affanno.",
    },

    { tipo: "h2", testo: "Più passeggeri di sempre" },
    {
      tipo: "p",
      testo:
        "Il punto di partenza è il traffico, perché è l'unico dato che nessuno contesta: lo raccolgono i gestori aeroportuali e lo pubblica l'ENAC. Nel 2025 gli aeroporti italiani hanno registrato 229.740.554 passeggeri, il 5% in più del 2024. Il 2026 non ha rallentato: 111,9 milioni nel primo semestre.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Scalo", "Passeggeri nel 2025"],
      righe: [
        ["Roma Fiumicino", "**oltre 50 milioni**, per la prima volta"],
        ["Milano Malpensa", "**31.234.229**"],
        ["Milano Bergamo", "**16.932.031**"],
      ],
    },
    {
      tipo: "p",
      testo:
        "C'è un secondo dato che conta più di quanto sembri: nel 2025 i passeggeri low cost in Italia sono stati 145,4 milioni, il 63% del totale. Quasi due passeggeri su tre viaggiano con compagnie che lavorano il reclamo solo se lo manda il passeggero, dal suo indirizzo email. È il motivo per cui la lettera di Rivolio la spedisci tu e non un intermediario.",
    },

    { tipo: "h2", testo: "I numeri sui disagi, e chi li pubblica" },
    {
      tipo: "p",
      testo:
        "Sul traffico c'è una fonte pubblica. Su ritardi e cancellazioni, in Italia, la fotografia più citata del 2026 arriva da AirAdvisor, che ha analizzato 18 aeroporti europei fra il 28 febbraio e il 14 maggio 2026. **AirAdvisor vende la gestione dei reclami a percentuale**, quindi ha un interesse diretto a che i numeri sui disagi facciano rumore. Li riportiamo per quello che sono: una rilevazione di parte, su un campione e su un periodo scelti da chi la pubblica.",
    },
    {
      tipo: "tabella",
      intestazioni: ["Cosa misura AirAdvisor", "2025", "Primavera 2026"],
      righe: [
        ["Milano Malpensa, ritardo medio", "119 minuti", "**139 minuti**, il più alto del suo campione"],
        ["Napoli Capodichino, quota di voli cancellati", "0,18%", "**2,14%**"],
        ["Roma Fiumicino, quota di voli cancellati", "0,11%", "**1,11%**"],
        ["Roma Fiumicino, quota di voli in ritardo", "1,63%", "**2,62%**"],
      ],
    },
    {
      tipo: "p",
      testo:
        "Anche prendendoli con le pinze, la direzione è quella: più volumi, meno margine di recupero quando qualcosa va storto. Il quadro europeo lo abbiamo raccontato a parte, con i dati di sistema: [li trovi qui](/tabellone/dati-ritardi-europa-2025).",
    },
    {
      tipo: "nota",
      titolo: "Una media non è una prova",
      testo:
        "Nessuna classifica di aeroporti serve a un reclamo. Alla compagnia non interessa che Malpensa quel trimestre andasse male: interessa l'orario di arrivo effettivo **del tuo volo**. Il dato di sistema spiega perché è successo; il dato del tuo volo decide se ti spetta qualcosa.",
    },

    { tipo: "h2", testo: "L'Osservatorio: la giornata di oggi, non l'anno scorso" },
    {
      tipo: "p",
      testo:
        "I report annuali arrivano quando il tuo volo è già atterrato da mesi. Per questo abbiamo costruito una misura che guarda adesso: **l'Osservatorio di Rivolio**, la striscia che trovi in [questa sezione della home](/#osservatorio).",
    },
    {
      tipo: "elenco",
      voci: [
        "**Cosa misura**: un indice dei ritardi da 0 a 5, calcolato sugli arrivi delle ultime due ore.",
        "**Dove**: otto scali italiani, cioè Fiumicino, Malpensa, Linate, Bergamo, Venezia, Napoli, Catania e Bologna.",
        "**Con che dati**: il tracciamento dei voli di AeroDataBox, la stessa fonte che il nostro motore usa per il verdetto.",
        "**Ogni quanto**: al massimo una volta al giorno. Non è un radar in tempo reale e non lo raccontiamo come tale.",
        "**Quando uno scalo non compare**: perché in quelle due ore non c'era abbastanza traffico da misurare. Preferiamo una casella vuota a un numero costruito.",
      ],
    },
    {
      tipo: "p",
      testo:
        "L'indice serve a due cose, e a nessuna terza. Se stai per partire, ti dice se il tuo scalo oggi è sotto pressione e conviene tenere d'occhio il tabellone. Se sei appena atterrato con ore di ritardo, ti dice se era una giornata storta per tutti, il che è utile a inquadrare la risposta che riceverai dalla compagnia. Non ti dice se ti spetta la compensazione: quella la calcola il motore sul tuo volo.",
    },

    {
      tipo: "check",
      titolo: "Il tuo scalo è in affanno? Guarda il tuo volo, non la media",
      testo:
        seSiPaga(
          `Inserisci il volo e ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia. L'analisi costa ${euro(PREZZO_LANCIO)}, non serve un account e se il verdetto esce incerto non si consuma.`,
          "Inserisci il volo e ti diciamo l'orario di arrivo effettivo registrato, i minuti di ritardo e la fascia. Il check è gratuito, non serve un account e se il caso non regge te lo diciamo subito.",
        ),
    },

    { tipo: "h2", testo: "Cosa cambia per te, in concreto" },
    {
      tipo: "p",
      testo:
        "Le regole non cambiano da uno scalo all'altro. Il Regolamento CE 261/2004 guarda tre cose: da dove è decollato l'aereo, quanto è lunga la tratta e quante ore di ritardo hai accumulato all'arrivo.",
    },
    {
      tipo: "tabella",
      intestazioni: ["La tua tratta", "Quanto ti spetta"],
      righe: [
        ["Fino a 1.500 km", "**250 €**"],
        ["Oltre 1.500 km, con partenza e arrivo dentro l'Unione", "**400 €**"],
        ["Fra 1.500 e 3.500 km, con uno scalo fuori dall'Unione", "**400 €**"],
        ["Oltre 3.500 km, fuori dall'Unione", "**600 €**, che scendono a **300 €** sotto le 4 ore di ritardo"],
      ],
    },
    {
      tipo: "p",
      testo:
        "La soglia è secca: sotto le tre ore di ritardo all'arrivo non spetta niente, in nessun aeroporto. Sopra, si aprono le fasce qui sopra e c'è un'eccezione sulle tratte europee lunghe che vale centinaia di euro: l'abbiamo spiegata nella [guida sulle tre fasce](/tabellone/volo-in-ritardo-250-400-600-euro).",
    },
    {
      tipo: "p",
      testo:
        "Attenzione a un punto che il traffico record rende attuale: partendo da un aeroporto italiano sei coperto sempre, con qualsiasi compagnia del mondo. Partendo da un paese fuori dall'Unione sei coperto solo se chi ha operato il volo è una compagnia europea. È l'articolo 3, e conta da dove decolla l'aereo, non dove hai comprato il biglietto.",
    },

    { tipo: "h2", testo: "Se lo scalo va in tilt mentre ci sei dentro" },
    {
      tipo: "p",
      testo:
        "Nelle giornate pesanti la cosa più utile è sapere cosa la compagnia deve darti mentre aspetti, che è una faccenda diversa dalla compensazione e non dipende dalle tre ore.",
    },
    {
      tipo: "passi",
      voci: [
        "**Chiedi l'assistenza al banco.** Su una tratta fino a 1.500 km pasti, bevande e la possibilità di comunicare sono dovuti già da due ore di attesa. Le soglie salgono con la distanza.",
        "**Conserva gli scontrini** se paghi di tasca tua perché al banco non c'è nessuno: quelle spese si chiedono a parte, anche quando la compensazione non spetta.",
        "**Se il volo è cancellato**, il rimborso del biglietto è dovuto, e resta tale anche se accetti un volo alternativo che poi non ti serve. [I primi sessanta minuti contano](/tabellone/volo-cancellato-primi-60-minuti).",
        "**Fotografa il tabellone** con l'orario e il numero del volo. È la prova più semplice da procurarsi e la più difficile da recuperare dopo.",
        "**Scrivi alla compagnia dal tuo indirizzo.** L'ENAC indica sei settimane come tempo entro cui deve risponderti; solo dopo si passa all'organismo nazionale del paese da cui sei partito.",
      ],
    },

    { tipo: "h2", testo: "Quanto ti resta, a seconda di come lo chiedi" },
    {
      tipo: "p",
      testo:
        "La cifra che la compagnia deve è la stessa per tutti. Cambia quanto ne arriva a te. I portali a percentuale trattengono una quota importante del rimborso, e la trattengono solo se vinci: è per questo che sembra indolore.",
    },
    {
      tipo: "citazione",
      testo:
        "Ryanair scrive sul proprio sito che le società di gestione dei reclami trattengono oltre il 40% di un reclamo da 250 euro, e invita i passeggeri a fare la richiesta da soli.",
      fonte: "Ryanair, pagina ufficiale sulle Claims Management Companies (fonte 8 in fondo)",
    },
    { tipo: "confronto", compensazione: 400 },
    {
      tipo: "p",
      testo:
        "Noi facciamo il contrario: **un prezzo fisso a pratica, scritto prima e senza percentuali**, con una tariffa unica per tutta la famiglia. La lettera la mandi tu, la compagnia paga te e la somma arriva intera. Se ti rifiuta senza un motivo valido o non risponde nei termini di legge, la garanzia copre quello che hai pagato. [Il listino sta qui](/#prezzi).",
    },

    { tipo: "osservatorio" },

    {
      tipo: "faq",
      voci: [
        {
          domanda: "Qual è l'aeroporto italiano peggiore per i ritardi?",
          risposta:
            "Dipende dal periodo e da chi misura. Nella rilevazione di AirAdvisor sulla primavera 2026, Malpensa ha il ritardo medio più alto del suo campione di 18 scali europei, 139 minuti contro i 119 del 2025. È un dato di parte, su un trimestre: non è una classifica ufficiale e non ha nessun peso sul tuo reclamo.",
        },
        {
          domanda: "Se il mio scalo ha tanti ritardi, il reclamo è più facile?",
          risposta:
            "No, e nemmeno più difficile. La compagnia guarda il tuo volo: orario di arrivo previsto, orario di arrivo effettivo, distanza della tratta. La media dello scalo non entra nel conto.",
        },
        {
          domanda: "L'Osservatorio dice se il mio volo è in ritardo adesso?",
          risposta:
            seSiPaga(
              "No. L'Osservatorio misura un indice da 0 a 5 sugli arrivi delle ultime due ore di otto scali italiani, e si aggiorna al massimo una volta al giorno: serve a capire come sta andando l'aeroporto, non a seguire un singolo volo. Per il tuo volo c'è l'analisi sul dato certificato.",
              "No. L'Osservatorio misura un indice da 0 a 5 sugli arrivi delle ultime due ore di otto scali italiani, e si aggiorna al massimo una volta al giorno: serve a capire come sta andando l'aeroporto, non a seguire un singolo volo. Per il tuo volo c'è il check gratuito.",
            ),
        },
        {
          domanda: "Perché a volte un aeroporto non compare nella striscia?",
          risposta:
            "Perché in quelle due ore non c'erano abbastanza arrivi da misurare, tipicamente di notte. In quel caso lo togliamo invece di mostrare un indice costruito su due voli.",
        },
        {
          domanda: "Con tutti questi passeggeri in più, le compagnie possono dire che è colpa del traffico?",
          risposta:
            "Possono dirlo, ma devono dimostrarlo, e devono dimostrare il legame con il tuo volo specifico. Se la risposta è un no generico, il passo successivo è l'organismo nazionale del paese da cui sei partito. [Come si fa, passo per passo](/tabellone/compagnia-dice-no-cosa-puoi-fare).",
        },
      ],
    },
  ],
  fonti: [
    {
      titolo:
        "ENAC, nel 2025 oltre 229 milioni di passeggeri negli aeroporti italiani, +5% sul 2024",
      url: "https://www.enac.gov.it/news/enac-nel-2025-oltre-229-milioni-di-passeggeri-negli-aeroporti-italiani-con-un-5-rispetto-al-2024-in-crescita-anche-il-traffico-cargo/",
    },
    {
      titolo:
        "Assaeroporti, primo semestre 2026: 111,9 milioni di passeggeri, +4,9% (via Travel Quotidiano)",
      url: "https://www.travelquotidiano.com/trasporti/assaeroporti-2/tqid-520371",
    },
    {
      titolo:
        "Assaeroporti, dati 2025 per scalo: Fiumicino oltre i 50 milioni, Malpensa 31.234.229, Bergamo 16.932.031",
      url: "https://ageei.eu/aeroporti-2301-milioni-di-passeggeri-nel-2025-in-italia-5-dati-assaeroporti/",
    },
    {
      titolo:
        "Assaeroporti, 2025: 145,4 milioni di passeggeri low cost, il 63% del totale",
      url: "https://www.federturismo.it/it/area-stampa/newsletter/595-news/news-2026/22022-assaeroporti-nel-2025-sono-cresciuti-del-5-gli-arrivi-negli-aeroporti-italiani.html",
    },
    {
      titolo:
        "AirAdvisor, rilevazione su 18 aeroporti europei fra il 28 febbraio e il 14 maggio 2026 (via Guida Viaggi)",
      url: "https://www.guidaviaggi.it/2026/06/01/ritardi-e-cancellazioni-aeroporti-italiani-sotto-pressione/",
    },
    {
      titolo:
        "AirAdvisor, cancellazioni e ritardi negli scali italiani nella primavera 2026 (via Travelnostop)",
      url: "https://travelnostop.com/news/curiosita/caos-voli-in-italia-cancellazioni-e-ritardi-record-nella-primavera-2026_678114",
    },
    {
      titolo:
        "ENAC, Ritardo prolungato del volo: importi della compensazione, soglia e assistenza",
      url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri/ritardo-prolungato-del-volo/",
    },
    {
      titolo:
        "Ryanair, Claims Management Companies: quanto trattengono le società di reclami",
      url: "https://help.ryanair.com/hc/en-us/articles/12890736320529-Claims-Management-Companies",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: cosa fare se la compagnia non risponde entro sei settimane",
      url: "https://carta-diritti.enac.gov.it/it/faq/se-la-compagnia-aerea-non-mi-ha-risposto-o-se-mi-ha-risposto-in-maniera-non-conforme-a-quanto-previsto-dal-regolamento-ce-26104-come-posso-presentare-un-reclamo-ad-enac",
    },
    {
      titolo:
        "ENAC, Carta dei diritti del passeggero: ci si rivolge all'organismo del paese di partenza",
      url: "https://carta-diritti.enac.gov.it/it/faq/la-compagnia-non-ha-rispettato-quanto-previsto-dal-regolamento-ce-26104-cosa-posso-fare",
    },
  ],
};
