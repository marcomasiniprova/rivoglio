import { NextResponse } from "next/server";
import { versoCasa } from "@/lib/sito";
import { benvenutoLista, type ScaloOggi } from "@/lib/email/messaggi";
import { leggiGettone } from "@/lib/iscritti/gettone";
import { confermaIscritto } from "@/lib/iscritti/stato";
import { ritardiAeroporti } from "@/lib/osservatorio/ritardi";

/**
 * GET /api/iscriviti/conferma?g=<gettone>
 *
 * Il secondo passo del doppio opt-in: qui arriva chi ha cliccato il link
 * nell'email. Da questo momento è iscritto davvero, e gli parte il
 * benvenuto con dentro gli scali di oggi.
 *
 * Finisce SEMPRE su una pagina, mai su un JSON: chi clicca un link da
 * un'email è una persona con un browser aperto, non un programma.
 */

/** Quanti scali mettere nell'email: quattro entrano, dieci sono un elenco. */
const QUANTI = 4;

export async function GET(req: Request) {
  /* L'indirizzo pubblico, non quello interno del deploy: vedi lib/sito.ts. */
  const sito = versoCasa("/", req).origin;
  const gettone = new URL(req.url).searchParams.get("g") ?? "";
  const letto = leggiGettone(gettone, "conferma");

  if (!letto.ok) {
    const motivo = letto.motivo === "scaduto" ? "scaduto" : "guasto";
    return NextResponse.redirect(`${sito}/iscrizione?esito=${motivo}`, 303);
  }

  const segnato = await confermaIscritto(letto.email);
  if (!segnato.ok) {
    /* Il database non ha risposto: NON si dice "fatto". Si dice che
       riproveremo, e il link resta valido per trenta giorni. */
    return NextResponse.redirect(`${sito}/iscrizione?esito=riprova`, 303);
  }

  /* Gli scali di oggi dentro il benvenuto: chi si iscrive riceve subito
     una cosa utile. Se i dati non ci sono, l'email parte lo stesso senza
     la tabella: mai un'email bloccata da un contorno. */
  let scali: ScaloOggi[] = [];
  try {
    scali = (await ritardiAeroporti())
      .filter((r) => r.indice !== null)
      .slice(0, QUANTI)
      .map((r) => ({ nome: r.nome, indice: r.indice as number, medianaMinuti: r.medianaMinuti }));
  } catch (e) {
    console.warn("[conferma] scali non disponibili:", e);
  }

  const invio = await benvenutoLista(letto.email, scali);
  if (!invio.ok) console.warn("[conferma] benvenuto non spedito:", invio.motivo);

  return NextResponse.redirect(`${sito}/iscrizione?esito=fatto`, 303);
}
