import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";

/**
 * Dove atterra chi clicca il link ricevuto per email.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PERCHÉ PRIMA DICEVA "LINK SCADUTO" DOPO QUATTRO SECONDI
 * ─────────────────────────────────────────────────────────────────────────
 * Il link nell'email di Supabase NON porta qui: porta al LORO indirizzo
 * `/auth/v1/verify`. Loro consumano il codice, e poi rimbalzano l'utente
 * verso `redirect_to`. In quel rimbalzo il `token_hash` NON c'è più.
 *
 * Questa pagina cercava solo `token_hash`, non lo trovava, e concludeva
 * "link scaduto". Il link era validissimo: era già stato usato da Supabase
 * un istante prima. Un messaggio giusto per la domanda sbagliata.
 *
 * Ora si accettano TUTTE E TRE le forme in cui una sessione può arrivare:
 *   1. `token_hash` + `type`  → link diretto qui (serve cambiare il modello
 *                               email su Supabase, o passare dal nostro
 *                               gancio Resend)
 *   2. `code`                 → rimbalzo da Supabase con scambio PKCE
 *   3. `#access_token=...`    → rimbalzo vecchio stile: i dati stanno nel
 *                               frammento, che al server NON arriva mai.
 *                               Lo raccoglie una paginetta lato browser.
 * E si distingue un link davvero scaduto da un errore di configurazione,
 * perché sono due problemi diversi con due soluzioni diverse.
 */

/** Solo percorsi interni: senza questo, `poi=//sito-cattivo.it` ti spedisce fuori. */
function destinazioneSicura(grezzo: string | null): string {
  const p = grezzo ?? "/app";
  return p.startsWith("/") && !p.startsWith("//") ? p : "/app";
}

function fallito(request: NextRequest, motivo: string) {
  const u = new URL("/entra", request.url);
  u.searchParams.set("errore", motivo);
  return NextResponse.redirect(u);
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const poi = destinazioneSicura(p.get("poi") ?? p.get("next"));

  if (!SUPABASE_CONFIGURATO) return fallito(request, "configurazione");

  // Supabase può rimbalzare con un errore esplicito: si riporta quello,
  // invece di indovinare.
  const erroreSupabase = p.get("error_code") ?? p.get("error");
  if (erroreSupabase) {
    const descrizione = p.get("error_description") ?? "";
    console.error(`[conferma] Supabase: ${erroreSupabase} ${descrizione}`);
    return fallito(
      request,
      /expired|otp_expired/i.test(erroreSupabase + descrizione) ? "scaduto" : "link",
    );
  }

  const supabase = await supabaseServer();

  // ---- forma 1: token_hash + type (la strada che vogliamo)
  const token_hash = p.get("token_hash");
  const type = p.get("type") as EmailOtpType | null;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      console.error("[conferma] verifyOtp:", error.message);
      return fallito(request, /expired/i.test(error.message) ? "scaduto" : "link");
    }
    return NextResponse.redirect(new URL(poi, request.url));
  }

  // ---- forma 2: code (rimbalzo da Supabase)
  const code = p.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[conferma] exchangeCodeForSession:", error.message);
      return fallito(request, /expired/i.test(error.message) ? "scaduto" : "link");
    }
    return NextResponse.redirect(new URL(poi, request.url));
  }

  /* ---- forma 3: i dati stanno nel frammento (#access_token=...).
     Il frammento NON viene mai mandato al server: solo il browser lo vede.
     Serve una paginetta che lo legga e lo rispedisca qui come parametri.
     Senza questa, chi arriva così vedeva "scaduto" per sempre. */
  return new NextResponse(
    `<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>Un attimo…</title>
<style>
  body{margin:0;height:100dvh;display:grid;place-items:center;background:#f6f8fa;
       font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#6b7280}
  .p{text-align:center}
  .c{width:34px;height:34px;margin:0 auto 16px;border:3px solid #e4e9ee;
     border-top-color:#0a9d5c;border-radius:50%;animation:g .8s linear infinite}
  @keyframes g{to{transform:rotate(360deg)}}
</style></head><body>
<div class="p"><div class="c"></div><p>Ti sto facendo entrare…</p></div>
<script>
(function(){
  var f = new URLSearchParams(location.hash.replace(/^#/, ""));
  var poi = ${JSON.stringify(poi)};
  if (f.get("access_token")) {
    // rigiro i dati al server come parametri normali
    var q = new URLSearchParams({
      access_token: f.get("access_token"),
      refresh_token: f.get("refresh_token") || "",
      poi: poi
    });
    location.replace("/auth/sessione?" + q.toString());
  } else if (f.get("error_description") || f.get("error")) {
    location.replace("/entra?errore=" +
      (/expired/i.test(f.get("error_description") || "") ? "scaduto" : "link"));
  } else {
    location.replace("/entra?errore=link");
  }
})();
</script></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
