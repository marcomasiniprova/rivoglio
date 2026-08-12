import { NextResponse, type NextRequest } from "next/server";
import { inCollaudo } from "@/lib/check/cancello";
import { creaPratica, praticaPerVerifica, registraEvento, transizionePratica } from "@/lib/pratiche/pratiche";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { traccia } from "@/lib/eventi/registra";

/**
 * LA CASSA DI PROVA DELLA PRATICA (richiesta di Valerio, 12/08: «voglio
 * mettere un volo casuale, che mi tratti come un utente fortunato, e
 * arrivare fino al ricorso, alla risposta della compagnia e alla
 * controproposta, così testo tutti i casi prima di lanciare»).
 *
 * Perché serve: senza un venditore il percorso si ferma esattamente qui.
 * Il check funziona, il muro funziona, il verdetto funziona; poi si preme
 * "apri la pratica" e si finisce su un checkout che non esiste. Tutto
 * quello che viene DOPO il pagamento (i quattro fogli, il no della
 * compagnia, la replica, la conciliazione) non l'ha mai visto nessuno,
 * ed è la metà del prodotto che vale i soldi.
 *
 * Cosa fa: la stessa identica cosa che farebbe il webhook di Polar
 * quando arriva un pagamento vero. Non una simulazione parallela: chiama
 * `creaPratica` e `transizionePratica` come lui, quindi quello che vedi
 * è il percorso vero e non una copia che un domani diverge.
 *
 * ⚠️ CHI PUÒ USARLA: solo un browser che porta la chiave del collaudatore
 * (`inCollaudo`), la stessa del muro dell'analisi. Non basta conoscere
 * l'indirizzo, e non c'è nessun parametro segreto da indovinare: la
 * chiave si prende una volta sola da `/api/check/prova/chiave?s=...` e
 * vive in un cookie firmato. Senza, questa rotta risponde 404 come un
 * indirizzo inventato: chi non deve saperlo non scopre nemmeno che
 * esiste.
 *
 * ⚠️ E LA PRATICA NASCE MARCATA. In cronologia il primo evento dice a
 * chiare lettere che il pagamento non è mai avvenuto. Una pratica di
 * prova indistinguibile da una vera, dentro lo stesso database dei
 * clienti, è il modo più veloce per rimborsare qualcuno che non aveva
 * pagato o per contare un incasso che non c'è.
 */
export const dynamic = "force-dynamic";

const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  /* 404 e non 403: un "non sei autorizzato" conferma che la rotta c'è. */
  if (!inCollaudo(req)) return new NextResponse(null, { status: 404 });
  if (!SERVIZIO_ATTIVO) {
    return NextResponse.json({ errore: "Database non configurato." }, { status: 503 });
  }

  const url = new URL(req.url);
  const verificaId = url.searchParams.get("verifica") ?? "";
  const tipo = url.searchParams.get("tipo") === "famiglia" ? "famiglia" : "singola";
  if (!UUID_OK.test(verificaId)) {
    return NextResponse.json({ errore: "Verifica non valida." }, { status: 400 });
  }

  const db = supabaseServizio();
  const { data: verifica, error } = await db
    .from("verifiche")
    .select("id, esito, email, volo_iata")
    .eq("id", verificaId)
    .maybeSingle<{ id: string; esito: string; email: string | null; volo_iata: string | null }>();

  if (error) return NextResponse.json({ errore: error.message }, { status: 500 });
  if (!verifica) return NextResponse.json({ errore: "Verifica inesistente." }, { status: 404 });

  /* ⚠️ SOLO SUI VOLI DIMOSTRATIVI. Una pratica di prova su un volo VERO
     finirebbe nell'elenco delle pratiche accanto a quelle dei clienti, e
     il giorno che ne arriva una davvero non si distinguerebbero più.
     I voli demo cominciano per ZZ, ed è la stessa regola di sempre. */
  if (!(verifica.volo_iata ?? "").toUpperCase().startsWith("ZZ")) {
    return NextResponse.json(
      { errore: "La cassa di prova vale solo sui voli dimostrativi (ZZ*)." },
      { status: 400 },
    );
  }
  if (verifica.esito !== "idoneo") {
    return NextResponse.json(
      { errore: `Si apre una pratica solo su un verdetto idoneo (questo è "${verifica.esito}").` },
      { status: 400 },
    );
  }

  /* ⚠️ SERVE L'EMAIL, e non è un capriccio della funzione: la pratica si
     lega a un account, e l'account è l'email. Nel percorso vero la si
     chiede sulla pagina del verdetto, subito dopo il risultato. Se manca
     qui, manca anche là: si dice cosa fare invece di inventarne una. */
  if (!verifica.email) {
    return NextResponse.json(
      {
        errore:
          "Su questa verifica non c'è ancora un'email. Torna alla pagina del verdetto, lascia la tua email dove te la chiede, e poi riprova: è lo stesso passo che fa un cliente vero.",
      },
      { status: 400 },
    );
  }

  /* Idempotente come il webhook: premere due volte non crea due pratiche. */
  const esistente = await praticaPerVerifica(verificaId);
  let pratica = esistente;

  if (!pratica) {
    const creata = await creaPratica({
      verificaId,
      email: verifica.email,
      tipo,
      passeggeri: [],
    });
    if (!creata.ok) {
      return NextResponse.json({ errore: creata.motivo ?? "Pratica non creata." }, { status: 500 });
    }
    pratica = creata.pratica;
    await registraEvento(
      pratica.id,
      "pratica_di_prova",
      "PRATICA DI PROVA: aperta dalla cassa di collaudo, nessun pagamento è mai avvenuto. Serve a percorrere il prodotto da capo a fondo prima del lancio.",
    );
  }

  if (pratica.stato === "creata") {
    const passaggio = await transizionePratica(
      pratica.id,
      "pagata",
      "Cassa di prova: pratica sbloccata senza pagamento, per collaudo.",
      /* ⚠️ prezzo_pagato a ZERO, di proposito: se ci scrivessi 14,90
         quella cifra finirebbe negli incassi del cruscotto e il primo
         numero che guardi la mattina sarebbe falso. */
      { prezzo_pagato: 0 },
    );
    if (!passaggio.ok) {
      return NextResponse.json({ errore: passaggio.motivo ?? "Transizione fallita." }, { status: 500 });
    }
  }

  /* Si registra come "pratica aperta" e NON come "pagato": nel cruscotto
     i soldi devono restare a zero finché non ne entrano davvero. */
  traccia(req, { tipo: "pratica", volo: verifica.volo_iata, extra: { prova: true, tipo } });

  return NextResponse.redirect(new URL(`/pratica/${pratica.id}`, url.origin));
}
