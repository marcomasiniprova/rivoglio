/**
 * IL TIN SUL TELEFONO (richiesta di Valerio, 11/08).
 *
 * Perché Telegram e non le notifiche del venditore: il venditore avvisa
 * solo dei pagamenti, e solo quando ci sarà. Qui si vuole sapere anche
 * quando qualcosa si rompe, e lo si vuole sapere SUBITO. Telegram è
 * gratis, arriva in un secondo, non serve un'app nostra e il canale
 * esiste già nel progetto.
 *
 * ⚠️ SUONA SOLO PER DUE COSE (scelta di Valerio): **i soldi** e **i
 * guasti**. Più il riepilogo della sera. Un TIN a ogni analisi sarebbe
 * bello il primo giorno e insopportabile il secondo: con la
 * distribuzione addosso il telefono diventerebbe inutilizzabile, e dopo
 * due ore si silenzia il canale, cioè si perdono anche gli avvisi che
 * contano.
 *
 * ⚠️ NON DEVE MAI ROMPERE NIENTE. Se Telegram non risponde, o le
 * variabili non ci sono, si scrive nei log e si va avanti: un pagamento
 * che fallisce perché non è riuscito a mandare una notifica sarebbe
 * assurdo.
 *
 * Serve su Netlify:
 *   TELEGRAM_BOT_TOKEN   il gettone del bot (te lo dà @BotFather)
 *   TELEGRAM_ADMIN_CHAT  il tuo identificativo di chat
 */

const API = "https://api.telegram.org";

export const TELEGRAM_ATTIVO = Boolean(
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT,
);

/**
 * Manda un messaggio. Torna true solo se è partito davvero, così chi
 * chiama può decidere se ripiegare sull'email.
 */
export async function tin(testo: string): Promise<boolean> {
  const gettone = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_ADMIN_CHAT;
  if (!gettone || !chat) return false;

  try {
    const r = await fetch(`${API}/bot${gettone}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: testo,
        parse_mode: "HTML",
        /* L'anteprima del link ruberebbe metà schermo su ogni avviso. */
        disable_web_page_preview: true,
      }),
      /* Le funzioni Netlify muoiono a 10 secondi: una notifica non può
         prendersi tutto quel tempo mentre un utente aspetta. */
      signal: AbortSignal.timeout(4_000),
    });
    if (!r.ok) {
      console.error("[telegram] rifiutato:", r.status, (await r.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[telegram] non spedito:", e);
    return false;
  }
}

/** Il TIN dei soldi: è l'unico che vale la pena sentire mentre si dorme. */
export async function tinIncasso(cosa: string, euro: number, dettaglio?: string): Promise<void> {
  await tin(
    `💚 <b>${euro.toFixed(2).replace(".", ",")}€</b> — ${cosa}` +
      (dettaglio ? `\n${dettaglio}` : ""),
  );
}

/**
 * Il TIN dei guasti. `chiave` serve a non ripetere lo stesso allarme
 * ogni trenta secondi: se il fornitore dati è giù, un messaggio basta.
 */
const ultimoAllarme = new Map<string, number>();
const SILENZIO_MS = 15 * 60 * 1000;

export async function tinGuasto(chiave: string, testo: string): Promise<void> {
  const adesso = Date.now();
  const prima = ultimoAllarme.get(chiave) ?? 0;
  if (adesso - prima < SILENZIO_MS) return;
  ultimoAllarme.set(chiave, adesso);
  await tin(`🔴 <b>Qualcosa non va</b>\n${testo}`);
}
