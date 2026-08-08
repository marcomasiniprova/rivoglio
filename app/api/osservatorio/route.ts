import { NextResponse } from "next/server";
import { ritardiAeroporti } from "@/lib/osservatorio/ritardi";

/**
 * La striscia dell'Osservatorio: l'indice ritardi degli aeroporti
 * osservati (#25). La cache di 24 ore vive in lib/osservatorio/ritardi;
 * qui si risponde e basta. Lista vuota = la striscia non si mostra,
 * mai un errore in faccia all'utente.
 */
export async function GET() {
  const aeroporti = await ritardiAeroporti();
  return NextResponse.json(
    { ok: true, aeroporti },
    { headers: { "Cache-Control": "public, max-age=900, stale-while-revalidate=3600" } },
  );
}
