import { test, expect } from "@playwright/test";
import { controlla, daOurAirports, leggiCsv, serializza } from "../scripts/aeroporti/converti.mjs";
import { isoDaNome, nomeDaIso } from "../scripts/aeroporti/paesi.mjs";
import aeroporti from "../lib/dati/aeroporti.json";
import { zonaDiScalo } from "../lib/regole/territorio";
import { cercaAeroporti } from "../lib/voli/aeroporti";

/**
 * L'ARCHIVIO DEGLI SCALI NON DEVE PIÙ RESTARE FERMO.
 *
 * Quello di prima era una fotografia del 2017: Berlino Brandeburgo,
 * aperto nel 2020, non c'era, e un Milano → Berlino usciva "non
 * riconosciamo l'aeroporto di partenza". Da qui in avanti il file lo
 * riscrive un lavoro settimanale, e queste prove sono il freno: un
 * archivio arrivato monco non deve poter finire in produzione.
 */

/* Righe VERE del CSV di OurAirports, colonne comprese. Dentro c'è di
   proposito un nome con la virgola (Orio al Serio), un tipo che va
   scartato (eliporto) e uno scalo senza sigla IATA. */
const CSV = `"id","ident","type","name","latitude_deg","longitude_deg","elevation_ft","continent","iso_country","iso_region","municipality","scheduled_service","gps_code","icao_code","iata_code","local_code","home_link","wikipedia_link","keywords"
2477,"LIME","medium_airport","Milan Bergamo Airport, Orio al Serio",45.673901,9.70417,782,"EU","IT","IT-25","Bergamo","yes","LIME","LIME","BGY","","","",""
2478,"EDDB","large_airport","Berlin Brandenburg Airport",52.362247,13.500672,157,"EU","DE","DE-BR","Berlin","yes","EDDB","EDDB","BER","","","",""
2479,"LKPR","large_airport","Vaclav Havel Airport Prague",50.1008,14.26,1247,"EU","CZ","CZ-PR","Prague","yes","LKPR","LKPR","PRG","","","",""
2480,"XXHE","heliport","Un eliporto qualsiasi",45.0,9.0,100,"EU","IT","IT-25","Bergamo","no","XXHE","XXHE","ZZH","","","",""
2481,"LIRQ","medium_airport","Firenze Peretola",43.81,11.2051,142,"EU","IT","IT-52","Florence","yes","LIRQ","LIRQ","","","","",""
2482,"KJFK","large_airport","John F Kennedy International Airport",40.639801,-73.7789,13,"NA","US","US-NY","New York","yes","KJFK","KJFK","JFK","","","",""
`;

const VECCHIO = {
  BGY: {
    icao: "LIME",
    nome: "Il Caravaggio International Airport",
    citta: "Bergamo",
    paese: "Italy",
    iso: "IT",
    lat: 45.6739,
    lon: 9.7042,
    tz: "Europe/Rome",
  },
  PRG: {
    icao: "LKPR",
    nome: "Václav Havel Airport Prague",
    citta: "Prague",
    paese: "Czech Republic",
    iso: "CZ",
    lat: 50.1008,
    lon: 14.26,
    tz: "Europe/Prague",
  },
  XYZ: {
    icao: "XXXX",
    nome: "Scalo chiuso",
    citta: "Chissà",
    paese: "France",
    iso: "FR",
    lat: 44,
    lon: 5,
    tz: "Europe/Paris",
  },
};

