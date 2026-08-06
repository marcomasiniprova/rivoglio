import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";

/**
 * L'ultimo pezzo del rimbalzo vecchio stile.
 *
 * Supabase, in quella forma, mette i dati della sessione nel FRAMMENTO
 * dell'indirizzo (`#access_token=...`). Il frammento non viaggia mai fino al
 * server: lo vede solo il browser. La paginetta in `/auth/conferma` lo legge
 * e lo rimanda qui come parametri normali; qui si trasforma in un cookie
 * vero, che è l'unica forma che i Server Component sanno leggere.
 *
 * Perché non fare tutto nel browser: una sessione che vive solo lato client
 * non protegge `/app`, perché il controllo lo fa il server. Il giro sembra
 * lungo ma è l'unico che chiude davvero la porta.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const access_token = p.get("access_token");
  const refresh_token = p.get("refresh_token");

  const grezzo = p.get("poi") ?? "/app";
  const poi = grezzo.startsWith("/") && !grezzo.startsWith("//") ? grezzo : "/app";

  if (!SUPABASE_CONFIGURATO || !access_token || !refresh_token) {
    const u = new URL("/entra", request.url);
    u.searchParams.set("errore", "link");
    return NextResponse.redirect(u);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });

  if (error) {
    console.error("[sessione] setSession:", error.message);
    const u = new URL("/entra", request.url);
    u.searchParams.set("errore", /expired/i.test(error.message) ? "scaduto" : "link");
    return NextResponse.redirect(u);
  }

  return NextResponse.redirect(new URL(poi, request.url));
}
