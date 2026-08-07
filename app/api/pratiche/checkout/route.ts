import { NextResponse } from "next/server";
import { linkCheckout } from "@/lib/polar";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * GET /api/pratiche/checkout?verifica=<id>&tipo=singola|famiglia
 *
 * Il ponte fra il bottone d'acquisto e Polar. Esiste perché i checkout
 * link vivono negli env del server (lib/polar.ts): il client naviga qui
 * e questa rotta risponde con un redirect al link giusto, con l'id della
 * verifica agganciato come `reference_id` e l'email precompilata se c'è.
 *
 * Cancelli, in ordine:
 * - id "demo-..." → si torna alla pagina con l'avviso onesto: sugli
 *   esempi dimostrativi non si vende niente (regola 3 del progetto);
 * - id che non è un UUID → home, non c'è una pagina a cui tornare;
 * - esito diverso da "idoneo" o verdetto in shadow (`in_attesa`) →
 *   si torna alla pagina, che spiega da sola. MAI vendere sul giallo
 *   (SPEC §4): il cancello sta anche qui, non solo nel webhook;
 * - link Polar non configurato → avviso "non-attivo".
 *
 * L'email della verifica si legge SOLO qui, lato server, per
 * precompilare il checkout: al client non arriva mai.
 */

const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEMO_OK = /^demo-[a-z0-9]{2,8}-[0-9]{4}-[0-9]{2}-[0-9]{2}$/i;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("verifica") ?? "";
  const tipo = url.searchParams.get("tipo") === "famiglia" ? "famiglia" : "singola";

  // L'id entra in un Location header: si costruisce l'URL SOLO dopo che
  // il formato è riconosciuto (UUID o demo), mai da testo libero.
  const paginaRisultato = (coda?: "demo" | "non-attivo" | "errore") =>
    NextResponse.redirect(
      new URL(`/verifica/${id}${coda ? `?checkout=${coda}` : ""}`, url.origin),
    );

  if (DEMO_OK.test(id)) return paginaRisultato("demo");
  if (!UUID_OK.test(id)) return NextResponse.redirect(new URL("/", url.origin));

  if (!SERVIZIO_ATTIVO) return paginaRisultato("non-attivo");

  try {
    const db = supabaseServizio();
    const { data: verifica, error } = await db
      .from("verifiche")
      .select("id, esito, conferma, email")
      .eq("id", id)
      .maybeSingle<{
        id: string;
        esito: string;
        conferma: string;
        email: string | null;
      }>();
    if (error) throw new Error(error.message);

    // Verifica inesistente: la pagina del risultato sa dirlo meglio di noi.
    if (!verifica) return paginaRisultato();

    // Si vende SOLO un idoneo confermato (o fuori shadow). Tutto il resto
    // torna alla pagina, che mostra lo stato giusto senza bottoni.
    if (verifica.esito !== "idoneo" || verifica.conferma === "in_attesa") {
      return paginaRisultato();
    }

    const link = linkCheckout(tipo, verifica.id, verifica.email);
    if (!link) return paginaRisultato("non-attivo");

    return NextResponse.redirect(link);
  } catch (e) {
    console.error("[checkout] redirect verso Polar fallito:", e);
    return paginaRisultato("errore");
  }
}
