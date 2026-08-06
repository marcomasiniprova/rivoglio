import { test, expect } from "@playwright/test";
import { abbina, ilMigliore, MARGINE_MINIMO, type Ricerca } from "@/lib/offerte/motore";
import { accettabile, notti, type Offerta } from "@/lib/offerte/tipi";

/**
 * Prove sul motore che decide chi riceve un alert.
 *
 * È il pezzo che non può sbagliare: ogni suo "sì" costa un credito vero a un
 * utente vero. Qui si prova soprattutto quando deve dire NO.
 */

const BOLOGNA: Ricerca = {
  id: "r1",
  utenteId: "u1",
  partenza: { nome: "Bologna", lat: 44.494, lng: 11.343 },
  budgetPersona: 120,
  nottiMin: 1,
  nottiMax: 3,
  oreMax: 2.5,
  persone: 2,
  tipi: [],
};

/** Ferrara: vicinissima a Bologna, ~45 km. */
function offerta(p: Partial<Offerta> = {}): Offerta {
  return {
    struttura: "Albergo Prova",
    comune: "Ferrara",
    lat: 44.836,
    lng: 11.619,
    checkIn: "2026-09-11",
    checkOut: "2026-09-13",
    prezzoAlloggio: 120, // camera intera, 2 notti
    link: "https://esempio.it/albergo-prova",
    tipo: "citta",
    fonte: "prova",
    stato: "attiva",
    ...p,
  };
}

const BENZINA = 1.994;

test.describe("motore degli alert", () => {
  test("un'offerta che sta nel budget viene abbinata, col conto giusto", () => {
    const r = abbina({ ricerca: BOLOGNA, offerte: [offerta()], prezzoBenzina: BENZINA });
    expect(r).toHaveLength(1);

    const a = r[0];
    // 120€ camera / 2 persone = 60€ a testa
    expect(a.alloggioPersona).toBeCloseTo(60, 5);
    // il totale è la somma, e l'avanzo è la soglia meno il totale
    expect(a.totalePersona).toBeCloseTo(a.alloggioPersona + a.autoPersona, 5);
    expect(a.avanzo).toBeCloseTo(BOLOGNA.budgetPersona - a.totalePersona, 5);
    expect(a.notti).toBe(2);
    expect(a.ore).toMatch(/^\dh\d{2}$/);
  });

  test("un'offerta NON verificata non esce mai, nemmeno se perfetta", () => {
    for (const stato of ["demo", "morta"] as const) {
      const r = abbina({
        ricerca: BOLOGNA,
        offerte: [offerta({ stato, prezzoAlloggio: 20 })],
        prezzoBenzina: BENZINA,
      });
      expect(r, `stato ${stato}`).toHaveLength(0);
    }
  });

  test("non manda due volte la stessa offerta", () => {
    const o = offerta();
    const r = abbina({
      ricerca: BOLOGNA,
      offerte: [o],
      prezzoBenzina: BENZINA,
      giaInviate: new Set([o.link]),
    });
    expect(r).toHaveLength(0);
  });

  test("il prezzo della camera si divide per le persone, non si usa tale e quale", () => {
    const in2 = abbina({ ricerca: BOLOGNA, offerte: [offerta()], prezzoBenzina: BENZINA })[0];
    const in4 = abbina({
      ricerca: { ...BOLOGNA, persone: 4 },
      offerte: [offerta()],
      prezzoBenzina: BENZINA,
    })[0];
    // più siete, meno costa a testa: sia l'alloggio sia l'auto
    expect(in4.alloggioPersona).toBeLessThan(in2.alloggioPersona);
    expect(in4.autoPersona).toBeLessThan(in2.autoPersona);
  });

  test("un'offerta troppo lontana viene scartata anche se costa poco", () => {
    // Trapani: fuori da qualsiasi ragionevole 2h30 da Bologna
    const lontana = offerta({ comune: "Trapani", lat: 38.017, lng: 12.537, prezzoAlloggio: 10 });
    const r = abbina({ ricerca: BOLOGNA, offerte: [lontana], prezzoBenzina: BENZINA });
    expect(r).toHaveLength(0);
  });

  test("per pochi centesimi di margine non si brucia un credito", () => {
    // costruiamo un'offerta che sfora di poco il margine minimo
    const base = abbina({ ricerca: BOLOGNA, offerte: [offerta()], prezzoBenzina: BENZINA })[0];
    const prezzoAlPelo = (BOLOGNA.budgetPersona - base.autoPersona) * BOLOGNA.persone - 1;

    const r = abbina({
      ricerca: BOLOGNA,
      offerte: [offerta({ prezzoAlloggio: prezzoAlPelo })],
      prezzoBenzina: BENZINA,
    });
    expect(r).toHaveLength(0);

    // con un margine sopra la soglia, invece, passa
    const prezzoBuono = (BOLOGNA.budgetPersona - base.autoPersona - MARGINE_MINIMO - 1) * BOLOGNA.persone;
    const ok = abbina({
      ricerca: BOLOGNA,
      offerte: [offerta({ prezzoAlloggio: prezzoBuono })],
      prezzoBenzina: BENZINA,
    });
    expect(ok).toHaveLength(1);
  });

  test("il filtro sul tipo viene rispettato", () => {
    const soloMare = { ...BOLOGNA, tipi: ["mare" as const] };
    expect(
      abbina({ ricerca: soloMare, offerte: [offerta({ tipo: "citta" })], prezzoBenzina: BENZINA }),
    ).toHaveLength(0);
    expect(
      abbina({ ricerca: soloMare, offerte: [offerta({ tipo: "mare" })], prezzoBenzina: BENZINA }),
    ).toHaveLength(1);
  });

  test("le notti fuori dall'intervallo chiesto vengono scartate", () => {
    const soloUnaNotte = { ...BOLOGNA, nottiMin: 1, nottiMax: 1 };
    const r = abbina({ ricerca: soloUnaNotte, offerte: [offerta()], prezzoBenzina: BENZINA });
    expect(r).toHaveLength(0);
  });

  test("il migliore è quello che lascia più soldi, non il più vicino", () => {
    const vicinaCara = offerta({ comune: "Ferrara", prezzoAlloggio: 180 });
    const lontanaEconomica = offerta({
      comune: "Mantova",
      lat: 45.157,
      lng: 10.792,
      prezzoAlloggio: 70,
      link: "https://esempio.it/mantova",
    });

    const tutte = abbina({
      ricerca: BOLOGNA,
      offerte: [vicinaCara, lontanaEconomica],
      prezzoBenzina: BENZINA,
    });
    expect(ilMigliore(tutte)?.offerta.comune).toBe("Mantova");
  });

  test("senza abbinamenti il migliore è nulla, non un errore", () => {
    expect(ilMigliore([])).toBeNull();
  });
});

