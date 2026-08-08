import { NextResponse } from "next/server";
import { leggiGettone } from "@/lib/iscritti/gettone";
import { disdiciIscritto } from "@/lib/iscritti/stato";

/**
 * GET /api/iscriviti/disdetta?g=<gettone>
 *
 * "Si annulla con un clic" è scritto sulla landing: questo è il clic.
 * Un clic solo, senza far entrare nessuno da nessuna parte e senza
 * chiedere il motivo. Chiedere perché se ne va è il modo migliore per
 * far sì che se ne vada arrabbiato.
 *
 * La riga NON si cancella: si marca. Cancellarla vorrebbe dire perdere
 * la prova del consenso e riscrivere alla stessa persona il mese dopo.
 */
export async function GET(req: Request) {
  const sito = new URL(req.url).origin;
  const gettone = new URL(req.url).searchParams.get("g") ?? "";
  const letto = leggiGettone(gettone, "disdetta");

  if (!letto.ok) return NextResponse.redirect(`${sito}/iscrizione?esito=guasto`, 303);

  const segnato = await disdiciIscritto(letto.email);
  return NextResponse.redirect(
    `${sito}/iscrizione?esito=${segnato.ok ? "disdetto" : "riprova"}`,
    303,
  );
}
