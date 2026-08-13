import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EVENTO_REPLICA_INVIATA, giriDiNo, percorsoPratica } from "../lib/pratiche/passi";
import { EVENTO_CARICATO, EVENTO_SALTATO } from "../lib/pratiche/documenti";
import type { EventoPratica, StatoPratica } from "../lib/pratiche/pratiche";

/**
 * I PALETTI DELLA PRATICA.
 *
 * 🔴 Valerio, 13/08: «se fai una cosa rimane tutto il resto vecchio»,
 * e «ho cliccato per maltempo e non è successo niente». Erano due facce
 * dello stesso difetto: ogni riquadro decideva da solo se accendersi, e
 * nessuno sapeva degli altri.
 *
 * Queste prove tengono ferme tre promesse:
 * 1. il passo attivo è UNO;
 * 2. il muro dei documenti non blocca niente dopo che la lettera è
 *    partita, perché a quel punto non può più servire a nulla;
 * 3. non si può dichiarare di aver mandato una lettera che non si è
 *    potuta aprire.
 */

const evento = (tipo: string): EventoPratica =>
  ({
    id: `e-${tipo}`,
    pratica_id: "p",
    tipo,
    nota: null,
    creato_il: "2026-08-12T10:00:00Z",
  }) as EventoPratica;

const TUTTI: StatoPratica[] = [
  "creata",
  "pagata",
  "pronta",
  "inviata",
  "sollecito",
  "enac",
  "esito_pagata",
  "esito_rifiutata",
  "rimborsata",
];

test.describe("Un passo attivo alla volta", () => {
  test("in ogni stato possibile c'è esattamente un passo 'adesso'", () => {
    for (const stato of TUTTI) {
      for (const eventi of [[], [evento(EVENTO_CARICATO)]]) {
        for (const rifiuto of [null, "meteo"]) {
          const p = percorsoPratica(stato, eventi, rifiuto);
          const adesso = p.passi.filter((x) => x.stato === "adesso");
          expect(adesso.length, `${stato} / rifiuto=${rifiuto}`).toBe(1);
        }
      }
    }
  });

  test("i passi fatti stanno prima, quelli dopo stanno dopo: mai mescolati", () => {
    for (const stato of TUTTI) {
      const p = percorsoPratica(stato, [evento(EVENTO_CARICATO)], null);
      const ordine = p.passi.map((x) => x.stato);
      const primoNonFatto = ordine.findIndex((s) => s !== "fatto");
      // Dopo il primo non-fatto non può ricomparire un "fatto".
      expect(ordine.slice(primoNonFatto).includes("fatto"), stato).toBe(false);
    }
  });
});

test.describe("La carta d'imbarco non blocca piu' niente", () => {
  /* 🔴 Il muro e' stato tolto il 13/08 (scelta di Valerio col popup) dopo
     che l'ha provato da utente: «perche' appena pago la pratica vengo
     rediretto dove il bottone e' grigio? che senso ha scusa?».
     Il riquadro sopra diceva «apri la lettera, inviala dalla tua email» e
     il bottone non si poteva premere: una pagina che ordina una cosa e la
     impedisce nella stessa schermata e' rotta, per quanto buona sia la
     ragione. E arrivava un secondo dopo il pagamento, cioe' nel punto in
     cui la fiducia e' piu' fragile di tutto il percorso. */

  test("appena pagata, la lettera si apre", () => {
    const p = percorsoPratica("pagata", [], null);
    expect(p.attivo).toBe("lettera");
    expect(p.riquadri.letteraApribile).toBe(true);
  });

  test("il documento non e' piu' una tappa della barra", () => {
    /* Mettere fra le tappe una cosa che si puo' saltare fa sembrare il
       percorso piu' lungo di quello che e'. Ed era il motivo per cui sulla
       stessa schermata c'erano due conteggi diversi: «passo 2 di 7» in
       cima e «passo 1 di 2» nel riquadro. */
    const p = percorsoPratica("pagata", [], null);
    expect(p.passi.map((x) => x.chiave)).not.toContain("documento");
  });

  test("in nessuno stato la lettera resta chiusa dopo il pagamento", () => {
    const stati: StatoPratica[] = [
      "pagata",
      "pronta",
      "inviata",
      "sollecito",
      "enac",
      "esito_pagata",
      "esito_rifiutata",
      "rimborsata",
    ];
    for (const stato of stati) {
      expect(percorsoPratica(stato, [], null).riquadri.letteraApribile, stato).toBe(true);
    }
  });

  test("l'invito a caricare vale PRIMA dell'invio, e sparisce dopo", () => {
    /* 🔴 Valerio, 13/08: «quando invio la pratica e clicco inviata, rimane
       ancora il box per caricare i documenti: se fai una cosa rimane tutto
       il resto vecchio». La vecchia giustificazione («serve anche per il
       sollecito») non regge: la carta d'imbarco rinforza la lettera PRIMA
       che parta. Dopo è solo una cosa rimasta accesa. */
    expect(percorsoPratica("pagata", [], null).riquadri.documentoExtra).toBe(true);
    expect(percorsoPratica("inviata", [], null).riquadri.documentoExtra).toBe(false);
    expect(
      percorsoPratica("inviata", [evento(EVENTO_CARICATO)], null).riquadri.documentoExtra,
    ).toBe(false);
    /* Chi aveva usato la vecchia porta di servizio ha l'evento scritto:
       non gli si richiede niente. */
    expect(
      percorsoPratica("inviata", [evento(EVENTO_SALTATO)], null).riquadri.documentoExtra,
    ).toBe(false);
  });

  test("su una pratica chiusa non si chiede piu' niente", () => {
    for (const stato of ["esito_pagata", "esito_rifiutata", "rimborsata"] as StatoPratica[]) {
      const p = percorsoPratica(stato, [], null);
      expect(p.riquadri.documentoExtra, stato).toBe(false);
      expect(p.riquadri.rifiuto, stato).toBe(false);
      expect(p.attivo, stato).toBe("chiusa");
    }
  });
});

