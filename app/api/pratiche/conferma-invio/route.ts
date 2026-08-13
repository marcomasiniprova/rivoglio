import { NextResponse, type NextRequest } from "next/server";
import { CORS } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { caricaPratica, registraEvento, transizionePratica, type Pratica } from "@/lib/pratiche/pratiche";
import { POSTA_ATTIVA } from "@/lib/email/posta";
import { invioConfermato } from "@/lib/email/pratiche";
import { linkDiIngresso } from "@/lib/pratiche/ingresso";
import { GIORNI_PRIMA_DEL_SOLLECITO } from "@/lib/pratiche/rifiuto";

/**
 * "L'ho inviata": l'utente conferma di aver spedito il reclamo alla
 * compagnia dalla sua email. La pratica passa a `inviata` e da quel
 * giorno partono i tempi della sequenza (sollecito T+15, ENAC T+30,
 * garanzia T+60): per questo `inviata_il` è il dato che conta qui.
 *
 * Autenticato con la sessione dell'utente (cookie dal sito, Bearer
 * dall'app); la scrittura la fa il server con la chiave di servizio
 * (le transizioni non passano MAI dal client), ma solo dopo aver
 * controllato che la pratica sia davvero sua.
 */
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/** Da questi stati in poi l'invio risulta già registrato: niente da fare. */
const GIA_OLTRE = ["inviata", "sollecito", "enac", "esito_pagata", "esito_rifiutata", "rimborsata"];

export async function POST(req: NextRequest) {
  try {
    const utente = await utenteDaRichiesta(req);
    if (!utente) {
      return NextResponse.json({ errore: "Devi essere collegato." }, { status: 401, headers: CORS });
    }
    if (!SERVIZIO_ATTIVO) {
      return NextResponse.json({ errore: "Il server non è configurato." }, { status: 503, headers: CORS });
    }

    let corpo: { pratica_id?: unknown; praticaId?: unknown } = {};
    try {
      corpo = await req.json();
    } catch {
      return NextResponse.json({ errore: "Corpo non è JSON." }, { status: 400, headers: CORS });
    }
    const id = corpo.pratica_id ?? corpo.praticaId;
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ errore: "Manca pratica_id." }, { status: 400, headers: CORS });
    }

    const pratica = await caricaPratica(id);
    // Non tua = inesistente: non si conferma nemmeno che l'id esista.
    if (!pratica || pratica.utente_id !== utente.id) {
      return NextResponse.json({ errore: "Pratica non trovata." }, { status: 404, headers: CORS });
    }

    if (GIA_OLTRE.includes(pratica.stato)) {
      return NextResponse.json(
        { ok: true, stato: pratica.stato, nota: "Invio già registrato." },
        { headers: CORS },
      );
    }
    if (pratica.stato === "creata") {
      return NextResponse.json({ errore: "La pratica non risulta pagata." }, { status: 409, headers: CORS });
    }

    const inviataIl = new Date().toISOString();
    const esito = await transizionePratica(
      id,
      "inviata",
      "L'utente ha confermato di aver inviato il reclamo alla compagnia.",
      { inviata_il: inviataIl },
    );
    if (!esito.ok) {
      console.error(`[pratiche] conferma invio fallita per ${id}: ${esito.motivo}`);
      return NextResponse.json({ errore: "Non sono riuscito a salvare. Riprova." }, { status: 503, headers: CORS });
    }

    /* LA RICEVUTA DI QUEL GESTO (scelta di Valerio col popup, 12/08).
       Prima qui finiva tutto: la pratica cambiava stato e il cliente
       restava senza niente in mano, proprio all'inizio dell'attesa più
       lunga del percorso.
       ⚠️ Non si aspetta e non si blocca niente: se l'email non parte,
       l'invio resta registrato lo stesso. Il dato che conta è
       `inviata_il`, ed è già scritto. */
    void confermaInvioPerEmail(pratica, inviataIl);

    return NextResponse.json({ ok: true, stato: "inviata" }, { headers: CORS });
  } catch (e) {
    console.error("[pratiche] conferma invio, errore inatteso:", e);
    return NextResponse.json({ errore: "Errore inatteso. Riprova." }, { status: 500, headers: CORS });
  }
}

/**
 * L'email che dice "registrato, adesso tocca a loro".
 *
 * Non lancia mai: un guasto alla posta non deve far sembrare fallito un
 * invio che invece è stato registrato. Il giorno del sollecito si conta
 * dalla costante vera, non da un numero scritto qui.
 */
async function confermaInvioPerEmail(pratica: Pratica, inviataIl: string): Promise<void> {
  try {
    if (!POSTA_ATTIVA || !pratica.email) return;
    const giorno = new Date(
      Date.parse(inviataIl) + GIORNI_PRIMA_DEL_SOLLECITO * 86_400_000,
    ).toISOString();
    /* Il numero del volo sta sulla riga del volo, non su quella della
       pratica: si legge qui, e se non si legge l'email parte lo stesso
       con una formula generica invece di non partire. */
    let volo = "il tuo volo";
    if (pratica.volo_id) {
      const { data } = await supabaseServizio()
        .from("voli")
        .select("volo_iata")
        .eq("id", pratica.volo_id)
        .maybeSingle();
      const iata = (data as { volo_iata?: string | null } | null)?.volo_iata;
      if (iata) volo = iata;
    }

    const link = await linkDiIngresso(pratica.email, `/pratica/${pratica.id}`);
    const spedita = await invioConfermato(pratica.email, {
      volo,
      dataInvio: inviataIl,
      giornoSollecito: giorno,
      link,
    });
    if (spedita.ok) {
      await registraEvento(pratica.id, "email_invio", "Email di conferma dell'invio inviata.");
    } else {
      console.error(`[pratiche] email di conferma invio non partita: ${spedita.motivo}`);
    }
  } catch (e) {
    console.error("[pratiche] email di conferma invio fallita:", e);
  }
}
