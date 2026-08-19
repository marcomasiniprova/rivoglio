import { type NextRequest } from "next/server";
import { leggiGettone } from "@/lib/iscritti/gettone";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";

/**
 * STOP AI PROMEMORIA DI RECUPERO.
 *
 * Il link firmato in fondo alle email di recupero porta qui. Un clic e non
 * mandiamo più promemoria a quell'indirizzo (`recupero_stop = true` su tutte
 * le sue verifiche). Il diritto della persona resta valido: fermiamo solo le
 * email.
 *
 * Il gettone è firmato (HMAC): nessuno può disiscrivere un altro cambiando
 * una lettera nell'indirizzo. Vale 30 giorni, come gli altri link.
 */

export const dynamic = "force-dynamic";

function pagina(titolo: string, testo: string, stato = 200): Response {
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titolo} · Rivolio</title>
<style>
  body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f4f6f5;
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#0b2e21;padding:24px}
  .box{max-width:34rem;background:#fff;border:1px solid #e2e8e5;border-radius:20px;
    padding:36px 32px;box-shadow:0 18px 50px -30px rgba(5,46,31,.35);text-align:center}
  h1{font-size:1.5rem;margin:0 0 12px;letter-spacing:-0.02em}
  p{font-size:1rem;line-height:1.6;color:#4a5c55;margin:0 0 20px}
  a{display:inline-block;background:#067a46;color:#fff;text-decoration:none;
    padding:12px 22px;border-radius:12px;font-weight:600}
</style></head><body><div class="box">
  <h1>${titolo}</h1><p>${testo}</p>
  <a href="https://rivolio.it">Torna su Rivolio</a>
</div></body></html>`;
  return new Response(html, {
    status: stato,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const g = new URL(req.url).searchParams.get("g") ?? "";
  const letto = leggiGettone(g, "recupero");
  if (!letto.ok) {
    return pagina(
      "Link non valido",
      "Questo link non è più valido o è scaduto. Se non vuoi più i promemoria, scrivici rispondendo a una qualsiasi email e ce ne occupiamo noi.",
      400,
    );
  }

  if (SERVIZIO_ATTIVO) {
    try {
      await supabaseServizio()
        .from("verifiche")
        .update({ recupero_stop: true })
        .eq("email", letto.email);
    } catch {
      /* Se il salvataggio non riesce, non lo diciamo come un errore tecnico:
         meglio riprovare che mostrare una pagina rotta. Ma è raro. */
      return pagina(
        "Riprova tra poco",
        "Non siamo riusciti a registrare la richiesta in questo momento. Riprova aprendo di nuovo il link fra qualche minuto.",
        503,
      );
    }
  }

  return pagina(
    "Fatto, non ti scriviamo più",
    "Non riceverai altri promemoria su questo controllo. Il tuo diritto resta valido: quando vuoi, rifai il check su rivolio.it.",
  );
}
