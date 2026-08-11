import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import {
  CHECK_A_PAGAMENTO,
  CORTESIA_SU_INCERTO,
  POSTI_DI_LANCIO,
  PREZZO_LANCIO,
  PREZZO_PIENO,
  postiRimasti,
  prezzoCheck,
  scontoDaCheck,
} from "../lib/check/ingresso";
import {
  chiaveDiProvaValida,
  consumaPass,
  creaPass,
  leggiPass,
  segnaturaProva,
} from "../lib/check/pass";
import { LISTINI } from "../lib/prezzi";
import { COPY } from "../lib/copy";

/**
 * IL CHECK A PAGAMENTO (decisione di Valerio, 11/08).
 *
 * Queste prove tengono ferme le tre cose che possono fare danno:
 * che nasca SPENTO, che il totale del percorso non aumenti di nascosto,
 * e che una ricevuta non si possa fabbricare.
 */

test.describe("Il cancello nasce spento", () => {
  test("senza la variabile il check resta libero", () => {
    /* Se un giorno questa prova diventa rossa, vuol dire che qualcuno ha
       acceso il muro per tutti scrivendolo nel codice invece che nelle
       variabili: è il modo di mandare offline il check senza volerlo. */
    expect(CHECK_A_PAGAMENTO).toBe(process.env.NEXT_PUBLIC_CHECK_PREZZO_ATTIVO === "1");
  });
});

test.describe("Il prezzo di lancio", () => {
  test("costa meno di quello pieno, e il pieno è un impegno", () => {
    expect(PREZZO_LANCIO).toBeLessThan(PREZZO_PIENO);
  });

  test("il prezzo si alza SOLO quando i posti finiscono davvero", () => {
    expect(prezzoCheck(0).prezzo).toBe(PREZZO_LANCIO);
    expect(prezzoCheck(POSTI_DI_LANCIO - 1).prezzo).toBe(PREZZO_LANCIO);
    expect(prezzoCheck(POSTI_DI_LANCIO).prezzo).toBe(PREZZO_PIENO);
  });

  test("se il conteggio non si legge si serve il prezzo BASSO", () => {
    /* Mai il contrario: far pagare di più per un guasto nostro non si fa. */
    expect(prezzoCheck(null).prezzo).toBe(PREZZO_LANCIO);
  });

  test("i posti rimasti si mostrano solo se il numero è vero", () => {
    expect(postiRimasti(null)).toBeNull();
    expect(postiRimasti(120)).toBe(POSTI_DI_LANCIO - 120);
    expect(postiRimasti(POSTI_DI_LANCIO + 40)).toBe(0);
  });
});

test.describe("Il totale del percorso non cambia", () => {
  test("chi paga l'analisi trova la pratica scontata di quello che ha già dato", () => {
    const scontato = scontoDaCheck(LISTINI.a, PREZZO_LANCIO);
    expect(Math.round((scontato.singola + PREZZO_LANCIO) * 100) / 100).toBe(LISTINI.a.singola);
    expect(Math.round((scontato.famiglia + PREZZO_LANCIO) * 100) / 100).toBe(LISTINI.a.famiglia);
  });

  test("vale anche sull'altro prezzo del test", () => {
    const scontato = scontoDaCheck(LISTINI.b, PREZZO_LANCIO);
    expect(Math.round((scontato.singola + PREZZO_LANCIO) * 100) / 100).toBe(LISTINI.b.singola);
  });

  test("non si scende mai sotto zero", () => {
    expect(scontoDaCheck(LISTINI.a, 999).singola).toBe(0);
  });
});

test.describe("La ricevuta del check", () => {
  test("una ricevuta nostra si rilegge", () => {
    const pass = creaPass("ordine-1", 1);
    expect(pass).toBeTruthy();
    const letto = leggiPass(pass);
    expect(letto?.restano).toBe(1);
    expect(letto?.ordine).toBe("ordine-1");
  });

  test("una ricevuta con la firma cambiata non vale", () => {
    const pass = creaPass("ordine-2", 3)!;
    const rotta = `${pass.slice(0, -3)}xxx`;
    expect(leggiPass(rotta)).toBeNull();
  });

  test("una ricevuta col contenuto cambiato non vale", () => {
    const pass = creaPass("ordine-3", 1)!;
    const [corpo, firma] = pass.split(".");
    const dentro = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8"));
    dentro.r = 999;
    const truccato = `${Buffer.from(JSON.stringify(dentro), "utf8").toString("base64url")}.${firma}`;
    expect(leggiPass(truccato)).toBeNull();
  });

  test("una ricevuta scaduta non vale", () => {
    const pass = creaPass("ordine-4", 1, Date.now() - 400 * 24 * 60 * 60 * 1000)!;
    expect(leggiPass(pass)).toBeNull();
  });

  test("niente ricevuta, niente passaggio", () => {
    expect(leggiPass(null)).toBeNull();
    expect(leggiPass("")).toBeNull();
    expect(leggiPass("qualcosa")).toBeNull();
  });

  test("l'ultimo check consumato chiude la ricevuta", () => {
    const uno = leggiPass(creaPass("ordine-5", 1))!;
    expect(consumaPass(uno)).toBeNull();
  });

  test("con più check ne resta uno in meno", () => {
    const tre = leggiPass(creaPass("ordine-6", 3))!;
    const dopo = leggiPass(consumaPass(tre));
    expect(dopo?.restano).toBe(2);
  });
});

