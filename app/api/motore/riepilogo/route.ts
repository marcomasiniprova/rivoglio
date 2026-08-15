import { NextResponse, type NextRequest } from "next/server";
import { chiamataAutorizzata } from "@/lib/motore/autorizza";
import { leggiCruscotto } from "@/lib/eventi/lettura";
import { TELEGRAM_ATTIVO, tin } from "@/lib/eventi/telegram";

/**
 * IL RIEPILOGO DELLA SERA (scelta di Valerio, 11/08: «sia soldi e guasti
 * che riepilogo sera»).
 *
 * A cosa serve, visto che c'è già il cruscotto: il cruscotto bisogna
 * ricordarsi di aprirlo. Questo arriva da solo, una volta al giorno, e
 * risponde alle tre domande che si fanno la sera: quanto è entrato,
 * quante persone sono passate, dove si sono fermate.
 *
 * ⚠️ UNO SOLO AL GIORNO, e di sera. Un riepilogo ogni ora diventa rumore
 * e si silenzia il canale; e se si silenzia il canale si perdono anche i
 * TIN dei soldi, che sono l'unica cosa che deve svegliare.
 *
 * Si può lanciare a mano per vedere com'è fatto: basta chiamarla con
 * l'intestazione del segreto, come le altre rotte del motore.
 */
export const dynamic = "force-dynamic";

const euro = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;

/**
 * Il conteggio di un fatto, dentro una giornata GIÀ LETTA.
 *
 * ⚠️ QUI ZERO È ZERO, e non è un dettaglio. `leggiCruscotto` torna una
 * mappa parziale: se oggi nessuno ha lanciato un'analisi, la chiave
 * "check" semplicemente non c'è. Prima si scriveva "?", che nel resto
 * del progetto vuol dire "non l'ho potuto leggere": il primo riepilogo
 * vero diceva «Analisi lanciate: ?» mentre il dato era letto e valeva
 * zero (visto l'11/08 provando la catena sul sito online).
 * Confondere "nessuno l'ha fatto" con "non lo so" porta a rincorrere un
 * guasto che non esiste, o a non accorgersi di quello vero.
 * Il "non letto" resta, ma solo dove la lettura può davvero mancare:
 * l'incasso, e l'intera giornata quando il registro non si apre.
 */
const conta = (n: number | undefined) => n ?? 0;

export async function scriviRiepilogo(): Promise<string> {
  const c = await leggiCruscotto(0);
  if (c.oggi === null) {
    return "🌙 <b>Riepilogo</b>\nIl registro non si è aperto: stasera non ho numeri da darti. Il sito funziona lo stesso.";
  }

  const o = c.oggi;
  const righe = [
    `🌙 <b>Riepilogo di oggi</b>`,
    ``,
    `💚 Incassato: <b>${c.incassoOggi === null ? "?" : euro(c.incassoOggi)}</b>`,
    ``,
    `Sono arrivate <b>${conta(o.visita)}</b> persone`,
    `Analisi lanciate: <b>${conta(o.check)}</b>`,
  ];

  if (o.muro) {
    righe.push(
      `Hanno visto il muro: <b>${o.muro}</b>`,
      `Hanno pagato l'analisi: <b>${conta(o.sbloccato)}</b>${
        c.conversioneMuro !== null ? ` (${c.conversioneMuro}%)` : ""
      }`,
    );
  }
  if (o.pratica || o.pagato) {
    righe.push(`Pratiche aperte: <b>${conta(o.pratica)}</b> · pagate: <b>${conta(o.pagato)}</b>`);
  }
  if (o.iscritto) righe.push(`Iscritti all'Osservatorio: <b>${o.iscritto}</b>`);

  /* I guasti si dicono sempre, anche zero: sapere che oggi non si è
     rotto niente è un'informazione, non un vuoto. */
  righe.push(``, o.guasto ? `🔴 Guasti registrati: <b>${o.guasto}</b>` : `Nessun guasto.`);

  const da = (c.provenienze ?? []).slice(0, 3);
  if (da.length > 0) {
    righe.push(``, `Da dove arrivano: ${da.map((r) => `${r.nome} (${r.quanti})`).join(" · ")}`);
  }

  return righe.join("\n");
}

export async function POST(req: NextRequest) {
  if (!chiamataAutorizzata(req)) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }

  const testo = await scriviRiepilogo();
  if (!TELEGRAM_ATTIVO) {
    /* Non è un errore: le due variabili di Telegram possono non esserci
       ancora. Si risponde col testo, così lanciandola a mano si vede
       comunque cosa avrebbe scritto. */
    return NextResponse.json({ ok: true, spedito: false, motivo: "Telegram spento", testo });
  }
  const spedito = await tin(testo);
  return NextResponse.json({ ok: true, spedito, testo });
}
