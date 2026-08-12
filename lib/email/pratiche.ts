import { casa, spedisci, type Esito } from "./posta";
import { dataConGiorno, dataIt as dataItRoma } from "@/lib/tempo";
import { nebPerPaese, nomeBreveNeb } from "@/lib/lettera/neb";
import {
  GIORNI_PRIMA_DELL_ENTE,
  GIORNI_PRIMA_DELL_ESITO,
  GIORNI_PRIMA_DEL_SOLLECITO,
} from "@/lib/pratiche/rifiuto";
import { paeseDiScalo } from "@/lib/regole/territorio";
import { bottone, COLORI as C, FONT, riga, vestito } from "./modello";

/* ────────────────────── i giorni, presi dal motore ──────────────────────
   🔴 QUESTE EMAIL DICEVANO GIORNI CHE NON SONO PIU' QUELLI VERI: 15, 30 e
   "due mesi", cioe' il calendario di prima del giro #45. Dal 9/08 il
   sollecito parte al giorno 42 e la segnalazione al 56, perche' le
   compagnie rispondono in 8-14 settimane e un sollecito mandato al giorno
   15 arriva prima che qualcuno abbia aperto la pratica.
   Il cliente riceveva un'email che diceva "sono passati 30 giorni" quando
   ne erano passati 56, e contava i giorni sbagliati per capire a che
   punto era. Trovato dall'ispezione del 12/08.

   ⚠️ ADESSO I NUMERI NON SI SCRIVONO PIU' A MANO: si contano dalle
   costanti che decidono QUANDO l'email parte davvero. Se un domani si
   sposta la tappa, il testo si sposta con lei. Ed e' in settimane, non in
   giorni: "sei settimane" si legge, "42 giorni" si conta. */
const SETTIMANE_SOLLECITO = Math.round(GIORNI_PRIMA_DEL_SOLLECITO / 7);
const SETTIMANE_ENTE = Math.round((GIORNI_PRIMA_DEL_SOLLECITO + GIORNI_PRIMA_DELL_ENTE) / 7);
const SETTIMANE_ESITO = Math.round(GIORNI_PRIMA_DELL_ESITO / 7);

/**
 * L'ente a cui si scrive, deciso dallo scalo di PARTENZA (art. 16 par. 1).
 * Senza lo scalo non si inventa un ufficio: si dice quello che sappiamo e
 * si rimanda alla lettera, che l'ente giusto ce l'ha scritto dentro.
 */
function enteDiPartenza(partenzaIata?: string | null): { nome: string; dove: string } {
  const paese = paeseDiScalo(partenzaIata);
  const neb = paese ? nebPerPaese(paese) : null;
  if (!neb) {
    return {
      nome: "l'ente nazionale del paese da cui sei partito",
      dove: "Trovi quale è, e come contattarlo, dentro la tua pratica.",
    };
  }
  return {
    nome: nomeBreveNeb(neb),
    dove: neb.url
      ? `Il modulo è su <a href="${neb.url}" style="color:${C.verde};">${neb.url.replace(/^https?:\/\/(www\.)?/, "")}</a>.`
      : "Trovi come contattarlo dentro la tua pratica.",
  };
}

/**
 * La sequenza email della pratica (SPEC §6). È il prodotto vero: il dato
 * oggettivo lo diamo al T+0, ma è il secondo e terzo colpo che porta i
 * soldi a casa. Ogni email dice COSA fare adesso e PERCHÉ.
 *
 *   T+0   pratica pronta: istruzioni + link magico per entrare
 *   T+2   promemoria: l'hai inviata?
 *   T+15  sollecito con testo pronto da copiare
 *   T+30  escalation: reclamo ENAC
 *   T+60  com'è andata? + promemoria della garanzia
 *
 * Nessuna funzione lancia eccezioni: `spedisci` torna un esito e chi
 * chiama (webhook, cron) decide cosa farne. Un'email che non parte non
 * deve mai far fallire un pagamento già riuscito.
 */

const p = (testo: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.fumo};">${testo}</p>`;

const h = (testo: string) =>
  `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:27px;line-height:1.2;color:${C.inchiostro};font-weight:700;letter-spacing:-0.5px;">${testo}</h1>`;

