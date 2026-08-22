import Stripe from "stripe";

/**
 * Stripe, il gateway di pagamento vero.
 *
 * Prende il posto di Polar, che il 10/08 ha detto no ("Use case not
 * supported": categoria a rischio, non il testo scritto male). Stripe non
 * ha lo stesso cancello sulla categoria: si incassa a nome del titolare
 * dell'account.
 *
 * Un file solo per due motivi:
 * 1. il client si costruisce una volta e si riusa (aprire una connessione
 *    nuova a ogni richiesta è spreco);
 * 2. TEST o LIVE non è una nostra variabile: lo decide la chiave. Una
 *    chiave `sk_test_...` parla col mondo di prova, una `sk_live_...` col
 *    mondo vero. Il codice è identico, cambia solo cosa metti su Netlify.
 *    Così si collauda in test e poi si accende il live senza toccare niente.
 *
 * ⚠️ LA CHIAVE SEGRETA NON STA MAI NEL REPO. Vive solo in
 * `STRIPE_SECRET_KEY` su Netlify. Qui si legge, non si scrive.
 */

/* Il client vive quanto la chiave: se la chiave cambia (test → live) se ne
   fa uno nuovo, invece di restare incollati a quella di prima. */
let cache: { chiave: string; client: Stripe } | null = null;

function chiaveSegreta(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}

/** C'è una chiave Stripe valida? Se no, chi chiama ripiega, non esplode. */
export function stripeAttivo(): boolean {
  return chiaveSegreta().startsWith("sk_");
}

/** In che mondo stiamo pagando. Serve al pannello per dirlo senza dubbi. */
export function modalitaStripe(): "test" | "live" | "assente" {
  const k = chiaveSegreta();
  if (k.startsWith("sk_live_")) return "live";
  if (k.startsWith("sk_test_")) return "test";
  return "assente";
}

/**
 * Il client Stripe. Lancia se la chiave manca: chi chiama deve prima
 * chiedere `stripeAttivo()` e, se è spento, mostrare la strada di riserva.
 */
export function stripe(): Stripe {
  const chiave = chiaveSegreta();
  if (!chiave.startsWith("sk_")) {
    throw new Error("STRIPE_SECRET_KEY assente o non valida.");
  }
  if (cache?.chiave === chiave) return cache.client;
  const client = new Stripe(chiave, {
    /* La versione dell'API la pinna il pacchetto: così un aggiornamento
       del SDK non cambia il comportamento sotto i piedi. */
    appInfo: { name: "Rivolio", url: "https://rivolio.it" },
  });
  cache = { chiave, client };
  return client;
}

/** Gli euro in centesimi interi, come li vuole Stripe (16,90 → 1690). */
export function inCentesimi(euro: number): number {
  return Math.round(euro * 100);
}
