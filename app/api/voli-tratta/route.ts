import { NextResponse } from "next/server";
import { CORS, ipDi, oltreIlLimiteCondiviso } from "@/lib/api/limite";
import { passUsabile } from "@/lib/check/cancello";
import { CHECK_A_PAGAMENTO } from "@/lib/check/ingresso";
import { aeroportoPerIata } from "@/lib/voli/aeroporti";
import { normalizzaData } from "@/lib/voli/normalizza";
import { voliDiTratta } from "@/lib/voli/tratta";

/**
 * GET /api/voli-tratta?da=BGY&a=ACE&data=2026-08-06
 *
 * L'elenco dei voli di quel giorno fra i due scali, da cui l'utente
 * riconosce il suo. Serve a NON chiedere il numero di volo: è la
 * frizione più grossa del prodotto (l'utente medio non sa dove trovarlo).
 *
 * Non dà verdetti. Restituisce voli e orari; il verdetto arriva dopo, da
 * /api/verifica, sul volo che l'utente ha scelto.
 *
 * Ogni chiamata costa due richieste ad AeroDataBox (la finestra massima
 * del fornitore è di 12 ore), quindi il tetto per IP qui è stretto.
 *
 * ⚠️ ED È LA ROTTA PIÙ CARA CHE ABBIAMO, per un motivo che non si vede:
 * il check ha la cache sulla tabella `voli`, quindi un volo con 180
 * passeggeri costa UNA chiamata. Qui la cache non c'era: mille persone
 * che cercano lo stesso Roma → Barcellona erano duemila chiamate. Con la
 * distribuzione addosso è la voce che fa il conto.
 *
 * La cache adesso c'è ed è la RETE di Netlify, non un database: stessa
 * tratta e stessa data = stesso indirizzo = una risposta sola servita a
 * tutti. Zero tabelle nuove, zero migrazioni da applicare.
 *
 * ⚠️ E si può fare SOLO perché la risposta che si mette in cache è quella
 * SENZA l'orario di atterraggio. Se si mettesse in cache la versione
 * completa di chi ha pagato, la rete la servirebbe poi a chi non ha
 * pagato: la cache diventerebbe il buco. Chi ha la ricevuta riceve la
 * risposta piena e `no-store`, e non entra in nessuna cache.
 */

const MASSIMO_AL_MINUTO = 10;

/* Una giornata passata non cambia più: i voli sono atterrati e l'elenco
   è definitivo. Sei ore sono prudenti e tagliano comunque il 99% delle
   chiamate su una tratta popolare. */
const CACHE_PASSATO = 6 * 60 * 60;

/* Oggi e domani cambiano mentre la giornata scorre: cinque minuti
   bastano a reggere un'ondata senza mostrare un elenco vecchio. */
const CACHE_OGGI = 5 * 60;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  if (await oltreIlLimiteCondiviso("tratta", ipDi(req), MASSIMO_AL_MINUTO)) {
    return NextResponse.json(
      { ok: false, errore: "Troppe richieste di fila. Aspetta un minuto e riprova." },
      { status: 429, headers: CORS },
    );
  }

  const p = new URL(req.url).searchParams;
  const da = aeroportoPerIata(p.get("da") ?? "");
  const a = aeroportoPerIata(p.get("a") ?? "");
  if (!da || !a) {
    return NextResponse.json(
      { ok: false, errore: "Scegli l'aeroporto di partenza e quello di arrivo dall'elenco." },
      { status: 400, headers: CORS },
    );
  }
  if (da.iata === a.iata) {
    return NextResponse.json(
      { ok: false, errore: "Partenza e arrivo sono lo stesso aeroporto." },
      { status: 400, headers: CORS },
    );
  }

  const data = normalizzaData(p.get("data") ?? "");
  if (!data.ok) {
    return NextResponse.json({ ok: false, errore: data.errore }, { status: 400, headers: CORS });
  }

  const esito = await voliDiTratta(da.iata, a.iata, data.valore);

  /* ⚠️ L'ORARIO DI ATTERRAGGIO VERO NON ESCE DA QUI COL MURO ACCESO.
     "Doveva arrivare alle 09:55, atterrato alle 13:47" non è un dettaglio
     dell'elenco: è la cosa che vendiamo. Chi la legge qui ha già la
     risposta e non ha nessun motivo di pagare (visto l'11/08). Resta
     l'orario PREVISTO, che è quello stampato sul biglietto e serve solo a
     far riconoscere all'utente il proprio volo: senza, la lista di undici
     voli identici non si distingue e la ricerca per tratta smette di
     funzionare. */
  /* 🔴 Stesso difetto di /api/leggi-carta: il cookie da solo non basta,
     perché si copia. Qui in ballo c'è l'orario di atterraggio VERO, che
     è esattamente la cosa che il muro esiste per far pagare. */
  const haPagato = !CHECK_A_PAGAMENTO || Boolean(await passUsabile(req));
  const voli = haPagato
    ? esito.voli
    : esito.voli.map((v) => ({ ...v, arrivoEffettivoOra: "" }));

  /* La cache va SOLO sulla risposta ridotta (vedi la nota in testa).
     `Vary: Cookie` è la cintura di sicurezza: dice a qualsiasi cache di
     mezzo che due browser con cookie diversi non condividono la
     risposta, così una versione piena non può finire a un altro. */
  const oggi = new Date().toISOString().slice(0, 10);
  const durata = data.valore < oggi ? CACHE_PASSATO : CACHE_OGGI;
  const cache: Record<string, string> = haPagato
    ? { "Cache-Control": "private, no-store" }
    : {
        "Cache-Control": `public, max-age=0, s-maxage=${durata}, stale-while-revalidate=60`,
        "Netlify-CDN-Cache-Control": `public, s-maxage=${durata}, stale-while-revalidate=60`,
      };

  return NextResponse.json(
    { ok: true, da, a, data: data.valore, voli, demo: esito.demo },
    { headers: { ...CORS, ...cache, Vary: "Cookie, Origin" } },
  );
}