/** Il riquadro menta per i passi da fare. */
const scatola = (testo: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.menta};border-radius:14px;margin:0 0 16px;">
     <tr><td style="padding:20px 22px;font-family:${FONT};font-size:15px;line-height:1.7;color:${C.verdeNotte};">${testo}</td></tr>
   </table>`;

/** Il riquadro grigio per il testo da copiare parola per parola. */
const daCopiare = (testo: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.nebbia};border:1px solid ${C.bordo};border-radius:12px;margin:0 0 16px;">
     <tr><td style="padding:18px 20px;font-family:${FONT};font-size:14px;line-height:1.75;color:${C.inchiostro};">${testo}</td></tr>
   </table>`;

const euro = (n: number) => n.toLocaleString("it-IT", { maximumFractionDigits: 0 }) + "€";

const prezzoIt = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

/* ⚠️ Le date delle email passano da lib/tempo: erano scritte in UTC, e
   un'email spedita a mezzanotte e mezza diceva il giorno prima. Su una
   riga tipo "sono passate sei settimane dal tuo invio" un giorno di
   scarto si nota. */
const dataIt = (iso: string) => dataItRoma(iso);

const CODA = "Ricevi questa email perché hai una pratica aperta su Rivolio.";

/* ------------------------------------------------------------- T+0 */
/**
 * Pagamento ricevuto, pratica aperta. Il `link` è il link magico generato
 * dal webhook: entra senza password, dritto nella pratica.
 */
export function praticaPronta(
  a: string,
  d: {
    volo: string;
    dataVolo: string | null;
    importo: number | null;
    tipo: "singola" | "famiglia";
    prezzo: number | null;
    garanziaFinoAl: string | null;
    link: string;
  },
): Promise<Esito> {
  const quando = d.dataVolo ? ` del ${dataIt(d.dataVolo)}` : "";
  const fascia = d.importo
    ? p(
        `Volo <strong style="color:${C.inchiostro}">${d.volo}</strong>${quando}. La fascia del tuo caso è <strong style="color:${C.inchiostro}">${euro(d.importo)} a passeggero</strong>: la fissano gli articoli 5 e 7 del Regolamento CE 261/2004, in base a ritardo e distanza della tratta.`,
      )
    : p(`Volo <strong style="color:${C.inchiostro}">${d.volo}</strong>${quando}.`);

  const conto =
    d.prezzo !== null
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
           ${riga("Pratica", d.tipo === "famiglia" ? "Famiglia (fino a 5 passeggeri)" : "Singola")}
           ${riga("Hai pagato", prezzoIt(d.prezzo), true)}
           ${riga("Garanzia", "Se la compagnia non paga, ti rimborsiamo")}
         </table>`
      : "";

  const famiglia =
    d.tipo === "famiglia"
      ? p(
          "La pratica famiglia copre fino a 5 passeggeri dello stesso volo. Li aggiungi nella pratica, con nome e cognome: la lettera li elenca tutti.",
        )
      : "";

  return spedisci({
    a,
    oggetto: "La tua pratica è pronta. Due passi e parte.",
    html: vestito({
      titolo: "La tua pratica è pronta",
      corpo:
        h("Pagamento ricevuto. La pratica è aperta.") +
        fascia +
        conto +
        scatola(
          `<strong>I due passi che restano</strong><br>
           1. Entra nella pratica e carica la carta d'imbarco, o l'email di conferma della prenotazione.<br>
           2. Copia la lettera già pronta e inviala alla compagnia dalla tua email.`,
        ) +
        bottone("Apri la tua pratica", d.link) +
        p(
          "Il bottone ti fa entrare senza password e vale una volta sola. Se scade, entra con questa email da " +
            `<a href="${casa()}/entra" style="color:${C.verde};">${casa().replace(/^https?:\/\//, "")}/entra</a>.`,
        ) +
        famiglia +
        p(
          `<strong style="color:${C.inchiostro}">Perché la mandi tu e non noi:</strong> un reclamo che parte dalla casella del passeggero non può essere respinto come richiesta di un intermediario, e quello che recuperi resta tuo al 100%. Noi prepariamo, tu firmi.`,
        ) +
        p(
          `<strong style="color:${C.inchiostro}">La garanzia:</strong> se la compagnia rifiuta senza un motivo valido, o non risponde entro i termini di legge, ti rimborsiamo per intero quello che hai pagato. Ti scrivo io per sapere com'è andata.`,
        ),
      coda: CODA,
    }),
    testo: `Pagamento ricevuto. La pratica è aperta.\n\nVolo ${d.volo}${quando}.${
      d.importo ? ` Fascia: ${euro(d.importo)} a passeggero (artt. 5 e 7, Reg. CE 261/2004).` : ""
    }\n\nI due passi che restano:\n1. Entra nella pratica e carica la carta d'imbarco.\n2. Copia la lettera pronta e inviala alla compagnia dalla tua email.\n\nApri la pratica (link valido una volta sola): ${d.link}\nSe scade: ${casa()}/entra\n\nPerché la mandi tu: un reclamo dal passeggero non si respinge come richiesta di un intermediario, e il recupero resta tuo al 100%.${
      "\nGaranzia: se la compagnia rifiuta senza un motivo valido o non risponde nei termini, ti rimborsiamo per intero."
    }`,
  });
}

