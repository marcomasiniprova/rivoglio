import { test, expect } from "@playwright/test";
import { incrociaFonti } from "../lib/voli/incrocio";
import type { FattoVolo } from "../lib/regole/eu261";

/**
 * L'INCROCIO DI DUE FONTI: recupera vendite vere senza aprire falsi
 * positivi.
 *
 * La cosa che questi test blindano più di ogni altra è la ZONA GRIGIA: due
 * fonti d'accordo NON bastano a vendere un volo il cui ritardo è vicino alle
 * 3 ore, perché lì pochi minuti spostano l'esito. È la regola numero uno del
 * progetto (mai falsi positivi) applicata al punto esatto in cui potrebbe
 * rompersi.
 *
 * Dal 14/08 l'incrocio confronta il RITARDO, non l'orario assoluto: la
 * seconda fonte porta i suoi due orari (previsto ed effettivo), il loro
 * scarto è il suo ritardo. Il primario ha il previsto alle 11:00Z, quindi
 * qui la seconda fonte usa lo stesso previsto e i minuti tornano.
 */

const PREVISTO = "2026-08-11T11:00:00Z";

const base = (x: Partial<FattoVolo>): FattoVolo =>
  ({
    voloIata: "FR100",
    dataLocale: "2026-08-11",
    vettoreOperativo: "FR",
    vettoreMarketing: null,
    partenzaIata: "BGY",
    arrivoIata: "CDG",
    arrivoPrevistoUtc: PREVISTO,
    arrivoEffettivoUtc: null,
    stato: "atterrato",
    kmOrtodromica: 640,
    fonte: "aerodatabox",
    ...x,
  }) as FattoVolo;

test.describe("Incrocio delle fonti", () => {
  test("d'accordo e ben oltre la soglia: conferma (volo recuperato)", () => {
    // arrivo previsto 11:00, effettivo 15:10 = 250 min di ritardo, ben oltre.
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" });
    expect(incrociaFonti(p, PREVISTO, "2026-08-11T15:13:00Z")).toEqual({
      discordanti: false,
      confermato: true,
    });
  });

  test("d'accordo e ben sotto la soglia: conferma (sarà non idoneo, sicuro)", () => {
    // 60 min di ritardo: confermare è sicuro, tanto non si vende.
    const p = base({ arrivoEffettivoUtc: "2026-08-11T12:00:00Z" });
    expect(incrociaFonti(p, PREVISTO, "2026-08-11T12:05:00Z").confermato).toBe(true);
  });

  test("ZONA GRIGIA (185 min): NON conferma, resta incerto", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T14:05:00Z" }); // +185
    const e = incrociaFonti(p, PREVISTO, "2026-08-11T14:08:00Z"); // scarto 3 min
    expect(e.confermato).toBe(false);
    expect(e.discordanti).toBe(false);
  });

  test("appena sopra la zona grigia (205 min): conferma", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T14:25:00Z" }); // +205
    expect(incrociaFonti(p, PREVISTO, "2026-08-11T14:27:00Z").confermato).toBe(true);
  });

  test("in disaccordo (30 min sul ritardo): incerto", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" }); // +250
    const e = incrociaFonti(p, PREVISTO, "2026-08-11T15:40:00Z"); // +280
    expect(e.discordanti).toBe(true);
    expect(e.confermato).toBe(false);
  });

  test("d'accordo così così (12 min): non conferma e non contraddice", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" }); // +250
    expect(incrociaFonti(p, PREVISTO, "2026-08-11T15:22:00Z")).toEqual({
      discordanti: false,
      confermato: false,
    }); // +262, scarto 12
  });

  test("il primario era già Live: niente da confermare", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z", orarioVerificato: true });
    expect(incrociaFonti(p, PREVISTO, "2026-08-11T15:12:00Z").confermato).toBe(false);
  });

  test("la seconda fonte non ha gli orari: niente incrocio", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" });
    expect(incrociaFonti(p, null, null)).toEqual({ discordanti: false, confermato: false });
    expect(incrociaFonti(p, PREVISTO, undefined)).toEqual({ discordanti: false, confermato: false });
  });

  test("senza orario previsto del primario non si può confermare (non si sa il ritardo)", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z", arrivoPrevistoUtc: null });
    expect(incrociaFonti(p, PREVISTO, "2026-08-11T15:12:00Z").confermato).toBe(false);
  });

  /* IL FUSO NON DEVE FARE DANNI. Il primario è in UTC (250 min di ritardo).
     La seconda fonte scrive gli orari in ORA LOCALE (senza la Z, offset
     qualunque): 252 min. Il fuso si annulla nella sottrazione, quindi le due
     si confermano lo stesso. È la ragione per cui si confronta il ritardo e
     non l'orologio: una fonte in ora locale altrimenti risulterebbe diversa
     di ore e brucerebbe la vendita. */
  test("seconda fonte in ORA LOCALE (senza Z): conta il ritardo, non l'orologio", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" }); // previsto 11:00Z, +250
    const e = incrociaFonti(p, "2026-08-11T13:00:00", "2026-08-11T17:12:00"); // +252, senza Z
    expect(e).toEqual({ discordanti: false, confermato: true });
  });
});
