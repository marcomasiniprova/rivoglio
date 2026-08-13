import { CASI_ORO } from "../regole/casi-oro";
import { VERSIONE_REGOLE } from "../regole/eu261";
import { VETTORI } from "../regole/vettori";
import { COMPAGNIE } from "../lettera/compagnie";
import { quantiNeb } from "../lettera/neb";
import { quantiScali } from "../voli/aeroporti";
import { RIFIUTI } from "../pratiche/rifiuto";

/**
 * COME LAVORA IL MOTORE, SPIEGATO.
 *
 * 🔴 Valerio, 13/08: «spiegami pezzo per pezzo come lavora il nostro
 * motore, perché io ho capito che non usiamo solo AeroDataBox ma usiamo
 * anche un database nostro, giusto? Indicami tutte le fonti, indicami dal
 * primo all'ultimo dalla A alla Z cosa succede quando uno sta facendo il
 * check. Dimmi anche come vederlo, dimmi anche lo stato del database».
 *
 * Aveva capito bene: le fonti sono NOVE, non una, e tre di quelle
 * decisive sono nostre (l'archivio degli scali, le regole scritte, la
 * memoria dei voli già visti).
 *
 * ⚠️ TUTTI I NUMERI DI QUESTO FILE SI CONTANO, NON SI SCRIVONO. È già
 * successo (mappa del 12/08) che una schermata dichiarasse «58 casi»
 * mentre ne esistevano 53, perché il numero era copiato a mano dal
 * diario di un giro precedente. Una pagina che spiega il motore e mente
 * su quanto è provato è peggio di una pagina che non c'è: quel numero è
 * esattamente quello che si guarda per decidere se fidarsi.
 *
 * ⚠️ E NON C'È NIENTE DI SEGRETO QUI DENTRO. La pagina è protetta dal
 * ruolo admin come tutte le altre, ma per prudenza: qui si spiegano
 * meccanismi, non si stampano chiavi.
 */

export type Fonte = {
  nome: string;
  /** Nostra o di qualcun altro: è la distinzione che Valerio chiedeva. */
  chi: "nostra" | "esterna";
  /** Cosa ci mette, in una riga. */
  da: string;
  /** Quanto è grande, contato adesso. Null quando non è una quantità. */
  quanto: string | null;
  /** Cosa succede se sparisce. */
  seManca: string;
  /** Quanto costa, per davvero. */
  costo: string;
  /** Il file che la usa: per ritrovarla senza cercare. */
  dove: string;
};