/* ------------------------------------------- conferma dell'invio */
/**
 * «Ho inviato il reclamo»: la ricevuta di quel gesto.
 *
 * Scelta di Valerio col popup del 12/08. Prima, premere quel bottone
 * cambiava una riga nella cronologia e basta: chi aveva appena mandato
 * la lettera restava senza niente in mano, nel momento in cui comincia
 * l'attesa più lunga del percorso (le compagnie rispondono in otto-
 * quattordici settimane).
 *
 * Questa email fa una cosa sola e la fa bene: mette per iscritto la
 * data di partenza e il giorno in cui torniamo a farci vivi. Da quel
 * momento il cliente non deve più controllare niente.
 *
 * ⚠️ Il giorno del sollecito non è scritto a mano: arriva da
 * `SETTIMANE_SOLLECITO`, cioè dalla stessa costante che decide quando
 * l'email del sollecito parte davvero.
 */
export function invioConfermato(
  a: string,
  d: { volo: string; dataInvio: string; giornoSollecito: string; link: string },
): Promise<Esito> {
  return spedisci({
    a,
    oggetto: `Reclamo ${d.volo}: registrato. Adesso tocca a loro.`,
    html: vestito({
      titolo: "Reclamo registrato",
      corpo:
        h("Il reclamo è partito. Da qui in poi ci pensiamo noi.") +
        p(
          `Hai segnato l'invio del reclamo per il volo <strong style="color:${C.inchiostro}">${d.volo}</strong> il ${dataIt(d.dataInvio)}. Da oggi la palla è alla compagnia.`,
        ) +
        scatola(
          `<strong>Cosa succede adesso</strong><br>
           Le compagnie rispondono in otto-quattordici settimane: il silenzio delle prime settimane è normale, non è un brutto segno.<br>
           Se <strong>${dataConGiorno(d.giornoSollecito)}</strong> non avranno ancora risposto, ti scrivo io con il sollecito già pronto.<br>
           Se invece rispondono <strong>no</strong> prima di allora, aprila e dimmi che motivo hanno dato: la replica parte subito, senza aspettare.`,
        ) +
        bottone("Apri la tua pratica", d.link) +
        p(
          "Non devi controllare niente e non devi ricordarti nessuna data: i passi li facciamo partire noi.",
        ),
      coda: CODA,
    }),
    testo: `Il reclamo è partito. Da qui in poi ci pensiamo noi.

Hai segnato l'invio del reclamo per il volo ${d.volo} il ${dataIt(d.dataInvio)}.

Cosa succede adesso:
Le compagnie rispondono in otto-quattordici settimane, quindi il silenzio delle prime settimane è normale.
Se ${dataConGiorno(d.giornoSollecito)} non avranno risposto, ti scrivo io col sollecito già pronto.
Se rispondono no prima, aprila e dimmi che motivo hanno dato: la replica parte subito.

La tua pratica: ${d.link}`,
  });
}

/* ------------------------------------------------------------- T+2 */
/** Pagata ma mai segnata come inviata: il promemoria che sblocca. */
export function promemoriaInvio(
  a: string,
  d: { importo: number | null; link: string },
): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "L'hai inviata? Ci vogliono 2 minuti.",
    html: vestito({
      titolo: "Manca solo l'invio",
      corpo:
        h("Manca solo l'invio.") +
        p(
          "La tua lettera è pronta da due giorni, ma vale solo se parte. Copiala dalla pratica, incollala in un'email e mandala alla compagnia. Due minuti, davvero.",
        ) +
        (d.importo
          ? p(
              `In ballo ci sono <strong style="color:${C.inchiostro}">${euro(d.importo)} a passeggero</strong>, la fascia fissata dal Regolamento CE 261/2004 per il tuo caso.`,
            )
          : "") +
        bottone("Apri la pratica e copia la lettera", d.link) +
        p(
          `Quando l'hai mandata, premi "L'ho inviata" nella pratica. Da quel giorno partono i tempi del sollecito, e da lì in poi ti seguo io.`,
        ),
      coda: CODA,
    }),
    testo: `Manca solo l'invio.\n\nLa lettera è pronta da due giorni. Copiala dalla pratica, incollala in un'email e mandala alla compagnia.${
      d.importo ? `\nIn ballo: ${euro(d.importo)} a passeggero (Reg. CE 261/2004).` : ""
    }\n\nApri la pratica: ${d.link}\n\nQuando l'hai mandata, premi "L'ho inviata" nella pratica: da quel giorno partono i tempi del sollecito.`,
  });
}

