import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import {
  GIORNI_PRIMA_DELLA_CONCILIAZIONE,
  conciliazioneArt,
  conciliazioneEstero,
  conciliazionePerPartenza,
  prontoPerConciliazione,
} from "../lib/lettera/conciliazione";
import {
  NOTA_TRASPARENZA,
  generaReclamo,
  generaSegnalazioneEnte,
  generaSollecito,
} from "../lib/lettera/genera";
import { ONERE_DELLA_PROVA, RIFIUTI, GIORNI_PRIMA_DEL_SOLLECITO } from "../lib/pratiche/rifiuto";
import { COPY } from "../lib/copy";
import type { FattoVolo, Verdetto } from "../lib/regole/eu261";

/**
 * IL QUARTO COLPO, LA RIGA CHE DICE COSA SIAMO, E LA SVEGLIA DEL 2027.
 *
 * Tre cose diverse, tenute insieme da un filo solo: sono tutte promesse
 * che nel tempo si possono rompere senza che nessuno se ne accorga.
 * Una riga tolta da una lettera, un ente che diventa una promessa di
 * pagamento, una data che passa e un testo che resta indietro.
 */

const FATTO: FattoVolo = {
  voloIata: "FR8321",
  dataLocale: "2026-06-02",
  vettoreOperativo: "FR",
  vettoreMarketing: null,
  partenzaIata: "BGY",
  arrivoIata: "PMO",
  arrivoPrevistoUtc: "2026-06-02T12:00:00Z",
  arrivoEffettivoUtc: "2026-06-02T15:40:00Z",
  stato: "atterrato",
  kmOrtodromica: 900,
  orarioVerificato: true,
  fonte: "aerodatabox",
};

const IDONEO: Verdetto = {
  esito: "idoneo",
  importo: 250,
  ritardoMinuti: 220,
  motivo: "Arrivo con 3 h e 40 min di ritardo su una tratta di 900 km: fascia da 250€.",
  versioneRegole: "2026.08.8",
};

const PRATICA = { passeggeri: [{ nome: "Mario", cognome: "Rossi" }], tipo: "singola" as const };

/* ------------------------------------------------------------------ */

test.describe("La riga che dice cos'è questa lettera", () => {
  test("sta in fondo a tutti e tre i fogli, nessuno escluso", () => {
    const reclamo = generaReclamo(PRATICA, FATTO, IDONEO);
    const sollecito = generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-05", "guasto_tecnico");
    const ente = generaSegnalazioneEnte(
      PRATICA,
      FATTO,
      IDONEO,
      "2026-06-05",
      "2026-07-20",
      "guasto_tecnico",
    );
    for (const [nome, lettera] of [
      ["reclamo", reclamo],
      ["sollecito", sollecito],
      ["segnalazione", ente],
    ] as const) {
      expect(lettera, `${nome}: non generata`).not.toBeNull();
      expect(lettera!.corpo.trim().endsWith(NOTA_TRASPARENZA), `${nome}: manca la nota`).toBe(true);
    }
  });

  test("dice che non è un parere legale, che è il punto", () => {
    /* Se un domani qualcuno la addolcisce, questa prova cade. La frase
       serve a tenerci fuori dall'esercizio abusivo della professione:
       non è una formula di cortesia. */
    expect(NOTA_TRASPARENZA.toLowerCase()).toContain("non costituisce parere legale");
  });

  test("non promette niente e non usa il trattino lungo", () => {
    expect(NOTA_TRASPARENZA).not.toContain("—");
    expect(NOTA_TRASPARENZA.toLowerCase()).not.toContain("hai diritto a");
  });
});

/* ------------------------------------------------------------------ */

