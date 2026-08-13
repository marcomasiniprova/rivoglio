import { NextResponse, type NextRequest } from "next/server";
import { CORS } from "@/lib/api/limite";
import { utenteDaRichiesta } from "@/lib/api/utente";
import { caricaPratica, eventiPratica, registraEvento } from "@/lib/pratiche/pratiche";
import { EVENTO_REPLICA_INVIATA, giriDiNo } from "@/lib/pratiche/passi";

/**
 * «HO MANDATO LA REPLICA»: l'azione che chiudeva il vicolo cieco.
 *
 * 🔴 Valerio, 13/08: «stranamente gli ultimi passi ti blocchi al passo 4,
 * perché dici solo il primo no e poi basta: non c'è possibilità dopo la
 * prima controproposta di un altro no».
 *
 * Il percorso sapeva che la compagnia aveva detto no, preparava la
 * replica, e finiva lì per sempre: non esisteva nessun gesto che dicesse
 * «l'ho mandata», quindi la pagina restava ferma sulla replica anche
 * dopo, e un secondo no non aveva dove andare.
 *
 * Questa rotta registra il gesto. Da lì la palla torna alla compagnia,
 * riparte l'attesa, e il riquadro «hanno risposto no?» si riapre per il
 * giro successivo. I giri sono illimitati (scelta di Valerio col popup):
 * dal secondo in poi compaiono anche ente e conciliazione, insieme alla
 * replica e non al posto suo.
 */
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const utente = await utenteDaRichiesta(req);
  if (!utente) {
    return NextResponse.json(
      { ok: false, errore: "Devi entrare per aggiornare la pratica." },
      { status: 401, headers: CORS },
    );
  }

  /* `caricaPratica` legge con la chiave di servizio, che salta le regole
     di riga: il "questa pratica è tua" va fatto qui a mano. 404 e non
     403, per non confermare che quell'id esiste. */
  const pratica = await caricaPratica(id);
  if (!pratica || pratica.utente_id !== utente.id) {
    return NextResponse.json(
      { ok: false, errore: "Pratica non trovata." },
      { status: 404, headers: CORS },
    );
  }

  /* ⚠️ NON SI CHIUDE UN GIRO CHE NON È APERTO. Senza questo controllo un
     doppio clic, o due schede aperte, scriverebbero due repliche mandate
     su un solo no: il conto andrebbe in negativo e il percorso salterebbe
     un passo. Idempotente per costruzione. */
  const giri = giriDiNo(await eventiPratica(id));
  if (giri.no <= giri.replicheMandate) {
    return NextResponse.json(
      { ok: true, nota: "Nessuna replica da confermare.", giri },
      { headers: CORS },
    );
  }

  await registraEvento(
    id,
    EVENTO_REPLICA_INVIATA,
    `Replica al ${giri.replicheMandate + 1}° no inviata alla compagnia.`,
  );

  return NextResponse.json(
    { ok: true, giri: { no: giri.no, replicheMandate: giri.replicheMandate + 1 } },
    { headers: CORS },
  );
}
