import { NextResponse, type NextRequest } from "next/server";
import { utenteCollegato } from "@/lib/supabase/server";
import { caricaPratica, eventiPratica, registraEvento } from "@/lib/pratiche/pratiche";
import { EVENTO_SALTATO, letteraSbloccata } from "@/lib/pratiche/documenti";

/**
 * «Non ho i documenti adesso»: la porta di servizio del passo 1.
 *
 * Dal 12/08 la lettera si apre solo dopo aver caricato la carta
 * d'imbarco (scelta di Valerio col popup). Ma il cliente a quel punto ha
 * già pagato, e chi la carta d'imbarco non ce l'ha resterebbe chiuso
 * fuori da un prodotto comprato. Questa rotta segna la scelta e sblocca.
 *
 * Non c'è niente da mandare nel corpo: è un gesto, non un dato. La
 * scelta resta scritta nella cronologia, così se un domani la compagnia
 * contesta i fatti si sa che i documenti non erano stati allegati.
 */
export async function POST(
  _richiesta: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const utente = await utenteCollegato();
  if (!utente) {
    return NextResponse.json({ errore: "Entra per continuare." }, { status: 401 });
  }
  /* Stesso controllo delle rotte sorelle: `caricaPratica` legge con la
     chiave di servizio, che salta le regole di riga, quindi il "questa
     pratica è tua" va fatto qui a mano. 404 e non 403: dire "non è tua"
     confermerebbe che quella pratica esiste. */
  const pratica = await caricaPratica(id);
  if (!pratica || pratica.utente_id !== utente.id) {
    return NextResponse.json({ errore: "Pratica non trovata." }, { status: 404 });
  }

  /* Due clic sullo stesso bottone non scrivono due righe uguali nella
     cronologia: chi ricarica la pagina non deve vedere il suo dubbio
     stampato due volte. */
  const eventi = await eventiPratica(id);
  if (!letteraSbloccata(eventi)) {
    await registraEvento(
      id,
      EVENTO_SALTATO,
      "Il passeggero ha dichiarato di non avere i documenti del volo al momento. La lettera è stata sbloccata lo stesso.",
    );
  }

  return NextResponse.json({ ok: true });
}