test.describe("I testi raccontano i fatti, non il calendario", () => {
  /* 🔴 Valerio ha dichiarato il no della compagnia CINQUE MINUTI dopo aver
     mandato il reclamo, e la pagina gli ha risposto «Sollecito. Sei
     settimane, nessuna risposta». Falsa in tre punti su tre.
     La causa: allo stato `sollecito` si arriva in due modi opposti (per
     silenzio o perche' hanno risposto), e un nome solo per due fatti
     diversi produce per forza un testo sbagliato su uno dei due. */

  test("il no dichiarato non si racconta come silenzio", () => {
    expect(percorsoPratica("inviata", [], "sciopero_esterno").chiaveTesto).toBe("risposta_no");
    expect(percorsoPratica("sollecito", [], "sciopero_esterno").chiaveTesto).toBe("risposta_no");
  });

  test("il silenzio vero resta silenzio", () => {
    expect(percorsoPratica("inviata", [], null).chiaveTesto).toBe("inviata");
    expect(percorsoPratica("sollecito", [], null).chiaveTesto).toBe("sollecito");
  });

  test("ogni chiave ha il suo testo, se no la pagina resta muta", () => {
    /* ⚠️ Si legge il sorgente invece di importare COPY: `lib/copy.ts`
       tira dentro moduli con l'alias `@/`, che il caricatore delle prove
       non risolve. Vale come controllo: se un domani si aggiunge una
       chiave di testo senza scriverne il testo, la pagina mostra il nome
       tecnico dello stato al cliente. */
    const copy = readFileSync(join(__dirname, "..", "lib/copy.ts"), "utf8");
    for (const chiave of ["risposta_no", "sollecito", "inviata", "pagata", "enac"]) {
      expect(copy, `manca il testo per ${chiave}`).toMatch(new RegExp(`\\n\\s+${chiave}: \\{`));
    }
  });
});

test.describe("Non si dichiara un fatto non avvenuto", () => {
  test("appena la pratica e' pagata, lettera, istruzioni e bottone stanno insieme", () => {
    /* ⚠️ Prima questa prova pretendeva il contrario: che senza documento
       la lettera fosse chiusa e il bottone spento. Il muro e' stato tolto
       il 13/08 (scelta di Valerio col popup) perche' arrivava un secondo
       dopo il pagamento e contraddiceva la riga sopra, che diceva di
       aprire la lettera. Adesso le tre cose compaiono insieme: o c'e'
       tutto il gesto, o non c'e' niente. Una pagina che mostra le
       istruzioni per mandare una lettera che non si apre e' rotta. */
    const p = percorsoPratica("pagata", [], null);
    expect(p.riquadri.letteraApribile).toBe(true);
    expect(p.riquadri.confermaInvio).toBe(true);
    expect(p.riquadri.istruzioni).toBe(true);
  });

  test("le istruzioni non compaiono mai senza la lettera apribile", () => {
    const stati: StatoPratica[] = ["creata", "pagata", "pronta", "inviata", "sollecito", "enac"];
    for (const stato of stati) {
      const r = percorsoPratica(stato, [], null).riquadri;
      if (r.istruzioni) expect(r.letteraApribile, stato).toBe(true);
      if (r.confermaInvio) expect(r.letteraApribile, stato).toBe(true);
    }
  });

  test("dopo l'invio il bottone sparisce: non si invia due volte", () => {
    const p = percorsoPratica("inviata", [evento(EVENTO_CARICATO)], null);
    expect(p.riquadri.confermaInvio).toBe(false);
  });
});

