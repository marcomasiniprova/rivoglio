import { test, expect } from "@playwright/test";
import {
  SITUAZIONI,
  generaLetteraMobilita,
  type DatiMobilita,
  type SituazioneMobilita,
} from "../lib/lettera/mobilita";

/**
 * LA LETTERA DEL REGOLAMENTO 1107/2006 (mobilità ridotta).
 *
 * È uno strumento gratuito e aperto: la lettera la manda la persona col
 * proprio nome, quindi deve citare l'articolo GIUSTO per la situazione
 * giusta, non promettere esiti, e non avere i segni dell'automatismo (il
 * trattino lungo, "hai diritto a") che il resto del sito si vieta.
 */

const DATI: DatiMobilita = {
  nome: "Mario Rossi",
  volo: "AZ1234",
  data: "6 agosto 2026",
  compagnia: "ITA Airways",
  aeroporto: "Roma Fiumicino",
  descrizione:
    "Avevo chiesto l'assistenza al check-in con 48 ore di preavviso, ma nessuno è venuto a prendermi e ho perso l'imbarco.",
};

const TUTTE: SituazioneMobilita[] = ["assistenza", "imbarco", "attrezzatura"];

test.describe("Reg. 1107/2006 — la lettera si adatta alla situazione", () => {
  test("assistenza: cita l'articolo 7 e i due responsabili", () => {
    const l = generaLetteraMobilita("assistenza", DATI);
    expect(l.corpo).toContain("articolo 7");
    expect(l.corpo).toContain("allegati I e II");
    expect(l.corpo).toContain("gestore dell'aeroporto");
    expect(l.corpo).toContain("compagnia aerea");
  });

  test("imbarco rifiutato: cita l'articolo 3, la deroga e i cinque giorni", () => {
    const l = generaLetteraMobilita("imbarco", DATI);
    expect(l.corpo).toContain("articolo 3");
    expect(l.corpo).toContain("articolo 4");
    expect(l.corpo).toContain("cinque giorni");
  });

  test("attrezzatura: cita l'articolo 12, e l'IBAN compare solo se lo dai", () => {
    const senza = generaLetteraMobilita("attrezzatura", { ...DATI, ausilio: "sedia a rotelle elettrica" });
    expect(senza.corpo).toContain("articolo 12");
    expect(senza.corpo).toContain("sedia a rotelle elettrica");
    expect(senza.corpo).not.toContain("IBAN");

    const con = generaLetteraMobilita("attrezzatura", {
      ...DATI,
      ausilio: "sedia a rotelle elettrica",
      iban: "IT60X0542811101000000123456",
    });
    expect(con.corpo).toContain("IBAN");
    expect(con.corpo).toContain("IT60X0542811101000000123456");
  });

  test("l'articolo dell'altro caso non entra dove non c'entra", () => {
    /* La prova che vale: il declassamento dell'assistenza non deve citare
       l'art. 12 dell'attrezzatura, e viceversa. Ogni lettera parla della
       SUA norma. */
    const ass = generaLetteraMobilita("assistenza", DATI);
    expect(ass.corpo).not.toContain("articolo 12");
    expect(ass.corpo).not.toContain("articolo 3");
    const imb = generaLetteraMobilita("imbarco", DATI);
    expect(imb.corpo).not.toContain("articolo 12");
  });

  for (const s of TUTTE) {
    test(`${s}: oggetto col regolamento, descrizione dentro, firma e nota, niente automatismi`, () => {
      const l = generaLetteraMobilita(s, { ...DATI, ausilio: "carrozzina" });
      const tutto = `${l.oggetto}\n${l.corpo}`;
      expect(l.oggetto).toContain("1107/2006");
      // la descrizione della persona, con parole sue, è dentro
      expect(l.corpo).toContain("nessuno è venuto a prendermi");
      // la firma e la nota di trasparenza chiudono
      expect(l.corpo).toContain("Mario Rossi");
      expect(l.corpo).toContain("Non costituisce parere legale");
      // niente esiti promessi né segni dell'automatismo
      expect(tutto).not.toContain("—");
      expect(tutto.toLowerCase()).not.toContain("hai diritto a");
    });
  }

  test("il numero del volo può mancare: la lettera si fa lo stesso, pulita", () => {
    const l = generaLetteraMobilita("assistenza", { ...DATI, volo: "" });
    // niente doppio spazio dove sarebbe andato il numero
    expect(l.oggetto).not.toContain("  ");
    expect(l.corpo).not.toContain("  ");
    expect(l.oggetto).toContain("del 6 agosto 2026");
  });

  test("le tre situazioni dicono a chi mandare la lettera", () => {
    expect(SITUAZIONI.assistenza.aChi).toContain("gestore");
    expect(SITUAZIONI.imbarco.aChi).toContain("compagnia");
    expect(SITUAZIONI.attrezzatura.aChi.toUpperCase()).toContain("PIR");
  });

  test("la pagina si apre e lo strumento compone la lettera dal vivo", async ({ page }) => {
    await page.goto("/mobilita-ridotta");
    await expect(
      page.getByRole("heading", { name: "Voli e disabilità: i tuoi diritti" }),
    ).toBeVisible();

    await page.getByRole("button", { name: SITUAZIONI.attrezzatura.scheda }).click();
    await page.getByLabel("Il tuo nome e cognome").fill("Mario Rossi");
    await page.getByLabel("Data del volo").fill("2026-08-06");
    await page.getByLabel("Aeroporto dove è successo").fill("Roma Fiumicino");
    await page
      .getByLabel("Racconta cosa è successo, con parole tue")
      .fill("Mi hanno consegnato la carrozzina con una ruota piegata.");

    await page.getByRole("button", { name: "Prepara la lettera" }).click();

    await expect(page.getByText("A chi mandarla")).toBeVisible();
    await expect(page.getByText("articolo 12", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: /Apri l'email già scritta/ })).toBeVisible();
  });
});
