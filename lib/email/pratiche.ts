import { casa, spedisci, type Esito } from "./posta";
import { bottone, COLORI as C, FONT, riga, vestito } from "./modello";

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

const dataIt = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const CODA = "Ricevi questa email perché hai una pratica aperta su Rivoglio.";

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
           ${d.garanziaFinoAl ? riga("Garanzia fino al", dataIt(d.garanziaFinoAl)) : ""}
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
        (d.garanziaFinoAl
          ? p(
              `<strong style="color:${C.inchiostro}">La garanzia:</strong> se entro il ${dataIt(d.garanziaFinoAl)} la compagnia non ti ha dato nulla, ti rimborsiamo per intero quello che hai pagato.`,
            )
          : ""),
      coda: CODA,
    }),
    testo: `Pagamento ricevuto. La pratica è aperta.\n\nVolo ${d.volo}${quando}.${
      d.importo ? ` Fascia: ${euro(d.importo)} a passeggero (artt. 5 e 7, Reg. CE 261/2004).` : ""
    }\n\nI due passi che restano:\n1. Entra nella pratica e carica la carta d'imbarco.\n2. Copia la lettera pronta e inviala alla compagnia dalla tua email.\n\nApri la pratica (link valido una volta sola): ${d.link}\nSe scade: ${casa()}/entra\n\nPerché la mandi tu: un reclamo dal passeggero non si respinge come richiesta di un intermediario, e il recupero resta tuo al 100%.${
      d.garanziaFinoAl
        ? `\nGaranzia: se entro il ${dataIt(d.garanziaFinoAl)} non ricevi nulla, ti rimborsiamo per intero.`
        : ""
    }`,
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
  },
): Promise<Esito> {
  const compagnia = d.compagnia || "[Compagnia]";
  const quando = d.dataVolo ? dataIt(d.dataVolo) : "[data del volo]";
  const testoSollecito =
    `<strong>Oggetto:</strong> Sollecito richiesta di compensazione, volo ${d.volo} del ${quando}<br><br>` +
    `Spett.le ${compagnia},<br><br>` +
    `in data ${dataIt(d.dataInvio)} vi ho inviato una richiesta di compensazione pecuniaria ai sensi degli articoli 5 e 7 del Regolamento CE 261/2004, relativa al volo ${d.volo} del ${quando}.<br><br>` +
    `Non ho ricevuto alcun riscontro. Vi chiedo una risposta entro 14 giorni. In mancanza, presenterò reclamo all'ENAC e valuterò ogni ulteriore azione prevista dalla legge.<br><br>` +
    `[Nome e cognome]`;

  return spedisci({
    a,
    oggetto: "15 giorni di silenzio. Il sollecito è pronto.",
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
    testo: `Nessuna risposta? Si insiste.\n\nHai inviato il reclamo il ${dataIt(d.dataInvio)} e la compagnia non ha risposto. Il sollecito è pronto: copia e invia questo testo dalla stessa email del primo reclamo.\n\n---\nOggetto: Sollecito richiesta di compensazione, volo ${d.volo} del ${quando}\n\nSpett.le ${compagnia},\n\nin data ${dataIt(d.dataInvio)} vi ho inviato una richiesta di compensazione pecuniaria ai sensi degli articoli 5 e 7 del Regolamento CE 261/2004, relativa al volo ${d.volo} del ${quando}.\n\nNon ho ricevuto alcun riscontro. Vi chiedo una risposta entro 14 giorni. In mancanza, presenterò reclamo all'ENAC e valuterò ogni ulteriore azione prevista dalla legge.\n\n[Nome e cognome]\n---\n\nLa tua pratica: ${d.link}`,
  });
}

/* ------------------------------------------------------------ T+30 */
/** Un mese senza esito: si passa all'autorità. Il reclamo ENAC è gratuito. */
export function reclamoEnac(
  a: string,
  d: { volo: string; dataVolo: string | null; link: string },
): Promise<Esito> {
  const quando = d.dataVolo ? ` del ${dataIt(d.dataVolo)}` : "";
  return spedisci({
    a,
    oggetto: "30 giorni senza esito: è il momento dell'ENAC.",
    html: vestito({
      titolo: "Il reclamo ENAC",
      corpo:
        h("Ora rispondono all'autorità.") +
        p(
          `Sono passati 30 giorni dal tuo reclamo per il volo ${d.volo}${quando}, senza un esito. Il passo successivo è il reclamo all'ENAC, l'ente nazionale che vigila sul Regolamento CE 261/2004. È gratuito e si presenta online.`,
        ) +
        p(
          "Cambia il peso: con il reclamo ENAC la compagnia non risponde più solo a te, risponde a chi può sanzionarla.",
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
          `Il modulo è sul sito dell'ENAC: <a href="https://www.enac.gov.it" style="color:${C.verde};">enac.gov.it</a>. Se qualcosa non torna, rispondi a questa email.`,
        ),
      coda: CODA,
    }),
    testo: `Ora rispondono all'autorità.\n\n30 giorni dal tuo reclamo per il volo ${d.volo}${quando}, senza esito. Il passo successivo è il reclamo all'ENAC: gratuito, online, e la compagnia risponde a chi può sanzionarla.\n\nCosa serve: numero e data del volo, il reclamo già inviato, l'eventuale risposta della compagnia. È tutto nella tua pratica: ${d.link}\n\nIl modulo: https://www.enac.gov.it`,
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
          "Sono passati due mesi dall'invio del reclamo. Dimmi come sta andando, qualunque cosa sia successa:",
        ) +
        scatola(
          `<strong>Se la compagnia ha pagato:</strong> segnalo nella pratica e chiudiamo.<br>
           <strong>Se ha rifiutato:</strong> segnalo lo stesso, il rifiuto scritto serve per i passi successivi.<br>
           <strong>Se non si è fatta viva:</strong> dillo anche in questo caso, così la garanzia parte da sola.`,
        ) +
        bottone("Aggiorna la tua pratica", d.link) +
        (d.garanziaFinoAl
          ? p(
              `<strong style="color:${C.inchiostro}">La garanzia vale ancora:</strong> se entro il ${dataIt(d.garanziaFinoAl)} non hai ricevuto nulla, ti rimborsiamo per intero il prezzo della pratica. Non devi fare domanda: la scadenza la teniamo d'occhio noi.`,
            )
          : p(
              `<strong style="color:${C.inchiostro}">La garanzia vale ancora:</strong> se non ricevi nulla entro i 90 giorni, ti rimborsiamo per intero il prezzo della pratica.`,
            )),
      coda: CODA,
    }),
    testo: `A che punto sei?\n\nSono passati due mesi dall'invio del reclamo.\n- Se la compagnia ha pagato: segnalo nella pratica e chiudiamo.\n- Se ha rifiutato: segnalo, il rifiuto scritto serve per i passi successivi.\n- Se non si è fatta viva: dillo lo stesso, così la garanzia parte da sola.\n\nAggiorna la pratica: ${d.link}\n${
      d.garanziaFinoAl
        ? `\nGaranzia: se entro il ${dataIt(d.garanziaFinoAl)} non ricevi nulla, rimborso integrale del prezzo pagato. Ci pensiamo noi.`
        : "\nGaranzia: se non ricevi nulla entro i 90 giorni, rimborso integrale del prezzo pagato."
    }`,
  });
}