test.describe("Il no della compagnia sposta il percorso", () => {
  test("dichiarare il no porta il passo attivo sulla replica, senza aspettare", () => {
    /* Il rifiuto scavalca il calendario: la risposta è arrivata, aspettare
       altre cinque settimane sarebbe assurdo. */
    const senza = percorsoPratica("inviata", [], null);
    const con = percorsoPratica("inviata", [], "meteo");
    expect(senza.attivo).toBe("attesa");
    expect(con.attivo).toBe("replica");
  });

  test("il riquadro del no c'è solo quando ha senso", () => {
    expect(percorsoPratica("pagata", [], null).riquadri.rifiuto).toBe(false);
    expect(percorsoPratica("inviata", [], null).riquadri.rifiuto).toBe(true);
    expect(percorsoPratica("sollecito", [], null).riquadri.rifiuto).toBe(true);
    expect(percorsoPratica("esito_pagata", [], null).riquadri.rifiuto).toBe(false);
  });
});

test.describe("I giri di «no» sono illimitati", () => {
  /* 🔴 Valerio, 13/08: «stranamente gli ultimi passi ti blocchi al passo
     4, perché dici solo il primo no e poi basta: non c'è possibilità dopo
     la prima controproposta di un altro no».
     Era un vicolo cieco vero: la pratica sapeva di UN no (una colonna) e
     non aveva dove mettere il secondo. Nella realtà il secondo no è
     normalissimo. Adesso il conto si tiene sugli eventi. */

  const no = () => evento("rifiuto");
  const replica = () => evento(EVENTO_REPLICA_INVIATA);

  test("primo no: tocca a te, e il bottone per chiudere il giro c'è", () => {
    const p = percorsoPratica("sollecito", [no()], "sciopero_esterno");
    expect(p.attivo).toBe("replica");
    expect(p.riquadri.confermaReplica).toBe(true);
    /* Non si chiede «hanno risposto no?» mentre un no è già aperto: si
       dichiarerebbe due volte lo stesso. */
    expect(p.riquadri.rifiuto).toBe(false);
  });

  test("mandata la replica: la palla torna a loro e si può dichiarare un nuovo no", () => {
    const p = percorsoPratica("sollecito", [no(), replica()], "sciopero_esterno");
    expect(p.attivo).toBe("attesa");
    expect(p.chiaveTesto).toBe("attesa_replica");
    expect(p.riquadri.confermaReplica).toBe(false);
    expect(p.riquadri.rifiuto, "il modulo deve riaprirsi per il giro dopo").toBe(true);
  });

  test("🔴 secondo no: il percorso NON si ferma", () => {
    const p = percorsoPratica("sollecito", [no(), replica(), no()], "sciopero_esterno");
    expect(p.attivo).toBe("replica");
    expect(p.riquadri.confermaReplica).toBe(true);
    expect(p.giri).toEqual({ no: 2, replicheMandate: 1 });
  });

  test("dal secondo no compaiono ente e conciliazione, INSIEME alla replica", () => {
    const uno = percorsoPratica("sollecito", [no()], "sciopero_esterno");
    expect(uno.riquadri.enteEConciliazione, "al primo no la trattativa ha ancora senso").toBe(false);
    const due = percorsoPratica("sollecito", [no(), replica(), no()], "sciopero_esterno");
    expect(due.riquadri.enteEConciliazione).toBe(true);
    expect(due.riquadri.confermaReplica, "non al posto della replica: insieme").toBe(true);
  });

  test("il conto non va mai in negativo", () => {
    /* Un doppio clic o due schede aperte non devono far credere che ci
       sia una replica da mandare che non esiste. */
    expect(giriDiNo([replica(), replica(), no()])).toEqual({ no: 1, replicheMandate: 1 });
  });

  test("⚠️ una pratica vecchia col solo motivo in colonna conta come un giro", () => {
    /* Le pratiche aperte prima del 13/08 hanno `rifiuto_motivo` pieno ma
       possono non avere l'evento: senza questa prudenza il loro percorso
       tornerebbe indietro da solo. */
    const p = percorsoPratica("sollecito", [], "sciopero_esterno");
    expect(p.giri.no).toBe(1);
    expect(p.attivo).toBe("replica");
  });

  test("nessuno stato lascia l'utente senza niente da fare e senza attesa", () => {
    const casi: [StatoPratica, EventoPratica[], string | null][] = [
      ["pagata", [], null],
      ["inviata", [], null],
      ["inviata", [no()], "sciopero_esterno"],
      ["sollecito", [], null],
      ["sollecito", [no(), replica()], "sciopero_esterno"],
      ["sollecito", [no(), replica(), no(), replica(), no()], "sciopero_esterno"],
      ["enac", [], null],
    ];
    for (const [stato, eventi, motivo] of casi) {
      const p = percorsoPratica(stato, eventi, motivo);
      const r = p.riquadri;
      const qualcosaDaFare =
        r.confermaInvio || r.confermaReplica || r.rifiuto || r.enteEConciliazione;
      const staAspettando = p.attivo === "attesa";
      expect(qualcosaDaFare || staAspettando, `${stato} è un vicolo cieco`).toBe(true);
    }
  });
});