test.describe("Archivio scali — la conversione da OurAirports", () => {
  test("il CSV si legge anche con le virgole dentro i nomi", () => {
    const righe = leggiCsv(CSV);
    expect(righe).toHaveLength(6);
    expect(righe[0].name).toBe("Milan Bergamo Airport, Orio al Serio");
    expect(righe[0].iata_code).toBe("BGY");
  });

  test("entrano solo gli scali con sigla IATA e di tipo aeroporto", () => {
    const { archivio } = daOurAirports(leggiCsv(CSV), {});
    expect(Object.keys(archivio).sort()).toEqual(["BER", "BGY", "JFK", "PRG"]);
    expect(archivio.ZZH).toBeUndefined(); // eliporto
  });

  test("Berlino Brandeburgo entra: era proprio lo scalo che mancava", () => {
    const { archivio, nuovi } = daOurAirports(leggiCsv(CSV), VECCHIO);
    expect(archivio.BER.iso).toBe("DE");
    expect(archivio.BER.citta).toBe("Berlin");
    expect(nuovi).toContain("BER");
  });

  test("il nome del paese già in archivio NON si tocca", () => {
    /* Lo standard di oggi scrive "Czechia": cambiarlo spegnerebbe in
       silenzio il confronto per nome dentro il motore e la lettera. */
    const { archivio } = daOurAirports(leggiCsv(CSV), VECCHIO);
    expect(archivio.PRG.paese).toBe("Czech Republic");
    expect(archivio.PRG.iso).toBe("CZ");
  });

  test("il fuso orario si eredita: OurAirports non ce l'ha", () => {
    const { archivio } = daOurAirports(leggiCsv(CSV), VECCHIO);
    expect(archivio.BGY.tz).toBe("Europe/Rome");
    expect(archivio.BER.tz).toBeNull();
  });

  test("uno scalo sparito dalla fonte resta: i biglietti vecchi esistono ancora", () => {
    const { archivio, spariti } = daOurAirports(leggiCsv(CSV), VECCHIO);
    expect(spariti).toContain("XYZ");
    expect(archivio.XYZ.paese).toBe("France");
  });
});

test.describe("Archivio scali — il freno prima di pubblicare", () => {
  const pieno = () => {
    const a: Record<string, Record<string, unknown>> = {};
    for (let i = 0; i < 6000; i++) {
      a[`X${String(i).padStart(3, "0")}`] = {
        icao: null,
        nome: "n",
        citta: "c",
        paese: "Italy",
        iso: "IT",
        lat: 45,
        lon: 9,
        tz: null,
      };
    }
    for (const i of ["FCO", "MXP", "LIN", "BGY", "VCE", "NAP", "CTA", "BLQ", "BER", "CDG", "JFK"]) {
      a[i] = { icao: null, nome: i, citta: i, paese: "Italy", iso: "IT", lat: 45, lon: 9, tz: null };
    }
    return a;
  };

  test("un archivio sano passa", () => {
    expect(controlla(pieno(), {}).ok).toBe(true);
  });

  test("un file tagliato a metà non passa", () => {
    const esito = controlla({ FCO: { paese: "Italy", iso: "IT", lat: 41, lon: 12 } }, {});
    expect(esito.ok).toBe(false);
  });

  test("se sparisce uno scalo dell'Osservatorio non passa", () => {
    const a = pieno();
    delete a.FCO;
    const esito = controlla(a, {});
    expect(esito.ok).toBe(false);
    expect(esito.motivi.join(" ")).toContain("FCO");
  });

  test("un archivio che rimpicciolisce non passa", () => {
    const grande = { ...pieno(), EXTRA1: {}, EXTRA2: {} };
    expect(controlla(pieno(), grande).ok).toBe(false);
  });

  test("il file si scrive una riga per scalo, se no il diff è illeggibile", () => {
    const testo = serializza({ AAA: { nome: "a" }, BBB: { nome: "b" } });
    expect(testo.split("\n")).toHaveLength(5); // {, due righe, }, riga vuota finale
    expect(JSON.parse(testo).BBB.nome).toBe("b");
  });
});

