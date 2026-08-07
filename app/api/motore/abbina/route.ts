import { NextResponse, type NextRequest } from "next/server";
import { abbinaEInvia, chiamataAutorizzata } from "@/lib/motore/esegui";

/**
 * Un giro di abbinamento: confronta le offerte ATTIVE con le ricerche e
 * manda le destinazioni (Telegram, poi email), scalando il credito.
 * La chiama un cron esterno, o il pannello admin per un giro a mano.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await abbinaEInvia();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 503 });
}
