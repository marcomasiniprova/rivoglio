import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { CHIAVE_PUBBLICA, SUPABASE_CONFIGURATO, URL_SUPABASE } from "@/lib/supabase/chiavi";
import { COOKIE_PREZZO, TEST_DUE_PREZZI, tiraLaMoneta, varianteValida } from "@/lib/prezzi";
import { COOKIE_REF, GIORNI_REF, codiceAffiliatoValido } from "@/lib/affiliati/codice";

/** Pagine che esistono solo per chi è collegato. La web app (/app) NON
 * è più qui: dall'8/08 il check è aperto a tutti (decisione di Valerio),
 * la pagina mostra da sola l'elenco pratiche a chi è collegato. */
const RISERVATE = ["/admin"];

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

  /* IL TEST DEI DUE PREZZI: la moneta si tira una volta sola per
     visitatore e resta nel cookie per sei mesi. Chi vede 24,90 sulla
     landing deve trovare 24,90 anche alla cassa, se no il test misura la
     nostra incoerenza invece del prezzo.
     ATTENZIONE all'ordine: il cookie NON si può scrivere qui, perché il
     client Supabase più sotto rifà la risposta da capo e se lo mangerebbe.
     Si decide adesso e si scrive su OGNI risposta che esce (conCookie). */
  const prezzoDaScrivere =
    !TEST_DUE_PREZZI || varianteValida(request.cookies.get(COOKIE_PREZZO)?.value)
      ? null
      : tiraLaMoneta();

  /* L'AFFILIATO: chi arriva da `?ref=MARCO` si porta dietro il creator per
     60 giorni. Qui solo la forma (l'Edge non tocca il database): la validità
     vera del codice si controlla al momento del pagamento. Un ref nuovo
     nell'indirizzo vince su quello vecchio (ultimo click). */
  const refDaScrivere = codiceAffiliatoValido(request.nextUrl.searchParams.get("ref"));

  const conCookie = (res: NextResponse) => {
    if (prezzoDaScrivere) {
      res.cookies.set(COOKIE_PREZZO, prezzoDaScrivere, {
        maxAge: 60 * 60 * 24 * 180,
        sameSite: "lax",
        path: "/",
      });
    }
    if (refDaScrivere) {
      res.cookies.set(COOKIE_REF, refDaScrivere, {
        maxAge: 60 * 60 * 24 * GIORNI_REF,
        sameSite: "lax",
        path: "/",
      });
    }
    return res;
  };

  // Senza .env.local il sito deve comunque funzionare: la landing è pubblica.
  if (!SUPABASE_CONFIGURATO) return conCookie(risposta);

  /* 🔴 CHI NON HA MAI FATTO LOGIN NON SI CHIEDE A SUPABASE.
     Trovato misurando il sito vero il 12/08, cercando perché «ogni volta
     che clicco un bottone ci mette secondi». Questo proxy gira su OGNI
     richiesta che non sia un file statico (landing, blog, prezzi,
     articoli: tutto), e sotto faceva `getUser()`, che è una chiamata di
     rete a Supabase. Per un visitatore che non ha mai fatto login quella
     chiamata non può che rispondere "nessuno", quindi era un viaggio
     andata e ritorno buttato via PRIMA di ogni singola pagina, per il
     100% del traffico di oggi.
     Il cookie di sessione lo scrive Supabase e si chiama
     `sb-<progetto>-auth-token` (a volte spezzato in `.0`, `.1`). Se non
     c'è, la persona è anonima per definizione.
     ⚠️ E NON SI ABBASSA NESSUNA GUARDIA, anzi: senza cookie si prende il
     ramo `user = null`, che è quello severo, lo stesso che sbatte fuori
     dalle pagine riservate. Chi il cookie ce l'ha continua a passare da
     `getUser()` come prima, perché lì il token va davvero verificato e
     rinnovato: un cookie si falsifica, una sessione no. */
  const haUnaSessione = request.cookies
    .getAll()
    .some((c) => /^sb-.*-auth-token(\.\d+)?$/.test(c.name));
  if (!haUnaSessione) {
    const percorsoAnonimo = request.nextUrl.pathname;
    if (RISERVATE.some((r) => percorsoAnonimo === r || percorsoAnonimo.startsWith(r + "/"))) {
      const entra = request.nextUrl.clone();
      entra.pathname = "/entra";
      entra.searchParams.set("poi", percorsoAnonimo);
      return conCookie(NextResponse.redirect(entra));
    }
    return conCookie(risposta);
  }

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
    return conCookie(NextResponse.redirect(entra));
  }

  // già collegato: la pagina di login non ha senso, vai all'app
  if (user && percorso === "/entra") {
    const app = request.nextUrl.clone();
    app.pathname = "/app";
    app.search = "";
    return conCookie(NextResponse.redirect(app));
  }

  return conCookie(risposta);
}

export const config = {
  matcher: [
    /* tutto tranne file statici e immagini: il middleware su un .png è
       tempo sprecato a ogni richiesta */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
