import { test, expect } from "@playwright/test";
import {
  deveRecuperareReplica,
  GIORNI_PRIMA_DEL_RECUPERO_REPLICA,
  type StatoReplica,
} from "../lib/pratiche/recupero-replica";

/**
 * Il promemoria del "no non replicato" tocca UTENTI VERI, quindi la regola
 * va blindata: mai su un no a cui hai già replicato, mai due volte per lo
 * stesso no, mai prima che il no penda da qualche giorno.
 */

const ADESSO = new Date("2026-08-19T12:00:00Z");
const giorniFa = (n: number) =>
  new Date(ADESSO.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const base: StatoReplica = {
  no: 1,
  replicheMandate: 0,
  promemoria: 0,
  ultimoNoIso: giorniFa(GIORNI_PRIMA_DEL_RECUPERO_REPLICA),
};

test.describe("Quando parte il promemoria della replica", () => {
  test("no aperto, passati i giorni, mai ricordato: si manda", () => {
    expect(deveRecuperareReplica(base, ADESSO)).toBe(true);
  });

  test("se hai già replicato al no, non c'è niente da recuperare", () => {
    expect(
      deveRecuperareReplica({ ...base, no: 1, replicheMandate: 1 }, ADESSO),
    ).toBe(false);
  });

  test("un promemoria per ogni no, non due", () => {
    expect(deveRecuperareReplica({ ...base, promemoria: 1 }, ADESSO)).toBe(false);
  });

  test("no appena dichiarato (stesso giorno): si aspetta", () => {
    expect(deveRecuperareReplica({ ...base, ultimoNoIso: giorniFa(0) }, ADESSO)).toBe(false);
  });

  test("il secondo no, dopo aver replicato al primo, riapre il promemoria", () => {
    // no=2, hai replicato 1, ne hai ricordato 1: c'è un secondo no aperto.
    expect(
      deveRecuperareReplica(
        { no: 2, replicheMandate: 1, promemoria: 1, ultimoNoIso: giorniFa(GIORNI_PRIMA_DEL_RECUPERO_REPLICA) },
        ADESSO,
      ),
    ).toBe(true);
  });

  test("senza la data del no non si manda niente (mai al buio)", () => {
    expect(deveRecuperareReplica({ ...base, ultimoNoIso: null }, ADESSO)).toBe(false);
  });

  test("nessun no dichiarato: niente da recuperare", () => {
    expect(deveRecuperareReplica({ ...base, no: 0, ultimoNoIso: null }, ADESSO)).toBe(false);
  });
});
