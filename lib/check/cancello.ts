import { NextResponse } from "next/server";
import { CORS } from "@/lib/api/limite";
import { colonnaMancante } from "@/lib/supabase/colonne";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { conteggioCheck } from "./conteggio";
import { CHECK_A_PAGAMENTO, postiRimasti, prezzoCheck } from "./ingresso";
import {
  COOKIE_PASS,
  COOKIE_PROVA,
  chiaveDiProvaValida,
  leggiPass,
  type Pass,
} from "./pass";

/**
 * IL CANCELLO, in un posto solo.
 *
 * Prima la regola viveva dentro `/api/verifica` e basta. Ma il verdetto
 * non esce solo da lì: `/api/verifica/cancellato`, `/dichiara` e
 * `/operativo` chiamano `verificaVolo()` per conto loro, e la ricerca
 * per tratta mostra l'orario di atterraggio vero, cioè esattamente la
 * cosa che stiamo vendendo. Con il muro su una porta sola bastava
 * conoscere l'indirizzo di un'altra per non pagare mai (verificato
 * l'11/08 leggendo le rotte). Una regola scritta in quattro punti
 * diversi diventa quattro regole diverse al primo cambio: qui è una.
 */

/** Un cookie preso dall'intestazione grezza: la richiesta arriva anche dall'app. */
export function cookieDi(req: Request, nome: string): string | null {
  const testa = req.headers.get("cookie");
  if (!testa) return null;
  for (const pezzo of testa.split(";")) {
    const [k, ...resto] = pezzo.trim().split("=");
    if (k === nome) return decodeURIComponent(resto.join("="));
  }
  return null;
}

/** La ricevuta di chi ha pagato. null col muro spento: non serve a niente. */
export function passDi(req: Request): Pass | null {
  if (!CHECK_A_PAGAMENTO) return null;
  return leggiPass(cookieDi(req, COOKIE_PASS));
}

/**
 * Vero se questo browser è quello del collaudatore.
 *
 * Solo a lui il muro dice dove sta la cassa di prova: quella cassa
 * emette ricevute vere, e una porta che si apre da sola non è un muro.
 */
export function inCollaudo(req: Request): boolean {
  const segreto = process.env.CASSA_PROVA_SEGRETO ?? "";
  if (!segreto) return false;
  return chiaveDiProvaValida(cookieDi(req, COOKIE_PROVA), segreto);
}

/**
 * IL REGISTRO: quante analisi ha già consumato questo ordine.
 *
 * 🔴 IL BUCO CHE CHIUDE, trovato attaccando il muro l'11/08. Il cookie
 * della ricevuta si "consuma" scrivendone uno nuovo col credito calato,
 * ma **il cookie sta nel browser dell'utente**: chi si copiava il valore
 * di prima e lo rimetteva a mano tornava ad avere il credito pieno.
 * Provato: prima analisi 200, seconda con la STESSA ricevuta già
 * consumata, ancora 200. Uno paga 1,99 e controlla mille voli, o passa
 * la stringa agli amici.
 *
 * La ricevuta firmata dimostra CHE HAI PAGATO, non QUANTO TI RESTA:
 * quanto ti resta è un conto, e un conto lo tiene chi non lo può
 * cambiare, cioè il nostro database. Ogni analisi consumata scrive il
 * proprio ordine sulla riga di `verifiche`; qui si contano.
 *
 * ⚠️ Se il registro non si può leggere (colonna non ancora aggiunta,
 * database irraggiungibile) si torna al conto del cookie: degradato ma
 * funzionante, e scritto nei log. Non si blocca chi ha pagato per un
 * guasto nostro.
 */
export async function creditoFinito(pass: Pass): Promise<boolean> {
  if (!SERVIZIO_ATTIVO) return pass.restano <= 0;
  try {
    const { count, error } = await supabaseServizio()
      .from("verifiche")
      .select("id", { count: "exact", head: true })
      .eq("ordine_check", pass.ordine);
    if (error) {
      if (!colonnaMancante(error.message)) {
        console.error("[cancello] registro non leggibile:", error.message);
      }
      return pass.restano <= 0;
    }
    return (count ?? 0) >= pass.quanti;
  } catch (e) {
    console.error("[cancello] registro non leggibile:", e);
    return pass.restano <= 0;
  }
}