export function fonti(): Fonte[] {
  return [
    {
      nome: "AeroDataBox",
      chi: "esterna",
      da: "L'orario vero di arrivo, cioè il momento in cui l'aereo è arrivato davvero. È il fatto su cui si regge tutto il resto.",
      quanto: null,
      seManca:
        "I check escono incerti e non si vende niente. Non si sbaglia: ci si ferma. Suona un allarme sul telefono.",
      costo: "Abbonamento mensile, non un prezzo a chiamata. Un volo costa una chiamata sola anche se lo controllano in 180.",
      dove: "lib/voli/fornitori/",
    },
    {
      nome: "La memoria dei voli",
      chi: "nostra",
      da: "Ogni volo già controllato resta salvato con i suoi orari e la risposta grezza del fornitore, che vale come prova.",
      quanto: "tabella voli",
      seManca:
        "Niente si rompe, ma ogni passeggero dello stesso volo diventa una chiamata a pagamento in più.",
      costo: "Zero.",
      dove: "lib/voli/verifica.ts",
    },
    {
      nome: "L'archivio degli aeroporti",
      chi: "nostra",
      da: "Sigla, città, paese e coordinate di ogni scalo. Serve a calcolare la distanza in linea d'aria, che decide la fascia da 250, 400 o 600 euro.",
      quanto: `${quantiScali().toLocaleString("it-IT")} scali`,
      seManca: "Senza distanza non c'è fascia, quindi non c'è verdetto.",
      costo: "Zero: è un file nostro, aggiornato ogni lunedì da un lavoro automatico.",
      dove: "lib/dati/aeroporti.json",
    },
    {
      nome: "Le regole del Regolamento",
      chi: "nostra",
      da: "Il Regolamento CE 261/2004 scritto in codice: chi è coperto, quante ore di ritardo servono, quanto spetta.",
      quanto: `versione ${VERSIONE_REGOLE}, provata su ${CASI_ORO.length} casi`,
      seManca: "Non può mancare: è il prodotto.",
      costo: "Zero.",
      dove: "lib/regole/eu261.ts",
    },
    {
      nome: "Le licenze delle compagnie",
      chi: "nostra",
      da: "In che paese ha licenza chi ha operato il volo. Serve a decidere i casi che partono da fuori Europa, dove conta solo questo.",
      quanto: `${Object.keys(VETTORI).length} compagnie extra UE`,
      seManca: "Quei casi escono incerti invece di uscire con un no pulito.",
      costo: "Zero.",
      dove: "lib/regole/vettori.ts",
    },
    {
      nome: "Gli scioperi conosciuti",
      chi: "nostra",
      da: "Le date di sciopero proclamate. Un ritardo nel giorno di uno sciopero esce incerto, mai idoneo.",
      quanto: "tabella scioperi",
      seManca: "Il motore diventa meno prudente proprio nei giorni in cui la compagnia ha l'argomento più forte.",
      costo: "Zero: le raccoglie un lavoro automatico dalle pagine pubbliche.",
      dove: "lib/scioperi/",
    },
    {
      nome: "Mistral OCR",
      chi: "esterna",
      da: "Trasforma un'immagine in testo: la foto della carta d'imbarco nel check, e la risposta della compagnia dentro la pratica.",
      quanto: null,
      seManca:
        "Restano gli altri due modi di dire qual è il volo (tratta e numero) e la risposta della compagnia si incolla a mano.",
      costo: "A chiamata, e le chiamate sono poche: solo chi carica un'immagine.",
      dove: "lib/ocr/carta-imbarco.ts",
    },
    {
      nome: "Mistral (il modello che scrive)",
      chi: "esterna",
      da: "Legge la risposta della compagnia, capisce quale dei motivi è, tira fuori i loro fatti e scrive il paragrafo della replica.",
      quanto: `${RIFIUTI.length} motivi riconosciuti`,
      seManca: "La replica resta quella fissa, verificata a mano: meno su misura, ugualmente valida.",
      costo: "A chiamata, solo quando qualcuno riceve un no.",
      dove: "lib/ai/replica.ts",
    },
    {
      nome: "I canali di reclamo e gli enti",
      chi: "nostra",
      da: "A chi si manda la lettera: l'ufficio reclami di ogni compagnia e l'ente nazionale del paese di partenza.",
      quanto: `${COMPAGNIE.length} compagnie · ${quantiNeb()} paesi`,
      seManca: "La lettera esce comunque, ma il destinatario lo deve cercare il passeggero.",
      costo: "Zero: verificati a mano, uno per uno.",
      dove: "lib/lettera/",
    },
  ];
}

export type PassoCheck = {
  numero: number;
  titolo: string;
  cosa: string;
  /** ⚠️ La cosa che si può rompere qui, o che sorprende. */
  nota?: string;
  dove: string;
};

/**
 * DALLA A ALLA Z: cosa succede quando qualcuno preme il bottone.
 *
 * ⚠️ L'ORDINE NON È DECORATIVO. Il cancello territoriale sta al passo 4,
 * PRIMA del calcolo del ritardo, e non è un dettaglio: finché non c'era,
 * un New York → Toronto con quattro ore di ritardo usciva idoneo a 600
 * euro. Spostarlo dopo vorrebbe dire rifare quel falso positivo.
 */