/* ------------------------------------------------------------ T+15 */
/**
 * Il momento in cui quasi tutti mollano, e la compagnia lo sa. Il testo
 * del sollecito è già scritto: si copia e si manda.
 */
export function sollecitoPronto(
  a: string,
  d: {
    volo: string;
    dataVolo: string | null;
    compagnia: string | null;
    dataInvio: string;
    importo: number | null;
    link: string;
    /** Lo scalo di partenza: decide l'ente da nominare (art. 16 par. 1). */
    partenzaIata?: string | null;
  },
): Promise<Esito> {
  const compagnia = d.compagnia || "[Compagnia]";
  const ente = enteDiPartenza(d.partenzaIata).nome;
  const quando = d.dataVolo ? dataIt(d.dataVolo) : "[data del volo]";
  const testoSollecito =
    `<strong>Oggetto:</strong> Sollecito richiesta di compensazione, volo ${d.volo} del ${quando}<br><br>` +
    `Spett.le ${compagnia},<br><br>` +
    `in data ${dataIt(d.dataInvio)} vi ho inviato una richiesta di compensazione pecuniaria ai sensi degli articoli 5 e 7 del Regolamento CE 261/2004, relativa al volo ${d.volo} del ${quando}.<br><br>` +
    `Non ho ricevuto alcun riscontro. Vi chiedo una risposta entro 14 giorni. In mancanza, presenterò reclamo a ${ente} e valuterò ogni ulteriore azione prevista dalla legge.<br><br>` +
    `[Nome e cognome]`;

  return spedisci({
    a,
    oggetto: `${SETTIMANE_SOLLECITO} settimane di silenzio. Il sollecito è pronto.`,
    html: vestito({
      titolo: "Il sollecito è pronto",
      corpo:
        h("Nessuna risposta? Si insiste.") +
        p(
          `Hai inviato il reclamo il ${dataIt(d.dataInvio)} e la compagnia non si è fatta viva. È la prassi: il silenzio scoraggia, e molte richieste muoiono proprio qui. Il sollecito esiste per questo momento.`,
        ) +
        (d.importo
          ? p(
              `La fascia del tuo caso resta <strong style="color:${C.inchiostro}">${euro(d.importo)} a passeggero</strong>: il silenzio non la cancella.`,
            )
          : "") +
        p("Copia questo testo e invialo alla compagnia, dalla stessa email del primo reclamo:") +
        daCopiare(testoSollecito) +
        bottone("Apri la tua pratica", d.link) +
        p("Nella pratica trovi i dati del volo, se vuoi ricontrollarli prima di inviare."),
      coda: CODA,
    }),
    testo: `Nessuna risposta? Si insiste.\n\nHai inviato il reclamo il ${dataIt(d.dataInvio)} e la compagnia non ha risposto. Il sollecito è pronto: copia e invia questo testo dalla stessa email del primo reclamo.\n\n---\nOggetto: Sollecito richiesta di compensazione, volo ${d.volo} del ${quando}\n\nSpett.le ${compagnia},\n\nin data ${dataIt(d.dataInvio)} vi ho inviato una richiesta di compensazione pecuniaria ai sensi degli articoli 5 e 7 del Regolamento CE 261/2004, relativa al volo ${d.volo} del ${quando}.\n\nNon ho ricevuto alcun riscontro. Vi chiedo una risposta entro 14 giorni. In mancanza, presenterò reclamo a ${ente} e valuterò ogni ulteriore azione prevista dalla legge.\n\n[Nome e cognome]\n---\n\nLa tua pratica: ${d.link}`,
  });
}

/* ------------------------------------------------------------ T+56 */
/**
 * Otto settimane senza esito: si passa all'autorità. È gratuito.
 *
 * 🔴 QUESTA EMAIL MANDAVA TUTTI ALL'ENAC. Ma la competenza è dello Stato
 * dell'aeroporto di PARTENZA (art. 16 par. 1), e la lettera dal giro #38
 * nomina l'ente giusto paese per paese: chi parte da Barcellona veniva
 * mandato all'ufficio sbagliato e perdeva settimane, mentre la sua
 * lettera gli diceva il contrario. La funzione non riceveva nemmeno il
 * paese, quindi non poteva fare altro. Adesso lo riceve.
 * ⚠️ Se lo scalo di partenza non lo sappiamo, non si inventa un ufficio:
 * si dice "l'ente nazionale del paese da cui sei partito" e si rimanda
 * alla lettera, che quell'ente ce l'ha scritto dentro.
 * Trovato dall'ispezione del 12/08.
 */