test.describe("Archivio scali — quello che c'è adesso sul disco", () => {
  const ELENCO = aeroporti as unknown as Record<
    string,
    { paese: string; iso: string | null; lat: number; lon: number }
  >;

  test("ogni scalo ha il suo codice paese (tranne quelli di uno Stato che non esiste più)", () => {
    const senza = Object.entries(ELENCO).filter(([, a]) => !a.iso);
    /* Le vecchie Antille Olandesi: il codice AN è stato ritirato nel 2010.
       Restano senza, e per il motore restano fuori dall'Europa, che è
       giusto: sono territori d'oltremare. */
    expect(senza.every(([, a]) => a.paese === "Netherlands Antilles")).toBe(true);
    expect(senza.length).toBeLessThan(10);
  });

  test("gli scali che il prodotto nomina esistono tutti", () => {
    for (const i of ["FCO", "MXP", "LIN", "BGY", "VCE", "NAP", "CTA", "BLQ", "BER"]) {
      expect(ELENCO[i], `manca ${i}`).toBeTruthy();
    }
  });

  test("il cancello territoriale legge il codice, non la grafia del nome", () => {
    expect(zonaDiScalo("PRG")).toBe("ue"); // "Czech Republic" nell'archivio
    expect(zonaDiScalo("BER")).toBe("ue");
    expect(zonaDiScalo("JFK")).toBe("terzo");
  });
});

test.describe("Archivio scali — paesi", () => {
  test("i nomi vecchi si riconoscono lo stesso", () => {
    expect(isoDaNome("Czech Republic")).toBe("CZ");
    expect(isoDaNome("Turkey")).toBe("TR");
    expect(isoDaNome("Reunion")).toBe("RE");
    expect(isoDaNome("Burma")).toBe("MM");
  });

  test("un nome inventato non produce un codice", () => {
    expect(isoDaNome("Freedonia")).toBeNull();
  });

  test("dal codice si torna al nome", () => {
    expect(nomeDaIso("IT")).toBe("Italy");
    expect(nomeDaIso("zz")).toBeNull();
  });
});

/* ── L'AUTOPILOT NON DEVE ROMPERE LA RICERCA ──────────────────────────
   Il 10/08, al suo primo giro, l'aggiornamento automatico ha portato
   l'archivio da 6.073 a 9.016 scali e ha cambiato la città di due
   aeroporti grossi: Malpensa da "Milano" a "Ferno", Charles de Gaulle
   da "Paris" a "Paris (Roissy-en-France, Val-d'Oise)". OurAirports
   scrive il COMUNE, che non è la città che una persona cerca. Chi
   scriveva "milano" si vedeva rispondere "Ferno". Queste prove tengono
   ferme le due difese messe nel convertitore. */
test.describe("Archivio scali — l'aggiornamento automatico", () => {
  test("la città di uno scalo già conosciuto non cambia", () => {
    const vecchio = {
      MXP: { icao: "LIMC", nome: "Malpensa", citta: "Milano", paese: "Italy", iso: "IT", lat: 45.63, lon: 8.72, tz: "Europe/Rome" },
    };
    const { archivio } = daOurAirports(
      [
        {
          iata_code: "MXP",
          icao_code: "LIMC",
          type: "large_airport",
          name: "Milan Malpensa International Airport",
          municipality: "Ferno",
          iso_country: "IT",
          latitude_deg: "45.6306",
          longitude_deg: "8.7281",
        },
      ],
      vecchio,
    );
    expect(archivio.MXP.citta).toBe("Milano");
  });

  test("a uno scalo nuovo si toglie la specifica fra parentesi", () => {
    const { archivio } = daOurAirports([
      {
        iata_code: "ZZZ",
        icao_code: "LFZZ",
        type: "medium_airport",
        name: "Aeroporto di prova",
        municipality: "Paris (Roissy-en-France, Val-d'Oise)",
        iso_country: "FR",
        latitude_deg: "49.0",
        longitude_deg: "2.5",
      },
    ]);
    expect(archivio.ZZZ.citta).toBe("Paris");
  });

  test("chi scrive Milano o Parigi trova lo scalo grande, non quello d'affari", () => {
    expect(cercaAeroporti("milano")[0].citta).toBe("Milano");
    expect(cercaAeroporti("parigi")[0].iata).toBe("CDG");
  });
});
