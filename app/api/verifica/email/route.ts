import { NextResponse } from "next/server";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * POST /api/verifica/email  {id, email}
 *
 * La cattura DOPO il reveal (SPEC §3, passo 4: prima il verdetto, POI
 * l'email "ti salvo la pratica"). Aggancia l'indirizzo alla verifica già
 * fatta: chi conosce l'id (un UUID casuale che riceve solo chi ha fatto
 * il check) può scriverci sopra la propria email, nient'altro.
 */

/** Controllo volutamente permissivo: meglio un'email strana che perderne una buona. */
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "Richiesta non leggibile." }, { status: 400 });
  }

  const { id, email } = (corpo ?? {}) as { id?: unknown; email?: unknown };
  if (typeof id !== "string" || !UUID_OK.test(id)) {
    return NextResponse.json(
      { ok: false, errore: "Manca l'identificativo della verifica." },
      { status: 400 },
    );
  }
  const pulita = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!EMAIL_OK.test(pulita)) {
    return NextResponse.json(
      { ok: false, errore: "Controlla l'indirizzo email: non mi torna." },
      { status: 400 },
    );
  }

  if (!SERVIZIO_ATTIVO) {
    return NextResponse.json(
      { ok: false, errore: "Il salvataggio ora non è disponibile. Riprova fra poco." },
      { status: 503 },
    );
  }

  try {
    const sb = supabaseServizio();
    const { data, error } = await sb
      .from("verifiche")
      .update({ email: pulita })
      .eq("id", id)
      /* ⚠️ SI SCRIVE UNA VOLTA SOLA. Prima bastava conoscere l'id per
         RIscrivere l'email agganciata a una verifica, e quell'id gira
         (sta nell'indirizzo /verifica/<id>, che si condivide e finisce
         nella cronologia del browser). Chi ne avesse trovato uno poteva
         sostituire l'indirizzo di quella persona col proprio e
         intercettare gli avvisi sulla sua pratica.
         Adesso l'email si aggiunge se non c'e'; per cambiarla si rifa'
         il check, che e' un'operazione di mezzo minuto. Trovato
         dall'ispezione del 12/08.
         ⚠️ Qui prima c'era scritto anche quanto costa, e una prova l'ha
         bocciato avendo ragione: il prezzo dell'analisi segue
         l'interruttore e non si scrive a mano da nessuna parte, nemmeno
         in un commento. Il giorno che l'interruttore si accende, una
         riga che dice il contrario e' il modo in cui l'errore rientra
         dalla finestra. */
      .is("email", null)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      /* Zero righe aggiornate vuol dire due cose: la verifica non
         esiste, oppure un'email c'era gia'. Non si distinguono nella
         risposta di proposito: dire "c'e' gia' un'email" a chi prova un
         id a caso gli conferma che quella verifica esiste. */
      return NextResponse.json(
        { ok: false, errore: "Non ho potuto salvare questa email su questa verifica." },
        { status: 404 },
      );
    }
  } catch (e) {
    console.error("[verifica/email] salvataggio fallito:", e);
    return NextResponse.json(
      { ok: false, errore: "Non sono riuscito a salvare l'email. Riprova fra un attimo." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
