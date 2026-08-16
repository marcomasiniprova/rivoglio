import { NextResponse } from "next/server";
import { CORS } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { SERVIZIO_ATTIVO } from "@/lib/supabase/servizio";
import { caricaPratica, eventiPratica, transizionePratica } from "@/lib/pratiche/pratiche";
import { EVENTO_RIFIUTO_DOCUMENTO } from "@/lib/pratiche/dossier";
import { EVENTO_REPLICA_INVIATA } from "@/lib/pratiche/passi";
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
 * 🔴 ANTI-FRODE (Valerio, 15/08): non possiamo vedere il conto di nessuno,
 * quindi «non mi hanno pagato» detto e basta non è verificabile: uno
 * potrebbe essere stato pagato dalla compagnia (250-600€) e chiedere ANCHE
 * il rimborso dei 14,90 dicendo di no. Per questo la garanzia NON scatta
 * più sulla parola: scatta solo se c'è un NO SCRITTO della compagnia
 * registrato sulla pratica (`rifiuto_motivo`), che leggiamo noi. Chi è
 * stato pagato non ha un rifiuto da mostrare, quindi non ha niente da
 * farsi rimborsare. Il controllo sta QUI sul server, non solo nella UI:
 * un POST diretto senza rifiuto registrato viene rifiutato.
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

    /* 🔴 IL PALETTO ANTI-FRODE: la garanzia scatta solo con un NO scritto
       della compagnia già registrato. Senza, si rimanda a registrarlo: è
       lì che il rimborso trova il suo appiglio verificabile. */
    if (!(pratica as { rifiuto_motivo?: string | null }).rifiuto_motivo) {
      return NextResponse.json(
        {
          errore:
            "Per la garanzia serve prima il no scritto della compagnia: registralo qui sopra («Mi hanno risposto no»), lo leggiamo noi.",
        },
        { status: 409, headers: CORS },
      );
    }

    /* 🔴 E IL NO DEVE VENIRE DA UN DOCUMENTO VERO, non da testo scritto a
       mano (Valerio, 15/08: «metto testo semplice e mi dà il rimborso»).
       Uno potrebbe essere stato pagato dalla compagnia e inventarsi un no.
       La garanzia parte solo se la loro risposta è stata CARICATA come
       foto/email (evento EVENTO_RIFIUTO_DOCUMENTO), che poi controlliamo. */
    const eventi = await eventiPratica(id);
    if (!eventi.some((e) => e.tipo === EVENTO_RIFIUTO_DOCUMENTO)) {
      return NextResponse.json(
        {
          errore:
            "Per la garanzia serve la risposta VERA della compagnia: carica la foto o l'email del loro no («Carica lo screenshot»). Il testo scritto a mano prepara la replica, ma non basta per il rimborso.",
        },
        { status: 409, headers: CORS },
      );
    }

    /* 🔴 IL RIMBORSO È L'ULTIMA SPIAGGIA, NON LA PRIMA (Valerio, 16/08: «se
       è il primo no rimborsiamo già? deve arrivare DOPO aver combattuto»).
       Prima di restituire i 14,90 la persona deve aver MANDATO la replica
       al loro no: spessissimo il no cade proprio lì (stavano solo misurando
       il ritardo alla partenza invece che all'arrivo). Solo se dopo la
       replica non pagano lo stesso la garanzia entra in gioco. Il controllo
       sta anche qui sul server, non solo nella UI. */
    if (!eventi.some((e) => e.tipo === EVENTO_REPLICA_INVIATA)) {
      return NextResponse.json(
        {
          errore:
            "Il rimborso è l'ultima spiaggia: prima manda la replica al loro no (spesso basta quella). Se dopo la replica non pagano lo stesso, allora la garanzia scatta.",
        },
        { status: 409, headers: CORS },
      );
    }

    const r = await transizionePratica(
      id,
      "esito_rifiutata",
      "L'utente ha dichiarato che la compagnia non ha pagato: la garanzia entra in gioco (con un no scritto registrato).",
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