test.describe("Un incerto non si fa pagare", () => {
  test("la cortesia sull'incerto è accesa", () => {
    /* Se si spegne, uno paga 1,99 e si sente rispondere "non lo so": è la
       strada più breve per una contestazione sulla carta, ed è il motivo
       per cui un venditore guarda storto questo genere di prodotto. */
    expect(CORTESIA_SU_INCERTO).toBe(true);
  });
});

/* ── IL SITO NON PUÒ PROMETTERE GRATIS QUELLO CHE FA PAGARE ───────────
   Il muro nasce spento, e questa prova esiste perché il giorno che si
   accende non si accenda anche una bugia: la landing oggi dice "il
   check è gratis, sempre" in più punti, ed è vero SOLO finché
   CHECK_PREZZO_ATTIVO non vale "1". Se qualcuno accende l'interruttore
   senza riscrivere quei testi, la suite si ferma qui. */
test.describe("Se il check si paga, il sito non dice gratis", () => {
  test("i testi e l'interruttore non si contraddicono", () => {
    const testi = JSON.stringify(COPY).toLowerCase();
    /* Si cercano le promesse sul CHECK, non ogni "gratis": il reclamo
       alla compagnia, la segnalazione all'ente e la conciliazione sono
       gratuiti DAVVERO, e dirlo è uno dei motivi per cui la gente si
       fida. Quelle frasi restano anche quando il check si paga. */
    const prometteGratis =
      /(check|analisi|controlla\w*)[^"]{0,40}(gratis|gratuit)/.test(testi) ||
      /(gratis|gratuit)\w*[^"]{0,40}(check|analisi)/.test(testi) ||
      /sempre gratis|gratis, sempre|gratis, senza account/.test(testi);

    if (CHECK_A_PAGAMENTO) {
      expect(
        prometteGratis,
        "il check è a pagamento ma il sito lo promette ancora gratuito",
      ).toBe(false);
    } else {
      /* Da spento la promessa deve esserci: è il gancio che porta la
         gente dentro, e toglierlo "in anticipo" sarebbe perdere traffico
         per una cassa che non è ancora aperta. */
      expect(prometteGratis).toBe(true);
    }
  });
});

/* ── LA CHIAVE DEL COLLAUDATORE ────────────────────────────────────────
   La cassa di prova emette ricevute VERE. Finché esiste, la porta deve
   essere di Valerio e di nessun altro. L'11/08 non lo era: il muro
   spediva `/cassa-prova?s=<segreto>` dentro la propria risposta, quindi
   la parola segreta la riceveva chiunque premesse il bottone e il muro
   si apriva da solo. */
test.describe("La cassa di prova è chiusa a chiave", () => {
  const SEGRETO = "parola-di-prova";

  test("la chiave nel cookie non contiene la parola segreta", () => {
    const chiave = segnaturaProva(SEGRETO);
    expect(chiave).not.toBeNull();
    expect(chiave!).not.toContain(SEGRETO);
  });

  test("passa solo la chiave giusta", () => {
    expect(chiaveDiProvaValida(segnaturaProva(SEGRETO), SEGRETO)).toBe(true);
    expect(chiaveDiProvaValida("qualcosa", SEGRETO)).toBe(false);
    expect(chiaveDiProvaValida(null, SEGRETO)).toBe(false);
    expect(chiaveDiProvaValida("", SEGRETO)).toBe(false);
    /* La chiave di un'altra parola non apre questa porta. */
    expect(chiaveDiProvaValida(segnaturaProva("altra-parola"), SEGRETO)).toBe(false);
  });

  test("senza segreto non si apre niente", () => {
    expect(segnaturaProva("")).toBeNull();
    expect(chiaveDiProvaValida("qualsiasi-cosa", "")).toBe(false);
  });

  test("la parola segreta non finisce MAI nella risposta del muro", () => {
    /* Il difetto vero dell'11/08, scritto come prova: nel muro non si
       costruisce un indirizzo mettendoci dentro CASSA_PROVA_SEGRETO. */
    for (const f of ["lib/check/cancello.ts", "app/api/verifica/route.ts"]) {
      const testo = readFileSync(join(process.cwd(), f), "utf8");
      const codice = testo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      expect(
        /cassa-prova\?s=|\$\{[^}]*CASSA_PROVA_SEGRETO/.test(codice),
        `${f} rimette il segreto nella risposta del muro`,
      ).toBe(false);
    }
  });
});

/* ── LE PORTE DI SERVIZIO ──────────────────────────────────────────────
   Il verdetto non esce solo da /api/verifica. Tre rotte lo producono per
   conto loro, e la ricerca per tratta mostra l'orario di atterraggio
   vero, cioè la sostanza che vendiamo. Con il muro su una porta sola
   bastava conoscere l'indirizzo di un'altra per non pagare mai. */
test.describe("Il muro copre tutte le porte", () => {
  const codiceDi = (f: string) =>
    readFileSync(join(process.cwd(), f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  for (const rotta of ["cancellato", "dichiara", "operativo"]) {
    test(`/api/verifica/${rotta} passa dal cancello prima del verdetto`, () => {
      const codice = codiceDi(`app/api/verifica/${rotta}/route.ts`);
      expect(codice).toContain("cancelloDelSeguito");
      /* E ci passa PRIMA di interrogare il motore, se no la chiamata al
         fornitore la paghiamo comunque noi. */
      expect(codice.indexOf("cancelloDelSeguito(")).toBeLessThan(
        codice.indexOf("verificaVolo("),
      );
    });
  }

  test("la ricerca per tratta non regala l'orario di atterraggio", () => {
    const codice = codiceDi("app/api/voli-tratta/route.ts");
    expect(codice).toContain("arrivoEffettivoOra");
    expect(codice).toContain("passDi");
  });
});