export function reclamoEnac(
  a: string,
  d: { volo: string; dataVolo: string | null; link: string; partenzaIata?: string | null },
): Promise<Esito> {
  const quando = d.dataVolo ? ` del ${dataIt(d.dataVolo)}` : "";
  const e = enteDiPartenza(d.partenzaIata);
  return spedisci({
    a,
    oggetto: `${SETTIMANE_ENTE} settimane senza esito: è il momento dell'ente nazionale.`,
    html: vestito({
      titolo: "La segnalazione all'ente",
      corpo:
        h("Ora rispondono all'autorità.") +
        p(
          `Sono passate ${SETTIMANE_ENTE} settimane dal tuo reclamo per il volo ${d.volo}${quando}, senza un esito. Il passo successivo è la segnalazione a ${e.nome}, l'ente che vigila sul Regolamento CE 261/2004 per il paese da cui sei partito. È gratuita e si presenta online.`,
        ) +
        p(
          "Cambia il peso: con la segnalazione la compagnia non risponde più solo a te, risponde a chi può sanzionarla.",
        ) +
        scatola(
          `<strong>Cosa serve per compilarlo</strong><br>
           1. Numero e data del volo.<br>
           2. Il reclamo che hai già inviato alla compagnia.<br>
           3. La risposta della compagnia, se c'è stata.<br>
           È tutto nella tua pratica, in ordine.`,
        ) +
        bottone("Apri la tua pratica", d.link) +
        p(
          `${e.dove} Il testo della segnalazione è già scritto dentro la tua pratica. Se qualcosa non torna, rispondi a questa email.`,
        ),
      coda: CODA,
    }),
    testo: `Ora rispondono all'autorità.\n\n${SETTIMANE_ENTE} settimane dal tuo reclamo per il volo ${d.volo}${quando}, senza esito. Il passo successivo è la segnalazione a ${e.nome}: gratuita, online, e la compagnia risponde a chi può sanzionarla.\n\nCosa serve: numero e data del volo, il reclamo già inviato, l'eventuale risposta della compagnia. È tutto nella tua pratica, insieme al testo già scritto: ${d.link}`,
  });
}

/* ------------------------------------------------------------ T+60 */
/** Due mesi dopo l'invio: si chiede l'esito e si ricorda la garanzia. */
export function comeVa(
  a: string,
  d: { garanziaFinoAl: string | null; link: string },
): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Com'è andata? Conta anche il silenzio.",
    html: vestito({
      titolo: "A che punto sei",
      corpo:
        h("A che punto sei?") +
        p(
          `Sono passate ${SETTIMANE_ESITO} settimane dall'invio del reclamo. Dimmi come sta andando, qualunque cosa sia successa:`,
        ) +
        scatola(
          `<strong>Se la compagnia ha pagato:</strong> segnalo nella pratica e chiudiamo.<br>
           <strong>Se ha rifiutato:</strong> segnalo lo stesso, il rifiuto scritto serve per i passi successivi.<br>
           <strong>Se non si è fatta viva:</strong> dillo anche in questo caso, così la garanzia parte da sola.`,
        ) +
        bottone("Aggiorna la tua pratica", d.link) +
        p(
          `<strong style="color:${C.inchiostro}">La garanzia vale ancora:</strong> se la compagnia ha rifiutato senza un motivo valido, o non si è fatta viva nei termini, ti rimborsiamo per intero il prezzo della pratica. Non c'è nessun modulo: basta che tu mi dica com'è andata.`,
        ),
      coda: CODA,
    }),
    testo: `A che punto sei?\n\nSono passate ${SETTIMANE_ESITO} settimane dall'invio del reclamo.\n- Se la compagnia ha pagato: segnalo nella pratica e chiudiamo.\n- Se ha rifiutato: segnalo, il rifiuto scritto serve per i passi successivi.\n- Se non si è fatta viva: dillo lo stesso, così la garanzia parte da sola.\n\nAggiorna la pratica: ${d.link}\n${
      "\nGaranzia: se la compagnia rifiuta senza un motivo valido o non risponde nei termini, rimborso integrale del prezzo pagato."
    }`,
  });
}
