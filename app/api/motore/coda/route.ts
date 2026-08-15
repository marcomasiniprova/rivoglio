import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata } from "@/lib/motore/esegui";
import { SERVIZIO_ATTIVO, supabaseServizio } from "@/lib/supabase/servizio";
import { colonnaMancante } from "@/lib/supabase/colonne";
import { verificaVolo } from "@/lib/voli/verifica";
import { verdettoIdoneo } from "@/lib/email/verdetto";
import { POSTA_ATTIVA } from "@/lib/email/posta";
import { formattaMinuti } from "@/lib/regole/eu261";
import { aeroporto } from "@/lib/voli/distanza";
import { inItaliano } from "@/lib/voli/aeroporti";
import { voloDimostrativo } from "@/lib/voli/fornitori/demo";

/**
 * LA CODA DEGLI INCERTI (Valerio, 15/08).
 *
 * Il verdetto incerto di un volo fresco già promette all'utente "se ci
 * lasci l'email ti avvisiamo noi": l'indirizzo si aggancia alla riga di
 * `verifiche`, ma finora NESSUNO lo ricontrollava. Era una promessa vuota.
 *
 * Qui il cron la mantiene: ogni incerto con email, non ancora chiuso, si
 * ricontrolla. Se nel frattempo il dato è arrivato ed è IDONEO, si avvisa
 * l'utente (email col link al suo risultato) e la riga si aggiorna a
 * idoneo, così la sua pagina mostra il verdetto giusto e può aprire la
 * pratica. Se è diventato NON idoneo, o resta incerto oltre 7 giorni, la
 * riga si chiude in silenzio: sull'incerto non si scrive per dire "non lo
 * so", che è un'email che nessuno vuole.
 *
 * ⚠️ SOLO BUONE NOTIZIE VIA EMAIL, come il resto del prodotto: si avvisa
 * quando c'è qualcosa da fare (idoneo), non per dare un dispiacere.
 *
 * ⚠️ Fail-open e budget 8s come gli altri giri: un guasto non ferma niente,
 * e se le colonne della coda non ci sono ancora (migrazione non applicata)
 * si esce senza rumore invece di rompersi.
 */
export const dynamic = "force-dynamic";

const GIORNO_MS = 86_400_000;
/** Oltre questi giorni un incerto non diventa più certo: si chiude. */
const GIORNI_CODA = 7;

type RigaCoda = {
  id: string;
  volo_iata: string;
  data_locale: string;
  email: string | null;
  creata_il: string;
};

/** "Bergamo → Lanzarote" dal volo appena ricontrollato, in italiano. */
function trattaDa(voloId: string | null, sb: ReturnType<typeof supabaseServizio>) {
  return async (): Promise<string | null> => {
    if (!voloId) return null;
    const { data } = await sb
      .from("voli")
      .select("partenza_iata, arrivo_iata")
      .eq("id", voloId)
      .maybeSingle();
    const da = aeroporto((data as { partenza_iata?: string | null } | null)?.partenza_iata);
    const a = aeroporto((data as { arrivo_iata?: string | null } | null)?.arrivo_iata);
    if (!da || !a) return null;
    return `${inItaliano(da.citta) ?? da.citta} → ${inItaliano(a.citta) ?? a.citta}`;
  };
}

async function giroCoda({ budgetMs = 8000 } = {}) {
  if (!SERVIZIO_ATTIVO) return { ok: false as const, motivo: "SUPABASE_SECRET_KEY assente." };

  const sb = supabaseServizio();
  const inizio = Date.now();

  // Gli incerti con email, ancora aperti, dai più vecchi (aspettano da più).
  let righe: RigaCoda[] = [];
  try {
    const { data, error } = await sb
      .from("verifiche")
      .select("id, volo_iata, data_locale, email, creata_il")
      .eq("esito", "incerto")
      .not("email", "is", null)
      .is("coda_avvisata_il", null)
      .is("coda_chiusa_il", null)
      .gte("creata_il", new Date(Date.now() - GIORNI_CODA * GIORNO_MS).toISOString())
      .order("creata_il", { ascending: true })
      .limit(80);
    if (error) {
      // Colonne della coda non ancora create: si esce, non è un guasto.
      if (colonnaMancante(error.message)) {
        return { ok: true as const, aperti: 0, avvisati: 0, chiusi: 0, nota: "coda non migrata" };
      }
      throw new Error(error.message);
    }
    righe = (data as RigaCoda[] | null) ?? [];
  } catch (e) {
    console.error("[coda] lettura fallita:", e);
    return { ok: false as const, motivo: String(e) };
  }

  let avvisati = 0;
  let chiusi = 0;

  for (const r of righe) {
    if (Date.now() - inizio > budgetMs) break;
    if (!r.email) continue;

    try {
      const esito = await verificaVolo(r.volo_iata, r.data_locale);

      // Ancora niente dato / errore: si lascia in coda, salvo scadenza.
      if (!esito.ok || esito.verdetto.esito === "incerto") {
        const vecchio = Date.parse(r.creata_il) < Date.now() - GIORNI_CODA * GIORNO_MS;
        if (vecchio) {
          await sb.from("verifiche").update({ coda_chiusa_il: nowIso() }).eq("id", r.id);
          chiusi++;
        }
        continue;
      }

      const v = esito.verdetto;
      if (v.esito === "idoneo") {
        /* La riga dell'utente diventa idonea: la sua pagina /verifica/<id>
           mostra il verdetto giusto e può aprire la pratica. L'email resta
           dov'era. */
        await sb
          .from("verifiche")
          .update({
            esito: "idoneo",
            importo: v.importo,
            ritardo_minuti: v.ritardoMinuti,
            motivo: v.motivo,
            coda_avvisata_il: nowIso(),
          })
          .eq("id", r.id);

        if (POSTA_ATTIVA) {
          const tratta = await trattaDa(esito.verificaId, sb)().catch(() => null);
          const ml = await verdettoIdoneo(r.email, {
            idVerifica: r.id,
            volo: r.volo_iata,
            tratta,
            importo: v.importo,
            ritardo: v.ritardoMinuti ? formattaMinuti(v.ritardoMinuti) : null,
            demo: voloDimostrativo(r.volo_iata),
          });
          if (!ml.ok) console.error(`[coda] email idoneo non partita per ${r.id}: ${ml.motivo}`);
        }
        avvisati++;
      } else {
        // Diventato NON idoneo: si chiude in silenzio (niente email di "no").
        await sb.from("verifiche").update({ coda_chiusa_il: nowIso() }).eq("id", r.id);
        chiusi++;
      }
    } catch (e) {
      console.error(`[coda] riga ${r.id} saltata:`, e);
    }
  }

  return { ok: true as const, aperti: righe.length, avvisati, chiusi };
}

/** Adesso in ISO. Isolata così una prova non deve toccare Date globale. */
function nowIso(): string {
  return new Date().toISOString();
}

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await giroCoda();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 503 });
}
