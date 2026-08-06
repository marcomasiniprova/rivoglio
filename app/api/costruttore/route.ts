import { NextResponse } from "next/server";
import { costruisci, type Richiesta } from "@/lib/costruttore";
import type { Tipo } from "@/lib/destinazioni";

/**
 * ⚠️ Prezzo carburante: media nazionale self MIMIT del 06/08/2026.
 * VA COLLEGATO all'osservatorio MIMIT, che lo aggiorna ogni settimana.
 * Finché è scritto qui, è un valore che invecchia.
 */
const PREZZO_BENZINA = 1.994;

const TIPI: Tipo[] = ["mare", "monte", "citta", "terme"];

export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: "Richiesta non leggibile." }, { status: 400 });
  }

  const c = (corpo ?? {}) as Partial<Richiesta>;

  const partenza = String(c.partenza ?? "").trim();
  const budgetPersona = Number(c.budgetPersona);
  const notti = Number(c.notti);
  const persone = Number(c.persone);
  const oreMax = Number(c.oreMax);
  const tipi = Array.isArray(c.tipi) ? c.tipi.filter((t): t is Tipo => TIPI.includes(t)) : [];

  if (!partenza) {
    return NextResponse.json({ ok: false, motivo: "Dimmi da dove parti." }, { status: 400 });
  }
  if (!Number.isFinite(budgetPersona) || budgetPersona < 30 || budgetPersona > 2000) {
    return NextResponse.json(
      { ok: false, motivo: "Il budget deve stare fra 30 e 2000 euro a persona." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(notti) || notti < 1 || notti > 3) {
    return NextResponse.json({ ok: false, motivo: "Le notti vanno da 1 a 3." }, { status: 400 });
  }
  if (!Number.isFinite(persone) || persone < 1 || persone > 8) {
    return NextResponse.json({ ok: false, motivo: "Le persone vanno da 1 a 8." }, { status: 400 });
  }
  if (!Number.isFinite(oreMax) || oreMax < 0.5 || oreMax > 10) {
    return NextResponse.json(
      { ok: false, motivo: "Le ore di viaggio vanno da 0,5 a 10." },
      { status: 400 },
    );
  }

  const esito = costruisci({
    partenza,
    budgetPersona,
    notti,
    persone,
    tipi,
    oreMax,
    prezzoBenzina: PREZZO_BENZINA,
  });

  return NextResponse.json(esito, { status: esito.ok ? 200 : 200 });
}