export function passiDelCheck(): PassoCheck[] {
  return [
    {
      numero: 1,
      titolo: "Si capisce di che volo si parla",
      cosa: "L'utente dà la tratta (predefinito), il numero di volo, oppure la foto della carta d'imbarco. Da tutti e tre si esce con la stessa cosa: un codice volo e una data.",
      nota: "La foto si legge e si butta: non viene salvata da nessuna parte.",
      dove: "components/check/SchedaCheck.tsx",
    },
    {
      numero: 2,
      titolo: "Si guarda se quel volo lo conosciamo già",
      cosa: "Se qualcun altro ha controllato lo stesso volo dello stesso giorno, gli orari sono già in casa e non si chiede niente a nessuno.",
      nota: "La memoria è una fotografia, non una verità: se le manca un dato che oggi serve al verdetto, la riga si butta e il volo si richiede. Senza questo controllo un verdetto sbagliato resterebbe congelato per sempre, ed è quello che è successo a FR4001 del 6 agosto.",
      dove: "lib/voli/verifica.ts",
    },
    {
      numero: 3,
      titolo: "Si chiedono gli orari veri",
      cosa: "Si chiama AeroDataBox e si prende l'orario di arrivo effettivo. Se il fornitore dà una stima invece di un dato certificato, il caso esce incerto: una stima non è un fatto.",
      nota: "Se il fornitore dice «troppe richieste» si aspetta e si riprova, con un tetto sotto i dieci secondi. Prima si mollava al primo no, proprio nel minuto in cui arriva più gente.",
      dove: "lib/voli/fornitori/chiamata.ts",
    },
    {
      numero: 4,
      titolo: "Si controlla se il Regolamento si applica",
      cosa: "Conta da dove parte l'aereo. Partenza dall'Europa: coperto sempre, con qualsiasi compagnia. Partenza da un paese terzo: coperto solo se chi ha operato ha licenza europea. Terzo verso terzo: mai.",
      nota: "Questo passo viene PRIMA del calcolo del ritardo, e deve restare lì: finché non c'era, un New York → Toronto con quattro ore di ritardo usciva idoneo a 600 euro. Dove non siamo sicuri esce incerto, mai idoneo.",
      dove: "lib/regole/territorio.ts",
    },
    {
      numero: 5,
      titolo: "Si calcola il ritardo e la distanza",
      cosa: "Ritardo = arrivo effettivo meno arrivo previsto, misurato all'ARRIVO e non alla partenza. Distanza = linea d'aria fra i due scali, presa dal nostro archivio.",
      dove: "lib/regole/eu261.ts",
    },
    {
      numero: 6,
      titolo: "Escono le tre risposte possibili",
      cosa: "Idoneo (so quanto ti spetta e perché), incerto (non lo so, e te lo dico), non idoneo. Un caso incerto NON si vende mai: è la regola che tiene in piedi tutto.",
      nota: "Le regole sono scritte: nessun modello di intelligenza artificiale tocca il verdetto, mai, in nessun punto.",
      dove: "lib/regole/eu261.ts",
    },
    {
      numero: 7,
      titolo: "Si scrive tutto",
      cosa: "Il verdetto, gli orari da cui esce, la versione delle regole usata e la risposta grezza del fornitore finiscono nel database. È la prova di cosa abbiamo detto e su cosa.",
      nota: "Serve il giorno che un cliente contesta: si riapre la riga e si vede esattamente cosa sapevamo e quando.",
      dove: "tabella verifiche",
    },
    {
      numero: 8,
      titolo: "Quello che gli archivi non possono sapere",
      cosa: "Volo cancellato, negato imbarco, coincidenza persa: la legge lega la compensazione a fatti che nessun database conosce (quando ti hanno avvisato, che alternativa ti hanno dato). Si chiedono all'utente a scelta chiusa, e il verdetto lo richiude il server.",
      nota: "Anche qui l'utente non decide: risponde a domande su fatti suoi, e le regole fanno il resto.",
      dove: "lib/regole/cancellato.ts",
    },
  ];
}
