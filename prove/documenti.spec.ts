import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EVENTO_CARICATO,
  EVENTO_SALTATO,
  letteraSbloccata,
} from "../lib/pratiche/documenti";
import type { EventoPratica } from "../lib/pratiche/pratiche";

/**
 * IL PASSO 1: LA CARTA D'IMBARCO PRIMA DELLA LETTERA.
 *
 * Scelta di Valerio col popup del 12/08. Il guadagno è vero (due fonti
 * che dicono la stessa cosa reggono meglio a un no), ma il rischio lo è
 * altrettanto: il cliente a quel punto HA GIÀ PAGATO, e un muro che non
 * riesce a superare è un prodotto venduto e non consegnato.
 *
 * Queste prove tengono ferme tutte e due le cose: che il muro ci sia
 * davvero (anche per chi digita l'indirizzo a mano) e che la porta di
 * servizio non sparisca mai.
 */

const RADICE = join(__dirname, "..");
const leggi = (p: string) => readFileSync(join(RADICE, p), "utf8");

const evento = (tipo: string): EventoPratica =>
  ({ id: "x", pratica_id: "y", tipo, nota: null, creato_il: "2026-08-12T10:00:00Z" }) as EventoPratica;

test.describe("Il passo dei documenti", () => {
  test("senza documenti la lettera è chiusa", () => {
    expect(letteraSbloccata([])).toBe(false);
    expect(letteraSbloccata([evento("creata"), evento("pagata")])).toBe(false);
  });

  test("un documento caricato apre la lettera", () => {
    expect(letteraSbloccata([evento("pagata"), evento(EVENTO_CARICATO)])).toBe(true);
  });

  test("chi dichiara di non averli passa lo stesso", () => {
    /* ⚠️ È LA PROVA PIÙ IMPORTANTE DEL FILE. Se un domani questa porta
       si chiude, un cliente che ha pagato 14,90 e non ha la carta
       d'imbarco resta senza la lettera che ha comprato: rimborso,
       recensione a una stella, e avrebbe ragione lui. */
    expect(letteraSbloccata([evento(EVENTO_SALTATO)])).toBe(true);
  });

  test("il muro sta anche sul server, non solo sul bottone", () => {
    /* L'indirizzo della lettera si digita, sta nella cronologia del
       browser e finisce nei segnalibri: spegnere il bottone sulla pagina
       della pratica non è un controllo, è un suggerimento. */
    const pagina = leggi("app/pratica/[id]/lettera/page.tsx");
    expect(pagina, "la pagina della lettera deve controllare il passo 1").toContain(
      "letteraSbloccata",
    );
    /* `lastIndexOf`: la prima occorrenza è la riga di import, e lì
       accanto un redirect non c'è per definizione. */
    const i = pagina.lastIndexOf("letteraSbloccata");
    expect(pagina.slice(i, i + 200), "e deve rimandare alla pratica").toContain("redirect");
  });

  test("la porta di servizio esiste come rotta, e controlla di chi è la pratica", () => {
    const rotta = leggi("app/api/pratiche/[id]/documento/salta/route.ts");
    /* Il tipo dell'evento arriva dalla costante condivisa, non scritto a
       mano: due stringhe uguali in due file divergono al primo refuso, e
       un refuso qui vorrebbe dire una lettera che non si sblocca mai. */
    expect(rotta).toContain("EVENTO_SALTATO");
    expect(EVENTO_SALTATO).toBe("documento_saltato");
    /* `caricaPratica` legge con la chiave di servizio, che salta le
       regole di riga: senza questo confronto bastava conoscere un id
       altrui per scrivergli nella cronologia. */
    expect(rotta, "manca il controllo del proprietario").toContain("utente_id !== utente.id");
  });

  test("il bottone della lettera si spegne, non sparisce", () => {
    /* Un bottone che sparisce fa pensare di aver comprato una cosa che
       non c'è. Spento con accanto la riga che dice cosa manca, invece,
       si capisce in tre secondi. */
    const pagina = leggi("app/pratica/[id]/page.tsx");
    expect(pagina).toContain("letteraApribile");
    expect(pagina).toContain("letteraChiusa");
  });
});

test.describe("Dopo l'invio si sa quando succede il prossimo passo", () => {
  test("la data del sollecito si conta dalla costante vera, non a mano", () => {
    /* Se il giorno fosse scritto a mano, al primo cambio della tappa la
       pagina prometterebbe a un cliente pagante una data che il motore
       non rispetta più. */
    const pagina = leggi("app/pratica/[id]/page.tsx");
    expect(pagina).toContain("GIORNI_PRIMA_DEL_SOLLECITO");
    expect(pagina, "il conto alla rovescia deve esistere").toContain("attesaDopoInvio");
    /* Nessun numero di giorni scritto in chiaro dentro la funzione. */
    const i = pagina.indexOf("function attesaDopoInvio");
    expect(pagina.slice(i, i + 900)).not.toMatch(/\b(42|56|90)\b/);
  });

  test("l'email di conferma dell'invio esiste e non blocca l'invio", () => {
    const rotta = leggi("app/api/pratiche/conferma-invio/route.ts");
    expect(rotta).toContain("invioConfermato");
    /* `void`: non si aspetta. Se la posta è giù, l'invio resta
       registrato lo stesso, perché il dato che conta è già scritto. */
    expect(rotta, "l'email non deve mai bloccare la registrazione").toContain(
      "void confermaInvioPerEmail",
    );
  });
});
