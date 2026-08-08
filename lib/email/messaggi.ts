import { casa, spedisci, type Esito } from "./posta";
import { bottone, COLORI as C, FONT, riga, vestito } from "./modello";

/**
 * Le email di servizio, una funzione ciascuna.
 *
 * VIVE (le mandano i flussi di Rivoglio):
 *   1. iscrizione all'Osservatorio     → benvenutoLista
 *   2. creazione dell'account          → benvenuto
 *   3. conferma dell'email             → conferma
 *   4. accesso senza password          → linkMagico
 * Le email della PRATICA (T+0/2/15/30/60) stanno in `pratiche.ts`.
 *
 * EREDITÀ del prodotto viaggi (5-8: ricercaAttiva, alert, creditiFiniti,
 * ricevuta): nessun flusso di Rivoglio le manda più; le richiama solo il
 * vecchio ramo ricerche/alert, da spegnere (voce in ARRETRATI). Non
 * riusarle per testi nuovi.
 *
 * Nessuna di queste lancia eccezioni: se l'email non parte, l'azione
 * dell'utente è comunque riuscita. Una registrazione fallita perché la
 * posta era giù sarebbe un disastro.
 */

const p = (testo: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.fumo};">${testo}</p>`;

const h = (testo: string) =>
  `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:27px;line-height:1.2;color:${C.inchiostro};font-weight:700;letter-spacing:-0.5px;">${testo}</h1>`;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { maximumFractionDigits: 0 }) + "€";

/* ---------------------------------------------------------------- 1 */
export function benvenutoLista(a: string, _comune?: string | null): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Sei nell'Osservatorio dei Disservizi.",
    html: vestito({
      titolo: "Sei dentro",
      corpo:
        h("Sei dentro.") +
        p(
          "Ogni settimana ti mando i 10 voli più in ritardo sui cieli italiani, presi dai dati che verifichiamo per i check. Una email a settimana, si annulla con un clic.",
        ) +
        p("Solo l'Osservatorio: niente pubblicità, niente altro.") +
        bottone("Controlla un volo, gratis", `${casa()}/app`) +
        p(
          `<strong style="color:${C.inchiostro}">Nel frattempo:</strong> se nell'ultimo anno hai preso un volo atterrato con più di 3 ore di ritardo, il check dice subito in che fascia rientri (250, 400 o 600 euro).`,
        ),
      coda: "Ricevi questa email perché ti sei iscritto all'Osservatorio dei Disservizi di Rivoglio.",
    }),
    testo: `Sei dentro.\n\nOgni settimana i 10 voli più in ritardo sui cieli italiani, dai dati che verifichiamo per i check. Una email a settimana, si annulla con un clic.\n\nControlla un volo, gratis: ${casa()}/app`,
  });
}

/* ---------------------------------------------------------------- 2 */
export function benvenuto(a: string): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Il tuo account Rivoglio è pronto.",
    html: vestito({
      titolo: "Benvenuto",
      corpo:
        h("Il tuo account è pronto.") +
        p(
          "Il check dei voli resta gratis e senza account, per te e per chiunque. L'account serve al resto: le tue pratiche e gli avvisi.",
        ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.menta};border-radius:14px;padding:20px 22px;margin:0 0 8px;">
           <tr><td style="font-family:${FONT};font-size:15px;line-height:1.7;color:${C.verdeNotte};">
             <strong>Cosa ti sei aperto</strong><br>
             1. Le pratiche si seguono passo per passo, dal sito e dall'app.<br>
             2. I voli che salvi nell'app li ricontrolliamo il giorno dopo: se rientrano in una fascia, ti avvisiamo noi.<br>
             3. Con questa email ritrovi tutto, su sito e app.
           </td></tr>
         </table>` +
        bottone("Controlla un volo, gratis", `${casa()}/app`) +
        p(
          "Nessun abbonamento e nessun addebito: si paga solo se apri una pratica, una volta sola. Se questo account non l'hai chiesto tu, rispondi a questa email e lo cancelliamo.",
        ),
      coda: "Ricevi questa email perché è stato creato un account Rivoglio con questo indirizzo.",
    }),
    testo: `Il tuo account è pronto.\n\nIl check dei voli resta gratis e senza account. L'account serve al resto:\n1. Le pratiche si seguono passo per passo, dal sito e dall'app.\n2. I voli che salvi nell'app li ricontrolliamo il giorno dopo: se rientrano in una fascia, ti avvisiamo noi.\n3. Con questa email ritrovi tutto, su sito e app.\n\nControlla un volo, gratis: ${casa()}/app\n\nNessun abbonamento e nessun addebito: si paga solo se apri una pratica, una volta sola.`,
  });
}

