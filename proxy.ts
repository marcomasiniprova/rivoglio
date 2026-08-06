import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { CHIAVE_PUBBLICA, SUPABASE_CONFIGURATO, URL_SUPABASE } from "@/lib/supabase/chiavi";

/** Pagine che esistono solo per chi è collegato. */
const RISERVATE = ["/app"];

/**
 * Fa due cose a ogni richiesta:
 * 1. rinnova il token di sessione (i Server Component non possono farlo da soli)
 * 2. sbatte fuori chi non è collegato dalle pagine riservate
 *
 * Da Next 16 questo file si chiama `proxy.ts` e non più `middleware.ts`:
 * stessa funzione, nome nuovo. Il vecchio nome stampa un avviso di deprecazione.
 *
 * ATTENZIONE: fra `createServerClient` e `getUser()` non va messo nient'altro.
 * Se ci infili del codice in mezzo, gli utenti vengono scollegati a caso ed è
 * un bug che non si riproduce mai in sviluppo.
 */
export async function proxy(request: NextRequest) {
  let risposta = NextResponse.next({ request });

  // Senza .env.local il sito deve comunque funzionare: la landing è pubblica.
  if (!SUPABASE_CONFIGURATO) return risposta;

  const supabase = createServerClient(URL_SUPABASE, CHIAVE_PUBBLICA, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(daScrivere) {
        for (const { name, value } of daScrivere) request.cookies.set(name, value);
        risposta = NextResponse.next({ request });
        for (const { name, value, options } of daScrivere) {
          risposta.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const percorso = request.nextUrl.pathname;

  if (!user && RISERVATE.some((r) => percorso === r || percorso.startsWith(r + "/"))) {
    const entra = request.nextUrl.clone();
    entra.pathname = "/entra";
    // dopo il login lo riportiamo dove voleva andare
    entra.searchParams.set("poi", percorso);
    return NextResponse.redirect(entra);
  }

  // già collegato: la pagina di login non ha senso, vai all'app
  if (user && percorso === "/entra") {
    const app = request.nextUrl.clone();
    app.pathname = "/app";
    app.search = "";
    return NextResponse.redirect(app);
  }

  return risposta;
}

export const config = {
  matcher: [
    /* tutto tranne file statici e immagini: il middleware su un .png è
       tempo sprecato a ogni richiesta */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