test.describe("L'onere della prova nelle repliche", () => {
  test("dove la compagnia invoca una circostanza eccezionale, il paragrafo c'è", () => {
    /* I cinque motivi in cui la compagnia si difende con una circostanza.
       Sugli altri tre il paragrafo sarebbe fuori luogo: il ritardo
       contestato è una questione di fatto, il voucher è un'altra norma,
       e sul silenzio non hanno invocato niente. */
    const conCircostanza = [
      "eccezionale_generico",
      "guasto_tecnico",
      "sciopero_compagnia",
      "sciopero_esterno",
      "meteo",
    ];
    for (const motivo of conCircostanza) {
      const scheda = RIFIUTI.find((r) => r.motivo === motivo);
      expect(scheda, `motivo sparito: ${motivo}`).toBeTruthy();
      expect(scheda!.replica, `${motivo}: manca l'onere della prova`).toContain(ONERE_DELLA_PROVA);
    }
  });

  test("il paragrafo dice tutte e due le gambe, non una sola", () => {
    /* La prima gamba senza la seconda è la mezza verità che le
       compagnie sfruttano: "era eccezionale, quindi non paghiamo". */
    const t = ONERE_DELLA_PROVA.toLowerCase();
    expect(t).toContain("a carico del vettore");
    expect(t).toContain("misure ragionevoli");
    expect(t).toContain("altri vettori");
    expect(t).toContain("non esonera dalla prova del secondo");
  });

  test("finisce dentro il sollecito vero, non solo nella scheda", () => {
    const s = generaSollecito(PRATICA, FATTO, IDONEO, "2026-06-05", "meteo");
    expect(s?.corpo).toContain(ONERE_DELLA_PROVA);
  });

  test("anche la prima lettera dice che l'onere è loro", () => {
    /* La prima lettera non sa ancora quale scusa useranno, quindi il
       paragrafo lungo non ci sta: deve però dire le due cose. */
    const r = generaReclamo(PRATICA, FATTO, IDONEO);
    expect(r?.corpo).toContain("l'onere della prova è a vostro carico");
    expect(r?.corpo).toContain("misure ragionevoli");
  });
});

/* ------------------------------------------------------------------ */

test.describe("Il quarto colpo: la conciliazione", () => {
  test("partenza dall'Italia: ART e ConciliaWeb", () => {
    const c = conciliazionePerPartenza("FCO");
    expect(c.sigla).toBe("ART");
    expect(c.url).toContain("autorita-trasporti.it");
  });

  test("scalo sconosciuto: si ripiega sull'Italia, non su un ente inventato", () => {
    expect(conciliazionePerPartenza(null).sigla).toBe("ART");
    expect(conciliazionePerPartenza("XXX").sigla).toBe("ART");
  });

  test("partenza dall'estero: la rete europea, col paese scritto giusto", () => {
    const c = conciliazionePerPartenza("BCN");
    expect(c.sigla).toBe("ECC-Net");
    expect(c.premessa).toContain("Spain");
  });

  test("è gratis, e lo dice: metà del motivo per farlo è quello", () => {
    for (const c of [conciliazioneArt(), conciliazioneEstero("Spain")]) {
      expect(c.costo.toLowerCase()).toContain("gratis");
    }
  });

  test("NON promette che la compagnia paga", () => {
    /* È lo stesso limite dichiarato sull'ente nazionale. Qui la tentazione
       è più forte, perché la conciliazione i soldi li muove davvero: ma
       un accordo si fa in due, e prometterlo costerebbe la garanzia. */
    for (const c of [conciliazioneArt(), conciliazioneEstero("France")]) {
      const t = `${c.premessa} ${c.avvertenza} ${c.passi.join(" ")}`.toLowerCase();
      expect(t).not.toContain("ti pagano");
      expect(t).not.toContain("otterrai");
      expect(t).not.toContain("garantito");
      expect(c.avvertenza.length).toBeGreaterThan(60);
    }
  });

  test("dichiara la sua fonte e non usa il trattino lungo", () => {
    for (const c of [conciliazioneArt(), conciliazioneEstero("Germany")]) {
      const tutto = [c.titolo, c.premessa, c.costo, c.scadenza, c.avvertenza, ...c.passi].join(" ");
      expect(tutto).not.toContain("—");
      expect(tutto.toLowerCase()).not.toContain("hai diritto a");
      expect(c.fonte.length).toBeGreaterThan(40);
    }
  });

  test("i tempi sono quelli dell'organismo, non i nostri", () => {
    /* 30 giorni dal reclamo, oppure una risposta che non soddisfa. Un no
       dichiarato apre subito: aspettarne altri 30 sarebbe una nostra
       invenzione, e costerebbe al cliente un mese. */
    expect(GIORNI_PRIMA_DELLA_CONCILIAZIONE).toBe(30);
    expect(prontoPerConciliazione(0, true)).toBe(true);
    expect(prontoPerConciliazione(29, false)).toBe(false);
    expect(prontoPerConciliazione(30, false)).toBe(true);
  });

  test("la porta si apre PRIMA del nostro sollecito, ed è voluto", () => {
    /* Se un domani qualcuno allinea i due numeri "per coerenza", il
       cliente perde due settimane di strada gratuita. */
    expect(GIORNI_PRIMA_DELLA_CONCILIAZIONE).toBeLessThan(GIORNI_PRIMA_DEL_SOLLECITO);
  });
});

