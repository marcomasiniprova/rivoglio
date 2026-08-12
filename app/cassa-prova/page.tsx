import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CassaProva from "@/components/rivolio/CassaProva";
import { cassaDiProvaAperta } from "@/lib/check/cancello";
import { conteggioCheck } from "@/lib/check/conteggio";
import { prezzoCheck, prezzoPagatoPerIlCheck, scontoDaCheck } from "@/lib/check/ingresso";
import { passDi } from "@/lib/check/cancello";
import { headers } from "next/headers";
import { listinoCorrente } from "@/lib/prezzi-server";

/**
 * LA CASSA DI PROVA: la pagina.
 *
 * Fa vedere il giro intero senza un venditore vero. Non è una
 * simulazione "quasi vera": porta un bollo giallo che dice cos'è.
 *
 * ⚠️ ADESSO SERVE A TUTTI E DUE I PAGAMENTI (richiesta di Valerio,
 * 12/08). Prima valeva solo per l'analisi da 1,99: il pagamento della
 * pratica da 14,90 saltava ogni schermata e la pratica si apriva da sola.
 * Così il passaggio che nel prodotto vero decide se incassi o no non lo
 * vedeva nessuno, e un percorso provato saltando il pezzo dei soldi non
 * è provato. Con `?pratica=<id verifica>` la stessa cassa mostra la
 * pratica, col suo prezzo e il suo riepilogo.
 *
 * Senza `CASSA_PROVA_SEGRETO` (o senza `COLLAUDO_APERTO`) la pagina NON
 * esiste: 404, come qualsiasi indirizzo inventato. Il giorno del
 * venditore vero si toglie la variabile e sparisce da sola.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cassa di prova | Rivolio",
  robots: { index: false, follow: false },
};

const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PaginaCassaProva({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!cassaDiProvaAperta()) notFound();

  const q = await searchParams;
  const pratica = typeof q.pratica === "string" && UUID_OK.test(q.pratica) ? q.pratica : null;
  const tipo = q.tipo === "famiglia" ? "famiglia" : "singola";

  if (pratica) {
    const { listino: pieno } = await listinoCorrente();
    /* ⚠️ LO STESSO SCONTO DEL VERDETTO, letto dalla stessa ricevuta. Se
       qui si mostrasse il prezzo pieno, il numero cambierebbe fra il
       bottone e la cassa: è il motivo per cui uno chiude la pagina. */
    const h = await headers();
    const req = new Request("https://rivolio.it/", { headers: { cookie: h.get("cookie") ?? "" } });
    const scontato = passDi(req) ? scontoDaCheck(pieno, prezzoPagatoPerIlCheck()) : null;
    const listino = scontato ?? pieno;
    const prezzoTesto = tipo === "famiglia" ? listino.famigliaTesto : listino.singolaTesto;
    return (
      <CassaProva
        prezzoTesto={prezzoTesto}
        verifica={pratica}
        tipo={tipo}
        cosa={{
          chiave: "pratica",
          titolo: "La tua pratica",
          sotto:
            "Il reclamo già scritto con gli orari certificati, e i tre passi dopo: il sollecito, la replica se dicono no, la conciliazione.",
          voci: [
            "La lettera di reclamo pronta da inviare",
            tipo === "famiglia"
              ? "Fino a 5 passeggeri sullo stesso volo"
              : "Il sollecito e la replica al loro no, al momento giusto",
            "La segnalazione all'ente e la conciliazione, già scritte",
            "Se la compagnia non paga, ti rimborsiamo per intero",
          ],
          rigaTotale: scontato
            ? `Pratica meno l'analisi che hai già pagato (${prezzoCheck(null).prezzoTesto})`
            : tipo === "famiglia"
              ? "Pratica famiglia"
              : "Pratica, una volta",
          vale: "Fino alla fine della pratica",
          dopo: "Poi si apre la pratica con la lettera pronta.",
        }}
      />
    );
  }

  const { pagati } = await conteggioCheck();
  const prezzo = prezzoCheck(pagati);
  return (
    <CassaProva
      prezzoTesto={prezzo.prezzoTesto}
      cosa={{
        chiave: "analisi",
        titolo: "L'analisi del tuo volo",
        sotto:
          "Gli orari certificati di partenza e atterraggio, i minuti di ritardo e la fascia del Regolamento CE 261/2004.",
        voci: [
          "Un'analisi completa del volo che scegli",
          "La prova archiviata, se un giorno la compagnia contesta",
          "Se il verdetto esce incerto, il credito resta",
          "Se poi apri la pratica, questi euro si scalano",
        ],
        rigaTotale: "Analisi, una volta",
        vale: "30 giorni",
        dopo: "Poi torni al check e l'analisi parte da sola.",
      }}
    />
  );
}
