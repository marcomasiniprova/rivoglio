import { NextResponse } from "next/server";
import { COOKIE_PROVA, segnaturaProva } from "@/lib/check/pass";

/**
 * LA CHIAVE DEL COLLAUDATORE.
 *
 * Valerio apre UNA volta sola l'indirizzo
 * `/api/check/prova/chiave?s=<la sua parola>` e il browser si porta a
 * casa la chiave. Da quel momento, e solo su quel browser, il muro gli
 * dice dove sta la cassa di prova.
 *
 * Perché non bastava mandare l'indirizzo della cassa dentro la risposta
 * del muro: la risposta del muro la riceve chiunque prema il bottone, e
 * dentro c'era la parola segreta. La cassa di prova emette ricevute
 * VERE, quindi il muro si apriva da solo (visto l'11/08).
 *
 * Nel cookie non finisce la parola ma la sua firma: chi legge il cookie
 * non impara niente di riutilizzabile altrove.
 *
 * Il giorno del venditore vero si toglie `CASSA_PROVA_SEGRETO` e questa
 * porta smette di esistere, senza toccare una riga di codice.
 */
export const dynamic = "force-dynamic";

const GIORNI = 90;

export async function GET(req: Request) {
  const segreto = process.env.CASSA_PROVA_SEGRETO ?? "";
  const s = new URL(req.url).searchParams.get("s") ?? "";

  /* Stessa risposta quando la variabile non c'è e quando la parola è
     sbagliata: chi prova a caso non deve capire di aver trovato la porta
     giusta. */
  if (!segreto || s !== segreto) {
    return NextResponse.json({ ok: false, errore: "Non trovato." }, { status: 404 });
  }

  const chiave = segnaturaProva(segreto);
  if (!chiave) {
    return NextResponse.json(
      { ok: false, errore: "Il server non è configurato per firmare la chiave." },
      { status: 503 },
    );
  }

  const risposta = NextResponse.redirect(new URL("/cassa-prova", req.url));
  risposta.cookies.set(COOKIE_PROVA, chiave, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * GIORNI,
  });
  return risposta;
}
