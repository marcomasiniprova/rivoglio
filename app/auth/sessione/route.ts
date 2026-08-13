import { NextResponse, type NextRequest } from "next/server";
import { percorsoInterno } from "@/lib/api/percorso";
import { supabaseServer } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURATO } from "@/lib/supabase/chiavi";
import { versoCasa } from "@/lib/sito";

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
  /* 🔴 QUESTA PORTA AVEVA IL FILTRO VECCHIO. "Inizia con / e non con //"
     buca col backslash: `/\sito-cattivo.it` passa il controllo e il
     browser lo gira in `//sito-cattivo.it`, cioè un indirizzo rivolio.it
     che rimbalza altrove subito dopo il login. Le altre tre porte
     (auth/conferma, entra, posta-auth) passano da `percorsoInterno`, che
     accetta solo i caratteri di un percorso vero; questa se l'era persa.
     Trovato dall'ispezione del 12/08. */
  const poi = percorsoInterno(grezzo) ? grezzo : "/app";

  if (!SUPABASE_CONFIGURATO || !access_token || !refresh_token) {
    const u = versoCasa("/entra", request);
    u.searchParams.set("errore", "link");
    return NextResponse.redirect(u);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });

  if (error) {
    console.error("[sessione] setSession:", error.message);
    const u = versoCasa("/entra", request);
    u.searchParams.set("errore", /expired/i.test(error.message) ? "scaduto" : "link");
    return NextResponse.redirect(u);
  }

  /* Indirizzo pulito, come in /auth/conferma: qui nella richiesta ci sono
     ADDIRITTURA i due gettoni di sessione, e non devono restare scritti
     nella barra del browser di nessuno. */
  const destinazione = versoCasa(poi, request);
  destinazione.search = "";
  return NextResponse.redirect(destinazione);
}