test.describe("filtro sulla spazzatura raccolta dal web", () => {
  test("passa solo quello che sta davvero in piedi", () => {
    expect(accettabile(offerta())).toBe(true);
  });

  test("scarta coordinate fuori dall'Italia, prezzi impossibili e date storte", () => {
    const casi: [string, Partial<Offerta>][] = [
      ["coordinate a zero, in mezzo all'oceano", { lat: 0, lng: 0 }],
      ["prezzo a zero", { prezzoAlloggio: 0 }],
      ["prezzo negativo", { prezzoAlloggio: -50 }],
      ["prezzo da errore di lettura", { prezzoAlloggio: 45000 }],
      ["link che non è un link", { link: "clicca qui" }],
      ["date al contrario", { checkIn: "2026-09-13", checkOut: "2026-09-11" }],
      ["troppe notti: non è una micro-vacanza", { checkOut: "2026-09-30" }],
      ["senza nome della struttura", { struttura: "  " }],
    ];
    for (const [perche, rotta] of casi) {
      expect(accettabile(offerta(rotta)), perche).toBe(false);
    }
  });

  test("le notti si contano giuste", () => {
    expect(notti("2026-09-11", "2026-09-13")).toBe(2);
    expect(notti("2026-09-11", "2026-09-12")).toBe(1);
    expect(notti("non-una-data", "2026-09-12")).toBe(0);
  });
});

import { leggiPrezzo } from "@/lib/offerte/raccoglitori/exa";

test.describe("lettura del prezzo dalle pagine raccolte", () => {
  test("riconosce i prezzi scritti come li scrivono gli italiani", () => {
    expect(leggiPrezzo("Camera doppia da € 89 a notte")).toBe(89);
    expect(leggiPrezzo("A partire da 120,50 euro")).toBe(120.5);
    expect(leggiPrezzo("Prezzo: 95€ colazione inclusa")).toBe(95);
  });

  test("col piu' basso, perche' le pagine scrivono 'a partire da'", () => {
    expect(leggiPrezzo("Singola 65€, doppia 89€, suite 240€")).toBe(65);
  });

  test("non inventa un prezzo quando non c'e'", () => {
    expect(leggiPrezzo("Chiamaci per un preventivo personalizzato")).toBeNull();
    expect(leggiPrezzo("")).toBeNull();
  });

  test("scarta i numeri che non possono essere una notte", () => {
    // 5€ non e' una camera, 99000€ e' un errore di lettura, 2026 e' un anno
    expect(leggiPrezzo("Sconto di 5€ sul soggiorno")).toBeNull();
    expect(leggiPrezzo("Fatturato 99000€ nel 2026")).toBeNull();
  });
});