/**
 * Scrive nel registro che questa analisi è stata consumata da quest'ordine.
 * Se fallisce lo dice forte: senza questa riga la stessa ricevuta si
 * potrebbe riusare, ed è il buco che il registro esiste per chiudere.
 */
export async function segnaConsumo(verificaId: string | null, ordine: string): Promise<void> {
  if (!verificaId || !SERVIZIO_ATTIVO) return;
  try {
    const { error } = await supabaseServizio()
      .from("verifiche")
      .update({ ordine_check: ordine })
      .eq("id", verificaId);
    if (error && !colonnaMancante(error.message)) {
      console.error("[cancello] consumo NON registrato:", error.message);
    }
  } catch (e) {
    console.error("[cancello] consumo NON registrato:", e);
  }
}

/** I dati che il muro mostra: prezzo, posti, e dove si paga. */
export async function datiDelMuro(req: Request) {
  /* Il prezzo e i posti rimasti li calcola il SERVER: sono un dato, non
     una decisione del browser. E i posti si scrivono solo se sono stati
     contati davvero (vedi postiRimasti). */
  const { pagati } = await conteggioCheck();
  const prezzo = prezzoCheck(pagati);
  return {
    cassa: inCollaudo(req) ? "/cassa-prova" : null,
    prezzoTesto: prezzo.prezzoTesto,
    prezzoPienoTesto: prezzo.prezzoPienoTesto,
    inLancio: prezzo.inLancio,
    postiRimasti: postiRimasti(pagati),
  };
}

/** Il 402 col muro, uguale da qualunque rotta arrivi. */
export async function rispostaMuro(req: Request) {
  return NextResponse.json(
    {
      ok: false,
      serveIlPass: true,
      errore: "L'analisi di questo volo si sblocca con un pagamento.",
      muro: await datiDelMuro(req),
    },
    { status: 402, headers: CORS },
  );
}

/**
 * Il cancello delle rotte che continuano un check già fatto.
 *
 * ⚠️ Qui NON basta chiedere la ricevuta, e il motivo vale soldi: chi ha
 * pagato e ha già ricevuto il suo verdetto ha finito il credito, e il
 * cookie è stato cancellato. Se poi il verdetto era "non idoneo" e lui
 * dichiara di essere rimasto a terra, quella domanda fa parte di quello
 * che ha comprato: sbattergli in faccia il muro una seconda volta
 * sarebbe farsi pagare due volte lo stesso volo.
 *
 * Quindi passa chi ha la ricevuta **oppure** chi porta l'identificativo
 * di una verifica che esiste davvero. Quell'identificativo si ottiene in
 * un modo solo: passando dal cancello principale.
 *
 * Torna la risposta da restituire, oppure null se si può proseguire.
 */
export async function cancelloDelSeguito(
  req: Request,
  verificaId: unknown,
): Promise<Response | null> {
  if (!CHECK_A_PAGAMENTO) return null;
  if (passDi(req)) return null;

  /* ⚠️ SI CHIUDE, NON SI APRE, QUANDO QUALCOSA VA STORTO.
     Senza database non si può dimostrare che quella verifica esiste, e
     `supabaseServizio()` alza un'eccezione se la chiave manca: lasciarla
     scappare farebbe rispondere 500 alla rotta, cioè un guasto al posto
     del muro. Qualunque cosa succeda qui dentro, la risposta è il muro:
     sbagliare dall'altra parte vuol dire regalare il prodotto. */
  if (typeof verificaId === "string" && verificaId && SERVIZIO_ATTIVO) {
    try {
      const { data } = await supabaseServizio()
        .from("verifiche")
        .select("id")
        .eq("id", verificaId)
        .maybeSingle();
      if (data) return null;
    } catch (e) {
      console.warn("[cancello] verifica non controllabile, resta chiuso:", e);
    }
  }

  return rispostaMuro(req);
}
