import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { coerenzaRisposta } from "../lib/ai/replica";
import type { Dossier } from "../lib/pratiche/dossier";

/**
 * LA RISPOSTA INCOLLATA DEVE ESSERE LA TUA.
 *
 * 🔴 Valerio, 13/08: ha incollato dentro la pratica del volo **ZZ400** la
 * risposta di un altro volo (**FR1234**, altro ritardo, altro numero di
 * reclamo) e il sistema ha scritto la replica come se niente fosse.
 * «Il mio fascicolo non lo ha letto veramente.»
 *
 * Il buco era strutturale: `controlla()` guardava le sentenze, le cifre e
 * il tono del testo GENERATO; nessuno guardava quello IN INGRESSO. Il
 * risultato è la cosa peggiore che possiamo far mandare a una compagnia:
 * una replica che discute fatti mai avvenuti su quel volo.
 */

const RADICE = join(__dirname, "..");

/** Un fascicolo minimo: al controllo serve solo il numero del volo. */
const dossier = (numero: string | null): Dossier =>
  ({
    volo: {
      numero,
      data: "2026-08-12",
      tratta: "Scalo demo A → Scalo demo B",
      compagnia: "ZZ Compagnia Demo",
      ritardoMinuti: 210,
      km: 2300,
      fonte: "demo",
      arrivoPrevisto: null,
      arrivoEffettivo: null,
    },
    diritto: { fascia: 400, passeggeri: 1, totale: 400, motivoMotore: null, versioneRegole: null },
    percorso: {
      stato: "inviata",
      reclamoInviatoIl: null,
      documentoCaricato: false,
      documentoSaltato: false,
      documentoEsito: null,
    },
    rifiuto: { motivo: null, etichetta: null, peso: null, dichiaratoIl: null },
  }) as unknown as Dossier;

/* La mail vera che Valerio ha incollato, accorciata. */
const RISPOSTA_ALTRUI = `Oggetto: Aggiornamento sulla tua richiesta di rimborso - Volo FR1234 - Reclamo [REF-98765]
Gentile Cliente, siamo spiacenti per il ritardo di 3 ore e 20 minuti subito dal tuo volo.
Tuttavia, dopo aver verificato i dettagli operativi, ti informiamo che non è possibile procedere
al rimborso economico. Il ritardo è stato causato da uno sciopero improvviso del personale del
controllo del traffico aereo (ATC) a terra. Tale evento costituisce una "circostanza eccezionale"
ai sensi del Regolamento UE 261/2004.`;

test.describe("Il cancello zero: è la tua risposta?", () => {
  test("🔴 il caso vero del 13/08: risposta del volo FR1234 dentro la pratica ZZ400", () => {
    const e = coerenzaRisposta(RISPOSTA_ALTRUI, dossier("ZZ400"));
    expect(e.ok, "questa risposta NON deve passare").toBe(false);
    if (e.ok) return;
    expect(e.voloTrovato).toBe("FR1234");
    expect(e.voloAtteso).toBe("ZZ400");
    /* Il messaggio deve dire tutti e due i voli: «non torna» senza dire
       cosa non torna lascia la persona a indovinare. */
    expect(e.messaggio).toContain("FR1234");
    expect(e.messaggio).toContain("ZZ400");
  });

  test("la risposta giusta passa", () => {
    const giusta = RISPOSTA_ALTRUI.replace(/FR1234/g, "ZZ400");
    expect(coerenzaRisposta(giusta, dossier("ZZ400")).ok).toBe(true);
  });

  test("le grafie diverse dello stesso volo sono lo stesso volo", () => {
    /* Le compagnie scrivono "FR 1234", "fr1234", a volte con lo zero
       davanti. Bocciare per uno spazio sarebbe fermare un cliente che ha
       ragione, cioè il difetto opposto a quello che stiamo riparando. */
    for (const grafia of ["ZZ 400", "zz400", "ZZ0400", "Volo: zz 400,"]) {
      const testo = `Gentile cliente, in merito al volo ${grafia} la informiamo che non possiamo procedere al rimborso per circostanze eccezionali dovute a maltempo.`;
      expect(coerenzaRisposta(testo, dossier("ZZ400")).ok, grafia).toBe(true);
    }
  });

  test("⚠️ un'email che non nomina nessun volo passa", () => {
    /* Ne arrivano tante così, e sono legittime. Bloccarle vorrebbe dire
       fermare chi ha ragione: si sbaglia dalla parte di chi lascia
       passare, perché il danno vero (una replica sui fatti di un altro
       volo) qui non può avvenire. */
    const testo =
      "Gentile Cliente, la Sua richiesta di compensazione è stata esaminata e respinta in quanto il disservizio è stato determinato da circostanze eccezionali non imputabili al vettore. Cordiali saluti, Servizio Clienti.";
    expect(coerenzaRisposta(testo, dossier("ZZ400")).ok).toBe(true);
  });

  test("i numeri che voli non sono non fanno scattare il blocco", () => {
    /* «Regolamento CE 261/2004», «art. 5», «REF-98765», «pratica IT 2026»:
       tutte sequenze che somigliano a un codice di volo. Un falso allarme
       qui blocca un cliente che ha incollato la cosa giusta. */
    const testo =
      "Gentile Cliente, con riferimento al Regolamento CE 261/2004 e in particolare all'art. 5, la pratica REF-98765 non può essere accolta. Rif. interno IT 2026. Distinti saluti.";
    expect(coerenzaRisposta(testo, dossier("ZZ400")).ok).toBe(true);
  });

  test("senza numero di volo nel fascicolo non si blocca nessuno", () => {
    expect(coerenzaRisposta(RISPOSTA_ALTRUI, dossier(null)).ok).toBe(true);
  });
});

test.describe("Il cancello sta prima del modello, e non sporca il fascicolo", () => {
  test("la rotta controlla la coerenza PRIMA di chiamare l'AI", () => {
    /* Due motivi, tutti e due seri: non si spendono soldi di API per
       analizzare l'email sbagliata, e soprattutto il modello non ha modo
       di "aggiustare" un caso che non torna. */
    const rotta = readFileSync(join(RADICE, "app/api/pratiche/[id]/risposta/route.ts"), "utf8");
    const iControllo = rotta.indexOf("coerenzaRisposta(");
    const iModello = rotta.indexOf("analizzaRifiuto(dossier");
    expect(iControllo, "la rotta deve chiamare il controllo").toBeGreaterThan(-1);
    expect(iModello).toBeGreaterThan(-1);
    expect(iControllo, "il controllo deve venire prima del modello").toBeLessThan(iModello);
  });

  test("una risposta di un altro volo non lascia traccia nella pratica", () => {
    /* Registrarla vorrebbe dire mettere nel fascicolo i fatti di un altro
       volo, cioè esattamente il danno che il controllo evita. */
    const rotta = readFileSync(join(RADICE, "app/api/pratiche/[id]/risposta/route.ts"), "utf8");
    const i = rotta.indexOf("if (!coerente.ok)");
    const blocco = rotta.slice(i, rotta.indexOf("return NextResponse.json", i) + 400);
    expect(blocco).not.toContain("registraEvento");
  });
});
