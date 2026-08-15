import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata } from "@/lib/motore/autorizza";
import { raccogliScioperi } from "@/lib/scioperi/raccolta";
import { spedisci } from "@/lib/email/posta";
import { mandaTelegram, TELEGRAM_ATTIVO } from "@/lib/telegram";

/**
 * L'AUTOPILOT DEGLI SCIOPERI: il giro che tiene viva la tabella, e con
 * lei le pagine /sciopero-aerei.
 *
 * Lo chiama la funzione programmata di Netlify una volta al giorno. Fa
 * tutto `lib/scioperi/raccolta.ts`; qui c'è solo la porta, il freno e
 * l'allarme.
 *
 * L'ALLARME È LA PARTE CHE CONTA. Valerio ha chiesto di non doversene
 * più occupare, e una cosa di cui non ti occupi più deve gridare quando
 * si rompe: se nessuna fonte si apre o il modello non risponde, parte
 * un'email (e un messaggio Telegram, se c'è il canale). Un aggiornamento
 * automatico che smette di funzionare in silenzio è peggio di uno
 * manuale, perché nessuno se ne accorge per mesi.
 *
 * Si può lanciare anche a mano dal browser, con il segreto in fondo
 * all'indirizzo: serve a vedere coi propri occhi che funziona.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DESTINATARIO = process.env.ALERT_EMAIL ?? "team@rivolio.it";

async function avvisa(oggetto: string, righe: string[]) {
  const testo = righe.join("\n");
  const html = `<p>${righe.map((r) => r.replace(/</g, "&lt;")).join("<br>")}</p>`;

  await spedisci({ a: DESTINATARIO, oggetto, html, testo });

  const chat = process.env.TELEGRAM_ADMIN_CHAT;
  if (TELEGRAM_ATTIVO && chat) {
    await mandaTelegram(chat, `<b>${oggetto}</b>\n${testo.replace(/</g, "&lt;")}`);
  }
}

async function giro() {
  const esito = await raccogliScioperi();

  /* Cosa è un guasto e cosa no. Zero scioperi trovati NON è un guasto:
     nei periodi di franchigia non se ne proclamano. Il guasto è non
     essere riusciti a leggere niente. */
  const rotto = !esito.ok;

  if (rotto) {
    await avvisa("Rivolio: l'aggiornamento degli scioperi non ha funzionato", [
      "Il giro automatico non è riuscito ad aggiornare la lista degli scioperi.",
      "",
      `Fonti aperte: ${esito.fontiLette} su 3`,
      `Righe proposte: ${esito.proposte}`,
      `Righe valide: ${esito.valide}`,
      "",
      "Problemi:",
      ...esito.problemi.map((p) => `- ${p}`),
      "",
      "Finché non riparte, le pagine /sciopero-aerei restano ferme all'ultimo",
      "aggiornamento riuscito. Nessun dato è stato cancellato.",
    ]);
  } else if (esito.inserite > 0) {
    await avvisa(`Rivolio: ${esito.inserite} scioperi nuovi in calendario`, [
      `Il giro automatico ha aggiunto ${esito.inserite} agitazioni nuove.`,
      "Le pagine si sono già aggiornate da sole: rivolio.it/sciopero-aerei",
      "",
      `Fonti aperte: ${esito.fontiLette} su 3 · righe valide: ${esito.valide}`,
    ]);
  }

  console.log(`[scioperi] ${JSON.stringify(esito)}`);
  return esito;
}

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await giro();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 500 });
}

/**
 * La versione da browser, per guardarla funzionare la prima volta:
 * /api/motore/scioperi?segreto=... Senza il segreto giusto è un 401,
 * e in produzione senza MOTORE_SEGRETO impostato non si apre mai.
 */
export async function GET(req: NextRequest) {
  const segreto = process.env.MOTORE_SEGRETO;
  const dato = req.nextUrl.searchParams.get("segreto");
  const puo = segreto ? dato === segreto : process.env.NODE_ENV !== "production";
  if (!puo) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }
  const esito = await giro();
  return NextResponse.json(esito, { status: esito.ok ? 200 : 500 });
}
