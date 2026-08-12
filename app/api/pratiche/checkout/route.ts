import { NextResponse, type NextRequest } from "next/server";
import { inCollaudo } from "@/lib/check/cancello";
import { linkCheckout } from "@/lib/polar";
import { COOKIE_PREZZO, TEST_DUE_PREZZI, varianteValida } from "@/lib/prezzi";
import { traccia } from "@/lib/eventi/registra";
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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("verifica") ?? "";
  const tipo = url.searchParams.get("tipo") === "famiglia" ? "famiglia" : "singola";

  // L'id entra in un Location header: si costruisce l'URL SOLO dopo che
  // il formato è riconosciuto (UUID o demo), mai da testo libero.
  const paginaRisultato = (coda?: "demo" | "non-attivo" | "errore" | "recesso") =>
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
      .select("id, esito, conferma, email, rinuncia_recesso_il")
      .eq("id", id)
      .maybeSingle<{
        id: string;
        esito: string;
        conferma: string;
        email: string | null;
        rinuncia_recesso_il: string | null;
      }>();
    if (error) throw new Error(error.message);

    // Verifica inesistente: la pagina del risultato sa dirlo meglio di noi.
    if (!verifica) return paginaRisultato();

    // Si vende SOLO un idoneo confermato (o fuori shadow). Tutto il resto
    // torna alla pagina, che mostra lo stato giusto senza bottoni.
    if (verifica.esito !== "idoneo" || verifica.conferma === "in_attesa") {
      return paginaRisultato();
    }

    /* #21: senza la spunta di rinuncia al recesso (art. 59 Cod. Consumo),
       registrata da /api/pratiche/recesso, non si va a Polar. Vale anche
       per chi arriva con l'URL diretto: il cancello sta sul server. */
    if (!verifica.rinuncia_recesso_il) return paginaRisultato("recesso");

    /* Il prezzo che questa persona ha visto da quando è arrivata: il
       cookie lo scrive il proxy alla prima visita. Se manca (o è sporco)
       si serve il listino di sempre.
       ⚠️ COL TEST SPENTO IL COOKIE SI IGNORA, e non è pignoleria: quel
       cookie dura sei mesi, quindi chi l'ha preso quando il test era
       acceso leggerebbe 14,90 sulla landing e si troverebbe 24,90 alla
       cassa. Un prezzo che cambia fra il bottone e il pagamento non è un
       dettaglio: è il motivo per cui uno chiude la pagina. */
    const variante =
      (TEST_DUE_PREZZI ? varianteValida(req.cookies.get(COOKIE_PREZZO)?.value) : null) ?? "a";
    const link = linkCheckout(tipo, verifica.id, verifica.email, variante);
    /* ⚠️ SENZA VENDITORE, IL COLLAUDATORE PASSA DALLA CASSA DI PROVA.
       Finche' non c'e' Polar (o chi per lui) questo bottone finisce in un
       vicolo cieco, e tutto quello che viene DOPO il pagamento (i quattro
       fogli, il no della compagnia, la replica, la conciliazione) non lo
       puo' vedere nessuno: e' meta' del prodotto che vale i soldi.
       Solo per il browser che porta la chiave del collaudatore, e solo
       sui voli dimostrativi: il controllo vero sta dentro la rotta. */
    if (!link) {
      if (inCollaudo(req)) {
        return NextResponse.redirect(
          new URL(`/api/pratiche/prova?verifica=${verifica.id}&tipo=${tipo}`, url.origin),
        );
      }
      return paginaRisultato("non-attivo");
    }

    /* «Ha aperto la pratica»: da qui in poi la persona è alla cassa. La
       distanza fra questo numero e quello dei pagamenti è la cosa più
       importante del cruscotto, perché è l'unico punto dove si perde
       gente che aveva già deciso di pagare. */
    traccia(req, { tipo: "pratica", extra: { tipo, variante } });

    return NextResponse.redirect(link);
  } catch (e) {
    console.error("[checkout] redirect verso Polar fallito:", e);
    return paginaRisultato("errore");
  }
}
