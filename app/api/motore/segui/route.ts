import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata } from "@/lib/motore/esegui";
import { SERVIZIO_ATTIVO } from "@/lib/supabase/servizio";
import {
  eventiRegistrati,
  praticheDaSeguire,
  registraEvento,
  transizionePratica,
  type PraticaConVolo,
} from "@/lib/pratiche/pratiche";
import { comeVa, promemoriaInvio, reclamoEnac, sollecitoPronto } from "@/lib/email/pratiche";
import { casa } from "@/lib/email/posta";

/**
 * Il cron dei follow-up (SPEC §6): una volta al giorno scorre le pratiche
 * aperte e manda l'email giusta per il punto in cui sono.
 *
 *   T+2  dal pagamento, se mai segnata come inviata → promemoria
 *   T+15 dall'invio → sollecito pronto (+ stato `sollecito`)
 *   T+30 dall'invio → escalation ENAC (+ stato `enac`)
 *   T+60 dall'invio → com'è andata + garanzia
 *
 * OGNI invio lascia un evento (`email_t2`, `email_t15`...): prima di
 * mandare si controlla che l'evento non esista già, così nessuna email
 * parte due volte. Se l'invio fallisce l'evento NON si scrive, e il giro
 * successivo riprova da solo.
 *
 * Al massimo UN'email per pratica per giro, la più avanzata dovuta: le
 * tappe precedenti non si recuperano (un sollecito del giorno 15 mandato
 * al giorno 40 è solo rumore).
 *
 * Budget 8 secondi come gli altri giri: le funzioni Netlify muoiono a 10.
 */
export const dynamic = "force-dynamic";

const GIORNO_MS = 86_400_000;

type Passo = "email_t2" | "email_t15" | "email_t30" | "email_t60";

const NOTE: Record<Passo, string> = {
  email_t2: "Promemoria d'invio (T+2) mandato.",
  email_t15: "Sollecito pronto (T+15) mandato.",
  email_t30: "Escalation ENAC (T+30) mandata.",
  email_t60: "Richiesta d'esito e promemoria garanzia (T+60) mandati.",
};

function giorniDa(iso: string | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? (Date.now() - t) / GIORNO_MS : 0;
}

/** Il passo dovuto adesso per questa pratica, o niente. */
function passoDovuto(pr: PraticaConVolo, fatti: Set<string>): Passo | null {
  const fatto = (t: Passo) => fatti.has(`${pr.id}:${t}`);

  // Mai inviata: esiste solo il promemoria del giorno 2.
  if (!pr.inviata_il) {
    if (
      (pr.stato === "pagata" || pr.stato === "pronta") &&
      giorniDa(pr.creata_il) >= 2 &&
      !fatto("email_t2")
    ) {
      return "email_t2";
    }
    return null;
  }

  // Inviata: si guarda dal traguardo più lontano. Se una tappa più avanti
  // è già stata mandata, quelle prima sono superate e non si mandano più.
  const g = giorniDa(pr.inviata_il);
  if (g >= 60) return fatto("email_t60") ? null : "email_t60";
  if (g >= 30) return fatto("email_t30") ? null : "email_t30";
  if (g >= 15) return fatto("email_t15") ? null : "email_t15";
  return null;
}

/** Manda l'email del passo. Vero solo se è partita davvero. */
async function mandaPasso(pr: PraticaConVolo, passo: Passo): Promise<boolean> {
  const link = `${casa()}/pratica/${pr.id}`;
  const volo = pr.voli?.volo_iata ?? "";
  const dataVolo = pr.voli?.data_locale ?? null;

  let esito: { ok: boolean };
  if (passo === "email_t2") {
    esito = await promemoriaInvio(pr.email, { importo: pr.importo_fascia, link });
  } else if (passo === "email_t15") {
    esito = await sollecitoPronto(pr.email, {
      volo,
      dataVolo,
      compagnia: pr.voli?.vettore_operativo ?? null,
      dataInvio: pr.inviata_il ?? pr.creata_il,
      importo: pr.importo_fascia,
      link,
    });
  } else if (passo === "email_t30") {
    esito = await reclamoEnac(pr.email, { volo, dataVolo, link });
  } else {
    esito = await comeVa(pr.email, { garanziaFinoAl: pr.garanzia_fino_al, link });
  }

  if (!esito.ok) return false;

  await registraEvento(pr.id, passo, NOTE[passo]);

  // Le tappe che spostano anche lo stato della macchina.
  if (passo === "email_t15" && pr.stato === "inviata") {
    await transizionePratica(pr.id, "sollecito", "Sollecito del giorno 15 in mano all'utente.");
  }
  if (passo === "email_t30" && (pr.stato === "inviata" || pr.stato === "sollecito")) {
    await transizionePratica(pr.id, "enac", "Escalation ENAC del giorno 30 in mano all'utente.");
  }
  return true;
}

async function giroSegui({ budgetMs = 8000 } = {}) {
  if (!SERVIZIO_ATTIVO) return { ok: false as const, motivo: "SUPABASE_SECRET_KEY assente." };

  const inizio = Date.now();
  const pratiche = await praticheDaSeguire();
  const fatti = await eventiRegistrati(pratiche.map((p) => p.id));

  const inviate: { pratica: string; passo: Passo }[] = [];
  let esaminate = 0;

  for (const pr of pratiche) {
    if (Date.now() - inizio > budgetMs) break;
    esaminate++;

    const passo = passoDovuto(pr, fatti);
    if (!passo) continue;

    try {
      if (await mandaPasso(pr, passo)) inviate.push({ pratica: pr.id, passo });
    } catch (e) {
      // Una pratica rotta non ferma le altre: log e avanti.
      console.error(`[segui] passo ${passo} fallito per ${pr.id}:`, e);
    }
  }

  return { ok: true as const, aperte: pratiche.length, esaminate, inviate };
}

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await giroSegui();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 503 });
}
