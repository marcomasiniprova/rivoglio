import { NextResponse } from "next/server";
import { ipDi, oltreIlLimite } from "@/lib/api/limite";
import { soloIlDominio, traccia } from "@/lib/eventi/registra";

/**
 * «QUALCUNO È ARRIVATO SUL SITO.»
 *
 * È il primo gradino dell'imbuto, e senza di lui non si sa niente di
 * quello che conta durante una distribuzione: quante persone il video ha
 * portato, e quante di quelle hanno poi provato un'analisi.
 *
 * ⚠️ PERCHÉ UNA ROTTA E NON UNA RIGA NELLA PAGINA. Contare la visita
 * mentre si costruisce la pagina significa scrivere nel database PRIMA
 * di mostrare qualcosa, cioè far aspettare la persona per un numero che
 * serve a noi. Così invece il browser manda un messaggio quando la
 * pagina è già davanti agli occhi, e se non parte non se ne accorge
 * nessuno.
 *
 * ⚠️ COSA ARRIVA QUI: il dominio da cui è arrivata la persona (tiktok.com)
 * e quale nostra pagina ha aperto. Non l'indirizzo pieno del video, non
 * l'IP, niente che permetta di riconoscerla domani.
 */
export const dynamic = "force-dynamic";

/* Una persona apre qualche pagina, non cento al minuto: sopra questo
   tetto è un ciclo automatico e non va contato come pubblico. */
const MASSIMO_AL_MINUTO = 30;

/** Solo un percorso del nostro sito, corto. Mai una stringa qualsiasi. */
function paginaPulita(v: unknown): string | null {
  if (typeof v !== "string" || !v.startsWith("/")) return null;
  return v.split("?")[0].slice(0, 120);
}

export async function POST(req: Request) {
  if (oltreIlLimite("visita", ipDi(req), MASSIMO_AL_MINUTO)) {
    return new Response(null, { status: 204 });
  }

  let corpo: unknown = null;
  try {
    corpo = await req.json();
  } catch {
    /* `sendBeacon` può mandare un corpo vuoto: non è un errore, si
       registra la visita senza dettagli. */
  }
  const { da, pagina } = (corpo ?? {}) as { da?: unknown; pagina?: unknown };

  traccia(req, {
    tipo: "visita",
    /* La provenienza la dice il browser (`document.referrer`), non
       l'intestazione: qui il referer sarebbe sempre il nostro sito. */
    provenienza: soloIlDominio(typeof da === "string" ? da : null),
    extra: { pagina: paginaPulita(pagina) },
  });

  /* 204: niente da dire, e il browser non deve leggere niente. */
  return new NextResponse(null, { status: 204 });
}
