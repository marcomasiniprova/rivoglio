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
 */

const base = (x: Partial<FattoVolo>): FattoVolo =>
  ({
    voloIata: "FR100",
    dataLocale: "2026-08-11",
    vettoreOperativo: "FR",
    vettoreMarketing: null,
    partenzaIata: "BGY",
    arrivoIata: "CDG",
    arrivoPrevistoUtc: "2026-08-11T11:00:00Z",
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
    expect(incrociaFonti(p, "2026-08-11T15:13:00Z")).toEqual({
      discordanti: false,
      confermato: true,
    });
  });

  test("d'accordo e ben sotto la soglia: conferma (sarà non idoneo, sicuro)", () => {
    // 60 min di ritardo: confermare è sicuro, tanto non si vende.
    const p = base({ arrivoEffettivoUtc: "2026-08-11T12:00:00Z" });
    expect(incrociaFonti(p, "2026-08-11T12:05:00Z").confermato).toBe(true);
  });

  test("ZONA GRIGIA (185 min): NON conferma, resta incerto", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T14:05:00Z" }); // +185
    const e = incrociaFonti(p, "2026-08-11T14:08:00Z"); // scarto 3 min
    expect(e.confermato).toBe(false);
    expect(e.discordanti).toBe(false);
  });

  test("appena sopra la zona grigia (205 min): conferma", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T14:25:00Z" }); // +205
    expect(incrociaFonti(p, "2026-08-11T14:27:00Z").confermato).toBe(true);
  });

  test("in disaccordo (30 min): incerto", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" });
    const e = incrociaFonti(p, "2026-08-11T15:40:00Z");
    expect(e.discordanti).toBe(true);
    expect(e.confermato).toBe(false);
  });

  test("d'accordo così così (12 min): non conferma e non contraddice", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" });
    expect(incrociaFonti(p, "2026-08-11T15:22:00Z")).toEqual({
      discordanti: false,
      confermato: false,
    });
  });

  test("il primario era già Live: niente da confermare", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z", orarioVerificato: true });
    expect(incrociaFonti(p, "2026-08-11T15:12:00Z").confermato).toBe(false);
  });

  test("la seconda fonte non ha l'orario: niente incrocio", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z" });
    expect(incrociaFonti(p, null)).toEqual({ discordanti: false, confermato: false });
    expect(incrociaFonti(p, undefined)).toEqual({ discordanti: false, confermato: false });
  });

  test("senza orario previsto non si può confermare (non si sa il ritardo)", () => {
    const p = base({ arrivoEffettivoUtc: "2026-08-11T15:10:00Z", arrivoPrevistoUtc: null });
    expect(incrociaFonti(p, "2026-08-11T15:12:00Z").confermato).toBe(false);
  });
});
