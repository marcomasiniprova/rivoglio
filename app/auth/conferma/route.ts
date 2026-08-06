import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";

/**
 * Dove atterra chi clicca il link ricevuto per email (conferma o link magico).
 *
 * Supabase manda `token_hash` e `type`: qui si scambiano con una sessione vera
 * e si scrive il cookie. Senza questa pagina il link nell'email non porta da
 * nessuna parte.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const token_hash = p.get("token_hash");
  const type = p.get("type") as EmailOtpType | null;

  // stesso controllo anti open-redirect delle azioni di login
  const grezzo = p.get("poi") ?? "/app";
  const poi = grezzo.startsWith("/") && !grezzo.startsWith("//") ? grezzo : "/app";

  const fallito = new URL("/entra", request.url);
  fallito.searchParams.set("errore", "link");

  if (!SUPABASE_CONFIGURATO || !token_hash || !type) {
    return NextResponse.redirect(fallito);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) return NextResponse.redirect(fallito);

  return NextResponse.redirect(new URL(poi, request.url));
}