/* ------------------------------------------------------------------ */

/**
 * LA SVEGLIA DEL 2027.
 *
 * La riforma del Regolamento è approvata (Parlamento 7 luglio 2026,
 * Consiglio 13 luglio) e si applica dall'estate 2027. Due cose nostre
 * diventano sbagliate quel giorno, e sono cose che si dimenticano:
 *
 * 1. il testo del retroattivo promette i voli dell'anno scorso, ma il
 *    termine diventa di nove mesi per tutti;
 * 2. il sollecito parte al giorno 42, che oggi ha senso perché le
 *    compagnie ci mettono 8-14 settimane; da allora ne avranno 30 per
 *    legge, e il giorno giusto per battere diventa il 31.
 *
 * Questa prova non fa niente fino al 1° maggio 2027. Da quel giorno
 * comincia a fallire, con scritto cosa cambiare, e smette da sola
 * appena le due modifiche sono fatte. È una nota sul calendario che
 * nessuno può perdere: un ARRETRATI si può non leggere, una suite
 * rossa no.
 */
const SVEGLIA = "2027-05-01";

test.describe("Calendario: la riforma entra in vigore nell'estate 2027", () => {
  const oggi = new Date().toISOString().slice(0, 10);
  const suonata = oggi >= SVEGLIA;

  test("il testo del retroattivo non promette più l'anno scorso", () => {
    test.skip(!suonata, `Suona il ${SVEGLIA}. Oggi è ${oggi}: niente da fare.`);
    const t = `${COPY.retroattivo.titolo} ${COPY.retroattivo.testo}`.toLowerCase();
    expect(
      t.includes("anno scorso"),
      "La riforma è in vigore: il termine è di 9 mesi, non più un anno. Riscrivi COPY.retroattivo e il pezzo /tabellone/riforma-261-2027-cosa-cambia.",
    ).toBe(false);
  });

  test("il sollecito è stato portato a 31 giorni", () => {
    test.skip(!suonata, `Suona il ${SVEGLIA}. Oggi è ${oggi}: niente da fare.`);
    expect(
      GIORNI_PRIMA_DEL_SOLLECITO,
      "Dalla riforma la compagnia ha 30 giorni per legge: il sollecito va portato a 31 in lib/pratiche/rifiuto.ts.",
    ).toBeLessThanOrEqual(31);
  });

  test("la sveglia è prima dell'estate, non dopo", () => {
    /* Se qualcuno la sposta in avanti per far tacere la suite, questa
       cade: il senso è arrivarci PRIMA che la legge cambi. */
    expect(SVEGLIA < "2027-06-21").toBe(true);
  });
});

/* ── I TESTI DEL SITO NON DEVONO PROMETTERE TEMPI CHE NON USIAMO ──────
   Fino al 10/08 la landing, le card prezzi e le FAQ dicevano "al giorno
   15 trovi il sollecito pronto". I tempi erano stati portati a sei
   settimane il 9/08 (le compagnie rispondono in 8-14 settimane: un
   sollecito al giorno 15 arriva prima che qualcuno abbia aperto la
   pratica). Chi comprava leggeva una promessa che non manteniamo, e la
   fiducia è esattamente la cosa che vendiamo. */
