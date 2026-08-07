import { casa, spedisci, type Esito } from "./posta";
import { bottone, COLORI as C, FONT, riga, vestito } from "./modello";

/**
 * Ogni email che il prodotto sa mandare, una funzione ciascuna.
 *
 * Le azioni dell'utente coperte:
 *   1. si iscrive alla lista d'attesa  → benvenuto-lista
 *   2. crea l'account                  → benvenuto + primi passi
 *   3. deve confermare l'email         → conferma
 *   4. chiede di entrare senza password→ link magico
 *   5. imposta la prima ricerca        → ricerca attiva
 *   6. arriva un'offerta buona         → ALERT (è il prodotto)
 *   7. finisce i crediti               → crediti esauriti
 *   8. compra crediti                  → ricevuta
 *
 * Nessuna di queste lancia eccezioni: se l'email non parte, l'azione
 * dell'utente è comunque riuscita. Un alert perso è un problema; una
 * registrazione fallita perché la posta era giù è un disastro.
 */

const p = (testo: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.fumo};">${testo}</p>`;

const h = (testo: string) =>
  `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:27px;line-height:1.2;color:${C.inchiostro};font-weight:700;letter-spacing:-0.5px;">${testo}</h1>`;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { maximumFractionDigits: 0 }) + "€";

/* ---------------------------------------------------------------- 1 */
export function benvenutoLista(a: string, comune?: string | null): Promise<Esito> {
  const dove = comune ? ` da ${comune}` : "";
  return spedisci({
    a,
    oggetto: "Ci sei. Ti avviso io.",
    html: vestito({
      titolo: "Ci sei",
      corpo:
        h("Ci sei.") +
        p(
          `Ti ho segnato${dove}. Da adesso, quando esiste una fuga di 1-3 notti sotto la tua soglia, te lo dico io.`,
        ) +
        p(
          "Nel frattempo non ti mando niente. Nessuna newsletter, nessun promemoria, nessuna pubblicità: te lo prometto qui e vale.",
        ) +
        bottone("Crea il tuo account e prendi 3 alert", `${casa()}/entra?modo=registrati`) +
        p(
          `<strong style="color:${C.inchiostro}">Una cosa che nessuno ti dice:</strong> il prezzo della camera non è il prezzo della vacanza. Noi ti mostriamo il totale, benzina e pedaggi compresi, con il calcolo aperto.`,
        ),
      coda: "Ricevi questa email perché hai lasciato il tuo indirizzo su rivoglio.it.",
    }),
    testo: `Ci sei.\n\nTi ho segnato${dove}. Quando esiste una fuga di 1-3 notti sotto la tua soglia, te lo dico io.\nNel frattempo non ti mando niente.\n\nCrea il tuo account: ${casa()}/entra?modo=registrati`,
  });
}

/* ---------------------------------------------------------------- 2 */
export function benvenuto(a: string, crediti = 3): Promise<Esito> {
  return spedisci({
    a,
    oggetto: `Hai ${crediti} alert gratis. Ecco come usarli bene.`,
    html: vestito({
      titolo: "Benvenuto",
      corpo:
        h("Il tuo account è pronto.") +
        p(
          `Hai <strong style="color:${C.inchiostro}">${crediti} crediti</strong>. Un credito si consuma solo quando ti segnalo una destinazione vera, mai per cercare.`,
        ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.menta};border-radius:14px;padding:20px 22px;margin:0 0 8px;">
           <tr><td style="font-family:${FONT};font-size:15px;line-height:1.7;color:${C.verdeNotte};">
             <strong>Tre cose, in due minuti</strong><br>
             1. Dimmi da dove parti: senza, non posso calcolarti i chilometri.<br>
             2. Metti la tua soglia: il totale a testa, non il prezzo della camera.<br>
             3. Dimmi quanto sei disposto a guidare. Il resto lo faccio io.
           </td></tr>
         </table>` +
        bottone("Imposta la tua prima ricerca", `${casa()}/app`) +
        p(
          "Non serve una carta e non c'è nessun abbonamento. Quando i crediti finiscono, decidi tu se ricaricare.",
        ),
    }),
    testo: `Il tuo account è pronto.\n\nHai ${crediti} crediti. Un credito si consuma solo quando ricevi un alert vero.\n\n1. Dimmi da dove parti\n2. Metti la tua soglia\n3. Dimmi quanto sei disposto a guidare\n\nImposta la prima ricerca: ${casa()}/app`,
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
