/**
 * Le prove del campo data del check: è l'unico punto dell'app dove un
 * testo scritto a mano diventa un dato che va al motore. Se qui sbagliamo
 * la conversione, il server riceve un giorno diverso da quello che
 * l'utente ha in testa, e il verdetto è di un altro volo.
 */
import { conBarre, dataIso, inItaliano, perEsteso } from "../data";

describe("conBarre: le barre si mettono da sole", () => {
  test("mette le barre mentre si scrive", () => {
    expect(conBarre("0")).toBe("0");
    expect(conBarre("06")).toBe("06");
    expect(conBarre("0608")).toBe("06/08");
    expect(conBarre("06082026")).toBe("06/08/2026");
  });

  test("butta via quello che non è una cifra e non supera gli 8 numeri", () => {
    expect(conBarre("06/08/2026")).toBe("06/08/2026");
    expect(conBarre("ab06cd08ef2026")).toBe("06/08/2026");
    expect(conBarre("060820261234")).toBe("06/08/2026");
  });
});

describe("dataIso: dal formato italiano a quello del server", () => {
  test("converte il giorno scritto dall'utente", () => {
    expect(dataIso("06/08/2026")).toBe("2026-08-06");
    expect(dataIso("6/8/2026")).toBe("2026-08-06");
    expect(dataIso("06-08-2026")).toBe("2026-08-06");
  });

  test("dice di no a quello che data non è", () => {
    expect(dataIso("")).toBeNull();
    expect(dataIso("06/08")).toBeNull();
    expect(dataIso("32/08/2026")).toBeNull();
    expect(dataIso("06/13/2026")).toBeNull();
    expect(dataIso("domani")).toBeNull();
  });
});

/* La strada al contrario: la carta d'imbarco fotografata torna una data
   del server, e va rimessa nel campo come la scrive una persona. */
describe("inItaliano: dal server al campo", () => {
  test("rimette la data nella forma del campo", () => {
    expect(inItaliano("2026-08-06")).toBe("06/08/2026");
  });

  test("una data storta non riempie il campo di spazzatura", () => {
    expect(inItaliano("6 agosto")).toBe("");
    expect(inItaliano("")).toBe("");
  });

  test("va e torna senza perdere niente", () => {
    expect(dataIso(inItaliano("2026-08-06"))).toBe("2026-08-06");
  });
});

describe("perEsteso: la data da leggere", () => {
  test("scrive il giorno a parole", () => {
    expect(perEsteso("2026-08-06")).toBe("6 agosto 2026");
  });

  test("se non è una data la ripete com'è, senza inventare", () => {
    expect(perEsteso("boh")).toBe("boh");
  });
});