test.describe("I tempi promessi combaciano con quelli veri", () => {
  const testi = JSON.stringify(COPY);

  test("nessun testo parla del giorno 15", () => {
    expect(testi).not.toContain("giorno 15");
    expect(testi).not.toContain("14 e 30 giorni");
  });

  test("il sollecito vero sta nella sesta settimana", () => {
    expect(Math.round(GIORNI_PRIMA_DEL_SOLLECITO / 7)).toBe(6);
  });

  test("il sito nomina la conciliazione, che è il canale che paga", () => {
    expect(testi.toLowerCase()).toContain("conciliazione");
  });

  /* IL GERGO NON ARRIVA ALL'UTENTE. "Ortodromica" è la distanza in
     linea d'aria, "vettore" è la compagnia, "riprotezione" è un altro
     volo: tre parole che nessuno usa al bar e che facevano sembrare il
     sito scritto da un ufficio legale. Valerio: zero gergo senza
     traduzione, si capisce in tre secondi o si cambia. */
  test("le parole da ufficio legale non arrivano all'utente", () => {
    const minuscolo = testi.toLowerCase();
    for (const parola of ["ortodromic", "riprotezion"]) {
      expect(minuscolo, `"${parola}" è gergo`).not.toContain(parola);
    }
    /* "vettore" solo come parola intera: dentro altre parole non è il
       termine giuridico. */
    expect(minuscolo).not.toMatch(/\bvettor[ei]\b/);
  });
});

/* ── LE SENTENZE CITATE PER QUELLO CHE DICONO DAVVERO ──────────────────
   Errore vero, trovato l'11/08 leggendo il dispositivo di Sturgeon sul
   PDF che l'ENAC pubblica sul proprio sito: la replica al "il volo non
   era cosi' in ritardo" usava l'argomento dell'apertura delle porte e
   citava SOLO Sturgeon. Ma in Sturgeon le porte non compaiono mai:
   quella e' Germanwings, C-452/13. Un numero di causa sbagliato in una
   lettera che il cliente manda alla compagnia lo fa sembrare
   sprovveduto proprio nel punto in cui ha ragione. */
test.describe("Ogni sentenza citata per quello che dice", () => {
  const scheda = (motivo: string) => {
    const s = RIFIUTI.find((r) => r.motivo === motivo);
    expect(s, `manca la scheda del rifiuto "${motivo}"`).toBeTruthy();
    return s!;
  };

  test("l'argomento delle porte cita Germanwings, non solo Sturgeon", () => {
    const s = scheda("ritardo_contestato");
    const parlaDiPorte = /porta dell'aeromobile|almeno una porta/i.test(s.replica);
    expect(parlaDiPorte, "la replica non fa piu' l'argomento delle porte").toBe(true);

    const rif = s.riferimenti.join(" ");
    expect(rif, "l'argomento delle porte senza Germanwings e' una citazione sbagliata").toContain(
      "C-452/13",
    );
    /* Sturgeon resta, ma per quello che dice lui: le tre ore. */
    expect(rif).toContain("C-402/07");
  });

  test("Sturgeon non viene citata per le porte da nessuna parte", () => {
    /* Il dispositivo di Sturgeon (letto sul testo ufficiale l'11/08) non
       nomina mai le porte: se qualcuno le riattacca, la suite si ferma. */
    for (const s of RIFIUTI) {
      const rif = s.riferimenti.join(" ");
      const soloSturgeon = rif.includes("C-402/07") && !rif.includes("C-452/13");
      if (!soloSturgeon) continue;
      expect(
        /porta dell'aeromobile|almeno una porta/i.test(s.replica),
        `"${s.motivo}" fa l'argomento delle porte citando solo Sturgeon`,
      ).toBe(false);
    }
  });

  test("le sentenze citate sono solo quelle che abbiamo scritto nel documento", () => {
    /* Se qualcuno aggiunge una causa nuova alle repliche, deve anche
       aggiungerla a SENTENZE-DA-CONTROLLARE.md, se no nessuno la
       rileggera' mai sulla fonte. */
    const doc = readFileSync(join(process.cwd(), "docs", "SENTENZE-DA-CONTROLLARE.md"), "utf8");
    const cause = new Set<string>();
    for (const s of RIFIUTI) {
      for (const m of s.riferimenti.join(" ").matchAll(/C-\d+\/\d+/g)) cause.add(m[0]);
    }
    expect(cause.size).toBeGreaterThan(0);
    for (const c of cause) {
      expect(doc, `${c} e' citata in una lettera ma non sta in SENTENZE-DA-CONTROLLARE.md`).toContain(
        c,
      );
    }
  });
});

