import { NextResponse, type NextRequest } from "next/server";
import { collaudoAperto, inCollaudo, passDi } from "@/lib/check/cancello";
import { creaPratica, praticaPerVerifica, registraEvento, transizionePratica } from "@/lib/pratiche/pratiche";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { traccia } from "@/lib/eventi/registra";
import { versoCasa } from "@/lib/sito";

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

/** Vero se questo browser porta la chiave del collaudatore (non il portone). */
const collaudoDaCookie = (req: NextRequest) => !collaudoAperto() && inCollaudo(req);

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
    .select("id, esito, email, volo_iata, creata_il")
    .eq("id", verificaId)
    .maybeSingle<{
      id: string;
      esito: string;
      email: string | null;
      volo_iata: string | null;
      creata_il: string | null;
    }>();

  if (error) return NextResponse.json({ errore: error.message }, { status: 500 });
  if (!verifica) return NextResponse.json({ errore: "Verifica inesistente." }, { status: 404 });

  /* ⚠️ SOLO SUI VOLI DIMOSTRATIVI. Una pratica di prova su un volo VERO
     finirebbe nell'elenco delle pratiche accanto a quelle dei clienti, e
     il giorno che ne arriva una davvero non si distinguerebbero più.
     I voli demo cominciano per ZZ, ed è la stessa regola di sempre. */
  if (!(verifica.volo_iata ?? "").toUpperCase().startsWith("ZZ")) {
    /* 🔴 QUI USCIVA UNA PAGINA BIANCA CON DENTRO DEL JSON. Niente
       testata, niente marchio, nessun modo di tornare indietro: l'unica
       via d'uscita era il tasto indietro del browser. E non capitava
       solo a chi collauda: col portone aperto ci finisce chiunque
       controlli un volo VERO e prema il bottone d'acquisto.
       Adesso si torna sulla pagina del verdetto, che il messaggio
       onesto («il pagamento non è ancora attivo») lo sa già dare.
       Trovato dall'ispezione del 12/08. */
    return NextResponse.redirect(
      versoCasa(`/verifica/${verifica.id}?checkout=non-attivo`, req),
    );
  }
  if (verifica.esito !== "idoneo") {
    return NextResponse.json(
      { errore: `Si apre una pratica solo su un verdetto idoneo (questo è "${verifica.esito}").` },
      { status: 400 },
    );
  }

  /* 🔴 UN ESTRANEO POTEVA FAR NASCERE ACCOUNT RIVOLIO CON L'EMAIL DI
     CHIUNQUE. Col portone del collaudo aperto questa rotta è pubblica, e
     creava un account già confermato con l'email agganciata alla
     verifica; bastava fare un check, scrivere l'indirizzo di un altro nel
     campo email e premere. La persona vera, provando poi a registrarsi,
     si sentiva rispondere che con quella email un account c'era già.
     Non si chiude il portone (Valerio lo vuole aperto, e ha ragione: il
     sito non lo conosce nessuno): si chiude QUESTO. Vedi sotto.
     Trovato dall'ispezione del 12/08.

     ⚠️ SERVE L'EMAIL, e non è un capriccio della funzione: la pratica si
     lega a un account, e l'account è l'email. Nel percorso vero la si
     chiede sulla pagina del verdetto, subito dopo il risultato. */
  if (!verifica.email) {
    return NextResponse.json(
      {
        errore:
          "Su questa verifica non c'è ancora un'email. Torna alla pagina del verdetto, lascia la tua email dove te la chiede, e poi riprova: è lo stesso passo che fa un cliente vero.",
      },
      { status: 400 },
    );
  }

  /* ⚠️ E LA VERIFICA DEVE ESSERE APPENA STATA FATTA.
     Il controllo naturale sarebbe la ricevuta dell'analisi, ma quella
     esiste solo col muro acceso: legare la cassa a lei vorrebbe dire
     rompere il collaudo il giorno che il muro si spegne. La condizione
     che vale sempre è un'altra e chiude lo stesso lo scenario che fa
     male: un'analisi di mezz'ora fa è di chi la sta guardando adesso,
     un elenco di identificativi raccolti in giro no.
     Non è una serratura, è una finestra che si chiude: un estraneo non
     può più raccogliere identificativi e usarli quando gli pare per far
     nascere account intestati ad altri. */
  const eta = Date.now() - Date.parse(verifica.creata_il ?? "");
  const FRESCA_MS = 30 * 60 * 1000;
  if (!passDi(req) && !collaudoDaCookie(req) && !(eta >= 0 && eta < FRESCA_MS)) {
    return NextResponse.json(
      {
        errore:
          "Questa analisi è di troppo tempo fa per aprire una pratica da qui. Rifai il check: ci vogliono trenta secondi.",
      },
      { status: 403 },
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

  /* 🔴 QUI IL RIMANDO ANDAVA SULL'INDIRIZZO INTERNO DELLA COPIA
     PUBBLICATA (`6a7c...--rivolio.netlify.app`), non su rivolio.it:
     `req.url`, dietro il proxy di Netlify, e' la macchina che serve la
     richiesta, non quello che ha digitato la persona. E cambiare dominio
     vuol dire perdere i cookie, quindi la ricevuta dell'analisi restava
     di la'. Vedi lib/sito.ts. Trovato percorrendo il giro sul sito vero
     il 12/08. */
  return NextResponse.redirect(versoCasa(`/pratica/${pratica.id}`, req));
}
