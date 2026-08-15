import { NextResponse } from "next/server";
import { CORS } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { SERVIZIO_ATTIVO } from "@/lib/supabase/servizio";
import { caricaPratica, transizionePratica } from "@/lib/pratiche/pratiche";
import { tin } from "@/lib/eventi/telegram";

/**
 * L'ESITO DELLA PRATICA, DICHIARATO DALL'UTENTE (Valerio, 15/08).
 *
 * 🔴 IL BUCO CHE VALERIO HA TROVATO: una pratica non aveva un traguardo.
 * Dopo l'invio si girava fra attesa e replica all'infinito, e non c'era
 * NESSUN modo per dire «la compagnia mi ha pagato» e chiudere. Per questo
 * la classifica (che legge le pratiche pagate) restava vuota, e l'utente
 * non vedeva mai la fine.
 *
 * Solo l'utente sa se i soldi sono arrivati sul suo conto: la compagnia
 * paga LUI, noi non vediamo il bonifico. Quindi è lui a dichiararlo.
 *  - "pagata"     → esito_pagata (vittoria): entra in classifica, si
 *                   festeggia, e gli chiediamo una recensione.
 *  - "non_pagata" → esito_rifiutata: la garanzia entra in gioco (gli
 *                   rimborsiamo i 14,90), e un avviso ci arriva sul
 *                   telefono per processarla.
 *
 * La scrittura la fa il server con la chiave di servizio (le transizioni
 * non passano MAI dal client), ma solo dopo aver controllato che la
 * pratica sia davvero sua.
 */
export const dynamic = "force-dynamic";

/** Solo da qui (reclamo già partito) ha senso dichiarare com'è finita. */
const DICHIARABILE = ["inviata", "sollecito", "enac"];
const GIA_CHIUSA = ["esito_pagata", "esito_rifiutata", "rimborsata"];

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request, contesto: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await contesto.params;
    const utente = await utenteDaRichiesta(req);
    if (!utente) {
      return NextResponse.json({ errore: "Devi essere collegato." }, { status: 401, headers: CORS });
    }
    if (!SERVIZIO_ATTIVO) {
      return NextResponse.json({ errore: "Il server non è configurato." }, { status: 503, headers: CORS });
    }

    let corpo: { esito?: unknown } = {};
    try {
      corpo = await req.json();
    } catch {
      return NextResponse.json({ errore: "Corpo non è JSON." }, { status: 400, headers: CORS });
    }
    const scelta = corpo.esito;
    if (scelta !== "pagata" && scelta !== "non_pagata") {
      return NextResponse.json({ errore: "Esito non valido." }, { status: 400, headers: CORS });
    }

    const pratica = await caricaPratica(id);
    // Non tua = inesistente: non si conferma nemmeno che l'id esista.
    if (!pratica || pratica.utente_id !== utente.id) {
      return NextResponse.json({ errore: "Pratica non trovata." }, { status: 404, headers: CORS });
    }
    if (GIA_CHIUSA.includes(pratica.stato)) {
      return NextResponse.json(
        { ok: true, stato: pratica.stato, nota: "Pratica già chiusa." },
        { headers: CORS },
      );
    }
    if (!DICHIARABILE.includes(pratica.stato)) {
      return NextResponse.json(
        { errore: "Prima segna il reclamo come inviato." },
        { status: 409, headers: CORS },
      );
    }

    if (scelta === "pagata") {
      const r = await transizionePratica(
        id,
        "esito_pagata",
        "L'utente ha dichiarato che la compagnia ha pagato la compensazione.",
      );
      if (!r.ok) {
        return NextResponse.json({ errore: "Non sono riuscito a salvare. Riprova." }, { status: 503, headers: CORS });
      }
      // Una vittoria vale un messaggio: il prodotto ha funzionato fino in fondo.
      void tin(
        `🎉 Pratica chiusa PAGATA. L'utente ha ricevuto la compensazione (fascia ${pratica.importo_fascia ?? "?"}€). Pratica ${id}.`,
      );
      return NextResponse.json({ ok: true, stato: "esito_pagata" }, { headers: CORS });
    }

    const r = await transizionePratica(
      id,
      "esito_rifiutata",
      "L'utente ha dichiarato che la compagnia non ha pagato: la garanzia entra in gioco.",
    );
    if (!r.ok) {
      return NextResponse.json({ errore: "Non sono riuscito a salvare. Riprova." }, { status: 503, headers: CORS });
    }
    // Garanzia da processare a mano: qualcuno deve rimborsare i 14,90.
    void tin(
      `⚠️ GARANZIA da valutare: l'utente dichiara che la compagnia NON ha pagato. Da controllare e rimborsare la pratica (14,90€). Pratica ${id}.`,
    );
    return NextResponse.json({ ok: true, stato: "esito_rifiutata" }, { headers: CORS });
  } catch (e) {
    console.error("[pratiche] dichiarazione esito, errore inatteso:", e);
    return NextResponse.json({ errore: "Errore inatteso. Riprova." }, { status: 500, headers: CORS });
  }
}