/* ---------------------------------------------------------------- 3 */
export function conferma(a: string, link: string): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Conferma il tuo indirizzo",
    html: vestito({
      titolo: "Conferma il tuo indirizzo",
      corpo:
        h("Un clic e sei dentro.") +
        p("Serve solo a essere sicuri che questo indirizzo sia davvero tuo.") +
        bottone("Conferma il mio indirizzo", link) +
        p(
          `Se non hai chiesto tu questa registrazione, ignora questa email: senza il clic non succede niente.`,
        ),
      coda: "Ricevi questa email perché qualcuno ha usato questo indirizzo per registrarsi su rivoglio.it.",
    }),
    testo: `Un clic e sei dentro.\n\nConferma il tuo indirizzo: ${link}\n\nSe non hai chiesto tu questa registrazione, ignora questa email.`,
  });
}

/* ---------------------------------------------------------------- 4 */
export function linkMagico(a: string, link: string): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Il tuo link per entrare",
    html: vestito({
      titolo: "Il tuo link per entrare",
      corpo:
        h("Entra senza password.") +
        p("Apri questo link dallo stesso dispositivo da cui l'hai chiesto.") +
        bottone("Entra", link) +
        p("Il link vale una volta sola e scade a breve. Se non l'hai chiesto tu, ignoralo."),
      coda: "Ricevi questa email perché è stato chiesto un accesso con questo indirizzo.",
    }),
    testo: `Entra senza password: ${link}\n\nIl link vale una volta sola e scade a breve.`,
  });
}