/* ── LA LETTERA DEI CASI DICHIARATI ────────────────────────────────────
   🔴 Il difetto piu' grave trovato finora, segnalato da Valerio l'11/08
   con uno screenshot: dopo aver dichiarato negato imbarco o coincidenza
   persa usciva 400 euro accanto a «atterrato con 2 h e 35 min di
   ritardo», e la LETTERA chiedeva quei 400 euro citando Sturgeon, cioe'
   la regola che dice che sotto le tre ore non spettano. Una richiesta
   che si contraddice da sola, pagata 14,90.
   Causa: la rotta /dichiara aggiornava esito e importo sulla riga della
   verifica ma non il ritardo, e la lettera ricostruiva il verdetto da
   quella riga. */
test.describe("Ogni caso ha la lettera della SUA norma", () => {
  const IDONEO_400 = { ...IDONEO, importo: 400 as const, ritardoMinuti: 0 };

  test("negato imbarco: art. 4, e nessuna traccia della regola delle tre ore", () => {
    const l = generaReclamo(PRATICA, FATTO, IDONEO_400, { dichiarato: { caso: "negato" } });
    expect(l, "la lettera del negato imbarco non si genera").not.toBeNull();
    const testo = `${l!.oggetto}\n${l!.corpo}`;
    expect(testo).toContain("articolo 4");
    expect(testo).toContain("400");
    /* Le due cose che rendevano la vecchia lettera indifendibile. */
    expect(testo, "cita Sturgeon su un caso che non la riguarda").not.toContain("C-402/07");
    expect(testo, "parla di tre ore su un negato imbarco").not.toContain("tre ore");
    /* Non si vieta la PAROLA "ritardo": la lettera giusta dice proprio
       che la compensazione «non è subordinata ad alcuna condizione sul
       ritardo all'arrivo», ed è la frase che vince. Si vieta il NUMERO,
       cioè la riga dei fatti che stampava «ritardo all'arrivo: 2 h e 35
       min» accanto a una richiesta di 400 euro. */
    expect(testo, "stampa un ritardo fra i fatti").not.toMatch(/- ritardo all'arrivo:/);
    expect(testo, "stampa un minutaggio che non c'entra").not.toMatch(/\d+\s*min\b/);
  });

  test("coincidenza persa: art. 7 letto da Folkerts, non da Sturgeon", () => {
    const l = generaReclamo(PRATICA, FATTO, IDONEO_400, {
      dichiarato: { caso: "coincidenza", ritardoFinale: "oltre4", destinazioneFinale: "JFK" },
    });
    expect(l).not.toBeNull();
    const testo = `${l!.oggetto}\n${l!.corpo}`;
    expect(testo).toContain("C-11/11");
    expect(testo).toContain("destinazione finale");
    expect(testo, "cita la sentenza del ritardo semplice").not.toContain("C-402/07");
  });

  test("il ritardo finale si scrive a fasce, mai al minuto", () => {
    /* Il passeggero dichiara "fra 3 e 4 ore", non 197 minuti: scrivere
       un minutaggio preciso sarebbe inventarlo, ed e' la cosa che fa
       cadere una richiesta per intero. */
    const l = generaReclamo(PRATICA, FATTO, IDONEO_400, {
      dichiarato: { caso: "coincidenza", ritardoFinale: "fra3e4" },
    });
    expect(l!.corpo).toContain("fra tre e quattro ore");
    expect(l!.corpo).not.toMatch(/\d+\s*min/);
  });

  test("la lettera del ritardo semplice non e' cambiata", () => {
    /* Il caso normale deve restare identico: la correzione non doveva
       toccarlo. */
    const l = generaReclamo(PRATICA, FATTO, IDONEO);
    expect(l!.corpo).toContain("C-402/07");
    expect(l!.corpo).toContain("ritardo all'arrivo");
  });

  test("la rotta dichiara riscrive il ritardo invece di lasciare il vecchio", () => {
    const codice = readFileSync(
      join(process.cwd(), "app/api/verifica/dichiara/route.ts"),
      "utf8",
    );
    expect(codice, "senza questo, la riga conserva il ritardo del check di partenza").toContain(
      "ritardo_minuti",
    );
  });
});
