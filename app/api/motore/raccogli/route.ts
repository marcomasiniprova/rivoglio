import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata, raccogliLotto } from "@/lib/motore/esegui";

/**
 * Un giro di raccolta. La chiama un cron esterno (o il pannello admin).
 * Ogni chiamata scandaglia il lotto successivo di mete e riparte da dove
 * si era fermata: il cursore sta in `motore_stato`.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await raccogliLotto();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 503 });
}
