import { NextResponse } from "next/server";
import { utenteCollegato } from "@/lib/supabase/server";

/**
 * «SONO GIÀ ENTRATO?» — la domanda che la pagina d'attesa fa ogni pochi
 * secondi mentre aspetta che tu apra il link.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * A COSA SERVE (Valerio, 16/08: «clicco il link e mi apre una pagina nuova,
 * la vecchia resta lì. Vorrei una pagina sola: parte "ti ho mandato il
 * link", poi si aggiorna DA SOLA e mi fa entrare»).
 * ─────────────────────────────────────────────────────────────────────────
 * Il link nell'email lo apre il programma di posta, e quasi sempre in una
 * SCHEDA NUOVA: quella scheda fa il login e atterra su /app. La scheda
 * vecchia (dove sta scritto "ti ho mandato il link") non lo sa.
 *
 * Ma il cookie della sessione, appena la scheda nuova entra, vale per TUTTE
 * le schede dello stesso sito. Quindi la scheda vecchia può chiedere qui
 * "sono dentro adesso?" ogni tot secondi: appena la risposta è sì, si porta
 * dentro da sola. Nessuna libreria, nessun canale in tempo reale: una
 * domanda semplice a intervalli.
 *
 * `no-store` è obbligatorio: una risposta "no" messa in cache terrebbe la
 * pagina fuori anche dopo che sei entrato.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const utente = await utenteCollegato();
  return NextResponse.json(
    { dentro: Boolean(utente) },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
