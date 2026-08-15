import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata } from "@/lib/motore/autorizza";
import { mandaPush, testoAvviso, tokenValido, type Messaggio } from "@/lib/notifiche/push";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { verificaVolo } from "@/lib/voli/verifica";

/**
 * IL CRON DELLE NOTIFICHE: la mattina dopo, il verdetto sui voli seguiti.
 *
 * Scelte di Valerio (popup dell'8/08):
 * - si controlla LA MATTINA DOPO, non subito: l'orario certificato arriva
 *   con qualche ora di ritardo e avvisare prima significa dare verdetti su
 *   dati non consolidati;
 * - il testo parla di TRATTA e di ore, mai del numero di volo;
 * - i voli li segue chi è entrato con l'email (il check resta libero per
 *   tutti gli altri).
 *
 * Quando NON si manda niente. Un avviso che dice "il dato non è solido"
 * o "non ti spetta niente" è solo rumore in tasca: si fa vibrare un
 * telefono soltanto quando c'è una fascia di compensazione. Il resto
 * l'utente lo vede quando apre l'app.
 *
 * Come non si ripete: `esito_avvisato` si scrive SOLO dopo che la push è
 * partita davvero (o quando il caso è chiuso). Un caso incerto resta
 * aperto e si riprova nei giorni successivi, perché il dato può
 * consolidarsi; dopo la finestra si smette, e la riga resta segnata.
 *
 * Budget 8 secondi come gli altri giri: le funzioni Netlify muoiono a 10.
 */
export const dynamic = "force-dynamic";

const GIORNO_MS = 86_400_000;
/** Oltre questi giorni un incerto non diventa più certo: si chiude. */
const GIORNI_FINESTRA = 7;

type RigaSeguita = {
  id: string;
  utente_id: string;
  volo_iata: string;
  data_locale: string;
};

const giornoIso = (indietro: number) =>
  new Date(Date.now() - indietro * GIORNO_MS).toISOString().slice(0, 10);

async function giroAvvisa({ budgetMs = 8000 } = {}) {
  if (!SERVIZIO_ATTIVO) return { ok: false as const, motivo: "SUPABASE_SECRET_KEY assente." };

  const inizio = Date.now();
  const sb = supabaseServizio();

  /* Da ieri all'indietro fino alla fine della finestra: un volo di oggi
     non è ancora atterrato dappertutto, e uno di tre settimane fa non
     diventerà più certo. */
  const { data: righe, error } = await sb
    .from("voli_seguiti")
    .select("id, utente_id, volo_iata, data_locale")
    .is("esito_avvisato", null)
    .lte("data_locale", giornoIso(1))
    .gte("data_locale", giornoIso(GIORNI_FINESTRA))
    .order("data_locale", { ascending: true })
    .limit(200);

  if (error) return { ok: false as const, motivo: error.message };
  const seguiti = (righe ?? []) as RigaSeguita[];
  if (seguiti.length === 0) {
    return { ok: true as const, seguiti: 0, esaminati: 0, avvisi: 0, chiusi: 0 };
  }

  /* I token dei telefoni, in una lettura sola: sono pochi utenti per
     tanti voli, chiedere il profilo a ogni riga sarebbe uno spreco. */
  const utenti = [...new Set(seguiti.map((r) => r.utente_id))];
  const { data: profili } = await sb
    .from("profili")
    .select("id, expo_push_token")
    .in("id", utenti);
  const token = new Map<string, string>();
  for (const p of (profili ?? []) as { id: string; expo_push_token: string | null }[]) {
    if (tokenValido(p.expo_push_token)) token.set(p.id, p.expo_push_token!.trim());
  }

  const messaggi: Messaggio[] = [];
  const daChiudere: { id: string; esito: string; avvisato: boolean }[] = [];
  let esaminati = 0;

  for (const riga of seguiti) {
    if (Date.now() - inizio > budgetMs) break;
    esaminati++;

    let esito;
    try {
      esito = await verificaVolo(riga.volo_iata, riga.data_locale);
    } catch (e) {
      // Un volo rotto non ferma gli altri: si riproverà domani.
      console.error(`[avvisa] verifica fallita per ${riga.volo_iata}:`, e);
      continue;
    }
    if (!esito.ok) continue;

    const { verdetto, fatto } = esito;
    const vecchio = riga.data_locale <= giornoIso(GIORNI_FINESTRA - 1);

    /* Incerto dentro la finestra: si lascia aperto, il dato può ancora
       consolidarsi. Fuori dalla finestra si chiude in silenzio. */
    if (verdetto.esito === "incerto") {
      if (vecchio) daChiudere.push({ id: riga.id, esito: "incerto", avvisato: false });
      continue;
    }

    if (verdetto.esito !== "idoneo") {
      daChiudere.push({ id: riga.id, esito: verdetto.esito, avvisato: false });
      continue;
    }

    const push = token.get(riga.utente_id);
    const testo = push
      ? testoAvviso({
          da: fatto.partenzaCitta ?? fatto.partenzaIata ?? null,
          a: fatto.arrivoCitta ?? fatto.arrivoIata ?? null,
          voloIata: riga.volo_iata,
          esito: verdetto.esito,
          importo: verdetto.importo,
          ritardoMinuti: "ritardoMinuti" in verdetto ? verdetto.ritardoMinuti : null,
        })
      : null;

    if (!testo || !push) {
      /* Nessun telefono a cui scrivere (non ha dato il permesso, o il
         token è scaduto): il caso resta aperto, così se un giorno accende
         le notifiche l'avviso parte. */
      continue;
    }

    messaggi.push({
      token: push,
      titolo: testo.titolo,
      corpo: testo.corpo,
      dati: { volo: riga.volo_iata, data: riga.data_locale },
    });
    daChiudere.push({ id: riga.id, esito: "idoneo", avvisato: true });
  }

  /* La push prima, la scrittura dopo: se Expo non risponde, le righe
     restano aperte e domani si riprova. Mai il contrario. */
  const { accettati } = await mandaPush(messaggi);
  const partite = accettati > 0;

  for (const c of daChiudere) {
    if (c.avvisato && !partite) continue;
    const { error: e } = await sb
      .from("voli_seguiti")
      .update({
        esito_avvisato: c.esito,
        ...(c.avvisato ? { avvisato_il: new Date().toISOString() } : {}),
      })
      .eq("id", c.id);
    if (e) console.error(`[avvisa] riga ${c.id} non aggiornata:`, e.message);
  }

  return {
    ok: true as const,
    seguiti: seguiti.length,
    esaminati,
    avvisi: accettati,
    chiusi: daChiudere.filter((c) => !c.avvisato).length,
  };
}

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await giroAvvisa();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 503 });
}
