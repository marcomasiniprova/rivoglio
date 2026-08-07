import { SERVIZIO_ATTIVO, supabaseServizio } from "../supabase/servizio";
import { raccoglitoreExa } from "../offerte/raccoglitori/exa";
import { abbina, ilMigliore, type Ricerca } from "../offerte/motore";
import type { Offerta } from "../offerte/tipi";
import { inviaAlert } from "../alert/invia";
import { DESTINAZIONI } from "../destinazioni";
import { PARTENZE } from "../costruttore";
import type { Tipo } from "../destinazioni";

/**
 * Il motore, in due tempi.
 *
 * 1. `raccogliLotto`  — legge il web e riempie la tabella `offerte` (stato demo)
 * 2. `abbinaEInvia`   — confronta offerte ATTIVE e ricerche, manda le destinazioni
 *
 * Sono funzioni normali, non rotte: le usano sia le rotte /api/motore/* (per
 * il cron) sia i bottoni del pannello admin. Un pezzo solo, due maniglie.
 *
 * Ogni funzione ha un BUDGET DI TEMPO e si ferma da sola prima del limite:
 * le funzioni Netlify muoiono a 10 secondi, e un lotto interrotto a metà è
 * peggio di un lotto piccolo finito. Il cursore in `motore_stato` fa
 * ripartire il giro successivo da dove questo si è fermato.
 */

/** Media nazionale self service, osservatorio MIMIT 06/08/2026.
 *  DA LEGGERE DALL'OSSERVATORIO quando lo colleghiamo: qui è ferma. */
const BENZINA = 1.994;

/** Quante mete si scandagliano per giro. Tre stanno negli 8 secondi. */
const LOTTO = 3;

export async function raccogliLotto({ budgetMs = 8000 } = {}) {
  const chiave = process.env.EXA_API_KEY ?? "";
  if (!chiave) return { ok: false as const, motivo: "EXA_API_KEY assente." };
  if (!SERVIZIO_ATTIVO) return { ok: false as const, motivo: "SUPABASE_SECRET_KEY assente." };

  const db = supabaseServizio();
  const inizio = Date.now();
  const scaduto = () => Date.now() - inizio > budgetMs;

  // da dove riparte il giro
  const { data: st } = await db.from("motore_stato").select("indice").eq("id", 1).maybeSingle();
  const indice = st?.indice ?? 0;
  const comuni = Array.from(
    { length: LOTTO },
    (_, i) => DESTINAZIONI[(indice + i) % DESTINAZIONI.length].nome,
  );

  const offerte = await raccoglitoreExa(chiave).raccogli({ comuni, scaduto });

  let salvate = 0;
  let strutture = 0;
  for (const o of offerte) {
    /* L'anagrafe si costruisce da sola: ogni struttura trovata viene
       registrata per dominio. È il giacimento che nessun concorrente ha. */
    try {
      const dominio = new URL(o.link).origin;
      const { error } = await db
        .from("strutture")
        .upsert(
          {
            sito: dominio,
            nome: o.struttura,
            comune: o.comune,
            lat: o.lat,
            lng: o.lng,
            tipo: o.tipo,
            ultima_vista: new Date().toISOString(),
          },
          { onConflict: "sito" },
        );
      if (!error) strutture++;
    } catch {
      /* un link malformato non ferma il lotto */
    }

    // stato SEMPRE demo: la verifica è un passaggio umano, nel pannello
    const { error } = await db.from("offerte").upsert(
      {
        struttura: o.struttura,
        comune: o.comune,
        lat: o.lat,
        lng: o.lng,
        check_in: o.checkIn,
        check_out: o.checkOut,
        prezzo_alloggio: o.prezzoAlloggio,
        link: o.link,
        tipo: o.tipo,
        fonte: o.fonte,
        stato: "demo",
      },
      { onConflict: "link", ignoreDuplicates: true },
    );
    if (!error) salvate++;
  }

  await db.from("motore_stato").upsert({
    id: 1,
    indice: (indice + LOTTO) % DESTINAZIONI.length,
    aggiornato_il: new Date().toISOString(),
  });

  return { ok: true as const, comuni, trovate: offerte.length, salvate, strutture };
}

type RigaEsito = {
  utente: string;
  destinazione: string;
  totale: number;
  esito: Awaited<ReturnType<typeof inviaAlert>>;
};

