import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { COMPAGNIE, compagniaPerVettore, modoInvio } from "../lib/lettera/compagnie";
import { generaReclamo, generaSegnalazioneEnte, generaSollecito } from "../lib/lettera/genera";
import type { FattoVolo, Verdetto } from "../lib/regole/eu261";

/**
 * IL DESTINATARIO C'È SEMPRE, E LA LETTERA NON SEMBRA SCRITTA DA UNA
 * MACCHINA.
 *
 * 🔴 Valerio, 12/08, aprendo una pratica vera:
 * «il destinatario non c'è perché? Dobbiamo sempre averlo, dobbiamo
 * sempre fornirlo»; e sul riquadro che diceva di cercare il canale
 * reclami sul sito della compagnia: «ma che cazzo vuol dire, stai
 * dicendo all'utente cercati le cose e fatti mille ricerche da solo».
 *
 * Sono due difetti diversi con la stessa radice: vendiamo "la lettera
 * pronta" e poi lasciamo all'utente il pezzo più difficile, cioè capire
 * A CHI si manda. Queste prove impediscono a tutti e due di tornare.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

/* ------------------------------------------------------ il destinatario */

test.describe("A chi va la lettera", () => {
  test("ogni compagnia in archivio ha un canale raggiungibile", () => {
    for (const c of COMPAGNIE) {
      const m = modoInvio(c);
      expect(m.tipo, `${c.nome} non porta da nessuna parte`).not.toBe("ignoto");
      /* Un canale è un'email o un indirizzo web vero: una riga di testo
         che spiega dove cercare non è un canale. */
      if (m.tipo === "modulo") expect(m.url).toMatch(/^https:\/\//);
      if (m.tipo === "email") expect(m.a).toContain("@");
    }
  });

  test("l'indirizzo del canale sta sul dominio della compagnia, non su un intermediario", () => {
    /* La regola vale quanto la lettera: mandare un passeggero su un
       portale di terzi che trattiene il 30% è esattamente ciò contro cui
       Rivolio esiste. */
    const VIETATI = ["airhelp", "flightright", "claimeu", "compensair", "skycop", "refundmore"];
    for (const c of COMPAGNIE) {
      const url = c.url.toLowerCase();
      for (const v of VIETATI) {
        expect(url, `${c.nome} rimanda a un intermediario`).not.toContain(v);
      }
    }
  });

  test("nessuna pagina dice all'utente di cercarsi il canale reclami", () => {
    /* La frase esatta che Valerio ha letto era: «Cerca "reclami" sul sito
       ufficiale del vettore». Qui si vieta la famiglia intera, non la
       singola frase: riscritta con altre parole sarebbe lo stesso
       difetto. */
    const CARTELLE = ["app", "components", "lib"];
    const SOSPETTI = [
      /cerca\s+&quot;reclami&quot;/i,
      /cerca\s+"reclami"/i,
      /cercati\b/i,
      /cerca sul sito (ufficiale )?(della|del)/i,
    ];
    const file: string[] = [];
    const gira = (dir: string) => {
      for (const voce of readdirSync(join(RADICE, dir), { withFileTypes: true })) {
        const p = `${dir}/${voce.name}`;
        if (voce.isDirectory()) gira(p);
        else if (/\.(ts|tsx)$/.test(voce.name)) file.push(p);
      }
    };
    CARTELLE.forEach(gira);

    /* ⚠️ I COMMENTI SI TOLGONO PRIMA DI GUARDARE, e non è una scorciatoia:
       la frase incriminata è citata di proposito nei commenti che
       raccontano perché è stata tolta. Senza questo taglio la prova
       boccerebbe proprio la spiegazione del difetto che impedisce. */
    const senzaCommenti = (t: string) =>
      t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

    for (const f of file) {
      const testo = senzaCommenti(leggi(f));
      for (const s of SOSPETTI) {
        expect(testo, `${f} manda l'utente a cercarsi il destinatario`).not.toMatch(s);
      }
    }
  });

  test("i gruppi con più licenze si agganciano allo stesso ufficio", () => {
    /* Un Bergamo → Catania può avere un numero W4 (Wizz Air Malta) o W6
       (Wizz Air Hungary): è lo stesso modulo. Senza gli alias, metà dei
       voli Wizz finiva in "compagnia non in archivio". */
    expect(compagniaPerVettore("W41234")?.nome).toBe("Wizz Air");
    expect(compagniaPerVettore("W91234")?.nome).toBe("Wizz Air");
    expect(compagniaPerVettore("AL1234")?.nome).toBe("Ryanair");
    expect(compagniaPerVettore("RR1234")?.nome).toBe("Ryanair");
  });

  test("l'archivio copre le compagnie che volano davvero in Italia", () => {
    /* Non è un numero tondo per far scena: sono i codici che compaiono
       negli orari degli scali italiani. Se un domani una di queste sparisce
       dalla tabella, la prova si ferma prima che se ne accorga un cliente. */
    const ATTESI = [
      "FR", "U2", "W6", "AZ", "VY", "EI", "EW", "SN", "TP", "A3",
      "LO", "SK", "AY", "LH", "AF", "KL", "BA", "IB", "LX", "OS",
      "NO", "OU", "RO", "KM", "TK", "PC", "JU", "DL", "UA", "AA",
    ];
    const presenti = new Set(COMPAGNIE.map((c) => c.iata));
    const mancanti = ATTESI.filter((i) => !presenti.has(i));
    expect(mancanti, `mancano dall'archivio: ${mancanti.join(", ")}`).toEqual([]);
  });
});

/* --------------------------------------------------- niente gergo in vista */

/**
 * Le etichette della cronologia, lette dal sorgente.
 *
 * ⚠️ `lib/copy.ts` non si può importare da qui: tira dentro moduli con
 * l'alias `@/`, che il caricatore delle prove non risolve. Si legge il
 * testo, come già fanno le altre prove che guardano il codice.
 */
function etichetteCronologia(): Record<string, string> {
  const testo = leggi("lib/copy.ts");
  const i = testo.indexOf("lineaTempo:");
  const blocco = testo.slice(testo.indexOf("eventi: {", i), testo.indexOf("},", testo.indexOf("rifiuto:", i)));
  const fuori: Record<string, string> = {};
  for (const m of blocco.matchAll(/^\s{8}([a-z0-9_]+):\s*"([^"]+)"/gm)) fuori[m[1]] = m[2];
  return fuori;
}

test.describe("La cronologia parla italiano", () => {
  test("ogni evento che scriviamo ha la sua etichetta", () => {
    /* 🔴 Nello screenshot del 12/08 la cronologia mostrava
       `pratica_di_prova`, cioè il nome della colonna. Il render ripiega
       sul `tipo` grezzo quando l'etichetta manca, quindi il difetto non
       rompe niente: si vede e basta. Ed è per questo che nessuno lo
       trova, finché non lo trova un cliente.

       Qui si raccolgono i tipi che il codice scrive DAVVERO e si
       pretende che ognuno abbia la sua frase. */
    const etichette = etichetteCronologia();

    const scritti = new Set<string>();
    const gira = (dir: string) => {
      for (const voce of readdirSync(join(RADICE, dir), { withFileTypes: true })) {
        const p = `${dir}/${voce.name}`;
        if (voce.isDirectory()) gira(p);
        else if (/\.(ts|tsx)$/.test(voce.name)) {
          const testo = leggi(p);
          for (const m of testo.matchAll(/registraEvento\(\s*[^,]+,\s*"([a-z0-9_]+)"/g)) {
            scritti.add(m[1]);
          }
        }
      }
    };
    ["app", "lib"].forEach(gira);

    expect(scritti.size, "nessun evento trovato: la prova non sta guardando niente").toBeGreaterThan(
      3,
    );
    const senzaNome = [...scritti].filter((t) => !etichette[t]);
    expect(senzaNome, `eventi senza etichetta: ${senzaNome.join(", ")}`).toEqual([]);
  });

  test("nessuna etichetta è scritta come un nome di database", () => {
    const etichette = etichetteCronologia();
    expect(Object.keys(etichette).length).toBeGreaterThan(5);
    for (const [chiave, testo] of Object.entries(etichette)) {
      expect(testo, `l'etichetta di ${chiave} è ancora gergo`).not.toMatch(/^[a-z0-9]+_[a-z0-9_]+$/);
    }
  });
});

/* ------------------------------------------------------- la lettera pulita */

const FATTO: FattoVolo = {
  voloIata: "ZZ250",
  dataLocale: "2026-08-06",
  vettoreOperativo: "FR",
  vettoreMarketing: null,
  partenzaIata: "BGY",
  arrivoIata: "ACE",
  arrivoPrevistoUtc: "2026-08-06T09:55:00Z",
  arrivoEffettivoUtc: "2026-08-06T13:47:00Z",
  stato: "atterrato",
  kmOrtodromica: 2841,
  fontiDiscordanti: false,
  fonte: "AeroDataBox",
};

const IDONEO: Verdetto = {
  esito: "idoneo",
  importo: 400,
  ritardoMinuti: 232,
  motivo: "",
  versioneRegole: "2026.08.8",
};

const PRATICA = {
  passeggeri: [{ nome: "Mario", cognome: "Rossi" }],
  tipo: "singola" as const,
  email: "mario.rossi@example.com",
};

const TUTTE = () =>
  [
    ["reclamo", generaReclamo(PRATICA, FATTO, IDONEO, {})!],
    ["sollecito", generaSollecito(PRATICA, FATTO, IDONEO, "2026-08-07", "guasto_tecnico")!],
    [
      "segnalazione",
      generaSegnalazioneEnte(PRATICA, FATTO, IDONEO, "2026-08-07", "2026-09-18", "guasto_tecnico")!,
    ],
  ] as const;

test.describe("La lettera non deve sembrare scritta da una macchina", () => {
  test("nessuna riga di trattini: è il segno più riconoscibile", () => {
    for (const [nome, lettera] of TUTTE()) {
      const righe = lettera.corpo.split("\n").map((r) => r.trim());
      expect(righe, `${nome} ha ancora un separatore a trattini`).not.toContain("---");
      for (const r of righe) {
        expect(r, `${nome} ha una riga di soli trattini`).not.toMatch(/^-{2,}$/);
      }
    }
  });

  test("nessun elenco puntato col trattino: i fatti si raccontano", () => {
    for (const [nome, lettera] of TUTTE()) {
      for (const r of lettera.corpo.split("\n")) {
        expect(r, `${nome} ha un elenco puntato col trattino: "${r.trim()}"`).not.toMatch(
          /^\s*[-*•]\s+\S/,
        );
      }
    }
  });

  test("il trattino lungo resta vietato anche qui", () => {
    for (const [nome, lettera] of TUTTE()) {
      expect(lettera.corpo, `${nome} ha un trattino lungo`).not.toContain("—");
      expect(lettera.oggetto, `oggetto di ${nome} ha un trattino lungo`).not.toContain("—");
    }
  });

  test("la firma porta l'email vera, non un campo da riempire", () => {
    for (const [nome, lettera] of TUTTE()) {
      expect(lettera.corpo, `${nome} non firma con l'email della pratica`).toContain(
        PRATICA.email,
      );
      expect(lettera.corpo, `${nome} chiede ancora l'email a mano`).not.toContain(
        "[indirizzo email",
      );
      expect(lettera.corpo, `${nome} chiede ancora la data a mano`).not.toContain("[data di invio]");
    }
  });

  test("resta UN solo campo da compilare, e si capisce cos'è", () => {
    /* L'IBAN non lo sappiamo e non vogliamo saperlo: sono coordinate
       bancarie, e conservarle vorrebbe dire diventare custodi di un dato
       che non ci serve mai. Quindi resta un buco, ma uno solo, e scritto
       in italiano invece che come un segnaposto da modulo. */
    const reclamo = generaReclamo(PRATICA, FATTO, IDONEO, {})!;
    const buchi = reclamo.corpo.match(/\[[^\]]+\]/g) ?? [];
    expect(buchi, `campi da compilare rimasti: ${buchi.join(", ")}`).toEqual(["[qui il tuo IBAN]"]);
  });

  test("i numeri non si perdono passando alla prosa", () => {
    /* La riscrittura dei fatti da elenco a frase è il punto in cui era
       facile perdere un dato per strada. Ritardo, orari, tratta e importo
       devono esserci ancora. */
    const reclamo = generaReclamo(PRATICA, FATTO, IDONEO, {})!;
    expect(reclamo.corpo).toContain("3 ore e 52 minuti");
    expect(reclamo.corpo).toContain("09:55");
    expect(reclamo.corpo).toContain("13:47");
    /* Il separatore delle migliaia dipende dai dati di localizzazione di
       Node: si accettano tutte e due le grafie invece di legare la prova
       a com'è compilato l'ambiente. */
    expect(reclamo.corpo).toMatch(/2\.?841 km/);
    expect(reclamo.corpo).toContain("400 euro");
    expect(reclamo.corpo).toContain("Mario Rossi");
  });
});