/* ---------------------------------------------------------------- 5 */
export function ricercaAttiva(
  a: string,
  r: { partenza: string; budget: number; ore: string; persone: number },
): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Ricerca attiva. Da qui in poi ci penso io.",
    html: vestito({
      titolo: "Ricerca attiva",
      corpo:
        h("Da adesso guardo io.") +
        p("Questa è la ricerca che ho attivato:") +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
           ${riga("Parti da", r.partenza)}
           ${riga("Soglia a testa", euro(r.budget))}
           ${riga("Massimo di auto", r.ore)}
           ${riga("In quanti", String(r.persone))}
         </table>` +
        p(
          "Ti scrivo solo quando trovo qualcosa che sta dentro questi limiti, col conto già fatto. Se non trovo niente, non ti scrivo: il silenzio è una risposta anche lui.",
        ) +
        bottone("Vedi le tue ricerche", `${casa()}/app`),
    }),
    testo: `Ricerca attiva.\n\nParti da: ${r.partenza}\nSoglia a testa: ${euro(r.budget)}\nMassimo di auto: ${r.ore}\nIn quanti: ${r.persone}\n\nTi scrivo solo quando trovo qualcosa che ci sta dentro.\n${casa()}/app`,
  });
}

/* ---------------------------------------------------------------- 6 */
export function alert(
  a: string,
  o: {
    destinazione: string;
    struttura: string;
    notti: number;
    persone: number;
    alloggio: number;
    auto: number;
    totale: number;
    soglia: number;
    km: number;
    ore: string;
    link: string;
  },
): Promise<Esito> {
  const avanzo = o.soglia - o.totale;
  return spedisci({
    a,
    oggetto: `${o.destinazione}, ${euro(o.totale)} a testa. Sotto la tua soglia.`,
    html: vestito({
      titolo: `${o.destinazione} a ${euro(o.totale)}`,
      corpo:
        `<p style="margin:0 0 10px;font-family:${FONT};font-size:12.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${C.verde};">Sotto la tua soglia</p>` +
        h(o.destinazione) +
        p(
          `${o.struttura} · ${o.notti} ${o.notti === 1 ? "notte" : "notti"} · in ${o.persone} · ${o.km} km, ${o.ore} di auto`,
        ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;">
           ${riga("Alloggio a testa", euro(o.alloggio))}
           ${riga("Auto a testa (benzina + pedaggi)", euro(o.auto))}
           ${riga("Totale a testa", euro(o.totale), true)}
         </table>` +
        `<p style="margin:14px 0 0;font-family:${FONT};font-size:14.5px;line-height:1.6;color:${C.verdeNotte};background:${C.menta};border-radius:12px;padding:13px 16px;">
           La tua soglia era ${euro(o.soglia)}. Ti restano <strong>${euro(avanzo)}</strong> a testa.
         </p>` +
        bottone("Vedi l'offerta", o.link) +
        p(
          `<strong style="color:${C.inchiostro}">Il costo dell'auto è una stima nostra</strong>, calcolata su ${o.km} km andata e ritorno, consumo prudenziale e pedaggi medi. Il prezzo dell'alloggio è quello della struttura al momento del controllo e può cambiare.`,
        ),
      coda: "Ricevi questa email perché hai una ricerca attiva con questi limiti. Questa destinazione ha consumato 1 credito.",
    }),
    testo: `${o.destinazione}: ${euro(o.totale)} a testa, sotto la tua soglia di ${euro(o.soglia)}.\n\n${o.struttura}\n${o.notti} notti, in ${o.persone}, ${o.km} km (${o.ore} di auto)\n\nAlloggio a testa: ${euro(o.alloggio)}\nAuto a testa: ${euro(o.auto)}\nTotale a testa: ${euro(o.totale)}\nTi restano: ${euro(avanzo)}\n\nVedi l'offerta: ${o.link}`,
  });
}

/* ---------------------------------------------------------------- 7 */
export function creditiFiniti(a: string): Promise<Esito> {
  return spedisci({
    a,
    oggetto: "Hai finito i crediti",
    html: vestito({
      titolo: "Hai finito i crediti",
      corpo:
        h("I crediti sono finiti.") +
        p(
          "Le tue ricerche restano dove sono e non le cancello. Semplicemente smetto di avvisarti finché non ricarichi.",
        ) +
        p(
          "Nessun abbonamento, nessun rinnovo automatico: ricarichi quando ti serve e basta.",
        ) +
        bottone("Ricarica i crediti", `${casa()}/#prezzi`),
    }),
    testo: `I crediti sono finiti.\n\nLe tue ricerche restano dove sono. Smetto di avvisarti finché non ricarichi.\nNessun abbonamento: ricarichi quando ti serve.\n\n${casa()}/#prezzi`,
  });
}

/* ---------------------------------------------------------------- 8 */
export function ricevuta(
  a: string,
  t: { crediti: number; importo: number; riferimento: string },
): Promise<Esito> {
  return spedisci({
    a,
    oggetto: `Ricevuta: ${t.crediti} crediti`,
    html: vestito({
      titolo: "Ricevuta",
      corpo:
        h("Crediti aggiunti.") +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
           ${riga("Crediti", String(t.crediti))}
           ${riga("Importo", t.importo.toLocaleString("it-IT", { style: "currency", currency: "EUR" }), true)}
           ${riga("Riferimento", t.riferimento)}
         </table>` +
        p("I crediti sono già sul tuo account e non scadono.") +
        bottone("Torna alle tue ricerche", `${casa()}/app`),
      coda: "Ricevi questa email perché hai acquistato crediti su Rivoglio.",
    }),
    testo: `Crediti aggiunti.\n\nCrediti: ${t.crediti}\nImporto: ${t.importo}€\nRiferimento: ${t.riferimento}\n\nI crediti non scadono.\n${casa()}/app`,
  });
}