export async function abbinaEInvia({ budgetMs = 8000 } = {}) {
  if (!SERVIZIO_ATTIVO) return { ok: false as const, motivo: "SUPABASE_SECRET_KEY assente." };

  const db = supabaseServizio();
  const inizio = Date.now();

  const [of, ric, prof, inv] = await Promise.all([
    db.from("offerte").select("id, struttura, comune, lat, lng, check_in, check_out, prezzo_alloggio, link, tipo, fonte, stato"),
    db.from("ricerche").select("id, utente_id, budget_max_persona, ore_viaggio_max, notti_min, notti_max, persone, tipi").eq("attiva", true),
    db.from("profili").select("id, email, comune, lat, lng, crediti, chat_telegram, tetto_settimanale"),
    db.from("invii").select("utente_id, offerta_id, inviato_il"),
  ]);

  const tutte = of.data ?? [];
  const linkDi = new Map(tutte.map((o) => [o.id as string, o.link as string]));
  const attive: (Offerta & { id: string })[] = tutte
    .filter((o) => o.stato === "attiva")
    .map((o) => ({
      id: o.id as string,
      struttura: o.struttura,
      comune: o.comune,
      lat: o.lat,
      lng: o.lng,
      checkIn: o.check_in,
      checkOut: o.check_out,
      prezzoAlloggio: Number(o.prezzo_alloggio),
      link: o.link,
      tipo: o.tipo as Tipo,
      fonte: o.fonte,
      stato: "attiva",
    }));

  const profili = new Map((prof.data ?? []).map((p) => [p.id as string, p]));

  // cosa ha già ricevuto ciascuno, e quanto ha ricevuto negli ultimi 7 giorni
  const setteGiorniFa = Date.now() - 7 * 86_400_000;
  const perUtente = new Map<string, { links: Set<string>; recenti: number }>();
  for (const i of inv.data ?? []) {
    const voce = perUtente.get(i.utente_id) ?? { links: new Set<string>(), recenti: 0 };
    const link = linkDi.get(i.offerta_id);
    if (link) voce.links.add(link);
    if (Date.parse(i.inviato_il) > setteGiorniFa) voce.recenti++;
    perUtente.set(i.utente_id, voce);
  }

  const esiti: RigaEsito[] = [];

  for (const r of ric.data ?? []) {
    if (Date.now() - inizio > budgetMs) break;

    const p = profili.get(r.utente_id);
    if (!p?.comune || !p.email) continue; // senza partenza non si calcola niente
    if ((p.crediti ?? 0) <= 0) continue;

    const mio = perUtente.get(r.utente_id) ?? { links: new Set<string>(), recenti: 0 };
    // il tetto settimanale è una promessa fatta sulla landing: si rispetta
    if (mio.recenti >= (p.tetto_settimanale ?? 3)) continue;

    const base = PARTENZE.find((x) => x.nome === p.comune);
    const lat = p.lat ?? base?.lat;
    const lng = p.lng ?? base?.lng;
    if (!lat || !lng) continue;

    const ricerca: Ricerca = {
      id: r.id,
      utenteId: r.utente_id,
      partenza: { nome: p.comune, lat, lng },
      budgetPersona: Number(r.budget_max_persona),
      nottiMin: r.notti_min,
      nottiMax: r.notti_max,
      oreMax: Number(r.ore_viaggio_max),
      persone: r.persone,
      tipi: (r.tipi ?? []) as Tipo[],
    };

    const migliore = ilMigliore(
      abbina({ ricerca, offerte: attive, prezzoBenzina: BENZINA, giaInviate: mio.links }),
    );
    if (!migliore) continue;

    const esito = await inviaAlert(
      migliore,
      { utenteId: r.utente_id, email: p.email, chatTelegram: p.chat_telegram },
      ricerca.budgetPersona,
    );

    esiti.push({
      utente: p.email,
      destinazione: migliore.offerta.comune,
      totale: Math.round(migliore.totalePersona),
      esito,
    });

    if (esito.ok) {
      mio.links.add(migliore.offerta.link);
      mio.recenti++;
      perUtente.set(r.utente_id, mio);
    }
  }

  return {
    ok: true as const,
    ricercheAttive: (ric.data ?? []).length,
    offerteAttive: attive.length,
    esiti,
  };
}

/**
 * Chi può chiamare le rotte del motore.
 * In produzione serve il segreto nell'intestazione `x-motore-segreto`
 * (variabile MOTORE_SEGRETO su Netlify). In sviluppo, senza segreto
 * impostato, si passa: serve a provare in locale.
 */
export function chiamataAutorizzata(req: { headers: { get(n: string): string | null } }) {
  const segreto = process.env.MOTORE_SEGRETO;
  if (!segreto) return process.env.NODE_ENV !== "production";
  return req.headers.get("x-motore-segreto") === segreto;
}
