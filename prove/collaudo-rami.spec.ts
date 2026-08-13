import { test, expect } from "@playwright/test";
import { generaReclamo } from "@/lib/lettera/genera";
import { percorsoPratica } from "@/lib/pratiche/passi";
import { GIORNI_PRIMA_DELL_ENTE, GIORNI_PRIMA_DEL_SOLLECITO } from "@/lib/pratiche/rifiuto";
import { valuta, type FattoVolo } from "@/lib/regole/eu261";

/**
 * I RAMI CHE NESSUNO AVEVA MAI CAMMINATO, e i difetti che ci ho trovato
 * il 13/08 percorrendoli uno per uno sul sito vero.
 */

const FATTO: FattoVolo = {
  voloIata: "ZZ600",
  dataLocale: "2026-08-06",
  partenzaIata: "FCO",
  arrivoIata: "JFK",
  partenzaCitta: "Roma",
  arrivoCitta: "New York",
  partenzaPaese: "IT",
  arrivoPaese: "US",
  arrivoPrevistoUtc: "2026-08-06T18:00:00Z",
  arrivoEffettivoUtc: "2026-08-06T23:05:00Z",
  stato: "atterrato",
  kmOrtodromica: 6500,
  vettoreOperativo: "ZZ",
  orarioVerificato: true,
  fonte: "demo",
};

test.describe("La pratica famiglia non inventa quanti eravate", () => {
  const lettera = (tipo: "singola" | "famiglia") =>
    generaReclamo(
      { passeggeri: [], tipo, email: "prova@rivolio.it" },
      FATTO,
      valuta(FATTO) as never,
    );

  test("🔴 niente numero di passeggeri e niente totale inventati", () => {
    /* Prima usciva: «600 euro per ciascuno dei seguenti 2 passeggeri, per
       un totale di 1200 euro». Due non l'aveva detto nessuno: i nomi non
       si chiedono da nessuna parte e la pratica si vende fino a cinque.
       Chi volava in quattro chiedeva la metà del suo. */
    const f = lettera("famiglia");
    expect(f).not.toBeNull();
    expect(f!.corpo).not.toMatch(/seguenti \d+ passeggeri/);
    expect(f!.corpo).not.toMatch(/per un totale di/);
    expect(f!.corpo).toContain("per ciascuno dei passeggeri sotto elencati");
  });

  test("la pratica singola resta al singolare, col suo nome da compilare", () => {
    const s = lettera("singola");
    expect(s!.corpo).toContain("in favore di");
    expect(s!.corpo).toContain("[Nome e cognome]");
  });
});

test.describe("Al giorno 42 e al 56 la pratica lo dice", () => {
  /* 🔴 Il documento era pronto e la pratica continuava a scrivere
     «niente da fare per ora: alla sesta settimana te lo mandiamo». Il
     cliente restava fermo davanti a una cosa che lo aspettava. */
  const silenzio = (giorni: number) => percorsoPratica("inviata", [], null, giorni);

  test("prima del giorno 42 si aspetta, ed è giusto così", () => {
    const p = silenzio(GIORNI_PRIMA_DEL_SOLLECITO - 1);
    expect(p.attivo).toBe("attesa");
    expect(p.chiaveTesto).toBe("inviata");
  });

  test("al giorno 42 il passo diventa il sollecito", () => {
    const p = silenzio(GIORNI_PRIMA_DEL_SOLLECITO);
    expect(p.attivo).toBe("replica");
    expect(p.chiaveTesto).toBe("sollecito");
  });

  test("al giorno 56 si aggiunge l'ente", () => {
    const p = silenzio(GIORNI_PRIMA_DEL_SOLLECITO + GIORNI_PRIMA_DELL_ENTE);
    expect(p.attivo).toBe("ente");
    expect(p.chiaveTesto).toBe("enac");
  });

  test("⚠️ un no dichiarato batte il calendario, sempre", () => {
    /* Se hanno risposto no, aspettare la sesta settimana non ha senso: la
       replica parte subito. Vale anche a giorno 100. */
    const p = percorsoPratica("inviata", [], "maltempo", 100);
    expect(p.attivo).toBe("replica");
    expect(p.chiaveTesto).toBe("risposta_no");
  });

  test("senza data d'invio non si inventa nessun passo", () => {
    expect(percorsoPratica("inviata", [], null, null).attivo).toBe("attesa");
  });
});
