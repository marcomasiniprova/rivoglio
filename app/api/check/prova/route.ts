import { NextResponse } from "next/server";
import { cassaDiProvaAperta } from "@/lib/check/cancello";
import { CHECK_PER_PAGAMENTO, PREZZO_LANCIO } from "@/lib/check/ingresso";
import { COOKIE_PASS, creaPass } from "@/lib/check/pass";
import { dopo, traccia } from "@/lib/eventi/registra";
import { tin } from "@/lib/eventi/telegram";

/**
 * LA CASSA DI PROVA (richiesta di Valerio, 11/08).
 *
 * Serve a percorrere il giro intero prima che esista un venditore vero:
 * muro → cassa → ricevuta → check sbloccato. Non tocca una carta, non
 * incassa un euro, e lo dichiara a caratteri cubitali sulla pagina.
 *
 * ⚠️ CHIUSA A CHIAVE, e non è pignoleria. Questa rotta emette una
 * ricevuta valida: se fosse aperta, chiunque la scoprisse avrebbe
 * analisi gratis a vita e il muro sarebbe una porta finta.
 *
 * La chiave sta nel COOKIE del collaudatore, non nella richiesta: prima
 * la parola segreta viaggiava nella risposta del muro, quindi la
 * riceveva chiunque premesse il bottone (visto l'11/08). Il cookie si
 * prende una volta sola da `/api/check/prova/chiave?s=...`.
 *
 * Senza `CASSA_PROVA_SEGRETO` la rotta NON esiste: risponde 404 come una
 * pagina qualsiasi che non c'è. Il giorno che arriva il venditore vero
 * si toglie la variabile e la porta si chiude da sola.
 */
export const dynamic = "force-dynamic";

/** Come si scrive il cookie della ricevuta: solo server, solo nostro sito. */
const BISCOTTO = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function POST(req: Request) {
  /* Senza la variabile questa rotta non esiste: 404, come una pagina
     inventata. È l'interruttore che la spegne il giorno del venditore. */
  if (!cassaDiProvaAperta()) {
    return NextResponse.json({ ok: false, errore: "Non trovato." }, { status: 404 });
  }

  /* L'ordine porta scritto in faccia che è una prova: se un giorno
     finisse in un registro contabile, si riconosce a colpo d'occhio. */
  const ordine = `prova-${Date.now().toString(36)}`;
  const pass = creaPass(ordine, CHECK_PER_PAGAMENTO);
  if (!pass) {
    return NextResponse.json(
      { ok: false, errore: "Il server non è configurato per firmare la ricevuta." },
      { status: 503 },
    );
  }

  /* ⚠️ L'importo NON si registra: qui non è entrato un euro, e un incasso
     finto nel cruscotto è esattamente il genere di numero che poi si
     legge come vero. Resta il passo dell'imbuto, che invece è reale:
     qualcuno ha sbloccato l'analisi. */
  traccia(req, { tipo: "sbloccato", extra: { prova: true, ordine } });
  /* Il TIN si manda apposta, ed è marcato prova: serve a Valerio per
     vedere una volta che il telefono suona davvero, prima che ci sia un
     venditore vero. `tin` e non `tinIncasso`: il messaggio dei soldi
     dev'essere inconfondibile. */
  dopo(async () => {
    await tin("🧪 <b>Cassa di prova</b> — ricevuta emessa. Nessun soldo incassato.");
  });

  const risposta = NextResponse.json({
    ok: true,
    prova: true,
    ordine,
    quanti: CHECK_PER_PAGAMENTO,
    importo: PREZZO_LANCIO,
  });
  risposta.cookies.set(COOKIE_PASS, pass, BISCOTTO);
  return risposta;
}
